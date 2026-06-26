from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID

# =========================
# TENANT SCHEMAS
# =========================
class TenantBase(BaseModel):
    tenant_name: str
    tenant_code: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    logo: Optional[str] = None
    status: Optional[str] = 'ACTIVE'

class TenantCreate(TenantBase):
    password: Optional[str] = Field(None, min_length=6, description="Password for tenant admin. If not provided, default 'welcome' will be used")

class TenantUpdate(BaseModel):
    tenant_name: Optional[str] = None
    tenant_code: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    logo: Optional[str] = None
    status: Optional[str] = None

class TenantResponse(TenantBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# =========================
# PROPERTY SCHEMAS
# =========================
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
    tenant_id: UUID

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
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime
    staff_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# =========================
# ROLE SCHEMAS
# =========================
class RoleBase(BaseModel):
    role_name: str
    description: Optional[str] = None
    status: Optional[str] = 'ACTIVE'

class RoleCreate(RoleBase):
    tenant_id: UUID

class RoleUpdate(BaseModel):
    role_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class RoleResponse(RoleBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# =========================
# STAFF SCHEMAS
# =========================
class StaffBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    employee_code: Optional[str] = None
    is_tenant_admin: Optional[bool] = False
    is_property_admin: Optional[bool] = False
    status: Optional[str] = 'ACTIVE'

class StaffCreate(StaffBase):
    tenant_id: UUID
    property_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    password: Optional[str] = Field(None, min_length=6, description="Password for staff. If not provided, default 'welcome' will be used")

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    employee_code: Optional[str] = None
    tenant_id: Optional[UUID] = None
    property_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    is_tenant_admin: Optional[bool] = None
    is_property_admin: Optional[bool] = None
    status: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6, description="New password for staff")

class StaffResponse(StaffBase):
    id: UUID
    tenant_id: Optional[UUID] = None
    property_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    property_name: Optional[str] = None
    role_name: Optional[str] = None
    tenant_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# =========================
# BUILDING SCHEMAS
# =========================
class BuildingBase(BaseModel):
    building_name: str
    building_code: str
    total_floors: Optional[int] = 0
    status: Optional[str] = 'ACTIVE'

class BuildingCreate(BuildingBase):
    tenant_id: UUID
    property_id: UUID

class BuildingUpdate(BaseModel):
    building_name: Optional[str] = None
    building_code: Optional[str] = None
    total_floors: Optional[int] = None
    property_id: Optional[UUID] = None
    status: Optional[str] = None

class BuildingResponse(BuildingBase):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# =========================
# FLOOR SCHEMAS
# =========================
class FloorBase(BaseModel):
    floor_name: str
    floor_code: str
    status: Optional[str] = 'ACTIVE'

class FloorCreate(FloorBase):
    tenant_id: UUID
    property_id: UUID
    building_id: UUID

class FloorUpdate(BaseModel):
    floor_name: Optional[str] = None
    floor_code: Optional[str] = None
    property_id: Optional[UUID] = None
    building_id: Optional[UUID] = None
    status: Optional[str] = None

class FloorResponse(FloorBase):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    building_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# =========================
# ROOM TYPE SCHEMAS
# =========================
class RoomTypeBase(BaseModel):
    room_type_name: str
    room_type_code: str
    description: Optional[str] = None
    status: Optional[str] = 'ACTIVE'

class RoomTypeCreate(RoomTypeBase):
    tenant_id: UUID
    property_id: UUID

class RoomTypeUpdate(BaseModel):
    room_type_name: Optional[str] = None
    room_type_code: Optional[str] = None
    description: Optional[str] = None
    property_id: Optional[UUID] = None
    status: Optional[str] = None

class RoomTypeResponse(RoomTypeBase):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# =========================
# ROOM SCHEMAS
# =========================
class RoomBase(BaseModel):
    room_name: str
    room_code: str
    status: Optional[str] = 'ACTIVE'

class RoomCreate(RoomBase):
    tenant_id: UUID
    property_id: UUID
    floor_id: UUID
    room_type_id: UUID

class RoomUpdate(BaseModel):
    room_name: Optional[str] = None
    room_code: Optional[str] = None
    property_id: Optional[UUID] = None
    floor_id: Optional[UUID] = None
    room_type_id: Optional[UUID] = None
    status: Optional[str] = None

class RoomResponse(RoomBase):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    floor_id: UUID
    room_type_id: UUID
    created_at: datetime
    updated_at: datetime
    floor_name: Optional[str] = None
    room_type_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# =========================
# AUTH SCHEMAS
# =========================
class Token(BaseModel):
    access_token: str
    token_type: str
    staff_id: Optional[str] = None
    email: str
    name: str
    is_super_admin: bool
    is_tenant_admin: bool
    is_property_admin: bool
    tenant_id: Optional[UUID] = None
    property_id: Optional[UUID] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6, description="New password must be at least 6 characters")