from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app import auth, schemas, models
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    staff = auth.authenticate_staff(db, form_data.username, form_data.password)
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(staff.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "staff_id": staff.id,
        "email": staff.email,
        "name": staff.name,
        "is_hotel_admin": staff.is_hotel_admin,
        "is_property_admin": staff.is_property_admin,
        "hotel_id": staff.hotel_id,
        "property_id": staff.property_id
    }

@router.post("/change-password")
async def change_password(
    request: schemas.ChangePasswordRequest,
    current_staff: models.Staff = Depends(auth.get_current_active_staff),
    db: Session = Depends(get_db)
):
    if not auth.verify_password(request.old_password, current_staff.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    current_staff.password_hash = auth.get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.get("/me", response_model=schemas.StaffResponse)
async def get_current_staff_info(
    current_staff: models.Staff = Depends(auth.get_current_active_staff),
    db: Session = Depends(get_db)
):
    # Get property name if exists
    property_name = None
    if current_staff.property_id:
        property_obj = db.query(models.Property).filter(models.Property.id == current_staff.property_id).first()
        property_name = property_obj.property_name if property_obj else None
    
    # Get role name if exists
    role_name = None
    if current_staff.role_id:
        role = db.query(models.Role).filter(models.Role.id == current_staff.role_id).first()
        role_name = role.role_name if role else None
    
    # Get hotel name
    hotel = db.query(models.Hotel).filter(models.Hotel.id == current_staff.hotel_id).first()
    
    return schemas.StaffResponse(
        id=current_staff.id,
        name=current_staff.name,
        email=current_staff.email,
        phone=current_staff.phone,
        employee_code=current_staff.employee_code,
        is_hotel_admin=current_staff.is_hotel_admin,
        is_property_admin=current_staff.is_property_admin,
        status=current_staff.status,
        hotel_id=current_staff.hotel_id,
        property_id=current_staff.property_id,
        role_id=current_staff.role_id,
        created_at=current_staff.created_at,
        updated_at=current_staff.updated_at,
        property_name=property_name,
        role_name=role_name,
        hotel_name=hotel.hotel_name if hotel else None
    )