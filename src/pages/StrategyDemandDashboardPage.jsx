import DemandDashboard from '@/components/strategy/demand/DemandDashboard';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

export default function StrategyDemandDashboardPage() {
  const { t } = useLanguage();
  const { activePlan } = useActivePlan();

  return (
    <ProtectedPage permission="strategy.manage">
      <div className="container mx-auto py-6 space-y-6">
        <ActivePlanBanner />
        <DemandDashboard />
      </div>
    </ProtectedPage>
  );
}
