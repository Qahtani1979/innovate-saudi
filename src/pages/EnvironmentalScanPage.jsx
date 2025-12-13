import React from 'react';
import EnvironmentalScanWidget from '@/components/strategy/preplanning/EnvironmentalScanWidget';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function EnvironmentalScanPage() {
  const { t } = useLanguage();

  const handleSave = (data) => {
    console.log('Environmental Scan saved:', data);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t({ en: 'Environmental Scan', ar: 'المسح البيئي' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ 
            en: 'Analyze external factors using PESTLE methodology to inform strategic planning',
            ar: 'تحليل العوامل الخارجية باستخدام منهجية PESTLE لإثراء التخطيط الاستراتيجي'
          })}
        </p>
      </div>
      
      <EnvironmentalScanWidget onSave={handleSave} />
    </div>
  );
}

export default ProtectedPage(EnvironmentalScanPage, { requiredPermissions: [] });
