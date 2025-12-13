import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { 
  Settings, ChevronRight, ChevronLeft, Check, AlertTriangle,
  Target, Calendar, Users, FileText, Bell, CheckCircle2
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

export default function StrategyAdjustmentWizard({ planId, onComplete }) {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [adjustmentData, setAdjustmentData] = useState({
    elementType: '',
    elementId: '',
    changeType: '',
    currentValue: '',
    newValue: '',
    justification: '',
    impactLevel: 'medium',
    approvers: [],
    notifyStakeholders: true
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Submit adjustment
    onComplete?.(adjustmentData);
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
                onValueChange={(value) => setAdjustmentData({ ...adjustmentData, elementType: value })}
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
            <div>
              <label className="text-sm font-medium">{t({ en: 'Justification', ar: 'التبرير' })}</label>
              <Textarea 
                value={adjustmentData.justification}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, justification: e.target.value })}
                placeholder={t({ en: 'Explain why this adjustment is needed...', ar: 'اشرح لماذا هذا التعديل مطلوب...' })}
                rows={4}
              />
            </div>
          </div>
        );

      case 'impact':
        return (
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">{t({ en: 'Estimated Impact', ar: 'الأثر المتوقع' })}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t({ en: 'Downstream Entities', ar: 'الكيانات المتأثرة' })}</span>
                    <Badge>5 {t({ en: 'entities', ar: 'كيانات' })}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t({ en: 'Budget Impact', ar: 'أثر الميزانية' })}</span>
                    <Badge variant="secondary">+12%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t({ en: 'Timeline Impact', ar: 'أثر الجدول الزمني' })}</span>
                    <Badge variant="outline">{t({ en: 'No change', ar: 'بدون تغيير' })}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              {['Strategy Director', 'Deputy Minister', 'Innovation Committee'].map((approver, i) => (
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
                <span>{adjustmentData.elementType || '-'}</span>
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
            <Button onClick={handleComplete}>
              <Check className="h-4 w-4 mr-2" />
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
