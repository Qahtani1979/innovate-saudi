import React from 'react';
import StrategyToLivingLabGenerator from '@/components/strategy/cascade/StrategyToLivingLabGenerator';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyLivingLabGeneratorPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'Living Lab Generator', ar: 'مولد المختبرات الحية' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate living lab concepts from strategic priorities', ar: 'إنشاء مفاهيم المختبرات الحية من الأولويات الاستراتيجية' })}</p>
      </div>
      <StrategyToLivingLabGenerator />
    </div>
  );
}

export default ProtectedPage(StrategyLivingLabGeneratorPage, { requiredPermissions: ['strategy.manage'] });
