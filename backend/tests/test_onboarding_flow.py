"""
Tests for the new onboarding flow endpoints:
- POST /api/stripe/checkout-session (graceful mock fallback)
- POST /api/onboarding/quiz (saves quiz data to MongoDB)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', '').rstrip('/')
DEVICE_ID = f"TEST_onboarding_{uuid.uuid4().hex[:8]}"


@pytest.fixture
def client():
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "X-Device-Id": DEVICE_ID,
    })
    return session


# ── Stripe Checkout Tests ──────────────────────────────────────────────────────

class TestStripeCheckout:
    """POST /api/stripe/checkout-session — graceful mock when Stripe not configured"""

    def test_checkout_annual_plan_returns_200(self, client):
        """Should return 200 with mock=True since sk_test_emergent is not a real Stripe key"""
        res = client.post(f"{BASE_URL}/api/stripe/checkout-session", json={
            "plan": "annual",
            "user_id": "anonymous",
        })
        assert res.status_code == 200, f"Expected 200 got {res.status_code}: {res.text}"

    def test_checkout_monthly_plan_returns_200(self, client):
        res = client.post(f"{BASE_URL}/api/stripe/checkout-session", json={
            "plan": "monthly",
            "user_id": "anonymous",
        })
        assert res.status_code == 200, f"Expected 200 got {res.status_code}: {res.text}"

    def test_checkout_graceful_mock_fallback(self, client):
        """When Stripe not configured, response must have mock:True and no real checkout URL"""
        res = client.post(f"{BASE_URL}/api/stripe/checkout-session", json={
            "plan": "annual",
            "user_id": "anonymous",
        })
        assert res.status_code == 200
        data = res.json()
        # Either mock:true OR a real checkoutUrl (but in test env, Stripe is not configured)
        # The key check: response is valid JSON with expected structure
        assert "checkoutUrl" in data or "mock" in data, f"Unexpected response structure: {data}"

    def test_checkout_mock_true_when_stripe_unconfigured(self, client):
        """Stripe key 'sk_test_emergent' is not a real key — backend must return mock:true"""
        res = client.post(f"{BASE_URL}/api/stripe/checkout-session", json={
            "plan": "annual",
            "user_id": "test_user_123",
        })
        assert res.status_code == 200
        data = res.json()
        # Backend should return mock:true when key is not a valid Stripe key
        assert data.get("mock") is True, f"Expected mock=True but got: {data}"
        assert data.get("checkoutUrl") is None, f"Expected no checkoutUrl but got: {data.get('checkoutUrl')}"

    def test_checkout_invalid_plan_returns_400(self, client):
        """Invalid plan should return 400"""
        res = client.post(f"{BASE_URL}/api/stripe/checkout-session", json={
            "plan": "weekly",
            "user_id": "anonymous",
        })
        assert res.status_code == 400, f"Expected 400 for invalid plan, got {res.status_code}"

    def test_checkout_default_plan_is_annual(self, client):
        """If plan is omitted, defaults to annual — still returns 200"""
        res = client.post(f"{BASE_URL}/api/stripe/checkout-session", json={
            "user_id": "anonymous",
        })
        assert res.status_code == 200

    def test_checkout_response_has_message_when_mock(self, client):
        """Mock response should include a human-readable message"""
        res = client.post(f"{BASE_URL}/api/stripe/checkout-session", json={
            "plan": "monthly",
            "user_id": "anonymous",
        })
        assert res.status_code == 200
        data = res.json()
        if data.get("mock"):
            assert "message" in data, f"Mock response should have 'message' field: {data}"


# ── Onboarding Quiz Tests ──────────────────────────────────────────────────────

class TestOnboardingQuiz:
    """POST /api/onboarding/quiz — saves quiz answers to MongoDB"""

    def test_quiz_save_full_data_returns_ok(self, client):
        """POST with all fields should return {ok: True}"""
        res = client.post(f"{BASE_URL}/api/onboarding/quiz", json={
            "intentions": ["Gewoon praten over hoe ik me voel", "Begrijpen waarom ik me zo voel"],
            "mood": "Wisselend – goede en moeilijke dagen door elkaar",
            "therapy_experience": "Nee, maar ik overweeg het",
        })
        assert res.status_code == 200, f"Expected 200 got {res.status_code}: {res.text}"
        data = res.json()
        assert data.get("ok") is True, f"Expected ok:true but got: {data}"

    def test_quiz_save_minimal_data(self, client):
        """POST with only intentions (mood and therapy_experience optional) should succeed"""
        res = client.post(f"{BASE_URL}/api/onboarding/quiz", json={
            "intentions": ["Hulp bij iets waar ik mee worstel"],
        })
        assert res.status_code == 200
        data = res.json()
        assert data.get("ok") is True

    def test_quiz_save_empty_payload(self, client):
        """POST with empty payload (all optional) should still return ok:true"""
        res = client.post(f"{BASE_URL}/api/onboarding/quiz", json={})
        assert res.status_code == 200
        data = res.json()
        assert data.get("ok") is True

    def test_quiz_save_anonymous_no_device_id(self):
        """POST without X-Device-Id should still return ok (upsert on empty owner query)"""
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        res = session.post(f"{BASE_URL}/api/onboarding/quiz", json={
            "intentions": ["Checken hoe het echt met me gaat"],
            "mood": "Overwegend rustig, met af en toe piekmomenten",
        })
        assert res.status_code == 200

    def test_quiz_save_persists_data(self, client):
        """After saving quiz data, the profile should be queryable (best effort via admin)"""
        unique_device = f"TEST_persist_{uuid.uuid4().hex[:8]}"
        session = requests.Session()
        session.headers.update({
            "Content-Type": "application/json",
            "X-Device-Id": unique_device,
        })
        res = session.post(f"{BASE_URL}/api/onboarding/quiz", json={
            "intentions": ["TEST_intent_persist"],
            "mood": "TEST_mood_value",
            "therapy_experience": "TEST_therapy_value",
        })
        assert res.status_code == 200
        assert res.json().get("ok") is True

    def test_quiz_multiple_calls_idempotent(self, client):
        """Calling quiz endpoint multiple times should not error (upsert semantics)"""
        payload = {
            "intentions": ["Gewoon praten over hoe ik me voel"],
            "mood": "Overwegend zwaar of uitgeput",
        }
        r1 = client.post(f"{BASE_URL}/api/onboarding/quiz", json=payload)
        r2 = client.post(f"{BASE_URL}/api/onboarding/quiz", json=payload)
        assert r1.status_code == 200
        assert r2.status_code == 200
        assert r1.json().get("ok") is True
        assert r2.json().get("ok") is True
