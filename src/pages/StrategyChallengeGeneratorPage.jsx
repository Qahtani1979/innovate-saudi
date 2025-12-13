import React from 'react';
import StrategyChallengeGenerator from '@/components/strategy/cascade/StrategyChallengeGenerator';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyChallengeGeneratorPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'Challenge Generator', ar: 'مولد التحديات' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Generate innovation challenges from strategic objectives', ar: 'إنشاء تحديات الابتكار من الأهداف الاستراتيجية' })}</p>
      </div>
      <StrategyChallengeGenerator />
    </div>
  );
}

export default ProtectedPage(StrategyChallengeGeneratorPage, { requiredPermissions: ['strategy.manage'] });
