import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Settings, ChevronRight, ChevronLeft, Check, AlertTriangle,
  Target, Calendar, Users, FileText, Bell, CheckCircle2, Sparkles, Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STEPS = [
  { id: 'select', label: { en: 'Select Elements', ar: 'اختيار العناصر' }, icon: Target },
  { id: 'define', label: { en: 'Define Changes', ar: 'تحديد التغييرات' }, icon: FileText },
  { id: 'justify', label: { en: 'Justification', ar: 'التبرير' }, icon: AlertTriangle },
  { id: 'impact', label: { en: 'Impact Analysis', ar: 'تحليل الأثر' }, icon: Settings },
  { id: 'approval', label: { en: 'Approval Routing', ar: 'مسار الموافقة' }, icon: Users },
  { id: 'confirm', label: { en: 'Confirm', ar: 'تأكيد' }, icon: CheckCircle2 }
];

export default function StrategyAdjustmentWizard({ strategicPlanId, strategicPlan, planId, onComplete }) {
  const activePlanId = strategicPlanId || planId;
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();
  const [currentStep, setCurrentStep] = useState(0);
  const [aiImpactAnalysis, setAiImpactAnalysis] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    elementType: '',
    elementId: '',
    elementName: '',
    changeType: '',
    currentValue: '',
    newValue: '',
    justification: '',
    impactLevel: 'medium',
    approvers: [],
    notifyStakeholders: true
  });

  // Fetch objectives and KPIs for selection
  const { data: objectives = [] } = useQuery({
    queryKey: ['adjustment-objectives', activePlanId],
    queryFn: async () => {
      if (!activePlanId) return [];
      const { data } = await supabase
        .from('strategic_objectives')
        .select('id, title_en, title_ar, target_value, current_value')
        .eq('strategic_plan_id', activePlanId);
      return data || [];
    },
    enabled: !!activePlanId
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['adjustment-kpis', activePlanId],
    queryFn: async () => {
      if (!activePlanId) return [];
      const { data } = await supabase
        .from('strategy_kpis')
        .select('id, name_en, name_ar, target_value, current_value, unit')
        .eq('strategic_plan_id', activePlanId);
      return data || [];
    },
    enabled: !!activePlanId
  });

  // Save adjustment mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Create approval request for the adjustment
      const { error } = await supabase
        .from('approval_requests')
        .insert({
          request_type: 'strategy_adjustment',
          entity_type: data.elementType,
          entity_id: data.elementId || null,
          requester_email: user?.user?.email || 'system',
          requester_notes: data.justification,
          metadata: {
            element_name: data.elementName,
            change_type: data.changeType,
            current_value: data.currentValue,
            new_value: data.newValue,
            impact_level: data.impactLevel,
            strategic_plan_id: activePlanId,
            ai_analysis: aiImpactAnalysis
          }
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['approval_requests']);
      toast.success(t({ en: 'Adjustment submitted for approval', ar: 'تم إرسال التعديل للموافقة' }));
      onComplete?.(adjustmentData);
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error(t({ en: 'Failed to submit adjustment', ar: 'فشل في إرسال التعديل' }));
    }
  });

  const handleAIJustification = async () => {
    if (!adjustmentData.elementType || !adjustmentData.changeType) {
      toast.error(t({ en: 'Please select element and change type first', ar: 'يرجى اختيار العنصر ونوع التغيير أولاً' }));
      return;
    }

    try {
      const result = await invokeAI({
        system_prompt: 'You are a strategic planning expert. Help draft a professional justification for a strategy adjustment.',
        prompt: `Draft a professional justification for this strategy adjustment:

Element Type: ${adjustmentData.elementType}
Element: ${adjustmentData.elementName || 'Not specified'}
Change Type: ${adjustmentData.changeType}
Current Value: ${adjustmentData.currentValue || 'Not specified'}
New Value: ${adjustmentData.newValue || 'Not specified'}

Provide a well-structured justification (2-3 paragraphs) that:
1. Explains why this change is necessary
2. Describes expected benefits
3. Addresses potential risks`,
        response_json_schema: {
          type: 'object',
          properties: {
            justification: { type: 'string' }
          },
          required: ['justification']
        }
      });

      if (result.success && result.data?.justification) {
        setAdjustmentData(prev => ({ ...prev, justification: result.data.justification }));
        toast.success(t({ en: 'AI justification generated', ar: 'تم إنشاء التبرير الذكي' }));
      }
    } catch (error) {
      console.error('AI error:', error);
      toast.error(t({ en: 'AI generation failed', ar: 'فشل الإنشاء الذكي' }));
    }
  };

  const handleAIImpactAnalysis = async () => {
    try {
      const result = await invokeAI({
        system_prompt: 'You are a strategic planning expert. Analyze the potential impact of a strategy adjustment.',
        prompt: `Analyze the impact of this strategy adjustment:

Element Type: ${adjustmentData.elementType}
Element: ${adjustmentData.elementName || 'Not specified'}
Change Type: ${adjustmentData.changeType}
Current Value: ${adjustmentData.currentValue}
New Value: ${adjustmentData.newValue}
Justification: ${adjustmentData.justification}

Provide:
1. Affected entities (list of areas/teams impacted)
2. Budget impact estimate
3. Timeline impact
4. Risk assessment
5. Recommended impact level (low/medium/high)`,
        response_json_schema: {
          type: 'object',
          properties: {
            affected_entities: { type: 'array', items: { type: 'string' } },
            budget_impact: { type: 'string' },
            timeline_impact: { type: 'string' },
            risks: { type: 'array', items: { type: 'string' } },
            recommended_level: { type: 'string', enum: ['low', 'medium', 'high'] }
          },
          required: ['affected_entities', 'budget_impact', 'timeline_impact', 'recommended_level']
        }
      });

      if (result.success && result.data) {
        setAiImpactAnalysis(result.data);
        setAdjustmentData(prev => ({ 
          ...prev, 
          impactLevel: result.data.recommended_level || 'medium' 
        }));
        toast.success(t({ en: 'AI impact analysis complete', ar: 'اكتمل تحليل الأثر الذكي' }));
      }
    } catch (error) {
      console.error('AI error:', error);
      toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل الذكي' }));
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      // Auto-trigger AI impact analysis when entering impact step
      if (currentStep === 2 && !aiImpactAnalysis) {
        handleAIImpactAnalysis();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    saveMutation.mutate(adjustmentData);
  };

  const getElementOptions = () => {
    if (adjustmentData.elementType === 'objective') {
      return objectives.map(obj => ({
        id: obj.id,
        name: language === 'ar' && obj.title_ar ? obj.title_ar : obj.title_en,
        currentValue: obj.current_value
      }));
    }
    if (adjustmentData.elementType === 'kpi') {
      return kpis.map(kpi => ({
        id: kpi.id,
        name: language === 'ar' && kpi.name_ar ? kpi.name_ar : kpi.name_en,
        currentValue: `${kpi.current_value || 0} ${kpi.unit || ''}`
      }));
    }
    return [];
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'select':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Element Type', ar: 'نوع العنصر' })}</label>
              <Select 
                value={adjustmentData.elementType}
                onValueChange={(value) => setAdjustmentData({ ...adjustmentData, elementType: value, elementId: '', elementName: '', currentValue: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select type', ar: 'اختر النوع' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="objective">{t({ en: 'Strategic Objective', ar: 'هدف استراتيجي' })}</SelectItem>
                  <SelectItem value="kpi">{t({ en: 'KPI Target', ar: 'مؤشر أداء' })}</SelectItem>
                  <SelectItem value="timeline">{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</SelectItem>
                  <SelectItem value="budget">{t({ en: 'Budget Allocation', ar: 'تخصيص الميزانية' })}</SelectItem>
                  <SelectItem value="priority">{t({ en: 'Priority', ar: 'الأولوية' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(adjustmentData.elementType === 'objective' || adjustmentData.elementType === 'kpi') && (
              <div>
                <label className="text-sm font-medium">{t({ en: 'Select Element', ar: 'اختر العنصر' })}</label>
                <Select 
                  value={adjustmentData.elementId}
                  onValueChange={(value) => {
                    const element = getElementOptions().find(e => e.id === value);
                    setAdjustmentData({ 
                      ...adjustmentData, 
                      elementId: value, 
                      elementName: element?.name || '',
                      currentValue: element?.currentValue || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Select element', ar: 'اختر العنصر' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {getElementOptions().map(opt => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">{t({ en: 'Change Type', ar: 'نوع التغيير' })}</label>
              <Select 
                value={adjustmentData.changeType}
                onValueChange={(value) => setAdjustmentData({ ...adjustmentData, changeType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select change type', ar: 'اختر نوع التغيير' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modify">{t({ en: 'Modify', ar: 'تعديل' })}</SelectItem>
                  <SelectItem value="extend">{t({ en: 'Extend', ar: 'تمديد' })}</SelectItem>
                  <SelectItem value="reduce">{t({ en: 'Reduce', ar: 'تقليل' })}</SelectItem>
                  <SelectItem value="remove">{t({ en: 'Remove', ar: 'إزالة' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'define':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Current Value', ar: 'القيمة الحالية' })}</label>
              <Input 
                value={adjustmentData.currentValue}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, currentValue: e.target.value })}
                placeholder={t({ en: 'Enter current value', ar: 'أدخل القيمة الحالية' })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t({ en: 'New Value', ar: 'القيمة الجديدة' })}</label>
              <Input 
                value={adjustmentData.newValue}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, newValue: e.target.value })}
                placeholder={t({ en: 'Enter new value', ar: 'أدخل القيمة الجديدة' })}
              />
            </div>
          </div>
        );

      case 'justify':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t({ en: 'Justification', ar: 'التبرير' })}</label>
              <Button variant="outline" size="sm" onClick={handleAIJustification} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {t({ en: 'AI Draft', ar: 'صياغة ذكية' })}
              </Button>
            </div>
            <Textarea 
              value={adjustmentData.justification}
              onChange={(e) => setAdjustmentData({ ...adjustmentData, justification: e.target.value })}
              placeholder={t({ en: 'Explain why this adjustment is needed...', ar: 'اشرح لماذا هذا التعديل مطلوب...' })}
              rows={6}
            />
          </div>
        );

      case 'impact':
        return (
          <div className="space-y-4">
            {aiImpactAnalysis ? (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Sparkles className="h-4 w-4" />
                    {t({ en: 'AI Impact Analysis', ar: 'تحليل الأثر الذكي' })}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t({ en: 'Affected Areas:', ar: 'المناطق المتأثرة:' })}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiImpactAnalysis.affected_entities?.map((e, i) => (
                          <Badge key={i} variant="secondary">{e}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t({ en: 'Budget Impact:', ar: 'أثر الميزانية:' })}</span>
                      <Badge variant="outline" className="ml-2">{aiImpactAnalysis.budget_impact}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t({ en: 'Timeline Impact:', ar: 'أثر الجدول:' })}</span>
                      <Badge variant="outline" className="ml-2">{aiImpactAnalysis.timeline_impact}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t({ en: 'Risks:', ar: 'المخاطر:' })}</span>
                      <ul className="text-xs mt-1">
                        {aiImpactAnalysis.risks?.map((r, i) => (
                          <li key={i} className="text-amber-700">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button variant="outline" onClick={handleAIImpactAnalysis} disabled={aiLoading} className="w-full">
                {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {t({ en: 'Run AI Impact Analysis', ar: 'تشغيل تحليل الأثر الذكي' })}
              </Button>
            )}
            <div>
              <label className="text-sm font-medium">{t({ en: 'Impact Level', ar: 'مستوى الأثر' })}</label>
              <Select 
                value={adjustmentData.impactLevel}
                onValueChange={(value) => setAdjustmentData({ ...adjustmentData, impactLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                  <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                  <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'approval':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Based on the impact level, the following approvers are required:', ar: 'بناءً على مستوى الأثر، المعتمدون التاليون مطلوبون:' })}
            </p>
            <div className="space-y-2">
              {(adjustmentData.impactLevel === 'high' ? 
                ['Strategy Director', 'Deputy Minister', 'Innovation Committee'] :
                adjustmentData.impactLevel === 'medium' ?
                ['Strategy Director', 'Department Head'] :
                ['Strategy Director']
              ).map((approver, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{approver}</span>
                  <Badge variant="outline" className="ml-auto">{t({ en: 'Required', ar: 'مطلوب' })}</Badge>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="notify"
                checked={adjustmentData.notifyStakeholders}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, notifyStakeholders: e.target.checked })}
              />
              <label htmlFor="notify" className="text-sm">
                {t({ en: 'Notify all stakeholders after approval', ar: 'إخطار جميع أصحاب المصلحة بعد الموافقة' })}
              </label>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                {t({ en: 'Ready to Submit', ar: 'جاهز للإرسال' })}
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t({ en: 'Your adjustment request will be sent for approval.', ar: 'سيتم إرسال طلب التعديل للموافقة.' })}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t({ en: 'Element:', ar: 'العنصر:' })}</span>
                <span>{adjustmentData.elementName || adjustmentData.elementType || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t({ en: 'Change:', ar: 'التغيير:' })}</span>
                <span>{adjustmentData.currentValue} → {adjustmentData.newValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t({ en: 'Impact:', ar: 'الأثر:' })}</span>
                <Badge variant="secondary">{adjustmentData.impactLevel}</Badge>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          {t({ en: 'Strategy Adjustment Wizard', ar: 'معالج تعديل الاستراتيجية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 ${
                  isActive ? 'border-primary bg-primary text-primary-foreground' :
                  isCompleted ? 'border-primary bg-primary/20 text-primary' :
                  'border-muted-foreground/30 text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 mx-2 ${isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mb-4">
          <h3 className="font-semibold">{t(STEPS[currentStep].label)}</h3>
        </div>

        {/* Step Content */}
        <div className="min-h-[200px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t({ en: 'Back', ar: 'رجوع' })}
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleComplete} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {t({ en: 'Submit for Approval', ar: 'إرسال للموافقة' })}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {t({ en: 'Next', ar: 'التالي' })}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
