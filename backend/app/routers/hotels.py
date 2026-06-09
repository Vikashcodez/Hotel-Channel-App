from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/hotels", tags=["Hotels"])

@router.post("/", response_model=schemas.HotelResponse)
async def create_hotel(
    hotel: schemas.HotelCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_super_admin)
):
    db_hotel = models.Hotel(**hotel.model_dump())
    db.add(db_hotel)
    db.commit()
    db.refresh(db_hotel)
    return db_hotel

@router.get("/", response_model=List[schemas.HotelResponse])
async def get_hotels(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    hotels = db.query(models.Hotel).offset(skip).limit(limit).all()
    
    # Add properties count
    for hotel in hotels:
        hotel.properties_count = db.query(models.Property).filter(models.Property.hotel_id == hotel.id).count()
    
    return hotels

@router.get("/{hotel_id}", response_model=schemas.HotelResponse)
async def get_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    hotel.properties_count = db.query(models.Property).filter(models.Property.hotel_id == hotel.id).count()
    return hotel

@router.put("/{hotel_id}", response_model=schemas.HotelResponse)
async def update_hotel(
    hotel_id: int,
    hotel_update: schemas.HotelUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_super_admin)
):
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    for key, value in hotel_update.model_dump(exclude_unset=True).items():
        setattr(hotel, key, value)
    
    db.commit()
    db.refresh(hotel)
    return hotel

@router.delete("/{hotel_id}")
async def delete_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_super_admin)
):
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    db.delete(hotel)
    db.commit()
    return {"message": "Hotel deleted successfully"}