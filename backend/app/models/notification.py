from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class NotificationType(str, enum.Enum):
    JOB_MATCH = "job_match"
    APPLICATION_UPDATE = "application_update"
    MESSAGE = "message"
    INTERVIEW = "interview"
    PROFILE_VIEW = "profile_view"
    JOB_ALERT = "job_alert"
    SYSTEM = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    
    # Status
    is_read = Column(Boolean, default=False)
    is_important = Column(Boolean, default=False)
    
    # Additional Data
    action_url = Column(String(500))
    notification_data = Column(String(1000))  # JSON string for additional data
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, title='{self.title}', user_id={self.user_id})>"