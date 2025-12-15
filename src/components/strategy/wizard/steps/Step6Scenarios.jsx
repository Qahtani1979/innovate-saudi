import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Minus, Plus, X } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { cn } from '@/lib/utils';

const SCENARIO_TYPES = [
  { 
    key: 'best_case', 
    icon: TrendingUp,
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 text-green-800',
    title: { en: 'Best Case Scenario', ar: 'أفضل سيناريو' },
    description: { en: 'Optimistic outcome with favorable conditions', ar: 'نتيجة متفائلة مع ظروف مواتية' }
  },
  { 
    key: 'most_likely', 
    icon: Minus,
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 text-blue-800',
    title: { en: 'Most Likely Scenario', ar: 'السيناريو الأكثر احتمالاً' },
    description: { en: 'Realistic outcome based on current trends', ar: 'نتيجة واقعية بناءً على الاتجاهات الحالية' }
  },
  { 
    key: 'worst_case', 
    icon: TrendingDown,
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300 text-red-800',
    title: { en: 'Worst Case Scenario', ar: 'أسوأ سيناريو' },
    description: { en: 'Pessimistic outcome with challenging conditions', ar: 'نتيجة متشائمة مع ظروف صعبة' }
  }
];

export default function Step6Scenarios({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  const updateScenario = (scenarioKey, field, value) => {
    onChange({
      scenarios: {
        ...data.scenarios,
        [scenarioKey]: {
          ...(data.scenarios?.[scenarioKey] || {}),
          [field]: value
        }
      }
    });
  };

  const addAssumption = (scenarioKey) => {
    const currentAssumptions = data.scenarios?.[scenarioKey]?.assumptions || [];
    updateScenario(scenarioKey, 'assumptions', [...currentAssumptions, { id: Date.now().toString(), text_en: '', text_ar: '' }]);
  };

  const updateAssumption = (scenarioKey, index, field, value) => {
    const currentAssumptions = [...(data.scenarios?.[scenarioKey]?.assumptions || [])];
    // Handle legacy string format
    if (typeof currentAssumptions[index] === 'string') {
      currentAssumptions[index] = { id: Date.now().toString(), text_en: currentAssumptions[index], text_ar: '', [field]: value };
    } else {
      currentAssumptions[index] = { ...currentAssumptions[index], [field]: value };
    }
    updateScenario(scenarioKey, 'assumptions', currentAssumptions);
  };

  const removeAssumption = (scenarioKey, index) => {
    const currentAssumptions = data.scenarios?.[scenarioKey]?.assumptions || [];
    updateScenario(scenarioKey, 'assumptions', currentAssumptions.filter((_, i) => i !== index));
  };

  const addOutcome = (scenarioKey) => {
    const currentOutcomes = data.scenarios?.[scenarioKey]?.outcomes || [];
    updateScenario(scenarioKey, 'outcomes', [...currentOutcomes, { id: Date.now().toString(), metric_en: '', metric_ar: '', value: '' }]);
  };

  const updateOutcome = (scenarioKey, index, field, value) => {
    const currentOutcomes = [...(data.scenarios?.[scenarioKey]?.outcomes || [])];
    currentOutcomes[index] = { ...currentOutcomes[index], [field]: value };
    updateScenario(scenarioKey, 'outcomes', currentOutcomes);
  };

  const removeOutcome = (scenarioKey, index) => {
    const currentOutcomes = data.scenarios?.[scenarioKey]?.outcomes || [];
    updateScenario(scenarioKey, 'outcomes', currentOutcomes.filter((_, i) => i !== index));
  };

  // Helper to get assumption text (handles legacy string format)
  const getAssumptionText = (assumption, lang) => {
    if (typeof assumption === 'string') return assumption;
    return lang === 'ar' ? (assumption.text_ar || assumption.text_en) : (assumption.text_en || assumption.text_ar || assumption.text || '');
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {t({ 
              en: 'Define three scenarios to prepare for different futures and build strategic resilience.',
              ar: 'حدد ثلاثة سيناريوهات للاستعداد لمستقبل مختلف وبناء المرونة الاستراتيجية.'
            })}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={onGenerateAI} 
          disabled={isGenerating}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating 
            ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' })
            : t({ en: 'Generate Scenarios', ar: 'إنشاء السيناريوهات' })
          }
        </Button>
      </div>

      {/* Scenario Cards */}
      <div className="grid gap-6">
        {SCENARIO_TYPES.map((scenario) => {
          const ScenarioIcon = scenario.icon;
          const scenarioData = data.scenarios?.[scenario.key] || { description_en: '', description_ar: '', assumptions: [], outcomes: [] };
          
          return (
            <Card key={scenario.key} className={cn("border-2", scenario.color)}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ScenarioIcon className="w-6 h-6" />
                  <div>
                    <CardTitle className="text-lg">{scenario.title[language]}</CardTitle>
                    <CardDescription>{scenario.description[language]}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Description - Bilingual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">
                      {t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
                    </Label>
                    <Textarea
                      value={scenarioData.description_en || scenarioData.description || ''}
                      onChange={(e) => updateScenario(scenario.key, 'description_en', e.target.value)}
                      placeholder={t({ 
                        en: 'Describe what this scenario looks like in detail...',
                        ar: 'وصف كيف يبدو هذا السيناريو بالتفصيل...'
                      })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-medium">
                      {t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}
                    </Label>
                    <Textarea
                      value={scenarioData.description_ar || ''}
                      onChange={(e) => updateScenario(scenario.key, 'description_ar', e.target.value)}
                      placeholder={t({ en: 'Arabic description...', ar: 'الوصف بالعربية...' })}
                      rows={3}
                      className="mt-1"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Key Assumptions - Bilingual */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">
                      {t({ en: 'Key Assumptions', ar: 'الافتراضات الرئيسية' })}
                    </Label>
                    <Button variant="ghost" size="sm" onClick={() => addAssumption(scenario.key)}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t({ en: 'Add', ar: 'إضافة' })}
                    </Button>
                  </div>
                  
                  {(scenarioData.assumptions || []).length === 0 ? (
                    <div className="text-center py-3 text-sm text-muted-foreground border border-dashed rounded">
                      {t({ en: 'No assumptions added', ar: 'لم تتم إضافة افتراضات' })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scenarioData.assumptions.map((assumption, idx) => (
                        <div key={assumption.id || idx} className="flex items-start gap-2 p-2 bg-background rounded border">
                          <Badge variant="outline" className="shrink-0 mt-1">{idx + 1}</Badge>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              value={typeof assumption === 'string' ? assumption : (assumption.text_en || '')}
                              onChange={(e) => updateAssumption(scenario.key, idx, 'text_en', e.target.value)}
                              placeholder={t({ en: 'English...', ar: 'إنجليزي...' })}
                            />
                            <Input
                              value={typeof assumption === 'string' ? '' : (assumption.text_ar || '')}
                              onChange={(e) => updateAssumption(scenario.key, idx, 'text_ar', e.target.value)}
                              placeholder={t({ en: 'Arabic...', ar: 'عربي...' })}
                              dir="rtl"
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeAssumption(scenario.key, idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expected Outcomes - Bilingual */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">
                      {t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}
                    </Label>
                    <Button variant="ghost" size="sm" onClick={() => addOutcome(scenario.key)}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t({ en: 'Add', ar: 'إضافة' })}
                    </Button>
                  </div>
                  
                  {(scenarioData.outcomes || []).length === 0 ? (
                    <div className="text-center py-3 text-sm text-muted-foreground border border-dashed rounded">
                      {t({ en: 'No outcomes defined', ar: 'لم يتم تحديد نتائج' })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scenarioData.outcomes.map((outcome, idx) => (
                        <div key={outcome.id || idx} className="flex items-center gap-2 p-2 bg-background rounded border">
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Input
                              value={outcome.metric_en || outcome.metric || ''}
                              onChange={(e) => updateOutcome(scenario.key, idx, 'metric_en', e.target.value)}
                              placeholder={t({ en: 'Metric (EN)', ar: 'المؤشر (إنجليزي)' })}
                            />
                            <Input
                              value={outcome.metric_ar || ''}
                              onChange={(e) => updateOutcome(scenario.key, idx, 'metric_ar', e.target.value)}
                              placeholder={t({ en: 'Metric (AR)', ar: 'المؤشر (عربي)' })}
                              dir="rtl"
                            />
                            <Input
                              value={outcome.value || ''}
                              onChange={(e) => updateOutcome(scenario.key, idx, 'value', e.target.value)}
                              placeholder={t({ en: 'Value', ar: 'القيمة' })}
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeOutcome(scenario.key, idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Probability */}
                <div className="flex items-center gap-4">
                  <Label className="shrink-0">{t({ en: 'Probability', ar: 'الاحتمالية' })}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={scenarioData.probability ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const next = raw === '' ? '' : Math.max(0, Math.min(100, Number(raw)));
                      updateScenario(scenario.key, 'probability', next);
                    }}
                    placeholder="0-100"
                    className="w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scenario Comparison Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t({ en: 'Scenario Comparison Summary', ar: 'ملخص مقارنة السيناريوهات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">{t({ en: 'Aspect', ar: 'الجانب' })}</th>
                  {SCENARIO_TYPES.map(s => (
                    <th key={s.key} className="text-left py-2 px-3">{s.title[language]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">{t({ en: 'Assumptions', ar: 'الافتراضات' })}</td>
                  {SCENARIO_TYPES.map(s => (
                    <td key={s.key} className="py-2 px-3">
                      <Badge variant="secondary">
                        {data.scenarios?.[s.key]?.assumptions?.length || 0}
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">{t({ en: 'Outcomes', ar: 'النتائج' })}</td>
                  {SCENARIO_TYPES.map(s => (
                    <td key={s.key} className="py-2 px-3">
                      <Badge variant="secondary">
                        {data.scenarios?.[s.key]?.outcomes?.length || 0}
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">{t({ en: 'Probability', ar: 'الاحتمالية' })}</td>
                  {SCENARIO_TYPES.map(s => {
                    const p = data.scenarios?.[s.key]?.probability;
                    const hasP = p !== undefined && p !== null && p !== '';
                    return (
                      <td key={s.key} className="py-2 px-3">
                        {hasP ? `${p}%` : '-'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
