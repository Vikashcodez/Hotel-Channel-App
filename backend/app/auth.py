from datetime import datetime, timedelta
from typing import Optional, Union
from types import SimpleNamespace
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_super_admin(email: str, password: str) -> bool:
    """Verify super admin credentials from .env"""
    return (email == settings.SUPER_ADMIN_EMAIL and 
            password == settings.SUPER_ADMIN_PASSWORD)

def authenticate_user(db: Session, email: str, password: str) -> Union[models.Staff, dict, bool]:
    """Authenticate either super admin or regular staff"""
    
    # Check if it's super admin
    if verify_super_admin(email, password):
        return {
            "is_super_admin": True,
            "email": email,
            "name": settings.SUPER_ADMIN_NAME,
            "id": "super_admin"
        }
    
    # Check regular staff in database
    staff = db.query(models.Staff).filter(models.Staff.email == email).first()
    if not staff or not verify_password(password, staff.password_hash):
        return False
    if staff.status != 'ACTIVE':
        return False
    return staff

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        user_type: str = payload.get("type")
        
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Handle super admin
    if user_type == "super_admin":
        return {
            "id": "super_admin",
            "email": settings.SUPER_ADMIN_EMAIL,
            "name": settings.SUPER_ADMIN_NAME,
            "is_super_admin": True,
            "is_hotel_admin": False,
            "is_property_admin": False,
            "hotel_id": None,
            "property_id": None,
            "status": "ACTIVE"
        }
    
    # Handle regular staff
    staff = db.query(models.Staff).filter(models.Staff.id == user_id).first()
    if staff is None:
        raise credentials_exception
    return staff

async def get_current_active_user(current_user = Depends(get_current_user)):
    if isinstance(current_user, dict):
        # Super admin is always active
        if current_user.get("is_super_admin"):
            return current_user
    else:
        # Regular staff
        if current_user.status != 'ACTIVE':
            raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_staff(current_user = Depends(get_current_active_user)):
    if isinstance(current_user, dict):
        return SimpleNamespace(
            id=current_user.get("id"),
            email=current_user.get("email"),
            name=current_user.get("name"),
            phone=None,
            employee_code="SUPER_ADMIN",
            is_hotel_admin=False,
            is_property_admin=False,
            status="ACTIVE",
            hotel_id=None,
            property_id=None,
            role_id=None,
            password_hash=None,
            created_at=None,
            updated_at=None,
        )
    return current_user

async def get_current_super_admin(current_user = Depends(get_current_active_user)):
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Super admin privileges required"
    )

async def get_current_hotel_admin(current_user = Depends(get_current_active_user)):
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        return current_user
    
    if not isinstance(current_user, dict) and current_user.is_hotel_admin:
        return current_user
        
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Hotel admin privileges required"
    )

async def get_current_property_admin(current_user = Depends(get_current_active_user)):
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        return current_user
    
    if not isinstance(current_user, dict):
        if current_user.is_property_admin or current_user.is_hotel_admin:
            return current_user
        
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Property admin privileges required"
    )