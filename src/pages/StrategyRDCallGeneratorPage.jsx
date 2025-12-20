import StrategyToRDCallGenerator from '@/components/strategy/cascade/StrategyToRDCallGenerator';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyRDCallGeneratorPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">{t({ en: 'R&D Call Generator', ar: 'مولد طلبات البحث والتطوير' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate R&D calls from strategic challenges', ar: 'إنشاء طلبات البحث والتطوير من التحديات الاستراتيجية' })}</p>
      </div>
      
      <StrategyToRDCallGenerator 
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
      />
    </div>
  );
}

export default ProtectedPage(StrategyRDCallGeneratorPage, { requiredPermissions: ['strategy_cascade'] });
