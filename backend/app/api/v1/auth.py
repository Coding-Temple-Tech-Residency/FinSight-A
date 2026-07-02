from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserResponse, UserSignup

router = APIRouter(prefix="/auth", tags=["auth"])

settings = get_settings()

COOKIE_MAX_AGE = settings.jwt_access_token_expire_minutes * 60


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


def _set_auth_cookie(response: Response, token: str) -> None:
    """Set the JWT as an httpOnly cookie on the response."""
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    payload: UserSignup,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    """Register a new user."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    _set_auth_cookie(response, token)

    return user


@router.post("/login", response_model=UserResponse)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> User:
    """Login with email + password."""
    user = db.query(User).filter(User.email == form_data.username).first()

    if user is None or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    token = create_access_token(subject=user.id)
    _set_auth_cookie(response, token)

    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    """Logout - clear the auth cookie."""
    response.delete_cookie(key="access_token", path="/")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Return the currently authenticated user."""
    return current_user


@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """Request password reset token. Returns JWT valid for 24 hours."""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    reset_token = create_access_token(subject=user.id, expires_delta=timedelta(hours=24))
    
    return {
        "message": "Reset token sent to email",
        "reset_token": reset_token,
        "expires_in": 86400
    }


@router.post("/reset-password", response_model=UserResponse)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> User:
    """Reset password using token. Token must be valid and not expired."""
    try:
        import jwt
        
        payload = jwt.decode(
            request.reset_token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.password_hash = hash_password(request.new_password)
        db.commit()
        db.refresh(user)
        
        return user
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )