import StrategyPublicView from '@/components/strategy/communication/StrategyPublicView';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyPublicViewPage() {
  const { activePlanId, activePlan } = useActivePlan();
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      <StrategyPublicView strategicPlanId={activePlanId} strategicPlan={activePlan} />
    </div>
  );
}

export default ProtectedPage(StrategyPublicViewPage, { requiredPermissions: ['strategy_view'] });
