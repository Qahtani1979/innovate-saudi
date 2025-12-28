import BaselineDataCollector from '@/components/strategy/preplanning/BaselineDataCollector';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import NoPlanGuard from '@/components/strategy/NoPlanGuard';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function BaselineDataPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();

  const handleSave = (data) => {

  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />

      <div>
        <h1 className="text-2xl font-bold">
          {t({ en: 'Baseline Data Collection', ar: 'جمع البيانات الأساسية' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({
            en: 'Capture and validate baseline KPI values for measuring strategic progress',
            ar: 'التقاط والتحقق من قيم مؤشرات الأداء الأساسية لقياس التقدم الاستراتيجي'
          })}
        </p>
      </div>

      <NoPlanGuard>
        <BaselineDataCollector
          strategicPlanId={activePlanId}
          strategicPlan={activePlan}
          onSave={handleSave}
        />
      </NoPlanGuard>
    </div>
  );
}

export default ProtectedPage(BaselineDataPage, { requiredPermissions: [] });
