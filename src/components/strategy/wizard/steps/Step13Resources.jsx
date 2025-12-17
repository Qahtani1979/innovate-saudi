import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Sparkles, Loader2, DollarSign, Users, Cpu, Building, Plus, X, 
  BarChart3, PieChart, Briefcase, GraduationCap, ChevronUp, ChevronDown,
  Server, Cloud, Database, Wifi, Monitor, Shield, Code, Brain,
  Calendar, Target, Layers, CheckCircle2, AlertCircle, AlertTriangle,
  Lightbulb, Link2, Percent, TrendingUp
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import EntityAllocationSelector from '../EntityAllocationSelector';
import { cn } from '@/lib/utils';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, MainAIGeneratorCard } from '../shared';

// HR skill categories
const HR_CATEGORIES = [
  { value: 'technical', label_en: 'Technical Staff', label_ar: 'كادر تقني', icon: Code, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'management', label_en: 'Management', label_ar: 'إدارة', icon: Briefcase, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'innovation', label_en: 'Innovation/R&D', label_ar: 'ابتكار وبحث', icon: Brain, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'support', label_en: 'Support Staff', label_ar: 'كادر دعم', icon: Users, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'external', label_en: 'External/Consultants', label_ar: 'خارجي/استشاريين', icon: GraduationCap, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
];

// Technology categories
const TECH_CATEGORIES = [
  { value: 'software', label_en: 'Software/Licenses', label_ar: 'برمجيات/تراخيص', icon: Monitor, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'cloud', label_en: 'Cloud Services', label_ar: 'خدمات سحابية', icon: Cloud, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { value: 'hardware', label_en: 'Hardware/Devices', label_ar: 'أجهزة ومعدات', icon: Server, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300' },
  { value: 'ai_ml', label_en: 'AI/ML Platforms', label_ar: 'منصات الذكاء الاصطناعي', icon: Brain, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'iot', label_en: 'IoT/Sensors', label_ar: 'إنترنت الأشياء', icon: Wifi, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'security', label_en: 'Security/Compliance', label_ar: 'أمن ومطابقة', icon: Shield, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'data', label_en: 'Data/Analytics', label_ar: 'بيانات وتحليلات', icon: Database, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
];

// Infrastructure categories
const INFRA_CATEGORIES = [
  { value: 'facility', label_en: 'Facilities/Space', label_ar: 'منشآت ومساحات', icon: Building, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300' },
  { value: 'network', label_en: 'Network/Connectivity', label_ar: 'شبكات واتصالات', icon: Wifi, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'datacenter', label_en: 'Data Center', label_ar: 'مركز بيانات', icon: Server, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'innovation_lab', label_en: 'Innovation Lab', label_ar: 'مختبر ابتكار', icon: Brain, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
];

// Budget allocation types
const BUDGET_TYPES = [
  { value: 'capex', label_en: 'CAPEX (Capital)', label_ar: 'نفقات رأسمالية', icon: TrendingUp, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'opex', label_en: 'OPEX (Operating)', label_ar: 'نفقات تشغيلية', icon: DollarSign, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'contingency', label_en: 'Contingency', label_ar: 'احتياطي', icon: Shield, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
];

// Acquisition timeline options
const ACQUISITION_PHASES = [
  { value: 'immediate', label_en: 'Immediate (Q1)', label_ar: 'فوري (ر1)' },
  { value: 'short_term', label_en: 'Short-term (Q2-Q3)', label_ar: 'قصير المدى (ر2-ر3)' },
  { value: 'medium_term', label_en: 'Medium-term (Year 1-2)', label_ar: 'متوسط المدى (سنة 1-2)' },
  { value: 'long_term', label_en: 'Long-term (Year 3+)', label_ar: 'طويل المدى (سنة 3+)' },
];

const RESOURCE_TYPES = [
  { 
    key: 'hr_requirements', 
    icon: Users, 
    title: { en: 'Human Resources', ar: 'الموارد البشرية' },
    description: { en: 'Staff, consultants, and expertise needed', ar: 'الكوادر والاستشاريين والخبرات المطلوبة' },
    categories: HR_CATEGORIES,
    color: 'from-blue-500/10 to-transparent'
  },
  { 
    key: 'technology_requirements', 
    icon: Cpu, 
    title: { en: 'Technology Stack', ar: 'المنظومة التقنية' },
    description: { en: 'Software, platforms, and digital tools', ar: 'البرمجيات والمنصات والأدوات الرقمية' },
    categories: TECH_CATEGORIES,
    color: 'from-purple-500/10 to-transparent'
  },
  { 
    key: 'infrastructure_requirements', 
    icon: Building, 
    title: { en: 'Infrastructure', ar: 'البنية التحتية' },
    description: { en: 'Physical and network infrastructure', ar: 'البنية التحتية الفيزيائية والشبكية' },
    categories: INFRA_CATEGORIES,
    color: 'from-slate-500/10 to-transparent'
  },
  { 
    key: 'budget_allocation', 
    icon: DollarSign, 
    title: { en: 'Budget Allocation', ar: 'توزيع الميزانية' },
    description: { en: 'Financial planning and distribution', ar: 'التخطيط والتوزيع المالي' },
    categories: BUDGET_TYPES,
    color: 'from-green-500/10 to-transparent'
  }
];

// Circular Progress Component
const CircularProgress = ({ value, size = 120, label }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-muted/20" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-primary transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{value}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = "text-primary", subValue }) => (
  <div className="text-center p-3 bg-background rounded-lg border hover:shadow-sm transition-shadow">
    <Icon className={cn("w-5 h-5 mx-auto mb-1", color)} />
    <div className={cn("text-xl font-bold", color)}>{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
    {subValue && <div className="text-xs text-muted-foreground mt-0.5">{subValue}</div>}
  </div>
);

export default function Step13Resources({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating, 
  isReadOnly = false,
  strategicPlanId 
}) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('categories');
  const [expandedItems, setExpandedItems] = useState({});

  const resourcePlan = data.resource_plan || {};

  // Helper to parse numbers
  const parseNumber = (val) => {
    const num = parseFloat(String(val || '0').replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // Calculate totals and statistics
  const stats = useMemo(() => {
    const totals = {
      hr: { count: 0, cost: 0, items: resourcePlan.hr_requirements || [] },
      tech: { count: 0, cost: 0, items: resourcePlan.technology_requirements || [] },
      infra: { count: 0, cost: 0, items: resourcePlan.infrastructure_requirements || [] },
      budget: { count: 0, cost: 0, items: resourcePlan.budget_allocation || [] }
    };

    totals.hr.items.forEach(r => {
      totals.hr.count += parseNumber(r.quantity) || 1;
      totals.hr.cost += parseNumber(r.cost);
    });

    totals.tech.items.forEach(r => {
      totals.tech.count += parseNumber(r.quantity) || 1;
      totals.tech.cost += parseNumber(r.cost);
    });

    totals.infra.items.forEach(r => {
      totals.infra.count += parseNumber(r.quantity) || 1;
      totals.infra.cost += parseNumber(r.cost);
    });

    totals.budget.items.forEach(r => {
      totals.budget.count++;
      totals.budget.cost += parseNumber(r.cost);
    });

    const grandTotal = totals.hr.cost + totals.tech.cost + totals.infra.cost;
    const budgetAllocated = totals.budget.cost;
    const itemCount = totals.hr.items.length + totals.tech.items.length + totals.infra.items.length + totals.budget.items.length;

    // Items with justification
    const withJustification = [
      ...totals.hr.items,
      ...totals.tech.items,
      ...totals.infra.items
    ].filter(r => r.justification_en || r.justification_ar || r.notes_en || r.notes_ar).length;

    // Items with entity allocation
    const withAllocation = [
      ...totals.hr.items,
      ...totals.tech.items,
      ...totals.infra.items
    ].filter(r => r.entity_allocations?.length > 0).length;

    // Timeline breakdown
    const byPhase = ACQUISITION_PHASES.map(phase => ({
      ...phase,
      items: [
        ...totals.hr.items.filter(r => r.acquisition_phase === phase.value),
        ...totals.tech.items.filter(r => r.acquisition_phase === phase.value),
        ...totals.infra.items.filter(r => r.acquisition_phase === phase.value),
      ],
      cost: [
        ...totals.hr.items.filter(r => r.acquisition_phase === phase.value),
        ...totals.tech.items.filter(r => r.acquisition_phase === phase.value),
        ...totals.infra.items.filter(r => r.acquisition_phase === phase.value),
      ].reduce((sum, r) => sum + parseNumber(r.cost), 0)
    }));

    // Category breakdowns
    const hrByCategory = HR_CATEGORIES.map(cat => ({
      ...cat,
      count: totals.hr.items.filter(r => r.category === cat.value).length,
      cost: totals.hr.items.filter(r => r.category === cat.value).reduce((sum, r) => sum + parseNumber(r.cost), 0)
    }));

    const techByCategory = TECH_CATEGORIES.map(cat => ({
      ...cat,
      count: totals.tech.items.filter(r => r.category === cat.value).length,
      cost: totals.tech.items.filter(r => r.category === cat.value).reduce((sum, r) => sum + parseNumber(r.cost), 0)
    }));

    const totalResourceItems = totals.hr.items.length + totals.tech.items.length + totals.infra.items.length;

    return {
      totals,
      grandTotal,
      budgetAllocated,
      itemCount,
      withJustification,
      withAllocation,
      byPhase,
      hrByCategory,
      techByCategory,
      totalResourceItems,
      justificationRate: totalResourceItems > 0 ? Math.round((withJustification / totalResourceItems) * 100) : 0,
      allocationRate: totalResourceItems > 0 ? Math.round((withAllocation / totalResourceItems) * 100) : 0
    };
  }, [resourcePlan]);

  // Calculate completeness score
  const completenessScore = useMemo(() => {
    let score = 0;
    
    // 25% for having HR resources (minimum 2)
    score += Math.min((stats.totals.hr.items.length / 2) * 25, 25);
    
    // 25% for having technology resources (minimum 2)
    score += Math.min((stats.totals.tech.items.length / 2) * 25, 25);
    
    // 20% for budget allocation defined
    if (stats.totals.budget.items.length > 0) score += 20;
    
    // 15% for justifications
    score += (stats.justificationRate / 100) * 15;
    
    // 15% for cost estimates filled
    const withCost = [
      ...stats.totals.hr.items,
      ...stats.totals.tech.items,
      ...stats.totals.infra.items
    ].filter(r => parseNumber(r.cost) > 0).length;
    const costRate = stats.totalResourceItems > 0 ? (withCost / stats.totalResourceItems) : 0;
    score += costRate * 15;
    
    return Math.round(Math.min(score, 100));
  }, [stats]);

  // Generate alerts
  const alerts = useMemo(() => {
    const warnings = [];
    
    if (stats.itemCount === 0) {
      warnings.push({ type: 'error', message: t({ en: 'No resources defined. Add HR, technology, or infrastructure resources.', ar: 'لم يتم تحديد موارد. أضف موارد بشرية أو تقنية أو بنية تحتية.' }) });
    }
    
    if (stats.totals.hr.items.length === 0) {
      warnings.push({ type: 'warning', message: t({ en: 'No human resources defined', ar: 'لم يتم تحديد موارد بشرية' }) });
    }
    
    if (stats.totals.tech.items.length === 0) {
      warnings.push({ type: 'warning', message: t({ en: 'No technology resources defined', ar: 'لم يتم تحديد موارد تقنية' }) });
    }
    
    if (stats.grandTotal > 0 && stats.budgetAllocated === 0) {
      warnings.push({ type: 'warning', message: t({ en: 'Resources estimated but no budget allocation defined', ar: 'الموارد مقدرة ولكن لم يتم تحديد توزيع الميزانية' }) });
    }
    
    if (stats.justificationRate < 50 && stats.totalResourceItems > 0) {
      warnings.push({ type: 'warning', message: t({ en: 'Add business justifications for resources', ar: 'أضف مبررات تجارية للموارد' }) });
    }
    
    return warnings;
  }, [stats, t]);

  const formatCurrency = (value) => {
    const num = parseNumber(value);
    if (num === 0) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M SAR`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K SAR`;
    return `${num.toLocaleString()} SAR`;
  };

  const addResource = (type, category = null) => {
    if (isReadOnly) return;
    const current = resourcePlan[type] || [];
    const newItem = { 
      id: Date.now().toString(), 
      name_en: '', 
      name_ar: '', 
      quantity: '1', 
      cost: '', 
      notes_en: '',
      notes_ar: '',
      category: category || (RESOURCE_TYPES.find(rt => rt.key === type)?.categories?.[0]?.value || ''),
      acquisition_phase: 'short_term',
      priority: 'medium',
      justification_en: '',
      justification_ar: '',
      entity_allocations: []
    };
    onChange({ resource_plan: { ...resourcePlan, [type]: [...current, newItem] } });
    setExpandedItems(prev => ({ ...prev, [newItem.id]: true }));
  };

  const updateResource = (type, itemId, field, value) => {
    if (isReadOnly) return;
    const current = (resourcePlan[type] || []).map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    onChange({ resource_plan: { ...resourcePlan, [type]: current } });
  };

  const removeResource = (type, itemId) => {
    if (isReadOnly) return;
    const current = resourcePlan[type] || [];
    onChange({ resource_plan: { ...resourcePlan, [type]: current.filter(item => item.id !== itemId) } });
  };

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryConfig = (type, categoryValue) => {
    const resourceType = RESOURCE_TYPES.find(rt => rt.key === type);
    return resourceType?.categories?.find(c => c.value === categoryValue) || resourceType?.categories?.[0];
  };

  const getResourceProgress = (item) => {
    let filled = 0;
    let total = 5;
    
    if (item.name_en || item.name_ar) filled++;
    if (item.category) filled++;
    if (parseNumber(item.cost) > 0) filled++;
    if (item.justification_en || item.justification_ar || item.notes_en || item.notes_ar) filled++;
    if (item.acquisition_phase) filled++;
    
    return Math.round((filled / total) * 100);
  };

  const isResourceComplete = (item) => getResourceProgress(item) >= 80;

  // Resource Card Component
  const ResourceCard = ({ item, type }) => {
    const isExpanded = expandedItems[item.id];
    const categoryConfig = getCategoryConfig(type, item.category);
    const CategoryIcon = categoryConfig?.icon || Target;
    const progress = getResourceProgress(item);
    const complete = isResourceComplete(item);

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
        <Card className={cn("border-2 transition-all", complete && "border-green-300")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("p-2 rounded-lg", categoryConfig?.color || 'bg-muted')}>
                    <CategoryIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {item.name_en || t({ en: 'Untitled Resource', ar: 'مورد بدون عنوان' })}
                      </span>
                      {complete && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{language === 'ar' ? categoryConfig?.label_ar : categoryConfig?.label_en}</span>
                      {item.quantity && <span>• Qty: {item.quantity}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-2">
                    <Progress value={progress} className="w-16 h-1.5" />
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </div>
                  {item.cost && (
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(item.cost)}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs hidden md:flex">
                    {ACQUISITION_PHASES.find(p => p.value === item.acquisition_phase)?.label_en?.split(' ')[0] || 'TBD'}
                  </Badge>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })} *</Label>
                  <Input
                    value={item.name_en || ''}
                    onChange={(e) => updateResource(type, item.id, 'name_en', e.target.value)}
                    placeholder={t({ en: 'Resource name', ar: 'اسم المورد' })}
                    className={cn(item.name_en && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                  <Input
                    dir="rtl"
                    value={item.name_ar || ''}
                    onChange={(e) => updateResource(type, item.id, 'name_ar', e.target.value)}
                    placeholder={t({ en: 'Arabic name', ar: 'الاسم بالعربية' })}
                    className={cn(item.name_ar && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {/* Category, Quantity, Cost, Phase */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Category', ar: 'الفئة' })}</Label>
                  <Select 
                    value={item.category || ''} 
                    onValueChange={(v) => updateResource(type, item.id, 'category', v)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className={cn("h-9", item.category && "border-green-300")}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.find(rt => rt.key === type)?.categories?.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{language === 'ar' ? cat.label_ar : cat.label_en}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Quantity', ar: 'الكمية' })}</Label>
                  <Input
                    value={item.quantity || ''}
                    onChange={(e) => updateResource(type, item.id, 'quantity', e.target.value)}
                    placeholder="1"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Annual Cost (SAR)', ar: 'التكلفة السنوية (ريال)' })}</Label>
                  <Input
                    value={item.cost || ''}
                    onChange={(e) => updateResource(type, item.id, 'cost', e.target.value)}
                    placeholder="500,000"
                    className={cn(parseNumber(item.cost) > 0 && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Acquisition Phase', ar: 'مرحلة التوفير' })}</Label>
                  <Select 
                    value={item.acquisition_phase || 'short_term'} 
                    onValueChange={(v) => updateResource(type, item.id, 'acquisition_phase', v)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACQUISITION_PHASES.map(phase => (
                        <SelectItem key={phase.value} value={phase.value}>
                          {language === 'ar' ? phase.label_ar : phase.label_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Justification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Business Justification (EN)', ar: 'المبرر التجاري (إنجليزي)' })}</Label>
                  <Textarea
                    value={item.justification_en || item.notes_en || ''}
                    onChange={(e) => updateResource(type, item.id, 'justification_en', e.target.value)}
                    rows={2}
                    placeholder={t({ en: 'Why is this resource needed...', ar: 'لماذا هذا المورد مطلوب...' })}
                    className={cn((item.justification_en || item.notes_en) && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t({ en: 'Business Justification (AR)', ar: 'المبرر التجاري (عربي)' })}</Label>
                  <Textarea
                    dir="rtl"
                    value={item.justification_ar || item.notes_ar || ''}
                    onChange={(e) => updateResource(type, item.id, 'justification_ar', e.target.value)}
                    rows={2}
                    placeholder={t({ en: 'Arabic justification', ar: 'المبرر بالعربية' })}
                    className={cn((item.justification_ar || item.notes_ar) && "border-green-300")}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {/* Entity Allocation */}
              {strategicPlanId && (
                <div className="space-y-1 pt-2 border-t">
                  <Label className="text-xs flex items-center gap-1">
                    <Link2 className="h-3 w-3" />
                    {t({ en: 'Link to Actions/Entities', ar: 'ربط بالإجراءات/الكيانات' })}
                  </Label>
                  <EntityAllocationSelector
                    strategicPlanId={strategicPlanId}
                    value={item.entity_allocations || []}
                    onChange={(allocations) => updateResource(type, item.id, 'entity_allocations', allocations)}
                    multiple={true}
                    showDetails={true}
                    placeholder={t({ en: 'Select actions this resource supports...', ar: 'اختر الإجراءات التي يدعمها هذا المورد...' })}
                    disabled={isReadOnly}
                  />
                </div>
              )}

              {/* Remove Button */}
              {!isReadOnly && (
                <div className="flex justify-end pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={() => removeResource(type, item.id)} className="text-destructive hover:text-destructive">
                    <X className="h-4 w-4 mr-1" />
                    {t({ en: 'Remove', ar: 'حذف' })}
                  </Button>
                </div>
              )}
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
        title={t({ en: 'Resource Planning', ar: 'تخطيط الموارد' })}
        subtitle={t({ en: 'HR, technology, infrastructure, and budget allocation', ar: 'الموارد البشرية والتقنية والبنية التحتية والميزانية' })}
        language={language}
        stats={[
          { icon: Layers, value: stats.itemCount, label: t({ en: 'Total Resources', ar: 'إجمالي الموارد' }) },
          { icon: Users, value: stats.totals.hr.items.length, label: t({ en: 'HR Items', ar: 'موارد بشرية' }) },
          { icon: Cpu, value: stats.totals.tech.items.length, label: t({ en: 'Tech Items', ar: 'موارد تقنية' }) },
          { icon: DollarSign, value: formatCurrency(stats.grandTotal), label: t({ en: 'Est. Cost', ar: 'التكلفة المقدرة' }) },
          { icon: Percent, value: `${stats.justificationRate}%`, label: t({ en: 'With Justification', ar: 'مع مبرر' }) },
        ]}
      />
      
      {/* AI Generation Card */}
      {!isReadOnly && (
        <MainAIGeneratorCard
          title={{ en: 'AI-Powered Resource Planning', ar: 'تخطيط الموارد بالذكاء الاصطناعي' }}
          description={{ en: 'Generate HR, technology, and infrastructure resource requirements', ar: 'إنشاء متطلبات الموارد البشرية والتقنية والبنية التحتية' }}
          onGenerate={onGenerateAI}
          isGenerating={isGenerating}
          generateLabel={{ en: 'Generate Resources', ar: 'إنشاء الموارد' }}
        />
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <Alert key={idx} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="categories" className="gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'By Category', ar: 'حسب الفئة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Timeline', ar: 'الجدول' })}</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Matrix', ar: 'المصفوفة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'الملخص' })}</span>
          </TabsTrigger>
        </TabsList>

        {/* Categories View */}
        <TabsContent value="categories" className="space-y-4">
          {RESOURCE_TYPES.map(({ key, icon: Icon, title, description, color }) => (
            <Card key={key} className={cn("bg-gradient-to-r", color)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {title[language]}
                        <Badge variant="secondary">{(resourcePlan[key] || []).length}</Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">{description[language]}</CardDescription>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <Button variant="outline" size="sm" onClick={() => addResource(key)}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t({ en: 'Add', ar: 'إضافة' })}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {(resourcePlan[key] || []).length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg text-sm">
                    <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {t({ en: 'No items added yet', ar: 'لم تتم إضافة عناصر بعد' })}
                    {!isReadOnly && (
                      <Button variant="link" size="sm" onClick={() => addResource(key)} className="mt-1">
                        <Plus className="h-3 w-3 mr-1" />
                        {t({ en: 'Add first item', ar: 'أضف العنصر الأول' })}
                      </Button>
                    )}
                  </div>
                ) : (
                  (resourcePlan[key] || []).map(item => (
                    <ResourceCard key={item.id} item={item} type={key} />
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          {ACQUISITION_PHASES.map(phase => {
            const phaseData = stats.byPhase.find(p => p.value === phase.value);
            const phaseItems = phaseData?.items || [];
            const phaseCost = phaseData?.cost || 0;
            
            return (
              <Card key={phase.value}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {language === 'ar' ? phase.label_ar : phase.label_en}
                      <Badge variant="secondary">{phaseItems.length}</Badge>
                    </CardTitle>
                    {phaseCost > 0 && (
                      <Badge variant="outline">{formatCurrency(phaseCost)}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {phaseItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t({ en: 'No resources planned for this phase', ar: 'لا توجد موارد مخططة لهذه المرحلة' })}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {phaseItems.map((item) => {
                        const type = stats.totals.hr.items.includes(item) ? 'hr_requirements' :
                                     stats.totals.tech.items.includes(item) ? 'technology_requirements' : 
                                     'infrastructure_requirements';
                        const categoryConfig = getCategoryConfig(type, item.category);
                        const Icon = categoryConfig?.icon || Target;
                        
                        return (
                          <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                            <div className={cn("p-2 rounded", categoryConfig?.color || 'bg-muted')}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name_en || t({ en: 'Untitled', ar: 'بدون عنوان' })}</p>
                              <p className="text-xs text-muted-foreground">
                                {language === 'ar' ? categoryConfig?.label_ar : categoryConfig?.label_en}
                              </p>
                            </div>
                            <Badge variant="outline">{formatCurrency(item.cost)}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Matrix View */}
        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t({ en: 'Resource Allocation Matrix', ar: 'مصفوفة تخصيص الموارد' })}
              </CardTitle>
              <CardDescription>{t({ en: 'Resources by category and acquisition phase', ar: 'الموارد حسب الفئة ومرحلة التوفير' })}</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.itemCount === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t({ en: 'Add resources to see the matrix', ar: 'أضف موارد لرؤية المصفوفة' })}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">{t({ en: 'Resource Type', ar: 'نوع المورد' })}</th>
                        {ACQUISITION_PHASES.map(phase => (
                          <th key={phase.value} className="text-center p-2 font-medium text-xs">
                            {language === 'ar' ? phase.label_ar : phase.label_en}
                          </th>
                        ))}
                        <th className="text-center p-2 font-medium">{t({ en: 'Total', ar: 'المجموع' })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RESOURCE_TYPES.slice(0, 3).map(rt => {
                        const Icon = rt.icon;
                        const items = resourcePlan[rt.key] || [];
                        return (
                          <tr key={rt.key} className="border-b">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span>{rt.title[language]}</span>
                              </div>
                            </td>
                            {ACQUISITION_PHASES.map(phase => {
                              const count = items.filter(i => i.acquisition_phase === phase.value).length;
                              return (
                                <td key={phase.value} className="text-center p-2">
                                  {count > 0 ? (
                                    <Badge variant="secondary">{count}</Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="text-center p-2">
                              <Badge>{items.length}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary View */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HR Skills Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {t({ en: 'HR Skills Distribution', ar: 'توزيع المهارات البشرية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.hrByCategory.filter(c => c.count > 0).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t({ en: 'No HR resources added', ar: 'لم تتم إضافة موارد بشرية' })}</p>
                ) : (
                  stats.hrByCategory.filter(c => c.count > 0).map(cat => {
                    const Icon = cat.icon;
                    const maxCost = Math.max(...stats.hrByCategory.map(c => c.cost), 1);
                    return (
                      <div key={cat.value} className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded", cat.color)}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{language === 'ar' ? cat.label_ar : cat.label_en}</span>
                            <span className="font-medium">{cat.count} ({formatCurrency(cat.cost)})</span>
                          </div>
                          <Progress value={(cat.cost / maxCost) * 100} className="h-1.5" />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Technology Stack */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  {t({ en: 'Technology Stack', ar: 'المنظومة التقنية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.techByCategory.filter(c => c.count > 0).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t({ en: 'No tech resources added', ar: 'لم تتم إضافة موارد تقنية' })}</p>
                ) : (
                  stats.techByCategory.filter(c => c.count > 0).map(cat => {
                    const Icon = cat.icon;
                    const maxCost = Math.max(...stats.techByCategory.map(c => c.cost), 1);
                    return (
                      <div key={cat.value} className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded", cat.color)}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{language === 'ar' ? cat.label_ar : cat.label_en}</span>
                            <span className="font-medium">{cat.count} ({formatCurrency(cat.cost)})</span>
                          </div>
                          <Progress value={(cat.cost / maxCost) * 100} className="h-1.5" />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Budget Summary */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  {t({ en: 'Budget Summary', ar: 'ملخص الميزانية' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatCurrency(stats.totals.hr.cost)}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{t({ en: 'Human Resources', ar: 'الموارد البشرية' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-center">
                    <Cpu className="h-5 w-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatCurrency(stats.totals.tech.cost)}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">{t({ en: 'Technology', ar: 'التقنية' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 text-center">
                    <Building className="h-5 w-5 mx-auto mb-1 text-slate-600 dark:text-slate-400" />
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{formatCurrency(stats.totals.infra.cost)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t({ en: 'Infrastructure', ar: 'البنية التحتية' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                    <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-600 dark:text-green-400" />
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(stats.grandTotal)}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{t({ en: 'Grand Total', ar: 'المجموع الكلي' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <RecommendationsCard
              title={t({ en: 'Recommendations', ar: 'التوصيات' })}
              className="md:col-span-2"
              recommendations={[
                ...(stats.totals.hr.items.length === 0 ? [{ type: 'warning', message: { en: 'Define human resource requirements for strategy execution', ar: 'حدد متطلبات الموارد البشرية لتنفيذ الاستراتيجية' } }] : []),
                ...(stats.totals.tech.items.length === 0 ? [{ type: 'warning', message: { en: 'Identify technology requirements and digital tools needed', ar: 'حدد المتطلبات التقنية والأدوات الرقمية المطلوبة' } }] : []),
                ...(stats.justificationRate < 50 && stats.totalResourceItems > 0 ? [{ type: 'info', message: { en: 'Add business justifications for all resources', ar: 'أضف مبررات تجارية لجميع الموارد' } }] : []),
                ...(stats.grandTotal > 0 && stats.budgetAllocated === 0 ? [{ type: 'warning', message: { en: 'Define budget allocation for resource planning', ar: 'حدد توزيع الميزانية لتخطيط الموارد' } }] : []),
                ...(completenessScore >= 80 ? [{ type: 'success', message: { en: 'Resource planning is well-documented. Review acquisition timelines.', ar: 'تخطيط الموارد موثق جيداً. راجع جداول التوفير.' } }] : [])
              ]}
              language={language}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
