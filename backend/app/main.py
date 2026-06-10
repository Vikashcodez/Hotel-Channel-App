from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, get_db, Base
from app import models, auth
from app.routers import auth as auth_router, hotels, properties, roles, staff
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, debug=settings.DEBUG)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(hotels.router)
app.include_router(properties.router)
app.include_router(roles.router)
app.include_router(staff.router)

@app.on_event("startup")
async def startup_event():
    """Create super admin on startup if not exists"""
    try:
        db = next(get_db())
        
        # Check if super admin exists
        super_admin = db.query(models.Staff).filter(
            models.Staff.email == settings.SUPER_ADMIN_EMAIL
        ).first()
        
        if not super_admin:
            logger.info("Creating super admin user...")
            
            # Create a default hotel for super admin if needed
            default_hotel = db.query(models.Hotel).first()
            if not default_hotel:
                default_hotel = models.Hotel(
                    hotel_name="System Hotel",
                    hotel_code="SYS001",
                    email=settings.SUPER_ADMIN_EMAIL,
                    status="ACTIVE"
                )
                db.add(default_hotel)
                db.commit()
                db.refresh(default_hotel)
            
            hashed_password = auth.get_password_hash(settings.SUPER_ADMIN_PASSWORD)
            super_admin = models.Staff(
                hotel_id=default_hotel.id,
                name="System Super Admin",
                email=settings.SUPER_ADMIN_EMAIL,
                employee_code="SUPER001",
                password_hash=hashed_password,
                is_hotel_admin=False,
                is_property_admin=False,
                status="ACTIVE"
            )
            db.add(super_admin)
            db.commit()
            logger.info(f"Super admin created successfully: {settings.SUPER_ADMIN_EMAIL}")
        else:
            logger.info("Super admin already exists")
            
    except Exception as e:
        logger.error(f"Startup error: {e}")
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "PMS Management System API", "version": settings.APP_VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}