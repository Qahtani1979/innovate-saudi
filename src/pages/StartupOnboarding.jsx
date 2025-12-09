import React from 'react';
import StartupOnboardingWizard from '@/components/startup/StartupOnboardingWizard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StartupOnboarding() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate(createPageUrl('ProviderDashboard'));
  };

  const handleSkip = () => {
    navigate(createPageUrl('ProviderDashboard'));
  };

  return (
    <StartupOnboardingWizard 
      onComplete={handleComplete} 
      onSkip={handleSkip} 
    />
  );
}
