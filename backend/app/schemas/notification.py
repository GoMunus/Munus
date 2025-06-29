from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: NotificationType
    is_important: bool = False
    action_url: Optional[str] = None
    metadata: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    user_id: int
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True