from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.job import Job, JobApplication
from app.schemas.job import JobCreate, JobUpdate, JobApplicationCreate


def get_job(db: Session, job_id: int) -> Optional[Job]:
    """Get job by ID"""
    return db.query(Job).filter(Job.id == job_id).first()


def get_jobs(db: Session, skip: int = 0, limit: int = 20) -> List[Job]:
    """Get list of jobs"""
    return db.query(Job).filter(Job.is_active == True).offset(skip).limit(limit).all()


def create_job(db: Session, job_data: JobCreate, employer_id: int) -> Job:
    """Create a new job"""
    db_job = Job(
        title=job_data.title,
        description=job_data.description,
        location=job_data.location,
        job_type=job_data.job_type,
        work_mode=job_data.work_mode,
        experience_level=job_data.experience_level,
        requirements=job_data.requirements,
        responsibilities=job_data.responsibilities,
        benefits=job_data.benefits,
        skills=job_data.skills,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        salary_currency=job_data.salary_currency,
        salary_period=job_data.salary_period,
        application_deadline=job_data.application_deadline,
        employer_id=employer_id,
        company_id=job_data.company_id,
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def update_job(db: Session, job_id: int, job_data: JobUpdate) -> Optional[Job]:
    """Update job"""
    job = get_job(db, job_id)
    if not job:
        return None
    
    update_data = job_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job_id: int) -> bool:
    """Delete job"""
    job = get_job(db, job_id)
    if not job:
        return False
    
    db.delete(job)
    db.commit()
    return True


def create_job_application(
    db: Session, 
    application_data: JobApplicationCreate, 
    user_id: int, 
    job_id: int
) -> JobApplication:
    """Create a job application"""
    db_application = JobApplication(
        user_id=user_id,
        job_id=job_id,
        cover_letter=application_data.cover_letter,
        resume_url=application_data.resume_url,
        video_resume_url=application_data.video_resume_url,
        voice_resume_url=application_data.voice_resume_url,
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


def get_job_applications(db: Session, job_id: int) -> List[JobApplication]:
    """Get applications for a job"""
    return db.query(JobApplication).filter(JobApplication.job_id == job_id).all()


def get_user_applications(db: Session, user_id: int) -> List[JobApplication]:
    """Get applications by user"""
    return db.query(JobApplication).filter(JobApplication.user_id == user_id).all()