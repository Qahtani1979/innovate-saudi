import ResearcherOnboardingWizard from '@/components/onboarding/ResearcherOnboardingWizard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ResearcherOnboarding() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate(createPageUrl('ResearcherDashboard'));
  };

  const handleSkip = () => {
    navigate(createPageUrl('ResearcherDashboard'));
  };

  return (
    <ResearcherOnboardingWizard 
      onComplete={handleComplete} 
      onSkip={handleSkip} 
    />
  );
}
