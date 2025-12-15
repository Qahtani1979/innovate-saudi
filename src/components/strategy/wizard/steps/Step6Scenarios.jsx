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
    updateScenario(scenarioKey, 'assumptions', [...currentAssumptions, '']);
  };

  const updateAssumption = (scenarioKey, index, value) => {
    const currentAssumptions = [...(data.scenarios?.[scenarioKey]?.assumptions || [])];
    currentAssumptions[index] = value;
    updateScenario(scenarioKey, 'assumptions', currentAssumptions);
  };

  const removeAssumption = (scenarioKey, index) => {
    const currentAssumptions = data.scenarios?.[scenarioKey]?.assumptions || [];
    updateScenario(scenarioKey, 'assumptions', currentAssumptions.filter((_, i) => i !== index));
  };

  const addOutcome = (scenarioKey) => {
    const currentOutcomes = data.scenarios?.[scenarioKey]?.outcomes || [];
    updateScenario(scenarioKey, 'outcomes', [...currentOutcomes, { metric: '', value: '' }]);
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
          const scenarioData = data.scenarios?.[scenario.key] || { description: '', assumptions: [], outcomes: [] };
          
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
                {/* Description */}
                <div>
                  <Label className="font-medium">
                    {t({ en: 'Scenario Description', ar: 'وصف السيناريو' })}
                  </Label>
                  <Textarea
                    value={scenarioData.description}
                    onChange={(e) => updateScenario(scenario.key, 'description', e.target.value)}
                    placeholder={t({ 
                      en: 'Describe what this scenario looks like in detail...',
                      ar: 'وصف كيف يبدو هذا السيناريو بالتفصيل...'
                    })}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Key Assumptions */}
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
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                          <Input
                            value={assumption}
                            onChange={(e) => updateAssumption(scenario.key, idx, e.target.value)}
                            placeholder={t({ en: 'Enter assumption...', ar: 'أدخل الافتراض...' })}
                            className="flex-1"
                          />
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

                {/* Expected Outcomes */}
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
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            value={outcome.metric}
                            onChange={(e) => updateOutcome(scenario.key, idx, 'metric', e.target.value)}
                            placeholder={t({ en: 'Metric (e.g., Budget utilization)', ar: 'المؤشر (مثال: استخدام الميزانية)' })}
                            className="flex-1"
                          />
                          <Input
                            value={outcome.value}
                            onChange={(e) => updateOutcome(scenario.key, idx, 'value', e.target.value)}
                            placeholder={t({ en: 'Expected value', ar: 'القيمة المتوقعة' })}
                            className="w-32"
                          />
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

                {/* Probability (optional) */}
                <div className="flex items-center gap-4">
                  <Label className="shrink-0">{t({ en: 'Probability', ar: 'الاحتمالية' })}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={scenarioData.probability || ''}
                    onChange={(e) => updateScenario(scenario.key, 'probability', e.target.value)}
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
                  {SCENARIO_TYPES.map(s => (
                    <td key={s.key} className="py-2 px-3">
                      {data.scenarios?.[s.key]?.probability ? `${data.scenarios[s.key].probability}%` : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
