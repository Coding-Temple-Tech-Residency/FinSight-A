from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, EmailStr
from datetime import timedelta

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserResponse, UserSignup, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["auth"])

settings = get_settings()

COOKIE_MAX_AGE = settings.jwt_access_token_expire_minutes * 60


class ForgotPasswordRequest(BaseModel):
    """Request body for forgot-password endpoint."""
    email: EmailStr = Field(..., description="Registered email address", json_schema_extra={"example": "user@example.com"})


class ResetPasswordRequest(BaseModel):
    """Request body for reset-password endpoint."""
    reset_token: str = Field(..., description="JWT token received from forgot-password")
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=72,  # matches signup policy - bcrypt's byte limit
        description="New password (8-72 characters)",
        json_schema_extra={"example": "NewSecurePass123"},
    )


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
    summary="Register a new user",
    responses={
        201: {"description": "User created successfully"},
        400: {"description": "Email already registered"},
    },
)
@limiter.limit("5/minute")
def signup(
    request: Request,
    payload: UserSignup,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    """
    Register a new user account.
    
    - **email**: Valid email address (must be unique)
    - **password**: User's password (will be hashed with bcrypt)
    
    Returns the created user and sets an httpOnly auth cookie.
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
        first_name=payload.first_name,
        last_name=payload.last_name,
        username=payload.username,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    _set_auth_cookie(response, token)

    return user


@router.post(
    "/login",
    response_model=UserResponse,
    summary="Login with email and password",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Incorrect email or password"},
        403: {"description": "User account is inactive"},
    },
)
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> User:
    """
    Authenticate user and return access token as httpOnly cookie.
    
    - **username**: Email address (OAuth2 standard field name)
    - **password**: User's password
    
    Sets JWT token in httpOnly cookie for subsequent authenticated requests.
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


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout current user",
)
def logout(response: Response) -> None:
    """
    Logout by clearing the authentication cookie.
    
    No request body needed - uses cookie from browser.
    """
    response.delete_cookie(key="access_token", path="/")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
    responses={
        200: {"description": "Current user data"},
        401: {"description": "Not authenticated"},
    },
)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """
    Get the currently authenticated user's information.
    
    Requires valid JWT token in httpOnly cookie.
    """
    return current_user


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update current user's profile",
    responses={
        200: {"description": "Profile updated"},
        400: {"description": "Username already taken"},
        401: {"description": "Not authenticated"},
    },
)
def update_me(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """
    Update the current user's profile fields (first name, last name, username).
    
    Only provided fields are updated; omitted fields are left unchanged.
    """
    if payload.username is not None and payload.username != current_user.username:
        existing = db.query(User).filter(User.username == payload.username).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
        current_user.username = payload.username

    if payload.first_name is not None:
        current_user.first_name = payload.first_name

    if payload.last_name is not None:
        current_user.last_name = payload.last_name

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post(
    "/forgot-password",
    summary="Request password reset token",
    responses={
        200: {
            "description": "Reset token generated",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Reset token sent to email",
                        "reset_token": "eyJhbGc...",
                        "expires_in": 86400
                    }
                }
            }
        },
        404: {"description": "User not found"},
    },
)
@limiter.limit("3/minute")
def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Request a password reset token.
    
    - **email**: Registered email address
    
    Returns a JWT token valid for 24 hours. In production, this would be
    emailed to the user instead of returned directly.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    reset_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(hours=24),
        token_type="password_reset",
    )
    
    return {
        "message": "Reset token sent to email",
        "reset_token": reset_token,
        "expires_in": 86400
    }


@router.post(
    "/reset-password",
    response_model=UserResponse,
    summary="Reset password using token",
    responses={
        200: {"description": "Password reset successful"},
        400: {"description": "Token expired or invalid"},
        404: {"description": "User not found"},
    },
)
@limiter.limit("5/minute")
def reset_password(
    request: Request,
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> User:
    """
    Reset user password using a valid reset token.
    
    - **reset_token**: JWT token from forgot-password endpoint
    - **new_password**: New password (min 8 characters)
    
    Token must not be expired (valid for 24 hours from generation).
    """
    try:
        import jwt
        
        token_payload = jwt.decode(
            payload.reset_token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        
        # Reject tokens that aren't password-reset tokens (e.g. a
        # regular session token) so a login session can't be misused
        # to reset a password, and vice versa. See API-A2.
        if token_payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token"
            )
        
        user_id = token_payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.password_hash = hash_password(payload.new_password)
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
