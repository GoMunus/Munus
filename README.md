# SkillGlide - AI-Powered Job Matching Platform

A modern job matching platform that connects job seekers with employers using AI-powered matching algorithms.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- PostgreSQL (optional, SQLite used by default)

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   python start_backend.py
   ```
   The backend will be available at http://localhost:8000

2. **Start the Frontend** (in a new terminal)
   ```bash
   npm install
   npm run dev
   ```
   The frontend will be available at http://localhost:5174

### Troubleshooting

**"Cannot connect to server" errors:**
- Make sure the backend server is running on http://localhost:8000
- Check that no firewall is blocking the connection
- Verify the backend started successfully by visiting http://localhost:8000/health

**Backend won't start:**
- Install Python dependencies: `cd backend && pip install -r requirements.txt`
- Check that port 8000 is not already in use

## Features

- **For Job Seekers:**
  - AI-powered job matching
  - Resume builder with video resume support
  - Job search and filtering
  - Application tracking

- **For Employers:**
  - Post job listings
  - AI-powered candidate matching
  - Application management
  - Company profile management

## Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** FastAPI, Python, SQLAlchemy
- **Database:** PostgreSQL/SQLite
- **AI/ML:** OpenAI GPT, Custom matching algorithms

## Development

See `docs/DEVELOPMENT_SETUP.md` for detailed development setup instructions.