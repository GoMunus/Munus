import { api } from './api';
import type { JobFilters } from '../types';

export interface JobResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  job_type: string;
  work_mode: string;
  experience_level: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  application_deadline?: string;
  is_active: boolean;
  is_featured: boolean;
  employer_id: number;
  company_id?: number;
  created_at: string;
  updated_at?: string;
  applications_count: number;
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
      console.log('JobService: Creating job with data:', jobData);
      console.log('JobService: Making request to /jobs/');
      
      // Use the authenticated endpoint for job creation
      const response = await api.post<JobResponse>('/jobs/', jobData); // legacy/unauthenticated
      // const response = await api.post<JobResponse>('/mongodb_jobs/', jobData); // legacy/unauthenticated
      // Correct endpoint:
      // const response = await api.post<JobResponse>('/api/v1/jobs/', jobData);
      // But since api.ts already prepends /api/v1, just use '/jobs/'
      
      console.log('JobService: Job created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('JobService: Error creating job:', error);
      console.error('JobService: Error response:', error.response);
      console.error('JobService: Error message:', error.message);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to create job';
      throw new Error(errorMessage);
    }
  }
}

export const jobService = new JobService();