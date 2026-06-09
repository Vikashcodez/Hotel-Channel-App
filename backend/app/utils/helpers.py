from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import re
import json
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def validate_email(email: str) -> bool:
    """
    Validate email format using regex
    """
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None

def validate_phone(phone: str) -> bool:
    """
    Validate phone number format (supports international numbers)
    """
    # Remove spaces, dashes, parentheses, and plus sign
    cleaned = re.sub(r'[\s\-\(\)\+]', '', phone)
    # Check if it contains only digits and has reasonable length
    return cleaned.isdigit() and 8 <= len(cleaned) <= 15

def generate_slug(text: str) -> str:
    """
    Generate a URL-friendly slug from text
    """
    # Convert to lowercase
    slug = text.lower()
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    # Remove special characters
    slug = re.sub(r'[^\w\-]', '', slug)
    # Remove multiple hyphens
    slug = re.sub(r'-+', '-', slug)
    # Trim hyphens from start and end
    slug = slug.strip('-')
    return slug

def paginate(query, page: int = 1, page_size: int = 20):
    """
    Paginate SQLAlchemy query results
    """
    offset = (page - 1) * page_size
    total = query.count()
    items = query.offset(offset).limit(page_size).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
        "has_next": offset + page_size < total,
        "has_previous": page > 1
    }

def format_date_range(start_date: datetime, end_date: datetime) -> Dict[str, str]:
    """
    Format date range for display
    """
    return {
        "start": start_date.strftime("%Y-%m-%d %H:%M:%S"),
        "end": end_date.strftime("%Y-%m-%d %H:%M:%S"),
        "duration_days": (end_date - start_date).days,
        "duration_hours": (end_date - start_date).total_seconds() / 3600
    }

def calculate_priority_score(priority: int, max_priority: int = 100) -> float:
    """
    Calculate normalized priority score (0 to 1)
    """
    if priority <= 0:
        return 0.0
    if priority >= max_priority:
        return 1.0
    return priority / max_priority

def filter_by_priority(properties, min_priority: Optional[int] = None, max_priority: Optional[int] = None):
    """
    Filter properties by priority range
    """
    filtered = properties
    
    if min_priority is not None:
        filtered = [p for p in filtered if p.priority >= min_priority]
    
    if max_priority is not None:
        filtered = [p for p in filtered if p.priority <= max_priority]
    
    return sorted(filtered, key=lambda x: x.priority, reverse=True)

def mask_email(email: str) -> str:
    """
    Mask email for privacy (e.g., u***r@example.com)
    """
    if not email or '@' not in email:
        return email
    
    local_part, domain = email.split('@', 1)
    
    if len(local_part) <= 2:
        masked_local = local_part[0] + '***'
    else:
        masked_local = local_part[0] + '***' + local_part[-1]
    
    return f"{masked_local}@{domain}"

def mask_phone(phone: str) -> str:
    """
    Mask phone number for privacy (e.g., +91*****1234)
    """
    if not phone:
        return phone
    
    # Remove spaces and special characters
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    
    if len(cleaned) <= 4:
        return '***' + cleaned[-2:] if len(cleaned) >= 2 else '***'
    
    # Show last 4 digits
    return '*' * (len(cleaned) - 4) + cleaned[-4:]

def generate_random_id(prefix: str = "", length: int = 8) -> str:
    """
    Generate a random ID with optional prefix
    """
    import random
    import string
    
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    
    if prefix:
        return f"{prefix}_{random_part}"
    return random_part

def validate_password_strength(password: str) -> Dict[str, Any]:
    """
    Validate password strength and return details
    """
    score = 0
    feedback = []
    
    # Length check
    if len(password) >= 8:
        score += 1
    else:
        feedback.append("Password should be at least 8 characters long")
    
    # Uppercase check
    if re.search(r'[A-Z]', password):
        score += 1
    else:
        feedback.append("Password should contain at least one uppercase letter")
    
    # Lowercase check
    if re.search(r'[a-z]', password):
        score += 1
    else:
        feedback.append("Password should contain at least one lowercase letter")
    
    # Digit check
    if re.search(r'\d', password):
        score += 1
    else:
        feedback.append("Password should contain at least one number")
    
    # Special character check
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
    else:
        feedback.append("Password should contain at least one special character")
    
    # Determine strength
    if score <= 2:
        strength = "Weak"
    elif score <= 4:
        strength = "Medium"
    else:
        strength = "Strong"
    
    return {
        "score": score,
        "max_score": 5,
        "strength": strength,
        "is_strong": score >= 4,
        "feedback": feedback
    }

def log_audit_event(
    db: Session,
    user_id: int,
    action: str,
    resource_type: str,
    resource_id: Optional[int] = None,
    details: Optional[Dict] = None,
    ip_address: Optional[str] = None
):
    """
    Log audit events for tracking user actions
    """
    # Note: You'll need to create an AuditLog model for this
    # This is a placeholder for the logging functionality
    audit_entry = {
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": json.dumps(details) if details else None,
        "ip_address": ip_address,
        "timestamp": datetime.utcnow()
    }
    
    # In a real implementation, you would save this to database
    # db_audit = models.AuditLog(**audit_entry)
    # db.add(db_audit)
    # db.commit()
    
    # For now, just print (you can replace with actual logging)
    print(f"AUDIT: {audit_entry}")
    
    return audit_entry

def validate_property_ownership(
    db: Session,
    property_id: int,
    user_id: int
) -> bool:
    """
    Check if user owns or has access to a property
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        return False
    
    # Super admin has access to all
    if user.role == models.UserRole.SUPER_ADMIN:
        return True
    
    # Check direct property assignment
    if user.property_id == property_id:
        return True
    
    # Check if user is admin of hotel that owns the property
    property_obj = db.query(models.Property).filter(models.Property.id == property_id).first()
    if property_obj and property_obj.hotel.admin_user_id == user_id:
        return True
    
    return False

def calculate_usage_statistics(db: Session) -> Dict[str, Any]:
    """
    Calculate system usage statistics
    """
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    total_hotels = db.query(models.Hotel).count()
    active_hotels = db.query(models.Hotel).filter(models.Hotel.is_active == True).count()
    total_properties = db.query(models.Property).count()
    active_properties = db.query(models.Property).filter(models.Property.is_active == True).count()
    
    # Count by roles
    super_admins = db.query(models.User).filter(models.User.role == models.UserRole.SUPER_ADMIN).count()
    admins = db.query(models.User).filter(models.User.role == models.UserRole.ADMIN).count()
    staff = db.query(models.User).filter(models.User.role == models.UserRole.STAFF).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": total_users - active_users,
            "by_role": {
                "super_admin": super_admins,
                "admin": admins,
                "staff": staff
            }
        },
        "hotels": {
            "total": total_hotels,
            "active": active_hotels,
            "inactive": total_hotels - active_hotels
        },
        "properties": {
            "total": total_properties,
            "active": active_properties,
            "inactive": total_properties - active_properties
        }
    }

def parse_search_query(query_string: str) -> Dict[str, Any]:
    """
    Parse search query string into structured filters
    """
    # This is a simple implementation - you can make it more sophisticated
    filters = {}
    
    # Split by space and look for key:value patterns
    parts = query_string.split()
    
    for part in parts:
        if ':' in part:
            key, value = part.split(':', 1)
            filters[key] = value
        else:
            # Free text search
            if 'search' not in filters:
                filters['search'] = []
            filters['search'].append(part)
    
    return filters

def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to specified length with suffix
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix

def safe_parse_json(json_string: str, default=None):
    """
    Safely parse JSON string with error handling
    """
    try:
        return json.loads(json_string)
    except (json.JSONDecodeError, TypeError):
        return default

def get_client_ip(request) -> str:
    """
    Extract client IP address from request
    """
    # Check for proxy headers
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct client
    if hasattr(request, "client"):
        return request.client.host
    
    return "unknown"

def format_response(data: Any, message: str = "Success", status_code: int = 200) -> Dict[str, Any]:
    """
    Standardize API response format
    """
    return {
        "success": True,
        "status_code": status_code,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }

def format_error_response(error: str, status_code: int = 400, details: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Standardize error response format
    """
    return {
        "success": False,
        "status_code": status_code,
        "error": error,
        "details": details,
        "timestamp": datetime.utcnow().isoformat()
    }

# Decorator for rate limiting (placeholder)
def rate_limit(calls: int = 5, period: int = 60):
    """
    Rate limiting decorator
    Note: This requires a cache backend like Redis for production use
    """
    def decorator(func):
        # This is a placeholder - implement actual rate limiting as needed
        func.__rate_limit__ = {"calls": calls, "period": period}
        return func
    return decorator

# Cache decorator placeholder
def cache_result(ttl: int = 300):
    """
    Cache decorator for expensive operations
    Note: This requires a cache backend like Redis for production use
    """
    def decorator(func):
        # This is a placeholder - implement actual caching as needed
        func.__cache__ = {"ttl": ttl}
        return func
    return decorator