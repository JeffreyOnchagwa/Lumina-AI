from fastapi import FastAPI

from app.api.users import router as users_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} Backend!"
    }


app.include_router(users_router)