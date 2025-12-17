import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Loader2, Plus, X, TrendingUp, TrendingDown, Target, AlertTriangle, 
  CheckCircle2, LayoutGrid, ListChecks, Lightbulb, ArrowRight, Shield, Zap, BarChart3, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { useSwotAnalysis } from '@/hooks/strategy/useSwotAnalysis';
import { cn } from '@/lib/utils';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, StatsGrid } from '../shared';

const CATEGORIES = [
  { 
    key: 'strengths', 
    title: { en: 'Strengths', ar: 'نقاط القوة' },
    description: { en: 'Internal positive factors that give advantage', ar: 'العوامل الإيجابية الداخلية التي تمنح ميزة' },
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    badgeColor: 'bg-green-500',
    quadrant: 'internal-positive'
  },
  { 
    key: 'weaknesses', 
    title: { en: 'Weaknesses', ar: 'نقاط الضعف' },
    description: { en: 'Internal negative factors that hinder progress', ar: 'العوامل السلبية الداخلية التي تعيق التقدم' },
    icon: TrendingDown,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    badgeColor: 'bg-red-500',
    quadrant: 'internal-negative'
  },
  { 
    key: 'opportunities', 
    title: { en: 'Opportunities', ar: 'الفرص' },
    description: { en: 'External positive factors to leverage', ar: 'العوامل الإيجابية الخارجية للاستفادة منها' },
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-500',
    quadrant: 'external-positive'
  },
  { 
    key: 'threats', 
    title: { en: 'Threats', ar: 'التهديدات' },
    description: { en: 'External negative factors to mitigate', ar: 'العوامل السلبية الخارجية للتخفيف منها' },
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    badgeColor: 'bg-amber-500',
    quadrant: 'external-negative'
  }
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: { en: 'High', ar: 'عالي' }, color: 'text-red-600 bg-red-100' },
  { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'text-yellow-600 bg-yellow-100' },
  { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'text-green-600 bg-green-100' }
];

export default function Step2SWOT({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  isReadOnly = false,
  strategicPlanId = null
}) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('matrix');
  const [newItems, setNewItems] = useState({ 
    strengths: { en: '', ar: '' }, 
    weaknesses: { en: '', ar: '' }, 
    opportunities: { en: '', ar: '' }, 
    threats: { en: '', ar: '' } 
  });
  
  const { 
    swotData: dbSwotData, 
    loading: dbLoading, 
    saving: dbSaving, 
    saveSwotAnalysis 
  } = useSwotAnalysis(strategicPlanId);
  
  useEffect(() => {
    if (strategicPlanId && dbSwotData && !dbLoading) {
      const hasDbData = ['strengths', 'weaknesses', 'opportunities', 'threats'].some(
        key => dbSwotData[key]?.length > 0
      );
      if (hasDbData && !data.swot) {
        onChange({ swot: dbSwotData });
      }
    }
  }, [strategicPlanId, dbSwotData, dbLoading]);

  const swot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };

  // Calculate statistics
  const stats = useMemo(() => {
    const counts = {
      strengths: swot.strengths?.length || 0,
      weaknesses: swot.weaknesses?.length || 0,
      opportunities: swot.opportunities?.length || 0,
      threats: swot.threats?.length || 0
    };
    
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const internal = counts.strengths + counts.weaknesses;
    const external = counts.opportunities + counts.threats;
    const positive = counts.strengths + counts.opportunities;
    const negative = counts.weaknesses + counts.threats;
    
    let highPriority = 0;
    CATEGORIES.forEach(cat => {
      (swot[cat.key] || []).forEach(item => {
        if (item.priority === 'high') highPriority++;
      });
    });

    return { counts, total, internal, external, positive, negative, highPriority };
  }, [swot]);

  // Calculate completeness score
  const completenessScore = useMemo(() => {
    const categoriesWithItems = CATEGORIES.filter(cat => stats.counts[cat.key] > 0).length;
    const baseScore = (categoriesWithItems / 4) * 100;
    
    // Bonus for balance and multiple items
    const hasBalance = stats.internal > 0 && stats.external > 0 ? 10 : 0;
    const hasMultiple = stats.total >= 8 ? 10 : 0;
    
    return Math.min(100, Math.round(baseScore + hasBalance + hasMultiple));
  }, [stats]);

  const addItem = (category) => {
    if (isReadOnly) return;
    const enText = newItems[category].en?.trim();
    const arText = newItems[category].ar?.trim();
    if (enText || arText) {
      const updated = {
        ...swot,
        [category]: [...(swot[category] || []), { 
          id: Date.now().toString(),
          text_en: enText || '', 
          text_ar: arText || '', 
          priority: 'medium' 
        }]
      };
      onChange({ swot: updated });
      setNewItems({ ...newItems, [category]: { en: '', ar: '' } });
    }
  };

  const removeItem = (category, index) => {
    if (isReadOnly) return;
    const updated = {
      ...swot,
      [category]: swot[category].filter((_, i) => i !== index)
    };
    onChange({ swot: updated });
  };

  const updateItem = (category, index, field, value) => {
    if (isReadOnly) return;
    const updated = {
      ...swot,
      [category]: swot[category].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    };
    onChange({ swot: updated });
  };

  const isItemComplete = (item) => {
    return !!(item.text_en || item.text_ar);
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

  // SWOT Quadrant Card Component
  const SwotQuadrant = ({ category }) => {
    const Icon = category.icon;
    const items = swot[category.key] || [];
    const categoryProgress = items.length > 0 
      ? Math.round((items.filter(isItemComplete).length / items.length) * 100) 
      : 0;

    return (
      <Card className={cn("border-2 h-full", category.bgColor)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className={cn("flex items-center gap-2 text-base", category.color)}>
              <Icon className="h-5 w-5" />
              {category.title[language]}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{items.length}</Badge>
              {items.length > 0 && categoryProgress === 100 && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          <CardDescription className="text-xs">
            {category.description[language]}
          </CardDescription>
          {items.length > 0 && (
            <Progress value={categoryProgress} className="h-1 mt-2" />
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add new item */}
          {!isReadOnly && (
            <div className="space-y-2 p-2 bg-background/50 rounded-lg border border-dashed">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">English</Label>
                  <Input
                    value={newItems[category.key].en}
                    onChange={(e) => setNewItems({ ...newItems, [category.key]: { ...newItems[category.key], en: e.target.value } })}
                    placeholder={t({ en: 'English text...', ar: 'النص بالإنجليزية...' })}
                    className="bg-background text-sm h-8"
                    onKeyDown={(e) => e.key === 'Enter' && addItem(category.key)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">العربية</Label>
                  <Input
                    value={newItems[category.key].ar}
                    onChange={(e) => setNewItems({ ...newItems, [category.key]: { ...newItems[category.key], ar: e.target.value } })}
                    placeholder={t({ en: 'Arabic text...', ar: 'النص بالعربية...' })}
                    className="bg-background text-sm h-8"
                    dir="rtl"
                    onKeyDown={(e) => e.key === 'Enter' && addItem(category.key)}
                  />
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => addItem(category.key)} className="w-full h-7">
                <Plus className="h-3 w-3 mr-1" />
                {t({ en: 'Add', ar: 'إضافة' })}
              </Button>
            </div>
          )}

          {/* Items list */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {items.map((item, index) => (
              <div 
                key={item.id || index} 
                className={cn(
                  "p-2 bg-background rounded-md border space-y-2 transition-all",
                  isItemComplete(item) && "border-green-300"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      value={item.text_en || item.text || ''}
                      onChange={(e) => updateItem(category.key, index, 'text_en', e.target.value)}
                      placeholder="English"
                      className={cn("text-sm h-7", item.text_en && "border-green-300")}
                      disabled={isReadOnly}
                    />
                    <Input
                      value={item.text_ar || ''}
                      onChange={(e) => updateItem(category.key, index, 'text_ar', e.target.value)}
                      placeholder="العربية"
                      className={cn("text-sm h-7", item.text_ar && "border-green-300")}
                      dir="rtl"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Select
                      value={item.priority || 'medium'}
                      onValueChange={(v) => updateItem(category.key, index, 'priority', v)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="h-7 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className={opt.color.split(' ')[0]}>{opt.label[language]}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isReadOnly && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-destructive" 
                        onClick={() => removeItem(category.key, index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t({ en: `No ${category.key} added yet`, ar: 'لم تتم إضافة عناصر بعد' })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <StepDashboardHeader
        score={completenessScore}
        title={t({ en: 'SWOT Analysis', ar: 'تحليل SWOT' })}
        subtitle={t({ en: 'Strengths, Weaknesses, Opportunities, Threats', ar: 'نقاط القوة والضعف والفرص والتهديدات' })}
        language={language}
        stats={[
          { icon: Target, value: stats.total, label: t({ en: 'Total Items', ar: 'إجمالي العناصر' }), iconColor: 'text-primary' },
          { icon: Shield, value: stats.internal, label: t({ en: 'Internal', ar: 'داخلي' }), iconColor: 'text-blue-500' },
          { icon: Zap, value: stats.external, label: t({ en: 'External', ar: 'خارجي' }), iconColor: 'text-purple-500' },
          { icon: AlertTriangle, value: stats.highPriority, label: t({ en: 'High Priority', ar: 'أولوية عالية' }), iconColor: 'text-red-500' },
        ]}
      />
      
      {/* AI Generate Button */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button 
            onClick={onGenerateAI} 
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {t({ en: 'Generate SWOT', ar: 'إنشاء SWOT' })}
          </Button>
        </div>
      )}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="matrix" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Matrix', ar: 'المصفوفة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <ListChecks className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'List', ar: 'القائمة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="strategies" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Strategies', ar: 'الاستراتيجيات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
          </TabsTrigger>
        </TabsList>

        {/* Matrix View Tab */}
        <TabsContent value="matrix" className="space-y-4">
          {/* Headers */}
          <div className="grid grid-cols-3 gap-2 text-center text-sm font-medium">
            <div></div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
              {t({ en: 'Positive', ar: 'إيجابي' })}
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded">
              {t({ en: 'Negative', ar: 'سلبي' })}
            </div>
          </div>

          {/* Internal Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-sm font-medium">
              {t({ en: 'Internal', ar: 'داخلي' })}
            </div>
            <SwotQuadrant category={CATEGORIES[0]} />
            <SwotQuadrant category={CATEGORIES[1]} />
          </div>

          {/* External Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center justify-center p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-sm font-medium">
              {t({ en: 'External', ar: 'خارجي' })}
            </div>
            <SwotQuadrant category={CATEGORIES[2]} />
            <SwotQuadrant category={CATEGORIES[3]} />
          </div>
        </TabsContent>

        {/* List View Tab */}
        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
              <SwotQuadrant key={cat.key} category={cat} />
            ))}
          </div>
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SO Strategies */}
            <Card className="border-2 border-green-200 bg-green-50/50 dark:bg-green-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Shield className="w-5 h-5" />
                  {t({ en: 'SO Strategies', ar: 'استراتيجيات القوة-الفرص' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Use Strengths to capitalize on Opportunities', ar: 'استخدام نقاط القوة للاستفادة من الفرص' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Badge className="bg-green-500">S</Badge>
                  <ArrowRight className="w-4 h-4" />
                  <Badge className="bg-blue-500">O</Badge>
                </div>
                {stats.counts.strengths > 0 && stats.counts.opportunities > 0 ? (
                  <p className="text-sm">
                    {t({ 
                      en: `Leverage ${stats.counts.strengths} strengths to pursue ${stats.counts.opportunities} opportunities`,
                      ar: `استفد من ${stats.counts.strengths} نقاط قوة لمتابعة ${stats.counts.opportunities} فرص`
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t({ en: 'Add strengths and opportunities to see strategies', ar: 'أضف نقاط قوة وفرص لرؤية الاستراتيجيات' })}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* WO Strategies */}
            <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Zap className="w-5 h-5" />
                  {t({ en: 'WO Strategies', ar: 'استراتيجيات الضعف-الفرص' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Overcome Weaknesses by exploiting Opportunities', ar: 'تجاوز نقاط الضعف من خلال استغلال الفرص' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Badge className="bg-red-500">W</Badge>
                  <ArrowRight className="w-4 h-4" />
                  <Badge className="bg-blue-500">O</Badge>
                </div>
                {stats.counts.weaknesses > 0 && stats.counts.opportunities > 0 ? (
                  <p className="text-sm">
                    {t({ 
                      en: `Address ${stats.counts.weaknesses} weaknesses through ${stats.counts.opportunities} opportunities`,
                      ar: `عالج ${stats.counts.weaknesses} نقاط ضعف من خلال ${stats.counts.opportunities} فرص`
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t({ en: 'Add weaknesses and opportunities to see strategies', ar: 'أضف نقاط ضعف وفرص لرؤية الاستراتيجيات' })}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ST Strategies */}
            <Card className="border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Shield className="w-5 h-5" />
                  {t({ en: 'ST Strategies', ar: 'استراتيجيات القوة-التهديدات' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Use Strengths to avoid or minimize Threats', ar: 'استخدام نقاط القوة لتجنب أو تقليل التهديدات' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Badge className="bg-green-500">S</Badge>
                  <ArrowRight className="w-4 h-4" />
                  <Badge className="bg-amber-500">T</Badge>
                </div>
                {stats.counts.strengths > 0 && stats.counts.threats > 0 ? (
                  <p className="text-sm">
                    {t({ 
                      en: `Use ${stats.counts.strengths} strengths to counter ${stats.counts.threats} threats`,
                      ar: `استخدم ${stats.counts.strengths} نقاط قوة لمواجهة ${stats.counts.threats} تهديدات`
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t({ en: 'Add strengths and threats to see strategies', ar: 'أضف نقاط قوة وتهديدات لرؤية الاستراتيجيات' })}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* WT Strategies */}
            <Card className="border-2 border-red-200 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  {t({ en: 'WT Strategies', ar: 'استراتيجيات الضعف-التهديدات' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Minimize Weaknesses and avoid Threats', ar: 'تقليل نقاط الضعف وتجنب التهديدات' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Badge className="bg-red-500">W</Badge>
                  <ArrowRight className="w-4 h-4" />
                  <Badge className="bg-amber-500">T</Badge>
                </div>
                {stats.counts.weaknesses > 0 && stats.counts.threats > 0 ? (
                  <p className="text-sm">
                    {t({ 
                      en: `Protect against ${stats.counts.threats} threats while addressing ${stats.counts.weaknesses} weaknesses`,
                      ar: `احمِ من ${stats.counts.threats} تهديدات أثناء معالجة ${stats.counts.weaknesses} نقاط ضعف`
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t({ en: 'Add weaknesses and threats to see strategies', ar: 'أضف نقاط ضعف وتهديدات لرؤية الاستراتيجيات' })}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Balance Indicator */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t({ en: 'Analysis Balance', ar: 'توازن التحليل' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t({ en: 'Internal vs External', ar: 'داخلي مقابل خارجي' })}</span>
                    <span>{stats.internal} : {stats.external}</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 transition-all" 
                      style={{ width: `${stats.total > 0 ? (stats.internal / stats.total) * 100 : 50}%` }}
                    />
                    <div 
                      className="bg-purple-500 transition-all" 
                      style={{ width: `${stats.total > 0 ? (stats.external / stats.total) * 100 : 50}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t({ en: 'Positive vs Negative', ar: 'إيجابي مقابل سلبي' })}</span>
                    <span>{stats.positive} : {stats.negative}</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 transition-all" 
                      style={{ width: `${stats.total > 0 ? (stats.positive / stats.total) * 100 : 50}%` }}
                    />
                    <div 
                      className="bg-red-500 transition-all" 
                      style={{ width: `${stats.total > 0 ? (stats.negative / stats.total) * 100 : 50}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab - Using Shared Components */}
        <TabsContent value="summary" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SWOT Distribution */}
            <StatsGrid
              stats={[
                { value: stats.byType.S || 0, label: t({ en: 'Strengths', ar: 'نقاط القوة' }), icon: CheckCircle2, iconColor: 'text-green-600', valueColor: 'text-green-600' },
                { value: stats.byType.W || 0, label: t({ en: 'Weaknesses', ar: 'نقاط الضعف' }), icon: AlertCircle, iconColor: 'text-red-600', valueColor: 'text-red-600' },
                { value: stats.byType.O || 0, label: t({ en: 'Opportunities', ar: 'الفرص' }), icon: TrendingUp, iconColor: 'text-blue-600', valueColor: 'text-blue-600' },
                { value: stats.byType.T || 0, label: t({ en: 'Threats', ar: 'التهديدات' }), icon: AlertTriangle, iconColor: 'text-amber-600', valueColor: 'text-amber-600' }
              ]}
              columns={4}
              language={language}
              className="md:col-span-2"
            />

            {/* Balance Analysis */}
            <DistributionChart
              title={t({ en: 'Balance Analysis', ar: 'تحليل التوازن' })}
              data={[
                { label: { en: 'Internal (S+W)', ar: 'داخلي' }, value: stats.internal, iconColor: 'text-primary' },
                { label: { en: 'External (O+T)', ar: 'خارجي' }, value: stats.external, iconColor: 'text-purple-600' },
                { label: { en: 'Positive (S+O)', ar: 'إيجابي' }, value: stats.positive, iconColor: 'text-green-600' },
                { label: { en: 'Negative (W+T)', ar: 'سلبي' }, value: stats.negative, iconColor: 'text-red-600' }
              ]}
              language={language}
              showPercentage={false}
            />

            {/* Recommendations */}
            <RecommendationsCard
              title={t({ en: 'Recommendations', ar: 'توصيات' })}
              recommendations={stats.total < 8 ? [
                { type: 'warning', message: { en: 'Add more SWOT items for comprehensive analysis (recommended: 2+ per category)', ar: 'أضف المزيد من عناصر SWOT للتحليل الشامل (موصى به: 2+ لكل فئة)' } }
              ] : []}
              language={language}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
