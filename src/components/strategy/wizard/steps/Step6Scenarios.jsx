import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Sparkles, TrendingUp, TrendingDown, Minus, Plus, X, 
  ChevronDown, ChevronUp, CheckCircle2, ListChecks, BarChart3, 
  GitBranch, Target, Lightbulb, Scale, Percent, Loader2, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { cn } from '@/lib/utils';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

const SCENARIO_TYPES = [
  { 
    key: 'best_case', 
    icon: TrendingUp,
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300',
    textColor: 'text-green-700 dark:text-green-400',
    badgeColor: 'bg-green-500',
    title: { en: 'Best Case', ar: 'أفضل سيناريو' },
    description: { en: 'Optimistic outcome with favorable conditions', ar: 'نتيجة متفائلة مع ظروف مواتية' }
  },
  { 
    key: 'most_likely', 
    icon: Minus,
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
    textColor: 'text-blue-700 dark:text-blue-400',
    badgeColor: 'bg-blue-500',
    title: { en: 'Most Likely', ar: 'الأكثر احتمالاً' },
    description: { en: 'Realistic outcome based on current trends', ar: 'نتيجة واقعية بناءً على الاتجاهات الحالية' }
  },
  { 
    key: 'worst_case', 
    icon: TrendingDown,
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300',
    textColor: 'text-red-700 dark:text-red-400',
    badgeColor: 'bg-red-500',
    title: { en: 'Worst Case', ar: 'أسوأ سيناريو' },
    description: { en: 'Pessimistic outcome with challenging conditions', ar: 'نتيجة متشائمة مع ظروف صعبة' }
  }
];

export default function Step6Scenarios({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  isReadOnly = false 
}) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('scenarios');
  const [expandedScenarios, setExpandedScenarios] = useState(
    SCENARIO_TYPES.reduce((acc, s) => ({ ...acc, [s.key]: true }), {})
  );

  // Calculate statistics
  const stats = useMemo(() => {
    let totalAssumptions = 0;
    let totalOutcomes = 0;
    let scenariosWithDescription = 0;
    let scenariosWithProbability = 0;

    SCENARIO_TYPES.forEach(s => {
      const scenarioData = data.scenarios?.[s.key] || {};
      if (scenarioData.description_en || scenarioData.description_ar || scenarioData.description) {
        scenariosWithDescription++;
      }
      if (scenarioData.probability !== undefined && scenarioData.probability !== null && scenarioData.probability !== '') {
        scenariosWithProbability++;
      }
      totalAssumptions += scenarioData.assumptions?.length || 0;
      totalOutcomes += scenarioData.outcomes?.length || 0;
    });

    return {
      totalAssumptions,
      totalOutcomes,
      scenariosWithDescription,
      scenariosWithProbability
    };
  }, [data.scenarios]);

  // Calculate completeness score
  const completenessScore = useMemo(() => {
    let score = 0;
    const maxScore = 100;
    
    // 40% for descriptions (all 3 scenarios)
    score += (stats.scenariosWithDescription / 3) * 40;
    
    // 30% for assumptions (at least 1 per scenario = 3 total)
    const assumptionScore = Math.min(stats.totalAssumptions / 3, 1) * 30;
    score += assumptionScore;
    
    // 20% for outcomes
    const outcomeScore = Math.min(stats.totalOutcomes / 3, 1) * 20;
    score += outcomeScore;
    
    // 10% for probabilities
    score += (stats.scenariosWithProbability / 3) * 10;
    
    return Math.round(Math.min(score, maxScore));
  }, [stats]);

  const toggleScenario = (key) => {
    setExpandedScenarios(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateScenario = (scenarioKey, field, value) => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
    const currentAssumptions = data.scenarios?.[scenarioKey]?.assumptions || [];
    updateScenario(scenarioKey, 'assumptions', [...currentAssumptions, { id: Date.now().toString(), text_en: '', text_ar: '' }]);
  };

  const updateAssumption = (scenarioKey, index, field, value) => {
    if (isReadOnly) return;
    const currentAssumptions = [...(data.scenarios?.[scenarioKey]?.assumptions || [])];
    if (typeof currentAssumptions[index] === 'string') {
      currentAssumptions[index] = { id: Date.now().toString(), text_en: currentAssumptions[index], text_ar: '', [field]: value };
    } else {
      currentAssumptions[index] = { ...currentAssumptions[index], [field]: value };
    }
    updateScenario(scenarioKey, 'assumptions', currentAssumptions);
  };

  const removeAssumption = (scenarioKey, index) => {
    if (isReadOnly) return;
    const currentAssumptions = data.scenarios?.[scenarioKey]?.assumptions || [];
    updateScenario(scenarioKey, 'assumptions', currentAssumptions.filter((_, i) => i !== index));
  };

  const addOutcome = (scenarioKey) => {
    if (isReadOnly) return;
    const currentOutcomes = data.scenarios?.[scenarioKey]?.outcomes || [];
    updateScenario(scenarioKey, 'outcomes', [...currentOutcomes, { id: Date.now().toString(), metric_en: '', metric_ar: '', value: '' }]);
  };

  const updateOutcome = (scenarioKey, index, field, value) => {
    if (isReadOnly) return;
    const currentOutcomes = [...(data.scenarios?.[scenarioKey]?.outcomes || [])];
    currentOutcomes[index] = { ...currentOutcomes[index], [field]: value };
    updateScenario(scenarioKey, 'outcomes', currentOutcomes);
  };

  const removeOutcome = (scenarioKey, index) => {
    if (isReadOnly) return;
    const currentOutcomes = data.scenarios?.[scenarioKey]?.outcomes || [];
    updateScenario(scenarioKey, 'outcomes', currentOutcomes.filter((_, i) => i !== index));
  };

  const isScenarioComplete = (scenarioKey) => {
    const scenarioData = data.scenarios?.[scenarioKey] || {};
    return !!(scenarioData.description_en || scenarioData.description_ar) && 
           (scenarioData.assumptions?.length > 0) &&
           (scenarioData.outcomes?.length > 0);
  };

  // Circular Progress Component
  const CircularProgress = ({ value, size = 120 }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
          <span className="text-xs text-muted-foreground">{t({ en: 'Complete', ar: 'مكتمل' })}</span>
        </div>
      </div>
    );
  };

  // Scenario Card Component
  const ScenarioCard = ({ scenario }) => {
    const ScenarioIcon = scenario.icon;
    const scenarioData = data.scenarios?.[scenario.key] || { description_en: '', description_ar: '', assumptions: [], outcomes: [] };
    const isExpanded = expandedScenarios[scenario.key];
    const isComplete = isScenarioComplete(scenario.key);
    
    const itemCount = (scenarioData.assumptions?.length || 0) + (scenarioData.outcomes?.length || 0);
    const hasDescription = !!(scenarioData.description_en || scenarioData.description_ar || scenarioData.description);
    const progress = hasDescription ? 50 : 0 + (itemCount > 0 ? 50 : 0);

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleScenario(scenario.key)}>
        <Card className={cn("border-2 transition-all", scenario.color)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", scenario.color)}>
                    <ScenarioIcon className={cn("w-5 h-5", scenario.textColor)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className={cn("text-lg", scenario.textColor)}>
                        {scenario.title[language]}
                      </CardTitle>
                      {isComplete && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <CardDescription className="text-xs">{scenario.description[language]}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{scenarioData.assumptions?.length || 0} {t({ en: 'assumptions', ar: 'افتراضات' })}</Badge>
                      <Badge variant="secondary">{scenarioData.outcomes?.length || 0} {t({ en: 'outcomes', ar: 'نتائج' })}</Badge>
                    </div>
                    {scenarioData.probability !== undefined && scenarioData.probability !== '' && (
                      <span className="text-xs text-muted-foreground">{scenarioData.probability}% {t({ en: 'probability', ar: 'احتمالية' })}</span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium text-sm">
                    {t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
                  </Label>
                  <Textarea
                    value={scenarioData.description_en || scenarioData.description || ''}
                    onChange={(e) => updateScenario(scenario.key, 'description_en', e.target.value)}
                    placeholder={t({ en: 'Describe what this scenario looks like...', ar: 'صف كيف يبدو هذا السيناريو...' })}
                    rows={3}
                    className={cn("mt-1", (scenarioData.description_en || scenarioData.description) && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <Label className="font-medium text-sm">
                    {t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}
                  </Label>
                  <Textarea
                    value={scenarioData.description_ar || ''}
                    onChange={(e) => updateScenario(scenario.key, 'description_ar', e.target.value)}
                    placeholder={t({ en: 'Arabic description...', ar: 'الوصف بالعربية...' })}
                    rows={3}
                    className={cn("mt-1", scenarioData.description_ar && "border-green-300")}
                    dir="rtl"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {/* Probability Slider */}
              <div className="p-4 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-medium flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    {t({ en: 'Probability', ar: 'الاحتمالية' })}
                  </Label>
                  <span className="text-lg font-bold">{scenarioData.probability || 0}%</span>
                </div>
                <Slider
                  value={[scenarioData.probability || 0]}
                  onValueChange={(v) => updateScenario(scenario.key, 'probability', v[0])}
                  max={100}
                  step={5}
                  disabled={isReadOnly}
                  className="w-full"
                />
              </div>

              {/* Key Assumptions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    {t({ en: 'Key Assumptions', ar: 'الافتراضات الرئيسية' })}
                  </Label>
                  {!isReadOnly && (
                    <Button variant="ghost" size="sm" onClick={() => addAssumption(scenario.key)}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t({ en: 'Add', ar: 'إضافة' })}
                    </Button>
                  )}
                </div>
                
                {(scenarioData.assumptions || []).length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                    <Lightbulb className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    {t({ en: 'No assumptions added yet', ar: 'لم تتم إضافة افتراضات بعد' })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scenarioData.assumptions.map((assumption, idx) => (
                      <div 
                        key={assumption.id || idx} 
                        className={cn(
                          "flex items-start gap-2 p-3 bg-background rounded-lg border transition-all",
                          (assumption.text_en || assumption.text_ar) && "border-green-300"
                        )}
                      >
                        <Badge variant="outline" className="shrink-0 mt-1">{idx + 1}</Badge>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input
                            value={typeof assumption === 'string' ? assumption : (assumption.text_en || '')}
                            onChange={(e) => updateAssumption(scenario.key, idx, 'text_en', e.target.value)}
                            placeholder={t({ en: 'English...', ar: 'إنجليزي...' })}
                            disabled={isReadOnly}
                          />
                          <Input
                            value={typeof assumption === 'string' ? '' : (assumption.text_ar || '')}
                            onChange={(e) => updateAssumption(scenario.key, idx, 'text_ar', e.target.value)}
                            placeholder={t({ en: 'Arabic...', ar: 'عربي...' })}
                            dir="rtl"
                            disabled={isReadOnly}
                          />
                        </div>
                        {!isReadOnly && (
                          <Button variant="ghost" size="icon" onClick={() => removeAssumption(scenario.key, idx)} className="text-destructive">
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expected Outcomes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}
                  </Label>
                  {!isReadOnly && (
                    <Button variant="ghost" size="sm" onClick={() => addOutcome(scenario.key)}>
                      <Plus className="w-4 h-4 mr-1" />
                      {t({ en: 'Add', ar: 'إضافة' })}
                    </Button>
                  )}
                </div>
                
                {(scenarioData.outcomes || []).length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                    <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    {t({ en: 'No outcomes defined yet', ar: 'لم يتم تحديد نتائج بعد' })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scenarioData.outcomes.map((outcome, idx) => (
                      <div 
                        key={outcome.id || idx} 
                        className={cn(
                          "flex items-center gap-2 p-3 bg-background rounded-lg border transition-all",
                          (outcome.metric_en || outcome.metric_ar) && "border-green-300"
                        )}
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            value={outcome.metric_en || outcome.metric || ''}
                            onChange={(e) => updateOutcome(scenario.key, idx, 'metric_en', e.target.value)}
                            placeholder={t({ en: 'Metric (EN)', ar: 'المؤشر (إنجليزي)' })}
                            disabled={isReadOnly}
                          />
                          <Input
                            value={outcome.metric_ar || ''}
                            onChange={(e) => updateOutcome(scenario.key, idx, 'metric_ar', e.target.value)}
                            placeholder={t({ en: 'Metric (AR)', ar: 'المؤشر (عربي)' })}
                            dir="rtl"
                            disabled={isReadOnly}
                          />
                          <Input
                            value={outcome.value || ''}
                            onChange={(e) => updateOutcome(scenario.key, idx, 'value', e.target.value)}
                            placeholder={t({ en: 'Expected Value', ar: 'القيمة المتوقعة' })}
                            disabled={isReadOnly}
                          />
                        </div>
                        {!isReadOnly && (
                          <Button variant="ghost" size="icon" onClick={() => removeOutcome(scenario.key, idx)} className="text-destructive">
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <StepDashboardHeader
        score={completenessScore}
        title={t({ en: 'Scenario Planning', ar: 'تخطيط السيناريوهات' })}
        subtitle={t({ en: 'Best, Most Likely, and Worst Case', ar: 'أفضل وأكثر احتمالاً وأسوأ حالة' })}
        language={language}
        stats={[
          { icon: GitBranch, value: `${stats.scenariosWithDescription}/3`, label: t({ en: 'Scenarios Defined', ar: 'سيناريوهات محددة' }), iconColor: 'text-primary' },
          { icon: Lightbulb, value: stats.totalAssumptions, label: t({ en: 'Total Assumptions', ar: 'إجمالي الافتراضات' }), iconColor: 'text-blue-500' },
          { icon: Target, value: stats.totalOutcomes, label: t({ en: 'Total Outcomes', ar: 'إجمالي النتائج' }), iconColor: 'text-purple-500' },
          { icon: Percent, value: `${stats.scenariosWithProbability}/3`, label: t({ en: 'Probabilities Set', ar: 'احتماليات محددة' }), iconColor: 'text-green-500' },
        ]}
      />
      
      {/* AI Generate Button */}
      {!isReadOnly && (
        <div className="flex justify-end">
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
      )}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="scenarios" className="gap-2">
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Scenarios', ar: 'السيناريوهات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Compare', ar: 'المقارنة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="probability" className="gap-2">
            <Percent className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Probability', ar: 'الاحتمالية' })}</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
          </TabsTrigger>
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          {SCENARIO_TYPES.map(scenario => (
            <ScenarioCard key={scenario.key} scenario={scenario} />
          ))}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                {t({ en: 'Scenario Comparison Matrix', ar: 'مصفوفة مقارنة السيناريوهات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{t({ en: 'Aspect', ar: 'الجانب' })}</th>
                      {SCENARIO_TYPES.map(s => (
                        <th key={s.key} className={cn("text-left py-3 px-4", s.textColor)}>
                          <div className="flex items-center gap-2">
                            <s.icon className="w-4 h-4" />
                            {s.title[language]}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">{t({ en: 'Description', ar: 'الوصف' })}</td>
                      {SCENARIO_TYPES.map(s => {
                        const d = data.scenarios?.[s.key];
                        const hasDesc = d?.description_en || d?.description_ar || d?.description;
                        return (
                          <td key={s.key} className="py-3 px-4">
                            {hasDesc ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">{t({ en: 'Assumptions', ar: 'الافتراضات' })}</td>
                      {SCENARIO_TYPES.map(s => (
                        <td key={s.key} className="py-3 px-4">
                          <Badge variant="secondary">
                            {data.scenarios?.[s.key]?.assumptions?.length || 0}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">{t({ en: 'Outcomes', ar: 'النتائج' })}</td>
                      {SCENARIO_TYPES.map(s => (
                        <td key={s.key} className="py-3 px-4">
                          <Badge variant="secondary">
                            {data.scenarios?.[s.key]?.outcomes?.length || 0}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">{t({ en: 'Probability', ar: 'الاحتمالية' })}</td>
                      {SCENARIO_TYPES.map(s => {
                        const p = data.scenarios?.[s.key]?.probability;
                        return (
                          <td key={s.key} className="py-3 px-4">
                            {p !== undefined && p !== '' ? (
                              <span className="font-bold">{p}%</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Side by Side Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENARIO_TYPES.map(s => {
              const scenarioData = data.scenarios?.[s.key] || {};
              return (
                <Card key={s.key} className={cn("border-2", s.color)}>
                  <CardHeader className="pb-2">
                    <CardTitle className={cn("text-base flex items-center gap-2", s.textColor)}>
                      <s.icon className="w-4 h-4" />
                      {s.title[language]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? (scenarioData.description_ar || scenarioData.description_en || scenarioData.description || t({ en: 'No description', ar: 'لا يوجد وصف' }))
                        : (scenarioData.description_en || scenarioData.description || t({ en: 'No description', ar: 'لا يوجد وصف' }))
                      }
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Probability Tab */}
        <TabsContent value="probability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t({ en: 'Probability Distribution', ar: 'توزيع الاحتمالية' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Visual representation of scenario probabilities', ar: 'تمثيل مرئي لاحتمالات السيناريوهات' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Probability Bars */}
              <div className="space-y-4">
                {SCENARIO_TYPES.map(s => {
                  const probability = data.scenarios?.[s.key]?.probability || 0;
                  return (
                    <div key={s.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <s.icon className={cn("w-5 h-5", s.textColor)} />
                          <span className="font-medium">{s.title[language]}</span>
                        </div>
                        <span className="font-bold text-lg">{probability}%</span>
                      </div>
                      <div className="h-8 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-500 rounded-full", s.badgeColor)}
                          style={{ width: `${probability}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Check */}
              {(() => {
                const total = SCENARIO_TYPES.reduce((sum, s) => sum + (data.scenarios?.[s.key]?.probability || 0), 0);
                return (
                  <div className={cn(
                    "p-4 rounded-lg border-2 text-center",
                    total === 100 ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"
                  )}>
                    <div className="text-2xl font-bold">
                      {total}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t({ en: 'Total Probability', ar: 'إجمالي الاحتمالية' })}
                    </div>
                    {total !== 100 && (
                      <p className="text-xs text-amber-600 mt-2">
                        {t({ 
                          en: 'Probabilities should ideally sum to 100%',
                          ar: 'يجب أن يكون مجموع الاحتماليات 100% بشكل مثالي'
                        })}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Quick Adjust */}
              {!isReadOnly && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-4">{t({ en: 'Quick Adjust', ar: 'تعديل سريع' })}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {SCENARIO_TYPES.map(s => (
                      <div key={s.key} className="text-center">
                        <Label className="text-xs">{s.title[language]}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={data.scenarios?.[s.key]?.probability ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const next = raw === '' ? '' : Math.max(0, Math.min(100, Number(raw)));
                            updateScenario(s.key, 'probability', next);
                          }}
                          className="text-center mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab - Using Shared Components */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scenario Overview Cards */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  {t({ en: 'Scenario Overview', ar: 'نظرة عامة على السيناريوهات' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SCENARIO_TYPES.map(s => {
                    const scenarioData = data.scenarios?.[s.key] || {};
                    const hasDescription = scenarioData.description_en || scenarioData.description_ar || scenarioData.description;
                    const Icon = s.icon;
                    return (
                      <div key={s.key} className={`p-4 rounded-lg border ${s.color}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`h-5 w-5 ${s.textColor}`} />
                          <span className="font-medium">{s.title[language]}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t({ en: 'Probability', ar: 'الاحتمالية' })}</span>
                            <span className="font-medium">{scenarioData.probability || 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t({ en: 'Assumptions', ar: 'الافتراضات' })}</span>
                            <span className="font-medium">{(scenarioData.assumptions || []).length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t({ en: 'Outcomes', ar: 'النتائج' })}</span>
                            <span className="font-medium">{(scenarioData.outcomes || []).length}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {hasDescription ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            )}
                            <span className="text-xs">{hasDescription ? t({ en: 'Described', ar: 'موصوف' }) : t({ en: 'Needs description', ar: 'يحتاج وصف' })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <QualityMetrics
              title={t({ en: 'Quality Metrics', ar: 'مقاييس الجودة' })}
              metrics={[
                { value: stats.totalAssumptions, label: { en: 'Total Assumptions', ar: 'إجمالي الافتراضات' }, icon: ListChecks, iconColor: 'text-blue-600' },
                { value: stats.totalOutcomes, label: { en: 'Total Outcomes', ar: 'إجمالي النتائج' }, icon: Target, iconColor: 'text-purple-600' },
                { value: `${stats.scenariosWithDescription}/3`, label: { en: 'Described', ar: 'موصوفة' }, icon: CheckCircle2, iconColor: 'text-green-600' },
                { value: `${stats.scenariosWithProbability}/3`, label: { en: 'With Probability', ar: 'بالاحتمالية' }, icon: BarChart3, iconColor: 'text-amber-600' }
              ]}
              language={language}
            />

            {/* Recommendations */}
            <RecommendationsCard
              title={t({ en: 'Recommendations', ar: 'توصيات' })}
              recommendations={[
                ...(stats.scenariosWithDescription < 3 ? [{ type: 'warning', message: { en: 'Add descriptions to all scenarios for comprehensive planning', ar: 'أضف أوصافاً لجميع السيناريوهات للتخطيط الشامل' } }] : []),
                ...(stats.totalAssumptions < 6 ? [{ type: 'info', message: { en: 'Consider adding more assumptions (2+ per scenario)', ar: 'فكر في إضافة المزيد من الافتراضات (2+ لكل سيناريو)' } }] : [])
              ]}
              language={language}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
