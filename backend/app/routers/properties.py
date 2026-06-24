from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
import uuid

router = APIRouter(prefix="/api/properties", tags=["Properties"])

@router.post("/", response_model=schemas.PropertyResponse)
async def create_property(
    property_data: schemas.PropertyCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    # Check if tenant exists
    tenant = db.query(models.Tenant).filter(models.Tenant.id == property_data.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if tenant admin has access to this tenant (for non-super admin)
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != property_data.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this tenant")
    
    # Check if property code already exists in the tenant
    existing = db.query(models.Property).filter(
        models.Property.tenant_id == property_data.tenant_id,
        models.Property.property_code == property_data.property_code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Property code already exists in this tenant")
    
    db_property = models.Property(**property_data.model_dump())
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.get("/", response_model=List[schemas.PropertyResponse])
async def get_properties(
    tenant_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    query = db.query(models.Property)
    
    # Super admin
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        if tenant_id:
            query = query.filter(models.Property.tenant_id == tenant_id)
    # Tenant admin - see properties of their tenant
    elif hasattr(current_user, 'is_tenant_admin') and current_user.is_tenant_admin:
        query = query.filter(models.Property.tenant_id == current_user.tenant_id)
    # Property admin - see only their property
    elif hasattr(current_user, 'is_property_admin') and current_user.is_property_admin:
        query = query.filter(models.Property.id == current_user.property_id)
    else:
        # Regular staff - see properties of their tenant
        query = query.filter(models.Property.tenant_id == current_user.tenant_id)
    
    properties = query.offset(skip).limit(limit).all()
    
    # Add staff count
    for prop in properties:
        prop.staff_count = db.query(models.Staff).filter(models.Staff.property_id == prop.id).count()
    
    return properties

@router.get("/{property_id}", response_model=schemas.PropertyResponse)
async def get_property(
    property_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check access
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if hasattr(current_user, 'is_tenant_admin') and current_user.is_tenant_admin:
            if current_user.tenant_id != property_obj.tenant_id:
                raise HTTPException(status_code=403, detail="Access denied")
        elif hasattr(current_user, 'is_property_admin') and current_user.is_property_admin:
            if current_user.property_id != property_id:
                raise HTTPException(status_code=403, detail="Access denied")
    
    property_obj.staff_count = db.query(models.Staff).filter(models.Staff.property_id == property_id).count()
    return property_obj

@router.put("/{property_id}", response_model=schemas.PropertyResponse)
async def update_property(
    property_id: uuid.UUID,
    property_update: schemas.PropertyUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check access
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != property_obj.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in property_update.model_dump(exclude_unset=True).items():
        setattr(property_obj, key, value)
    
    db.commit()
    db.refresh(property_obj)
    return property_obj

@router.delete("/{property_id}")
async def delete_property(
    property_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check access
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != property_obj.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(property_obj)
    db.commit()
    return {"message": "Property deleted successfully"}