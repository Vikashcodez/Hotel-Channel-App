from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    STAFF = "staff"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.STAFF
    property_id: Optional[int] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    property_id: Optional[int] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Hotel Schemas
class HotelBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    city: str
    state: Optional[str] = None
    country: str
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    total_rooms: Optional[int] = 0
    rating: Optional[float] = 0.0

class HotelCreate(HotelBase):
    admin_user_id: Optional[int] = None

class HotelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    total_rooms: Optional[int] = None
    rating: Optional[float] = None
    is_active: Optional[bool] = None

class HotelResponse(HotelBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    admin_user_id: Optional[int] = None
    properties_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# Property Schemas
class PropertyBase(BaseModel):
    name: str
    property_type: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: str
    state: Optional[str] = None
    country: str
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    total_units: Optional[int] = 0
    priority: Optional[int] = 0

class PropertyCreate(PropertyBase):
    hotel_id: int

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    property_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    total_units: Optional[int] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None

class PropertyResponse(PropertyBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    hotel_id: int
    users_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str