import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ToastContainer, useToast } from '../common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { jobService } from '../../services/jobService';
import { 
  Users, 
  Eye, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  AlertTriangle, 
  Briefcase, 
  Plus,
  TrendingUp,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  RefreshCw,
  Building,
  Target,
  Zap,
  Search,
  Bookmark,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import type { JobResponse } from '../../services/jobService';

interface Application {
  _id: string;
  applicant_name: string;
  applicant_email: string;
  cover_letter: string;
  status: string;
  created_at: string;
}

interface DeleteJobDialog {
  isOpen: boolean;
  jobId: string | null;
  jobTitle: string;
  applicationsCount: number;
}

interface EmployerDashboardProps {
  onNavigate?: (view: 'home' | 'jobs' | 'resume' | 'profile' | 'create-profile' | 'dashboard' | 'post-job' | 'candidates' | 'faqs' | 'contact') => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteJobDialog>({
    isOpen: false,
    jobId: null,
    jobTitle: '',
    applicationsCount: 0
  });
  const [deletingJob, setDeletingJob] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toasts, removeToast, success, error: showError } = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await jobService.getEmployerJobs();
      setJobs(jobsData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId: string) => {
    try {
      setLoadingApplications(true);
      const apps = await jobService.getJobApplications(jobId);
      setApplications(apps);
      setSelectedJob(jobId);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleJobPosted = () => {
    fetchJobs();
  };

  const openDeleteDialog = (job: JobResponse) => {
    setDeleteDialog({
      isOpen: true,
      jobId: job._id || job.id || '',
      jobTitle: job.title,
      applicationsCount: job.applications_count || 0
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      jobId: null,
      jobTitle: '',
      applicationsCount: 0
    });
  };

  const handleDeleteJob = async () => {
    if (!deleteDialog.jobId) return;

    try {
      setDeletingJob(true);
      await jobService.deleteJob(deleteDialog.jobId);
      
      // Close dialog and refresh jobs
      closeDeleteDialog();
      await fetchJobs();
      
      // Show success toast
      success('Job Deleted Successfully', `"${deleteDialog.jobTitle}" has been permanently deleted.`);
    } catch (err: any) {
      console.error('Error deleting job:', err);
      const errorMessage = err.message || 'Failed to delete job. Please try again.';
      setError(errorMessage);
      showError('Delete Failed', errorMessage);
    } finally {
      setDeletingJob(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    if (max) return `Up to ₹${max.toLocaleString()}`;
    return 'Not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDeleteMessage = () => {
    const { jobTitle, applicationsCount } = deleteDialog;
    
    if (applicationsCount > 0) {
      return `Are you sure you want to delete "${jobTitle}"? This job has ${applicationsCount} application${applicationsCount > 1 ? 's' : ''} and this action cannot be undone.`;
    }
    
    return `Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`;
  };

  // Calculate statistics
  const activeJobsCount = jobs.length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
  const profileViews = 0; // TODO: Implement profile views tracking
  const hiredThisMonth = 0; // TODO: Implement hiring tracking

  // Stats array for the beautiful cards
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
      value: totalApplications.toString(),
      change: `${totalApplications} this week`,
      icon: <Users className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      trend: 'neutral'
    },
    {
      title: 'Profile Views',
      value: profileViews.toString(),
      change: '0% vs last month',
      icon: <Eye className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      trend: 'neutral'
    },
    {
      title: 'Hired This Month',
      value: hiredThisMonth.toString(),
      change: '0 pending offers',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      trend: 'neutral'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'new': return 'primary';
      case 'reviewed': return 'secondary';
      case 'shortlisted': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
        theme === 'light' ? 'bg-light-pattern' : ''
      }`}>
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
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>User ID: {user?.id}</span>
                <span className="mx-2">•</span>
                <span>Email: {user?.email}</span>
                <span className="mx-2">•</span>
                <span>Role: {user?.role}</span>
              </div>
          </div>
          <Button
            variant="primary"
            size="lg"
              onClick={() => onNavigate?.('post-job')}
            icon={<Plus className="w-5 h-5" />}
            className="shadow-lg hover-lift"
          >
            Post New Job
          </Button>
        </div>
      </div>

        {error && (
          <Card className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium">Error</p>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

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
                    onClick={() => onNavigate?.('post-job')}
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
                                  ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`
                                : 'Salary not disclosed'
                              }
                            </span>
                          </div>
                        </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span>Employer: {job.employer_name}</span>
                            <span className="mx-2">•</span>
                            <span>Company: {job.company_name}</span>
                            <span className="mx-2">•</span>
                            <span>Created: {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {job.description}
                        </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => fetchApplications(job._id || job.id || '')}
                            disabled={loadingApplications && selectedJob === (job._id || job.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {loadingApplications && selectedJob === (job._id || job.id) ? 'Loading...' : 'View Applications'}
                        </Button>
                        <Button 
                            variant="outline"
                          size="sm" 
                            onClick={() => openDeleteDialog(job)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 hover:border-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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

        {/* Skills in Demand */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            Skills in Demand
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['React', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning'].map((skill) => (
              <Card key={skill} className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <div className={`text-sm font-medium ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {skill}
                </div>
                <div className="text-xs text-green-600 mt-1">+15% demand</div>
              </Card>
              ))}
            </div>
        </div>

        {/* Delete Confirmation Dialog */}
      <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteJob}
          title="Delete Job Posting"
          message={getDeleteMessage()}
        confirmText="Delete Job"
        cancelText="Cancel"
        variant="danger"
          loading={deletingJob}
        />

        {/* Applications Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Applications
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedJob(null);
                      setApplications([]);
                    }}
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No applications yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Applications will appear here when candidates apply to your job.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <Card key={app._id} className="p-4 hover-lift transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {app.applicant_name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {app.applicant_email}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {app.status}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Cover Letter:</strong>
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {app.cover_letter}
                          </p>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Applied: {formatDate(app.created_at)}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
    </>
  );
};