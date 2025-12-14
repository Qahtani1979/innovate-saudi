import React from 'react';
import StrategyToEventGenerator from '@/components/strategy/cascade/StrategyToEventGenerator';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyEventGeneratorPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'Strategic Event Planner', ar: 'مخطط الفعاليات الاستراتيجية' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate event concepts aligned with strategic objectives', ar: 'إنشاء مفاهيم فعاليات متوافقة مع الأهداف الاستراتيجية' })}</p>
      </div>
      <StrategyToEventGenerator />
    </div>
  );
}

export default ProtectedPage(StrategyEventGeneratorPage, { requiredPermissions: ['strategy_cascade'] });
