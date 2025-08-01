import React, { useState, useEffect } from 'react';
import { Briefcase, AlertCircle } from 'lucide-react';
import { JobCard } from './JobCard';
import { JobApplicationModal } from './JobApplicationModal';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { jobService } from '../../services/jobService';
import type { JobResponse } from '../../services/jobService';
import { useToast } from '../common/Toast';

export const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await jobService.getJobs();
      setJobs(jobsData);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = (jobId: string) => {
    if (!isAuthenticated) {
      // Show login modal or redirect to login
      showError('Login Required', 'Please login to apply for jobs');
      return;
    }
    
    // Find the job by ID
    const job = jobs.find(j => (j.id || j._id) === jobId);
    if (!job) {
      showError('Error', 'Job not found');
      return;
    }
    
    // Open application modal with the selected job
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    // Refresh the job list to update application counts
    fetchJobs();
    // Show success message
    success('Application Submitted', 'Your application has been submitted successfully!');
  };

  const handleSave = (jobId: string) => {
    if (!isAuthenticated) {
      console.log('Please login to save jobs');
      return;
    }
    
    // Handle job save/bookmark
    console.log('Saving job:', jobId);
    // TODO: Implement save logic
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading amazing job opportunities..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Failed to Load Jobs
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
          {error}
        </p>
        <Button
          variant="primary"
          onClick={fetchJobs}
          className="mx-auto"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="text-center py-12">
        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No jobs found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
          There are currently no job postings available. Check back later for new opportunities.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover your next career opportunity
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="salary-high">Highest Salary</option>
            <option value="salary-low">Lowest Salary</option>
            <option value="relevance">Most Relevant</option>
          </select>
        </div>
      </div>
      
      <div className="grid gap-6">
        {jobs.map((job: JobResponse) => (
          <JobCard
            key={job.id || job._id}
            job={job}
            onApply={handleApply}
            onSave={handleSave}
            isSaved={false} // TODO: Implement saved jobs logic
          />
        ))}
      </div>

      {/* Load More Button */}
      {jobs.length >= 20 && (
        <div className="text-center pt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              // TODO: Implement pagination
              console.log('Load more jobs');
            }}
          >
            Load More Jobs
          </Button>
        </div>
      )}

      {/* Job Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          isOpen={isApplicationModalOpen}
          onClose={() => {
            setIsApplicationModalOpen(false);
            setSelectedJob(null);
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};