import StrategyToCampaignGenerator from '@/components/strategy/cascade/StrategyToCampaignGenerator';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyCampaignGeneratorPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">{t({ en: 'Campaign Generator', ar: 'مولد الحملات' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate strategic campaigns from objectives', ar: 'إنشاء حملات استراتيجية من الأهداف' })}</p>
      </div>
      
      <StrategyToCampaignGenerator 
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
      />
    </div>
  );
}

export default ProtectedPage(StrategyCampaignGeneratorPage, { requiredPermissions: ['strategy_cascade'] });
