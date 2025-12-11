import React, { useEffect } from 'react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, userProfile, userRoles, checkAuth, isAuthenticated, isLoadingAuth } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/auth', { replace: true, state: { from: { pathname: '/onboarding' } } });
    }
  }, [isLoadingAuth, isAuthenticated, navigate]);

  // Show loading while checking auth
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleComplete = async () => {
    // Refresh auth state to get updated onboarding status and profile
    await checkAuth();
    
    // Get the latest persona from the profile (may have just been set)
    // Use a small delay to ensure state is updated
    setTimeout(() => {
      // Navigate based on user's role first, then persona as fallback
      const role = userRoles?.[0]?.role;
      const persona = userProfile?.extracted_data?.selected_persona;
      
      // Admin takes priority
      if (role === 'admin') {
        navigate('/home');
      } 
      // Executive / Leadership
      else if (role === 'executive' || role === 'leadership') {
        navigate('/executive-dashboard');
      }
      // Deputyship
      else if (role === 'deputyship_admin' || role === 'deputyship_staff' || persona === 'deputyship') {
        navigate('/executive-dashboard');
      }
      // Municipality staff - check both role and persona
      else if (role === 'municipality_admin' || role === 'municipality_staff' || role === 'municipality_coordinator' || persona === 'municipality_staff') {
        navigate('/municipality-dashboard');
      } 
      // Solution provider / startup
      else if (role === 'provider' || persona === 'provider' || persona === 'startup') {
        navigate('/startup-dashboard');
      }
      // Expert
      else if (role === 'expert' || role === 'evaluator' || persona === 'expert') {
        navigate('/expert-registry');
      }
      // Researcher / academic
      else if (role === 'researcher' || persona === 'researcher') {
        navigate('/researcher-dashboard');
      } 
      // Citizen
      else if (role === 'citizen' || persona === 'citizen') {
        navigate('/citizen-dashboard');
      }
      // Viewer / observer or default
      else if (persona === 'viewer') {
        navigate('/home');
      }
      // Default fallback
      else {
        navigate('/home');
      }
    }, 100);
  };

  const handleSkip = async () => {
    // Don't call checkAuth here - the OnboardingWizard handles the database update
    // and navigation. Calling checkAuth would trigger checkOnboardingStatus which
    // might redirect back to onboarding before the navigation completes
    navigate(createPageUrl('Home'));
  };

  return (
    <OnboardingWizard 
      onComplete={handleComplete} 
      onSkip={handleSkip} 
    />
  );
}
