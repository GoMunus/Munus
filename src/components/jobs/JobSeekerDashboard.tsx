import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign,
  Building,
  Star,
  Eye,
  Send,
  Bookmark,
  TrendingUp,
  Users,
  Calendar,
  Target
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  posted_date: string;
  is_featured?: boolean;
  is_urgent?: boolean;
}

interface JobSeekerDashboardProps {
  onNavigate: (view: 'home' | 'jobs' | 'resume' | 'profile' | 'create-profile' | 'dashboard' | 'post-job' | 'candidates' | 'faqs' | 'contact') => void;
}

export const JobSeekerDashboard: React.FC<JobSeekerDashboardProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    type: '',
    experience: ''
  });
  const { user } = useAuth();
  const { theme } = useTheme();

  // Mock data for demonstration
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$120,000 - $150,000',
        description: 'We are looking for a skilled Frontend Developer to join our team...',
        requirements: ['React', 'TypeScript', '5+ years experience'],
        posted_date: '2024-01-15',
        is_featured: true,
        is_urgent: true
      },
      {
        id: '2',
        title: 'UX/UI Designer',
        company: 'Design Studio Inc',
        location: 'Remote',
        type: 'Contract',
        salary: '$80,000 - $100,000',
        description: 'Join our creative team to design amazing user experiences...',
        requirements: ['Figma', 'Adobe Creative Suite', '3+ years experience'],
        posted_date: '2024-01-14',
        is_featured: true
      },
      {
        id: '3',
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$130,000 - $160,000',
        description: 'Lead product strategy and development for our growing platform...',
        requirements: ['Product Management', 'Agile', '5+ years experience'],
        posted_date: '2024-01-13'
      }
    ];

    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !selectedFilters.location || job.location.includes(selectedFilters.location);
    const matchesType = !selectedFilters.type || job.type === selectedFilters.type;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const stats = [
    { label: 'Jobs Applied', value: '12', icon: Send, color: 'text-blue-600' },
    { label: 'Profile Views', value: '45', icon: Eye, color: 'text-green-600' },
    { label: 'Saved Jobs', value: '8', icon: Bookmark, color: 'text-purple-600' },
    { label: 'Interviews', value: '3', icon: Users, color: 'text-orange-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${
      theme === 'light' ? 'bg-light-pattern' : ''
    }`}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Welcome back, {user?.name?.split(' ')[0] || 'Job Seeker'}! 👋
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Ready to find your next opportunity? Here's what's happening with your job search.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('resume')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Update Resume</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Keep your profile fresh</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('profile')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Profile Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View your performance</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('jobs')}>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Browse Jobs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Find new opportunities</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Job Opportunities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Job Opportunities
          </h2>
          <Button 
            variant="outline" 
            onClick={() => onNavigate('jobs')}
            className="flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>View All</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.slice(0, 4).map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    {job.is_featured && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Featured
                      </span>
                    )}
                    {job.is_urgent && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {job.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button size="sm" className="flex items-center space-x-1">
                    <Send className="w-4 h-4" />
                    <span>Apply Now</span>
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center space-x-1">
                    <Bookmark className="w-4 h-4" />
                    <span>Save</span>
                  </Button>
                </div>
                <span className="text-xs text-gray-500">
                  Posted {new Date(job.posted_date).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recommended Skills */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Skills in Demand
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['React', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning'].map((skill) => (
            <Card key={skill} className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{skill}</div>
              <div className="text-xs text-green-600 mt-1">+15% demand</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}; 