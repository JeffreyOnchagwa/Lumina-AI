from app.utils.jwt import create_access_token, decode_access_token


def test_jwt():
    original_data = {
        "sub": "1"
    }

    token = create_access_token(original_data)

    print("JWT created successfully.")
    print("Token generated:", bool(token))

    decoded_data = decode_access_token(token)

    if decoded_data == original_data or (
        decoded_data is not None
        and decoded_data.get("sub") == original_data["sub"]
    ):
        print("JWT decoded successfully.")
        print("User ID:", decoded_data["sub"])
    else:
        print("JWT verification failed.")


if __name__ == "__main__":
    test_jwt()