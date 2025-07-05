import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { HomePage } from './components/home/HomePage';
import { ProfileCreation } from './components/profile/ProfileCreation';
import { ProfilePage } from './components/profile/ProfilePage';
import { JobFilters } from './components/jobs/JobFilters';
import { JobList } from './components/jobs/JobList';
import { ResumeBuilder } from './components/resume/ResumeBuilder';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import { JobPostingBuilder } from './components/employer/JobPostingBuilder';
import { AuthModal } from './components/auth/AuthModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ToastContainer, useToast } from './components/common/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import './styles/themes.css';
import { FAQPage } from './components/faqs/FAQPage';
import { ContactPage } from './components/contact/ContactPage';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'jobs' | 'resume' | 'profile' | 'create-profile' | 'dashboard' | 'post-job' | 'candidates' | 'faqs' | 'contact'>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isEmployer, isJobSeeker, user, loading } = useAuth();
  const { theme } = useTheme();
  const { toasts, removeToast } = useToast();

  // Reset to home page when user logs out
  useEffect(() => {
    // Only redirect to home if trying to access protected views
    const protectedViews = ['profile', 'dashboard', 'post-job', 'candidates'];
    if (!isAuthenticated && protectedViews.includes(currentView)) {
      setCurrentView('home');
    }
  }, [isAuthenticated, currentView]);

  // Redirect to appropriate dashboard after login
  useEffect(() => {
    if (isAuthenticated && currentView === 'home') {
      if (isEmployer) {
        setCurrentView('dashboard');
      } else if (isJobSeeker) {
        setCurrentView('jobs');
      }
    }
  }, [isAuthenticated, isEmployer, isJobSeeker, currentView]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // If already authenticated, go to appropriate page
      if (isEmployer) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('jobs');
      }
    } else {
      setCurrentView('create-profile');
    }
  };

  const handleSignIn = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handleProfileCreationComplete = () => {
    // Add a small delay to ensure authentication state is updated
    setTimeout(() => {
      if (isEmployer) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('jobs');
      }
    }, 100);
  };

  const handleProfileCreationBack = () => {
    setCurrentView('home');
  };

  const handleFindJobs = () => setCurrentView('jobs');
  const handleResumeBuilder = () => setCurrentView('resume');

  // Show loading spinner during initial auth check
  if (loading) {
    return (
      <div className={`min-h-screen theme-transition ${
        theme === 'light' 
          ? 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 light bg-light-pattern' 
          : 'bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 dark-neon bg-dark-pattern'
      }`}>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading SkillGlide..." />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    try {
      switch (currentView) {
        case 'home':
          return <HomePage onGetStarted={handleGetStarted} onSignIn={handleSignIn} onFindJobs={handleFindJobs} onResumeBuilder={handleResumeBuilder} />;
        case 'create-profile':
          return (
            <ProfileCreation 
              onComplete={handleProfileCreationComplete}
              onBack={handleProfileCreationBack}
            />
          );
        case 'jobs':
          return (
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${
              theme === 'light' ? 'bg-light-pattern' : ''
            }`}>
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {isEmployer ? 'Find Top Candidates' : 'Discover Your Perfect Job'}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    {isEmployer 
                      ? 'Browse through talented professionals and find the perfect match for your team'
                      : 'Browse through thousands of opportunities from top companies worldwide'
                    }
                  </p>
                </div>
                <JobFilters />
                <JobList />
              </div>
            </div>
          );
        case 'resume':
          return <ResumeBuilder />;
        case 'dashboard':
          return <EmployerDashboard onNavigate={setCurrentView} />;
        case 'post-job':
          return <JobPostingBuilder onBack={() => setCurrentView('dashboard')} />;
        case 'candidates':
          return (
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${
              theme === 'light' ? 'bg-light-pattern' : ''
            }`}>
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    Find Top Candidates
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Browse through talented professionals and find the perfect match for your team
                  </p>
                </div>
                <JobFilters />
                <JobList />
              </div>
            </div>
          );
        case 'profile':
          return <ProfilePage onNavigate={setCurrentView} />;
        case 'faqs':
          return <FAQPage />;
        case 'contact':
          return <ContactPage />;
        default:
          return <HomePage onGetStarted={handleGetStarted} onSignIn={handleSignIn} onFindJobs={handleFindJobs} onResumeBuilder={handleResumeBuilder} />;
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`min-h-screen theme-transition ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 light bg-light-pattern' 
        : 'bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 dark-neon bg-dark-pattern'
    }`}>
      <Header 
        onNavigate={(view) => setCurrentView(view)}
        currentView={currentView}
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
      />
      
      {/* Main Content */}
      <main>
        {renderContent()}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authModalMode}
        onGetStarted={handleGetStarted}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <JobProvider>
            <AppContent />
          </JobProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;