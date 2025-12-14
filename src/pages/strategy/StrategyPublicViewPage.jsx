import React from 'react';
import StrategyPublicView from '@/components/strategy/communication/StrategyPublicView';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyPublicViewPage() {
  return <StrategyPublicView />;
}

export default ProtectedPage(StrategyPublicViewPage, { requiredPermissions: ['strategy_view'] });
