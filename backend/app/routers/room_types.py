from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
import uuid

router = APIRouter(prefix="/api/room-types", tags=["Room Types"])

@router.post("/", response_model=schemas.RoomTypeResponse)
async def create_room_type(
    room_type: schemas.RoomTypeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    # Check if tenant exists
    tenant = db.query(models.Tenant).filter(models.Tenant.id == room_type.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if property exists and belongs to tenant
    property_obj = db.query(models.Property).filter(
        models.Property.id == room_type.property_id,
        models.Property.tenant_id == room_type.tenant_id
    ).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found in this tenant")
    
    # Check if room type code already exists in the property
    existing = db.query(models.RoomType).filter(
        models.RoomType.tenant_id == room_type.tenant_id,
        models.RoomType.property_id == room_type.property_id,
        models.RoomType.room_type_code == room_type.room_type_code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room type code already exists in this property")
    
    db_room_type = models.RoomType(**room_type.model_dump())
    db.add(db_room_type)
    db.commit()
    db.refresh(db_room_type)
    return db_room_type

@router.get("/", response_model=List[schemas.RoomTypeResponse])
async def get_room_types(
    tenant_id: uuid.UUID = None,
    property_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    query = db.query(models.RoomType)
    
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        if tenant_id:
            query = query.filter(models.RoomType.tenant_id == tenant_id)
        if property_id:
            query = query.filter(models.RoomType.property_id == property_id)
    else:
        query = query.filter(models.RoomType.tenant_id == current_user.tenant_id)
        if property_id:
            query = query.filter(models.RoomType.property_id == property_id)
    
    room_types = query.offset(skip).limit(limit).all()
    return room_types

@router.get("/{room_type_id}", response_model=schemas.RoomTypeResponse)
async def get_room_type(
    room_type_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    room_type = db.query(models.RoomType).filter(models.RoomType.id == room_type_id).first()
    if not room_type:
        raise HTTPException(status_code=404, detail="Room type not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != room_type.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return room_type

@router.put("/{room_type_id}", response_model=schemas.RoomTypeResponse)
async def update_room_type(
    room_type_id: uuid.UUID,
    room_type_update: schemas.RoomTypeUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    room_type = db.query(models.RoomType).filter(models.RoomType.id == room_type_id).first()
    if not room_type:
        raise HTTPException(status_code=404, detail="Room type not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != room_type.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # If property_id is being updated, check if it exists
    if room_type_update.property_id:
        property_obj = db.query(models.Property).filter(
            models.Property.id == room_type_update.property_id,
            models.Property.tenant_id == room_type.tenant_id
        ).first()
        if not property_obj:
            raise HTTPException(status_code=404, detail="Property not found in this tenant")
    
    for key, value in room_type_update.model_dump(exclude_unset=True).items():
        setattr(room_type, key, value)
    
    db.commit()
    db.refresh(room_type)
    return room_type

@router.delete("/{room_type_id}")
async def delete_room_type(
    room_type_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    room_type = db.query(models.RoomType).filter(models.RoomType.id == room_type_id).first()
    if not room_type:
        raise HTTPException(status_code=404, detail="Room type not found")
    
    # Check if any rooms are using this room type
    rooms_count = db.query(models.Room).filter(models.Room.room_type_id == room_type_id).count()
    if rooms_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete room type as it is assigned to {rooms_count} rooms")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != room_type.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(room_type)
    db.commit()
    return {"message": "Room type deleted successfully"}