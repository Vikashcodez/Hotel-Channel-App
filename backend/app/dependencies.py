from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, auth

def get_current_admin_user(current_user: models.User = Depends(auth.get_current_active_user)):
    if current_user.role not in [models.UserRole.SUPER_ADMIN, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

def check_property_access(property_id: int, current_user: models.User = Depends(auth.get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role == models.UserRole.SUPER_ADMIN:
        return True
    
    if current_user.role == models.UserRole.ADMIN:
        if current_user.property_id == property_id:
            return True
        # Check if admin is assigned to the hotel that owns this property
        property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
        if property_obj and property_obj.hotel.admin_user_id == current_user.id:
            return True
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied to this property"
    )