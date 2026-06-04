"""Backend tests for Mumbai School Admissions platform."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://admission-dash.preview.emergentagent.com").rstrip("/")

# Session token created by test setup (see test_credentials.md)
TOKEN = os.environ.get("TEST_TOKEN")


@pytest.fixture(scope="session")
def token():
    """Create a fresh test session in MongoDB and return token."""
    import subprocess
    ts = int(time.time() * 1000)
    user_id = f"user_test_{ts}"
    tok = f"test_session_{ts}"
    script = f"""use('test_database');
db.users.insertOne({{user_id:'{user_id}',email:'parent.test.{ts}@example.com',name:'Test Parent',picture:'https://via.placeholder.com/150',created_at:new Date().toISOString()}});
db.user_sessions.insertOne({{user_id:'{user_id}',session_token:'{tok}',expires_at:new Date(Date.now()+7*24*60*60*1000).toISOString(),created_at:new Date().toISOString()}});
print('OK');"""
    subprocess.run(["mongosh", "--quiet", "--eval", script], capture_output=True, check=False)
    return tok


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Public Schools ----------
class TestSchools:
    def test_list_schools_returns_80(self):
        r = requests.get(f"{BASE_URL}/api/schools", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 80
        s = data[0]
        for k in ["school_id", "name", "area", "board", "fees_min", "fees_max", "facilities", "admission_open"]:
            assert k in s

    def test_meta(self):
        r = requests.get(f"{BASE_URL}/api/schools/meta", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "areas" in data and len(data["areas"]) > 0
        assert "boards" in data and len(data["boards"]) > 0
        assert "facilities" in data and "sports" in data["facilities"]

    def test_get_single_school(self):
        lst = requests.get(f"{BASE_URL}/api/schools", timeout=15).json()
        sid = lst[0]["school_id"]
        r = requests.get(f"{BASE_URL}/api/schools/{sid}", timeout=15)
        assert r.status_code == 200
        assert r.json()["school_id"] == sid

    def test_get_school_404(self):
        r = requests.get(f"{BASE_URL}/api/schools/sch_nonexistent", timeout=15)
        assert r.status_code == 404

    def test_filter_by_area(self):
        meta = requests.get(f"{BASE_URL}/api/schools/meta", timeout=15).json()
        area = meta["areas"][0]
        r = requests.get(f"{BASE_URL}/api/schools", params={"area": area}, timeout=15)
        assert r.status_code == 200
        assert all(s["area"] == area for s in r.json())

    def test_filter_by_board(self):
        r = requests.get(f"{BASE_URL}/api/schools", params={"board": "CBSE"}, timeout=15)
        assert r.status_code == 200
        for s in r.json():
            assert "cbse" in s["board"].lower()

    def test_filter_by_facility(self):
        r = requests.get(f"{BASE_URL}/api/schools", params={"facility": "sports"}, timeout=15)
        assert r.status_code == 200
        assert all("sports" in s["facilities"] for s in r.json())

    def test_filter_fees_max(self):
        r = requests.get(f"{BASE_URL}/api/schools", params={"fees_max": 100000}, timeout=15)
        assert r.status_code == 200
        assert all(s["fees_min"] <= 100000 for s in r.json())

    def test_filter_admission_open(self):
        r = requests.get(f"{BASE_URL}/api/schools", params={"admission_open": "true"}, timeout=15)
        assert r.status_code == 200
        assert all(s["admission_open"] is True for s in r.json())

    def test_search(self):
        r = requests.get(f"{BASE_URL}/api/schools", params={"search": "school"}, timeout=15)
        assert r.status_code == 200


# ---------- v3: Multi-city ----------
class TestCities:
    def test_cities_endpoint(self):
        r = requests.get(f"{BASE_URL}/api/schools/cities", timeout=15)
        assert r.status_code == 200
        data = r.json()
        cities = {c["city"]: c["count"] for c in data}
        for expected in ["Mumbai", "Bangalore", "Delhi", "Noida", "Gurgaon"]:
            assert expected in cities, f"Missing city: {expected}"
        assert cities["Mumbai"] == 35
        assert cities["Bangalore"] == 15
        assert cities["Delhi"] == 10
        assert cities["Noida"] == 10
        assert cities["Gurgaon"] == 10
        assert sum(cities.values()) == 80

    @pytest.mark.parametrize("city,expected_count", [
        ("Mumbai", 35), ("Bangalore", 15), ("Delhi", 10), ("Noida", 10), ("Gurgaon", 10),
    ])
    def test_city_filter(self, city, expected_count):
        r = requests.get(f"{BASE_URL}/api/schools", params={"city": city}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == expected_count
        assert all(s["city"] == city for s in data)

    def test_meta_city_filter(self):
        r = requests.get(f"{BASE_URL}/api/schools/meta", params={"city": "Mumbai"}, timeout=15)
        assert r.status_code == 200
        mumbai_areas = set(r.json()["areas"])
        r2 = requests.get(f"{BASE_URL}/api/schools/meta", params={"city": "Bangalore"}, timeout=15)
        bangalore_areas = set(r2.json()["areas"])
        # Mumbai and Bangalore areas should not overlap
        assert mumbai_areas.isdisjoint(bangalore_areas), f"Overlap: {mumbai_areas & bangalore_areas}"
        assert len(mumbai_areas) > 0
        assert len(bangalore_areas) > 0


# ---------- v3: Document uploads ----------
class TestDocumentUploads:
    @pytest.fixture(scope="class")
    def app_with_docs(self, auth_headers):
        sid = requests.get(f"{BASE_URL}/api/schools", params={"city": "Mumbai"}, timeout=15).json()[0]["school_id"]
        r = requests.post(f"{BASE_URL}/api/applications", headers=auth_headers,
                          json={"school_id": sid, "child_name": "TEST_Upload", "grade_applying": "Grade 1"}, timeout=15)
        assert r.status_code == 200
        app = r.json()
        yield app
        # cleanup
        try:
            requests.delete(f"{BASE_URL}/api/applications/{app['application_id']}", headers=auth_headers, timeout=15)
        except Exception:
            pass

    def test_upload_requires_auth(self, app_with_docs):
        app = app_with_docs
        doc_id = app["documents"][0]["doc_id"]
        files = {"file": ("test.txt", b"hello", "text/plain")}
        r = requests.post(
            f"{BASE_URL}/api/applications/{app['application_id']}/documents/{doc_id}/upload",
            files=files, timeout=20,
        )
        assert r.status_code == 401

    def test_upload_app_not_found(self, token):
        files = {"file": ("test.txt", b"hello", "text/plain")}
        r = requests.post(
            f"{BASE_URL}/api/applications/app_bogus/documents/dxx/upload",
            files=files, headers={"Authorization": f"Bearer {token}"}, timeout=20,
        )
        assert r.status_code == 404

    def test_upload_doc_not_found(self, app_with_docs, token):
        app = app_with_docs
        files = {"file": ("test.txt", b"hello", "text/plain")}
        r = requests.post(
            f"{BASE_URL}/api/applications/{app['application_id']}/documents/bogus_doc/upload",
            files=files, headers={"Authorization": f"Bearer {token}"}, timeout=20,
        )
        assert r.status_code == 404

    def test_upload_too_large(self, app_with_docs, token):
        app = app_with_docs
        doc_id = app["documents"][0]["doc_id"]
        big = b"x" * (8 * 1024 * 1024 + 100)
        files = {"file": ("big.bin", big, "application/octet-stream")}
        r = requests.post(
            f"{BASE_URL}/api/applications/{app['application_id']}/documents/{doc_id}/upload",
            files=files, headers={"Authorization": f"Bearer {token}"}, timeout=60,
        )
        assert r.status_code == 413

    def test_upload_download_delete_flow(self, app_with_docs, token):
        app = app_with_docs
        # use second doc to avoid collision with too-large test
        doc_id = app["documents"][1]["doc_id"]
        content = b"%PDF-1.4 fake pdf content for testing\n" * 50
        files = {"file": ("birth_cert.pdf", content, "application/pdf")}
        # UPLOAD
        r = requests.post(
            f"{BASE_URL}/api/applications/{app['application_id']}/documents/{doc_id}/upload",
            files=files, headers={"Authorization": f"Bearer {token}"}, timeout=60,
        )
        assert r.status_code == 200, r.text
        updated = r.json()
        doc = next(d for d in updated["documents"] if d["doc_id"] == doc_id)
        assert doc["status"] == "ready"
        assert doc["file_name"] == "birth_cert.pdf"
        assert doc["file_size"] == len(content)
        assert doc["storage_path"]
        assert doc["content_type"] == "application/pdf"

        # DOWNLOAD via auth query param
        r2 = requests.get(
            f"{BASE_URL}/api/applications/{app['application_id']}/documents/{doc_id}/file",
            params={"auth": token}, timeout=30,
        )
        assert r2.status_code == 200, r2.text
        assert r2.content == content
        assert "pdf" in r2.headers.get("content-type", "").lower()

        # DELETE
        r3 = requests.delete(
            f"{BASE_URL}/api/applications/{app['application_id']}/documents/{doc_id}/file",
            headers={"Authorization": f"Bearer {token}"}, timeout=20,
        )
        assert r3.status_code == 200

        # Verify cleared
        r4 = requests.get(f"{BASE_URL}/api/applications", headers={"Authorization": f"Bearer {token}"}, timeout=15)
        refreshed = next(a for a in r4.json() if a["application_id"] == app["application_id"])
        doc2 = next(d for d in refreshed["documents"] if d["doc_id"] == doc_id)
        assert doc2["status"] == "pending"
        assert doc2["file_name"] is None
        assert doc2["storage_path"] is None
        assert doc2["file_size"] is None



# ---------- Auth ----------
class TestAuth:
    def test_me_no_auth_401(self):
        r = requests.get(f"{BASE_URL}/api/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_invalid_token_401(self):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": "Bearer bad"}, timeout=15)
        assert r.status_code == 401

    def test_me_valid(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "Test Parent"
        assert "user_id" in data

    def test_session_invalid_session_id(self):
        r = requests.post(f"{BASE_URL}/api/auth/session", json={"session_id": "invalid_id_xxx"}, timeout=20)
        # Expect 401 or 502 if upstream unreachable; just must not be 200
        assert r.status_code != 200


# ---------- Applications ----------
class TestApplications:
    def test_list_unauth(self):
        r = requests.get(f"{BASE_URL}/api/applications", timeout=15)
        assert r.status_code == 401

    def test_full_crud(self, auth_headers):
        # get school id
        sid = requests.get(f"{BASE_URL}/api/schools", timeout=15).json()[0]["school_id"]
        # CREATE
        payload = {"school_id": sid, "child_name": "TEST_Aarav", "grade_applying": "Grade 1", "notes": "initial"}
        r = requests.post(f"{BASE_URL}/api/applications", headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200, r.text
        app = r.json()
        assert app["child_name"] == "TEST_Aarav"
        assert app["school_id"] == sid
        assert app["status"] == "not_started"
        assert len(app["documents"]) == 5
        app_id = app["application_id"]

        # LIST
        r = requests.get(f"{BASE_URL}/api/applications", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert any(a["application_id"] == app_id for a in r.json())

        # PATCH
        upd = {"status": "interview_scheduled", "notes": "updated", "interview_date": "2026-02-15"}
        r = requests.patch(f"{BASE_URL}/api/applications/{app_id}", headers=auth_headers, json=upd, timeout=15)
        assert r.status_code == 200
        u = r.json()
        assert u["status"] == "interview_scheduled"
        assert u["notes"] == "updated"
        assert u["interview_date"] == "2026-02-15"

        # DELETE
        r = requests.delete(f"{BASE_URL}/api/applications/{app_id}", headers=auth_headers, timeout=15)
        assert r.status_code == 200

        # Verify removed
        r = requests.get(f"{BASE_URL}/api/applications", headers=auth_headers, timeout=15)
        assert not any(a["application_id"] == app_id for a in r.json())

    def test_create_invalid_school(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/applications", headers=auth_headers,
                          json={"school_id": "sch_bad", "child_name": "X", "grade_applying": "G1"}, timeout=15)
        assert r.status_code == 404


# ---------- Favourites ----------
class TestFavourites:
    def test_unauth(self):
        assert requests.get(f"{BASE_URL}/api/favourites", timeout=15).status_code == 401
        assert requests.get(f"{BASE_URL}/api/favourites/ids", timeout=15).status_code == 401

    def test_flow(self, auth_headers):
        sid = requests.get(f"{BASE_URL}/api/schools", timeout=15).json()[0]["school_id"]
        # Add
        r = requests.post(f"{BASE_URL}/api/favourites/{sid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        # IDs
        r = requests.get(f"{BASE_URL}/api/favourites/ids", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert sid in r.json()["ids"]
        # List
        r = requests.get(f"{BASE_URL}/api/favourites", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert any(s["school_id"] == sid for s in r.json())
        # Idempotent add
        r = requests.post(f"{BASE_URL}/api/favourites/{sid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        r = requests.get(f"{BASE_URL}/api/favourites/ids", headers=auth_headers, timeout=15)
        assert r.json()["ids"].count(sid) == 1
        # Remove
        r = requests.delete(f"{BASE_URL}/api/favourites/{sid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        r = requests.get(f"{BASE_URL}/api/favourites/ids", headers=auth_headers, timeout=15)
        assert sid not in r.json()["ids"]

    def test_add_invalid_school(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/favourites/sch_bad", headers=auth_headers, timeout=15)
        assert r.status_code == 404
