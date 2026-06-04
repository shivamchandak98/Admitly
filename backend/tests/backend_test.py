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
    def test_list_schools_returns_50(self):
        r = requests.get(f"{BASE_URL}/api/schools", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 50
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
