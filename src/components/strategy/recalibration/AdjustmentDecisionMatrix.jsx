import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyRecalibration } from '@/hooks/strategy/useStrategyRecalibration';
import {
  Scale, Target, DollarSign, Shield, Users, CheckCircle2,
  AlertTriangle, XCircle, TrendingUp, ArrowRight
} from 'lucide-react';

const IMPACT_CRITERIA = [
  { id: 'strategicAlignment', icon: Target, label: { en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' }, weight: '30%' },
  { id: 'resourceEfficiency', icon: DollarSign, label: { en: 'Resource Efficiency', ar: 'كفاءة الموارد' }, weight: '25%' },
  { id: 'riskMitigation', icon: Shield, label: { en: 'Risk Mitigation', ar: 'تخفيف المخاطر' }, weight: '25%' },
  { id: 'stakeholderValue', icon: Users, label: { en: 'Stakeholder Value', ar: 'قيمة أصحاب المصلحة' }, weight: '20%' }
];

const TARGET_PHASES = [
  { value: '2', label: { en: 'Phase 2: Strategy Creation', ar: 'المرحلة 2: إنشاء الاستراتيجية' } },
  { value: '3', label: { en: 'Phase 3: Cascade', ar: 'المرحلة 3: التوزيع' } },
  { value: '4', label: { en: 'Phase 4: Governance', ar: 'المرحلة 4: الحوكمة' } },
  { value: '5', label: { en: 'Phase 5: Communication', ar: 'المرحلة 5: التواصل' } },
  { value: '6', label: { en: 'Phase 6: Monitoring', ar: 'المرحلة 6: المراقبة' } }
];

export default function AdjustmentDecisionMatrix({ planId, onAdjustmentApproved }) {
  const { t, language } = useLanguage();
  const { calculateImpactScore, createPivot, isPivotPending } = useStrategyRecalibration(planId);

  const [adjustment, setAdjustment] = useState({
    title: '',
    description: '',
    targetPhase: '',
    urgency: 'medium',
    strategicAlignment: 3,
    resourceEfficiency: 3,
    riskMitigation: 3,
    stakeholderValue: 3
  });

  const [result, setResult] = useState(null);

  const handleScoreChange = (criterion, value) => {
    setAdjustment(prev => ({ ...prev, [criterion]: value[0] }));
    setResult(null);
  };

  const evaluateAdjustment = () => {
    const score = calculateImpactScore(adjustment);
    setResult(score);
  };

  const submitAdjustment = () => {
    if (!result || result.decision === 'defer') return;
    
    createPivot({
      pivotType: 'adjustment',
      scope: adjustment.urgency === 'high' ? 'strategic' : 'entity',
      reason: adjustment.description,
      targetPhases: [parseInt(adjustment.targetPhase)],
      changes: {
        title: adjustment.title,
        impactScore: result.score,
        decision: result.decision,
        criteria: {
          strategicAlignment: adjustment.strategicAlignment,
          resourceEfficiency: adjustment.resourceEfficiency,
          riskMitigation: adjustment.riskMitigation,
          stakeholderValue: adjustment.stakeholderValue
        }
      }
    });

    if (onAdjustmentApproved) {
      onAdjustmentApproved({ ...adjustment, ...result });
    }
  };

  const getDecisionDisplay = (decision) => {
    switch (decision) {
      case 'proceed':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: t({ en: 'Proceed', ar: 'المتابعة' }) };
      case 'proceed_with_conditions':
        return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', label: t({ en: 'Proceed with Conditions', ar: 'المتابعة بشروط' }) };
      default:
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: t({ en: 'Defer', ar: 'تأجيل' }) };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          {t({ en: 'Adjustment Decision Matrix', ar: 'مصفوفة قرار التعديل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adjustment Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t({ en: 'Adjustment Title', ar: 'عنوان التعديل' })}</Label>
            <Textarea
              value={adjustment.title}
              onChange={(e) => setAdjustment(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t({ en: 'Brief title for the adjustment...', ar: 'عنوان موجز للتعديل...' })}
              rows={1}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Target Phase', ar: 'المرحلة المستهدفة' })}</Label>
            <Select
              value={adjustment.targetPhase}
              onValueChange={(value) => setAdjustment(prev => ({ ...prev, targetPhase: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select phase to modify', ar: 'حدد المرحلة للتعديل' })} />
              </SelectTrigger>
              <SelectContent>
                {TARGET_PHASES.map(phase => (
                  <SelectItem key={phase.value} value={phase.value}>
                    {t(phase.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Description & Justification', ar: 'الوصف والمبررات' })}</Label>
          <Textarea
            value={adjustment.description}
            onChange={(e) => setAdjustment(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t({ en: 'Describe the adjustment and why it is needed...', ar: 'صف التعديل ولماذا هو مطلوب...' })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Urgency Level', ar: 'مستوى الاستعجال' })}</Label>
          <div className="flex gap-2">
            {['low', 'medium', 'high'].map(level => (
              <Button
                key={level}
                variant={adjustment.urgency === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAdjustment(prev => ({ ...prev, urgency: level }))}
                className="flex-1"
              >
                {t({ en: level.charAt(0).toUpperCase() + level.slice(1), ar: level === 'low' ? 'منخفض' : level === 'medium' ? 'متوسط' : 'عالي' })}
              </Button>
            ))}
          </div>
        </div>

        {/* Impact Criteria Sliders */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium">{t({ en: 'Impact Assessment Criteria', ar: 'معايير تقييم التأثير' })}</h3>
          
          {IMPACT_CRITERIA.map(criterion => {
            const Icon = criterion.icon;
            return (
              <div key={criterion.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {t(criterion.label)}
                    <span className="text-xs text-muted-foreground">({criterion.weight})</span>
                  </Label>
                  <span className="font-medium w-8 text-center">{adjustment[criterion.id]}</span>
                </div>
                <Slider
                  value={[adjustment[criterion.id]]}
                  onValueChange={(value) => handleScoreChange(criterion.id, value)}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t({ en: 'Low', ar: 'منخفض' })}</span>
                  <span>{t({ en: 'High', ar: 'عالي' })}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Evaluate Button */}
        <Button 
          onClick={evaluateAdjustment}
          className="w-full"
          disabled={!adjustment.title || !adjustment.targetPhase}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          {t({ en: 'Evaluate Impact Score', ar: 'تقييم درجة التأثير' })}
        </Button>

        {/* Result Display */}
        {result && (
          <div className={`p-4 rounded-lg ${getDecisionDisplay(result.decision).bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(getDecisionDisplay(result.decision).icon, {
                  className: `h-8 w-8 ${getDecisionDisplay(result.decision).color}`
                })}
                <div>
                  <p className="font-bold text-2xl">{result.score}/5.0</p>
                  <p className={`text-sm ${getDecisionDisplay(result.decision).color}`}>
                    {getDecisionDisplay(result.decision).label}
                  </p>
                </div>
              </div>
              
              {result.decision !== 'defer' && (
                <Button onClick={submitAdjustment} disabled={isPivotPending}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit for Approval', ar: 'إرسال للموافقة' })}
                </Button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-current/10">
              <p className="text-sm">
                {result.decision === 'proceed' && t({ 
                  en: 'This adjustment scores well across all criteria and can proceed immediately.',
                  ar: 'هذا التعديل حقق نتائج جيدة في جميع المعايير ويمكن المتابعة فوراً.'
                })}
                {result.decision === 'proceed_with_conditions' && t({
                  en: 'This adjustment requires additional review or conditions before implementation.',
                  ar: 'هذا التعديل يتطلب مراجعة إضافية أو شروط قبل التنفيذ.'
                })}
                {result.decision === 'defer' && t({
                  en: 'This adjustment does not meet the threshold. Consider revising or deferring to next cycle.',
                  ar: 'هذا التعديل لا يستوفي الحد الأدنى. فكر في المراجعة أو التأجيل للدورة القادمة.'
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
