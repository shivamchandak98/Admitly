from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Header, UploadFile, File, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import requests as http_requests
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from schools_data import MUMBAI_SCHOOLS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# ---------- Object Storage ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "admitly"
_storage_key: Optional[str] = None


def init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    resp = http_requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def storage_put(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = http_requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def storage_get(path: str):
    key = init_storage()
    resp = http_requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Models ----------
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None


class School(BaseModel):
    school_id: str
    name: str
    city: str
    area: str
    board: str
    fees_min: int
    fees_max: int
    rating: float
    google_reviews_count: int = 0
    pass_percentage_10th: Optional[float] = None
    established: int
    facilities: List[str]
    image: str
    description: str
    admission_open: bool
    admission_deadline: str
    application_url: str
    phone: str


class ApplicationDocument(BaseModel):
    doc_id: str = Field(default_factory=lambda: uuid.uuid4().hex[:10])
    name: str
    status: str = "pending"  # pending | ready | submitted
    note: Optional[str] = ""
    file_id: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    storage_path: Optional[str] = None
    content_type: Optional[str] = None


class Application(BaseModel):
    application_id: str
    user_id: str
    school_id: str
    school_name: str
    child_name: str
    child_dob: Optional[str] = None
    grade_applying: str
    status: str  # not_started | documents_ready | form_submitted | interview_scheduled | interview_done | result_awaited | accepted | rejected
    interview_date: Optional[str] = None
    notes: Optional[str] = ""
    documents: List[ApplicationDocument] = []
    reminder_date: Optional[str] = None
    created_at: str
    updated_at: str


class ApplicationCreate(BaseModel):
    school_id: str
    child_name: str
    child_dob: Optional[str] = None
    grade_applying: str
    status: str = "not_started"
    interview_date: Optional[str] = None
    notes: Optional[str] = ""
    documents: Optional[List[ApplicationDocument]] = None
    reminder_date: Optional[str] = None


class ApplicationUpdate(BaseModel):
    child_name: Optional[str] = None
    child_dob: Optional[str] = None
    grade_applying: Optional[str] = None
    status: Optional[str] = None
    interview_date: Optional[str] = None
    notes: Optional[str] = None
    documents: Optional[List[ApplicationDocument]] = None
    reminder_date: Optional[str] = None


class SessionRequest(BaseModel):
    session_id: str


# ---------- Auth helper ----------
async def get_current_user(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
) -> User:
    token = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_doc)


# ---------- Startup: seed schools ----------
@app.on_event("startup")
async def seed_schools():
    count = await db.schools.count_documents({})
    if count == 0:
        docs = []
        for s in MUMBAI_SCHOOLS:
            docs.append({
                "school_id": f"sch_{uuid.uuid4().hex[:10]}",
                **s,
            })
        if docs:
            await db.schools.insert_many(docs)
            logger.info(f"Seeded {len(docs)} schools")
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.warning(f"Storage init deferred: {e}")


# ---------- Auth Endpoints ----------
@api_router.post("/auth/session")
async def create_session(payload: SessionRequest, response: Response):
    """Exchange session_id (from URL fragment) for our app session_token."""
    try:
        r = http_requests.get(
            EMERGENT_AUTH_URL,
            headers={"X-Session-ID": payload.session_id},
            timeout=10,
        )
    except Exception as e:
        logger.error(f"Auth service error: {e}")
        raise HTTPException(status_code=502, detail="Auth service unreachable")

    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")

    data = r.json()
    email = data["email"]
    name = data["name"]
    picture = data.get("picture")
    session_token = data["session_token"]

    # Upsert user
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60,
    )

    return {
        "user": {"user_id": user_id, "email": email, "name": name, "picture": picture},
        "session_token": session_token,
    }


@api_router.get("/auth/me", response_model=User)
async def auth_me(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    return await get_current_user(session_token, authorization)


@api_router.post("/auth/logout")
async def logout(
    response: Response,
    session_token: Optional[str] = Cookie(default=None),
):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}


# ---------- Schools Endpoints ----------
@api_router.get("/schools", response_model=List[School])
async def list_schools(
    city: Optional[str] = None,
    area: Optional[str] = None,
    board: Optional[str] = None,
    facility: Optional[str] = None,
    fees_max: Optional[int] = None,
    search: Optional[str] = None,
    admission_open: Optional[bool] = None,
    sort: Optional[str] = None,
    limit: Optional[int] = None,
):
    q = {}
    if city:
        q["city"] = city
    if area:
        q["area"] = area
    if board:
        q["board"] = {"$regex": board, "$options": "i"}
    if facility:
        q["facilities"] = facility
    if fees_max is not None:
        q["fees_min"] = {"$lte": fees_max}
    if admission_open is not None:
        q["admission_open"] = admission_open
    if search:
        q["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"area": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}},
        ]
    cursor = db.schools.find(q, {"_id": 0})
    if sort == "rating":
        cursor = cursor.sort("rating", -1)
    elif sort == "fees_asc":
        cursor = cursor.sort("fees_min", 1)
    elif sort == "fees_desc":
        cursor = cursor.sort("fees_min", -1)
    schools = await cursor.to_list(limit or 500)
    return schools


@api_router.get("/schools/cities")
async def list_cities():
    pipeline = [{"$group": {"_id": "$city", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    rows = await db.schools.aggregate(pipeline).to_list(50)
    return [{"city": r["_id"], "count": r["count"]} for r in rows]


@api_router.get("/schools/meta")
async def schools_meta(city: Optional[str] = None):
    q = {"city": city} if city else {}
    areas = await db.schools.distinct("area", q)
    boards = await db.schools.distinct("board", q)
    return {"areas": sorted(areas), "boards": sorted(boards), "facilities": ["sports", "music", "digital", "drama", "swimming", "library", "art"]}


@api_router.get("/schools/{school_id}", response_model=School)
async def get_school(school_id: str):
    doc = await db.schools.find_one({"school_id": school_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="School not found")
    return doc


# ---------- Applications ----------
DEFAULT_DOCS = [
    {"doc_id": uuid.uuid4().hex[:10], "name": "Birth Certificate", "status": "pending", "note": ""},
    {"doc_id": uuid.uuid4().hex[:10], "name": "Aadhaar Card (Child)", "status": "pending", "note": ""},
    {"doc_id": uuid.uuid4().hex[:10], "name": "Address Proof", "status": "pending", "note": ""},
    {"doc_id": uuid.uuid4().hex[:10], "name": "Passport Size Photos", "status": "pending", "note": ""},
    {"doc_id": uuid.uuid4().hex[:10], "name": "Parent ID Proof", "status": "pending", "note": ""},
]


@api_router.get("/applications", response_model=List[Application])
async def my_applications(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    apps = await db.applications.find({"user_id": user.user_id}, {"_id": 0}).to_list(500)
    apps.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return apps


@api_router.post("/applications", response_model=Application)
async def create_application(
    payload: ApplicationCreate,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    school = await db.schools.find_one({"school_id": payload.school_id}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    now = datetime.now(timezone.utc).isoformat()
    docs = payload.documents
    if not docs:
        docs = [ApplicationDocument(**d) for d in DEFAULT_DOCS]
    docs_dict = [d.model_dump() if hasattr(d, "model_dump") else d for d in docs]
    app_doc = {
        "application_id": f"app_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "school_id": payload.school_id,
        "school_name": school["name"],
        "child_name": payload.child_name,
        "child_dob": payload.child_dob,
        "grade_applying": payload.grade_applying,
        "status": payload.status or "not_started",
        "interview_date": payload.interview_date,
        "notes": payload.notes or "",
        "documents": docs_dict,
        "reminder_date": payload.reminder_date,
        "created_at": now,
        "updated_at": now,
    }
    await db.applications.insert_one(app_doc)
    app_doc.pop("_id", None)
    return app_doc


@api_router.patch("/applications/{application_id}", response_model=Application)
async def update_application(
    application_id: str,
    payload: ApplicationUpdate,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    app_doc = await db.applications.find_one({"application_id": application_id, "user_id": user.user_id}, {"_id": 0})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "documents" in update:
        update["documents"] = [d if isinstance(d, dict) else d.model_dump() for d in update["documents"]]
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.applications.update_one({"application_id": application_id}, {"$set": update})
    refreshed = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    return refreshed


@api_router.delete("/applications/{application_id}")
async def delete_application(
    application_id: str,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    res = await db.applications.delete_one({"application_id": application_id, "user_id": user.user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


# ---------- Document Uploads (Object Storage) ----------
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 MB


@api_router.post("/applications/{application_id}/documents/{doc_id}/upload")
async def upload_document_file(
    application_id: str,
    doc_id: str,
    file: UploadFile = File(...),
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    app_doc = await db.applications.find_one({"application_id": application_id, "user_id": user.user_id}, {"_id": 0})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")
    docs = app_doc.get("documents") or []
    idx = next((i for i, d in enumerate(docs) if d.get("doc_id") == doc_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Document slot not found")

    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 8MB)")
    ext = (file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "bin").lower()
    file_id = uuid.uuid4().hex
    path = f"{APP_NAME}/uploads/{user.user_id}/{file_id}.{ext}"
    try:
        result = storage_put(path, data, file.content_type or "application/octet-stream")
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=502, detail="Upload failed")

    docs[idx] = {
        **docs[idx],
        "status": "ready",
        "file_id": file_id,
        "file_name": file.filename,
        "file_size": len(data),
        "storage_path": result["path"],
        "content_type": file.content_type,
    }
    await db.applications.update_one(
        {"application_id": application_id},
        {"$set": {"documents": docs, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    refreshed = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    return refreshed


@api_router.delete("/applications/{application_id}/documents/{doc_id}/file")
async def delete_document_file(
    application_id: str,
    doc_id: str,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    app_doc = await db.applications.find_one({"application_id": application_id, "user_id": user.user_id}, {"_id": 0})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")
    docs = app_doc.get("documents") or []
    idx = next((i for i, d in enumerate(docs) if d.get("doc_id") == doc_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="Document slot not found")
    docs[idx] = {
        **docs[idx],
        "status": "pending",
        "file_id": None,
        "file_name": None,
        "file_size": None,
        "storage_path": None,
        "content_type": None,
    }
    await db.applications.update_one(
        {"application_id": application_id},
        {"$set": {"documents": docs, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"ok": True}


@api_router.get("/applications/{application_id}/documents/{doc_id}/file")
async def download_document_file(
    application_id: str,
    doc_id: str,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
    auth: Optional[str] = Query(default=None),
):
    if not authorization and auth:
        authorization = f"Bearer {auth}"
    user = await get_current_user(session_token, authorization)
    app_doc = await db.applications.find_one({"application_id": application_id, "user_id": user.user_id}, {"_id": 0})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Application not found")
    doc = next((d for d in (app_doc.get("documents") or []) if d.get("doc_id") == doc_id), None)
    if not doc or not doc.get("storage_path"):
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, ct = storage_get(doc["storage_path"])
    except Exception as e:
        logger.error(f"Download failed: {e}")
        raise HTTPException(status_code=502, detail="Download failed")
    return Response(content=data, media_type=doc.get("content_type") or ct)


# ---------- Favourites ----------
@api_router.get("/favourites", response_model=List[School])
async def my_favourites(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    favs = await db.favourites.find({"user_id": user.user_id}, {"_id": 0}).to_list(500)
    school_ids = [f["school_id"] for f in favs]
    if not school_ids:
        return []
    schools = await db.schools.find({"school_id": {"$in": school_ids}}, {"_id": 0}).to_list(500)
    return schools


@api_router.post("/favourites/{school_id}")
async def add_favourite(
    school_id: str,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    school = await db.schools.find_one({"school_id": school_id}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    existing = await db.favourites.find_one({"user_id": user.user_id, "school_id": school_id})
    if not existing:
        await db.favourites.insert_one({
            "user_id": user.user_id,
            "school_id": school_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    return {"ok": True}


@api_router.delete("/favourites/{school_id}")
async def remove_favourite(
    school_id: str,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    await db.favourites.delete_one({"user_id": user.user_id, "school_id": school_id})
    return {"ok": True}


@api_router.get("/favourites/ids")
async def my_favourite_ids(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
):
    user = await get_current_user(session_token, authorization)
    favs = await db.favourites.find({"user_id": user.user_id}, {"_id": 0, "school_id": 1}).to_list(500)
    return {"ids": [f["school_id"] for f in favs]}


@api_router.get("/")
async def root():
    return {"message": "Mumbai School Admissions API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
