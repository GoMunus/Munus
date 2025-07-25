import { api } from './api';
import type { JobFilters } from '../types';

export interface JobResponse {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  work_mode: string;
  experience_level?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  required_skills?: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  status?: string;
  is_featured?: boolean;
  employer_id?: string;
  employer_name?: string;
  company_id?: string;
  company_name?: string;
  created_at?: string;
  updated_at?: string;
  applications_count?: number;
}

class JobService {
  async getJobs(filters?: Partial<JobFilters>): Promise<JobResponse[]> {
    try {
      const response = await api.get<JobResponse[]>('/jobs/', filters);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async getJob(jobId: number): Promise<JobResponse> {
    try {
      const response = await api.get<JobResponse>(`/jobs/${jobId}/`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch job details';
      throw new Error(errorMessage);
    }
  }

  async applyForJob(jobId: number, data: any): Promise<any> {
    try {
      const response = await api.post(`/jobs/${jobId}/apply/`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to apply for job';
      throw new Error(errorMessage);
    }
  }

  async getMyApplications(): Promise<any[]> {
    try {
      const response = await api.get('/jobs/applications/me/');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  async getSuggestions(query: string, topK: number = 5): Promise<{ skills: string[]; jobs: string[]; candidates: string[] }> {
    try {
      const response = await api.get('/jobs/suggestions/', { query, top_k: topK });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      return { skills: [], jobs: [], candidates: [] };
    }
  }

  async createJob(jobData: any): Promise<JobResponse> {
    try {
      const response = await api.post<JobResponse>('/jobs/', jobData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async getEmployerJobs(): Promise<JobResponse[]> {
    try {
      // Get all jobs and filter by employer
      const response = await api.get<JobResponse[]>('/jobs/');
      const allJobs = Array.isArray(response.data) ? response.data : [];
      
      // Get current user from localStorage
      const userStr = localStorage.getItem('skillglide-user');
      if (!userStr) {
        console.log('No user found, returning empty array');
        return [];
      }
      
      const user = JSON.parse(userStr);
      console.log('Current user:', user);
      
      // Filter jobs by employer_id or employer_name
      const employerJobs = allJobs.filter((job: JobResponse) => {
        const jobEmployerId = job.employer_id;
        const jobEmployerName = job.employer_name;
        const userEmployerId = user._id || user.id;
        const userName = user.name;
        const userCompanyName = user.company_name;
        
        console.log('Comparing job:', {
          jobTitle: job.title,
          jobEmployerId,
          jobEmployerName,
          userEmployerId,
          userName,
          userCompanyName
        });
        
        // Match by employer ID (exact match)
        if (jobEmployerId === userEmployerId) {
          console.log('✅ Matched by employer ID');
          return true;
        }
        
        // Match by employer name (exact match)
        if (jobEmployerName === userName) {
          console.log('✅ Matched by employer name');
          return true;
        }
        
        // Match by company name (exact match)
        if (jobEmployerName === userCompanyName) {
          console.log('✅ Matched by company name');
          return true;
        }
        
        // Match by employer name containing user name (partial match)
        if (userName && jobEmployerName && jobEmployerName.toLowerCase().includes(userName.toLowerCase())) {
          console.log('✅ Matched by partial employer name');
          return true;
        }
        
        // Match by user name containing employer name (partial match)
        if (userName && jobEmployerName && userName.toLowerCase().includes(jobEmployerName.toLowerCase())) {
          console.log('✅ Matched by partial user name');
          return true;
        }
        
        console.log('❌ No match found');
        return false;
      });
      
      console.log(`Found ${employerJobs.length} jobs for employer ${user.name}`);
      return employerJobs;
    } catch (error: any) {
      console.error('Error fetching employer jobs:', error);
      return [];
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      console.log('Deleting job:', jobId);
      const response = await api.delete(`/jobs/${jobId}`);
      console.log('Job deleted successfully:', response.data);
    } catch (error: any) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
}

export const jobService = new JobService();