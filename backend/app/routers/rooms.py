from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
import uuid

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

@router.post("/", response_model=schemas.RoomResponse)
async def create_room(
    room: schemas.RoomCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    # Check if tenant exists
    tenant = db.query(models.Tenant).filter(models.Tenant.id == room.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if property exists and belongs to tenant
    property_obj = db.query(models.Property).filter(
        models.Property.id == room.property_id,
        models.Property.tenant_id == room.tenant_id
    ).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found in this tenant")
    
    # Check if floor exists and belongs to tenant and property
    floor = db.query(models.Floor).filter(
        models.Floor.id == room.floor_id,
        models.Floor.tenant_id == room.tenant_id,
        models.Floor.property_id == room.property_id
    ).first()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found in this property")
    
    # Check if room type exists and belongs to tenant and property
    room_type = db.query(models.RoomType).filter(
        models.RoomType.id == room.room_type_id,
        models.RoomType.tenant_id == room.tenant_id,
        models.RoomType.property_id == room.property_id
    ).first()
    if not room_type:
        raise HTTPException(status_code=404, detail="Room type not found in this property")
    
    # Check if room code already exists in the floor
    existing = db.query(models.Room).filter(
        models.Room.tenant_id == room.tenant_id,
        models.Room.floor_id == room.floor_id,
        models.Room.room_code == room.room_code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room code already exists in this floor")
    
    db_room = models.Room(**room.model_dump())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@router.get("/", response_model=List[schemas.RoomResponse])
async def get_rooms(
    tenant_id: uuid.UUID = None,
    property_id: uuid.UUID = None,
    floor_id: uuid.UUID = None,
    room_type_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    query = db.query(models.Room)
    
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        if tenant_id:
            query = query.filter(models.Room.tenant_id == tenant_id)
        if property_id:
            query = query.filter(models.Room.property_id == property_id)
        if floor_id:
            query = query.filter(models.Room.floor_id == floor_id)
        if room_type_id:
            query = query.filter(models.Room.room_type_id == room_type_id)
    else:
        query = query.filter(models.Room.tenant_id == current_user.tenant_id)
        if property_id:
            query = query.filter(models.Room.property_id == property_id)
        if floor_id:
            query = query.filter(models.Room.floor_id == floor_id)
        if room_type_id:
            query = query.filter(models.Room.room_type_id == room_type_id)
    
    rooms = query.offset(skip).limit(limit).all()
    return rooms

@router.get("/{room_id}", response_model=schemas.RoomResponse)
async def get_room(
    room_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != room.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return room

@router.put("/{room_id}", response_model=schemas.RoomResponse)
async def update_room(
    room_id: uuid.UUID,
    room_update: schemas.RoomUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != room.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # If property_id is being updated, check if it exists
    if room_update.property_id:
        property_obj = db.query(models.Property).filter(
            models.Property.id == room_update.property_id,
            models.Property.tenant_id == room.tenant_id
        ).first()
        if not property_obj:
            raise HTTPException(status_code=404, detail="Property not found in this tenant")
    
    # If floor_id is being updated, check if it exists
    if room_update.floor_id:
        floor = db.query(models.Floor).filter(
            models.Floor.id == room_update.floor_id,
            models.Floor.tenant_id == room.tenant_id
        ).first()
        if not floor:
            raise HTTPException(status_code=404, detail="Floor not found in this tenant")
    
    # If room_type_id is being updated, check if it exists
    if room_update.room_type_id:
        room_type = db.query(models.RoomType).filter(
            models.RoomType.id == room_update.room_type_id,
            models.RoomType.tenant_id == room.tenant_id
        ).first()
        if not room_type:
            raise HTTPException(status_code=404, detail="Room type not found in this tenant")
    
    for key, value in room_update.model_dump(exclude_unset=True).items():
        setattr(room, key, value)
    
    db.commit()
    db.refresh(room)
    return room

@router.delete("/{room_id}")
async def delete_room(
    room_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != room.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}