import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '@/components/LanguageContext';
import { Layers } from 'lucide-react';

/**
 * Step 3: Problem Details for Challenge Creation
 */
export default function ChallengeCreateStep3({ 
  formData, 
  updateField,
  validationErrors = {}
}) {
  const { t, isRTL } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-orange-600" />
          {t({ en: 'Problem Details', ar: 'تفاصيل المشكلة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Problem Statement */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t({ en: 'Problem Statement (EN)', ar: 'بيان المشكلة (إنجليزي)' })}</Label>
            <Textarea
              value={formData.problem_statement_en || ''}
              onChange={(e) => updateField('problem_statement_en', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Problem Statement (AR)', ar: 'بيان المشكلة (عربي)' })}</Label>
            <Textarea
              value={formData.problem_statement_ar || ''}
              onChange={(e) => updateField('problem_statement_ar', e.target.value)}
              rows={3}
              dir="rtl"
            />
          </div>
        </div>

        {/* Current Situation */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t({ en: 'Current Situation (EN)', ar: 'الوضع الحالي (إنجليزي)' })}</Label>
            <Textarea
              value={formData.current_situation_en || ''}
              onChange={(e) => updateField('current_situation_en', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Current Situation (AR)', ar: 'الوضع الحالي (عربي)' })}</Label>
            <Textarea
              value={formData.current_situation_ar || ''}
              onChange={(e) => updateField('current_situation_ar', e.target.value)}
              rows={3}
              dir="rtl"
            />
          </div>
        </div>

        {/* Desired Outcome */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t({ en: 'Desired Outcome (EN)', ar: 'النتيجة المرغوبة (إنجليزي)' })}</Label>
            <Textarea
              value={formData.desired_outcome_en || ''}
              onChange={(e) => updateField('desired_outcome_en', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Desired Outcome (AR)', ar: 'النتيجة المرغوبة (عربي)' })}</Label>
            <Textarea
              value={formData.desired_outcome_ar || ''}
              onChange={(e) => updateField('desired_outcome_ar', e.target.value)}
              rows={3}
              dir="rtl"
            />
          </div>
        </div>

        {/* Root Cause */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t({ en: 'Root Cause (EN)', ar: 'السبب الجذري (إنجليزي)' })}</Label>
            <Textarea
              value={formData.root_cause_en || ''}
              onChange={(e) => updateField('root_cause_en', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Root Cause (AR)', ar: 'السبب الجذري (عربي)' })}</Label>
            <Textarea
              value={formData.root_cause_ar || ''}
              onChange={(e) => updateField('root_cause_ar', e.target.value)}
              rows={3}
              dir="rtl"
            />
          </div>
        </div>

        {/* Affected Population */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <Label className="font-semibold">{t({ en: 'Affected Population', ar: 'السكان المتأثرون' })}</Label>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">{t({ en: 'Size', ar: 'العدد' })}</Label>
              <Input
                type="number"
                value={formData.affected_population?.size || ''}
                onChange={(e) => updateField('affected_population', { 
                  ...formData.affected_population, 
                  size: parseInt(e.target.value) || null 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t({ en: 'Demographics', ar: 'التركيبة السكانية' })}</Label>
              <Input
                value={formData.affected_population?.demographics || ''}
                onChange={(e) => updateField('affected_population', { 
                  ...formData.affected_population, 
                  demographics: e.target.value 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t({ en: 'Location', ar: 'الموقع' })}</Label>
              <Input
                value={formData.affected_population?.location || ''}
                onChange={(e) => updateField('affected_population', { 
                  ...formData.affected_population, 
                  location: e.target.value 
                })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
