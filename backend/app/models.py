from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_name = Column(String(255), nullable=False)
    tenant_code = Column(String(50), unique=True, nullable=False)
    email = Column(String(255))
    phone = Column(String(20))
    logo = Column(Text)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    properties = relationship("Property", back_populates="tenant", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="tenant", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="tenant", cascade="all, delete-orphan")

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    property_name = Column(String(255), nullable=False)
    property_code = Column(String(50), nullable=False)
    is_main_branch = Column(Boolean, default=False)
    gst_number = Column(String(50))
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))
    pincode = Column(String(20))
    total_floors = Column(Integer, default=0)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant", back_populates="properties")
    staff = relationship("Staff", back_populates="property")

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    role_name = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant", back_populates="roles")
    staff = relationship("Staff", back_populates="role")

class Staff(Base):
    __tablename__ = "staff"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="SET NULL"), nullable=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    employee_code = Column(String(50))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    password_hash = Column(Text, nullable=False)
    is_tenant_admin = Column(Boolean, default=False)
    is_property_admin = Column(Boolean, default=False)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Building(Base):
    __tablename__ = "buildings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    building_name = Column(String(255), nullable=False)
    building_code = Column(String(50), nullable=False)
    total_floors = Column(Integer, default=0)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Floor(Base):
    __tablename__ = "floors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    building_id = Column(UUID(as_uuid=True), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    floor_name = Column(String(255), nullable=False)
    floor_code = Column(String(50), nullable=False)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class RoomType(Base):
    __tablename__ = "room_types"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    room_type_name = Column(String(255), nullable=False)
    room_type_code = Column(String(50), nullable=False)
    description = Column(Text)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    floor_id = Column(UUID(as_uuid=True), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False)
    room_type_id = Column(UUID(as_uuid=True), ForeignKey("room_types.id", ondelete="CASCADE"), nullable=False)
    room_name = Column(String(255), nullable=False)
    room_code = Column(String(50), nullable=False)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    tenant = relationship("Tenant", back_populates="staff")
    property = relationship("Property", back_populates="staff")
    role = relationship("Role", back_populates="staff")
    