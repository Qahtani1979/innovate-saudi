import React from 'react';
import NationalStrategyLinker from '@/components/strategy/creation/NationalStrategyLinker';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

const NationalStrategyLinkerPage = () => {
  const { t } = useLanguage();
  const handleSave = (data) => console.log('Alignments saved:', data);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t({ en: 'National Strategy Alignment', ar: 'مواءمة الاستراتيجية الوطنية' })}</h1>
      <NationalStrategyLinker onSave={handleSave} />
    </div>
  );
};

export default ProtectedPage(NationalStrategyLinkerPage, { requiredPermissions: ['strategy.manage'] });
