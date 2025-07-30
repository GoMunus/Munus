import React, { useState } from 'react';
import { X, FileText, Video, Mic, Link, Send, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { jobService } from '../../services/jobService';
import type { JobResponse } from '../../services/jobService';

interface JobApplicationModalProps {
  job: JobResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ApplicationFormData {
  cover_letter: string;
  resume_url?: string;
  video_resume_url?: string;
  audio_resume_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user: authUser, isJobSeeker, isAuthenticated } = useAuth();
  
  console.log('JobApplicationModal: User info:', {
    user: authUser,
    isJobSeeker: isJobSeeker,
    isAuthenticated: isAuthenticated,
    userRole: authUser?.role
  });
  const [formData, setFormData] = useState<ApplicationFormData>({
    cover_letter: '',
    resume_url: '',
    video_resume_url: '',
    audio_resume_url: '',
    portfolio_url: '',
    linkedin_url: '',
    github_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { theme } = useTheme();
  const { user } = useAuth();

  const updateFormData = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please log in to apply for this job');
      return;
    }
    
    if (!isJobSeeker) {
      setError('Only job seekers can apply for jobs');
      return;
    }
    
    if (!formData.cover_letter.trim()) {
      setError('Cover letter is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const jobId = job._id || job.id;
      if (!jobId) {
        throw new Error('Invalid job ID');
      }

      // TEMPORARY: Use simple endpoint to bypass authentication
      console.log('JobApplicationModal: Using simple endpoint to bypass authentication');
      await jobService.simpleApplyForJob(jobId, formData);
      
      // Set success message
      setSuccess('Application submitted successfully! The employer will review your application.');
      
      // Reset form
      setFormData({
        cover_letter: '',
        resume_url: '',
        video_resume_url: '',
        audio_resume_url: '',
        portfolio_url: '',
        linkedin_url: '',
        github_url: ''
      });
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error applying to job:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      let errorMessage = 'Failed to apply to job';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in to apply for this job';
      } else if (err.response?.status === 403) {
        errorMessage = 'Only job seekers can apply for jobs';
      } else if (err.response?.status === 404) {
        errorMessage = 'Job not found';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Apply to Job
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {job.title} at {job.company_name || job.employer_name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="w-5 h-5" />}
            />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Summary */}
          <Card className="p-4 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Position:</span>
                <p className="text-gray-900 dark:text-white">{job.title}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Company:</span>
                <p className="text-gray-900 dark:text-white">{job.company_name || job.employer_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                <p className="text-gray-900 dark:text-white">{job.location}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                <p className="text-gray-900 dark:text-white">{job.job_type?.replace('_', ' ')}</p>
              </div>
            </div>
          </Card>

          {/* Cover Letter - Required */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.cover_letter}
              onChange={(e) => updateFormData('cover_letter', e.target.value)}
              placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
              className={`w-full p-3 border rounded-lg resize-none ${
                theme === 'light' 
                  ? 'border-gray-300 bg-white text-gray-900' 
                  : 'border-gray-600 bg-gray-700 text-white'
              }`}
              rows={6}
              required
            />
          </div>

          {/* Optional Fields - Collapsible */}
          <details className="group">
            <summary className={`cursor-pointer text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Additional Information (Optional)
            </summary>
            <div className="space-y-4 mt-4">
              {/* Resume URL */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Resume URL
                </label>
                <Input
                  type="url"
                  value={formData.resume_url}
                  onChange={(e) => updateFormData('resume_url', e.target.value)}
                  placeholder="https://example.com/resume.pdf"
                  icon={<FileText className="w-4 h-4" />}
                />
              </div>

              {/* Portfolio URL */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Portfolio URL
                </label>
                <Input
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => updateFormData('portfolio_url', e.target.value)}
                  placeholder="https://portfolio.com"
                  icon={<Link className="w-4 h-4" />}
                />
              </div>

              {/* GitHub URL */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  GitHub URL
                </label>
                <Input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => updateFormData('github_url', e.target.value)}
                  placeholder="https://github.com/username"
                  icon={<Link className="w-4 h-4" />}
                />
              </div>
            </div>
          </details>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              icon={isSubmitting ? undefined : <Send className="w-4 h-4" />}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 