from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, auth

def get_hotel_by_id(hotel_id: str, db: Session = Depends(get_db)):
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel

def get_property_by_id(property_id: str, db: Session = Depends(get_db)):
    property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_obj

def get_role_by_id(role_id: str, db: Session = Depends(get_db)):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

def get_staff_by_id(staff_id: str, db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff

def check_hotel_access(hotel_id: str, current_user = Depends(auth.get_current_active_user), db: Session = Depends(get_db)):
    # Super admin can access all hotels
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        return True
    
    # Hotel admin can only access their own hotel
    if hasattr(current_user, 'is_hotel_admin') and current_user.is_hotel_admin:
        if str(current_user.hotel_id) == hotel_id:
            return True
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied to this hotel"
    )

def check_property_access(property_id: str, current_user = Depends(auth.get_current_active_user), db: Session = Depends(get_db)):
    # Super admin can access all properties
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        return True
    
    # Hotel admin can access properties of their hotel
    if hasattr(current_user, 'is_hotel_admin') and current_user.is_hotel_admin:
        property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
        if property_obj and str(property_obj.hotel_id) == str(current_user.hotel_id):
            return True
    
    # Property admin can access their assigned property
    if hasattr(current_user, 'is_property_admin') and current_user.is_property_admin:
        if str(current_user.property_id) == property_id:
            return True
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied to this property"
    )