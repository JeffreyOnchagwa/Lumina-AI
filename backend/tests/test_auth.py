from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_me_requires_authentication():
    response = client.get("/users/me")

    assert response.status_code == 401


def test_change_password_requires_authentication():
    response = client.patch(
        "/users/me/password",
        json={
            "current_password": "OldPassword123!",
            "new_password": "NewPassword123!",
        },
    )

    assert response.status_code == 401


def test_delete_account_requires_authentication():
    response = client.request(
        "DELETE",
        "/users/me",
        json={
            "password": "Password123!",
        },
    )

    assert response.status_code == 401


def test_chat_requires_authentication():
    response = client.post(
        "/chat/",
        json={
            "message": "Hello"
        },
    )

    assert response.status_code == 401


def test_memories_require_authentication():
    response = client.get("/memories/")

    assert response.status_code == 401


def test_documents_require_authentication():
    response = client.get("/documents/")

    assert response.status_code == 401