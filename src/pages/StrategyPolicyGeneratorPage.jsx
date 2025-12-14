import React from 'react';
import StrategyToPolicyGenerator from '@/components/strategy/cascade/StrategyToPolicyGenerator';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyPolicyGeneratorPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'Policy Generator', ar: 'مولد السياسات' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate policies aligned with strategic priorities', ar: 'إنشاء سياسات متوافقة مع الأولويات الاستراتيجية' })}</p>
      </div>
      <StrategyToPolicyGenerator />
    </div>
  );
}

export default ProtectedPage(StrategyPolicyGeneratorPage, { requiredPermissions: ['strategy_cascade'] });
