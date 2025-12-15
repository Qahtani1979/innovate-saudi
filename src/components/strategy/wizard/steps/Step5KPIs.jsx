import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Plus, X, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '../../../LanguageContext';

export default function Step5KPIs({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating 
}) {
  const { language, t, isRTL } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  const objectives = data.objectives || [];
  const kpis = data.kpis || [];

  const addKPI = (objectiveIndex = null) => {
    onChange({
      kpis: [...kpis, {
        name_en: '',
        name_ar: '',
        objective_index: objectiveIndex,
        unit: '',
        baseline_value: '',
        target_value: '',
        target_year: data.end_year,
        frequency: 'quarterly',
        data_source: '',
        owner: ''
      }]
    });
    setExpandedIndex(kpis.length);
  };

  const updateKPI = (index, updates) => {
    const updated = kpis.map((kpi, i) => 
      i === index ? { ...kpi, ...updates } : kpi
    );
    onChange({ kpis: updated });
  };

  const removeKPI = (index) => {
    onChange({ kpis: kpis.filter((_, i) => i !== index) });
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const getKPIsForObjective = (objectiveIndex) => {
    return kpis.filter(k => k.objective_index === objectiveIndex);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{t({ en: 'AI-Powered KPI Generation', ar: 'إنشاء مؤشرات الأداء بالذكاء الاصطناعي' })}</h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Generate SMART KPIs for each objective with baselines and targets', ar: 'إنشاء مؤشرات أداء ذكية لكل هدف مع خطوط الأساس والأهداف' })}
              </p>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating || objectives.length === 0}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate KPIs', ar: 'إنشاء المؤشرات' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {objectives.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t({ en: 'Please define objectives first (Step 3) before creating KPIs.', ar: 'يرجى تحديد الأهداف أولاً (الخطوة 3) قبل إنشاء المؤشرات.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPIs by Objective */}
          {objectives.map((obj, objIndex) => {
            const objKPIs = getKPIsForObjective(objIndex);
            return (
              <Card key={objIndex}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline">#{objIndex + 1}</Badge>
                      <span className="line-clamp-1">{language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}</span>
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={() => addKPI(objIndex)}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t({ en: 'Add KPI', ar: 'إضافة مؤشر' })}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {objKPIs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t({ en: 'No KPIs defined for this objective', ar: 'لا توجد مؤشرات محددة لهذا الهدف' })}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {objKPIs.map((kpi) => {
                        const kpiIndex = kpis.indexOf(kpi);
                        return (
                          <Collapsible key={kpiIndex} open={expandedIndex === kpiIndex}>
                            <div className="border rounded-lg">
                              <CollapsibleTrigger asChild>
                                <div 
                                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                  onClick={() => setExpandedIndex(expandedIndex === kpiIndex ? null : kpiIndex)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-sm">
                                      {kpi.name_en || t({ en: 'New KPI', ar: 'مؤشر جديد' })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {kpi.target_value && (
                                      <Badge variant="secondary" className="text-xs">
                                        {kpi.baseline_value} → {kpi.target_value} {kpi.unit}
                                      </Badge>
                                    )}
                                    {expandedIndex === kpiIndex ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                <div className="p-3 pt-0 space-y-4 border-t">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'KPI Name (EN)', ar: 'اسم المؤشر (إنجليزي)' })}</Label>
                                      <Input
                                        value={kpi.name_en}
                                        onChange={(e) => updateKPI(kpiIndex, { name_en: e.target.value })}
                                        placeholder={t({ en: 'e.g., Service Response Time', ar: 'مثال: زمن الاستجابة للخدمة' })}
                                        dir="ltr"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'KPI Name (AR)', ar: 'اسم المؤشر (عربي)' })}</Label>
                                      <Input
                                        value={kpi.name_ar}
                                        onChange={(e) => updateKPI(kpiIndex, { name_ar: e.target.value })}
                                        dir="rtl"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Baseline', ar: 'خط الأساس' })}</Label>
                                      <Input
                                        value={kpi.baseline_value}
                                        onChange={(e) => updateKPI(kpiIndex, { baseline_value: e.target.value })}
                                        placeholder="0"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Target', ar: 'المستهدف' })}</Label>
                                      <Input
                                        value={kpi.target_value}
                                        onChange={(e) => updateKPI(kpiIndex, { target_value: e.target.value })}
                                        placeholder="100"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Unit', ar: 'الوحدة' })}</Label>
                                      <Input
                                        value={kpi.unit}
                                        onChange={(e) => updateKPI(kpiIndex, { unit: e.target.value })}
                                        placeholder="%"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Frequency', ar: 'التكرار' })}</Label>
                                      <Select value={kpi.frequency} onValueChange={(v) => updateKPI(kpiIndex, { frequency: v })}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="monthly">{t({ en: 'Monthly', ar: 'شهري' })}</SelectItem>
                                          <SelectItem value="quarterly">{t({ en: 'Quarterly', ar: 'ربع سنوي' })}</SelectItem>
                                          <SelectItem value="annual">{t({ en: 'Annual', ar: 'سنوي' })}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Data Source', ar: 'مصدر البيانات' })}</Label>
                                      <Input
                                        value={kpi.data_source}
                                        onChange={(e) => updateKPI(kpiIndex, { data_source: e.target.value })}
                                        placeholder={t({ en: 'e.g., Baladi Platform', ar: 'مثال: منصة بلدي' })}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Owner', ar: 'المسؤول' })}</Label>
                                      <Input
                                        value={kpi.owner}
                                        onChange={(e) => updateKPI(kpiIndex, { owner: e.target.value })}
                                        placeholder={t({ en: 'e.g., IT Department', ar: 'مثال: إدارة تقنية المعلومات' })}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end">
                                    <Button size="sm" variant="destructive" onClick={() => removeKPI(kpiIndex)}>
                                      <X className="h-4 w-4 mr-1" />
                                      {t({ en: 'Remove', ar: 'حذف' })}
                                    </Button>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t({ en: 'KPI Summary', ar: 'ملخص المؤشرات' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{kpis.length}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Total KPIs', ar: 'إجمالي المؤشرات' })}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {objectives.filter((_, i) => getKPIsForObjective(i).length > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Objectives with KPIs', ar: 'أهداف بمؤشرات' })}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {objectives.filter((_, i) => getKPIsForObjective(i).length === 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Without KPIs', ar: 'بدون مؤشرات' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
