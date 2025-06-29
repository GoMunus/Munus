import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useTheme } from '../../contexts/ThemeContext';

export const TestAccountsInfo: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`py-16 ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-gray-50 to-blue-50' 
        : 'bg-gradient-to-br from-gray-800 to-gray-900'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="secondary" size="lg" gradient className="mb-4">
            Getting Started
          </Badge>
          <h2 className={`text-3xl font-bold mb-4 ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            Start Your Career Journey
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            Create your account to access all features of SkillGlide
          </p>
        </div>

        <div className="mt-12 text-center">
          <Card className={`max-w-4xl mx-auto ${
            theme === 'light' 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-800'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${
              theme === 'light' ? 'text-green-900' : 'text-green-300'
            }`}>
              🚀 Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <h4 className={`font-semibold mb-2 ${
                  theme === 'light' ? 'text-green-800' : 'text-green-400'
                }`}>
                  Job Seeker Features:
                </h4>
                <ul className={`text-sm space-y-1 ${
                  theme === 'light' ? 'text-green-700' : 'text-green-300'
                }`}>
                  <li>✓ Browse and filter jobs</li>
                  <li>✓ Create and edit resume</li>
                  <li>✓ Record video/voice resume</li>
                  <li>✓ Apply to jobs</li>
                  <li>✓ Save favorite jobs</li>
                  <li>✓ Profile management</li>
                </ul>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${
                  theme === 'light' ? 'text-green-800' : 'text-green-400'
                }`}>
                  Employer Features:
                </h4>
                <ul className={`text-sm space-y-1 ${
                  theme === 'light' ? 'text-green-700' : 'text-green-300'
                }`}>
                  <li>✓ Post new jobs</li>
                  <li>✓ Manage job listings</li>
                  <li>✓ Review applications</li>
                  <li>✓ Company profile setup</li>
                  <li>✓ Candidate search</li>
                  <li>✓ Analytics dashboard</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};