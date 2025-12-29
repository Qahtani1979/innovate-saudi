import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/hooks/useAppQueryClient'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/components/LanguageContext';
import { StrategicPlanProvider } from '@/contexts/StrategicPlanContext';
import { TaxonomyProvider } from '@/contexts/TaxonomyContext';
import LanguagePersistence from '@/components/ui/LanguagePersistence';
import PublicLayout from '@/components/layout/PublicLayout';
import PublicPortal from './pages/PublicPortal';

// Public pages imports
import PublicAbout from './pages/public/About';
import PublicContact from './pages/public/Contact';
import PublicFAQ from './pages/public/FAQ';
import PublicForMunicipalities from './pages/public/ForMunicipalities';
import PublicForProviders from './pages/public/ForProviders';
import PublicForInnovators from './pages/public/ForInnovators';
import PublicForResearchers from './pages/public/ForResearchers';
import PublicChallenges from './pages/public/PublicChallenges';
import PublicSolutions from './pages/public/PublicSolutions';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import PublicIdeaSubmission from './pages/PublicIdeaSubmission';
import CitizenChallengesBrowser from './pages/CitizenChallengesBrowser';
import CitizenSolutionsBrowser from './pages/CitizenSolutionsBrowser';
import CitizenLivingLabsBrowser from './pages/CitizenLivingLabsBrowser';
import PublicProfilePage from './pages/PublicProfilePage';
import CopilotConsole from './pages/CopilotConsole';
import { CopilotProvider } from './components/copilot/CopilotProvider';
import { CopilotToolsProvider } from '@/contexts/CopilotToolsContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Helper to convert PascalCase to kebab-case
const toKebabCase = (str) => str
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
  .toLowerCase();

// Pages that don't need the layout wrapper
const noLayoutPages = ['Auth', 'ResetPassword', 'Onboarding', 'StartupOnboarding', 'MunicipalityStaffOnboarding',
  'ResearcherOnboarding', 'CitizenOnboarding', 'ExpertOnboarding', 'PublicPortal'];

// Pages that are public (don't require authentication)
const publicPages = ['Auth', 'ResetPassword', 'PublicPortal', 'PublicSolutionsMarketplace', 'PublicIdeaSubmission',
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
  console.log('APP.JSX: AuthenticatedApp render', { isLoadingAuth, isAuthenticated });

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
      {/* Root path: Always show PublicPortal - accessible to everyone */}
      <Route path="/" element={<PublicPortal />} />

      {/* Public pages wrapped with PublicLayout */}
      <Route path="/about" element={<PublicLayout><PublicAbout /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><PublicContact /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><PublicFAQ /></PublicLayout>} />
      <Route path="/for-municipalities" element={<PublicLayout><PublicForMunicipalities /></PublicLayout>} />
      <Route path="/for-providers" element={<PublicLayout><PublicForProviders /></PublicLayout>} />
      <Route path="/for-innovators" element={<PublicLayout><PublicForInnovators /></PublicLayout>} />
      <Route path="/for-researchers" element={<PublicLayout><PublicForResearchers /></PublicLayout>} />
      <Route path="/public-challenges" element={<PublicLayout><PublicChallenges /></PublicLayout>} />
      <Route path="/public-solutions" element={<PublicLayout><PublicSolutions /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
      <Route path="/public-idea-submission" element={<PublicLayout><PublicIdeaSubmission /></PublicLayout>} />

      {/* Public Profile Page - accessible to everyone */}
      <Route path="/profile/:userId" element={<PublicLayout><PublicProfilePage /></PublicLayout>} />

      {/* Legacy route redirects */}
      <Route path="/profile-settings" element={<Navigate to="/settings" replace />} />
      <Route path="/citizen-challenges-browser" element={
        isAuthenticated ? (
          <LayoutWrapper currentPageName="CitizenChallengesBrowser">
            <CitizenChallengesBrowser />
          </LayoutWrapper>
        ) : <Navigate to="/auth" replace />
      } />
      <Route path="/citizen-solutions-browser" element={
        isAuthenticated ? (
          <LayoutWrapper currentPageName="CitizenSolutionsBrowser">
            <CitizenSolutionsBrowser />
          </LayoutWrapper>
        ) : <Navigate to="/auth" replace />
      } />
      <Route path="/citizen-living-labs-browser" element={
        isAuthenticated ? (
          <LayoutWrapper currentPageName="CitizenLivingLabsBrowser">
            <CitizenLivingLabsBrowser />
          </LayoutWrapper>
        ) : <Navigate to="/auth" replace />
      } />

      {/* Super Copilot Route */}
      <Route path="/copilot" element={
        isAuthenticated ? (
          <LayoutWrapper currentPageName="CopilotConsole">
            <CopilotConsole />
          </LayoutWrapper>
        ) : <Navigate to="/auth" replace />
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
  console.log('APP.JSX: Rendering App component');
  return (
    <QueryClientProvider client={queryClientInstance}>
      <LanguageProvider>
        <LanguagePersistence />
        <AuthProvider>
          <TaxonomyProvider>
            <StrategicPlanProvider>
              <Router>
                <NavigationTracker />
                <NavigationTracker />
                <CopilotToolsProvider>
                  <CopilotProvider>
                    <AuthenticatedApp />
                  </CopilotProvider>
                </CopilotToolsProvider>
                <Toaster />
              </Router>
              <VisualEditAgent />
            </StrategicPlanProvider>
          </TaxonomyProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

export default App
