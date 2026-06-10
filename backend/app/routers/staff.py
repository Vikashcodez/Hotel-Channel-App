from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
from app.config import settings
import uuid

router = APIRouter(prefix="/api/staff", tags=["Staff"])

@router.post("/", response_model=schemas.StaffResponse)
async def create_staff(
    staff_data: schemas.StaffCreate,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_hotel_admin)
):
    # Check if email already exists
    existing = db.query(models.Staff).filter(models.Staff.email == staff_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Check if hotel exists and user has access
    hotel = db.query(models.Hotel).filter(models.Hotel.id == staff_data.hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    # Check access
    if current_staff.email != 'admin@gmail.com' and current_staff.hotel_id != staff_data.hotel_id:
        raise HTTPException(status_code=403, detail="Access denied to this hotel")
    
    # If property_id is provided, check if it exists and belongs to the hotel
    if staff_data.property_id:
        property_obj = db.query(models.Property).filter(
            models.Property.id == staff_data.property_id,
            models.Property.hotel_id == staff_data.hotel_id
        ).first()
        if not property_obj:
            raise HTTPException(status_code=404, detail="Property not found in this hotel")
    
    # If role_id is provided, check if it exists and belongs to the hotel
    if staff_data.role_id:
        role = db.query(models.Role).filter(
            models.Role.id == staff_data.role_id,
            models.Role.hotel_id == staff_data.hotel_id
        ).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found in this hotel")
    
    # Use default password if not provided
    password = staff_data.password or settings.DEFAULT_STAFF_PASSWORD
    password_hash = auth.get_password_hash(password)
    
    # Generate employee code if not provided
    employee_code = staff_data.employee_code
    if not employee_code:
        hotel_prefix = hotel.hotel_code[:3].upper()
        staff_count = db.query(models.Staff).filter(models.Staff.hotel_id == staff_data.hotel_id).count()
        employee_code = f"{hotel_prefix}{staff_count + 1:04d}"
    
    db_staff = models.Staff(
        hotel_id=staff_data.hotel_id,
        property_id=staff_data.property_id,
        role_id=staff_data.role_id,
        employee_code=employee_code,
        name=staff_data.name,
        email=staff_data.email,
        phone=staff_data.phone,
        password_hash=password_hash,
        is_hotel_admin=staff_data.is_hotel_admin,
        is_property_admin=staff_data.is_property_admin,
        status=staff_data.status
    )
    
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    
    # Get response with names
    return await get_staff_response(db_staff, db)

@router.post("/hotel-admin", response_model=schemas.StaffResponse)
async def create_hotel_admin(
    staff_data: schemas.StaffCreate,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_super_admin)
):
    """Super admin can create hotel admins"""
    # Force is_hotel_admin to True
    staff_data.is_hotel_admin = True
    staff_data.is_property_admin = False
    staff_data.property_id = None
    
    return await create_staff(staff_data, db, current_staff)

@router.post("/property-admin", response_model=schemas.StaffResponse)
async def create_property_admin(
    staff_data: schemas.StaffCreate,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_hotel_admin)
):
    """Hotel admin can create property admins for their properties"""
    # Force is_property_admin to True
    staff_data.is_property_admin = True
    staff_data.is_hotel_admin = False
    
    # Ensure property_id is provided
    if not staff_data.property_id:
        raise HTTPException(status_code=400, detail="Property ID is required for property admin")
    
    return await create_staff(staff_data, db, current_staff)

@router.get("/", response_model=List[schemas.StaffResponse])
async def get_staff_list(
    hotel_id: uuid.UUID = None,
    property_id: uuid.UUID = None,
    role_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_active_staff)
):
    query = db.query(models.Staff)
    
    # Super admin
    if current_staff.email == 'admin@gmail.com':
        if hotel_id:
            query = query.filter(models.Staff.hotel_id == hotel_id)
    else:
        # Hotel admin - see staff of their hotel only
        query = query.filter(models.Staff.hotel_id == current_staff.hotel_id)
    
    if property_id:
        query = query.filter(models.Staff.property_id == property_id)
    
    if role_id:
        query = query.filter(models.Staff.role_id == role_id)
    
    staff_list = query.offset(skip).limit(limit).all()
    
    # Get responses with names
    responses = []
    for staff in staff_list:
        responses.append(await get_staff_response(staff, db))
    
    return responses

@router.get("/{staff_id}", response_model=schemas.StaffResponse)
async def get_staff(
    staff_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_active_staff)
):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    # Check access
    if current_staff.email != 'admin@gmail.com' and current_staff.hotel_id != staff.hotel_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return await get_staff_response(staff, db)

@router.put("/{staff_id}", response_model=schemas.StaffResponse)
async def update_staff(
    staff_id: uuid.UUID,
    staff_update: schemas.StaffUpdate,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_hotel_admin)
):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    # Check access
    if current_staff.email != 'admin@gmail.com' and current_staff.hotel_id != staff.hotel_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = staff_update.model_dump(exclude_unset=True)
    
    # Handle password update
    if "password" in update_data and update_data["password"]:
        update_data["password_hash"] = auth.get_password_hash(update_data.pop("password"))
    
    # Handle property assignment
    if "property_id" in update_data:
        if update_data["property_id"]:
            # Check if property belongs to the hotel
            property_obj = db.query(models.Property).filter(
                models.Property.id == update_data["property_id"],
                models.Property.hotel_id == staff.hotel_id
            ).first()
            if not property_obj:
                raise HTTPException(status_code=404, detail="Property not found in this hotel")
    
    # Handle role assignment
    if "role_id" in update_data:
        if update_data["role_id"]:
            role = db.query(models.Role).filter(
                models.Role.id == update_data["role_id"],
                models.Role.hotel_id == staff.hotel_id
            ).first()
            if not role:
                raise HTTPException(status_code=404, detail="Role not found in this hotel")
    
    for key, value in update_data.items():
        setattr(staff, key, value)
    
    db.commit()
    db.refresh(staff)
    
    return await get_staff_response(staff, db)

@router.delete("/{staff_id}")
async def delete_staff(
    staff_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_hotel_admin)
):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    # Cannot delete self
    if staff.id == current_staff.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Check access
    if current_staff.email != 'admin@gmail.com' and current_staff.hotel_id != staff.hotel_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(staff)
    db.commit()
    return {"message": "Staff deleted successfully"}

@router.post("/{staff_id}/reset-password")
async def reset_staff_password(
    staff_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_hotel_admin)
):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    # Check access
    if current_staff.email != 'admin@gmail.com' and current_staff.hotel_id != staff.hotel_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Reset to default password
    staff.password_hash = auth.get_password_hash(settings.DEFAULT_STAFF_PASSWORD)
    db.commit()
    
    return {"message": f"Password reset to default: {settings.DEFAULT_STAFF_PASSWORD}"}

async def get_staff_response(staff: models.Staff, db: Session):
    # Get property name
    property_name = None
    if staff.property_id:
        property_obj = db.query(models.Property).filter(models.Property.id == staff.property_id).first()
        property_name = property_obj.property_name if property_obj else None
    
    # Get role name
    role_name = None
    if staff.role_id:
        role = db.query(models.Role).filter(models.Role.id == staff.role_id).first()
        role_name = role.role_name if role else None
    
    # Get hotel name
    hotel = db.query(models.Hotel).filter(models.Hotel.id == staff.hotel_id).first()
    
    return schemas.StaffResponse(
        id=staff.id,
        name=staff.name,
        email=staff.email,
        phone=staff.phone,
        employee_code=staff.employee_code,
        is_hotel_admin=staff.is_hotel_admin,
        is_property_admin=staff.is_property_admin,
        status=staff.status,
        hotel_id=staff.hotel_id,
        property_id=staff.property_id,
        role_id=staff.role_id,
        created_at=staff.created_at,
        updated_at=staff.updated_at,
        property_name=property_name,
        role_name=role_name,
        hotel_name=hotel.hotel_name if hotel else None
    )