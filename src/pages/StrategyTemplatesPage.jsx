import React from 'react';
import StrategyTemplateLibrary from '@/components/strategy/creation/StrategyTemplateLibrary';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

const StrategyTemplatesPage = () => {
  const { t } = useLanguage();
  const handleApply = (template) => console.log('Template applied:', template);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t({ en: 'Strategy Templates', ar: 'قوالب الاستراتيجية' })}</h1>
      <StrategyTemplateLibrary onApplyTemplate={handleApply} />
    </div>
  );
};

export default ProtectedPage(StrategyTemplatesPage, { requiredPermissions: ['strategy.view'] });
