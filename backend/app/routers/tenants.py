from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth
from app.config import settings
import uuid
import shutil
import os

router = APIRouter(prefix="/api/tenants", tags=["Tenants"])

@router.post("/", response_model=schemas.TenantResponse)
async def create_tenant(
    tenant_name: str = Form(...),
    tenant_code: str = Form(...),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    status: Optional[str] = Form("ACTIVE"),
    logo: UploadFile = File(None),  # This will show as file upload button
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_super_admin)
):
    # Check if tenant code already exists
    existing = db.query(models.Tenant).filter(models.Tenant.tenant_code == tenant_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tenant code already exists")
    
    # Save logo if uploaded
    logo_path = None
    if logo and logo.filename:
        upload_dir = "uploads/tenant_logos"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_extension = logo.filename.split(".")[-1] if "." in logo.filename else "png"
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(logo.file, buffer)
        
        logo_path = f"/uploads/tenant_logos/{filename}"
    
    # Create tenant
    db_tenant = models.Tenant(
        tenant_name=tenant_name,
        tenant_code=tenant_code,
        email=email,
        phone=phone,
        logo=logo_path,
        status=status
    )
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    
    # Create tenant admin staff
    staff_password = password if password else settings.DEFAULT_STAFF_PASSWORD
    password_hash = auth.get_password_hash(staff_password)
    
    staff = models.Staff(
        tenant_id=db_tenant.id,
        property_id=None,
        role_id=None,
        employee_code=f"{tenant_code[:3].upper()}ADMIN001",
        name=tenant_name,
        email=email,
        phone=phone,
        password_hash=password_hash,
        is_tenant_admin=True,
        is_property_admin=False,
        status='ACTIVE'
    )
    
    db.add(staff)
    db.commit()
    db.refresh(staff)
    
    return db_tenant

# Rest of the endpoints remain the same...
    return tenant

@router.get("/", response_model=List[schemas.TenantResponse])
async def get_tenants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    # Super admin sees all tenants
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        tenants = db.query(models.Tenant).offset(skip).limit(limit).all()
    else:
        # Tenant admin only sees their tenant
        tenants = db.query(models.Tenant).filter(models.Tenant.id == current_user.tenant_id).all()
    
    return tenants

@router.get("/{tenant_id}", response_model=schemas.TenantResponse)
async def get_tenant(
    tenant_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check access
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return tenant

@router.put("/{tenant_id}", response_model=schemas.TenantResponse)
async def update_tenant(
    tenant_id: uuid.UUID,
    tenant: schemas.TenantUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_super_admin)
):
    db_tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not db_tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Store old values for staff update
    old_email = db_tenant.email
    old_name = db_tenant.tenant_name
    old_phone = db_tenant.phone
    
    # Update tenant
    for key, value in tenant.model_dump(exclude_unset=True).items():
        setattr(db_tenant, key, value)
    
    db.commit()
    db.refresh(db_tenant)
    
    # Update tenant admin staff
    staff = db.query(models.Staff).filter(
        models.Staff.tenant_id == tenant_id,
        models.Staff.is_tenant_admin == True
    ).first()
    
    if staff:
        if db_tenant.email != old_email:
            staff.email = db_tenant.email
        if db_tenant.tenant_name != old_name:
            staff.name = db_tenant.tenant_name
        if db_tenant.phone != old_phone:
            staff.phone = db_tenant.phone
        db.commit()
    
    return db_tenant

@router.delete("/{tenant_id}/logo")
async def delete_tenant_logo(
    tenant_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_super_admin)
):
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    if tenant.logo:
        old_path = tenant.logo.lstrip('/')
        if os.path.exists(old_path):
            os.remove(old_path)
        tenant.logo = None
        db.commit()
    
    return {"message": "Logo deleted successfully"}

@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_super_admin)
):
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    db.delete(tenant)
    db.commit()
    return {"message": "Tenant deleted successfully"}