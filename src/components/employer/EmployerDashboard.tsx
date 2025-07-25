import React, { useEffect, useState } from 'react';
import { Plus, Users, Briefcase, Eye, TrendingUp, Calendar, MapPin, DollarSign, Clock, Star, BarChart3, PieChart, Activity, RefreshCw, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { JobPostingBuilder } from './JobPostingBuilder';
import { jobService } from '../../services/jobService';
import { JobCard } from '../jobs/JobCard';
import { useToast } from '../common/Toast';

interface EmployerDashboardProps {
  onNavigate: (view: 'dashboard' | 'post-job' | 'jobs' | 'profile') => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { success, error } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [showJobBuilder, setShowJobBuilder] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<{ id: string; title: string } | null>(null);

  // Remove the static stats array and make it dynamic
  const activeJobsCount = jobs.length;

  const stats = [
    {
      title: 'Active Jobs',
      value: activeJobsCount.toString(),
      change: `${activeJobsCount} posted`,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      trend: 'neutral'
    },
    {
      title: 'Total Applications',
      value: '0',
      change: '0 this week',
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      trend: 'neutral'
    },
    {
      title: 'Profile Views',
      value: '0',
      change: '0% vs last month',
      icon: <Eye className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      trend: 'neutral'
    },
    {
      title: 'Hired This Month',
      value: '0',
      change: '0 pending offers',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      trend: 'neutral'
    }
  ];

  const recentJobs = [];
  const recentApplications = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'new': return 'primary';
      case 'reviewed': return 'secondary';
      case 'shortlisted': return 'success';
      default: return 'default';
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      console.log('Fetching employer jobs...');
      const allJobs = await jobService.getEmployerJobs();
      console.log('All jobs received:', allJobs);
      
      // Filter by published status if available, otherwise show all
      const publishedJobs = allJobs.filter(job => 
        !job.status || job.status === 'published' || job.status === 'active'
      );
      
      console.log('Published jobs:', publishedJobs);
      setJobs(publishedJobs);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Error fetching employer jobs:', e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobPosted = (newJob: any) => {
    setShowJobBuilder(false);
    fetchJobs();
  };

  const handleDeleteJob = (jobId: string, jobTitle: string) => {
    setJobToDelete({ id: jobId, title: jobTitle });
    setShowDeleteDialog(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    setDeletingJobId(jobToDelete.id);
    setShowDeleteDialog(false);
    
    try {
      await jobService.deleteJob(jobToDelete.id);
      console.log('Job deleted successfully');
      // Refresh the job list
      await fetchJobs();
      success('Job deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting job:', err);
      error('Failed to delete job. Please try again.');
    } finally {
      setDeletingJobId(null);
      setJobToDelete(null);
    }
  };

  const cancelDeleteJob = () => {
    setShowDeleteDialog(false);
    setJobToDelete(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[600px]">
          <LoadingSpinner size="lg" text="Loading dashboard data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p className={`text-lg ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Here's what's happening with your hiring
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => onNavigate('post-job')}
            icon={<Plus className="w-5 h-5" />}
            className="shadow-lg hover-lift"
          >
            Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} hover className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-10 -mt-10`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <Badge variant="outline" size="sm">
                  New
                </Badge>
              </div>
              <h3 className={`text-2xl font-bold mb-1 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {stat.value}
              </h3>
              <p className={`text-sm font-medium ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {stat.title}
              </p>
              <p className={`text-xs mt-1 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {stat.change}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  Your Job Postings ({jobs.length})
                </h2>
                {lastUpdated && (
                  <p className={`text-sm ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchJobs}
                  disabled={loading}
                  icon={loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </div>
            {jobs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No job postings yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Start attracting top talent by posting your first job opening.
                </p>
                <Button
                  variant="primary"
                  onClick={() => onNavigate('post-job')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job._id || job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {job.title}
                          </h3>
                          <Badge variant="success" className="text-xs">
                            {job.status || 'Published'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.job_type?.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              {job.salary_min && job.salary_max 
                                ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                                : 'Salary not disclosed'
                              }
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <span className="text-xs text-gray-500">
                            Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {job.applications_count || 0} applications
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          View Applications
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteJob(job._id || job.id, job.title)}
                          disabled={deletingJobId === (job._id || job.id)}
                        >
                          {deletingJobId === (job._id || job.id) ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          {deletingJobId === (job._id || job.id) ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Applications */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                Recent Applications
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            
            <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Post a job to start receiving applications from qualified candidates.
              </p>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                icon={<Users className="w-4 h-4" />}
                className="justify-start"
              >
                Browse Candidates
              </Button>
              <Button
                variant="outline"
                fullWidth
                icon={<BarChart3 className="w-4 h-4" />}
                className="justify-start"
              >
                View Analytics
              </Button>
              <Button
                variant="outline"
                fullWidth
                icon={<Star className="w-4 h-4" />}
                className="justify-start"
              >
                Upgrade Plan
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Hiring Analytics
            </h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Last 7 days
              </Button>
              <Button variant="outline" size="sm">
                Last 30 days
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 ${
                theme === 'dark-neon' ? 'shadow-lg shadow-blue-500/25' : 'shadow-lg'
              }`}>
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                0%
              </h3>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Application Response Rate
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 ${
                theme === 'dark-neon' ? 'shadow-lg shadow-green-500/25' : 'shadow-lg'
              }`}>
                <PieChart className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                0 days
              </h3>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Average Time to Hire
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 ${
                theme === 'dark-neon' ? 'shadow-lg shadow-purple-500/25' : 'shadow-lg'
              }`}>
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                0%
              </h3>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Candidate Satisfaction
              </p>
            </div>
          </div>
        </Card>
      </div>

      {showJobBuilder && (
        <JobPostingBuilder onBack={() => setShowJobBuilder(false)} onJobPosted={handleJobPosted} />
      )}

      {/* Active Jobs Section (bottom of dashboard) */}
      {!showJobBuilder && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Active Jobs ({activeJobsCount})</h2>
          {jobs.length === 0 ? (
            <p>No active jobs yet. Click 'Post New Job' to add one.</p>
          ) : (
            <div className="grid gap-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={cancelDeleteJob}
        onConfirm={confirmDeleteJob}
        title="Delete Job"
        message={`Are you sure you want to delete "${jobToDelete?.title}"? This action cannot be undone and will permanently remove the job posting.`}
        confirmText="Delete Job"
        cancelText="Cancel"
        variant="danger"
        loading={deletingJobId !== null}
      />
    </div>
  );
};