import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { HomePage } from './components/home/HomePage';
import { ProfileCreation } from './components/profile/ProfileCreation';
import { ProfilePage } from './components/profile/ProfilePage';
import { JobFilters } from './components/jobs/JobFilters';
import { JobList } from './components/jobs/JobList';
import { JobSeekerDashboard } from './components/jobs/JobSeekerDashboard';
import { ResumeBuilder } from './components/resume/ResumeBuilder';
import { EmployerDashboard } from './components/employer/EmployerDashboard';
import { JobPostingBuilder } from './components/employer/JobPostingBuilder';
import { AuthModal } from './components/auth/AuthModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ToastContainer, useToast } from './components/common/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConnectionStatus } from './components/common/ConnectionStatus';
import { AuthProvider } from './contexts/AuthContext';
import { JobProvider } from './contexts/JobContext';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import './styles/themes.css';
import { FAQPage } from './components/faqs/FAQPage';
import { ContactPage } from './components/contact/ContactPage';
import { SettingsPage } from './components/profile/SettingsPage';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'jobs' | 'resume' | 'profile' | 'create-profile' | 'dashboard' | 'post-job' | 'candidates' | 'faqs' | 'contact' | 'settings'>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [dashboardKey, setDashboardKey] = useState(0); // Key to force dashboard refresh
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
        setCurrentView('dashboard');
      }
    }
  }, [isAuthenticated, isEmployer, isJobSeeker, currentView]);

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    const storedUserStr = localStorage.getItem('skillglide-user');
    console.log('🔄 Auto-redirect useEffect triggered', {
      isAuthenticated,
      storedUserStr: !!storedUserStr,
      currentView
    });
    
    if (storedUserStr && !isAuthenticated) {
      // User exists in localStorage but not in context (just registered)
      const storedUser = JSON.parse(storedUserStr);
      console.log('👤 Found user in localStorage', { role: storedUser.role });
      if (storedUser.role === 'employer' || storedUser.role === 'jobseeker') {
        console.log('🎯 Auto-redirecting to dashboard');
        setCurrentView('dashboard');
      }
    }
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    // Check if user is authenticated (either from context or localStorage)
    const storedUserStr = localStorage.getItem('skillglide-user');
    const isUserAuthenticated = isAuthenticated || !!storedUserStr;
    
    console.log('🚀 handleGetStarted called', {
      isAuthenticated,
      isEmployer,
      isJobSeeker,
      storedUserStr: !!storedUserStr,
      isUserAuthenticated
    });
    
    if (isUserAuthenticated) {
      // If already authenticated, go to appropriate page
      if (isEmployer) {
        console.log('🎯 Redirecting to employer dashboard');
        setCurrentView('dashboard');
      } else if (isJobSeeker) {
        console.log('🎯 Redirecting to job seeker dashboard');
        setCurrentView('dashboard');
      } else if (storedUserStr) {
        // Fallback: check localStorage for user role
        const storedUser = JSON.parse(storedUserStr);
        console.log('📋 Using localStorage fallback', { role: storedUser.role });
        if (storedUser.role === 'employer') {
          console.log('🎯 Redirecting to employer dashboard (fallback)');
          setCurrentView('dashboard');
        } else {
          console.log('🎯 Redirecting to job seeker dashboard (fallback)');
          setCurrentView('dashboard');
        }
      } else {
        console.log('🎯 Redirecting to dashboard (default)');
        setCurrentView('dashboard');
      }
    } else {
      console.log('📝 User not authenticated, going to profile creation');
      setCurrentView('create-profile');
    }
  };

  const handleSignIn = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handleProfileCreationComplete = () => {
    console.log('🎉 Profile creation completed!');
    
    // Wait a moment for AuthContext to update, then check both AuthContext and localStorage
    setTimeout(() => {
      // First check AuthContext state
      if (isAuthenticated && user) {
        console.log('✅ Using AuthContext user:', user);
        if (user.role === 'employer') {
          console.log('🎯 Redirecting to employer dashboard (AuthContext)');
          setCurrentView('dashboard');
        } else if (user.role === 'jobseeker') {
          console.log('🎯 Redirecting to job seeker dashboard (AuthContext)');
          setCurrentView('dashboard');
        } else {
          console.log('❓ Unknown role in AuthContext, redirecting to home');
          setCurrentView('home');
        }
        return;
      }
      
      // Fallback to localStorage
      const storedUserStr = localStorage.getItem('skillglide-user');
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          console.log('📋 Using localStorage user:', storedUser);
          
          if (storedUser.role === 'employer') {
            console.log('🎯 Redirecting to employer dashboard (localStorage)');
            setCurrentView('dashboard');
          } else if (storedUser.role === 'jobseeker') {
            console.log('🎯 Redirecting to job seeker dashboard (localStorage)');
            setCurrentView('dashboard');
          } else {
            console.log('❓ Unknown role in localStorage, redirecting to home');
            setCurrentView('home');
          }
        } catch (error) {
          console.error('❌ Error parsing stored user:', error);
          setCurrentView('home');
        }
      } else {
        console.log('❌ No user found in AuthContext or localStorage, redirecting to home');
        setCurrentView('home');
      }
    }, 500); // Wait 500ms for AuthContext to update
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
          return isEmployer ? (
            <EmployerDashboard key={dashboardKey} onNavigate={setCurrentView} />
          ) : (
            <JobSeekerDashboard />
          );
        case 'post-job':
          return (
            <JobPostingBuilder 
              onBack={() => setCurrentView('dashboard')} 
              onJobPosted={(newJob) => {
                console.log('Job posted successfully:', newJob);
                setDashboardKey(prev => prev + 1); // Force dashboard refresh
                setCurrentView('dashboard');
              }}
            />
          );
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
        case 'settings':
          return <SettingsPage />;
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
            {/* <ConnectionStatus /> */}
            <AppContent />
          </JobProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;