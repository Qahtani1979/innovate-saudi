import React from 'react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { userProfile, userRoles, checkAuth } = useAuth();

  const handleComplete = async () => {
    // Refresh auth state to get updated onboarding status
    await checkAuth();
    
    // Navigate based on user's role/persona
    const role = userRoles?.[0]?.role;
    const persona = userProfile?.extracted_data?.selected_persona;
    
    if (role === 'admin') {
      navigate(createPageUrl('AdminDashboard'));
    } else if (role === 'municipality_admin' || role === 'municipality_staff' || persona === 'municipality_staff') {
      navigate(createPageUrl('MunicipalityDashboard'));
    } else if (role === 'provider' || persona === 'provider') {
      navigate(createPageUrl('ProviderDashboard'));
    } else if (role === 'researcher' || persona === 'researcher') {
      navigate(createPageUrl('ResearcherDashboard'));
    } else if (role === 'citizen' || persona === 'citizen') {
      navigate(createPageUrl('CitizenDashboard'));
    } else {
      navigate(createPageUrl('Home'));
    }
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
