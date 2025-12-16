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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Sparkles, Loader2, DollarSign, Users, Cpu, Building, Plus, X, 
  StickyNote, Link2, BarChart3, PieChart, Briefcase, GraduationCap,
  Server, Cloud, Database, Wifi, Monitor, Shield, Code, Brain,
  TrendingUp, Calendar, Target, Layers, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import EntityAllocationSelector from '../EntityAllocationSelector';

// HR skill categories
const HR_CATEGORIES = [
  { value: 'technical', label_en: 'Technical Staff', label_ar: 'كادر تقني', icon: Code, color: 'bg-blue-100 text-blue-700' },
  { value: 'management', label_en: 'Management', label_ar: 'إدارة', icon: Briefcase, color: 'bg-purple-100 text-purple-700' },
  { value: 'innovation', label_en: 'Innovation/R&D', label_ar: 'ابتكار وبحث', icon: Brain, color: 'bg-amber-100 text-amber-700' },
  { value: 'support', label_en: 'Support Staff', label_ar: 'كادر دعم', icon: Users, color: 'bg-green-100 text-green-700' },
  { value: 'external', label_en: 'External/Consultants', label_ar: 'خارجي/استشاريين', icon: GraduationCap, color: 'bg-pink-100 text-pink-700' },
];

// Technology categories
const TECH_CATEGORIES = [
  { value: 'software', label_en: 'Software/Licenses', label_ar: 'برمجيات/تراخيص', icon: Monitor, color: 'bg-blue-100 text-blue-700' },
  { value: 'cloud', label_en: 'Cloud Services', label_ar: 'خدمات سحابية', icon: Cloud, color: 'bg-cyan-100 text-cyan-700' },
  { value: 'hardware', label_en: 'Hardware/Devices', label_ar: 'أجهزة ومعدات', icon: Server, color: 'bg-slate-100 text-slate-700' },
  { value: 'ai_ml', label_en: 'AI/ML Platforms', label_ar: 'منصات الذكاء الاصطناعي', icon: Brain, color: 'bg-purple-100 text-purple-700' },
  { value: 'iot', label_en: 'IoT/Sensors', label_ar: 'إنترنت الأشياء', icon: Wifi, color: 'bg-green-100 text-green-700' },
  { value: 'security', label_en: 'Security/Compliance', label_ar: 'أمن ومطابقة', icon: Shield, color: 'bg-red-100 text-red-700' },
  { value: 'data', label_en: 'Data/Analytics', label_ar: 'بيانات وتحليلات', icon: Database, color: 'bg-amber-100 text-amber-700' },
];

// Infrastructure categories
const INFRA_CATEGORIES = [
  { value: 'facility', label_en: 'Facilities/Space', label_ar: 'منشآت ومساحات', icon: Building, color: 'bg-slate-100 text-slate-700' },
  { value: 'network', label_en: 'Network/Connectivity', label_ar: 'شبكات واتصالات', icon: Wifi, color: 'bg-blue-100 text-blue-700' },
  { value: 'datacenter', label_en: 'Data Center', label_ar: 'مركز بيانات', icon: Server, color: 'bg-purple-100 text-purple-700' },
  { value: 'innovation_lab', label_en: 'Innovation Lab', label_ar: 'مختبر ابتكار', icon: Brain, color: 'bg-amber-100 text-amber-700' },
];

// Budget allocation types
const BUDGET_TYPES = [
  { value: 'capex', label_en: 'CAPEX (Capital)', label_ar: 'نفقات رأسمالية', color: 'bg-blue-500' },
  { value: 'opex', label_en: 'OPEX (Operating)', label_ar: 'نفقات تشغيلية', color: 'bg-green-500' },
  { value: 'contingency', label_en: 'Contingency', label_ar: 'احتياطي', color: 'bg-amber-500' },
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
    categories: BUDGET_TYPES.map(b => ({ ...b, value: b.value, label_en: b.label_en, label_ar: b.label_ar, icon: DollarSign })),
    color: 'from-green-500/10 to-transparent'
  }
];

export default function Step13Resources({ data, onChange, onGenerateAI, isGenerating, strategicPlanId }) {
  const { language, t, isRTL } = useLanguage();
  const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'timeline' | 'summary'
  const [expandedItems, setExpandedItems] = useState({});

  const resourcePlan = data.resource_plan || {};

  // Calculate totals and statistics
  const stats = useMemo(() => {
    const parseNumber = (val) => {
      const num = parseFloat(String(val || '0').replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? 0 : num;
    };

    const totals = {
      hr: { count: 0, cost: 0 },
      tech: { count: 0, cost: 0 },
      infra: { count: 0, cost: 0 },
      budget: { count: 0, cost: 0 }
    };

    (resourcePlan.hr_requirements || []).forEach(r => {
      totals.hr.count += parseNumber(r.quantity) || 1;
      totals.hr.cost += parseNumber(r.cost);
    });

    (resourcePlan.technology_requirements || []).forEach(r => {
      totals.tech.count += parseNumber(r.quantity) || 1;
      totals.tech.cost += parseNumber(r.cost);
    });

    (resourcePlan.infrastructure_requirements || []).forEach(r => {
      totals.infra.count += parseNumber(r.quantity) || 1;
      totals.infra.cost += parseNumber(r.cost);
    });

    (resourcePlan.budget_allocation || []).forEach(r => {
      totals.budget.count++;
      totals.budget.cost += parseNumber(r.cost);
    });

    const grandTotal = totals.hr.cost + totals.tech.cost + totals.infra.cost;
    const budgetAllocated = totals.budget.cost;

    // Category breakdown
    const hrByCategory = HR_CATEGORIES.map(cat => ({
      ...cat,
      count: (resourcePlan.hr_requirements || []).filter(r => r.category === cat.value).length,
      cost: (resourcePlan.hr_requirements || []).filter(r => r.category === cat.value).reduce((sum, r) => sum + parseNumber(r.cost), 0)
    }));

    const techByCategory = TECH_CATEGORIES.map(cat => ({
      ...cat,
      count: (resourcePlan.technology_requirements || []).filter(r => r.category === cat.value).length,
      cost: (resourcePlan.technology_requirements || []).filter(r => r.category === cat.value).reduce((sum, r) => sum + parseNumber(r.cost), 0)
    }));

    // Timeline breakdown
    const byPhase = ACQUISITION_PHASES.map(phase => ({
      ...phase,
      items: [
        ...(resourcePlan.hr_requirements || []).filter(r => r.acquisition_phase === phase.value),
        ...(resourcePlan.technology_requirements || []).filter(r => r.acquisition_phase === phase.value),
        ...(resourcePlan.infrastructure_requirements || []).filter(r => r.acquisition_phase === phase.value),
      ]
    }));

    return {
      totals,
      grandTotal,
      budgetAllocated,
      hrByCategory,
      techByCategory,
      byPhase,
      itemCount: (resourcePlan.hr_requirements || []).length + 
                 (resourcePlan.technology_requirements || []).length + 
                 (resourcePlan.infrastructure_requirements || []).length +
                 (resourcePlan.budget_allocation || []).length
    };
  }, [resourcePlan]);

  const formatCurrency = (value) => {
    const num = parseFloat(String(value || '0').replace(/[^0-9.-]/g, ''));
    if (isNaN(num) || num === 0) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M SAR`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K SAR`;
    return `${num.toLocaleString()} SAR`;
  };

  const addResource = (type, category = null) => {
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
    setExpandedItems(prev => ({ ...prev, [`${type}-${current.length}`]: true }));
  };

  const updateResource = (type, index, field, value) => {
    const current = [...(resourcePlan[type] || [])];
    current[index] = { ...current[index], [field]: value };
    onChange({ resource_plan: { ...resourcePlan, [type]: current } });
  };

  const removeResource = (type, index) => {
    const current = resourcePlan[type] || [];
    onChange({ resource_plan: { ...resourcePlan, [type]: current.filter((_, i) => i !== index) } });
  };

  const toggleExpanded = (key) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCategoryConfig = (type, categoryValue) => {
    const resourceType = RESOURCE_TYPES.find(rt => rt.key === type);
    return resourceType?.categories?.find(c => c.value === categoryValue) || resourceType?.categories?.[0];
  };

  const renderResourceItem = (item, type, idx) => {
    const itemKey = `${type}-${idx}`;
    const isExpanded = expandedItems[itemKey];
    const categoryConfig = getCategoryConfig(type, item.category);
    const CategoryIcon = categoryConfig?.icon || Target;

    return (
      <div 
        key={item.id} 
        className={`border rounded-lg overflow-hidden transition-all ${
          isExpanded ? 'bg-background' : 'bg-muted/20'
        }`}
      >
        {/* Header - Always visible */}
        <div 
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30"
          onClick={() => toggleExpanded(itemKey)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${categoryConfig?.color || 'bg-muted'}`}>
              <CategoryIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-1">
                {item.name_en || t({ en: 'Untitled Resource', ar: 'مورد بدون عنوان' })}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{language === 'ar' ? categoryConfig?.label_ar : categoryConfig?.label_en}</span>
                {item.quantity && <span>• Qty: {item.quantity}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.cost && (
              <Badge variant="outline" className="text-xs">
                {formatCurrency(item.cost)}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {ACQUISITION_PHASES.find(p => p.value === item.acquisition_phase)?.label_en?.split(' ')[0] || 'TBD'}
            </Badge>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 pt-0 space-y-4 border-t">
            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}</Label>
                <Input
                  value={item.name_en || ''}
                  onChange={(e) => updateResource(type, idx, 'name_en', e.target.value)}
                  placeholder="Senior Data Scientist"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}</Label>
                <Input
                  dir="rtl"
                  value={item.name_ar || ''}
                  onChange={(e) => updateResource(type, idx, 'name_ar', e.target.value)}
                  placeholder="عالم بيانات أول"
                />
              </div>
            </div>

            {/* Category, Quantity, Cost, Phase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t({ en: 'Category', ar: 'الفئة' })}</Label>
                <Select 
                  value={item.category || ''} 
                  onValueChange={(v) => updateResource(type, idx, 'category', v)}
                >
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
                  onChange={(e) => updateResource(type, idx, 'quantity', e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t({ en: 'Annual Cost (SAR)', ar: 'التكلفة السنوية (ريال)' })}</Label>
                <Input
                  value={item.cost || ''}
                  onChange={(e) => updateResource(type, idx, 'cost', e.target.value)}
                  placeholder="500,000"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t({ en: 'Acquisition Phase', ar: 'مرحلة التوفير' })}</Label>
                <Select 
                  value={item.acquisition_phase || 'short_term'} 
                  onValueChange={(v) => updateResource(type, idx, 'acquisition_phase', v)}
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
                  onChange={(e) => updateResource(type, idx, 'justification_en', e.target.value)}
                  rows={2}
                  placeholder="Why is this resource needed..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t({ en: 'Business Justification (AR)', ar: 'المبرر التجاري (عربي)' })}</Label>
                <Textarea
                  dir="rtl"
                  value={item.justification_ar || item.notes_ar || ''}
                  onChange={(e) => updateResource(type, idx, 'justification_ar', e.target.value)}
                  rows={2}
                  placeholder="لماذا هذا المورد مطلوب..."
                />
              </div>
            </div>

            {/* Entity Allocation */}
            <div className="space-y-1 pt-2 border-t">
              <Label className="text-xs flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                {t({ en: 'Link to Actions/Entities', ar: 'ربط بالإجراءات/الكيانات' })}
              </Label>
              <EntityAllocationSelector
                strategicPlanId={strategicPlanId}
                value={item.entity_allocations || []}
                onChange={(allocations) => updateResource(type, idx, 'entity_allocations', allocations)}
                multiple={true}
                showDetails={true}
                placeholder={t({ en: 'Select actions this resource supports...', ar: 'اختر الإجراءات التي يدعمها هذا المورد...' })}
              />
            </div>

            {/* Remove Button */}
            <div className="flex justify-end pt-2">
              <Button variant="destructive" size="sm" onClick={() => removeResource(type, idx)}>
                <X className="h-4 w-4 mr-1" />
                {t({ en: 'Remove', ar: 'حذف' })}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Resource Dashboard */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t({ en: 'Resource Planning Dashboard', ar: 'لوحة تخطيط الموارد' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Comprehensive view of all required resources', ar: 'نظرة شاملة على جميع الموارد المطلوبة' })}
              </CardDescription>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Resources', ar: 'إنشاء الموارد' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-background border text-center">
              <p className="text-2xl font-bold text-primary">{stats.itemCount}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Total Resources', ar: 'إجمالي الموارد' })}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totals.hr.count}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'HR Positions', ar: 'مناصب بشرية' })}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <p className="text-2xl font-bold text-purple-600">{(resourcePlan.technology_requirements || []).length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Tech Items', ar: 'عناصر تقنية' })}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <p className="text-2xl font-bold text-slate-600">{(resourcePlan.infrastructure_requirements || []).length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Infrastructure', ar: 'بنية تحتية' })}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.grandTotal)}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Est. Total Cost', ar: 'التكلفة المقدرة' })}</p>
            </div>
            <div className="p-3 rounded-lg bg-background border text-center">
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.budgetAllocated)}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Budget Allocated', ar: 'الميزانية المخصصة' })}</p>
            </div>
          </div>

          {/* Cost Breakdown by Category */}
          <div className="grid grid-cols-4 gap-2">
            <TooltipProvider>
              {RESOURCE_TYPES.slice(0, 4).map(rt => {
                const Icon = rt.icon;
                const cost = stats.totals[rt.key === 'hr_requirements' ? 'hr' : 
                                          rt.key === 'technology_requirements' ? 'tech' : 
                                          rt.key === 'infrastructure_requirements' ? 'infra' : 'budget'].cost;
                const percentage = stats.grandTotal > 0 ? (cost / stats.grandTotal * 100) : 0;
                
                return (
                  <Tooltip key={rt.key}>
                    <TooltipTrigger asChild>
                      <div className={`p-2 rounded-lg border bg-gradient-to-r ${rt.color} text-center cursor-help`}>
                        <Icon className="h-5 w-5 mx-auto mb-1" />
                        <p className="text-sm font-bold">{formatCurrency(cost)}</p>
                        <p className="text-[10px] text-muted-foreground">{language === 'ar' ? rt.title.ar : rt.title.en}</p>
                        {stats.grandTotal > 0 && (
                          <Progress value={percentage} className="h-1 mt-1" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{percentage.toFixed(1)}% {t({ en: 'of total resources', ar: 'من إجمالي الموارد' })}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="categories" className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            {t({ en: 'By Category', ar: 'حسب الفئة' })}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {t({ en: 'By Timeline', ar: 'حسب الجدول' })}
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" />
            {t({ en: 'Summary', ar: 'ملخص' })}
          </TabsTrigger>
        </TabsList>

        {/* Categories View */}
        <TabsContent value="categories" className="space-y-4 mt-4">
          {RESOURCE_TYPES.map(({ key, icon: Icon, title, description, categories, color }) => (
            <Card key={key} className={`bg-gradient-to-r ${color}`}>
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
                  <Button variant="outline" size="sm" onClick={() => addResource(key)}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {(resourcePlan[key] || []).length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg text-sm">
                    <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {t({ en: 'No items added yet. Click "Add" to start.', ar: 'لم تتم إضافة عناصر. انقر "إضافة" للبدء.' })}
                  </div>
                ) : (
                  resourcePlan[key].map((item, idx) => renderResourceItem(item, key, idx))
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4 mt-4">
          {ACQUISITION_PHASES.map(phase => {
            const phaseItems = stats.byPhase.find(p => p.value === phase.value)?.items || [];
            return (
              <Card key={phase.value}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {language === 'ar' ? phase.label_ar : phase.label_en}
                    <Badge variant="secondary">{phaseItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {phaseItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t({ en: 'No resources planned for this phase', ar: 'لا توجد موارد مخططة لهذه المرحلة' })}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {phaseItems.map((item, idx) => {
                        const type = (resourcePlan.hr_requirements || []).includes(item) ? 'hr_requirements' :
                                     (resourcePlan.technology_requirements || []).includes(item) ? 'technology_requirements' : 
                                     'infrastructure_requirements';
                        const categoryConfig = getCategoryConfig(type, item.category);
                        const Icon = categoryConfig?.icon || Target;
                        
                        return (
                          <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                            <div className={`p-2 rounded ${categoryConfig?.color || 'bg-muted'}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{item.name_en || 'Untitled'}</p>
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

        {/* Summary View */}
        <TabsContent value="summary" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HR Skills Matrix */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {t({ en: 'HR Skills Distribution', ar: 'توزيع المهارات البشرية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.hrByCategory.map(cat => {
                  const Icon = cat.icon;
                  const maxCost = Math.max(...stats.hrByCategory.map(c => c.cost), 1);
                  return (
                    <div key={cat.value} className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${cat.color}`}>
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
                })}
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
                {stats.techByCategory.map(cat => {
                  const Icon = cat.icon;
                  const maxCost = Math.max(...stats.techByCategory.map(c => c.cost), 1);
                  return (
                    <div key={cat.value} className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${cat.color}`}>
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
                })}
              </CardContent>
            </Card>

            {/* Budget Summary */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  {t({ en: 'Budget Allocation Summary', ar: 'ملخص توزيع الميزانية' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(stats.totals.hr.cost)}</p>
                    <p className="text-xs text-blue-600">{t({ en: 'Human Resources', ar: 'الموارد البشرية' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
                    <Cpu className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                    <p className="text-lg font-bold text-purple-700">{formatCurrency(stats.totals.tech.cost)}</p>
                    <p className="text-xs text-purple-600">{t({ en: 'Technology', ar: 'التقنية' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <Building className="h-5 w-5 mx-auto mb-1 text-slate-600" />
                    <p className="text-lg font-bold text-slate-700">{formatCurrency(stats.totals.infra.cost)}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Infrastructure', ar: 'البنية التحتية' })}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                    <p className="text-lg font-bold text-emerald-700">{formatCurrency(stats.grandTotal)}</p>
                    <p className="text-xs text-emerald-600">{t({ en: 'Grand Total', ar: 'المجموع الكلي' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
