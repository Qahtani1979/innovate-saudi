import React from 'react';
import StrategyToPilotGenerator from '@/components/strategy/cascade/StrategyToPilotGenerator';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyPilotGeneratorPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'Pilot Design Generator', ar: 'مولد تصميم التجارب' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate pilot project designs from challenges and solutions', ar: 'إنشاء تصميمات المشاريع التجريبية من التحديات والحلول' })}</p>
      </div>
      <StrategyToPilotGenerator />
    </div>
  );
}

export default ProtectedPage(StrategyPilotGeneratorPage, { requiredPermissions: ['strategy_cascade'] });
