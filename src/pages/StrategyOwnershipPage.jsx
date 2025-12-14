import React from 'react';
import StrategyOwnershipAssigner from '@/components/strategy/creation/StrategyOwnershipAssigner';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

const StrategyOwnershipPage = () => {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  
  const handleSave = (data) => console.log('Ownership saved:', data);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">{t({ en: 'Strategy Ownership', ar: 'ملكية الاستراتيجية' })}</h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Assign owners to strategic plan elements', ar: 'تعيين المالكين لعناصر الخطة الاستراتيجية' })}
        </p>
      </div>
      
      <StrategyOwnershipAssigner 
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
        onSave={handleSave} 
      />
    </div>
  );
};

export default ProtectedPage(StrategyOwnershipPage, { requiredPermissions: ['strategy_manage'] });
