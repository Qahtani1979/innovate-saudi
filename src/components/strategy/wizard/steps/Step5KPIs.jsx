import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, Plus, X, Activity, ChevronDown, ChevronUp, Target, TrendingUp, AlertCircle, CheckCircle2, BarChart3, Gauge, Info, LineChart } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '../../../LanguageContext';

// KPI Categories with descriptions
const KPI_CATEGORIES = [
  { code: 'outcome', name_en: 'Outcome (Lagging)', name_ar: 'نتيجة (متأخر)', description_en: 'Measures final results', icon: Target },
  { code: 'output', name_en: 'Output', name_ar: 'مخرجات', description_en: 'Measures deliverables produced', icon: BarChart3 },
  { code: 'process', name_en: 'Process (Leading)', name_ar: 'عملية (قائد)', description_en: 'Measures activities', icon: TrendingUp },
  { code: 'input', name_en: 'Input', name_ar: 'مدخلات', description_en: 'Measures resources used', icon: Gauge }
];

// SMART criteria weights
const SMART_CRITERIA = {
  specific: { weight: 20, check: (kpi) => (kpi.name_en?.length > 10 && !kpi.name_en.toLowerCase().includes('improve')) },
  measurable: { weight: 20, check: (kpi) => (kpi.unit && kpi.target_value) },
  achievable: { weight: 20, check: (kpi) => (kpi.baseline_value && kpi.target_value && parseFloat(kpi.target_value) > parseFloat(kpi.baseline_value)) },
  relevant: { weight: 20, check: (kpi) => (kpi.objective_index !== null && kpi.objective_index !== undefined) },
  timeBound: { weight: 20, check: (kpi) => (kpi.target_year || kpi.milestones?.length > 0) }
};

// Calculate SMART score for a KPI
const calculateSMARTScore = (kpi) => {
  let score = 0;
  const details = {};
  
  Object.entries(SMART_CRITERIA).forEach(([key, { weight, check }]) => {
    const passed = check(kpi);
    details[key] = passed;
    if (passed) score += weight;
  });
  
  return { score, details };
};

// Quality indicators
const getQualityLevel = (score) => {
  if (score >= 80) return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
  if (score >= 60) return { level: 'good', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (score >= 40) return { level: 'fair', color: 'text-amber-600', bg: 'bg-amber-100' };
  return { level: 'needs_work', color: 'text-red-600', bg: 'bg-red-100' };
};

export default function Step5KPIs({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating 
}) {
  const { language, t, isRTL } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [viewMode, setViewMode] = useState('byObjective'); // 'byObjective' | 'byCategory' | 'matrix'
  
  const objectives = data.objectives || [];
  const kpis = data.kpis || [];
  const startYear = data.start_year || new Date().getFullYear();
  const endYear = data.end_year || startYear + 5;

  // Calculate milestone years
  const milestoneYears = useMemo(() => {
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }
    return years;
  }, [startYear, endYear]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    const objWithKPIs = new Set(kpis.map(k => k.objective_index).filter(i => i !== null && i !== undefined));
    const avgSMARTScore = kpis.length > 0 
      ? kpis.reduce((sum, kpi) => sum + calculateSMARTScore(kpi).score, 0) / kpis.length 
      : 0;
    
    const categoryDistribution = KPI_CATEGORIES.reduce((acc, cat) => {
      acc[cat.code] = kpis.filter(k => k.category === cat.code).length;
      return acc;
    }, {});
    
    const leadingCount = categoryDistribution.process + categoryDistribution.input;
    const laggingCount = categoryDistribution.outcome + categoryDistribution.output;
    
    return {
      total: kpis.length,
      objectivesWithKPIs: objWithKPIs.size,
      objectivesWithoutKPIs: objectives.length - objWithKPIs.size,
      avgSMARTScore: Math.round(avgSMARTScore),
      categoryDistribution,
      leadingCount,
      laggingCount,
      balanceRatio: kpis.length > 0 ? Math.round((leadingCount / kpis.length) * 100) : 0
    };
  }, [kpis, objectives]);

  const addKPI = (objectiveIndex = null) => {
    const newKPI = {
      name_en: '',
      name_ar: '',
      objective_index: objectiveIndex,
      category: 'outcome',
      unit: '',
      baseline_value: '',
      target_value: '',
      target_year: endYear,
      frequency: 'quarterly',
      data_source: '',
      data_collection_method: '',
      owner: '',
      milestones: milestoneYears.map(year => ({
        year,
        target: ''
      }))
    };
    onChange({ kpis: [...kpis, newKPI] });
    setExpandedIndex(kpis.length);
  };

  const updateKPI = (index, updates) => {
    const updated = kpis.map((kpi, i) => 
      i === index ? { ...kpi, ...updates } : kpi
    );
    onChange({ kpis: updated });
  };

  const updateMilestone = (kpiIndex, yearIndex, value) => {
    const kpi = kpis[kpiIndex];
    const milestones = [...(kpi.milestones || [])];
    if (!milestones[yearIndex]) {
      milestones[yearIndex] = { year: milestoneYears[yearIndex], target: '' };
    }
    milestones[yearIndex].target = value;
    updateKPI(kpiIndex, { milestones });
  };

  const removeKPI = (index) => {
    onChange({ kpis: kpis.filter((_, i) => i !== index) });
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const getKPIsForObjective = (objectiveIndex) => {
    return kpis.filter(k => k.objective_index === objectiveIndex);
  };

  const getKPIsByCategory = (categoryCode) => {
    return kpis.filter(k => k.category === categoryCode);
  };

  // Render SMART score badge
  const renderSMARTBadge = (kpi) => {
    const { score, details } = calculateSMARTScore(kpi);
    const quality = getQualityLevel(score);
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${quality.bg} ${quality.color} border-0 cursor-help`}>
              <Gauge className="h-3 w-3 mr-1" />
              {score}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="w-64 p-3">
            <p className="font-semibold mb-2">{t({ en: 'SMART Score Breakdown', ar: 'تفصيل نقاط SMART' })}</p>
            <div className="space-y-1 text-xs">
              {Object.entries(details).map(([key, passed]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key}</span>
                  {passed ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render KPI card
  const renderKPICard = (kpi, kpiIndex) => {
    const category = KPI_CATEGORIES.find(c => c.code === kpi.category) || KPI_CATEGORIES[0];
    const CategoryIcon = category.icon;
    
    return (
      <Collapsible key={kpiIndex} open={expandedIndex === kpiIndex}>
        <div className="border rounded-lg bg-card">
          <CollapsibleTrigger asChild>
            <div 
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedIndex(expandedIndex === kpiIndex ? null : kpiIndex)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-md ${category.code === 'outcome' ? 'bg-blue-100' : category.code === 'process' ? 'bg-green-100' : 'bg-muted'}`}>
                  <CategoryIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {kpi.name_en || t({ en: 'New KPI', ar: 'مؤشر جديد' })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? category.name_ar : category.name_en}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {renderSMARTBadge(kpi)}
                {kpi.target_value && (
                  <Badge variant="secondary" className="text-xs font-mono">
                    {kpi.baseline_value || '0'} → {kpi.target_value} {kpi.unit}
                  </Badge>
                )}
                {expandedIndex === kpiIndex ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4 pt-0 space-y-4 border-t">
              {/* Row 1: Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'KPI Name (EN)', ar: 'اسم المؤشر (إنجليزي)' })}</Label>
                  <Input
                    value={kpi.name_en}
                    onChange={(e) => updateKPI(kpiIndex, { name_en: e.target.value })}
                    placeholder={t({ en: 'e.g., Citizen Satisfaction Rate', ar: 'مثال: معدل رضا المواطنين' })}
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

              {/* Row 2: Category & Objective */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    {t({ en: 'KPI Category', ar: 'فئة المؤشر' })}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{t({ en: 'Leading indicators predict future performance. Lagging indicators measure past results.', ar: 'المؤشرات القائدة تتنبأ بالأداء المستقبلي. المؤشرات المتأخرة تقيس النتائج السابقة.' })}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Select value={kpi.category || 'outcome'} onValueChange={(v) => updateKPI(kpiIndex, { category: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KPI_CATEGORIES.map(cat => (
                        <SelectItem key={cat.code} value={cat.code}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" />
                            <span>{language === 'ar' ? cat.name_ar : cat.name_en}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Linked Objective', ar: 'الهدف المرتبط' })}</Label>
                  <Select 
                    value={kpi.objective_index?.toString() ?? 'none'} 
                    onValueChange={(v) => updateKPI(kpiIndex, { objective_index: v === 'none' ? null : parseInt(v) })}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t({ en: 'No linked objective', ar: 'بدون هدف مرتبط' })}</SelectItem>
                      {objectives.map((obj, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          #{i + 1}: {(language === 'ar' ? obj.name_ar : obj.name_en)?.slice(0, 50)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Baseline, Target, Unit, Frequency */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Baseline', ar: 'خط الأساس' })}</Label>
                  <Input
                    value={kpi.baseline_value}
                    onChange={(e) => updateKPI(kpiIndex, { baseline_value: e.target.value })}
                    placeholder="0"
                    type="text"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Target', ar: 'المستهدف' })}</Label>
                  <Input
                    value={kpi.target_value}
                    onChange={(e) => updateKPI(kpiIndex, { target_value: e.target.value })}
                    placeholder="100"
                    type="text"
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
                      <SelectItem value="biannual">{t({ en: 'Bi-annual', ar: 'نصف سنوي' })}</SelectItem>
                      <SelectItem value="annual">{t({ en: 'Annual', ar: 'سنوي' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Year-by-year milestones */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <LineChart className="h-3 w-3" />
                  {t({ en: 'Target Trajectory', ar: 'مسار الهدف' })}
                </Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {milestoneYears.map((year, yearIndex) => (
                    <div key={year} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{year}</Label>
                      <Input
                        value={kpi.milestones?.[yearIndex]?.target || ''}
                        onChange={(e) => updateMilestone(kpiIndex, yearIndex, e.target.value)}
                        placeholder={yearIndex === milestoneYears.length - 1 ? kpi.target_value : ''}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Data Source & Collection Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Data Source', ar: 'مصدر البيانات' })}</Label>
                  <Input
                    value={kpi.data_source}
                    onChange={(e) => updateKPI(kpiIndex, { data_source: e.target.value })}
                    placeholder={t({ en: 'e.g., Balady Platform, Survey System', ar: 'مثال: منصة بلدي، نظام الاستبيانات' })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Collection Method', ar: 'طريقة الجمع' })}</Label>
                  <Input
                    value={kpi.data_collection_method}
                    onChange={(e) => updateKPI(kpiIndex, { data_collection_method: e.target.value })}
                    placeholder={t({ en: 'e.g., Automated API, Manual Survey', ar: 'مثال: واجهة برمجية آلية، مسح يدوي' })}
                  />
                </div>
              </div>

              {/* Row 6: Owner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'KPI Owner', ar: 'مسؤول المؤشر' })}</Label>
                  <Input
                    value={kpi.owner}
                    onChange={(e) => updateKPI(kpiIndex, { owner: e.target.value })}
                    placeholder={t({ en: 'e.g., IT Department, Performance Unit', ar: 'مثال: إدارة تقنية المعلومات، وحدة الأداء' })}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-2">
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
                {t({ en: 'Generate SMART KPIs with balanced leading/lagging indicators and year-by-year targets', ar: 'إنشاء مؤشرات أداء ذكية مع توازن المؤشرات القائدة والمتأخرة وأهداف سنوية' })}
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
              {t({ en: 'Please define objectives first (Step 9) before creating KPIs.', ar: 'يرجى تحديد الأهداف أولاً (الخطوة 9) قبل إنشاء المؤشرات.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Dashboard */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t({ en: 'KPI Dashboard', ar: 'لوحة المؤشرات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Total KPIs', ar: 'إجمالي المؤشرات' })}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <p className="text-2xl font-bold text-green-600">{stats.objectivesWithKPIs}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'With KPIs', ar: 'بمؤشرات' })}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <p className="text-2xl font-bold text-amber-600">{stats.objectivesWithoutKPIs}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Without KPIs', ar: 'بدون مؤشرات' })}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <p className="text-2xl font-bold text-blue-600">{stats.avgSMARTScore}%</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Avg SMART', ar: 'متوسط SMART' })}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <p className="text-2xl font-bold text-purple-600">{stats.balanceRatio}%</p>
                          <p className="text-xs text-muted-foreground">{t({ en: 'Leading', ar: 'قائدة' })}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t({ en: 'Leading: ', ar: 'قائدة: ' })}{stats.leadingCount} | {t({ en: 'Lagging: ', ar: 'متأخرة: ' })}{stats.laggingCount}</p>
                        <p className="text-xs text-muted-foreground">{t({ en: 'Aim for 30-40% leading indicators', ar: 'استهدف 30-40% مؤشرات قائدة' })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Category distribution bar */}
              {stats.total > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs">{t({ en: 'Category Distribution', ar: 'توزيع الفئات' })}</Label>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    {KPI_CATEGORIES.map((cat, i) => {
                      const count = stats.categoryDistribution[cat.code] || 0;
                      const pct = (count / stats.total) * 100;
                      if (pct === 0) return null;
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500'];
                      return (
                        <TooltipProvider key={cat.code}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`${colors[i]} h-full cursor-help`} style={{ width: `${pct}%` }} />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{language === 'ar' ? cat.name_ar : cat.name_en}: {count}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {KPI_CATEGORIES.map((cat, i) => {
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500'];
                      return (
                        <div key={cat.code} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${colors[i]}`} />
                          <span className="text-muted-foreground">{language === 'ar' ? cat.name_ar : cat.name_en}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="byObjective" className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {t({ en: 'By Objective', ar: 'حسب الهدف' })}
              </TabsTrigger>
              <TabsTrigger value="byCategory" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {t({ en: 'By Category', ar: 'حسب الفئة' })}
              </TabsTrigger>
            </TabsList>

            {/* By Objective View */}
            <TabsContent value="byObjective" className="mt-4 space-y-4">
              {objectives.map((obj, objIndex) => {
                const objKPIs = getKPIsForObjective(objIndex);
                return (
                  <Card key={objIndex}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">#{objIndex + 1}</Badge>
                          <span className="line-clamp-1">{language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}</span>
                          <Badge variant={objKPIs.length > 0 ? 'default' : 'secondary'} className="text-xs">
                            {objKPIs.length} {t({ en: 'KPIs', ar: 'مؤشرات' })}
                          </Badge>
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
                            return renderKPICard(kpi, kpiIndex);
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* By Category View */}
            <TabsContent value="byCategory" className="mt-4 space-y-4">
              {KPI_CATEGORIES.map((category) => {
                const catKPIs = getKPIsByCategory(category.code);
                const CategoryIcon = category.icon;
                return (
                  <Card key={category.code}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-muted">
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <span>{language === 'ar' ? category.name_ar : category.name_en}</span>
                          <Badge variant={catKPIs.length > 0 ? 'default' : 'secondary'} className="text-xs">
                            {catKPIs.length}
                          </Badge>
                        </CardTitle>
                        <Button size="sm" variant="outline" onClick={() => {
                          const newKPI = {
                            name_en: '',
                            name_ar: '',
                            objective_index: null,
                            category: category.code,
                            unit: '',
                            baseline_value: '',
                            target_value: '',
                            target_year: endYear,
                            frequency: 'quarterly',
                            data_source: '',
                            data_collection_method: '',
                            owner: '',
                            milestones: milestoneYears.map(year => ({ year, target: '' }))
                          };
                          onChange({ kpis: [...kpis, newKPI] });
                          setExpandedIndex(kpis.length);
                        }}>
                          <Plus className="h-4 w-4 mr-1" />
                          {t({ en: 'Add', ar: 'إضافة' })}
                        </Button>
                      </div>
                      <CardDescription>{category.description_en}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {catKPIs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {t({ en: 'No KPIs in this category', ar: 'لا توجد مؤشرات في هذه الفئة' })}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {catKPIs.map((kpi) => {
                            const kpiIndex = kpis.indexOf(kpi);
                            return renderKPICard(kpi, kpiIndex);
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>

          {/* Add Unlinked KPI */}
          <Card className="border-dashed">
            <CardContent className="py-4">
              <Button variant="outline" onClick={() => addKPI(null)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Cross-Cutting KPI', ar: 'إضافة مؤشر عام' })}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
