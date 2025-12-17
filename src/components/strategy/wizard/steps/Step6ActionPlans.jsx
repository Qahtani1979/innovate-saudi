import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, Loader2, Plus, X, Lightbulb, ChevronDown, ChevronUp, Zap,
  Target, Calendar, DollarSign, Users, ArrowRight, Layers, Beaker,
  Rocket, Globe, Building2, Scale, FlaskConical, Handshake, TestTube,
  BarChart3, GanttChartSquare, ListTree, AlertTriangle, Link2, TrendingUp,
  PieChart, CheckCircle2, Clock, FileText, Info, User
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '../../../LanguageContext';
import EntityGenerationPanel from '../EntityGenerationPanel';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart } from '../shared';

// Enhanced entity type configuration
const ENTITY_TYPES = [
  { 
    value: 'challenge', 
    label_en: 'Innovation Challenge', 
    label_ar: 'تحدي ابتكاري',
    description_en: 'Open innovation call for solutions',
    description_ar: 'دعوة مفتوحة للحلول المبتكرة',
    icon: Lightbulb,
    color: 'bg-red-100 text-red-700 border-red-200',
    bgLight: 'bg-red-50',
    innovation_weight: 0.9
  },
  { 
    value: 'pilot', 
    label_en: 'Pilot Project', 
    label_ar: 'مشروع تجريبي',
    description_en: 'Small-scale test before full rollout',
    description_ar: 'اختبار صغير النطاق قبل التنفيذ الكامل',
    icon: Beaker,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    bgLight: 'bg-orange-50',
    innovation_weight: 0.85
  },
  { 
    value: 'program', 
    label_en: 'Strategic Program', 
    label_ar: 'برنامج استراتيجي',
    description_en: 'Multi-year transformation initiative',
    description_ar: 'مبادرة تحويلية متعددة السنوات',
    icon: Layers,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    bgLight: 'bg-purple-50',
    innovation_weight: 0.7
  },
  { 
    value: 'campaign', 
    label_en: 'Awareness Campaign', 
    label_ar: 'حملة توعوية',
    description_en: 'Communication and engagement initiative',
    description_ar: 'مبادرة تواصل ومشاركة',
    icon: Globe,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    bgLight: 'bg-pink-50',
    innovation_weight: 0.4
  },
  { 
    value: 'event', 
    label_en: 'Innovation Event', 
    label_ar: 'فعالية ابتكارية',
    description_en: 'Hackathon, demo day, or showcase',
    description_ar: 'هاكاثون أو يوم عرض أو معرض',
    icon: Rocket,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    bgLight: 'bg-blue-50',
    innovation_weight: 0.75
  },
  { 
    value: 'policy', 
    label_en: 'Policy Framework', 
    label_ar: 'إطار سياسي',
    description_en: 'Regulatory or governance update',
    description_ar: 'تحديث تنظيمي أو حوكمة',
    icon: Scale,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    bgLight: 'bg-slate-50',
    innovation_weight: 0.5
  },
  { 
    value: 'rd_call', 
    label_en: 'R&D Initiative', 
    label_ar: 'مبادرة بحث وتطوير',
    description_en: 'Research partnership with academia',
    description_ar: 'شراكة بحثية مع الأكاديميين',
    icon: FlaskConical,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bgLight: 'bg-emerald-50',
    innovation_weight: 1.0
  },
  { 
    value: 'partnership', 
    label_en: 'Strategic Partnership', 
    label_ar: 'شراكة استراتيجية',
    description_en: 'Collaboration with external entity',
    description_ar: 'تعاون مع جهة خارجية',
    icon: Handshake,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    bgLight: 'bg-cyan-50',
    innovation_weight: 0.65
  },
  { 
    value: 'living_lab', 
    label_en: 'Living Lab', 
    label_ar: 'مختبر حي',
    description_en: 'Real-world innovation testbed',
    description_ar: 'بيئة اختبار ابتكارية حقيقية',
    icon: TestTube,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    bgLight: 'bg-amber-50',
    innovation_weight: 0.95
  },
];

const PRIORITY_CONFIG = {
  high: { label_en: 'High', label_ar: 'عالي', color: 'bg-red-100 text-red-700 border-red-200', weight: 3 },
  medium: { label_en: 'Medium', label_ar: 'متوسط', color: 'bg-amber-100 text-amber-700 border-amber-200', weight: 2 },
  low: { label_en: 'Low', label_ar: 'منخفض', color: 'bg-green-100 text-green-700 border-green-200', weight: 1 }
};

const IMPACT_LEVELS = [
  { value: 1, label_en: 'Incremental', label_ar: 'تدريجي', description_en: 'Small improvements' },
  { value: 2, label_en: 'Moderate', label_ar: 'معتدل', description_en: 'Notable enhancements' },
  { value: 3, label_en: 'Significant', label_ar: 'كبير', description_en: 'Major transformation' },
  { value: 4, label_en: 'Breakthrough', label_ar: 'اختراق', description_en: 'Game-changing innovation' },
];

// Calculate individual action plan completeness
const calculateActionCompleteness = (ap) => {
  const fields = [
    { key: 'name_en', weight: 15 },
    { key: 'name_ar', weight: 10 },
    { key: 'description_en', weight: 10 },
    { key: 'type', weight: 10 },
    { key: 'priority', weight: 5 },
    { key: 'objective_index', weight: 15, check: (v) => v !== null && v !== undefined },
    { key: 'budget_estimate', weight: 10 },
    { key: 'start_date', weight: 5 },
    { key: 'end_date', weight: 5 },
    { key: 'owner', weight: 5 },
    { key: 'success_criteria_en', weight: 5 },
    { key: 'deliverables', weight: 5, check: (v) => Array.isArray(v) && v.length > 0 }
  ];
  
  let score = 0;
  fields.forEach(({ key, weight, check }) => {
    const value = ap[key];
    const passed = check ? check(value) : (value && value !== '');
    if (passed) score += weight;
  });
  
  return Math.round(score);
};

export default function Step6ActionPlans({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  strategicPlanId,
  wizardData,
  isReadOnly = false
}) {
  const { language, t, isRTL } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [viewMode, setViewMode] = useState('objectives');
  
  const objectives = data.objectives || [];
  const actionPlans = data.action_plans || [];
  const risks = data.risks || [];

  // Portfolio statistics
  const portfolioStats = useMemo(() => {
    const totalBudget = actionPlans.reduce((sum, ap) => {
      const budget = parseFloat(String(ap.budget_estimate || '0').replace(/[^0-9.-]/g, ''));
      return sum + (isNaN(budget) ? 0 : budget);
    }, 0);

    const byType = ENTITY_TYPES.reduce((acc, et) => {
      acc[et.value] = actionPlans.filter(ap => ap.type === et.value).length;
      return acc;
    }, {});

    const byPriority = {
      high: actionPlans.filter(ap => ap.priority === 'high').length,
      medium: actionPlans.filter(ap => ap.priority === 'medium').length,
      low: actionPlans.filter(ap => ap.priority === 'low').length
    };

    const innovationScore = actionPlans.length > 0 
      ? actionPlans.reduce((sum, ap) => {
          const typeConfig = ENTITY_TYPES.find(et => et.value === ap.type);
          const impactWeight = (ap.innovation_impact || 2) / 4;
          return sum + (typeConfig?.innovation_weight || 0.5) * impactWeight;
        }, 0) / actionPlans.length * 100
      : 0;

    const objectiveCoverage = objectives.length > 0
      ? (objectives.filter((_, i) => actionPlans.some(ap => ap.objective_index === i)).length / objectives.length) * 100
      : 0;

    const queuedForGeneration = actionPlans.filter(ap => ap.should_create_entity).length;
    
    const avgCompleteness = actionPlans.length > 0
      ? actionPlans.reduce((sum, ap) => sum + calculateActionCompleteness(ap), 0) / actionPlans.length
      : 0;

    const withOwner = actionPlans.filter(ap => ap.owner && ap.owner !== '').length;
    const withTimeline = actionPlans.filter(ap => ap.start_date && ap.end_date).length;
    const withDeliverables = actionPlans.filter(ap => ap.deliverables?.length > 0).length;

    return {
      total: actionPlans.length,
      totalBudget,
      byType,
      byPriority,
      innovationScore: Math.round(innovationScore),
      objectiveCoverage: Math.round(objectiveCoverage),
      queuedForGeneration,
      avgCompleteness: Math.round(avgCompleteness),
      withOwner,
      withTimeline,
      withDeliverables
    };
  }, [actionPlans, objectives]);

  // Calculate overall completeness
  const overallCompleteness = useMemo(() => {
    if (objectives.length === 0) return 0;
    
    let score = 0;
    // Has action plans (30%)
    if (actionPlans.length > 0) score += 30;
    // Average action completeness (30%)
    score += (portfolioStats.avgCompleteness / 100) * 30;
    // Objective coverage (20%)
    score += (portfolioStats.objectiveCoverage / 100) * 20;
    // Has timeline data (10%)
    if (portfolioStats.withTimeline > 0) score += 10;
    // Has budgets (10%)
    if (portfolioStats.totalBudget > 0) score += 10;
    
    return Math.round(score);
  }, [actionPlans, objectives, portfolioStats]);

  // Timeline data
  const timelineData = useMemo(() => {
    const planStart = parseInt(wizardData?.start_year) || new Date().getFullYear();
    const planEnd = parseInt(wizardData?.end_year) || planStart + 5;
    
    return actionPlans.map(ap => {
      const startDate = ap.start_date ? new Date(ap.start_date) : null;
      const endDate = ap.end_date ? new Date(ap.end_date) : null;
      
      return {
        ...ap,
        startYear: startDate ? startDate.getFullYear() : planStart,
        endYear: endDate ? endDate.getFullYear() : planEnd,
        startMonth: startDate ? startDate.getMonth() + 1 : 1,
        endMonth: endDate ? endDate.getMonth() + 1 : 12
      };
    });
  }, [actionPlans, wizardData]);

  // Alerts
  const alerts = useMemo(() => {
    const items = [];
    
    const uncoveredObjectives = objectives.length - objectives.filter((_, i) => 
      actionPlans.some(ap => ap.objective_index === i)
    ).length;
    
    if (uncoveredObjectives > 0) {
      items.push({
        type: 'warning',
        icon: AlertTriangle,
        message: t({ 
          en: `${uncoveredObjectives} objective(s) without action plans`, 
          ar: `${uncoveredObjectives} هدف(أهداف) بدون خطط عمل` 
        })
      });
    }
    
    if (portfolioStats.withOwner < actionPlans.length && actionPlans.length > 0) {
      items.push({
        type: 'info',
        icon: User,
        message: t({ 
          en: `${actionPlans.length - portfolioStats.withOwner} action(s) missing owners`, 
          ar: `${actionPlans.length - portfolioStats.withOwner} إجراء(ات) بدون مسؤول` 
        })
      });
    }
    
    if (portfolioStats.withTimeline < actionPlans.length && actionPlans.length > 0) {
      items.push({
        type: 'info',
        icon: Calendar,
        message: t({ 
          en: `${actionPlans.length - portfolioStats.withTimeline} action(s) missing timeline`, 
          ar: `${actionPlans.length - portfolioStats.withTimeline} إجراء(ات) بدون جدول زمني` 
        })
      });
    }
    
    return items;
  }, [actionPlans, objectives, portfolioStats, t]);

  const addActionPlan = (objectiveIndex = null) => {
    if (isReadOnly) return;
    const planStart = wizardData?.start_year || new Date().getFullYear();
    onChange({
      action_plans: [...actionPlans, {
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        objective_index: objectiveIndex,
        type: 'challenge',
        priority: 'medium',
        budget_estimate: '',
        start_date: `${planStart}-01`,
        end_date: '',
        owner: '',
        deliverables: [],
        dependencies: [],
        innovation_impact: 2,
        linked_risks: [],
        success_criteria_en: '',
        success_criteria_ar: '',
        should_create_entity: false
      }]
    });
    setExpandedIndex(actionPlans.length);
  };

  const updateActionPlan = (index, updates) => {
    if (isReadOnly) return;
    const updated = actionPlans.map((ap, i) => 
      i === index ? { ...ap, ...updates } : ap
    );
    onChange({ action_plans: updated });
  };

  const removeActionPlan = (index) => {
    if (isReadOnly) return;
    onChange({ action_plans: actionPlans.filter((_, i) => i !== index) });
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const getActionPlansForObjective = (objectiveIndex) => {
    return actionPlans.filter(ap => ap.objective_index === objectiveIndex);
  };

  const getTypeConfig = (type) => {
    return ENTITY_TYPES.find(et => et.value === type) || ENTITY_TYPES[0];
  };

  const formatBudget = (value) => {
    const num = parseFloat(String(value || '0').replace(/[^0-9.-]/g, ''));
    if (isNaN(num) || num === 0) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M SAR`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K SAR`;
    return `${num.toLocaleString()} SAR`;
  };

  const isFieldComplete = (value, checkFn = null) => {
    if (checkFn) return checkFn(value);
    return value && value !== '';
  };

  const renderActionCard = (ap, apIndex, showObjective = false) => {
    const typeConfig = getTypeConfig(ap.type);
    const IconComponent = typeConfig.icon;
    const objective = objectives[ap.objective_index];
    const completeness = calculateActionCompleteness(ap);
    
    return (
      <Collapsible key={apIndex} open={expandedIndex === apIndex}>
        <div className={`border rounded-lg ${typeConfig.bgLight}`}>
          <CollapsibleTrigger asChild>
            <div 
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedIndex(expandedIndex === apIndex ? null : apIndex)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm line-clamp-1">
                      {ap.name_en || t({ en: 'Untitled Action', ar: 'إجراء بدون عنوان' })}
                    </span>
                    <Badge variant="outline" className={`text-xs ${typeConfig.color}`}>
                      {language === 'ar' ? typeConfig.label_ar : typeConfig.label_en}
                    </Badge>
                  </div>
                  {showObjective && objective && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      <Target className="h-3 w-3 inline mr-1" />
                      {language === 'ar' ? (objective.name_ar || objective.name_en) : objective.name_en}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${PRIORITY_CONFIG[ap.priority]?.color || 'bg-muted'}`}>
                  {language === 'ar' 
                    ? PRIORITY_CONFIG[ap.priority]?.label_ar 
                    : PRIORITY_CONFIG[ap.priority]?.label_en}
                </Badge>
                {ap.budget_estimate && (
                  <Badge variant="outline" className="text-xs hidden sm:flex">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatBudget(ap.budget_estimate)}
                  </Badge>
                )}
                {ap.should_create_entity && (
                  <Badge className="bg-primary/20 text-primary text-xs">
                    <Zap className="h-3 w-3" />
                  </Badge>
                )}
                <div className="w-12 hidden md:block">
                  <Progress value={completeness} className="h-1.5" />
                </div>
                {expandedIndex === apIndex ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}</Label>
                  <Input
                    value={ap.name_en}
                    onChange={(e) => updateActionPlan(apIndex, { name_en: e.target.value })}
                    dir="ltr"
                    placeholder="Smart Parking Pilot Program"
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.name_en) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}</Label>
                  <Input
                    value={ap.name_ar}
                    onChange={(e) => updateActionPlan(apIndex, { name_ar: e.target.value })}
                    dir="rtl"
                    placeholder="برنامج مواقف السيارات الذكية التجريبي"
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.name_ar) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Description (EN)', ar: 'الوصف (إنجليزي)' })}</Label>
                  <Textarea
                    value={ap.description_en}
                    onChange={(e) => updateActionPlan(apIndex, { description_en: e.target.value })}
                    rows={2}
                    dir="ltr"
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.description_en) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Description (AR)', ar: 'الوصف (عربي)' })}</Label>
                  <Textarea
                    value={ap.description_ar}
                    onChange={(e) => updateActionPlan(apIndex, { description_ar: e.target.value })}
                    rows={2}
                    dir="rtl"
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.description_ar) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
              </div>

              {/* Type, Priority, Objective */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Action Type', ar: 'نوع الإجراء' })}</Label>
                  <Select 
                    value={ap.type} 
                    onValueChange={(v) => updateActionPlan(apIndex, { type: v })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={`h-9 ${isFieldComplete(ap.type) ? 'border-green-300 bg-green-50/50' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map(et => {
                        const Icon = et.icon;
                        return (
                          <SelectItem key={et.value} value={et.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{language === 'ar' ? et.label_ar : et.label_en}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                  <Select 
                    value={ap.priority} 
                    onValueChange={(v) => updateActionPlan(apIndex, { priority: v })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={`h-9 ${isFieldComplete(ap.priority) ? 'border-green-300 bg-green-50/50' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          {language === 'ar' ? cfg.label_ar : cfg.label_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Linked Objective', ar: 'الهدف المرتبط' })}</Label>
                  <Select 
                    value={String(ap.objective_index ?? '')} 
                    onValueChange={(v) => updateActionPlan(apIndex, { objective_index: v === '' ? null : parseInt(v) })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={`h-9 ${isFieldComplete(ap.objective_index, (v) => v !== null && v !== undefined) ? 'border-green-300 bg-green-50/50' : ''}`}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t({ en: 'No objective', ar: 'بدون هدف' })}
                      </SelectItem>
                      {objectives.map((obj, i) => (
                        <SelectItem key={i} value={String(i)}>
                          #{i + 1}: {(language === 'ar' ? obj.name_ar : obj.name_en)?.substring(0, 40)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Owner / Lead', ar: 'المسؤول' })}</Label>
                  <Input
                    value={ap.owner}
                    onChange={(e) => updateActionPlan(apIndex, { owner: e.target.value })}
                    placeholder="IT Directorate"
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.owner) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
              </div>

              {/* Innovation Impact Slider */}
              <div className="p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {t({ en: 'Innovation Impact', ar: 'تأثير الابتكار' })}
                  </Label>
                  <span className="text-sm font-semibold text-primary">
                    {IMPACT_LEVELS.find(l => l.value === (ap.innovation_impact || 2))?.label_en || 'Moderate'}
                  </span>
                </div>
                <Slider
                  value={[ap.innovation_impact || 2]}
                  onValueChange={([v]) => updateActionPlan(apIndex, { innovation_impact: v })}
                  min={1}
                  max={4}
                  step={1}
                  className="w-full"
                  disabled={isReadOnly}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>{t({ en: 'Incremental', ar: 'تدريجي' })}</span>
                  <span>{t({ en: 'Breakthrough', ar: 'اختراق' })}</span>
                </div>
              </div>

              {/* Budget and Timeline */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</Label>
                  <Input
                    value={ap.budget_estimate}
                    onChange={(e) => updateActionPlan(apIndex, { budget_estimate: e.target.value })}
                    placeholder="1,000,000"
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.budget_estimate) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Start Date', ar: 'تاريخ البداية' })}</Label>
                  <Input
                    type="month"
                    value={ap.start_date}
                    onChange={(e) => updateActionPlan(apIndex, { start_date: e.target.value })}
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.start_date) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'End Date', ar: 'تاريخ النهاية' })}</Label>
                  <Input
                    type="month"
                    value={ap.end_date}
                    onChange={(e) => updateActionPlan(apIndex, { end_date: e.target.value })}
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.end_date) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Linked Risks', ar: 'المخاطر المرتبطة' })}</Label>
                  <Select 
                    value={(ap.linked_risks || [])[0] || ''} 
                    onValueChange={(v) => updateActionPlan(apIndex, { linked_risks: v ? [v] : [] })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={t({ en: 'Select risk...', ar: 'اختر المخاطر...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {risks.length === 0 ? (
                        <SelectItem value="" disabled>
                          {t({ en: 'No risks defined (Step 7)', ar: 'لم يتم تحديد مخاطر (الخطوة 7)' })}
                        </SelectItem>
                      ) : (
                        risks.slice(0, 10).map((risk, i) => (
                          <SelectItem key={i} value={risk.id || String(i)}>
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            {(language === 'ar' ? risk.title_ar : risk.title_en)?.substring(0, 30)}...
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Success Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Success Criteria (EN)', ar: 'معايير النجاح (إنجليزي)' })}</Label>
                  <Textarea
                    value={ap.success_criteria_en || ''}
                    onChange={(e) => updateActionPlan(apIndex, { success_criteria_en: e.target.value })}
                    rows={2}
                    dir="ltr"
                    placeholder="Measurable outcomes that define success..."
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.success_criteria_en) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Success Criteria (AR)', ar: 'معايير النجاح (عربي)' })}</Label>
                  <Textarea
                    value={ap.success_criteria_ar || ''}
                    onChange={(e) => updateActionPlan(apIndex, { success_criteria_ar: e.target.value })}
                    rows={2}
                    dir="rtl"
                    placeholder="النتائج القابلة للقياس..."
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.success_criteria_ar) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
              </div>

              {/* Deliverables and Dependencies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Deliverables (one per line)', ar: 'المخرجات (كل عنصر في سطر)' })}</Label>
                  <Textarea
                    value={(ap.deliverables || []).join('\n')}
                    onChange={(e) => updateActionPlan(apIndex, { deliverables: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                    rows={3}
                    placeholder="Platform deployment&#10;User training&#10;Documentation"
                    disabled={isReadOnly}
                    className={isFieldComplete(ap.deliverables, (v) => Array.isArray(v) && v.length > 0) ? 'border-green-300 bg-green-50/50' : ''}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Dependencies (one per line)', ar: 'التبعيات (كل عنصر في سطر)' })}</Label>
                  <Textarea
                    value={(ap.dependencies || []).join('\n')}
                    onChange={(e) => updateActionPlan(apIndex, { dependencies: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                    rows={3}
                    placeholder="IT infrastructure ready&#10;Budget approval&#10;Vendor selection"
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {/* Entity Generation Toggle */}
              {!isReadOnly && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <div>
                      <Label className="text-sm font-medium">{t({ en: 'Auto-Create Entity', ar: 'إنشاء كيان تلقائياً' })}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t({ en: 'Queue for automatic entity generation after plan approval', ar: 'إضافة للقائمة للإنشاء التلقائي بعد اعتماد الخطة' })}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={ap.should_create_entity || false}
                    onCheckedChange={(checked) => updateActionPlan(apIndex, { should_create_entity: checked })}
                  />
                </div>
              )}

              {!isReadOnly && (
                <div className="flex justify-end">
                  <Button size="sm" variant="destructive" onClick={() => removeActionPlan(apIndex)}>
                    <X className="h-4 w-4 mr-1" />
                    {t({ en: 'Remove Action', ar: 'حذف الإجراء' })}
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Entity Generation Panel */}
      {strategicPlanId && (
        <EntityGenerationPanel
          strategicPlanId={strategicPlanId}
          actionPlans={actionPlans}
          objectives={objectives}
          wizardData={wizardData || data}
          onEntitiesGenerated={() => {}}
        />
      )}

      {/* Dashboard Header */}
      <StepDashboardHeader
        score={overallCompleteness}
        title={t({ en: 'Action Plans', ar: 'خطط العمل' })}
        subtitle={t({ en: 'Define initiatives and projects to achieve objectives', ar: 'حدد المبادرات والمشاريع لتحقيق الأهداف' })}
        language={language}
        stats={[
          { value: portfolioStats.total, label: t({ en: 'Total Actions', ar: 'إجمالي الإجراءات' }), icon: Layers, iconColor: 'text-primary' },
          { value: formatBudget(portfolioStats.totalBudget), label: t({ en: 'Total Budget', ar: 'إجمالي الميزانية' }), icon: DollarSign, iconColor: 'text-emerald-600', valueColor: 'text-emerald-600' },
          { value: `${portfolioStats.objectiveCoverage}%`, label: t({ en: 'Coverage', ar: 'التغطية' }), icon: Target, iconColor: 'text-amber-600', valueColor: 'text-amber-600' },
          { value: portfolioStats.byPriority.high, label: t({ en: 'High Priority', ar: 'أولوية عالية' }), icon: AlertTriangle, iconColor: 'text-red-600', valueColor: 'text-red-600' }
        ]}
      />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Alert key={i} variant={alert.type === 'warning' ? 'destructive' : 'default'} className={alert.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}>
              <alert.icon className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {objectives.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t({ en: 'Please define objectives first (Step 9) before creating action plans.', ar: 'يرجى تحديد الأهداف أولاً (الخطوة 9) قبل إنشاء خطط العمل.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="objectives" className="flex items-center gap-1">
                <ListTree className="h-4 w-4" />
                {t({ en: 'By Objective', ar: 'حسب الهدف' })}
              </TabsTrigger>
              <TabsTrigger value="types" className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                {t({ en: 'By Type', ar: 'حسب النوع' })}
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="flex items-center gap-1">
                <GanttChartSquare className="h-4 w-4" />
                {t({ en: 'Roadmap', ar: 'خارطة الطريق' })}
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-1">
                <PieChart className="h-4 w-4" />
                {t({ en: 'Summary', ar: 'الملخص' })}
              </TabsTrigger>
            </TabsList>

            {/* By Objective View */}
            <TabsContent value="objectives" className="space-y-4 mt-4">
              {objectives.map((obj, objIndex) => {
                const objActions = getActionPlansForObjective(objIndex);
                return (
                  <Card key={objIndex}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="outline" className="text-primary">#{objIndex + 1}</Badge>
                          <span className="line-clamp-1">{language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}</span>
                          <Badge variant="secondary" className="ml-2">{objActions.length}</Badge>
                        </CardTitle>
                        {!isReadOnly && (
                          <Button size="sm" variant="outline" onClick={() => addActionPlan(objIndex)}>
                            <Plus className="h-4 w-4 mr-1" />
                            {t({ en: 'Add', ar: 'إضافة' })}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {objActions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {t({ en: 'No actions for this objective yet', ar: 'لا توجد إجراءات لهذا الهدف بعد' })}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {objActions.map((ap) => {
                            const apIndex = actionPlans.indexOf(ap);
                            return renderActionCard(ap, apIndex, false);
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Unassigned Actions */}
              {actionPlans.filter(ap => ap.objective_index === null || ap.objective_index === undefined).length > 0 && (
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
                      <Link2 className="h-4 w-4" />
                      {t({ en: 'Unassigned Actions', ar: 'إجراءات غير مرتبطة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {actionPlans.filter(ap => ap.objective_index === null || ap.objective_index === undefined).map((ap) => {
                        const apIndex = actionPlans.indexOf(ap);
                        return renderActionCard(ap, apIndex, false);
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* By Type View */}
            <TabsContent value="types" className="space-y-4 mt-4">
              {ENTITY_TYPES.filter(et => portfolioStats.byType[et.value] > 0).map(et => {
                const typeActions = actionPlans.filter(ap => ap.type === et.value);
                const Icon = et.icon;
                return (
                  <Card key={et.value} className={et.bgLight}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${et.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span>{language === 'ar' ? et.label_ar : et.label_en}</span>
                          <Badge variant="secondary">{typeActions.length}</Badge>
                        </CardTitle>
                        {!isReadOnly && (
                          <Button size="sm" variant="outline" onClick={() => {
                            const newAp = {
                              name_en: '',
                              name_ar: '',
                              description_en: '',
                              description_ar: '',
                              type: et.value,
                              priority: 'medium',
                              objective_index: null,
                              budget_estimate: '',
                              start_date: '',
                              end_date: '',
                              owner: '',
                              deliverables: [],
                              dependencies: [],
                              innovation_impact: 2,
                              linked_risks: [],
                              success_criteria_en: '',
                              success_criteria_ar: '',
                              should_create_entity: false
                            };
                            onChange({ action_plans: [...actionPlans, newAp] });
                            setExpandedIndex(actionPlans.length);
                          }}>
                            <Plus className="h-4 w-4 mr-1" />
                            {t({ en: 'Add', ar: 'إضافة' })}
                          </Button>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {language === 'ar' ? et.description_ar : et.description_en}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {typeActions.map((ap) => {
                          const apIndex = actionPlans.indexOf(ap);
                          return renderActionCard(ap, apIndex, true);
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add new type */}
              {!isReadOnly && ENTITY_TYPES.filter(et => portfolioStats.byType[et.value] === 0).length > 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-6">
                    <p className="text-sm text-muted-foreground text-center mb-3">
                      {t({ en: 'Add actions of other types:', ar: 'إضافة إجراءات من أنواع أخرى:' })}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {ENTITY_TYPES.filter(et => portfolioStats.byType[et.value] === 0).map(et => {
                        const Icon = et.icon;
                        return (
                          <Button 
                            key={et.value} 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              onChange({ action_plans: [...actionPlans, {
                                name_en: '',
                                name_ar: '',
                                description_en: '',
                                description_ar: '',
                                type: et.value,
                                priority: 'medium',
                                objective_index: null,
                                budget_estimate: '',
                                start_date: '',
                                end_date: '',
                                owner: '',
                                deliverables: [],
                                dependencies: [],
                                innovation_impact: 2,
                                linked_risks: [],
                                success_criteria_en: '',
                                success_criteria_ar: '',
                                should_create_entity: false
                              }] });
                              setExpandedIndex(actionPlans.length);
                            }}
                          >
                            <Icon className="h-4 w-4 mr-1" />
                            {language === 'ar' ? et.label_ar : et.label_en}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Roadmap View */}
            <TabsContent value="roadmap" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GanttChartSquare className="h-5 w-5 text-primary" />
                    {t({ en: 'Action Timeline', ar: 'الجدول الزمني للإجراءات' })}
                  </CardTitle>
                  <CardDescription>
                    {t({ 
                      en: `${wizardData?.start_year || 2025} - ${wizardData?.end_year || 2030} Strategic Plan Timeline`, 
                      ar: `${wizardData?.start_year || 2025} - ${wizardData?.end_year || 2030} الجدول الزمني للخطة الاستراتيجية` 
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {actionPlans.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t({ en: 'No actions to display. Generate or add actions first.', ar: 'لا توجد إجراءات للعرض. قم بإنشاء أو إضافة إجراءات أولاً.' })}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {/* Year headers */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-48 shrink-0" />
                        {Array.from({ length: (wizardData?.end_year || 2030) - (wizardData?.start_year || 2025) + 1 }, (_, i) => (
                          <div key={i} className="flex-1 text-center text-xs font-medium text-muted-foreground border-l first:border-l-0">
                            {(wizardData?.start_year || 2025) + i}
                          </div>
                        ))}
                      </div>
                      
                      {/* Action bars */}
                      {timelineData.map((ap, i) => {
                        const typeConfig = getTypeConfig(ap.type);
                        const Icon = typeConfig.icon;
                        const totalYears = (wizardData?.end_year || 2030) - (wizardData?.start_year || 2025) + 1;
                        const startOffset = ((ap.startYear - (wizardData?.start_year || 2025)) / totalYears) * 100;
                        const duration = ((ap.endYear - ap.startYear + 1) / totalYears) * 100;
                        
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-48 shrink-0 flex items-center gap-2">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="text-xs line-clamp-1">
                                {ap.name_en || t({ en: 'Untitled', ar: 'بدون عنوان' })}
                              </span>
                            </div>
                            <div className="flex-1 relative h-6 bg-muted/30 rounded">
                              <div 
                                className={`absolute h-full rounded ${typeConfig.color} flex items-center justify-center`}
                                style={{ 
                                  left: `${Math.max(0, startOffset)}%`, 
                                  width: `${Math.min(100 - startOffset, duration)}%` 
                                }}
                              >
                                <span className="text-[10px] font-medium truncate px-1">
                                  {ap.startYear}-{ap.endYear}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary View - Using Shared Components */}
            <TabsContent value="summary" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority Distribution */}
                <DistributionChart
                  title={t({ en: 'Priority Distribution', ar: 'توزيع الأولوية' })}
                  language={language}
                  data={Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => ({
                    label: { en: cfg.label_en, ar: cfg.label_ar },
                    value: portfolioStats.byPriority[key] || 0,
                    icon: AlertTriangle,
                    iconColor: cfg.color.split(' ')[0]
                  }))}
                />

                {/* Objective Coverage */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t({ en: 'Objective Coverage', ar: 'تغطية الأهداف' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {objectives.map((obj, i) => {
                        const count = getActionPlansForObjective(i).length;
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge variant="outline" className="font-mono text-xs shrink-0">#{i + 1}</Badge>
                              <span className="text-sm truncate">
                                {language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}
                              </span>
                            </div>
                            <Badge variant={count > 0 ? 'default' : 'secondary'} className="shrink-0">
                              {count} {t({ en: 'actions', ar: 'إجراءات' })}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Data Completeness */}
                <QualityMetrics
                  title={t({ en: 'Data Completeness', ar: 'اكتمال البيانات' })}
                  language={language}
                  metrics={[
                    { 
                      value: `${portfolioStats.withOwner}/${portfolioStats.total}`, 
                      label: { en: 'With Owner', ar: 'مع مسؤول' },
                      icon: User,
                      iconColor: portfolioStats.withOwner === portfolioStats.total ? 'text-green-600' : 'text-amber-600'
                    },
                    { 
                      value: `${portfolioStats.withTimeline}/${portfolioStats.total}`, 
                      label: { en: 'With Timeline', ar: 'مع جدول زمني' },
                      icon: Calendar,
                      iconColor: portfolioStats.withTimeline === portfolioStats.total ? 'text-green-600' : 'text-amber-600'
                    },
                    { 
                      value: `${portfolioStats.withDeliverables}/${portfolioStats.total}`, 
                      label: { en: 'With Deliverables', ar: 'مع مخرجات' },
                      icon: FileText,
                      iconColor: portfolioStats.withDeliverables === portfolioStats.total ? 'text-green-600' : 'text-amber-600'
                    },
                    { 
                      value: `${portfolioStats.withBudget}/${portfolioStats.total}`, 
                      label: { en: 'With Budget', ar: 'مع ميزانية' },
                      icon: DollarSign,
                      iconColor: portfolioStats.withBudget === portfolioStats.total ? 'text-green-600' : 'text-amber-600'
                    }
                  ]}
                />

                {/* Recommendations */}
                <RecommendationsCard
                  title={t({ en: 'Recommendations', ar: 'التوصيات' })}
                  language={language}
                  recommendations={[
                    ...(portfolioStats.objectiveCoverage < 100 ? [{
                      type: 'warning',
                      message: { 
                        en: 'Add action plans for all objectives to ensure complete coverage.',
                        ar: 'أضف خطط عمل لجميع الأهداف لضمان التغطية الكاملة.'
                      }
                    }] : []),
                    ...(portfolioStats.innovationScore < 50 && portfolioStats.total > 0 ? [{
                      type: 'info',
                      message: { 
                        en: 'Consider adding more innovation-focused actions (R&D, pilots, living labs).',
                        ar: 'فكر في إضافة المزيد من الإجراءات المركزة على الابتكار.'
                      }
                    }] : []),
                    ...(portfolioStats.withOwner < portfolioStats.total && portfolioStats.total > 0 ? [{
                      type: 'info',
                      message: { 
                        en: `Assign owners to ${portfolioStats.total - portfolioStats.withOwner} action(s) to ensure accountability.`,
                        ar: `عيّن مسؤولين لـ ${portfolioStats.total - portfolioStats.withOwner} إجراء(ات) لضمان المساءلة.`
                      }
                    }] : []),
                    ...(portfolioStats.total === 0 ? [{
                      type: 'info',
                      message: { 
                        en: 'Start by using AI generation or manually adding action plans for each objective.',
                        ar: 'ابدأ باستخدام الذكاء الاصطناعي أو إضافة خطط العمل يدوياً لكل هدف.'
                      }
                    }] : [])
                  ]}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Add Button */}
          {!isReadOnly && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => addActionPlan(null)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t({ en: 'Add New Action', ar: 'إضافة إجراء جديد' })}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
