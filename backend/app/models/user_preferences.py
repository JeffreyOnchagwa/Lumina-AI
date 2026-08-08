from sqlalchemy import Boolean, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    preferred_voice: Mapped[str] = mapped_column(
        String(100),
        default="default",
        nullable=False,
    )

    speech_speed: Mapped[float] = mapped_column(
        Float,
        default=1.0,
        nullable=False,
    )

    font_size: Mapped[int] = mapped_column(
        Integer,
        default=18,
        nullable=False,
    )

    dyslexia_mode: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    high_contrast_mode: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    preferred_language: Mapped[str] = mapped_column(
        String(20),
        default="en",
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="preferences",
    )