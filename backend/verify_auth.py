import requests
import sqlite3

BASE_URL = "http://127.0.0.1:8000"
DB_PATH = "backend/yojanasetu.db"

def main():
    print("=== 1. TEST BRAND-NEW SIGNUP ===")
    signup_payload = {
        "full_name": "Priya Sharma",
        "email": "priya.sharma@example.gov.in",
        "password": "SecureCitizenPassword123!",
        "state": "Maharashtra"
    }

    # Clean any existing user from previous runs
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM users WHERE email = ?", (signup_payload["email"],))
    conn.commit()

    resp = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_payload)
    print(f"Signup HTTP status: {resp.status_code}")
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert "access_token" in data, "Missing access_token in signup response"
    assert data["user"]["email"] == signup_payload["email"]
    token = data["access_token"]
    user_id = data["user"]["id"]
    print(f"Signup successful! Created citizen user_id: {user_id}")

    print("\n=== 2. VERIFY SQLITE DATABASE RECORD ===")
    row = c.execute(
        "SELECT id, full_name, email, hashed_password, role, state FROM users WHERE email = ?",
        (signup_payload["email"],)
    ).fetchone()
    assert row is not None, "User record not found in SQLite table users"
    print(f"Found SQLite record: ID={row[0]}, Name={row[1]}, Email={row[2]}, Role={row[4]}, State={row[5]}")
    password_hash = row[3]
    assert password_hash.startswith("$2b$") or password_hash.startswith("$2a$"), f"Password is not bcrypt hashed: {password_hash}"
    assert signup_payload["password"] not in password_hash, "Plaintext password detected!"
    print("Password is verified as bcrypt encrypted ($2b$ salt + hash).")

    print("\n=== 3. TEST DUPLICATE ACCOUNT REGISTRATION ===")
    dup_resp = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_payload)
    print(f"Duplicate signup HTTP status: {dup_resp.status_code}")
    assert dup_resp.status_code == 409, f"Expected 409, got {dup_resp.status_code}"
    print(f"Duplicate rejection detail: {dup_resp.json().get('detail')}")

    print("\n=== 4. TEST LOGIN WITH INCORRECT PASSWORD ===")
    bad_login = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": signup_payload["email"],
        "password": "WrongPassword123!"
    })
    print(f"Bad login HTTP status: {bad_login.status_code}")
    assert bad_login.status_code == 401, f"Expected 401, got {bad_login.status_code}"
    print(f"Bad login rejection detail: {bad_login.json().get('detail')}")

    print("\n=== 5. TEST LOGIN WITH CORRECT CREDENTIALS ===")
    login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": signup_payload["email"],
        "password": signup_payload["password"],
        "remember_me": True
    })
    print(f"Login HTTP status: {login_resp.status_code}")
    assert login_resp.status_code == 200, f"Expected 200, got {login_resp.status_code}"
    login_data = login_resp.json()
    login_token = login_data["access_token"]
    print(f"Login successful! Signed JWT token: {login_token[:28]}...")

    print("\n=== 6. TEST TOKEN AUTHENTICATION (/api/auth/me) ===")
    me_resp = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {login_token}"})
    print(f"Auth /me HTTP status: {me_resp.status_code}")
    assert me_resp.status_code == 200, f"Expected 200, got {me_resp.status_code}"
    me_data = me_resp.json()
    assert me_data["email"] == signup_payload["email"]
    print(f"Authenticated citizen profile: {me_data['full_name']} ({me_data['email']})")

    print("\n=== 7. TEST UNAUTHENTICATED ME REQUEST ===")
    unauth_resp = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": "Bearer invalid_or_expired_token"})
    print(f"Invalid token HTTP status: {unauth_resp.status_code}")
    assert unauth_resp.status_code == 401, f"Expected 401, got {unauth_resp.status_code}"

    print("\n=== 8. TEST CITIZEN BOOKMARK WITH AUTH TOKEN ===")
    bm_add = requests.post(
        f"{BASE_URL}/api/bookmarks",
        json={"scheme_id": "pm-kisan", "notes": "Applying for Kharif cycle subsidy"},
        headers={"Authorization": f"Bearer {login_token}"}
    )
    print(f"Bookmark add HTTP status: {bm_add.status_code}")
    assert bm_add.status_code == 200

    bm_get = requests.get(
        f"{BASE_URL}/api/bookmarks",
        headers={"Authorization": f"Bearer {login_token}"}
    )
    print(f"Bookmark get HTTP status: {bm_get.status_code}")
    assert bm_get.status_code == 200
    bm_list = bm_get.json()
    assert len(bm_list) > 0
    print(f"Saved scheme retrieved from SQLite: {bm_list[0]['scheme']['name']}")

    print("\n=== ALL 8 END-TO-END TESTS PASSED WITH 100% SUCCESS! ===")
    conn.close()

if __name__ == "__main__":
    main()
