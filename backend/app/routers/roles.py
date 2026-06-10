from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
import uuid

router = APIRouter(prefix="/api/roles", tags=["Roles"])

@router.post("/", response_model=schemas.RoleResponse)
async def create_role(
    role_data: schemas.RoleCreate,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_hotel_admin)
):
    # Check if hotel exists and user has access
    hotel = db.query(models.Hotel).filter(models.Hotel.id == role_data.hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    # Check if hotel admin has access to this hotel
    if current_staff.email != 'admin@gmail.com' and current_staff.hotel_id != role_data.hotel_id:
        raise HTTPException(status_code=403, detail="Access denied to this hotel")
    
    # Check if role name already exists in the hotel
    existing = db.query(models.Role).filter(
        models.Role.hotel_id == role_data.hotel_id,
        models.Role.role_name == role_data.role_name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists in this hotel")
    
    db_role = models.Role(**role_data.model_dump())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.get("/", response_model=List[schemas.RoleResponse])
async def get_roles(
    hotel_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_active_staff)
):
    query = db.query(models.Role)
    
    # Super admin
    if current_staff.email == 'admin@gmail.com':
        if hotel_id:
            query = query.filter(models.Role.hotel_id == hotel_id)
    else:
        # Hotel admin and others - see roles of their hotel
        query = query.filter(models.Role.hotel_id == current_staff.hotel_id)
    
    roles = query.offset(skip).limit(limit).all()
    return roles

@router.get("/{role_id}", response_model=schemas.RoleResponse)
async def get_role(
    role_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_active_staff)
):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check access
    if current_staff.email != 'admin@gmail.com' and current_staff.hotel_id != role.hotel_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return role

@router.put("/{role_id}", response_model=schemas.RoleResponse)
async def update_role(
    role_id: uuid.UUID,
    role_update: schemas.RoleUpdate,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_hotel_admin)
):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check access
    if current_staff.email != 'admin@gmail.com' and current_staff.hotel_id != role.hotel_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in role_update.model_dump(exclude_unset=True).items():
        setattr(role, key, value)
    
    db.commit()
    db.refresh(role)
    return role

@router.delete("/{role_id}")
async def delete_role(
    role_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_staff: models.Staff = Depends(auth.get_current_hotel_admin)
):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if any staff members are using this role
    staff_count = db.query(models.Staff).filter(models.Staff.role_id == role_id).count()
    if staff_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete role as it is assigned to {staff_count} staff members")
    
    # Check access
    if current_staff.email != 'admin@gmail.com' and current_staff.hotel_id != role.hotel_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(role)
    db.commit()
    return {"message": "Role deleted successfully"}