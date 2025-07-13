#!/usr/bin/env python3
"""
Test script for MongoDB setup and sample data creation
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.crud.mongodb_jobs import mongodb_job_crud
from app.schemas.mongodb_schemas import JobCreateRequest, JobType, WorkMode


async def test_mongodb_connection():
    """Test MongoDB connection"""
    print("🔌 Testing MongoDB connection...")
    try:
        await connect_to_mongo()
        print("✅ MongoDB connection successful!")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False


async def create_sample_jobs():
    """Create sample job postings"""
    print("\n📝 Creating sample job postings...")
    
    sample_jobs = [
        {
            "title": "Senior Software Engineer",
            "description": "We are looking for a talented Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining high-quality software solutions.",
            "requirements": [
                "5+ years of experience in software development",
                "Strong knowledge of Python, JavaScript, and React",
                "Experience with cloud platforms (AWS, Azure, or GCP)",
                "Excellent problem-solving skills",
                "Strong communication and teamwork abilities"
            ],
            "responsibilities": [
                "Design and implement scalable software solutions",
                "Collaborate with cross-functional teams",
                "Mentor junior developers",
                "Participate in code reviews",
                "Contribute to technical architecture decisions"
            ],
            "benefits": [
                "Competitive salary and equity",
                "Health, dental, and vision insurance",
                "Flexible work hours and remote work options",
                "Professional development opportunities",
                "401(k) matching"
            ],
            "location": "San Francisco, CA",
            "job_type": JobType.FULL_TIME,
            "work_mode": WorkMode.HYBRID,
            "salary_min": 120000,
            "salary_max": 180000,
            "experience_level": "Senior",
            "required_skills": ["Python", "JavaScript", "React", "AWS", "Docker"],
            "preferred_skills": ["Kubernetes", "GraphQL", "TypeScript", "Machine Learning"],
            "education_level": "Bachelor's Degree",
            "keywords": ["software engineer", "python", "react", "senior", "full-stack"],
            "tags": ["engineering", "full-stack", "senior", "python", "react"]
        },
        {
            "title": "Frontend Developer",
            "description": "Join our frontend team to build beautiful, responsive, and user-friendly web applications. We're looking for someone passionate about creating exceptional user experiences.",
            "requirements": [
                "3+ years of experience in frontend development",
                "Proficient in HTML, CSS, and JavaScript",
                "Experience with React, Vue.js, or Angular",
                "Knowledge of responsive design principles",
                "Understanding of web accessibility standards"
            ],
            "responsibilities": [
                "Develop responsive web applications",
                "Collaborate with designers and backend developers",
                "Optimize application performance",
                "Write clean, maintainable code",
                "Participate in agile development processes"
            ],
            "benefits": [
                "Competitive salary",
                "Health insurance",
                "Remote work options",
                "Learning and development budget",
                "Flexible PTO"
            ],
            "location": "New York, NY",
            "job_type": JobType.FULL_TIME,
            "work_mode": WorkMode.REMOTE,
            "salary_min": 80000,
            "salary_max": 120000,
            "experience_level": "Mid-level",
            "required_skills": ["HTML", "CSS", "JavaScript", "React", "Git"],
            "preferred_skills": ["TypeScript", "Vue.js", "Tailwind CSS", "Next.js"],
            "education_level": "Bachelor's Degree",
            "keywords": ["frontend", "react", "javascript", "web development"],
            "tags": ["frontend", "react", "javascript", "web"]
        },
        {
            "title": "Data Scientist",
            "description": "We're seeking a Data Scientist to help us extract insights from large datasets and build machine learning models that drive business decisions.",
            "requirements": [
                "Master's degree in Statistics, Computer Science, or related field",
                "3+ years of experience in data science",
                "Proficient in Python and SQL",
                "Experience with machine learning frameworks",
                "Strong statistical analysis skills"
            ],
            "responsibilities": [
                "Analyze large datasets to extract insights",
                "Build and deploy machine learning models",
                "Create data visualizations and reports",
                "Collaborate with business stakeholders",
                "Stay current with data science trends"
            ],
            "benefits": [
                "Competitive salary and benefits",
                "Health and wellness programs",
                "Professional development opportunities",
                "Flexible work arrangements",
                "Stock options"
            ],
            "location": "Austin, TX",
            "job_type": JobType.FULL_TIME,
            "work_mode": WorkMode.ON_SITE,
            "salary_min": 100000,
            "salary_max": 150000,
            "experience_level": "Mid-level",
            "required_skills": ["Python", "SQL", "Machine Learning", "Statistics", "Pandas"],
            "preferred_skills": ["TensorFlow", "PyTorch", "AWS", "Docker", "Spark"],
            "education_level": "Master's Degree",
            "keywords": ["data scientist", "machine learning", "python", "analytics"],
            "tags": ["data-science", "machine-learning", "python", "analytics"]
        },
        {
            "title": "DevOps Engineer",
            "description": "Join our DevOps team to help us build and maintain scalable infrastructure and deployment pipelines. We're looking for someone who loves automation and reliability.",
            "requirements": [
                "4+ years of experience in DevOps or SRE",
                "Experience with cloud platforms (AWS, Azure, or GCP)",
                "Knowledge of containerization and orchestration",
                "Experience with CI/CD pipelines",
                "Strong scripting skills (Python, Bash, etc.)"
            ],
            "responsibilities": [
                "Design and maintain cloud infrastructure",
                "Automate deployment and scaling processes",
                "Monitor system performance and reliability",
                "Implement security best practices",
                "Collaborate with development teams"
            ],
            "benefits": [
                "Competitive salary and benefits",
                "Health, dental, and vision insurance",
                "Remote work options",
                "Professional development budget",
                "Flexible working hours"
            ],
            "location": "Seattle, WA",
            "job_type": JobType.FULL_TIME,
            "work_mode": WorkMode.HYBRID,
            "salary_min": 110000,
            "salary_max": 160000,
            "experience_level": "Senior",
            "required_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "Python"],
            "preferred_skills": ["Jenkins", "Prometheus", "Grafana", "Ansible", "Helm"],
            "education_level": "Bachelor's Degree",
            "keywords": ["devops", "aws", "kubernetes", "automation", "infrastructure"],
            "tags": ["devops", "aws", "kubernetes", "automation"]
        },
        {
            "title": "Product Manager",
            "description": "We're looking for a Product Manager to lead product strategy and execution. You'll work closely with engineering, design, and business teams to deliver exceptional products.",
            "requirements": [
                "5+ years of product management experience",
                "Experience in B2B or SaaS products",
                "Strong analytical and strategic thinking",
                "Excellent communication and leadership skills",
                "Experience with agile development methodologies"
            ],
            "responsibilities": [
                "Define product strategy and roadmap",
                "Gather and prioritize product requirements",
                "Work with cross-functional teams to deliver products",
                "Analyze market trends and competitive landscape",
                "Drive product adoption and success metrics"
            ],
            "benefits": [
                "Competitive salary and equity",
                "Comprehensive health benefits",
                "Flexible work arrangements",
                "Professional development opportunities",
                "Generous PTO policy"
            ],
            "location": "Boston, MA",
            "job_type": JobType.FULL_TIME,
            "work_mode": WorkMode.HYBRID,
            "salary_min": 120000,
            "salary_max": 180000,
            "experience_level": "Senior",
            "required_skills": ["Product Management", "Agile", "Analytics", "Strategy", "Leadership"],
            "preferred_skills": ["SQL", "A/B Testing", "User Research", "Roadmapping", "Go-to-Market"],
            "education_level": "Bachelor's Degree",
            "keywords": ["product manager", "strategy", "agile", "leadership", "saas"],
            "tags": ["product-management", "strategy", "leadership", "saas"]
        }
    ]
    
    created_jobs = []
    for i, job_data in enumerate(sample_jobs, 1):
        try:
            job_request = JobCreateRequest(**job_data)
            job = await mongodb_job_crud.create_job(
                job_data=job_request,
                employer_id=f"employer_{i}",
                employer_name=f"Sample Company {i}",
                company_id=f"company_{i}",
                company_name=f"Sample Company {i}"
            )
            
            # Publish the job
            published_job = await mongodb_job_crud.publish_job(job.id)
            created_jobs.append(published_job)
            print(f"✅ Created job: {published_job.title}")
            
        except Exception as e:
            print(f"❌ Failed to create job {i}: {e}")
    
    print(f"\n📊 Created {len(created_jobs)} sample jobs")
    return created_jobs


async def test_job_search():
    """Test job search functionality"""
    print("\n🔍 Testing job search functionality...")
    
    try:
        # Test basic search
        from app.schemas.mongodb_schemas import JobSearchRequest
        
        search_request = JobSearchRequest(
            query="software engineer",
            limit=5
        )
        
        result = await mongodb_job_crud.search_jobs(search_request)
        print(f"✅ Search found {result['total']} jobs")
        
        # Test location search
        location_search = JobSearchRequest(
            location="San Francisco",
            limit=3
        )
        
        location_result = await mongodb_job_crud.search_jobs(location_search)
        print(f"✅ Location search found {location_result['total']} jobs")
        
        # Test featured jobs
        featured_jobs = await mongodb_job_crud.get_featured_jobs(limit=3)
        print(f"✅ Found {len(featured_jobs)} featured jobs")
        
        # Test recent jobs
        recent_jobs = await mongodb_job_crud.get_recent_jobs(limit=5)
        print(f"✅ Found {len(recent_jobs)} recent jobs")
        
    except Exception as e:
        print(f"❌ Search test failed: {e}")


async def main():
    """Main test function"""
    print("🚀 MongoDB Setup Test")
    print("=" * 50)
    
    # Test connection
    if not await test_mongodb_connection():
        return
    
    # Create sample data
    await create_sample_jobs()
    
    # Test search functionality
    await test_job_search()
    
    # Close connection
    await close_mongo_connection()
    
    print("\n🎉 MongoDB setup test completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start your FastAPI server: uvicorn app.main:app --reload")
    print("2. Test the MongoDB endpoints at: http://localhost:8000/api/v1/mongodb-jobs/")
    print("3. View API documentation at: http://localhost:8000/docs")


if __name__ == "__main__":
    asyncio.run(main()) 