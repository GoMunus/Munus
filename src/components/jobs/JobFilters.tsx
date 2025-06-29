import React, { useState } from 'react';
import { Search, MapPin, Filter, X, DollarSign, Clock, Briefcase, Monitor, Users, Languages, ChevronDown } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { useJobs } from '../../contexts/JobContext';
import { useTheme } from '../../contexts/ThemeContext';

export const JobFilters: React.FC = () => {
  const { filters, updateFilters, clearFilters } = useJobs();
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 200000 });

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const workModes = [
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const experienceLevels = [
    { value: 'fresher', label: 'Fresher' },
    { value: '1-2', label: '1-2 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5+', label: '5+ years' },
  ];

  const postedWithinOptions = [
    { value: 1, label: 'Last 24 hours' },
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
  ];

  const languages = [
    'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada'
  ];

  const handleJobTypeChange = (type: string) => {
    const currentTypes = filters.jobType || [];
    const newTypes = currentTypes.includes(type as any)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type as any];
    updateFilters({ jobType: newTypes });
  };

  const handleWorkModeChange = (mode: string) => {
    const currentModes = filters.workMode || [];
    const newModes = currentModes.includes(mode as any)
      ? currentModes.filter(m => m !== mode)
      : [...currentModes, mode as any];
    updateFilters({ workMode: newModes });
  };

  const handleExperienceChange = (level: string) => {
    const currentLevels = filters.experience || [];
    const newLevels = currentLevels.includes(level as any)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level as any];
    updateFilters({ experience: newLevels });
  };

  const handleLanguageChange = (language: string) => {
    const currentLanguages = filters.languages || [];
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(l => l !== language)
      : [...currentLanguages, language];
    updateFilters({ languages: newLanguages });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.location) count++;
    if (filters.jobType?.length) count += filters.jobType.length;
    if (filters.workMode?.length) count += filters.workMode.length;
    if (filters.experience?.length) count += filters.experience.length;
    if (filters.postedWithin) count++;
    if (filters.languages?.length) count += filters.languages.length;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search jobs, companies, or skills..."
              value={filters.search || ''}
              onChange={(e) => updateFilters({ search: e.target.value })}
              icon={<Search className="w-4 h-4" />}
              fullWidth
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Location (e.g., Bangalore, Remote)"
              value={filters.location || ''}
              onChange={(e) => updateFilters({ location: e.target.value })}
              icon={<MapPin className="w-4 h-4" />}
              fullWidth
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            icon={<Filter className="w-4 h-4" />}
            className="flex items-center space-x-2"
          >
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="primary" size="sm">
                {getActiveFiltersCount()}
              </Badge>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </Card>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card className="animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Job Type */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Job Type
              </h3>
              <div className="space-y-2">
                {jobTypes.map((type) => (
                  <label key={type.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={filters.jobType?.includes(type.value as any) || false}
                      onChange={() => handleJobTypeChange(type.value)}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                Work Mode
              </h3>
              <div className="space-y-2">
                {workModes.map((mode) => (
                  <label key={mode.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={filters.workMode?.includes(mode.value as any) || false}
                      onChange={() => handleWorkModeChange(mode.value)}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {mode.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Experience
              </h3>
              <div className="space-y-2">
                {experienceLevels.map((level) => (
                  <label key={level.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={filters.experience?.includes(level.value as any) || false}
                      onChange={() => handleExperienceChange(level.value)}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Posted Within */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Posted Within
              </h3>
              <div className="space-y-2">
                {postedWithinOptions.map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="postedWithin"
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={filters.postedWithin === option.value}
                      onChange={() => updateFilters({ postedWithin: option.value })}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Salary Range (Monthly)
              </h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={salaryRange.min || ''}
                    onChange={(e) => setSalaryRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={salaryRange.max || ''}
                    onChange={(e) => setSalaryRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => updateFilters({
                    salaryRange: {
                      min: salaryRange.min,
                      max: salaryRange.max,
                      currency: 'INR',
                      period: 'month'
                    }
                  })}
                >
                  Apply Range
                </Button>
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Languages className="w-4 h-4 mr-2" />
                Languages
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {languages.map((language) => (
                  <label key={language} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={filters.languages?.includes(language) || false}
                      onChange={() => handleLanguageChange(language)}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {language}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={clearFilters}
              icon={<X className="w-4 h-4" />}
            >
              Clear All Filters
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsExpanded(false)}
            >
              Apply Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="primary" className="flex items-center">
              Search: {filters.search}
              <button
                onClick={() => updateFilters({ search: '' })}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.location && (
            <Badge variant="primary" className="flex items-center">
              Location: {filters.location}
              <button
                onClick={() => updateFilters({ location: '' })}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.jobType?.map((type) => (
            <Badge key={type} variant="secondary" className="flex items-center">
              {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              <button
                onClick={() => handleJobTypeChange(type)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.workMode?.map((mode) => (
            <Badge key={mode} variant="success" className="flex items-center">
              {mode.replace(/\b\w/g, l => l.toUpperCase())}
              <button
                onClick={() => handleWorkModeChange(mode)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {filters.experience?.map((level) => (
            <Badge key={level} variant="warning" className="flex items-center">
              {level} years
              <button
                onClick={() => handleExperienceChange(level)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};