from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Hotel(Base):
    __tablename__ = "hotels"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hotel_name = Column(String(255), nullable=False)
    hotel_code = Column(String(50), unique=True, nullable=False)
    email = Column(String(255))
    phone = Column(String(20))
    logo = Column(Text)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    properties = relationship("Property", back_populates="hotel", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="hotel", cascade="all, delete-orphan")
    roles = relationship("Role", back_populates="hotel", cascade="all, delete-orphan")

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hotel_id = Column(UUID(as_uuid=True), ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
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
    hotel = relationship("Hotel", back_populates="properties")
    staff = relationship("Staff", back_populates="property")

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hotel_id = Column(UUID(as_uuid=True), ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    role_name = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    hotel = relationship("Hotel", back_populates="roles")
    staff = relationship("Staff", back_populates="role")

class Staff(Base):
    __tablename__ = "staff"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hotel_id = Column(UUID(as_uuid=True), ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="SET NULL"), nullable=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    employee_code = Column(String(50))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    password_hash = Column(Text, nullable=False)
    is_hotel_admin = Column(Boolean, default=False)
    is_property_admin = Column(Boolean, default=False)
    status = Column(String(20), default='ACTIVE')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    hotel = relationship("Hotel", back_populates="staff")
    property = relationship("Property", back_populates="staff")
    role = relationship("Role", back_populates="staff")