import React from 'react';
import StakeholderAnalysisWidget from '@/components/strategy/preplanning/StakeholderAnalysisWidget';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StakeholderAnalysisPage() {
  const { t } = useLanguage();

  const handleSave = (data) => {
    console.log('Stakeholder Analysis saved:', data);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
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
      
      <StakeholderAnalysisWidget onSave={handleSave} />
    </div>
  );
}

export default ProtectedPage(StakeholderAnalysisPage, { requiredPermissions: [] });
