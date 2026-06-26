from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
import uuid

router = APIRouter(prefix="/api/floors", tags=["Floors"])

@router.post("/", response_model=schemas.FloorResponse)
async def create_floor(
    floor: schemas.FloorCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    # Check if tenant exists
    tenant = db.query(models.Tenant).filter(models.Tenant.id == floor.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if property exists and belongs to tenant
    property_obj = db.query(models.Property).filter(
        models.Property.id == floor.property_id,
        models.Property.tenant_id == floor.tenant_id
    ).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found in this tenant")
    
    # Check if building exists and belongs to tenant and property
    building = db.query(models.Building).filter(
        models.Building.id == floor.building_id,
        models.Building.tenant_id == floor.tenant_id,
        models.Building.property_id == floor.property_id
    ).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found in this property")
    
    # Check if floor code already exists in the building
    existing = db.query(models.Floor).filter(
        models.Floor.tenant_id == floor.tenant_id,
        models.Floor.building_id == floor.building_id,
        models.Floor.floor_code == floor.floor_code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Floor code already exists in this building")
    
    db_floor = models.Floor(**floor.model_dump())
    db.add(db_floor)
    db.commit()
    db.refresh(db_floor)
    return db_floor

@router.get("/", response_model=List[schemas.FloorResponse])
async def get_floors(
    tenant_id: uuid.UUID = None,
    property_id: uuid.UUID = None,
    building_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    query = db.query(models.Floor)
    
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        if tenant_id:
            query = query.filter(models.Floor.tenant_id == tenant_id)
        if property_id:
            query = query.filter(models.Floor.property_id == property_id)
        if building_id:
            query = query.filter(models.Floor.building_id == building_id)
    else:
        query = query.filter(models.Floor.tenant_id == current_user.tenant_id)
        if property_id:
            query = query.filter(models.Floor.property_id == property_id)
        if building_id:
            query = query.filter(models.Floor.building_id == building_id)
    
    floors = query.offset(skip).limit(limit).all()
    return floors

@router.get("/{floor_id}", response_model=schemas.FloorResponse)
async def get_floor(
    floor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    floor = db.query(models.Floor).filter(models.Floor.id == floor_id).first()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != floor.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return floor

@router.put("/{floor_id}", response_model=schemas.FloorResponse)
async def update_floor(
    floor_id: uuid.UUID,
    floor_update: schemas.FloorUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    floor = db.query(models.Floor).filter(models.Floor.id == floor_id).first()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != floor.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # If property_id is being updated, check if it exists
    if floor_update.property_id:
        property_obj = db.query(models.Property).filter(
            models.Property.id == floor_update.property_id,
            models.Property.tenant_id == floor.tenant_id
        ).first()
        if not property_obj:
            raise HTTPException(status_code=404, detail="Property not found in this tenant")
    
    # If building_id is being updated, check if it exists
    if floor_update.building_id:
        building = db.query(models.Building).filter(
            models.Building.id == floor_update.building_id,
            models.Building.tenant_id == floor.tenant_id
        ).first()
        if not building:
            raise HTTPException(status_code=404, detail="Building not found in this tenant")
    
    for key, value in floor_update.model_dump(exclude_unset=True).items():
        setattr(floor, key, value)
    
    db.commit()
    db.refresh(floor)
    return floor

@router.delete("/{floor_id}")
async def delete_floor(
    floor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    floor = db.query(models.Floor).filter(models.Floor.id == floor_id).first()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != floor.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(floor)
    db.commit()
    return {"message": "Floor deleted successfully"}