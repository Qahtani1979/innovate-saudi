import React from 'react';
import ActionPlanBuilder from '@/components/strategy/creation/ActionPlanBuilder';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

const ActionPlanPage = () => {
  const { t } = useLanguage();
  const handleSave = (data) => console.log('Action plans saved:', data);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t({ en: 'Action Plan Builder', ar: 'منشئ خطة العمل' })}</h1>
      <ActionPlanBuilder onSave={handleSave} />
    </div>
  );
};

export default ProtectedPage(ActionPlanPage, { requiredPermissions: ['strategy_manage'] });
