import React from 'react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { userProfile, userRoles, checkAuth } = useAuth();

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
        navigate(createPageUrl('AdminDashboard'));
      } 
      // Municipality staff - check both role and persona
      else if (role === 'municipality_admin' || role === 'municipality_staff' || persona === 'municipality_staff') {
        navigate(createPageUrl('MunicipalityDashboard'));
      } 
      // Solution provider / startup
      else if (role === 'provider' || persona === 'provider') {
        navigate(createPageUrl('ProviderDashboard'));
      } 
      // Researcher / academic
      else if (role === 'researcher' || persona === 'researcher') {
        navigate(createPageUrl('ResearcherDashboard'));
      } 
      // Citizen
      else if (role === 'citizen' || persona === 'citizen') {
        navigate(createPageUrl('CitizenDashboard'));
      }
      // Expert
      else if (role === 'expert' || persona === 'expert') {
        navigate(createPageUrl('ExpertRegistry'));
      }
      // Viewer / observer or default
      else if (persona === 'viewer') {
        navigate(createPageUrl('Home'));
      }
      // Default fallback
      else {
        navigate(createPageUrl('Home'));
      }
    }, 100);
  };

  const handleSkip = async () => {
    await checkAuth();
    navigate(createPageUrl('Home'));
  };

  return (
    <OnboardingWizard 
      onComplete={handleComplete} 
      onSkip={handleSkip} 
    />
  );
}
