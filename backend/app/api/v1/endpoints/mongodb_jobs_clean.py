from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.db.database import get_jobs_collection, get_applications_collection
from app.schemas.mongodb_schemas import (
    MongoDBJob, JobCreateRequest, JobUpdateRequest, JobSearchRequest,
    MongoDBJobApplication, JobApplicationRequest
)
import logging
from app.db.mongodb import get_jobs_collection, get_job_applications_collection as get_applications_collection
from app.api.deps import get_current_user
from app.schemas.mongodb_schemas import MongoDBUser as User

router = APIRouter()

# Dependency to get jobs collection
def get_jobs_db():
    return get_jobs_collection()

# Dependency to get applications collection
def get_applications_db():
    return get_applications_collection()


@router.post("/", response_model=MongoDBJob, status_code=status.HTTP_201_CREATED)
async def create_job(job_data: dict):
    """Create a new job - Accepts ANY job data from ANY employer"""
    try:
        logging.info(f"Received job creation request: {job_data}")
        
        # Accept ANY job data - no validation requirements
        # Generate unique IDs for employer and company
        employer_name = job_data.get("employer_name", "Anonymous Employer")
        employer_id = job_data.get("employer_id", f"emp_{datetime.utcnow().timestamp()}")
        company_name = job_data.get("company_name", employer_name)
        company_id = job_data.get("company_id", f"comp_{datetime.utcnow().timestamp()}")
        
        # Create job document with ANY data provided
        job_doc = {
            # Accept ANY title (even empty or missing)
            "title": job_data.get("title") or "Untitled Job",
            # Accept ANY description (even empty or missing)
            "description": job_data.get("description") or "No description provided",
            # Accept ANY lists or data
            "requirements": job_data.get("requirements", []),
            "responsibilities": job_data.get("responsibilities", []),
            "benefits": job_data.get("benefits", []),
            "location": job_data.get("location", ""),
            "job_type": job_data.get("job_type", "full_time"),
            "work_mode": job_data.get("work_mode", "on_site").replace("onsite", "on_site"),
            # Accept ANY salary values (including 0, negative, or no salary)
            "salary_min": job_data.get("salary_min"),
            "salary_max": job_data.get("salary_max"),
            "salary_currency": job_data.get("salary_currency", "USD"),
            "experience_level": job_data.get("experience_level", ""),
            "required_skills": job_data.get("required_skills", []),
            "preferred_skills": job_data.get("preferred_skills", []),
            "education_level": job_data.get("education_level", ""),
            "keywords": job_data.get("keywords", []),
            "tags": job_data.get("tags", []),
            "expires_at": job_data.get("expires_at"),
            "status": "published",  # Always publish immediately
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "views_count": 0,
            "applications_count": 0,
            "employer_id": employer_id,
            "employer_name": employer_name,
            "company_id": company_id,
            "company_name": company_name
        }
        
        # Store ANY additional fields the user might send
        for key, value in job_data.items():
            if key not in job_doc:
                job_doc[key] = value
        
        result = await get_jobs_db().insert_one(job_doc)
        job_doc["_id"] = str(result.inserted_id)
        return MongoDBJob(**job_doc)
    except Exception as e:
        logging.error(f"Error creating job: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating job: {str(e)}")


@router.get("/", response_model=List[MongoDBJob])
async def list_jobs(
    skip: int = 0,
    limit: int = 20,
    jobs_collection = Depends(get_jobs_db)
):
    """List all jobs"""
    try:
        cursor = jobs_collection.find().skip(skip).limit(limit)
        jobs = []
        async for job in cursor:
            job["_id"] = str(job["_id"])
            # Convert hyphen format to underscore format for compatibility
            if "job_type" in job and job["job_type"]:
                job["job_type"] = job["job_type"].replace("-", "_")
            if "work_mode" in job and job["work_mode"]:
                # Fix work_mode values to match enum
                work_mode = job["work_mode"]
                if work_mode == "onsite":
                    job["work_mode"] = "on_site"
                elif work_mode == "remote":
                    job["work_mode"] = "remote"
                elif work_mode == "hybrid":
                    job["work_mode"] = "hybrid"
                else:
                    job["work_mode"] = "on_site"  # Default fallback
            jobs.append(MongoDBJob(**job))
        return jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching jobs: {str(e)}")


@router.get("/{job_id}", response_model=MongoDBJob)
async def get_job(
    job_id: str,
    jobs_collection = Depends(get_jobs_db)
):
    """Get a specific job by ID"""
    try:
        job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job["_id"] = str(job["_id"])
        # Convert hyphen format to underscore format for compatibility
        if "job_type" in job and job["job_type"]:
            job["job_type"] = job["job_type"].replace("-", "_")
        if "work_mode" in job and job["work_mode"]:
            job["work_mode"] = job["work_mode"].replace("-", "_")
        return MongoDBJob(**job)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching job: {str(e)}")


@router.put("/{job_id}", response_model=MongoDBJob)
async def update_job(
    job_id: str,
    job_data: JobUpdateRequest,
    jobs_collection = Depends(get_jobs_db)
):
    """Update a job"""
    try:
        # Build update document
        update_data = {"updated_at": datetime.utcnow()}
        for field, value in job_data.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        result = await jobs_collection.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Return updated job
        updated_job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
        updated_job["_id"] = str(updated_job["_id"])
        # Convert hyphen format to underscore format for compatibility
        if "job_type" in updated_job and updated_job["job_type"]:
            updated_job["job_type"] = updated_job["job_type"].replace("-", "_")
        if "work_mode" in updated_job and updated_job["work_mode"]:
            updated_job["work_mode"] = updated_job["work_mode"].replace("-", "_")
        return MongoDBJob(**updated_job)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating job: {str(e)}")


@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    jobs_collection = Depends(get_jobs_db)
):
    """Delete a job (employers only)"""
    if current_user.role != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can delete job postings"
        )
    
    try:
        # Check if job exists and belongs to the user
        job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Check if the job belongs to the current user
        if job.get("employer_id") != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own job postings"
            )
        
        result = await jobs_collection.delete_one({"_id": ObjectId(job_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return {"message": "Job deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting job: {str(e)}")


@router.post("/{job_id}/apply", response_model=MongoDBJobApplication)
async def apply_to_job(
    job_id: str,
    application_data: JobApplicationRequest,
    jobs_collection = Depends(get_jobs_db),
    applications_collection = Depends(get_applications_db)
):
    """Apply to a job"""
    try:
        # Check if job exists
        job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Create application document
        application_doc = {
            "job_id": job_id,
            "applicant_id": "temp_applicant_id",  # Would come from auth
            "applicant_name": "Temp Applicant",   # Would come from auth
            "applicant_email": "temp@example.com", # Would come from auth
            "cover_letter": application_data.cover_letter,
            "resume_url": application_data.resume_url,
            "video_resume_url": application_data.video_resume_url,
            "audio_resume_url": application_data.audio_resume_url,
            "portfolio_url": application_data.portfolio_url,
            "linkedin_url": application_data.linkedin_url,
            "github_url": application_data.github_url,
            "status": "pending",
            "current_stage": "application_received",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await applications_collection.insert_one(application_doc)
        application_doc["_id"] = str(result.inserted_id)
        
        # Update job applications count
        await jobs_collection.update_one(
            {"_id": ObjectId(job_id)},
            {"$inc": {"applications_count": 1}}
        )
        
        return MongoDBJobApplication(**application_doc)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying to job: {str(e)}")


@router.get("/{job_id}/applications", response_model=List[MongoDBJobApplication])
async def get_job_applications(
    job_id: str,
    applications_collection = Depends(get_applications_db)
):
    """Get applications for a specific job"""
    try:
        cursor = applications_collection.find({"job_id": job_id})
        applications = []
        async for app in cursor:
            app["_id"] = str(app["_id"])
            applications.append(MongoDBJobApplication(**app))
        return applications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching applications: {str(e)}")


@router.post("/search", response_model=List[MongoDBJob])
async def search_jobs(
    search_data: JobSearchRequest,
    jobs_collection = Depends(get_jobs_db)
):
    """Search jobs with filters"""
    try:
        query = {}
        
        if search_data.query:
            query["$or"] = [
                {"title": {"$regex": search_data.query, "$options": "i"}},
                {"description": {"$regex": search_data.query, "$options": "i"}},
                {"keywords": {"$regex": search_data.query, "$options": "i"}}
            ]
        
        if search_data.location:
            query["location"] = {"$regex": search_data.location, "$options": "i"}
        
        if search_data.job_type:
            query["job_type"] = {"$in": search_data.job_type}
        
        if search_data.work_mode:
            query["work_mode"] = {"$in": search_data.work_mode}
        
        if search_data.experience_level:
            query["experience_level"] = search_data.experience_level
        
        if search_data.salary_min or search_data.salary_max:
            salary_query = {}
            if search_data.salary_min:
                salary_query["$gte"] = search_data.salary_min
            if search_data.salary_max:
                salary_query["$lte"] = search_data.salary_max
            query["salary_min"] = salary_query
        
        if search_data.skills:
            query["required_skills"] = {"$in": search_data.skills}
        
        cursor = jobs_collection.find(query).limit(search_data.limit or 20)
        jobs = []
        async for job in cursor:
            job["_id"] = str(job["_id"])
            # Convert hyphen format to underscore format for compatibility
            if "job_type" in job and job["job_type"]:
                job["job_type"] = job["job_type"].replace("-", "_")
            if "work_mode" in job and job["work_mode"]:
                job["work_mode"] = job["work_mode"].replace("-", "_")
            jobs.append(MongoDBJob(**job))
        return jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching jobs: {str(e)}") 