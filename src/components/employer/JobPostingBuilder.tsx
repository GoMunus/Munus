import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Save, Eye, Send, Building, MapPin, DollarSign, Clock, Users, Briefcase, GraduationCap, Star, Zap, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface JobPostingBuilderProps {
  onBack: () => void;
}

interface JobData {
  title: string;
  department: string;
  location: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'fresher' | '1-2' | '3-5' | '5+';
  salaryMin: string;
  salaryMax: string;
  currency: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
  applicationDeadline: string;
}

const steps = [
  { id: 'basic', name: 'Basic Info', icon: Building },
  { id: 'details', name: 'Job Details', icon: Briefcase },
  { id: 'requirements', name: 'Requirements', icon: GraduationCap },
  { id: 'description', name: 'Description', icon: Sparkles },
  { id: 'preview', name: 'Preview', icon: Eye },
];

export const JobPostingBuilder: React.FC<JobPostingBuilderProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    department: '',
    location: '',
    workMode: 'hybrid',
    jobType: 'full-time',
    experienceLevel: '3-5',
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    description: '',
    responsibilities: [''],
    requirements: [''],
    skills: [],
    benefits: [''],
    applicationDeadline: '',
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();

  const updateJobData = (field: keyof JobData, value: any) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const addListItem = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    setJobData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateListItem = (field: 'responsibilities' | 'requirements' | 'benefits', index: number, value: string) => {
    setJobData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeListItem = (field: 'responsibilities' | 'requirements' | 'benefits', index: number) => {
    setJobData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !jobData.skills.includes(skill.trim())) {
      updateJobData('skills', [...jobData.skills, skill.trim()]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateJobData('skills', jobData.skills.filter(skill => skill !== skillToRemove));
  };

  const generateAIDescription = async () => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiDescription = `We are seeking a talented ${jobData.title} to join our dynamic team at ${(user as any)?.company || 'our company'}. This is an exciting opportunity to work on cutting-edge projects and make a significant impact in a fast-growing organization.

As a ${jobData.title}, you will be responsible for driving innovation, collaborating with cross-functional teams, and delivering high-quality solutions that meet our business objectives. You'll have the opportunity to work with the latest technologies and methodologies while contributing to our mission of creating exceptional user experiences.

We offer a collaborative work environment, competitive compensation, and excellent growth opportunities. Join us in shaping the future of technology and making a meaningful difference in the industry.`;

    updateJobData('description', aiDescription);
    setIsGeneratingAI(false);
  };

  const generateAIResponsibilities = async () => {
    setIsGeneratingAI(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiResponsibilities = [
      `Lead and execute ${jobData.title.toLowerCase()} projects from conception to completion`,
      'Collaborate with cross-functional teams to define project requirements and deliverables',
      'Implement best practices and maintain high-quality standards',
      'Mentor junior team members and contribute to knowledge sharing',
      'Stay updated with industry trends and emerging technologies',
      'Participate in code reviews and technical discussions'
    ];
    
    updateJobData('responsibilities', aiResponsibilities);
    setIsGeneratingAI(false);
  };

  const generateAIRequirements = async () => {
    setIsGeneratingAI(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiRequirements = [
      `${jobData.experienceLevel === 'fresher' ? '0-1' : jobData.experienceLevel} years of experience in relevant field`,
      'Strong problem-solving and analytical skills',
      'Excellent communication and teamwork abilities',
      'Bachelor\'s degree in Computer Science or related field',
      'Experience with modern development tools and methodologies',
      'Passion for learning and staying updated with technology trends'
    ];
    
    updateJobData('requirements', aiRequirements);
    setIsGeneratingAI(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Job Title"
          placeholder="Senior Frontend Developer"
          value={jobData.title}
          onChange={(e) => updateJobData('title', e.target.value)}
          icon={<Briefcase className="w-4 h-4" />}
          fullWidth
        />
        
        <Input
          label="Department"
          placeholder="Engineering"
          value={jobData.department}
          onChange={(e) => updateJobData('department', e.target.value)}
          icon={<Building className="w-4 h-4" />}
          fullWidth
        />
        
        <Input
          label="Location"
          placeholder="Bangalore, India"
          value={jobData.location}
          onChange={(e) => updateJobData('location', e.target.value)}
          icon={<MapPin className="w-4 h-4" />}
          fullWidth
        />
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            Work Mode
          </label>
          <select
            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent ${
              theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                : 'border-gray-600 bg-gray-800 text-white focus:ring-cyan-500'
            }`}
            value={jobData.workMode}
            onChange={(e) => updateJobData('workMode', e.target.value)}
          >
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderJobDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            Job Type
          </label>
          <select
            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent ${
              theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                : 'border-gray-600 bg-gray-800 text-white focus:ring-cyan-500'
            }`}
            value={jobData.jobType}
            onChange={(e) => updateJobData('jobType', e.target.value)}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            Experience Level
          </label>
          <select
            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent ${
              theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                : 'border-gray-600 bg-gray-800 text-white focus:ring-cyan-500'
            }`}
            value={jobData.experienceLevel}
            onChange={(e) => updateJobData('experienceLevel', e.target.value)}
          >
            <option value="fresher">Fresher (0-1 years)</option>
            <option value="1-2">1-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5+">5+ years</option>
          </select>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Min Salary"
            type="number"
            placeholder="50000"
            value={jobData.salaryMin}
            onChange={(e) => updateJobData('salaryMin', e.target.value)}
            fullWidth
          />
          <Input
            label="Max Salary"
            type="number"
            placeholder="80000"
            value={jobData.salaryMax}
            onChange={(e) => updateJobData('salaryMax', e.target.value)}
            fullWidth
          />
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Currency
            </label>
            <select
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent ${
                theme === 'light'
                  ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                  : 'border-gray-600 bg-gray-800 text-white focus:ring-cyan-500'
              }`}
              value={jobData.currency}
              onChange={(e) => updateJobData('currency', e.target.value)}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
        
        <Input
          label="Application Deadline"
          type="date"
          value={jobData.applicationDeadline}
          onChange={(e) => updateJobData('applicationDeadline', e.target.value)}
          icon={<Clock className="w-4 h-4" />}
          fullWidth
        />
      </div>
    </div>
  );

  const renderRequirements = () => (
    <div className="space-y-6">
      {/* Skills */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Required Skills
        </label>
        
        {jobData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {jobData.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="primary"
                className="flex items-center space-x-1 cursor-pointer"
                onClick={() => removeSkill(skill)}
              >
                <span>{skill}</span>
                <span className="ml-1 hover:bg-white/20 rounded-full">×</span>
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex space-x-2">
          <Input
            placeholder="Add a skill (e.g., React, Leadership)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            fullWidth
          />
          <Button
            variant="outline"
            onClick={() => {
              const input = document.querySelector('input[placeholder*="Add a skill"]') as HTMLInputElement;
              if (input) {
                addSkill(input.value);
                input.value = '';
              }
            }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Requirements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={`block text-sm font-medium ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            Requirements
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={generateAIRequirements}
            loading={isGeneratingAI}
            icon={<Sparkles className="w-4 h-4" />}
          >
            AI Generate
          </Button>
        </div>
        
        <div className="space-y-2">
          {jobData.requirements.map((requirement, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder="Enter a requirement..."
                value={requirement}
                onChange={(e) => updateListItem('requirements', index, e.target.value)}
                fullWidth
              />
              {jobData.requirements.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeListItem('requirements', index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addListItem('requirements')}
          >
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Benefits */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Benefits & Perks
        </label>
        
        <div className="space-y-2">
          {jobData.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder="Enter a benefit..."
                value={benefit}
                onChange={(e) => updateListItem('benefits', index, e.target.value)}
                fullWidth
              />
              {jobData.benefits.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeListItem('benefits', index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addListItem('benefits')}
          >
            Add Benefit
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDescription = () => (
    <div className="space-y-6">
      {/* Job Description */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={`block text-sm font-medium ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            Job Description
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={generateAIDescription}
            loading={isGeneratingAI}
            icon={<Sparkles className="w-4 h-4" />}
          >
            AI Generate
          </Button>
        </div>
        <textarea
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
            theme === 'light'
              ? 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
              : 'border-gray-600 bg-gray-800 text-white focus:ring-cyan-500'
          }`}
          rows={6}
          placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
          value={jobData.description}
          onChange={(e) => updateJobData('description', e.target.value)}
        />
      </div>

      {/* Responsibilities */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={`block text-sm font-medium ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            Key Responsibilities
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={generateAIResponsibilities}
            loading={isGeneratingAI}
            icon={<Sparkles className="w-4 h-4" />}
          >
            AI Generate
          </Button>
        </div>
        
        <div className="space-y-2">
          {jobData.responsibilities.map((responsibility, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder="Enter a responsibility..."
                value={responsibility}
                onChange={(e) => updateListItem('responsibilities', index, e.target.value)}
                fullWidth
              />
              {jobData.responsibilities.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeListItem('responsibilities', index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => addListItem('responsibilities')}
          >
            Add Responsibility
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        {/* Job Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {jobData.title || 'Job Title'}
              </h1>
              <p className={`text-lg ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {(user as any)?.company || 'Company Name'} • {jobData.department}
              </p>
            </div>
            <Badge variant="success" size="lg" gradient>
              Now Hiring
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {jobData.location}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {jobData.jobType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {jobData.experienceLevel} years
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <span className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {jobData.currency === 'INR' ? '₹' : '$'}{jobData.salaryMin} - {jobData.salaryMax}
              </span>
            </div>
          </div>
        </div>

        {/* Job Description */}
        {jobData.description && (
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-3 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              About This Role
            </h2>
            <p className={`leading-relaxed ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {jobData.description}
            </p>
          </div>
        )}

        {/* Responsibilities */}
        {jobData.responsibilities.filter(r => r.trim()).length > 0 && (
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-3 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Key Responsibilities
            </h2>
            <ul className={`list-disc list-inside space-y-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {jobData.responsibilities.filter(r => r.trim()).map((responsibility, index) => (
                <li key={index}>{responsibility}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {jobData.requirements.filter(r => r.trim()).length > 0 && (
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-3 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Requirements
            </h2>
            <ul className={`list-disc list-inside space-y-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {jobData.requirements.filter(r => r.trim()).map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Skills */}
        {jobData.skills.length > 0 && (
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-3 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {jobData.skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Benefits */}
        {jobData.benefits.filter(b => b.trim()).length > 0 && (
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-3 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Benefits & Perks
            </h2>
            <ul className={`list-disc list-inside space-y-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              {jobData.benefits.filter(b => b.trim()).map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic': return renderBasicInfo();
      case 'details': return renderJobDetails();
      case 'requirements': return renderRequirements();
      case 'description': return renderDescription();
      case 'preview': return renderPreview();
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>
          <div className={`w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center ${
            theme === 'dark-neon' ? 'shadow-lg shadow-blue-500/25' : 'shadow-lg'
          }`}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            AI-Powered Job Posting
          </h1>
        </div>
        <p className={`text-lg ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          Create compelling job postings with AI assistance to attract the best candidates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Progress Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Progress
            </h3>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : isComplete
                        ? 'text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`p-1 rounded ${
                      isActive ? 'bg-blue-200 dark:bg-blue-800' : 
                      isComplete ? 'bg-green-200 dark:bg-green-800' : 
                      'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {isComplete ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium">{step.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="min-h-[600px]">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                {React.createElement(steps[currentStep].icon, { className: "w-5 h-5 text-blue-600" })}
                <h2 className={`text-xl font-semibold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {steps[currentStep].name}
                </h2>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Draft
                </Button>
                
                {currentStep === steps.length - 1 ? (
                  <Button
                    variant="primary"
                    icon={<Send className="w-4 h-4" />}
                    className="shadow-lg"
                  >
                    Publish Job
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    onClick={nextStep}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Next Step
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};