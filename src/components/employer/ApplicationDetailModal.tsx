import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Clock, Calendar, Globe, Github, Linkedin, FileText, Star, Award, Languages, Briefcase, CheckCircle, XCircle, Clock3, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTheme } from '../../contexts/ThemeContext';

interface Application {
  _id: string;
  cover_letter: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Enhanced application data
  years_of_experience?: string;
  relevant_skills?: string;
  work_authorization?: string;
  notice_period?: string;
  remote_work_preference?: string;
  relocation_willingness?: string;
  why_interested?: string;
  biggest_achievement?: string;
  availability_start_date?: string;
  additional_languages?: string;
  resume_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  applicant_name?: string;
  applicant_email?: string;
  employer_notes?: string;
}

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (applicationId: string, status: string, notes?: string) => void;
  isUpdating?: boolean;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onStatusUpdate,
  isUpdating = false
}) => {
  const { theme } = useTheme();
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  if (!isOpen || !application) return null;

  const handleStatusUpdate = (status: string) => {
    onStatusUpdate(application._id, status, notes || undefined);
    setNotes('');
    setShowNotesInput(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'waiting': return <Clock3 className="w-4 h-4" />;
      case 'under_review': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {application.applicant_name || 'Job Applicant'}
                </h2>
                <p className="text-blue-100 text-sm">
                  Applied {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
                <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
              </Badge>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Personal Info */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {application.applicant_email && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 mr-2" />
                      <a href={`mailto:${application.applicant_email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {application.applicant_email}
                      </a>
                    </div>
                  )}
                  {application.linkedin_url && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Linkedin className="w-4 h-4 mr-2" />
                      <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {application.github_url && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Github className="w-4 h-4 mr-2" />
                      <a href={application.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                        GitHub Profile
                      </a>
                    </div>
                  )}
                  {application.portfolio_url && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Globe className="w-4 h-4 mr-2" />
                      <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">
                        Portfolio Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Professional Details
                </h3>
                <div className="space-y-3">
                  {application.years_of_experience && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{application.years_of_experience} years</p>
                    </div>
                  )}
                  {application.relevant_skills && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{application.relevant_skills}</p>
                    </div>
                  )}
                  {application.work_authorization && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Authorization:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{application.work_authorization}</p>
                    </div>
                  )}
                  {application.notice_period && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notice Period:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{application.notice_period}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Work Preferences
                </h3>
                <div className="space-y-3">
                  {application.remote_work_preference && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Remote Work:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{application.remote_work_preference}</p>
                    </div>
                  )}
                  {application.relocation_willingness && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Relocation:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{application.relocation_willingness}</p>
                    </div>
                  )}
                  {application.availability_start_date && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available From:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(application.availability_start_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {application.additional_languages && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Languages:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{application.additional_languages}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Application Details */}
            <div className="space-y-6">
              {/* Cover Letter */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Cover Letter
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                  {application.cover_letter || 'No cover letter provided.'}
                </div>
              </div>

              {/* Why Interested */}
              {application.why_interested && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-blue-600" />
                    Why Interested
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {application.why_interested}
                  </div>
                </div>
              )}

              {/* Biggest Achievement */}
              {application.biggest_achievement && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" />
                    Key Achievement
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {application.biggest_achievement}
                  </div>
                </div>
              )}

              {/* Resume */}
              {application.resume_url && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Resume
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(application.resume_url, '_blank')}
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Resume
                  </Button>
                </div>
              )}

              {/* Employer Notes */}
              {application.employer_notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Internal Notes
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {application.employer_notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-col space-y-3">
            {/* Notes Input */}
            {showNotesInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this application..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm"
                  rows={3}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-between">
              <div className="flex flex-wrap gap-2">
                {application.status !== 'accepted' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusUpdate('accepted')}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isUpdating ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Accept
                  </Button>
                )}

                {application.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isUpdating}
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {isUpdating ? (
                      <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </Button>
                )}

                {application.status !== 'waiting' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('waiting')}
                    disabled={isUpdating}
                    className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                  >
                    {isUpdating ? (
                      <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Clock3 className="w-4 h-4 mr-2" />
                    )}
                    Waiting List
                  </Button>
                )}

                {application.status !== 'under_review' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('under_review')}
                    disabled={isUpdating}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    {isUpdating ? (
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Under Review
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotesInput(!showNotesInput)}
                  className="text-gray-600 dark:text-gray-400"
                >
                  {showNotesInput ? 'Hide Notes' : 'Add Notes'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-600 dark:text-gray-400"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};