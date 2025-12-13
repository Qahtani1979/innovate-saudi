import React from 'react';
import StrategyToCampaignGenerator from '@/components/strategy/cascade/StrategyToCampaignGenerator';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyCampaignGeneratorPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'Campaign Generator', ar: 'مولد الحملات' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate strategic campaigns from objectives', ar: 'إنشاء حملات استراتيجية من الأهداف' })}</p>
      </div>
      <StrategyToCampaignGenerator />
    </div>
  );
}

export default ProtectedPage(StrategyCampaignGeneratorPage, { requiredPermissions: ['strategy.manage'] });
