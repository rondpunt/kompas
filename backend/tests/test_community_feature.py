"""Community feature API regression tests (anonymous + premium-gated flows)."""
import os
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv


# Load public preview base URL and backend DB config from env files
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "EXPO_PUBLIC_BACKEND_URL missing"
API = f"{BASE_URL}/api"
TIMEOUT = 30

MONGO_URL = os.environ.get("MONGO_URL", "")
DB_NAME = os.environ.get("DB_NAME", "")


def _client(device_id: str) -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "X-Device-Id": device_id,
    })
    return s


def _seed_trialing_subscription(device_id: str):
    from pymongo import MongoClient

    assert MONGO_URL and DB_NAME, "MONGO_URL/DB_NAME missing"
    mongo = MongoClient(MONGO_URL)
    coll = mongo[DB_NAME]["subscriptions"]
    coll.update_one(
        {"owner_device_id": device_id, "owner_user_id": None},
        {
            "$set": {
                "owner_device_id": device_id,
                "owner_user_id": None,
                "status": "trialing",
                "plan": "monthly",
                "updated_at": "2026-01-01T00:00:00+00:00",
            }
        },
        upsert=True,
    )
    mongo.close()


@pytest.fixture
def community_ids():
    # Test-device ids for free and premium paths
    ids = {
        "free": f"TEST_comm_free_{uuid.uuid4().hex[:8]}",
        "premium_a": f"TEST_comm_plus_a_{uuid.uuid4().hex[:8]}",
        "premium_b": f"TEST_comm_plus_b_{uuid.uuid4().hex[:8]}",
    }
    yield ids

    # Cleanup test-created records
    from pymongo import MongoClient

    if not (MONGO_URL and DB_NAME):
        return
    mongo = MongoClient(MONGO_URL)
    db = mongo[DB_NAME]

    devices = list(ids.values())
    owner_keys = [f"anon:{d}" for d in devices]

    db.community_profiles.delete_many({"owner_device_id": {"$in": devices}})
    db.community_posts.delete_many({"author_owner_device_id": {"$in": devices}})
    db.community_messages.delete_many({"participants": {"$elemMatch": {"$regex": "^TEST"}}})
    db.subscriptions.delete_many({"owner_device_id": {"$in": devices}, "owner_user_id": None})
    db.subscriptions.delete_many({"device_id": {"$in": devices}})
    db.community_profiles.delete_many({"owner_key": {"$in": owner_keys}})
    mongo.close()


class TestCommunityFeature:
    """Community module: profile, nickname, feed, posting, inbox, and DM thread flows."""

    def test_01_get_me_creates_or_returns_profile_with_flags(self, community_ids):
        c = _client(community_ids["free"])
        r = c.get(f"{API}/community/me", timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        data = r.json()

        assert isinstance(data.get("nickname"), str) and len(data["nickname"]) >= 3
        assert data.get("is_premium") is False
        assert data.get("can_post") is False
        assert data.get("can_dm") is False

    def test_02_nickname_validation_and_uniqueness(self, community_ids):
        c1 = _client(community_ids["free"])
        c2 = _client(community_ids["premium_b"])

        # Validation: too short after cleaning
        r_short = c1.post(f"{API}/community/nickname", json={"nickname": "a!"}, timeout=TIMEOUT)
        assert r_short.status_code == 400
        assert "nickname_too_short" in r_short.text

        # Set unique nickname on c1
        nick = f"TESTnick{uuid.uuid4().hex[:6]}"
        r_ok = c1.post(f"{API}/community/nickname", json={"nickname": nick}, timeout=TIMEOUT)
        assert r_ok.status_code == 200, r_ok.text
        assert r_ok.json().get("nickname") == nick

        # Same nickname on another device should conflict
        r_conflict = c2.post(f"{API}/community/nickname", json={"nickname": nick}, timeout=TIMEOUT)
        assert r_conflict.status_code == 409
        assert "nickname_taken" in r_conflict.text

    def test_03_feed_channel_filter(self, community_ids):
        premium = _client(community_ids["premium_a"])
        _seed_trialing_subscription(community_ids["premium_a"])

        post_r = premium.post(
            f"{API}/community/posts",
            json={"content": f"TEST feed adhd {uuid.uuid4().hex[:6]}", "channel": "adhd"},
            timeout=TIMEOUT,
        )
        assert post_r.status_code == 200, post_r.text
        created = post_r.json()

        feed_r = premium.get(f"{API}/community/feed", params={"channel": "adhd"}, timeout=TIMEOUT)
        assert feed_r.status_code == 200, feed_r.text
        arr = feed_r.json()
        assert isinstance(arr, list)
        assert any(p.get("id") == created["id"] for p in arr)
        assert all(p.get("channel") == "adhd" for p in arr)

    def test_04_free_user_post_blocked_plus_required(self, community_ids):
        free = _client(community_ids["free"])
        r = free.post(
            f"{API}/community/posts",
            json={"content": "TEST free should fail", "channel": "algemeen"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 402
        assert "plus_required" in r.text

    def test_05_premium_trialing_user_can_create_post(self, community_ids):
        premium = _client(community_ids["premium_a"])
        _seed_trialing_subscription(community_ids["premium_a"])

        body = {"content": f"TEST premium post {uuid.uuid4().hex[:6]}", "channel": "angst"}
        r = premium.post(f"{API}/community/posts", json=body, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        data = r.json()

        assert data.get("content") == body["content"]
        assert data.get("channel") == "angst"
        assert isinstance(data.get("author_nickname"), str)
        assert "author_owner_user_id" not in data
        assert "author_owner_device_id" not in data

    def test_06_dm_inbox_and_thread_read_flow(self, community_ids):
        sender = _client(community_ids["premium_a"])
        peer = _client(community_ids["premium_b"])

        _seed_trialing_subscription(community_ids["premium_a"])
        _seed_trialing_subscription(community_ids["premium_b"])

        # Ensure deterministic nicknames
        sender_nick = f"TESTA{uuid.uuid4().hex[:6]}"
        peer_nick = f"TESTB{uuid.uuid4().hex[:6]}"
        r1 = sender.post(f"{API}/community/nickname", json={"nickname": sender_nick}, timeout=TIMEOUT)
        r2 = peer.post(f"{API}/community/nickname", json={"nickname": peer_nick}, timeout=TIMEOUT)
        assert r1.status_code == 200, r1.text
        assert r2.status_code == 200, r2.text

        dm_send = sender.post(
            f"{API}/community/dm/thread/{peer_nick}",
            json={"text": f"TEST dm hello {uuid.uuid4().hex[:5]}"},
            timeout=TIMEOUT,
        )
        assert dm_send.status_code == 200, dm_send.text
        msg = dm_send.json().get("message", {})
        assert msg.get("to_nickname") == peer_nick

        inbox = peer.get(f"{API}/community/dm/inbox", timeout=TIMEOUT)
        assert inbox.status_code == 200, inbox.text
        threads = inbox.json()
        assert isinstance(threads, list)
        assert any(t.get("peer_nickname") == sender_nick for t in threads)

        thread = peer.get(f"{API}/community/dm/thread/{sender_nick}", timeout=TIMEOUT)
        assert thread.status_code == 200, thread.text
        msgs = thread.json()
        assert isinstance(msgs, list)
        assert any(m.get("id") == msg.get("id") for m in msgs)

    def test_07_free_user_dm_send_blocked_plus_required(self, community_ids):
        free = _client(community_ids["free"])
        r = free.post(
            f"{API}/community/dm/thread/nonexistentpeer",
            json={"text": "TEST free dm should fail"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 402
        assert "plus_required" in r.text

    def test_08_premium_trialing_user_can_send_dm(self, community_ids):
        sender = _client(community_ids["premium_a"])
        peer = _client(community_ids["premium_b"])
        _seed_trialing_subscription(community_ids["premium_a"])
        _seed_trialing_subscription(community_ids["premium_b"])

        sender_nick = f"TESTSender{uuid.uuid4().hex[:5]}"
        peer_nick = f"TESTPeer{uuid.uuid4().hex[:5]}"
        sender.post(f"{API}/community/nickname", json={"nickname": sender_nick}, timeout=TIMEOUT)
        peer.post(f"{API}/community/nickname", json={"nickname": peer_nick}, timeout=TIMEOUT)

        r = sender.post(
            f"{API}/community/dm/thread/{peer_nick}",
            json={"text": f"TEST premium dm {uuid.uuid4().hex[:6]}"},
            timeout=TIMEOUT,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert data["message"].get("from_nickname") == sender_nick
        assert data["message"].get("to_nickname") == peer_nick
