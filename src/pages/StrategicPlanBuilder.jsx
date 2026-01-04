import StrategyWizardWrapper from '../components/strategy/wizard/StrategyWizardWrapper';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategicPlanBuilder() {
  return <StrategyWizardWrapper />;
}

export default ProtectedPage(StrategicPlanBuilder, { requiredPermissions: ['strategy_manage'] });
