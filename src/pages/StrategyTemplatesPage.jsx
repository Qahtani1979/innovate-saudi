import React from 'react';
import StrategyTemplateLibrary from '@/components/strategy/creation/StrategyTemplateLibrary';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

const StrategyTemplatesPage = () => {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  
  const handleApply = (template) => console.log('Template applied:', template);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">{t({ en: 'Strategy Templates', ar: 'قوالب الاستراتيجية' })}</h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Browse and apply strategy templates to your active plan', ar: 'تصفح وتطبيق قوالب الاستراتيجية على خطتك النشطة' })}
        </p>
      </div>
      
      <StrategyTemplateLibrary 
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
        onApplyTemplate={handleApply} 
      />
    </div>
  );
};

export default ProtectedPage(StrategyTemplatesPage, { requiredPermissions: ['strategy_view'] });
