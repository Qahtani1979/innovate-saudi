import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/components/LanguageContext';
import LanguagePersistence from '@/components/ui/LanguagePersistence';
import PublicPortal from './pages/PublicPortal';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Helper to convert PascalCase to kebab-case
const toKebabCase = (str) => str
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
  .toLowerCase();

// Pages that don't need the layout wrapper
const noLayoutPages = ['Auth', 'Onboarding', 'StartupOnboarding', 'MunicipalityStaffOnboarding', 
  'ResearcherOnboarding', 'CitizenOnboarding', 'ExpertOnboarding', 'PublicPortal'];

// Pages that are public (don't require authentication)
const publicPages = ['Auth', 'PublicPortal', 'PublicSolutionsMarketplace', 'PublicIdeaSubmission', 
  'About', 'News', 'Contact', 'PublicProgramsDirectory', 'PublicGeographicMap'];

const LayoutWrapper = ({ children, currentPageName }) => {
  // Skip layout for certain pages
  if (noLayoutPages.includes(currentPageName)) {
    return <>{children}</>;
  }
  
  return Layout ? (
    <Layout currentPageName={currentPageName}>{children}</Layout>
  ) : (
    <>{children}</>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root path: Show PublicPortal for non-auth, Home for authenticated */}
      <Route path="/" element={
        isAuthenticated ? (
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        ) : (
          <PublicPortal />
        )
      } />
      
      {/* All other pages */}
      {Object.entries(Pages).map(([pageName, Page]) => {
        const isPublicPage = publicPages.includes(pageName);
        
        return (
          <Route
            key={pageName}
            path={`/${toKebabCase(pageName)}`}
            element={
              // If public page or user is authenticated, show the page
              isPublicPage || isAuthenticated ? (
                <LayoutWrapper currentPageName={pageName}>
                  <Page />
                </LayoutWrapper>
              ) : (
                // Non-auth users trying to access protected pages go to Auth
                <Navigate to="/auth" replace />
              )
            }
          />
        );
      })}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <LanguageProvider>
      <LanguagePersistence />
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <VisualEditAgent />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
