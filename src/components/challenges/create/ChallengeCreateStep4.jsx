import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';
import { Target, Plus, Trash2 } from 'lucide-react';

/**
 * Step 4: KPIs and Metrics for Challenge Creation
 */
export default function ChallengeCreateStep4({ 
  formData, 
  updateField
}) {
  const { t } = useLanguage();

  const addKPI = () => {
    updateField('kpis', [...(formData.kpis || []), { name_en: '', name_ar: '', baseline: '', target: '', unit: '' }]);
  };

  const updateKPI = (index, field, value) => {
    const updated = [...(formData.kpis || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('kpis', updated);
  };

  const removeKPI = (index) => {
    updateField('kpis', (formData.kpis || []).filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          {t({ en: 'KPIs & Metrics', ar: 'مؤشرات الأداء' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scores */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t({ en: 'Severity Score', ar: 'درجة الخطورة' })}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={formData.severity_score || 50}
              onChange={(e) => updateField('severity_score', parseInt(e.target.value) || 50)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Impact Score', ar: 'درجة التأثير' })}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={formData.impact_score || 50}
              onChange={(e) => updateField('impact_score', parseInt(e.target.value) || 50)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Overall Score', ar: 'الدرجة الإجمالية' })}</Label>
            <Input
              type="number"
              disabled
              value={Math.round(((formData.severity_score || 50) + (formData.impact_score || 50)) / 2)}
              className="bg-muted"
            />
          </div>
        </div>

        {/* Budget & Timeline */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t({ en: 'Budget Estimate (SAR)', ar: 'تقدير الميزانية (ريال)' })}</Label>
            <Input
              type="number"
              value={formData.budget_estimate || ''}
              onChange={(e) => updateField('budget_estimate', parseInt(e.target.value) || null)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>{t({ en: 'Timeline Estimate', ar: 'المدة المتوقعة' })}</Label>
            <Select
              value={formData.timeline_estimate || ''}
              onValueChange={(value) => updateField('timeline_estimate', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select timeline', ar: 'اختر المدة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3 months">{t({ en: '1-3 months', ar: '1-3 أشهر' })}</SelectItem>
                <SelectItem value="3-6 months">{t({ en: '3-6 months', ar: '3-6 أشهر' })}</SelectItem>
                <SelectItem value="6-12 months">{t({ en: '6-12 months', ar: '6-12 شهر' })}</SelectItem>
                <SelectItem value="1-2 years">{t({ en: '1-2 years', ar: '1-2 سنة' })}</SelectItem>
                <SelectItem value="2+ years">{t({ en: '2+ years', ar: 'أكثر من سنتين' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>{t({ en: 'Priority Tier', ar: 'مستوى الأولوية' })}</Label>
          <Select
            value={formData.priority || 'tier_3'}
            onValueChange={(value) => updateField('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tier_1">
                🔴 {t({ en: 'Tier 1 - Critical', ar: 'المستوى 1 - حرج' })}
              </SelectItem>
              <SelectItem value="tier_2">
                🟠 {t({ en: 'Tier 2 - High', ar: 'المستوى 2 - عالي' })}
              </SelectItem>
              <SelectItem value="tier_3">
                🟡 {t({ en: 'Tier 3 - Medium', ar: 'المستوى 3 - متوسط' })}
              </SelectItem>
              <SelectItem value="tier_4">
                🟢 {t({ en: 'Tier 4 - Low', ar: 'المستوى 4 - منخفض' })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">{t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })}</Label>
            <Button size="sm" variant="outline" onClick={addKPI}>
              <Plus className="h-4 w-4 mr-1" />
              {t({ en: 'Add KPI', ar: 'إضافة مؤشر' })}
            </Button>
          </div>
          
          <div className="space-y-3">
            {(formData.kpis || []).map((kpi, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{t({ en: 'KPI', ar: 'مؤشر' })} #{index + 1}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => removeKPI(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    placeholder={t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}
                    value={kpi.name_en || ''}
                    onChange={(e) => updateKPI(index, 'name_en', e.target.value)}
                  />
                  <Input
                    placeholder={t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}
                    value={kpi.name_ar || ''}
                    onChange={(e) => updateKPI(index, 'name_ar', e.target.value)}
                    dir="rtl"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <Input
                    placeholder={t({ en: 'Baseline', ar: 'القيمة الحالية' })}
                    value={kpi.baseline || ''}
                    onChange={(e) => updateKPI(index, 'baseline', e.target.value)}
                  />
                  <Input
                    placeholder={t({ en: 'Target', ar: 'الهدف' })}
                    value={kpi.target || ''}
                    onChange={(e) => updateKPI(index, 'target', e.target.value)}
                  />
                  <Input
                    placeholder={t({ en: 'Unit', ar: 'الوحدة' })}
                    value={kpi.unit || ''}
                    onChange={(e) => updateKPI(index, 'unit', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
