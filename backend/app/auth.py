from datetime import datetime, timedelta
from typing import Optional
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

def authenticate_staff(db: Session, email: str, password: str):
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

async def get_current_staff(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        staff_id: str = payload.get("sub")
        if staff_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if staff is None:
        raise credentials_exception
    return staff

async def get_current_active_staff(current_staff: models.Staff = Depends(get_current_staff)):
    if current_staff.status != 'ACTIVE':
        raise HTTPException(status_code=400, detail="Inactive staff member")
    return current_staff

async def get_current_super_admin(current_staff: models.Staff = Depends(get_current_active_staff)):
    # Super admin is identified by email (hardcoded for now)
    if current_staff.email != settings.SUPER_ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required"
        )
    return current_staff

async def get_current_hotel_admin(current_staff: models.Staff = Depends(get_current_active_staff)):
    if not current_staff.is_hotel_admin and current_staff.email != settings.SUPER_ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hotel admin privileges required"
        )
    return current_staff

async def get_current_property_admin(current_staff: models.Staff = Depends(get_current_active_staff)):
    if not current_staff.is_property_admin and not current_staff.is_hotel_admin and current_staff.email != settings.SUPER_ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Property admin privileges required"
        )
    return current_staff