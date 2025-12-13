import React from 'react';
import RiskAssessmentBuilder from '@/components/strategy/preplanning/RiskAssessmentBuilder';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function RiskAssessmentPage() {
  const { t } = useLanguage();

  const handleSave = (data) => {
    console.log('Risk Assessment saved:', data);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
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
      
      <RiskAssessmentBuilder onSave={handleSave} />
    </div>
  );
}

export default ProtectedPage(RiskAssessmentPage, { requiredPermissions: [] });
