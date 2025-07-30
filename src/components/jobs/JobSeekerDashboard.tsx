import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { jobService } from '../../services/jobService';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Eye, 
  FileText,
  Bell,
  Target,
  Clock, 
  CheckCircle,
  AlertCircle,
  Search,
  Edit,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Lightbulb,
  Heart,
  MessageSquare,
  Video,
  Mic,
  Link,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  User as UserIcon,
  Building,
  GraduationCap,
  Code,
  Globe,
  Smartphone,
  Monitor,
  Home,
  Coffee,
  HelpCircle,
  Mail
} from 'lucide-react';
import type { JobResponse } from '../../services/jobService';
import type { NotificationResponse } from '../../services/notificationService';
import type { User } from '../../types';

interface Application {
  _id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  cover_letter: string;
  status: string;
  created_at: string;
  job_title?: string;
  company_name?: string;
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  rejectedApplications: number;
  profileCompletion: number;
  unreadNotifications: number;
  savedJobs: number;
  interviewsScheduled: number;
}

export const JobSeekerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [availableJobs, setAvailableJobs] = useState<JobResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0,
    profileCompletion: 0,
    unreadNotifications: 0,
    savedJobs: 0,
    interviewsScheduled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'jobs' | 'activity'>('overview');
  const { user } = useAuth();

  const fetchApplications = async () => {
    try {
      const apps = await jobService.getMyApplications();
      setApplications(apps);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    }
  };

  const fetchAvailableJobs = async () => {
    try {
      const jobs = await jobService.getJobs();
      setAvailableJobs(jobs);
    } catch (err: any) {
      console.error('Error fetching available jobs:', err);
      setAvailableJobs([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notifs = await notificationService.getNotifications();
      setNotifications(notifs.slice(0, 5)); // Show only recent 5
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const profile = await userService.getCurrentUser();
      setUserProfile(profile);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
    }
  };

  const calculateStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status.toLowerCase() === 'pending').length;
    const shortlisted = applications.filter(app => app.status.toLowerCase() === 'shortlisted').length;
    const rejected = applications.filter(app => app.status.toLowerCase() === 'rejected').length;
    
    // Calculate profile completion based on user data
    let completion = 0;
    if (userProfile) {
      const fields = ['name', 'email', 'phone', 'location', 'bio', 'experience_years', 'linkedin_url'];
      const filledFields = fields.filter(field => userProfile[field as keyof User]);
      completion = Math.round((filledFields.length / fields.length) * 100);
    }

    setStats({
      totalApplications: total,
      pendingApplications: pending,
      shortlistedApplications: shortlisted,
      rejectedApplications: rejected,
      profileCompletion: completion,
      unreadNotifications: notifications.filter(n => !n.is_read).length,
      savedJobs: 0, // Will be implemented when saved jobs feature is added
      interviewsScheduled: 0 // Will be implemented when interview scheduling is added
    });
  };

  const fetchData = async () => {
      try {
        setLoading(true);
      setError(null);
      await Promise.all([
        fetchApplications(), 
        fetchAvailableJobs(), 
        fetchNotifications(),
        fetchUserProfile()
      ]);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [applications, notifications, userProfile]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'reviewed': return 'primary';
      case 'shortlisted': return 'success';
      case 'rejected': return 'error';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'shortlisted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRecommendedJobs = () => {
    // Simple recommendation based on user preferences
    if (!userProfile) return availableJobs.slice(0, 5);
    
    // Filter based on user preferences
    const preferredJobs = availableJobs.filter(job => {
      // Filter based on user preferences
      if (userProfile.preferred_job_type && job.job_type !== userProfile.preferred_job_type) return false;
      if (userProfile.preferred_work_mode && job.work_mode !== userProfile.preferred_work_mode) return false;
      return true;
    });
    
    // Combine preferred jobs with all jobs
    const combinedJobs = [...preferredJobs, ...availableJobs];
    
    // Remove duplicates based on job ID
    const uniqueJobs = combinedJobs.filter((job, index, self) => 
      index === self.findIndex(j => j._id === job._id || j.id === job.id)
    );
    
    return uniqueJobs.slice(0, 8); // Show more jobs
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {userProfile?.name || user?.name || 'Job Seeker'}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Track your applications and discover new opportunities
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="flex items-center text-xs sm:text-sm"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.href = '/profile'}
              className="flex items-center text-xs sm:text-sm"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Edit Profile</span>
            </Button>
          </div>
        </div>

        {/* Profile Completion Progress */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">Profile Completion</span>
            </div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {stats.profileCompletion}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.profileCompletion}%` }}
            ></div>
          </div>
          {stats.profileCompletion < 100 && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Complete your profile to increase your chances of getting hired
            </p>
          )}
        </Card>


      </div>

      {error && (
        <Card className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Briefcase className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingApplications}</p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Shortlisted</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.shortlistedApplications}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Unread Notifications</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.unreadNotifications}</p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Bell className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Button
            variant="outline"
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover-lift p-2"
            onClick={() => window.location.href = '/resume-builder'}
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xs sm:text-sm font-medium text-center">Build Resume</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover-lift p-2"
            onClick={() => window.location.href = '/jobs'}
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm font-medium text-center">Find Jobs</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover-lift p-2"
            onClick={() => window.location.href = '/profile'}
          >
            <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            <span className="text-xs sm:text-sm font-medium text-center">Update Profile</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover-lift p-2"
            onClick={() => window.location.href = '/notifications'}
          >
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            <span className="text-xs sm:text-sm font-medium text-center">Notifications</span>
          </Button>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'applications', label: 'Applications', icon: Briefcase },
          { id: 'jobs', label: 'Jobs', icon: Search },
          { id: 'activity', label: 'Activity', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Recent Activity
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/notifications'}
                  className="text-xs sm:text-sm"
                >
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${
                          notification.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* General Job Recommendations */}
          <div className="lg:col-span-2">
            
            {/* General Job Recommendations */}
            <Card className="p-4 sm:p-6 mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" />
                  Other Opportunities
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/jobs'}
                  className="text-xs sm:text-sm"
                >
                  View All Jobs
                </Button>
              </div>
              
              <div className="space-y-4">
                {getRecommendedJobs().length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No recommendations available
                    </p>
                  </div>
                ) : (
                  getRecommendedJobs().slice(0, 4).map((job) => (
                    <Card key={job._id || job.id} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover-lift">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0 sm:mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                              {job.title}
                            </h4>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">
                            {job.company_name || job.employer_name}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {job.salary_min && job.salary_max 
                                ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`
                                : 'Salary not disclosed'
                              }
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {job.created_at ? formatDate(job.created_at) : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2">
                          <Badge variant="primary" className="text-xs">
                            {job.applications_count || 0} applicants
                          </Badge>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.location.href = `/jobs/${job._id || job.id}`}
                            className="text-xs sm:text-sm"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
              My Applications ({applications.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchApplications}
              className="text-xs sm:text-sm"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Refresh
            </Button>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start applying to jobs to track your applications here.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/jobs'}
              >
                <Search className="w-4 h-4 mr-2" />
                Find Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {applications.map((app) => (
                <Card key={app._id} className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover-lift">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                          {app.job_title || 'Job Title'}
                        </h4>
                        <Badge variant={getStatusColor(app.status)} className="flex items-center w-fit">
                          {getStatusIcon(app.status)}
                          <span className="ml-1 text-xs sm:text-sm">{app.status}</span>
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">
                        {app.company_name || 'Company'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                        Applied: {formatDate(app.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/jobs/${app.job_id}`}
                        className="text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        View Job
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cover Letter:
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {app.cover_letter}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'jobs' && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" />
              Available Jobs ({availableJobs.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAvailableJobs}
                className="text-xs sm:text-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/jobs'}
                className="text-xs sm:text-sm"
              >
                <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Browse All Jobs
              </Button>
            </div>
          </div>

          {availableJobs.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No jobs available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Check back later for new job opportunities.
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/jobs'}
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {availableJobs.map((job) => (
                <Card key={job._id || job.id} className="p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover-lift">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                          {job.title}
                        </h4>
                        {job.is_featured && (
                          <Badge variant="primary" className="text-xs w-fit">
                            ⭐ Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm sm:text-lg">
                        {job.company_name || job.employer_name}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          {job.salary_min && job.salary_max 
                            ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`
                            : 'Salary not disclosed'
                          }
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Posted: {job.created_at ? formatDate(job.created_at) : 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                          {job.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">
                          {job.job_type?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {job.work_mode?.replace('_', ' ')}
                        </Badge>
                        {job.experience_level && (
                          <Badge variant="outline" className="text-xs">
                            {job.experience_level} experience
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      <Badge variant="primary" className="text-xs">
                        {job.applications_count || 0} applicants
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/jobs/${job._id || job.id}`}
                          className="text-xs sm:text-sm"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => window.location.href = `/jobs/${job._id || job.id}`}
                          className="text-xs sm:text-sm"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {availableJobs.length > 10 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/jobs'}
                  >
                    View All {availableJobs.length} Jobs
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Recent Notifications */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Recent Notifications
            </h3>
            
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        notification.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              </div>
            </Card>

          {/* Application Timeline */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Application Timeline
            </h3>
            
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No applications yet
                  </p>
                </div>
              ) : (
                applications.slice(0, 5).map((app, index) => (
                  <div key={app._id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      {index < applications.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mx-auto mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Applied to {app.job_title || 'Job'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {app.company_name || 'Company'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(app.created_at)}
                      </p>
                      <Badge variant={getStatusColor(app.status)} className="mt-2">
                        {app.status}
                      </Badge>
        </div>
      </div>
                ))
              )}
            </div>
            </Card>
        </div>
      )}
    </div>
  );
}; 