from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.db.database import get_db
from app.api.deps import get_current_user, get_current_employer, get_optional_current_user
from app.models.user import User
from app.models.job import Job, JobApplication
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobFilter, JobApplicationCreate, JobApplicationResponse
from app.crud.job import create_job, get_job, get_jobs, update_job, delete_job, create_job_application
from app.services import matching
from app.models.resume import Resume

router = APIRouter()


@router.get("/", response_model=List[JobResponse])
def get_jobs_list(
    search: Optional[str] = Query(None, description="Search in title, description, location, skills"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[List[str]] = Query(None, description="Filter by job type"),
    work_mode: Optional[List[str]] = Query(None, description="Filter by work mode"),
    experience_level: Optional[List[str]] = Query(None, description="Filter by experience level"),
    salary_min: Optional[int] = Query(None, description="Minimum salary"),
    salary_max: Optional[int] = Query(None, description="Maximum salary"),
    skills: Optional[List[str]] = Query(None, description="Filter by skills"),
    posted_within_days: Optional[int] = Query(None, description="Posted within days"),
    is_featured: Optional[bool] = Query(None, description="Filter featured jobs"),
    limit: int = Query(20, le=100, description="Number of jobs to return"),
    offset: int = Query(0, description="Number of jobs to skip"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get list of jobs with optional filters"""
    try:
        # Build query
        query = db.query(Job).filter(Job.is_active == True)
        
        # Apply filters
        if search:
            search_filter = or_(
                Job.title.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%"),
                Job.location.ilike(f"%{search}%"),
                Job.skills.op('?|')(search.split())  # PostgreSQL JSON operator for array contains
            )
            query = query.filter(search_filter)
        
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        
        if job_type:
            query = query.filter(Job.job_type.in_(job_type))
        
        if work_mode:
            query = query.filter(Job.work_mode.in_(work_mode))
        
        if experience_level:
            query = query.filter(Job.experience_level.in_(experience_level))
        
        if salary_min:
            query = query.filter(Job.salary_min >= salary_min)
        
        if salary_max:
            query = query.filter(Job.salary_max <= salary_max)
        
        if skills:
            for skill in skills:
                query = query.filter(Job.skills.op('?')(skill))  # PostgreSQL JSON operator
        
        if posted_within_days:
            from datetime import datetime, timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=posted_within_days)
            query = query.filter(Job.created_at >= cutoff_date)
        
        if is_featured is not None:
            query = query.filter(Job.is_featured == is_featured)
        
        # Order by created_at desc and apply pagination
        jobs = query.order_by(Job.created_at.desc()).offset(offset).limit(limit).all()
        
        # Convert to response format and add applications count
        job_responses = []
        for job in jobs:
            job_dict = {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "location": job.location,
                "job_type": job.job_type.value,
                "work_mode": job.work_mode.value,
                "experience_level": job.experience_level.value,
                "requirements": job.requirements or [],
                "responsibilities": job.responsibilities or [],
                "benefits": job.benefits or [],
                "skills": job.skills or [],
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "salary_currency": job.salary_currency,
                "salary_period": job.salary_period,
                "application_deadline": job.application_deadline,
                "is_active": job.is_active,
                "is_featured": job.is_featured,
                "employer_id": job.employer_id,
                "company_id": job.company_id,
                "created_at": job.created_at,
                "updated_at": job.updated_at,
                "applications_count": len(job.applications)
            }
            job_responses.append(job_dict)
        
        return job_responses
        
    except Exception as e:
        print(f"Error fetching jobs: {e}")
        # Return empty list instead of mock data
        return []


@router.get("/{job_id}", response_model=JobResponse)
def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get job details by ID"""
    job = get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return job


@router.post("/", response_model=JobResponse)
def create_new_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Create a new job posting (employers only)"""
    job = create_job(db, job_data=job_data, employer_id=current_user.id)
    return job


@router.put("/{job_id}", response_model=JobResponse)
def update_job_posting(
    job_id: int,
    job_data: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Update job posting (employers only)"""
    job = get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job"
        )
    
    updated_job = update_job(db, job_id=job_id, job_data=job_data)
    return updated_job


@router.delete("/{job_id}")
def delete_job_posting(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Delete job posting (employers only)"""
    job = get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this job"
        )
    
    delete_job(db, job_id=job_id)
    return {"message": "Job deleted successfully"}


@router.post("/{job_id}/apply", response_model=JobApplicationResponse)
def apply_to_job(
    job_id: int,
    application_data: JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Apply to a job (job seekers only)"""
    if current_user.role != "jobseeker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only job seekers can apply to jobs"
        )
    
    job = get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if not job.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is no longer accepting applications"
        )
    
    # Check if user already applied
    existing_application = db.query(JobApplication).filter(
        and_(JobApplication.user_id == current_user.id, JobApplication.job_id == job_id)
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    application = create_job_application(
        db, 
        application_data=application_data, 
        user_id=current_user.id, 
        job_id=job_id
    )
    return application


@router.get("/applications/me", response_model=List[JobApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's job applications"""
    applications = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).order_by(JobApplication.created_at.desc()).all()
    
    return applications


@router.get("/{job_id}/applications", response_model=List[JobApplicationResponse])
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Get applications for a specific job (employers only)"""
    job = get_job(db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.employer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view applications for this job"
        )
    
    applications = db.query(JobApplication).filter(
        JobApplication.job_id == job_id
    ).order_by(JobApplication.created_at.desc()).all()
    
    return applications


@router.post("/match-score")
def get_match_score(
    resume_text: str = Body(..., embed=True),
    job_text: str = Body(..., embed=True),
    use_openai: bool = Query(False, description="Use OpenAI for matching if true")
):
    """Return the AI-powered match score between a resume and a job description."""
    if use_openai:
        score = matching.openai_match_score(resume_text, job_text)
    else:
        score = matching.match_score(resume_text, job_text)
    return {"score": score}


@router.get("/recommend")
def recommend_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    use_openai: bool = Query(False, description="Use OpenAI for matching if true")
):
    """Recommend jobs to the current user based on their best resume and AI match score."""
    # Get user's best (default) resume
    resume = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.is_default == True
    ).first()
    if not resume:
        return []
    resume_text = f"{resume.title}\n{resume.summary or ''}"
    # Get all active jobs
    jobs = db.query(Job).filter(Job.is_active == True).all()
    job_texts = [f"{job.title}\n{job.description}" for job in jobs]
    # Compute match scores
    if use_openai:
        scores = [matching.openai_match_score(resume_text, jt) for jt in job_texts]
    else:
        scores = [matching.match_score(resume_text, jt) for jt in job_texts]
    job_scores = list(zip(jobs, scores))
    job_scores.sort(key=lambda x: x[1], reverse=True)
    return [{"job": j.id, "score": float(score)} for j, score in job_scores]


@router.get("/{job_id}/recommend-candidates")
def recommend_candidates(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer),
    use_openai: bool = Query(False, description="Use OpenAI for matching if true")
):
    """Recommend candidates for a job based on AI match score."""
    # Get the job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job_text = f"{job.title}\n{job.description}"
    # Get all resumes
    resumes = db.query(Resume).filter(Resume.is_public == True).all()
    resume_texts = [f"{r.title}\n{r.summary or ''}" for r in resumes]
    if not resume_texts:
        return []
    if use_openai:
        scores = [matching.openai_match_score(rt, job_text) for rt in resume_texts]
    else:
        scores = [matching.match_score(rt, job_text) for rt in resume_texts]
    candidate_scores = list(zip(resumes, scores))
    candidate_scores.sort(key=lambda x: x[1], reverse=True)
    return [{"resume": r.id, "user": r.user_id, "score": float(score)} for r, score in candidate_scores]


@router.post("/feedback")
def submit_match_feedback(
    resume_id: int = Body(...),
    job_id: int = Body(...),
    score: float = Body(...),
    feedback: int = Body(...),  # 1=good, 0=bad
):
    """Accept feedback on a match to improve the AI system (simulated)."""
    matching.add_feedback(resume_id, job_id, score, feedback)
    return {"status": "feedback received"}