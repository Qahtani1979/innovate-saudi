import React from 'react';
import SWOTAnalysisBuilder from '@/components/strategy/preplanning/SWOTAnalysisBuilder';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/ProtectedPage';
import PageHeader from '@/components/PageHeader';

function SWOTAnalysisPage() {
  const { t } = useLanguage();

  const handleSave = (swotData) => {
    console.log('SWOT Data saved:', swotData);
    // TODO: Persist to database when strategic_swot_analyses table is created
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title={t({ en: 'SWOT Analysis', ar: 'تحليل SWOT' })}
        description={t({ 
          en: 'Analyze your strategic position through Strengths, Weaknesses, Opportunities, and Threats',
          ar: 'حلل موقعك الاستراتيجي من خلال نقاط القوة والضعف والفرص والتهديدات'
        })}
      />
      
      <SWOTAnalysisBuilder onSave={handleSave} />
    </div>
  );
}

export default function SWOTAnalysisPageProtected() {
  return (
    <ProtectedPage>
      <SWOTAnalysisPage />
    </ProtectedPage>
  );
}
