"""
Unit + integration tests for auth endpoints.

Covers: signup, login, logout, get current user, forgot/reset password.
"""


def test_signup_success(client):
    """New user can sign up successfully."""
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": "newuser@finsight.dev", "password": "SecurePass123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@finsight.dev"
    assert "id" in data


def test_signup_duplicate_email_fails(client, test_user):
    """Signup with existing email returns 400."""
    response = client.post(
        "/api/v1/auth/signup",
        json={"email": test_user.email, "password": "AnotherPass123"}
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client, test_user):
    """Existing user can login with correct credentials."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "TestPassword123"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email


def test_login_wrong_password_fails(client, test_user):
    """Login with wrong password returns 401."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "WrongPassword"}
    )
    assert response.status_code == 401


def test_login_nonexistent_user_fails(client):
    """Login with non-existent email returns 401."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "doesnotexist@finsight.dev", "password": "AnyPassword123"}
    )
    assert response.status_code == 401


def test_get_me_authenticated(client, auth_headers, test_user):
    """Authenticated user can fetch their own data."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email


def test_get_me_unauthenticated_fails(client):
    """Unauthenticated request to /me returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_logout_clears_cookie(client, auth_headers):
    """Logout returns 204 and clears auth cookie."""
    response = client.post("/api/v1/auth/logout", headers=auth_headers)
    assert response.status_code == 204


def test_forgot_password_existing_user(client, test_user):
    """Forgot password returns reset token for existing user."""
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": test_user.email}
    )
    assert response.status_code == 200
    data = response.json()
    assert "reset_token" in data
    assert data["expires_in"] == 86400


def test_forgot_password_nonexistent_user_fails(client):
    """Forgot password for non-existent email returns 404."""
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "doesnotexist@finsight.dev"}
    )
    assert response.status_code == 404


def test_reset_password_success(client, test_user):
    """Reset password with valid token succeeds."""
    forgot_response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": test_user.email}
    )
    reset_token = forgot_response.json()["reset_token"]

    reset_response = client.post(
        "/api/v1/auth/reset-password",
        json={"reset_token": reset_token, "new_password": "NewSecurePass123"}
    )
    assert reset_response.status_code == 200

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user.email, "password": "NewSecurePass123"}
    )
    assert login_response.status_code == 200


def test_reset_password_invalid_token_fails(client):
    """Reset password with garbage token returns 400."""
    response = client.post(
        "/api/v1/auth/reset-password",
        json={"reset_token": "invalid.token.here", "new_password": "NewPass123"}
    )
    assert response.status_code == 400


def test_reset_token_cannot_be_used_as_session(client, test_user):
    """
    Security regression test (API-A2): a password-reset token must
    NOT be usable as a login session cookie.
    """
    forgot_response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": test_user.email}
    )
    reset_token = forgot_response.json()["reset_token"]

    # Attempt to use the reset token as a session cookie
    response = client.get(
        "/api/v1/auth/me",
        headers={"Cookie": f"access_token={reset_token}"}
    )
    assert response.status_code == 401


def test_session_token_cannot_be_used_to_reset_password(client, auth_headers):
    """
    Security regression test (API-A2): a regular login session token
    must NOT be usable to reset a password.
    """
    session_token = auth_headers["Cookie"].split("=")[1]

    response = client.post(
        "/api/v1/auth/reset-password",
        json={"reset_token": session_token, "new_password": "NewPass123"}
    )
    assert response.status_code == 400
