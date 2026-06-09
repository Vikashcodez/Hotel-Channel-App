from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, get_db, Base
from app import models, auth, schemas
from app.routers import auth as auth_router, hotels, properties, users
from app.config import settings

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
app.include_router(users.router)

@app.on_event("startup")
async def startup_event():
    """Create super admin on startup if not exists"""
    db = next(get_db())
    
    # Check if super admin exists
    super_admin = db.query(models.User).filter(
        models.User.email == settings.SUPER_ADMIN_EMAIL
    ).first()
    
    if not super_admin:
        hashed_password = auth.get_password_hash(settings.SUPER_ADMIN_PASSWORD)
        super_admin = models.User(
            email=settings.SUPER_ADMIN_EMAIL,
            username=settings.SUPER_ADMIN_USERNAME,
            password_hash=hashed_password,
            full_name="System Super Admin",
            role=models.UserRole.SUPER_ADMIN,
            is_active=True
        )
        db.add(super_admin)
        db.commit()
        print(f"Super admin created: {settings.SUPER_ADMIN_EMAIL} / {settings.SUPER_ADMIN_PASSWORD}")

@app.get("/")
async def root():
    return {"message": "PMS Management System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}