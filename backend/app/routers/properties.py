from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/properties", tags=["Properties"])

@router.post("/", response_model=schemas.PropertyResponse)
async def create_property(
    property_data: schemas.PropertyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_super_admin)
):
    # Check if hotel exists
    hotel = db.query(models.Hotel).filter(models.Hotel.id == property_data.hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    db_property = models.Property(**property_data.model_dump())
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.get("/", response_model=List[schemas.PropertyResponse])
async def get_properties(
    hotel_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Property)
    
    if hotel_id:
        query = query.filter(models.Property.hotel_id == hotel_id)
    
    # Filter by user access
    if current_user.role == models.UserRole.ADMIN:
        if current_user.property_id:
            query = query.filter(models.Property.id == current_user.property_id)
    
    properties = query.offset(skip).limit(limit).all()
    
    # Add users count
    for prop in properties:
        prop.users_count = db.query(models.User).filter(models.User.property_id == prop.id).count()
    
    return properties

@router.get("/{property_id}", response_model=schemas.PropertyResponse)
async def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check access
    if current_user.role == models.UserRole.ADMIN:
        if current_user.property_id != property_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    property_obj.users_count = db.query(models.User).filter(models.User.property_id == property_id).count()
    return property_obj

@router.put("/{property_id}", response_model=schemas.PropertyResponse)
async def update_property(
    property_id: int,
    property_update: schemas.PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_super_admin)
):
    property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    for key, value in property_update.model_dump(exclude_unset=True).items():
        setattr(property_obj, key, value)
    
    db.commit()
    db.refresh(property_obj)
    return property_obj

@router.delete("/{property_id}")
async def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_super_admin)
):
    property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    db.delete(property_obj)
    db.commit()
    return {"message": "Property deleted successfully"}