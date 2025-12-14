import React from 'react';
import StrategyToPolicyGenerator from '@/components/strategy/cascade/StrategyToPolicyGenerator';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyPolicyGeneratorPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">{t({ en: 'Policy Generator', ar: 'مولد السياسات' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate policies aligned with strategic priorities', ar: 'إنشاء سياسات متوافقة مع الأولويات الاستراتيجية' })}</p>
      </div>
      
      <StrategyToPolicyGenerator 
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
      />
    </div>
  );
}

export default ProtectedPage(StrategyPolicyGeneratorPage, { requiredPermissions: ['strategy_cascade'] });
