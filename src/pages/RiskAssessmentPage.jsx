import React from 'react';
import RiskAssessmentBuilder from '@/components/strategy/preplanning/RiskAssessmentBuilder';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function RiskAssessmentPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();

  const handleSave = (data) => {
    console.log('Risk Assessment saved:', data);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">
          {t({ en: 'Risk Assessment', ar: 'تقييم المخاطر' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ 
            en: 'Identify, assess, and manage strategic risks using a probability-impact matrix',
            ar: 'تحديد وتقييم وإدارة المخاطر الاستراتيجية باستخدام مصفوفة الاحتمالية والتأثير'
          })}
        </p>
      </div>
      
      <RiskAssessmentBuilder 
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
        onSave={handleSave} 
      />
    </div>
  );
}

export default ProtectedPage(RiskAssessmentPage, { requiredPermissions: [] });
