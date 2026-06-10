from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from datetime import datetime
from app.database import get_db
from app import auth, schemas, models
from app.config import settings
import uuid

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Handle super admin
    if isinstance(user, dict) and user.get("is_super_admin"):
        access_token = auth.create_access_token(
            data={"sub": "super_admin", "type": "super_admin"}, 
            expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "staff_id": None,
            "email": user["email"],
            "name": user["name"],
            "is_super_admin": True,
            "is_hotel_admin": False,
            "is_property_admin": False,
            "hotel_id": None,
            "property_id": None
        }
    
    # Handle regular staff
    access_token = auth.create_access_token(
        data={"sub": str(user.id), "type": "staff"}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "staff_id": user.id,
        "email": user.email,
        "name": user.name,
        "is_super_admin": False,
        "is_hotel_admin": user.is_hotel_admin,
        "is_property_admin": user.is_property_admin,
        "hotel_id": user.hotel_id,
        "property_id": user.property_id
    }

@router.post("/change-password")
async def change_password(
    request: schemas.ChangePasswordRequest,
    current_user = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Super admin cannot change password via API (would need to update .env)
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super admin password can only be changed in .env file"
        )
    
    # Regular staff password change
    if not auth.verify_password(request.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    current_user.password_hash = auth.get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.get("/me", response_model=schemas.StaffResponse)
async def get_current_user_info(
    current_user = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Handle super admin
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        return schemas.StaffResponse(
            id=uuid.uuid4(),  # Temporary UUID for response
            name=current_user["name"],
            email=current_user["email"],
            phone=None,
            employee_code="SUPER_ADMIN",
            is_hotel_admin=False,
            is_property_admin=False,
            status="ACTIVE",
            hotel_id=None,
            property_id=None,
            role_id=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            property_name=None,
            role_name=None,
            hotel_name=None
        )
    
    # Handle regular staff
    property_name = None
    if current_user.property_id:
        property_obj = db.query(models.Property).filter(models.Property.id == current_user.property_id).first()
        property_name = property_obj.property_name if property_obj else None
    
    role_name = None
    if current_user.role_id:
        role = db.query(models.Role).filter(models.Role.id == current_user.role_id).first()
        role_name = role.role_name if role else None
    
    hotel_name = None
    if current_user.hotel_id:
        hotel = db.query(models.Hotel).filter(models.Hotel.id == current_user.hotel_id).first()
        hotel_name = hotel.hotel_name if hotel else None
    
    return schemas.StaffResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        employee_code=current_user.employee_code,
        is_hotel_admin=current_user.is_hotel_admin,
        is_property_admin=current_user.is_property_admin,
        status=current_user.status,
        hotel_id=current_user.hotel_id,
        property_id=current_user.property_id,
        role_id=current_user.role_id,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        property_name=property_name,
        role_name=role_name,
        hotel_name=hotel_name
    )