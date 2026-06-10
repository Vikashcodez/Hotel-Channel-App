from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID

# Hotel Schemas
class HotelBase(BaseModel):
    hotel_name: str
    hotel_code: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    logo: Optional[str] = None
    status: Optional[str] = 'ACTIVE'

class HotelCreate(HotelBase):
    pass

class HotelUpdate(BaseModel):
    hotel_name: Optional[str] = None
    hotel_code: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    logo: Optional[str] = None
    status: Optional[str] = None

class HotelResponse(HotelBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Property Schemas
class PropertyBase(BaseModel):
    property_name: str
    property_code: str
    is_main_branch: Optional[bool] = False
    gst_number: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    total_floors: Optional[int] = 0
    status: Optional[str] = 'ACTIVE'

class PropertyCreate(PropertyBase):
    hotel_id: UUID

class PropertyUpdate(BaseModel):
    property_name: Optional[str] = None
    property_code: Optional[str] = None
    is_main_branch: Optional[bool] = None
    gst_number: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    total_floors: Optional[int] = None
    status: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: UUID
    hotel_id: UUID
    created_at: datetime
    updated_at: datetime
    staff_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# Role Schemas
class RoleBase(BaseModel):
    role_name: str
    description: Optional[str] = None
    status: Optional[str] = 'ACTIVE'

class RoleCreate(RoleBase):
    hotel_id: UUID

class RoleUpdate(BaseModel):
    role_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class RoleResponse(RoleBase):
    id: UUID
    hotel_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Staff Schemas
class StaffBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    employee_code: Optional[str] = None
    is_hotel_admin: Optional[bool] = False
    is_property_admin: Optional[bool] = False
    status: Optional[str] = 'ACTIVE'

class StaffCreate(StaffBase):
    hotel_id: UUID
    property_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    password: Optional[str] = None  # If not provided, use default

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    employee_code: Optional[str] = None
    property_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    is_hotel_admin: Optional[bool] = None
    is_property_admin: Optional[bool] = None
    status: Optional[str] = None
    password: Optional[str] = None

class StaffResponse(StaffBase):
    id: UUID
    hotel_id: UUID
    property_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    property_name: Optional[str] = None
    role_name: Optional[str] = None
    hotel_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    staff_id: UUID
    email: str
    name: str
    is_hotel_admin: bool
    is_property_admin: bool
    hotel_id: Optional[UUID] = None
    property_id: Optional[UUID] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str