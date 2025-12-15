import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout } from '@/components/layout/PersonaPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Layers, Settings, Target, Sparkles, AlertCircle } from 'lucide-react';

// Import recalibration components
import FeedbackAnalysisEngine from '@/components/strategy/recalibration/FeedbackAnalysisEngine';
import AdjustmentDecisionMatrix from '@/components/strategy/recalibration/AdjustmentDecisionMatrix';
import MidCyclePivotManager from '@/components/strategy/recalibration/MidCyclePivotManager';
import BaselineRecalibrator from '@/components/strategy/recalibration/BaselineRecalibrator';
import NextCycleInitializer from '@/components/strategy/recalibration/NextCycleInitializer';

function StrategyRecalibrationPage() {
  const { t, isRTL } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  const [activeTab, setActiveTab] = useState('feedback');

  const tabs = [
    { id: 'feedback', label: { en: 'Feedback Analysis', ar: 'تحليل التعليقات' }, icon: Brain },
    { id: 'matrix', label: { en: 'Adjustment Matrix', ar: 'مصفوفة التعديل' }, icon: Layers },
    { id: 'pivot', label: { en: 'Mid-Cycle Pivot', ar: 'التحويل منتصف الدورة' }, icon: Settings },
    { id: 'baseline', label: { en: 'Baseline Recalibrator', ar: 'إعادة معايرة الأساس' }, icon: Target },
    { id: 'next', label: { en: 'Next Cycle', ar: 'الدورة التالية' }, icon: Sparkles },
  ];

  if (!activePlanId) {
    return (
      <PageLayout
        title={{ en: 'Strategy Recalibration', ar: 'إعادة معايرة الاستراتيجية' }}
        subtitle={{ en: 'Adjust and recalibrate strategic plans', ar: 'تعديل وإعادة معايرة الخطط الاستراتيجية' }}
        icon={Settings}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t({ en: 'No Active Plan Selected', ar: 'لم يتم اختيار خطة نشطة' })}
              </h3>
              <p className="text-muted-foreground">
                {t({ en: 'Please select a strategic plan from the Strategy Hub to begin recalibration.', ar: 'يرجى اختيار خطة استراتيجية من مركز الاستراتيجية لبدء إعادة المعايرة.' })}
              </p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={{ en: 'Strategy Recalibration', ar: 'إعادة معايرة الاستراتيجية' }}
      subtitle={{ 
        en: `Phase 8: Recalibration tools for ${activePlan?.name_en || 'Strategic Plan'}`, 
        ar: `المرحلة 8: أدوات إعادة المعايرة لـ ${activePlan?.name_ar || 'الخطة الاستراتيجية'}` 
      }}
      icon={Settings}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t(tab.label)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {t({ en: 'Feedback Analysis Engine', ar: 'محرك تحليل التعليقات' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'AI-powered analysis of stakeholder feedback and performance data', ar: 'تحليل مدعوم بالذكاء الاصطناعي للتعليقات وبيانات الأداء' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackAnalysisEngine strategicPlanId={activePlanId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                {t({ en: 'Adjustment Decision Matrix', ar: 'مصفوفة قرارات التعديل' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Decision support for strategic adjustments based on impact and feasibility', ar: 'دعم القرار للتعديلات الاستراتيجية بناءً على الأثر والجدوى' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdjustmentDecisionMatrix strategicPlanId={activePlanId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pivot">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                {t({ en: 'Mid-Cycle Pivot Manager', ar: 'مدير التحويل منتصف الدورة' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Manage strategic pivots and course corrections during execution', ar: 'إدارة التحويلات الاستراتيجية وتصحيحات المسار أثناء التنفيذ' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MidCyclePivotManager strategicPlanId={activePlanId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="baseline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t({ en: 'Baseline Recalibrator', ar: 'معايرة خط الأساس' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Recalibrate baselines and targets based on new data and learnings', ar: 'إعادة معايرة خطوط الأساس والأهداف بناءً على البيانات والدروس الجديدة' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BaselineRecalibrator strategicPlanId={activePlanId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="next">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t({ en: 'Next Cycle Initializer', ar: 'مُهيئ الدورة التالية' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Initialize and prepare the next strategic planning cycle', ar: 'تهيئة وإعداد دورة التخطيط الاستراتيجي التالية' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NextCycleInitializer strategicPlanId={activePlanId} currentPlan={activePlan} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(StrategyRecalibrationPage, { 
  requiredPermissions: ['strategy_manage'] 
});
