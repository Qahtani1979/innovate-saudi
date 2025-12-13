import React from 'react';
import SWOTAnalysisBuilder from '@/components/strategy/preplanning/SWOTAnalysisBuilder';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function SWOTAnalysisPage() {
  const { t } = useLanguage();

  const handleSave = (swotData) => {
    console.log('SWOT Data saved:', swotData);
    // TODO: Persist to database when strategic_swot_analyses table is created
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t({ en: 'SWOT Analysis', ar: 'تحليل SWOT' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ 
            en: 'Analyze your strategic position through Strengths, Weaknesses, Opportunities, and Threats',
            ar: 'حلل موقعك الاستراتيجي من خلال نقاط القوة والضعف والفرص والتهديدات'
          })}
        </p>
      </div>
      
      <SWOTAnalysisBuilder onSave={handleSave} />
    </div>
  );
}

export default ProtectedPage(SWOTAnalysisPage, { requiredPermissions: [] });
