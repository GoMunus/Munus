from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_token
from app.db.database import get_db, get_users_collection
from app.schemas.mongodb_schemas import MongoDBUser as User
from bson import ObjectId

security = HTTPBearer()


async def get_current_user(
    db = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    user_id = verify_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get users collection
    users_collection = get_users_collection()
    
    # Find user by ID
    user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user_doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Convert to User schema
    user = User(**user_doc)
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


def get_current_employer(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Get current user if they are an employer"""
    if current_user.role != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Employer access required."
        )
    return current_user


def get_current_jobseeker(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Get current user if they are a job seeker"""
    if current_user.role != "jobseeker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Job seeker access required."
        )
    return current_user


async def get_optional_current_user(
    db = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        user_id = verify_token(token)
        
        if user_id is None:
            return None
        
        # Get users collection
        users_collection = get_users_collection()
        
        # Find user by ID
        user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user_doc is None:
            return None
        
        # Convert to User schema
        user = User(**user_doc)
        return user if user.is_active else None
    except:
        return None