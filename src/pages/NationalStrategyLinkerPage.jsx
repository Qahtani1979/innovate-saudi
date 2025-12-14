import React from 'react';
import NationalStrategyLinker from '@/components/strategy/creation/NationalStrategyLinker';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

const NationalStrategyLinkerPage = () => {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  
  const handleSave = (data) => console.log('Alignments saved:', data);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">{t({ en: 'National Strategy Alignment', ar: 'مواءمة الاستراتيجية الوطنية' })}</h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Link your strategic plan to national strategies', ar: 'ربط خطتك الاستراتيجية بالاستراتيجيات الوطنية' })}
        </p>
      </div>
      
      <NationalStrategyLinker 
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
        onSave={handleSave} 
      />
    </div>
  );
};

export default ProtectedPage(NationalStrategyLinkerPage, { requiredPermissions: ['strategy_manage'] });
