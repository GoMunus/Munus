import React from 'react';
import { Loader2, Briefcase, AlertCircle } from 'lucide-react';
import { JobCard } from './JobCard';
import { useJobs } from '../../contexts/JobContext';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const JobList: React.FC = () => {
  const { filteredJobs, loading, error, refetchJobs } = useJobs();
  const { isAuthenticated } = useAuth();

  const handleApply = (jobId: number) => {
    if (!isAuthenticated) {
      // Show login modal or redirect to login
      console.log('Please login to apply for jobs');
      return;
    }
    
    // Handle job application
    console.log('Applying to job:', jobId);
    // TODO: Implement application logic
  };

  const handleSave = (jobId: number) => {
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
          onClick={refetchJobs}
          className="mx-auto"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  if (filteredJobs.length === 0) {
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
            {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
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
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onApply={handleApply}
            onSave={handleSave}
            isSaved={false} // TODO: Implement saved jobs logic
          />
        ))}
      </div>

      {/* Load More Button */}
      {filteredJobs.length >= 20 && (
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
    </div>
  );
};