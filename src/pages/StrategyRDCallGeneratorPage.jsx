import React from 'react';
import StrategyToRDCallGenerator from '@/components/strategy/cascade/StrategyToRDCallGenerator';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyRDCallGeneratorPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'R&D Call Generator', ar: 'مولد طلبات البحث والتطوير' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate R&D calls from strategic challenges', ar: 'إنشاء طلبات البحث والتطوير من التحديات الاستراتيجية' })}</p>
      </div>
      <StrategyToRDCallGenerator />
    </div>
  );
}

export default ProtectedPage(StrategyRDCallGeneratorPage, { requiredPermissions: ['strategy.manage'] });
