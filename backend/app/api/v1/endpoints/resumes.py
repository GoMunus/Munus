from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse
from app.services.google_drive_service import google_drive_service
import os
import json

# For MongoDB compatibility, we'll use a mock Session type
class Session:
    pass

router = APIRouter()


@router.get("/", response_model=List[ResumeResponse])
def get_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user resumes"""
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(Resume.created_at.desc()).all()
    
    return resumes


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get resume by ID"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return resume


@router.post("/", response_model=ResumeResponse)
def create_resume(
    resume_data: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new resume"""
    db_resume = Resume(
        title=resume_data.title,
        summary=resume_data.summary,
        template_id=resume_data.template_id,
        is_public=resume_data.is_public,
        user_id=current_user.id
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: int,
    resume_data: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Update resume
    update_data = resume_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resume, field, value)
    
    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}


@router.post("/{resume_id}/set-default")
def set_default_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set resume as default"""
    # First, unset all other resumes as default
    db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).update({"is_default": False})
    
    # Set this resume as default
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    resume.is_default = True
    db.commit()
    
    return {"message": "Resume set as default"}


@router.post("/{resume_id}/generate-pdf")
def generate_resume_pdf(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a PDF for the resume (mock implementation)"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    # Mock PDF URL
    pdf_url = f"/uploads/resumes/{resume_id}_resume.pdf"
    return {"pdf_url": pdf_url}


@router.post("/{resume_id}/upload-video")
def upload_resume_video(
    resume_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a video for the resume (mock implementation)"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    # Save file (mock)
    video_url = f"/uploads/videos/{resume_id}_video.mp4"
    return {"video_url": video_url}


@router.post("/{resume_id}/upload-audio")
def upload_resume_audio(
    resume_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload an audio for the resume (mock implementation)"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    # Save file (mock)
    voice_url = f"/uploads/audio/{resume_id}_audio.mp3"
    return {"voice_url": voice_url}


@router.post("/parse-google-drive")
async def parse_google_drive_resume(
    file: UploadFile = File(...),
    metadata: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Parse resume from Google Drive file"""
    try:
        # Parse metadata
        file_metadata = json.loads(metadata)
        file_id = file_metadata.get('id')
        mime_type = file_metadata.get('mimeType')
        
        if not file_id or not mime_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file metadata"
            )
        
        # Validate file type
        allowed_types = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        
        if mime_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Only PDF and DOCX files are supported."
            )
        
        # Validate file size (10MB limit)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 10MB."
            )
        
        # For now, we'll parse the uploaded file directly
        # In a production environment, you might want to use the Google Drive API
        # to download the file using the file_id and access token
        
        file_content = await file.read()
        
        # Parse based on file type
        if mime_type == 'application/pdf':
            parsed_data = google_drive_service.parse_pdf_content(file_content)
        elif mime_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            parsed_data = google_drive_service.parse_docx_content(file_content)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type"
            )
        
        return {
            "success": True,
            "message": "Resume parsed successfully",
            "data": parsed_data
        }
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid metadata format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume: {str(e)}"
        )