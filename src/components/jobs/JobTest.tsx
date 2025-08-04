import React, { useEffect, useState } from 'react';
import { jobService } from '../../services/jobService';
import { Card } from '../ui/Card';

export const JobTest: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testJobFetching = async () => {
      try {
        console.log('JobTest: Starting job fetch test...');
        setLoading(true);
        setError(null);
        
        const result = await jobService.getJobs();
        console.log('JobTest: Fetch result:', result);
        
        if (Array.isArray(result)) {
          setJobs(result);
          console.log('JobTest: Successfully set jobs:', result.length);
        } else {
          console.error('JobTest: Result is not an array:', result);
          setError('Invalid response format');
        }
      } catch (err: any) {
        console.error('JobTest: Error fetching jobs:', err);
        setError(err.message || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    testJobFetching();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Job Fetch Test</h2>
        <p>Loading jobs...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Job Fetch Test</h2>
        <p className="text-red-600">Error: {error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Job Fetch Test</h2>
      <p className="mb-4">Successfully fetched {jobs.length} jobs!</p>
      <div className="space-y-2">
        {jobs.slice(0, 5).map((job, index) => (
          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <h3 className="font-semibold">{job.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{job.company_name} - {job.location}</p>
          </div>
        ))}
        {jobs.length > 5 && (
          <p className="text-sm text-gray-500">... and {jobs.length - 5} more jobs</p>
        )}
      </div>
    </Card>
  );
}; 