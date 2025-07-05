import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jobService, type JobResponse } from '../services/jobService';
import { useApi } from '../hooks/useApi';
import { useAuth } from './AuthContext';
import type { JobFilters } from '../types';

interface JobContextValue {
  jobs: JobResponse[];
  filteredJobs: JobResponse[];
  filters: JobFilters;
  updateFilters: (filters: Partial<JobFilters>) => void;
  clearFilters: () => void;
  searchJobs: (query: string) => void;
  loading: boolean;
  error: string | null;
  totalJobs: number;
  refetchJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextValue | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: React.ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<JobFilters>({});
  const [filteredJobs, setFilteredJobs] = useState<JobResponse[]>([]);
  const { isAuthenticated } = useAuth();

  const {
    data: jobs = [],
    loading,
    error,
    refetch: refetchJobs,
  } = useApi(() => jobService.getJobs(filters), {
    immediate: isAuthenticated, // Only fetch jobs if user is authenticated
    onError: (error) => {
      console.error('Failed to fetch jobs:', error);
    },
  });

  // Apply filters whenever jobs or filters change
  useEffect(() => {
    if (!jobs || !Array.isArray(jobs)) {
      setFilteredJobs([]);
      return;
    }

    try {
      let filtered = [...jobs];

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(job =>
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower) ||
          (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchLower)))
        );
      }

      // Apply location filter
      if (filters.location) {
        filtered = filtered.filter(job =>
          job.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      // Apply job type filter
      if (filters.jobType && filters.jobType.length > 0) {
        filtered = filtered.filter(job => filters.jobType!.includes(job.job_type as any));
      }

      // Apply work mode filter
      if (filters.workMode && filters.workMode.length > 0) {
        filtered = filtered.filter(job => filters.workMode!.includes(job.work_mode as any));
      }

      // Apply experience filter
      if (filters.experience && filters.experience.length > 0) {
        filtered = filtered.filter(job => filters.experience!.includes(job.experience_level as any));
      }

      // Apply salary filter
      if (filters.salaryRange) {
        filtered = filtered.filter(job => {
          if (!job.salary_min && !job.salary_max) return true;
          
          const minSalary = filters.salaryRange!.min || 0;
          const maxSalary = filters.salaryRange!.max || Infinity;
          
          // Check if job salary range overlaps with filter range
          if (job.salary_min && job.salary_max) {
            return job.salary_max >= minSalary && job.salary_min <= maxSalary;
          } else if (job.salary_min) {
            return job.salary_min <= maxSalary;
          } else if (job.salary_max) {
            return job.salary_max >= minSalary;
          }
          
          return true;
        });
      }

      // Apply posted within filter
      if (filters.postedWithin) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.postedWithin);
        
        filtered = filtered.filter(job => {
          try {
            const jobDate = new Date(job.created_at);
            return jobDate >= cutoffDate;
          } catch (e) {
            console.error('Invalid date format:', job.created_at);
            return true; // Include jobs with invalid dates
          }
        });
      }

      // Apply skills filter
      if (filters.skills && filters.skills.length > 0) {
        filtered = filtered.filter(job =>
          filters.skills!.some(skill =>
            job.skills && job.skills.some(jobSkill => 
              jobSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }

      setFilteredJobs(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredJobs(jobs || []);
    }
  }, [jobs, filters]);

  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const searchJobs = useCallback((query: string) => {
    updateFilters({ search: query });
  }, [updateFilters]);

  const refetchJobsAsync = useCallback(async () => {
    await refetchJobs();
  }, [refetchJobs]);

  // Refetch jobs when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refetchJobs();
    }
  }, [isAuthenticated, refetchJobs]);

  return (
    <JobContext.Provider
      value={{
        jobs: Array.isArray(jobs) ? jobs : [],
        filteredJobs,
        filters,
        updateFilters,
        clearFilters,
        searchJobs,
        loading,
        error,
        totalJobs: Array.isArray(jobs) ? jobs.length : 0,
        refetchJobs: refetchJobsAsync,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};