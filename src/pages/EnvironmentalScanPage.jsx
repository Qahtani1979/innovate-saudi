import React from 'react';
import EnvironmentalScanWidget from '@/components/strategy/preplanning/EnvironmentalScanWidget';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function EnvironmentalScanPage() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();

  const handleSave = (data) => {
    console.log('Environmental Scan saved:', data);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      
      <div>
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
      
      <EnvironmentalScanWidget 
        strategicPlanId={activePlanId}
        strategicPlan={activePlan}
        onSave={handleSave} 
      />
    </div>
  );
}

export default ProtectedPage(EnvironmentalScanPage, { requiredPermissions: [] });
