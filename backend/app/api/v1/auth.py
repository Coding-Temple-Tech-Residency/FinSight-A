from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import Token, UserResponse, UserSignup

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
)
def signup(payload: UserSignup, db: Session = Depends(get_db)) -> Token:
    """
    Register a new user.
    Returns a JWT access token immediately so the user is logged in.
    """
    # Check if email already taken
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user with hashed password
    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Issue a token immediately so signup → logged in (no second request needed)
    token = create_access_token(subject=user.id)
    return Token(access_token=token)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """
    Login with email + password (sent as form data, not JSON,
    so Swagger UI's 'Authorize' button works).
    Returns a JWT access token.
    """
    # OAuth2PasswordRequestForm uses 'username' field — we treat it as email
    user = db.query(User).filter(User.email == form_data.username).first()

    if user is None or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    token = create_access_token(subject=user.id)
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """
    Return the currently authenticated user.
    Requires a valid Bearer token in the Authorization header.
    """
    return current_user