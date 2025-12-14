import React from 'react';
import PublicStrategyDashboard from '@/components/strategy/communication/PublicStrategyDashboard';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function PublicStrategyDashboardPage() {
  return <PublicStrategyDashboard />;
}

export default ProtectedPage(PublicStrategyDashboardPage, { requiredPermissions: ['strategy_view'] });
