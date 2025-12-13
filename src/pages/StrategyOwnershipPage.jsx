import React from 'react';
import StrategyOwnershipAssigner from '@/components/strategy/creation/StrategyOwnershipAssigner';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

const StrategyOwnershipPage = () => {
  const { t } = useLanguage();
  const handleSave = (data) => console.log('Ownership saved:', data);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t({ en: 'Strategy Ownership', ar: 'ملكية الاستراتيجية' })}</h1>
      <StrategyOwnershipAssigner onSave={handleSave} />
    </div>
  );
};

export default ProtectedPage(StrategyOwnershipPage, { requiredPermissions: ['strategy.manage'] });
