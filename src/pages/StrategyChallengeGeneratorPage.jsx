import StrategyChallengeGenerator from '@/components/strategy/cascade/StrategyChallengeGenerator';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyChallengeGeneratorPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">{t({ en: 'Challenge Generator', ar: 'مولد التحديات' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate innovation challenges from strategic objectives', ar: 'إنشاء تحديات الابتكار من الأهداف الاستراتيجية' })}</p>
      </div>
      
      <StrategyChallengeGenerator 
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
      />
    </div>
  );
}

export default ProtectedPage(StrategyChallengeGeneratorPage, { requiredPermissions: ['strategy_cascade'] });
