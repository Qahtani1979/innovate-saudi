import React from 'react';
import BaselineDataCollector from '@/components/strategy/preplanning/BaselineDataCollector';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function BaselineDataPage() {
  const { t } = useLanguage();

  const handleSave = (data) => {
    console.log('Baseline Data saved:', data);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t({ en: 'Baseline Data Collection', ar: 'جمع البيانات الأساسية' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ 
            en: 'Capture and validate baseline KPI values for measuring strategic progress',
            ar: 'التقاط والتحقق من قيم مؤشرات الأداء الأساسية لقياس التقدم الاستراتيجي'
          })}
        </p>
      </div>
      
      <BaselineDataCollector onSave={handleSave} />
    </div>
  );
}

export default ProtectedPage(BaselineDataPage, { requiredPermissions: [] });
