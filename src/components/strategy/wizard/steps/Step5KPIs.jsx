import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { StepAlerts } from '../shared/StepAlerts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Sparkles, Loader2, Plus, X, Activity, ChevronDown, ChevronUp, Target, TrendingUp, 
  AlertCircle, CheckCircle2, BarChart3, Gauge, Info, LineChart, Grid3X3, PieChart,
  AlertTriangle, Zap, Clock, Database, User, CalendarDays, Wand2, Check, RefreshCw
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '../../../LanguageContext';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, MainAIGeneratorCard } from '../shared';
import AIStepAnalyzer from '../AIStepAnalyzer';

// KPI Categories with descriptions
const KPI_CATEGORIES = [
  { code: 'outcome', name_en: 'Outcome (Lagging)', name_ar: 'نتيجة (متأخر)', description_en: 'Measures final results', icon: Target, color: 'blue' },
  { code: 'output', name_en: 'Output', name_ar: 'مخرجات', description_en: 'Measures deliverables produced', icon: BarChart3, color: 'green' },
  { code: 'process', name_en: 'Process (Leading)', name_ar: 'عملية (قائد)', description_en: 'Measures activities', icon: TrendingUp, color: 'amber' },
  { code: 'input', name_en: 'Input', name_ar: 'مدخلات', description_en: 'Measures resources used', icon: Gauge, color: 'purple' }
];

// Frequency options
const FREQUENCY_OPTIONS = [
  { code: 'monthly', name_en: 'Monthly', name_ar: 'شهري' },
  { code: 'quarterly', name_en: 'Quarterly', name_ar: 'ربع سنوي' },
  { code: 'biannual', name_en: 'Bi-annual', name_ar: 'نصف سنوي' },
  { code: 'annual', name_en: 'Annual', name_ar: 'سنوي' }
];

// SMART criteria weights
const SMART_CRITERIA = {
  specific: { weight: 20, label_en: 'Specific', label_ar: 'محدد', check: (kpi) => (kpi.name_en?.length > 10 && !kpi.name_en.toLowerCase().includes('improve')) },
  measurable: { weight: 20, label_en: 'Measurable', label_ar: 'قابل للقياس', check: (kpi) => (kpi.unit && kpi.target_value) },
  achievable: { weight: 20, label_en: 'Achievable', label_ar: 'قابل للتحقيق', check: (kpi) => (kpi.baseline_value && kpi.target_value && parseFloat(kpi.target_value) > parseFloat(kpi.baseline_value)) },
  relevant: { weight: 20, label_en: 'Relevant', label_ar: 'ذو صلة', check: (kpi) => (kpi.objective_index !== null && kpi.objective_index !== undefined) },
  timeBound: { weight: 20, label_en: 'Time-Bound', label_ar: 'محدد بوقت', check: (kpi) => (kpi.target_year || kpi.milestones?.length > 0) }
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

// Calculate individual KPI completeness
const calculateKPICompleteness = (kpi) => {
  const fields = [
    { key: 'name_en', weight: 15 },
    { key: 'name_ar', weight: 10 },
    { key: 'category', weight: 10 },
    { key: 'objective_index', weight: 15, check: (v) => v !== null && v !== undefined },
    { key: 'unit', weight: 10 },
    { key: 'baseline_value', weight: 10 },
    { key: 'target_value', weight: 15 },
    { key: 'frequency', weight: 5 },
    { key: 'data_source', weight: 5 },
    { key: 'owner', weight: 5 }
  ];
  
  let score = 0;
  fields.forEach(({ key, weight, check }) => {
    const value = kpi[key];
    const passed = check ? check(value) : (value && value !== '');
    if (passed) score += weight;
  });
  
  return Math.round(score);
};

// Quality indicators
const getQualityLevel = (score) => {
  if (score >= 80) return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-100', label_en: 'Excellent', label_ar: 'ممتاز' };
  if (score >= 60) return { level: 'good', color: 'text-blue-600', bg: 'bg-blue-100', label_en: 'Good', label_ar: 'جيد' };
  if (score >= 40) return { level: 'fair', color: 'text-amber-600', bg: 'bg-amber-100', label_en: 'Fair', label_ar: 'مقبول' };
  return { level: 'needs_work', color: 'text-red-600', bg: 'bg-red-100', label_en: 'Needs Work', label_ar: 'يحتاج تحسين' };
};

export default function Step5KPIs({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  onGenerateSingleKpi,
  isReadOnly = false
}) {
  const { language, t, isRTL } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [viewMode, setViewMode] = useState('byObjective');
  
  // AI Add One states
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposedKpi, setProposedKpi] = useState(null);
  const [differentiationScore, setDifferentiationScore] = useState(null);
  const [isGeneratingSingle, setIsGeneratingSingle] = useState(false);
  const [targetCategory, setTargetCategory] = useState('_any');
  const [targetObjectiveIndex, setTargetObjectiveIndex] = useState(null);
  
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
    
    const avgCompleteness = kpis.length > 0
      ? kpis.reduce((sum, kpi) => sum + calculateKPICompleteness(kpi), 0) / kpis.length
      : 0;
    
    const categoryDistribution = KPI_CATEGORIES.reduce((acc, cat) => {
      acc[cat.code] = kpis.filter(k => k.category === cat.code).length;
      return acc;
    }, {});
    
    const frequencyDistribution = FREQUENCY_OPTIONS.reduce((acc, freq) => {
      acc[freq.code] = kpis.filter(k => k.frequency === freq.code).length;
      return acc;
    }, {});
    
    const leadingCount = categoryDistribution.process + categoryDistribution.input;
    const laggingCount = categoryDistribution.outcome + categoryDistribution.output;
    
    const kpisWithMilestones = kpis.filter(k => k.milestones?.some(m => m.target && m.target !== '')).length;
    const kpisWithOwner = kpis.filter(k => k.owner && k.owner !== '').length;
    const kpisWithDataSource = kpis.filter(k => k.data_source && k.data_source !== '').length;
    
    // Quality breakdown
    const qualityBreakdown = { excellent: 0, good: 0, fair: 0, needs_work: 0 };
    kpis.forEach(kpi => {
      const quality = getQualityLevel(calculateSMARTScore(kpi).score);
      qualityBreakdown[quality.level]++;
    });
    
    return {
      total: kpis.length,
      objectivesWithKPIs: objWithKPIs.size,
      objectivesWithoutKPIs: objectives.length - objWithKPIs.size,
      avgSMARTScore: Math.round(avgSMARTScore),
      avgCompleteness: Math.round(avgCompleteness),
      categoryDistribution,
      frequencyDistribution,
      leadingCount,
      laggingCount,
      balanceRatio: kpis.length > 0 ? Math.round((leadingCount / kpis.length) * 100) : 0,
      kpisWithMilestones,
      kpisWithOwner,
      kpisWithDataSource,
      qualityBreakdown
    };
  }, [kpis, objectives]);

  // Calculate overall completeness
  const overallCompleteness = useMemo(() => {
    if (objectives.length === 0) return 0;
    
    let score = 0;
    // Has KPIs defined (30%)
    if (kpis.length > 0) score += 30;
    // Average KPI completeness (30%)
    score += (stats.avgCompleteness / 100) * 30;
    // Objective coverage (20%)
    const coverage = objectives.length > 0 ? (stats.objectivesWithKPIs / objectives.length) : 0;
    score += coverage * 20;
    // Average SMART score (20%)
    score += (stats.avgSMARTScore / 100) * 20;
    
    return Math.round(score);
  }, [kpis, objectives, stats]);

  const addKPI = (objectiveIndex = null) => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
    const updated = kpis.map((kpi, i) => 
      i === index ? { ...kpi, ...updates } : kpi
    );
    onChange({ kpis: updated });
  };

  const updateMilestone = (kpiIndex, yearIndex, value) => {
    if (isReadOnly) return;
    const kpi = kpis[kpiIndex];
    const milestones = [...(kpi.milestones || [])];
    if (!milestones[yearIndex]) {
      milestones[yearIndex] = { year: milestoneYears[yearIndex], target: '' };
    }
    milestones[yearIndex].target = value;
    updateKPI(kpiIndex, { milestones });
  };

  const removeKPI = (index) => {
    if (isReadOnly) return;
    onChange({ kpis: kpis.filter((_, i) => i !== index) });
    if (expandedIndex === index) setExpandedIndex(null);
  };

  // AI Single KPI Generation
  const handleGenerateSingleKpi = async (categoryOverride = null, objIndexOverride = null) => {
    if (isReadOnly) return;
    setIsGeneratingSingle(true);
    setShowProposalModal(true);
    setProposedKpi(null);
    setDifferentiationScore(null);

    try {
      if (onGenerateSingleKpi) {
        const selectedCategory = categoryOverride || (targetCategory !== '_any' ? targetCategory : null);
        const selectedObjIndex = objIndexOverride !== null ? objIndexOverride : targetObjectiveIndex;
        const result = await onGenerateSingleKpi(kpis, selectedCategory, selectedObjIndex);
        if (result?.kpi) {
          setProposedKpi(result.kpi);
          setDifferentiationScore(result.differentiation_score || 75);
          if (result.kpi.category) setTargetCategory(result.kpi.category);
          if (result.kpi.objective_index !== undefined) setTargetObjectiveIndex(result.kpi.objective_index);
        }
      }
    } catch (error) {
      console.error('Error generating single KPI:', error);
    } finally {
      setIsGeneratingSingle(false);
    }
  };

  const handleApproveKpi = () => {
    if (proposedKpi && !isReadOnly) {
      const newKpi = {
        ...proposedKpi,
        milestones: milestoneYears.map(year => ({
          year,
          target: proposedKpi.milestones?.find(m => m.year === year)?.target || ''
        }))
      };
      onChange({ kpis: [...kpis, newKpi] });
      setShowProposalModal(false);
      setProposedKpi(null);
      setExpandedIndex(kpis.length);
    }
  };

  const updateProposedKpiField = (field, value) => {
    setProposedKpi(prev => ({ ...prev, [field]: value }));
  };

  const getKPIsForObjective = (objectiveIndex) => {
    return kpis.filter(k => k.objective_index === objectiveIndex);
  };

  const getKPIsByCategory = (categoryCode) => {
    return kpis.filter(k => k.category === categoryCode);
  };

  // Check if a field is complete for visual feedback
  const isFieldComplete = (value, checkFn = null) => {
    if (checkFn) return checkFn(value);
    return value && value !== '';
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
                  <span>{language === 'ar' ? SMART_CRITERIA[key].label_ar : SMART_CRITERIA[key].label_en}</span>
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
    const completeness = calculateKPICompleteness(kpi);
    const linkedObj = kpi.objective_index !== null && kpi.objective_index !== undefined 
      ? objectives[kpi.objective_index] 
      : null;
    
    return (
      <Collapsible key={kpiIndex} open={expandedIndex === kpiIndex}>
        <div className="border rounded-lg bg-card">
          <CollapsibleTrigger asChild>
            <div 
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedIndex(expandedIndex === kpiIndex ? null : kpiIndex)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-1.5 rounded-md bg-${category.color}-100`}>
                  <CategoryIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {kpi.name_en || t({ en: 'New KPI', ar: 'مؤشر جديد' })}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{language === 'ar' ? category.name_ar : category.name_en}</span>
                    {linkedObj && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">
                          {t({ en: 'Obj', ar: 'هدف' })} #{kpi.objective_index + 1}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {renderSMARTBadge(kpi)}
                {kpi.target_value && (
                  <Badge variant="secondary" className="text-xs font-mono hidden sm:flex">
                    {kpi.baseline_value || '0'} → {kpi.target_value} {kpi.unit}
                  </Badge>
                )}
                <div className="w-16 hidden md:block">
                  <Progress value={completeness} className="h-1.5" />
                </div>
                {expandedIndex === kpiIndex ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4 pt-0 space-y-4 border-t">
              {/* Completeness indicator */}
              <div className="flex items-center gap-3 pt-2">
                <Progress value={completeness} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground w-12">{completeness}%</span>
              </div>

              {/* Row 1: Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'KPI Name (EN)', ar: 'اسم المؤشر (إنجليزي)' })}</Label>
                  <Input
                    value={kpi.name_en}
                    onChange={(e) => updateKPI(kpiIndex, { name_en: e.target.value })}
                    placeholder={t({ en: 'e.g., Citizen Satisfaction Rate', ar: 'مثال: معدل رضا المواطنين' })}
                    dir="ltr"
                    disabled={isReadOnly}
                    className={isFieldComplete(kpi.name_en) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'KPI Name (AR)', ar: 'اسم المؤشر (عربي)' })}</Label>
                  <Input
                    value={kpi.name_ar}
                    onChange={(e) => updateKPI(kpiIndex, { name_ar: e.target.value })}
                    dir="rtl"
                    disabled={isReadOnly}
                    className={isFieldComplete(kpi.name_ar) ? 'border-green-300 bg-green-50/50' : ''}
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
                  <Select 
                    value={kpi.category || 'outcome'} 
                    onValueChange={(v) => updateKPI(kpiIndex, { category: v })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={`h-9 ${isFieldComplete(kpi.category) ? 'border-green-300 bg-green-50/50' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
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
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={`h-9 ${isFieldComplete(kpi.objective_index, (v) => v !== null && v !== undefined) ? 'border-green-300 bg-green-50/50' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
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
                    disabled={isReadOnly}
                    className={isFieldComplete(kpi.baseline_value) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Target', ar: 'المستهدف' })}</Label>
                  <Input
                    value={kpi.target_value}
                    onChange={(e) => updateKPI(kpiIndex, { target_value: e.target.value })}
                    placeholder="100"
                    type="text"
                    disabled={isReadOnly}
                    className={isFieldComplete(kpi.target_value) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Unit', ar: 'الوحدة' })}</Label>
                  <Input
                    value={kpi.unit}
                    onChange={(e) => updateKPI(kpiIndex, { unit: e.target.value })}
                    placeholder="%"
                    disabled={isReadOnly}
                    className={isFieldComplete(kpi.unit) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Frequency', ar: 'التكرار' })}</Label>
                  <Select 
                    value={kpi.frequency} 
                    onValueChange={(v) => updateKPI(kpiIndex, { frequency: v })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={`h-9 ${isFieldComplete(kpi.frequency) ? 'border-green-300 bg-green-50/50' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map(freq => (
                        <SelectItem key={freq.code} value={freq.code}>
                          {language === 'ar' ? freq.name_ar : freq.name_en}
                        </SelectItem>
                      ))}
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
                        className={`h-8 text-xs ${kpi.milestones?.[yearIndex]?.target ? 'border-green-300 bg-green-50/50' : ''}`}
                        disabled={isReadOnly}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 5: Data Source & Collection Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    {t({ en: 'Data Source', ar: 'مصدر البيانات' })}
                  </Label>
                  <Input
                    value={kpi.data_source}
                    onChange={(e) => updateKPI(kpiIndex, { data_source: e.target.value })}
                    placeholder={t({ en: 'e.g., Balady Platform, Survey System', ar: 'مثال: منصة بلدي، نظام الاستبيانات' })}
                    disabled={isReadOnly}
                    className={isFieldComplete(kpi.data_source) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Collection Method', ar: 'طريقة الجمع' })}</Label>
                  <Input
                    value={kpi.data_collection_method}
                    onChange={(e) => updateKPI(kpiIndex, { data_collection_method: e.target.value })}
                    placeholder={t({ en: 'e.g., Automated API, Manual Survey', ar: 'مثال: واجهة برمجية آلية، مسح يدوي' })}
                    disabled={isReadOnly}
                    className={isFieldComplete(kpi.data_collection_method) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
              </div>

              {/* Row 6: Owner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {t({ en: 'KPI Owner', ar: 'مسؤول المؤشر' })}
                  </Label>
                  <Input
                    value={kpi.owner}
                    onChange={(e) => updateKPI(kpiIndex, { owner: e.target.value })}
                    placeholder={t({ en: 'e.g., IT Department, Performance Unit', ar: 'مثال: إدارة تقنية المعلومات، وحدة الأداء' })}
                    disabled={isReadOnly}
                    className={isFieldComplete(kpi.owner) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
              </div>

              {/* Actions */}
              {!isReadOnly && (
                <div className="flex justify-end pt-2">
                  <Button size="sm" variant="destructive" onClick={() => removeKPI(kpiIndex)}>
                    <X className="h-4 w-4 mr-1" />
                    {t({ en: 'Remove', ar: 'حذف' })}
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  // Alerts and recommendations
  const alerts = useMemo(() => {
    const items = [];
    
    if (stats.objectivesWithoutKPIs > 0) {
      items.push({
        type: 'warning',
        icon: AlertTriangle,
        message: t({ 
          en: `${stats.objectivesWithoutKPIs} objective(s) without KPIs`, 
          ar: `${stats.objectivesWithoutKPIs} هدف(أهداف) بدون مؤشرات` 
        })
      });
    }
    
    if (stats.balanceRatio < 20 && kpis.length > 0) {
      items.push({
        type: 'info',
        icon: Zap,
        message: t({ 
          en: 'Consider adding more leading indicators (process/input KPIs)', 
          ar: 'فكر في إضافة مزيد من المؤشرات القائدة (مؤشرات العملية/المدخلات)' 
        })
      });
    }
    
    if (stats.avgSMARTScore < 60 && kpis.length > 0) {
      items.push({
        type: 'warning',
        icon: Gauge,
        message: t({ 
          en: 'Average SMART score is low. Review KPI definitions.', 
          ar: 'متوسط نقاط SMART منخفض. راجع تعريفات المؤشرات.' 
        })
      });
    }
    
    if (stats.kpisWithOwner < kpis.length && kpis.length > 0) {
      items.push({
        type: 'info',
        icon: User,
        message: t({ 
          en: `${kpis.length - stats.kpisWithOwner} KPI(s) missing owners`, 
          ar: `${kpis.length - stats.kpisWithOwner} مؤشر(ات) بدون مسؤول` 
        })
      });
    }
    
    return items;
  }, [stats, kpis, t]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <StepDashboardHeader
        score={overallCompleteness}
        title={t({ en: 'KPIs & Metrics', ar: 'المؤشرات والمقاييس' })}
        subtitle={t({ en: 'Define measurable indicators for objectives', ar: 'حدد مؤشرات قابلة للقياس للأهداف' })}
        language={language}
        stats={[
          { value: stats.total, label: t({ en: 'Total KPIs', ar: 'إجمالي المؤشرات' }), icon: Activity, iconColor: 'text-primary' },
          { value: stats.objectivesWithKPIs, label: t({ en: 'Covered', ar: 'مغطاة' }), icon: Target, iconColor: 'text-green-600', valueColor: 'text-green-600' },
          { value: `${stats.avgSMARTScore}%`, label: t({ en: 'Avg SMART', ar: 'متوسط SMART' }), icon: Gauge, iconColor: 'text-blue-600', valueColor: 'text-blue-600' },
          { value: `${stats.balanceRatio}%`, label: t({ en: 'Leading', ar: 'قائدة' }), icon: TrendingUp, iconColor: 'text-purple-600', valueColor: 'text-purple-600', subValue: `${stats.leadingCount}/${stats.laggingCount}` }
        ]}
        metrics={[
          { label: t({ en: 'Objective Coverage', ar: 'تغطية الأهداف' }), value: stats.coveragePercent || 0 },
          { label: t({ en: 'SMART Compliance', ar: 'التوافق SMART' }), value: stats.avgSMARTScore },
          { label: t({ en: 'Leading/Lagging Balance', ar: 'توازن المؤشرات' }), value: stats.balanceRatio },
          { label: t({ en: 'Data Quality', ar: 'جودة البيانات' }), value: overallCompleteness }
        ]}
      />

      {/* Alerts */}
      <StepAlerts alerts={alerts} />

      {/* AI Generation Card */}
      {!isReadOnly && objectives.length > 0 && (
        <MainAIGeneratorCard
          title={{ en: 'AI-Powered KPI Generation', ar: 'إنشاء المؤشرات بالذكاء الاصطناعي' }}
          description={{ en: 'Generate SMART KPIs with balanced leading/lagging indicators', ar: 'إنشاء مؤشرات أداء ذكية مع توازن المؤشرات' }}
          onGenerate={onGenerateAI}
          onGenerateSingle={() => handleGenerateSingleKpi()}
          isGenerating={isGenerating}
          isGeneratingSingle={isGeneratingSingle}
          showSingleButton={!!onGenerateSingleKpi}
          isReadOnly={isReadOnly}
          buttonLabel={{ en: 'Generate All', ar: 'إنشاء الكل' }}
          singleButtonLabel={{ en: 'AI Add One', ar: 'إضافة واحد' }}
        />
      )}

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
          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="byObjective" className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {t({ en: 'By Objective', ar: 'حسب الهدف' })}
              </TabsTrigger>
              <TabsTrigger value="byCategory" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {t({ en: 'By Category', ar: 'حسب الفئة' })}
              </TabsTrigger>
              <TabsTrigger value="matrix" className="flex items-center gap-1">
                <Grid3X3 className="h-4 w-4" />
                {t({ en: 'Matrix', ar: 'المصفوفة' })}
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-1">
                <PieChart className="h-4 w-4" />
                {t({ en: 'Summary', ar: 'الملخص' })}
              </TabsTrigger>
              <TabsTrigger value="analyzer" className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                {t({ en: 'AI Analyzer', ar: 'محلل AI' })}
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
                        {!isReadOnly && (
                          <Button size="sm" variant="outline" onClick={() => addKPI(objIndex)}>
                            <Plus className="h-4 w-4 mr-1" />
                            {t({ en: 'Add KPI', ar: 'إضافة مؤشر' })}
                          </Button>
                        )}
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
                          <div className={`p-1.5 rounded-md bg-${category.color}-100`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <span>{language === 'ar' ? category.name_ar : category.name_en}</span>
                          <Badge variant={catKPIs.length > 0 ? 'default' : 'secondary'} className="text-xs">
                            {catKPIs.length}
                          </Badge>
                        </CardTitle>
                        {!isReadOnly && (
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
                        )}
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

            {/* Matrix View */}
            <TabsContent value="matrix" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Grid3X3 className="h-5 w-5" />
                    {t({ en: 'Objective-Category Matrix', ar: 'مصفوفة الأهداف والفئات' })}
                  </CardTitle>
                  <CardDescription>
                    {t({ en: 'Overview of KPIs by objective and category', ar: 'نظرة عامة على المؤشرات حسب الهدف والفئة' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">{t({ en: 'Objective', ar: 'الهدف' })}</th>
                          {KPI_CATEGORIES.map(cat => (
                            <th key={cat.code} className="text-center p-2 font-medium">
                              <div className="flex flex-col items-center gap-1">
                                <cat.icon className="h-4 w-4" />
                                <span className="text-xs">{language === 'ar' ? cat.name_ar.split(' ')[0] : cat.name_en.split(' ')[0]}</span>
                              </div>
                            </th>
                          ))}
                          <th className="text-center p-2 font-medium">{t({ en: 'Total', ar: 'الإجمالي' })}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {objectives.map((obj, objIndex) => {
                          const objKPIs = getKPIsForObjective(objIndex);
                          return (
                            <tr key={objIndex} className="border-b hover:bg-muted/50">
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="font-mono text-xs">#{objIndex + 1}</Badge>
                                  <span className="truncate max-w-[200px]">
                                    {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                                  </span>
                                </div>
                              </td>
                              {KPI_CATEGORIES.map(cat => {
                                const count = objKPIs.filter(k => k.category === cat.code).length;
                                return (
                                  <td key={cat.code} className="text-center p-2">
                                    {count > 0 ? (
                                      <Badge variant="secondary">{count}</Badge>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="text-center p-2">
                                <Badge variant={objKPIs.length > 0 ? 'default' : 'outline'}>
                                  {objKPIs.length}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-muted/30 font-medium">
                          <td className="p-2">{t({ en: 'Total', ar: 'الإجمالي' })}</td>
                          {KPI_CATEGORIES.map(cat => (
                            <td key={cat.code} className="text-center p-2">
                              <Badge variant="outline">{stats.categoryDistribution[cat.code] || 0}</Badge>
                            </td>
                          ))}
                          <td className="text-center p-2">
                            <Badge>{stats.total}</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary View */}
            <TabsContent value="summary" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quality Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Gauge className="h-5 w-5" />
                      {t({ en: 'SMART Quality Distribution', ar: 'توزيع جودة SMART' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { key: 'excellent', label_en: 'Excellent (80%+)', label_ar: 'ممتاز (80%+)', color: 'bg-green-500' },
                        { key: 'good', label_en: 'Good (60-79%)', label_ar: 'جيد (60-79%)', color: 'bg-blue-500' },
                        { key: 'fair', label_en: 'Fair (40-59%)', label_ar: 'مقبول (40-59%)', color: 'bg-amber-500' },
                        { key: 'needs_work', label_en: 'Needs Work (<40%)', label_ar: 'يحتاج تحسين (<40%)', color: 'bg-red-500' }
                      ].map(item => {
                        const count = stats.qualityBreakdown[item.key] || 0;
                        const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                          <div key={item.key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{language === 'ar' ? item.label_ar : item.label_en}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} transition-all`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Objective Coverage */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {t({ en: 'Objective Coverage', ar: 'تغطية الأهداف' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {objectives.map((obj, i) => {
                        const count = getKPIsForObjective(i).length;
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge variant="outline" className="font-mono text-xs shrink-0">#{i + 1}</Badge>
                              <span className="text-sm truncate">
                                {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                              </span>
                            </div>
                            <Badge variant={count > 0 ? 'default' : 'secondary'} className="shrink-0">
                              {count} {t({ en: 'KPIs', ar: 'مؤشرات' })}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Measurement Frequency */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t({ en: 'Measurement Frequency', ar: 'تكرار القياس' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {FREQUENCY_OPTIONS.map(freq => {
                        const count = stats.frequencyDistribution[freq.code] || 0;
                        const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                          <div key={freq.code} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{language === 'ar' ? freq.name_ar : freq.name_en}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Data Readiness */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {t({ en: 'Data Readiness', ar: 'جاهزية البيانات' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t({ en: 'With Data Source', ar: 'مع مصدر بيانات' })}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={stats.total > 0 ? (stats.kpisWithDataSource / stats.total) * 100 : 0} className="w-24 h-2" />
                          <span className="text-sm font-medium">{stats.kpisWithDataSource}/{stats.total}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t({ en: 'With Owner', ar: 'مع مسؤول' })}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={stats.total > 0 ? (stats.kpisWithOwner / stats.total) * 100 : 0} className="w-24 h-2" />
                          <span className="text-sm font-medium">{stats.kpisWithOwner}/{stats.total}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t({ en: 'With Milestones', ar: 'مع مراحل' })}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={stats.total > 0 ? (stats.kpisWithMilestones / stats.total) * 100 : 0} className="w-24 h-2" />
                          <span className="text-sm font-medium">{stats.kpisWithMilestones}/{stats.total}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {t({ en: 'Recommendations', ar: 'التوصيات' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.objectivesWithoutKPIs > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <span>
                          {t({ 
                            en: `Add KPIs for ${stats.objectivesWithoutKPIs} uncovered objective(s) to ensure complete measurement coverage.`,
                            ar: `أضف مؤشرات لـ ${stats.objectivesWithoutKPIs} هدف(أهداف) غير مغطاة لضمان تغطية قياس كاملة.`
                          })}
                        </span>
                      </div>
                    )}
                    {stats.balanceRatio < 30 && stats.total > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>
                          {t({ 
                            en: 'Consider adding more leading indicators (process/input KPIs) to predict future performance.',
                            ar: 'فكر في إضافة مزيد من المؤشرات القائدة (مؤشرات العملية/المدخلات) للتنبؤ بالأداء المستقبلي.'
                          })}
                        </span>
                      </div>
                    )}
                    {stats.avgSMARTScore < 70 && stats.total > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <Gauge className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <span>
                          {t({ 
                            en: 'Improve KPI definitions to increase SMART compliance. Focus on adding baselines, targets, and time bounds.',
                            ar: 'حسّن تعريفات المؤشرات لزيادة توافق SMART. ركز على إضافة خطوط الأساس والأهداف والحدود الزمنية.'
                          })}
                        </span>
                      </div>
                    )}
                    {stats.kpisWithOwner < stats.total && stats.total > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <User className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>
                          {t({ 
                            en: `Assign owners to ${stats.total - stats.kpisWithOwner} KPI(s) to ensure accountability.`,
                            ar: `عيّن مسؤولين لـ ${stats.total - stats.kpisWithOwner} مؤشر(ات) لضمان المساءلة.`
                          })}
                        </span>
                      </div>
                    )}
                    {stats.total === 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          {t({ 
                            en: 'Start by using AI generation or manually adding KPIs for each objective.',
                            ar: 'ابدأ باستخدام الذكاء الاصطناعي أو إضافة المؤشرات يدوياً لكل هدف.'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Unlinked KPI */}
          {!isReadOnly && (
            <Card className="border-dashed">
              <CardContent className="py-4">
                <Button variant="outline" onClick={() => addKPI(null)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Add Cross-Cutting KPI', ar: 'إضافة مؤشر عام' })}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* AI Add One Proposal Modal */}
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              {t({ en: 'AI-Generated KPI', ar: 'مؤشر مُنشأ بالذكاء الاصطناعي' })}
            </DialogTitle>
          </DialogHeader>

          {isGeneratingSingle ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">{t({ en: 'Generating KPI...', ar: 'جاري إنشاء المؤشر...' })}</p>
            </div>
          ) : proposedKpi ? (
            <div className="space-y-4">
              {differentiationScore && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">{t({ en: 'Differentiation Score', ar: 'نقاط التمايز' })}</span>
                  <Badge variant={differentiationScore >= 70 ? 'default' : 'secondary'}>{differentiationScore}%</Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'KPI Name (English)', ar: 'اسم المؤشر (إنجليزي)' })}</Label>
                  <Input
                    value={proposedKpi.name_en || ''}
                    onChange={(e) => updateProposedKpiField('name_en', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'KPI Name (Arabic)', ar: 'اسم المؤشر (عربي)' })}</Label>
                  <Input
                    dir="rtl"
                    value={proposedKpi.name_ar || ''}
                    onChange={(e) => updateProposedKpiField('name_ar', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
                  <Select
                    value={proposedKpi.category || 'outcome'}
                    onValueChange={(v) => updateProposedKpiField('category', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KPI_CATEGORIES.map(cat => (
                        <SelectItem key={cat.code} value={cat.code}>
                          {language === 'ar' ? cat.name_ar : cat.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Linked Objective', ar: 'الهدف المرتبط' })}</Label>
                  <Select
                    value={proposedKpi.objective_index?.toString() || ''}
                    onValueChange={(v) => updateProposedKpiField('objective_index', v ? parseInt(v) : null)}
                  >
                    <SelectTrigger><SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} /></SelectTrigger>
                    <SelectContent>
                      {objectives.map((obj, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          #{i + 1}: {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Unit', ar: 'الوحدة' })}</Label>
                  <Input
                    value={proposedKpi.unit || ''}
                    onChange={(e) => updateProposedKpiField('unit', e.target.value)}
                    placeholder="%"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Baseline', ar: 'خط الأساس' })}</Label>
                  <Input
                    value={proposedKpi.baseline_value || ''}
                    onChange={(e) => updateProposedKpiField('baseline_value', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Target', ar: 'المستهدف' })}</Label>
                  <Input
                    value={proposedKpi.target_value || ''}
                    onChange={(e) => updateProposedKpiField('target_value', e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Frequency', ar: 'التكرار' })}</Label>
                  <Select
                    value={proposedKpi.frequency || 'quarterly'}
                    onValueChange={(v) => updateProposedKpiField('frequency', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map(freq => (
                        <SelectItem key={freq.code} value={freq.code}>
                          {language === 'ar' ? freq.name_ar : freq.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Data Source', ar: 'مصدر البيانات' })}</Label>
                  <Input
                    value={proposedKpi.data_source || ''}
                    onChange={(e) => updateProposedKpiField('data_source', e.target.value)}
                    placeholder={t({ en: 'e.g., Balady Platform', ar: 'مثال: منصة بلدي' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Owner', ar: 'المسؤول' })}</Label>
                  <Input
                    value={proposedKpi.owner || ''}
                    onChange={(e) => updateProposedKpiField('owner', e.target.value)}
                    placeholder={t({ en: 'e.g., Performance Unit', ar: 'مثال: وحدة الأداء' })}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleGenerateSingleKpi()} disabled={isGeneratingSingle}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t({ en: 'Regenerate', ar: 'إعادة الإنشاء' })}
            </Button>
            <Button variant="outline" onClick={() => setShowProposalModal(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleApproveKpi} disabled={!proposedKpi}>
              <Check className="w-4 h-4 mr-2" />
              {t({ en: 'Add KPI', ar: 'إضافة المؤشر' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
