import React from 'react';
import SectorStrategyBuilder from '@/components/strategy/creation/SectorStrategyBuilder';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

const SectorStrategyPage = () => {
  const { t } = useLanguage();
  const handleSave = (data) => console.log('Sector strategies saved:', data);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t({ en: 'Sector Strategy Builder', ar: 'منشئ استراتيجية القطاع' })}</h1>
      <SectorStrategyBuilder onSave={handleSave} />
    </div>
  );
};

export default ProtectedPage(SectorStrategyPage, { requiredPermissions: ['strategy_manage'] });
