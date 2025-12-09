import React from 'react';
import CitizenOnboardingWizard from '@/components/onboarding/CitizenOnboardingWizard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CitizenOnboarding() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate(createPageUrl('CitizenDashboard'));
  };

  const handleSkip = () => {
    navigate(createPageUrl('CitizenDashboard'));
  };

  return (
    <CitizenOnboardingWizard 
      onComplete={handleComplete} 
      onSkip={handleSkip} 
    />
  );
}
