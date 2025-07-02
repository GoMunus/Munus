from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text)
    
    # Media Files
    video_url = Column(String(500))
    voice_url = Column(String(500))
    pdf_url = Column(String(500))
    
    # Template and Styling
    template_id = Column(String(50), default="default")
    is_public = Column(Boolean, default=False)
    is_default = Column(Boolean, default=False)
    
    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    experiences = relationship("Experience", back_populates="resume", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="resume", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="resume", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="resume", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="resume", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Resume(id={self.id}, title='{self.title}', user_id={self.user_id})>"


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    description = Column(Text)
    achievements = Column(JSON)  # List of achievements
    
    # Dates
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    is_current = Column(Boolean, default=False)
    
    # Foreign Keys
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="experiences")
    
    def __repr__(self):
        return f"<Experience(id={self.id}, company='{self.company}', position='{self.position}')>"


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    institution = Column(String(255), nullable=False)
    degree = Column(String(255), nullable=False)
    field_of_study = Column(String(255))
    description = Column(Text)
    gpa = Column(Float)
    
    # Dates
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    
    # Foreign Keys
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="educations")
    
    def __repr__(self):
        return f"<Education(id={self.id}, institution='{self.institution}', degree='{self.degree}')>"


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50))  # technical, soft, language, etc.
    proficiency_level = Column(Integer, default=3)  # 1-5 scale
    
    # Foreign Keys
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="skills")
    
    def __repr__(self):
        return f"<Skill(id={self.id}, name='{self.name}', level={self.proficiency_level})>"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    technologies = Column(JSON)  # List of technologies used
    url = Column(String(500))
    github_url = Column(String(500))
    
    # Dates
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    
    # Foreign Keys
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="projects")
    
    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}')>"


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    credential_id = Column(String(255))
    url = Column(String(500))
    
    # Dates
    issue_date = Column(DateTime(timezone=True), nullable=False)
    expiry_date = Column(DateTime(timezone=True))
    
    # Foreign Keys
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="certifications")
    
    def __repr__(self):
        return f"<Certification(id={self.id}, name='{self.name}', issuer='{self.issuer}')>"