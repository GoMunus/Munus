from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import time
import logging
import os
from dotenv import load_dotenv
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.v1.endpoints import (
    mongodb_jobs_clean, mongodb_users, mongodb_notifications, 
    mongodb_companies, health, auth
)
from pydantic import BaseModel
from twilio.rest import Client
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Jobify API",
    description="A job search and recruitment platform API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Twilio setup
account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
verify_sid = os.getenv("TWILIO_VERIFY_SID", "")
client = Client(account_sid, auth_token)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        from app.db.mongodb import async_client
        if async_client:
            await async_client.admin.command('ping')
            mongodb_status = {"status": "healthy", "database": "mongodb"}
        else:
            mongodb_status = {"status": "unhealthy", "error": "MongoDB not connected"}
        
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "services": {
                "mongodb": mongodb_status
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": time.time(),
            "error": str(e)
        }

# Include all MongoDB endpoints at their original paths
app.include_router(mongodb_jobs_clean.router, prefix=f"{settings.API_V1_STR}/jobs", tags=["jobs"])
app.include_router(mongodb_users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(mongodb_notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(mongodb_companies.router, prefix=f"{settings.API_V1_STR}/companies", tags=["companies"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])

# Include health endpoint
app.include_router(health.router, prefix=f"{settings.API_V1_STR}/health", tags=["health"])

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Starting Jobify API server...")
    await connect_to_mongo()
    logger.info("MongoDB connection established")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Jobify API server...")
    await close_mongo_connection()

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Jobify API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)