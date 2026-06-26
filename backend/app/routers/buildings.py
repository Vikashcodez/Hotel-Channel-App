from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
import uuid

router = APIRouter(prefix="/api/buildings", tags=["Buildings"])

@router.post("/", response_model=schemas.BuildingResponse)
async def create_building(
    building: schemas.BuildingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    # Check if tenant exists
    tenant = db.query(models.Tenant).filter(models.Tenant.id == building.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if property exists and belongs to tenant
    property_obj = db.query(models.Property).filter(
        models.Property.id == building.property_id,
        models.Property.tenant_id == building.tenant_id
    ).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found in this tenant")
    
    # Check if building code already exists in the property
    existing = db.query(models.Building).filter(
        models.Building.tenant_id == building.tenant_id,
        models.Building.property_id == building.property_id,
        models.Building.building_code == building.building_code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Building code already exists in this property")
    
    db_building = models.Building(**building.model_dump())
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building

@router.get("/", response_model=List[schemas.BuildingResponse])
async def get_buildings(
    tenant_id: uuid.UUID = None,
    property_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    query = db.query(models.Building)
    
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        if tenant_id:
            query = query.filter(models.Building.tenant_id == tenant_id)
        if property_id:
            query = query.filter(models.Building.property_id == property_id)
    else:
        query = query.filter(models.Building.tenant_id == current_user.tenant_id)
        if property_id:
            query = query.filter(models.Building.property_id == property_id)
    
    buildings = query.offset(skip).limit(limit).all()
    return buildings

@router.get("/{building_id}", response_model=schemas.BuildingResponse)
async def get_building(
    building_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    building = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != building.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return building

@router.put("/{building_id}", response_model=schemas.BuildingResponse)
async def update_building(
    building_id: uuid.UUID,
    building_update: schemas.BuildingUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    building = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != building.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # If property_id is being updated, check if it exists
    if building_update.property_id:
        property_obj = db.query(models.Property).filter(
            models.Property.id == building_update.property_id,
            models.Property.tenant_id == building.tenant_id
        ).first()
        if not property_obj:
            raise HTTPException(status_code=404, detail="Property not found in this tenant")
    
    for key, value in building_update.model_dump(exclude_unset=True).items():
        setattr(building, key, value)
    
    db.commit()
    db.refresh(building)
    return building

@router.delete("/{building_id}")
async def delete_building(
    building_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    building = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != building.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(building)
    db.commit()
    return {"message": "Building deleted successfully"}