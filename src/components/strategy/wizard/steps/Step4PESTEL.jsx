import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Globe, Plus, X, Building2, DollarSign, Users, Cpu, Leaf, Scale, 
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, 
  Minus, BarChart3, Clock, Target, Eye, ListChecks, PieChart
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { useEnvironmentalFactors } from '@/hooks/strategy/useEnvironmentalFactors';
import { cn } from '@/lib/utils';

const PESTEL_CATEGORIES = [
  { 
    key: 'political', 
    icon: Building2, 
    color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
    badgeColor: 'bg-purple-500',
    title: { en: 'Political', ar: 'سياسي' },
    description: { en: 'Government policies, regulations, political stability', ar: 'السياسات الحكومية واللوائح والاستقرار السياسي' },
    examples: { en: 'Vision 2030 initiatives, Municipal reforms, Decentralization policies', ar: 'مبادرات رؤية 2030، إصلاحات البلديات، سياسات اللامركزية' }
  },
  { 
    key: 'economic', 
    icon: DollarSign, 
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300',
    badgeColor: 'bg-green-500',
    title: { en: 'Economic', ar: 'اقتصادي' },
    description: { en: 'Economic growth, inflation, employment, investment climate', ar: 'النمو الاقتصادي والتضخم والتوظيف ومناخ الاستثمار' },
    examples: { en: 'Oil price fluctuations, Diversification efforts, PPP opportunities', ar: 'تقلبات أسعار النفط، جهود التنويع، فرص الشراكة' }
  },
  { 
    key: 'social', 
    icon: Users, 
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
    badgeColor: 'bg-blue-500',
    title: { en: 'Social', ar: 'اجتماعي' },
    description: { en: 'Demographics, culture, lifestyle, education levels', ar: 'التركيبة السكانية والثقافة وأسلوب الحياة ومستويات التعليم' },
    examples: { en: 'Youth population growth, Urbanization trends, Women empowerment', ar: 'نمو الشباب، اتجاهات التحضر، تمكين المرأة' }
  },
  { 
    key: 'technological', 
    icon: Cpu, 
    color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300',
    badgeColor: 'bg-orange-500',
    title: { en: 'Technological', ar: 'تقني' },
    description: { en: 'Technology adoption, innovation, digital infrastructure', ar: 'تبني التقنية والابتكار والبنية التحتية الرقمية' },
    examples: { en: 'Smart city technologies, AI adoption, 5G rollout, E-government', ar: 'تقنيات المدن الذكية، اعتماد الذكاء الاصطناعي، نشر الجيل الخامس' }
  },
  { 
    key: 'environmental', 
    icon: Leaf, 
    color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300',
    badgeColor: 'bg-emerald-500',
    title: { en: 'Environmental', ar: 'بيئي' },
    description: { en: 'Climate change, sustainability, natural resources', ar: 'تغير المناخ والاستدامة والموارد الطبيعية' },
    examples: { en: 'Saudi Green Initiative, Water scarcity, Renewable energy goals', ar: 'مبادرة السعودية الخضراء، ندرة المياه، أهداف الطاقة المتجددة' }
  },
  { 
    key: 'legal', 
    icon: Scale, 
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300',
    badgeColor: 'bg-red-500',
    title: { en: 'Legal', ar: 'قانوني' },
    description: { en: 'Laws, regulations, compliance requirements', ar: 'القوانين واللوائح ومتطلبات الامتثال' },
    examples: { en: 'Municipal law updates, Data protection regulations, Labor law reforms', ar: 'تحديثات نظام البلديات، لوائح حماية البيانات، إصلاحات نظام العمل' }
  }
];

const impactOptions = [
  { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'text-green-600 bg-green-100', icon: Minus },
  { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle },
  { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'text-red-600 bg-red-100', icon: Target }
];

const trendOptions = [
  { value: 'declining', label: { en: 'Declining', ar: 'متراجع' }, icon: TrendingDown, color: 'text-red-500' },
  { value: 'stable', label: { en: 'Stable', ar: 'مستقر' }, icon: Minus, color: 'text-gray-500' },
  { value: 'growing', label: { en: 'Growing', ar: 'متنامي' }, icon: TrendingUp, color: 'text-green-500' }
];

const timeframeOptions = [
  { value: 'short_term', label: { en: 'Short-term (0-2 yrs)', ar: 'قصير المدى (0-2 سنة)' } },
  { value: 'medium_term', label: { en: 'Medium-term (2-5 yrs)', ar: 'متوسط المدى (2-5 سنوات)' } },
  { value: 'long_term', label: { en: 'Long-term (5+ yrs)', ar: 'طويل المدى (5+ سنوات)' } }
];

export default function Step4PESTEL({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  isReadOnly = false,
  strategicPlanId = null
}) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('factors');
  const [expandedCategories, setExpandedCategories] = useState(
    PESTEL_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: true }), {})
  );

  const {
    factors: dbFactors,
    loading: dbLoading,
    saving: dbSaving,
    saveFactor,
    deleteFactor
  } = useEnvironmentalFactors(strategicPlanId);

  // Calculate statistics
  const stats = useMemo(() => {
    const allFactors = [];
    let highImpact = 0;
    let growing = 0;
    let shortTerm = 0;
    
    PESTEL_CATEGORIES.forEach(cat => {
      const factors = data.pestel?.[cat.key] || [];
      factors.forEach(f => {
        allFactors.push({ ...f, category: cat.key });
        if (f.impact === 'high') highImpact++;
        if (f.trend === 'growing') growing++;
        if (f.timeframe === 'short_term') shortTerm++;
      });
    });

    const categoryBreakdown = PESTEL_CATEGORIES.map(cat => ({
      ...cat,
      count: data.pestel?.[cat.key]?.length || 0
    }));

    return {
      total: allFactors.length,
      highImpact,
      growing,
      shortTerm,
      allFactors,
      categoryBreakdown
    };
  }, [data.pestel]);

  // Calculate completeness score
  const completenessScore = useMemo(() => {
    const categoriesWithFactors = PESTEL_CATEGORIES.filter(
      cat => (data.pestel?.[cat.key]?.length || 0) > 0
    ).length;
    const baseScore = (categoriesWithFactors / PESTEL_CATEGORIES.length) * 100;
    
    // Bonus for having multiple factors and implications
    const hasMultipleFactors = stats.total >= 6 ? 10 : 0;
    const hasImplications = stats.allFactors.filter(f => f.implications_en || f.implications_ar).length > 0 ? 10 : 0;
    
    return Math.min(100, Math.round(baseScore + hasMultipleFactors + hasImplications));
  }, [data.pestel, stats]);

  const toggleCategory = (key) => {
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addFactor = (category) => {
    if (isReadOnly) return;
    const newFactor = { 
      id: Date.now().toString(),
      factor_en: '',
      factor_ar: '',
      impact: 'medium',
      trend: 'stable',
      timeframe: 'medium_term',
      implications_en: '',
      implications_ar: ''
    };
    const currentFactors = data.pestel?.[category] || [];
    onChange({ 
      pestel: { 
        ...data.pestel, 
        [category]: [...currentFactors, newFactor] 
      } 
    });
  };

  const updateFactor = (category, index, field, value) => {
    if (isReadOnly) return;
    const currentFactors = [...(data.pestel?.[category] || [])];
    currentFactors[index] = { ...currentFactors[index], [field]: value };
    onChange({ pestel: { ...data.pestel, [category]: currentFactors } });
  };

  const removeFactor = (category, index) => {
    if (isReadOnly) return;
    const currentFactors = data.pestel?.[category] || [];
    onChange({ 
      pestel: { 
        ...data.pestel, 
        [category]: currentFactors.filter((_, i) => i !== index) 
      } 
    });
  };

  const isFactorComplete = (factor) => {
    return !!(factor.factor_en || factor.factor_ar) && 
           !!(factor.implications_en || factor.implications_ar);
  };

  // Progress indicator component
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

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <Card className="bg-gradient-to-br from-background to-muted/30 border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Circular Progress */}
            <CircularProgress value={completenessScore} />
            
            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'Total Factors', ar: 'إجمالي العوامل' })}</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-red-500">{stats.highImpact}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'High Impact', ar: 'تأثير عالي' })}</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-green-500">{stats.growing}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'Growing Trends', ar: 'اتجاهات متنامية' })}</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg border">
                <div className="text-2xl font-bold text-orange-500">{stats.shortTerm}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'Short-term', ar: 'قصير المدى' })}</div>
              </div>
            </div>

            {/* AI Generate Button */}
            {!isReadOnly && (
              <Button 
                variant="outline" 
                onClick={onGenerateAI} 
                disabled={isGenerating}
                className="gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating 
                  ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' })
                  : t({ en: 'Generate PESTEL', ar: 'إنشاء تحليل PESTEL' })
                }
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="factors" className="gap-2">
            <ListChecks className="w-4 h-4" />
            {t({ en: 'Factors', ar: 'العوامل' })}
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <PieChart className="w-4 h-4" />
            {t({ en: 'Overview', ar: 'نظرة عامة' })}
          </TabsTrigger>
          <TabsTrigger value="impact" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            {t({ en: 'Impact Matrix', ar: 'مصفوفة التأثير' })}
          </TabsTrigger>
        </TabsList>

        {/* Factors Tab */}
        <TabsContent value="factors" className="space-y-4">
          {PESTEL_CATEGORIES.map((category) => {
            const CategoryIcon = category.icon;
            const factors = data.pestel?.[category.key] || [];
            const isExpanded = expandedCategories[category.key];
            const categoryProgress = factors.length > 0 
              ? Math.round((factors.filter(isFactorComplete).length / factors.length) * 100) 
              : 0;
            
            return (
              <Collapsible 
                key={category.key} 
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.key)}
              >
                <Card className={cn("border-2 transition-all", category.color)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", category.color)}>
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{category.title[language]}</CardTitle>
                              <Badge variant="secondary">{factors.length}</Badge>
                              {factors.length > 0 && categoryProgress === 100 && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <CardDescription className="text-xs">{category.description[language]}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {factors.length > 0 && (
                            <div className="w-20">
                              <Progress value={categoryProgress} className="h-2" />
                            </div>
                          )}
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0">
                      <p className="text-xs text-muted-foreground italic mb-3">
                        {t({ en: 'Examples:', ar: 'أمثلة:' })} {category.examples[language]}
                      </p>

                      {factors.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                          <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          {t({ en: 'No factors added yet', ar: 'لم تتم إضافة عوامل بعد' })}
                          {!isReadOnly && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              onClick={() => addFactor(category.key)}
                              className="mt-2"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              {t({ en: 'Add your first factor', ar: 'أضف أول عامل' })}
                            </Button>
                          )}
                        </div>
                      ) : (
                        factors.map((factor, index) => (
                          <div 
                            key={factor.id} 
                            className={cn(
                              "p-4 bg-background rounded-lg border space-y-3 transition-all",
                              isFactorComplete(factor) && "border-green-300 bg-green-50/50 dark:bg-green-900/10"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs mb-1 block">{t({ en: 'Factor (English)', ar: 'العامل (إنجليزي)' })}</Label>
                                  <Input
                                    value={factor.factor_en || factor.factor || ''}
                                    onChange={(e) => updateFactor(category.key, index, 'factor_en', e.target.value)}
                                    placeholder={t({ en: 'Describe the factor...', ar: 'صف العامل...' })}
                                    className={cn(
                                      "font-medium",
                                      factor.factor_en && "border-green-300"
                                    )}
                                    disabled={isReadOnly}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs mb-1 block">{t({ en: 'Factor (Arabic)', ar: 'العامل (عربي)' })}</Label>
                                  <Input
                                    value={factor.factor_ar || ''}
                                    onChange={(e) => updateFactor(category.key, index, 'factor_ar', e.target.value)}
                                    placeholder={t({ en: 'Factor in Arabic...', ar: 'العامل بالعربية...' })}
                                    className={cn(
                                      "font-medium",
                                      factor.factor_ar && "border-green-300"
                                    )}
                                    dir="rtl"
                                    disabled={isReadOnly}
                                  />
                                </div>
                              </div>
                              {!isReadOnly && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeFactor(category.key, index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs mb-1 block">{t({ en: 'Impact', ar: 'التأثير' })}</Label>
                                <Select
                                  value={factor.impact}
                                  onValueChange={(v) => updateFactor(category.key, index, 'impact', v)}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {impactOptions.map(opt => {
                                      const OptIcon = opt.icon;
                                      return (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          <div className="flex items-center gap-2">
                                            <OptIcon className={cn("w-3 h-3", opt.color.split(' ')[0])} />
                                            <span>{opt.label[language]}</span>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-xs mb-1 block">{t({ en: 'Trend', ar: 'الاتجاه' })}</Label>
                                <Select
                                  value={factor.trend}
                                  onValueChange={(v) => updateFactor(category.key, index, 'trend', v)}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {trendOptions.map(opt => {
                                      const OptIcon = opt.icon;
                                      return (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          <div className="flex items-center gap-2">
                                            <OptIcon className={cn("w-3 h-3", opt.color)} />
                                            <span>{opt.label[language]}</span>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label className="text-xs mb-1 block">{t({ en: 'Timeframe', ar: 'الإطار الزمني' })}</Label>
                                <Select
                                  value={factor.timeframe}
                                  onValueChange={(v) => updateFactor(category.key, index, 'timeframe', v)}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeframeOptions.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label[language]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs mb-1 block">{t({ en: 'Strategic Implications (EN)', ar: 'الآثار الاستراتيجية (إنجليزي)' })}</Label>
                                <Input
                                  value={factor.implications_en || factor.implications || ''}
                                  onChange={(e) => updateFactor(category.key, index, 'implications_en', e.target.value)}
                                  placeholder={t({ en: 'What does this mean for your strategy?', ar: 'ماذا يعني هذا لاستراتيجيتك؟' })}
                                  className={cn(
                                    "text-sm",
                                    factor.implications_en && "border-green-300"
                                  )}
                                  disabled={isReadOnly}
                                />
                              </div>
                              <div>
                                <Label className="text-xs mb-1 block">{t({ en: 'Strategic Implications (AR)', ar: 'الآثار الاستراتيجية (عربي)' })}</Label>
                                <Input
                                  value={factor.implications_ar || ''}
                                  onChange={(e) => updateFactor(category.key, index, 'implications_ar', e.target.value)}
                                  placeholder={t({ en: 'Implications in Arabic', ar: 'الآثار بالعربية' })}
                                  className={cn(
                                    "text-sm",
                                    factor.implications_ar && "border-green-300"
                                  )}
                                  dir="rtl"
                                  disabled={isReadOnly}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {!isReadOnly && factors.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addFactor(category.key)}
                          className="w-full mt-2"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {t({ en: 'Add Another Factor', ar: 'إضافة عامل آخر' })}
                        </Button>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                {t({ en: 'Category Distribution', ar: 'توزيع الفئات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.categoryBreakdown.map(cat => {
                  const CategoryIcon = cat.icon;
                  return (
                    <div 
                      key={cat.key}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all",
                        cat.color,
                        cat.count > 0 && "ring-2 ring-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className="w-5 h-5" />
                        <span className="font-medium">{cat.title[language]}</span>
                      </div>
                      <div className="text-3xl font-bold">{cat.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {t({ en: 'factors', ar: 'عوامل' })}
                      </div>
                      {cat.count === 0 && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {t({ en: 'Not started', ar: 'لم يبدأ' })}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">{t({ en: 'Analysis Summary', ar: 'ملخص التحليل' })}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">{t({ en: 'Categories Covered', ar: 'الفئات المغطاة' })}</div>
                    <div className="font-bold text-lg">
                      {stats.categoryBreakdown.filter(c => c.count > 0).length} / 6
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t({ en: 'Avg per Category', ar: 'المتوسط لكل فئة' })}</div>
                    <div className="font-bold text-lg">
                      {stats.total > 0 ? (stats.total / 6).toFixed(1) : 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t({ en: 'High Impact %', ar: 'نسبة التأثير العالي' })}</div>
                    <div className="font-bold text-lg text-red-500">
                      {stats.total > 0 ? Math.round((stats.highImpact / stats.total) * 100) : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t({ en: 'Growing Trends %', ar: 'نسبة الاتجاهات المتنامية' })}</div>
                    <div className="font-bold text-lg text-green-500">
                      {stats.total > 0 ? Math.round((stats.growing / stats.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Matrix Tab */}
        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t({ en: 'Impact & Trend Matrix', ar: 'مصفوفة التأثير والاتجاه' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Visual representation of factors by impact level and trend direction', ar: 'تمثيل مرئي للعوامل حسب مستوى التأثير واتجاه الاتجاه' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.total === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t({ en: 'Add factors to see the impact matrix', ar: 'أضف عوامل لرؤية مصفوفة التأثير' })}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {/* Header Row */}
                  <div className="text-center p-2 font-medium text-sm text-muted-foreground">
                    <TrendingDown className="w-4 h-4 mx-auto mb-1" />
                    {t({ en: 'Declining', ar: 'متراجع' })}
                  </div>
                  <div className="text-center p-2 font-medium text-sm text-muted-foreground">
                    <Minus className="w-4 h-4 mx-auto mb-1" />
                    {t({ en: 'Stable', ar: 'مستقر' })}
                  </div>
                  <div className="text-center p-2 font-medium text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1" />
                    {t({ en: 'Growing', ar: 'متنامي' })}
                  </div>

                  {/* High Impact Row */}
                  {['declining', 'stable', 'growing'].map(trend => {
                    const factors = stats.allFactors.filter(f => f.impact === 'high' && f.trend === trend);
                    return (
                      <div 
                        key={`high-${trend}`}
                        className={cn(
                          "p-3 rounded-lg min-h-[100px] border-2",
                          "bg-red-50 dark:bg-red-900/20 border-red-200"
                        )}
                      >
                        <div className="text-xs font-medium text-red-600 mb-2">
                          {t({ en: 'High Impact', ar: 'تأثير عالي' })}
                        </div>
                        <div className="space-y-1">
                          {factors.map((f, i) => {
                            const cat = PESTEL_CATEGORIES.find(c => c.key === f.category);
                            return (
                              <Badge 
                                key={i} 
                                variant="secondary" 
                                className="text-xs block truncate"
                                title={f.factor_en || f.factor_ar}
                              >
                                {cat?.title[language]}: {(f.factor_en || f.factor_ar || '').substring(0, 20)}...
                              </Badge>
                            );
                          })}
                          {factors.length === 0 && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Medium Impact Row */}
                  {['declining', 'stable', 'growing'].map(trend => {
                    const factors = stats.allFactors.filter(f => f.impact === 'medium' && f.trend === trend);
                    return (
                      <div 
                        key={`medium-${trend}`}
                        className={cn(
                          "p-3 rounded-lg min-h-[100px] border-2",
                          "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"
                        )}
                      >
                        <div className="text-xs font-medium text-yellow-600 mb-2">
                          {t({ en: 'Medium Impact', ar: 'تأثير متوسط' })}
                        </div>
                        <div className="space-y-1">
                          {factors.map((f, i) => {
                            const cat = PESTEL_CATEGORIES.find(c => c.key === f.category);
                            return (
                              <Badge 
                                key={i} 
                                variant="secondary" 
                                className="text-xs block truncate"
                                title={f.factor_en || f.factor_ar}
                              >
                                {cat?.title[language]}: {(f.factor_en || f.factor_ar || '').substring(0, 20)}...
                              </Badge>
                            );
                          })}
                          {factors.length === 0 && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Low Impact Row */}
                  {['declining', 'stable', 'growing'].map(trend => {
                    const factors = stats.allFactors.filter(f => f.impact === 'low' && f.trend === trend);
                    return (
                      <div 
                        key={`low-${trend}`}
                        className={cn(
                          "p-3 rounded-lg min-h-[100px] border-2",
                          "bg-green-50 dark:bg-green-900/20 border-green-200"
                        )}
                      >
                        <div className="text-xs font-medium text-green-600 mb-2">
                          {t({ en: 'Low Impact', ar: 'تأثير منخفض' })}
                        </div>
                        <div className="space-y-1">
                          {factors.map((f, i) => {
                            const cat = PESTEL_CATEGORIES.find(c => c.key === f.category);
                            return (
                              <Badge 
                                key={i} 
                                variant="secondary" 
                                className="text-xs block truncate"
                                title={f.factor_en || f.factor_ar}
                              >
                                {cat?.title[language]}: {(f.factor_en || f.factor_ar || '').substring(0, 20)}...
                              </Badge>
                            );
                          })}
                          {factors.length === 0 && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-200"></div>
                  <span>{t({ en: 'High Impact - Requires immediate attention', ar: 'تأثير عالي - يتطلب اهتمام فوري' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-200"></div>
                  <span>{t({ en: 'Medium Impact - Monitor closely', ar: 'تأثير متوسط - راقب عن كثب' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-200"></div>
                  <span>{t({ en: 'Low Impact - Keep informed', ar: 'تأثير منخفض - ابق على اطلاع' })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
