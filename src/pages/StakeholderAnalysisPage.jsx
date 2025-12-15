import React from 'react';
import StakeholderAnalysisWidget from '@/components/strategy/preplanning/StakeholderAnalysisWidget';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import NoPlanGuard from '@/components/strategy/NoPlanGuard';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StakeholderAnalysisPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();

  const handleSave = (data) => {
    console.log('Stakeholder Analysis saved:', data);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">
          {t({ en: 'Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ 
            en: 'Map and analyze stakeholders using the Power/Interest Grid methodology',
            ar: 'رسم خريطة وتحليل أصحاب المصلحة باستخدام منهجية شبكة القوة/الاهتمام'
          })}
        </p>
      </div>
      
      <NoPlanGuard>
        <StakeholderAnalysisWidget 
          strategicPlanId={activePlanId}
          strategicPlan={activePlan}
          onSave={handleSave} 
        />
      </NoPlanGuard>
    </div>
  );
}

export default ProtectedPage(StakeholderAnalysisPage, { requiredPermissions: [] });
