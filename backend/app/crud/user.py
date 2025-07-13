from typing import Optional
# from sqlalchemy.orm import Session  # Removed for MongoDB-only setup
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.models.company import Company
from app.schemas.company import CompanyCreate


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(user_data.password)
    company_id = None
    if user_data.role == "employer" and getattr(user_data, "company", None):
        # Try to find existing company by name
        company = db.query(Company).filter(Company.name == user_data.company).first()
        if not company:
            # Create new company with minimal info
            company_in = CompanyCreate(name=user_data.company)
            company = Company(**company_in.dict())
            db.add(company)
            db.commit()
            db.refresh(company)
        company_id = company.id
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.name,
        role=user_data.role,
        phone=user_data.phone,
        location=user_data.location,
        company_id=company_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
    """Update user information"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


def update_user_password(db: Session, user_id: int, hashed_password: str) -> bool:
    """Update user password"""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    user.hashed_password = hashed_password
    db.commit()
    return True


def deactivate_user(db: Session, user_id: int) -> bool:
    """Deactivate user account"""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    user.is_active = False
    db.commit()
    return True