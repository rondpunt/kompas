"""Iteration 3 — Auth endpoints + device_id scoping tests."""
import os
import uuid
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "EXPO_PUBLIC_BACKEND_URL missing"
API = f"{BASE_URL}/api"
TIMEOUT = 90

# Two distinct device ids per-run so isolation is provable
DEV_A = f"TEST_dev_A_{uuid.uuid4().hex[:8]}"
DEV_B = f"TEST_dev_B_{uuid.uuid4().hex[:8]}"


# ---------- /api/auth/session ----------
class TestAuthSession:
    def test_session_post_no_body_422(self):
        r = requests.post(f"{API}/auth/session", timeout=15)
        # FastAPI/Pydantic returns 422 for missing required body
        assert r.status_code == 422, r.text

    def test_session_post_invalid_session_id_401(self):
        r = requests.post(
            f"{API}/auth/session",
            json={"session_id": "definitely-not-a-real-session-id"},
            timeout=20,
        )
        # Emergent auth provider should reject -> our endpoint maps to 401
        assert r.status_code == 401, r.text
        assert "invalid" in r.text.lower()


# ---------- /api/auth/me ----------
class TestAuthMe:
    def test_me_no_header_401(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_invalid_bearer_401(self):
        r = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": "Bearer not-a-real-token"},
            timeout=15,
        )
        assert r.status_code == 401

    def test_me_malformed_header_401(self):
        r = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": "Basic foo"},
            timeout=15,
        )
        assert r.status_code == 401


# ---------- /api/auth/logout ----------
class TestAuthLogout:
    def test_logout_no_header_200(self):
        r = requests.post(f"{API}/auth/logout", timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_logout_invalid_token_200(self):
        r = requests.post(
            f"{API}/auth/logout",
            headers={"Authorization": "Bearer bogus"},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------- /api/auth/claim ----------
class TestAuthClaim:
    def test_claim_no_auth_401(self):
        r = requests.post(
            f"{API}/auth/claim",
            json={"device_id": DEV_A},
            timeout=15,
        )
        assert r.status_code == 401

    def test_claim_invalid_bearer_401(self):
        r = requests.post(
            f"{API}/auth/claim",
            json={"device_id": DEV_A},
            headers={"Authorization": "Bearer nope"},
            timeout=15,
        )
        assert r.status_code == 401


# ---------- /api/conversations + /api/chat device_id scoping ----------
class TestDeviceScopedChat:
    convo_a = None

    def test_conversations_no_device_no_auth_returns_empty(self):
        r = requests.get(f"{API}/conversations", timeout=20)
        assert r.status_code == 200
        # Spec says: no Bearer + no X-Device-Id => []
        assert r.json() == []

    def test_chat_with_device_a_creates_owned_convo(self):
        r = requests.post(
            f"{API}/chat",
            headers={"X-Device-Id": DEV_A, "Content-Type": "application/json"},
            json={"message": "TEST_dev_scoping_initial_message_voor_apparaat_A"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        j = r.json()
        assert "conversation_id" in j
        TestDeviceScopedChat.convo_a = j["conversation_id"]

    def test_conversations_device_a_sees_own(self):
        assert TestDeviceScopedChat.convo_a
        r = requests.get(
            f"{API}/conversations",
            headers={"X-Device-Id": DEV_A},
            timeout=20,
        )
        assert r.status_code == 200
        arr = r.json()
        ids = {c["id"] for c in arr}
        assert TestDeviceScopedChat.convo_a in ids, (
            f"device A should see its own convo; got ids={ids}"
        )

    def test_conversations_device_b_isolated(self):
        assert TestDeviceScopedChat.convo_a
        r = requests.get(
            f"{API}/conversations",
            headers={"X-Device-Id": DEV_B},
            timeout=20,
        )
        assert r.status_code == 200
        arr = r.json()
        ids = {c["id"] for c in arr}
        assert TestDeviceScopedChat.convo_a not in ids, (
            "device B must NOT see device A conversations — isolation broken"
        )

    def test_chat_continues_same_convo_same_device(self):
        assert TestDeviceScopedChat.convo_a
        r = requests.post(
            f"{API}/chat",
            headers={"X-Device-Id": DEV_A, "Content-Type": "application/json"},
            json={
                "conversation_id": TestDeviceScopedChat.convo_a,
                "message": "TEST_dev_A_followup",
            },
            timeout=TIMEOUT,
        )
        assert r.status_code == 200
        assert r.json()["conversation_id"] == TestDeviceScopedChat.convo_a


# ---------- /api/assessment-results device_id scoping ----------
class TestDeviceScopedAssessmentResults:
    result_a_id = None

    @classmethod
    def _payload(cls):
        return {
            "assessment_id": "phq9",
            "assessment_title": "PHQ-9 — Depressie",
            "raw_answers": [0] * 9,
            "total_score": 0,
            "max_score": 27,
            "interpretation_label": "Minimaal",
            "interpretation_tier": "minimal",
            "crisis_flag": False,
            "narrative": "TEST_dev_scoping_narrative",
        }

    def test_save_result_device_a(self):
        r = requests.post(
            f"{API}/assessment-results",
            headers={"X-Device-Id": DEV_A, "Content-Type": "application/json"},
            json=self._payload(),
            timeout=20,
        )
        assert r.status_code == 200, r.text
        j = r.json()
        assert "id" in j
        TestDeviceScopedAssessmentResults.result_a_id = j["id"]

    def test_list_results_device_a_sees_own(self):
        assert TestDeviceScopedAssessmentResults.result_a_id
        r = requests.get(
            f"{API}/assessment-results",
            headers={"X-Device-Id": DEV_A},
            timeout=20,
        )
        assert r.status_code == 200
        ids = {d["id"] for d in r.json()}
        assert TestDeviceScopedAssessmentResults.result_a_id in ids

    def test_list_results_device_b_isolated(self):
        assert TestDeviceScopedAssessmentResults.result_a_id
        r = requests.get(
            f"{API}/assessment-results",
            headers={"X-Device-Id": DEV_B},
            timeout=20,
        )
        assert r.status_code == 200
        ids = {d["id"] for d in r.json()}
        assert TestDeviceScopedAssessmentResults.result_a_id not in ids, (
            "device B must NOT see device A assessment results"
        )

    def test_list_results_no_identity_empty(self):
        r = requests.get(f"{API}/assessment-results", timeout=20)
        assert r.status_code == 200
        # No bearer + no device id => []
        assert r.json() == []
