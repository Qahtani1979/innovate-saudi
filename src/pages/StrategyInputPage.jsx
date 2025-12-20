import StrategyInputCollector from '@/components/strategy/preplanning/StrategyInputCollector';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import NoPlanGuard from '@/components/strategy/NoPlanGuard';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyInputPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();

  const handleSave = (data) => {
    console.log('Strategy Input saved:', data);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">
          {t({ en: 'Strategy Input Collection', ar: 'جمع المدخلات الاستراتيجية' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ 
            en: 'Collect, aggregate, and analyze strategic inputs from all stakeholders',
            ar: 'جمع وتجميع وتحليل المدخلات الاستراتيجية من جميع أصحاب المصلحة'
          })}
        </p>
      </div>
      
      <NoPlanGuard>
        <StrategyInputCollector 
          strategicPlanId={activePlanId}
          strategicPlan={activePlan}
          onSave={handleSave} 
        />
      </NoPlanGuard>
    </div>
  );
}

export default ProtectedPage(StrategyInputPage, { requiredPermissions: [] });
