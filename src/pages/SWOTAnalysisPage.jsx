import SWOTAnalysisBuilder from '@/components/strategy/preplanning/SWOTAnalysisBuilder';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import NoPlanGuard from '@/components/strategy/NoPlanGuard';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function SWOTAnalysisPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();

  const handleSave = (swotData) => {

  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />

      <div>
        <h1 className="text-2xl font-bold">
          {t({ en: 'SWOT Analysis', ar: 'تحليل SWOT' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({
            en: 'Analyze your strategic position through Strengths, Weaknesses, Opportunities, and Threats',
            ar: 'حلل موقعك الاستراتيجي من خلال نقاط القوة والضعف والفرص والتهديدات'
          })}
        </p>
      </div>

      <NoPlanGuard>
        <SWOTAnalysisBuilder
          strategicPlanId={activePlanId}
          initialData={activePlan}
          onSave={handleSave}
        />
      </NoPlanGuard>
    </div>
  );
}

export default ProtectedPage(SWOTAnalysisPage, { requiredPermissions: [] });
