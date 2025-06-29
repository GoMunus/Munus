from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.crud.user import update_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    try:
        updated_user = update_user(db, user_id=current_user.id, user_data=user_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return updated_user
    except Exception as e:
        print(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post("/change-password")
def change_password(
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    from app.core.security import verify_password, get_password_hash
    from app.crud.user import update_user_password
    
    try:
        # Verify current password
        if not verify_password(current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )
        
        # Update password
        hashed_password = get_password_hash(new_password)
        success = update_user_password(db, user_id=current_user.id, hashed_password=hashed_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )
        
        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error changing password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )


@router.delete("/me")
def delete_current_user_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete current user account"""
    from app.crud.user import deactivate_user
    
    try:
        success = deactivate_user(db, user_id=current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete account"
            )
        
        return {"message": "Account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )


@router.post("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify user email"""
    # TODO: Implement email verification logic
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification_email(
    current_user: User = Depends(get_current_user)
):
    """Resend verification email"""
    # TODO: Implement resend verification logic
    return {"message": "Verification email sent"}