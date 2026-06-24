from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
import uuid

router = APIRouter(prefix="/api/tenants", tags=["Tenants"])

@router.post("/", response_model=schemas.TenantResponse)
async def create_tenant(
    tenant: schemas.TenantCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_super_admin)
):
    # Check if tenant code already exists
    existing = db.query(models.Tenant).filter(models.Tenant.tenant_code == tenant.tenant_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tenant code already exists")
    
    db_tenant = models.Tenant(**tenant.model_dump())
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

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
    tenant_update: schemas.TenantUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_super_admin)
):
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    for key, value in tenant_update.model_dump(exclude_unset=True).items():
        setattr(tenant, key, value)
    
    db.commit()
    db.refresh(tenant)
    return tenant

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