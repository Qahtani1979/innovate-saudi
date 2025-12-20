import MunicipalityStaffOnboardingWizard from '@/components/onboarding/MunicipalityStaffOnboardingWizard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MunicipalityStaffOnboarding() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate(createPageUrl('MunicipalityDashboard'));
  };

  const handleSkip = () => {
    navigate(createPageUrl('MunicipalityDashboard'));
  };

  return (
    <MunicipalityStaffOnboardingWizard 
      onComplete={handleComplete} 
      onSkip={handleSkip} 
    />
  );
}
