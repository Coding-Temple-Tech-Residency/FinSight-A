from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserResponse, UserSignup

router = APIRouter(prefix="/auth", tags=["auth"])

settings = get_settings()

# Cookie max age = JWT expiry (in seconds)
COOKIE_MAX_AGE = settings.jwt_access_token_expire_minutes * 60


def _set_auth_cookie(response: Response, token: str) -> None:
    """Set the JWT as an httpOnly cookie on the response."""
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,           # JS can't read this cookie (XSS-safe)
        secure=True,             # Only sent over HTTPS in production
        samesite="lax",          # Basic CSRF protection
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
    """
    Register a new user.
    Sets the JWT as an httpOnly cookie so the user is immediately authenticated.
    Returns the user info (no password_hash, no token in body).
    """
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
    """
    Login with email + password (sent as form data).
    Sets the JWT as an httpOnly cookie.
    Returns user info (no token in body — it's in the cookie).
    """
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
    """
    Logout — clear the auth cookie.
    Since JWT is stateless, this just removes the cookie client-side.
    """
    response.delete_cookie(key="access_token", path="/")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """
    Return the currently authenticated user.
    Requires a valid auth cookie.
    """
    return current_user

@router.post("/forgot-password")
def forgot_password(
    email: str,
    db: Session = Depends(get_db),
):
    """
    Request password reset token.
    
    Returns JWT token valid for 24 hours.
    Email address must exist in system.
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create reset token (24hr expiry)
    from datetime import datetime, timedelta
    
    payload = {
        "sub": user.id,
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "purpose": "password_reset"
    }
    
    reset_token = create_access_token(subject=user.id, expires_delta=timedelta(hours=24))
    
    return {
        "message": "Reset token sent to email",
        "reset_token": reset_token,
        "expires_in": 86400
    }


@router.post("/reset-password", response_model=UserResponse)
def reset_password(
    reset_token: str,
    new_password: str,
    db: Session = Depends(get_db),
) -> User:
    """
    Reset password using token from forgot-password.
    
    Token must be valid and not expired.
    """
    try:
        import jwt
        
        payload = jwt.decode(
            reset_token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Hash and update password
        user.password_hash = hash_password(new_password)
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