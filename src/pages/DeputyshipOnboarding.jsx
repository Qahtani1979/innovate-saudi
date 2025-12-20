import DeputyshipOnboardingWizard from '@/components/onboarding/DeputyshipOnboardingWizard';

export default function DeputyshipOnboarding() {
  const handleComplete = () => {
    // Handled in wizard
  };

  return <DeputyshipOnboardingWizard onComplete={handleComplete} />;
}
