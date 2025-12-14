import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import StrategyAdjustmentWizard from '@/components/strategy/review/StrategyAdjustmentWizard';
import StrategyReprioritizer from '@/components/strategy/review/StrategyReprioritizer';
import StrategyImpactAssessment from '@/components/strategy/review/StrategyImpactAssessment';
import { Settings, ArrowUpDown, BarChart3 } from 'lucide-react';

function StrategyReviewPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('adjustment');

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'Strategy Review & Adjustment', ar: 'مراجعة وتعديل الاستراتيجية' })}</h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Review strategy execution, reprioritize objectives, and assess impact', ar: 'مراجعة تنفيذ الاستراتيجية وإعادة ترتيب الأولويات وتقييم الأثر' })}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="adjustment" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t({ en: 'Adjustment Wizard', ar: 'معالج التعديل' })}
          </TabsTrigger>
          <TabsTrigger value="reprioritize" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            {t({ en: 'Reprioritizer', ar: 'إعادة الترتيب' })}
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t({ en: 'Impact Assessment', ar: 'تقييم الأثر' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adjustment">
          <StrategyAdjustmentWizard />
        </TabsContent>

        <TabsContent value="reprioritize">
          <StrategyReprioritizer />
        </TabsContent>

        <TabsContent value="impact">
          <StrategyImpactAssessment />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategyReviewPage, { requiredPermissions: ['strategy_manage'] });
