from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.database import get_db, get_notifications_collection
from app.api.deps import get_current_user
from app.schemas.mongodb_schemas import MongoDBUser as User
from app.schemas.mongodb_schemas import MongoDBNotification as Notification
from app.schemas.notification import NotificationResponse, NotificationUpdate
from bson import ObjectId

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user)
):
    """Get user notifications"""
    try:
        notifications_collection = get_notifications_collection()
        notifications = await notifications_collection.find(
            {"user_id": str(current_user.id)}
        ).sort("created_at", -1).to_list(length=None)
        
        # Convert ObjectId to string
        for notification in notifications:
            notification["id"] = str(notification["_id"])
        
        return notifications
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return []


@router.put("/{notification_id}", response_model=NotificationResponse)
def update_notification(
    notification_id: int,
    notification_data: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update notification (mark as read)"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Update notification
    if notification_data.is_read is not None:
        notification.is_read = notification_data.is_read
        if notification_data.is_read:
            from datetime import datetime
            notification.read_at = datetime.utcnow()
    
    db.commit()
    db.refresh(notification)
    return notification


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted successfully"}


@router.post("/mark-all-read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    from datetime import datetime
    
    try:
        db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).update({
            "is_read": True,
            "read_at": datetime.utcnow()
        })
        
        db.commit()
        return {"message": "All notifications marked as read"}
    except Exception as e:
        print(f"Error marking notifications as read: {e}")
        return {"message": "Failed to mark notifications as read"}


@router.get("/unread-count")
def get_unread_notifications_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    try:
        count = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        ).count()
        
        return {"count": count}
    except Exception as e:
        print(f"Error getting unread count: {e}")
        return {"count": 0}