from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth
import uuid

router = APIRouter(prefix="/api/roles", tags=["Roles"])

@router.post("/", response_model=schemas.RoleResponse)
async def create_role(
    role_data: schemas.RoleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    # Check if tenant exists
    tenant = db.query(models.Tenant).filter(models.Tenant.id == role_data.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Check if tenant admin has access to this tenant (for non-super admin)
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != role_data.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this tenant")
    
    # Check if role name already exists in the tenant
    existing = db.query(models.Role).filter(
        models.Role.tenant_id == role_data.tenant_id,
        models.Role.role_name == role_data.role_name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists in this tenant")
    
    db_role = models.Role(**role_data.model_dump())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

@router.get("/", response_model=List[schemas.RoleResponse])
async def get_roles(
    tenant_id: uuid.UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    query = db.query(models.Role)
    
    # Super admin
    if isinstance(current_user, dict) and current_user.get("is_super_admin"):
        if tenant_id:
            query = query.filter(models.Role.tenant_id == tenant_id)
    else:
        # Tenant admin and others - see roles of their tenant
        query = query.filter(models.Role.tenant_id == current_user.tenant_id)
    
    roles = query.offset(skip).limit(limit).all()
    return roles

@router.get("/{role_id}", response_model=schemas.RoleResponse)
async def get_role(
    role_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check access
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != role.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return role

@router.put("/{role_id}", response_model=schemas.RoleResponse)
async def update_role(
    role_id: uuid.UUID,
    role_update: schemas.RoleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check access
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != role.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    for key, value in role_update.model_dump(exclude_unset=True).items():
        setattr(role, key, value)
    
    db.commit()
    db.refresh(role)
    return role

@router.delete("/{role_id}")
async def delete_role(
    role_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_tenant_admin)
):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if any staff members are using this role
    staff_count = db.query(models.Staff).filter(models.Staff.role_id == role_id).count()
    if staff_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete role as it is assigned to {staff_count} staff members")
    
    # Check access
    if not (isinstance(current_user, dict) and current_user.get("is_super_admin")):
        if current_user.tenant_id != role.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(role)
    db.commit()
    return {"message": "Role deleted successfully"}