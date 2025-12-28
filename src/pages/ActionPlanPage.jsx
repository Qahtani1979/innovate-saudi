import ActionPlanBuilder from '@/components/strategy/creation/ActionPlanBuilder';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

const ActionPlanPage = () => {
  const { t } = useLanguage();
  const { activePlan, activePlanId } = useActivePlan();

  const handleSave = (data) => { };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ActivePlanBanner />

      <div>
        <h1 className="text-2xl font-bold mb-2">{t({ en: 'Action Plan Builder', ar: 'منشئ خطة العمل' })}</h1>
        <p className="text-muted-foreground">
          {t({ en: 'Create and manage action plans for the selected strategic plan', ar: 'إنشاء وإدارة خطط العمل للخطة الاستراتيجية المحددة' })}
        </p>
      </div>

      <ActionPlanBuilder
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProtectedPage(ActionPlanPage, { requiredPermissions: ['strategy_manage'] });
