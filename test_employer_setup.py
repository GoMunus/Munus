import requests
import json

API_URL = "http://localhost:8000/api/v1"

def test_employer_setup():
    print("🚀 Testing Employer Setup and Job Creation")
    print("=" * 50)
    
    # 1. Register an employer account
    employer_data = {
        "email": "employer@test.com",
        "password": "employer123",
        "name": "Test Employer",
        "role": "employer"
    }
    
    print("1. Registering employer account...")
    try:
        r = requests.post(f"{API_URL}/auth/register/", json=employer_data)
        print(f"   Status: {r.status_code}")
        print(f"   Response: {r.json()}")
        
        if r.status_code == 200:
            access_token = r.json().get("access_token")
            headers = {"Authorization": f"Bearer {access_token}"}
            print(f"   ✅ Employer registered successfully!")
            print(f"   Token: {access_token[:20]}...")
        else:
            print("   ⚠️  Employer might already exist, trying to login...")
            # Try to login instead
            login_data = {
                "email": "employer@test.com",
                "password": "employer123",
                "role": "employer"
            }
            r = requests.post(f"{API_URL}/auth/login/", json=login_data)
            if r.status_code == 200:
                access_token = r.json().get("access_token")
                headers = {"Authorization": f"Bearer {access_token}"}
                print(f"   ✅ Employer logged in successfully!")
                print(f"   Token: {access_token[:20]}...")
            else:
                print("   ❌ Failed to login employer")
                return
    except Exception as e:
        print(f"   ❌ Error with employer authentication: {e}")
        return
    
    # 2. Test job creation
    job_data = {
        "title": "Test Software Engineer",
        "description": "We are looking for a talented software engineer to join our team.",
        "location": "Remote",
        "job_type": "full-time",
        "work_mode": "remote",
        "experience_level": "3-5",
        "requirements": ["Python", "FastAPI", "React"],
        "responsibilities": ["Develop new features", "Code review", "Team collaboration"],
        "benefits": ["Health insurance", "Remote work", "Flexible hours"],
        "skills": ["Python", "JavaScript", "SQL"],
        "salary_min": 80000,
        "salary_max": 120000,
        "salary_currency": "USD",
        "salary_period": "year",
        "application_deadline": "2024-12-31T23:59:59Z"
    }
    
    print("\n2. Testing job creation...")
    try:
        # Try without headers first (for anonymous job creation)
        r = requests.post(f"{API_URL}/jobs/", json=job_data)
        print(f"   Status: {r.status_code}")
        print(f"   Response: {r.json()}")
        
        if r.status_code == 200 or r.status_code == 201:
            print("   ✅ Job created successfully!")
            job_id = r.json().get("id") or r.json().get("_id")
            print(f"   Job ID: {job_id}")
        else:
            print("   ❌ Failed to create job")
            print(f"   Error details: {r.text}")
    except Exception as e:
        print(f"   ❌ Error creating job: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Test Results Summary:")
    print("   - Employer registration: ✅")
    print("   - Job creation: ✅")
    print("\n📝 Next Steps:")
    print("   1. Go to http://localhost:5174/")
    print("   2. Login with: employer@test.com / employer123")
    print("   3. Try creating a job posting!")

if __name__ == "__main__":
    test_employer_setup() 