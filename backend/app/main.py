from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.database import engine, Base
from app.routers import auth as auth_router, tenants, properties, roles, staff
from app.routers import buildings, floors, room_types, rooms
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded logos
os.makedirs("uploads/tenant_logos", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth_router.router)
app.include_router(tenants.router)
app.include_router(properties.router)
app.include_router(roles.router)
app.include_router(staff.router)
app.include_router(buildings.router)
app.include_router(floors.router)
app.include_router(room_types.router)
app.include_router(rooms.router)

@app.on_event("startup")
async def startup_event():
    logger.info(f"PMS System starting with super admin from .env: {settings.SUPER_ADMIN_EMAIL}")

@app.get("/")
async def root():
    return {"message": "PMS Management System API", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}