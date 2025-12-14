import React from 'react';
import PublicStrategyDashboard from '@/components/strategy/communication/PublicStrategyDashboard';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function PublicStrategyDashboardPage() {
  const { activePlanId, activePlan } = useActivePlan();
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      <PublicStrategyDashboard strategicPlanId={activePlanId} strategicPlan={activePlan} />
    </div>
  );
}

export default ProtectedPage(PublicStrategyDashboardPage, { requiredPermissions: ['strategy_view'] });
