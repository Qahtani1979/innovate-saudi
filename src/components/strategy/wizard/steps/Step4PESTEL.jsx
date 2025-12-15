import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Globe, Plus, X, Building2, DollarSign, Users, Cpu, Leaf, Scale } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { cn } from '@/lib/utils';

const PESTEL_CATEGORIES = [
  { 
    key: 'political', 
    icon: Building2, 
    color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
    title: { en: 'Political', ar: 'سياسي' },
    description: { en: 'Government policies, regulations, political stability', ar: 'السياسات الحكومية واللوائح والاستقرار السياسي' },
    examples: { en: 'Vision 2030 initiatives, Municipal reforms, Decentralization policies', ar: 'مبادرات رؤية 2030، إصلاحات البلديات، سياسات اللامركزية' }
  },
  { 
    key: 'economic', 
    icon: DollarSign, 
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300',
    title: { en: 'Economic', ar: 'اقتصادي' },
    description: { en: 'Economic growth, inflation, employment, investment climate', ar: 'النمو الاقتصادي والتضخم والتوظيف ومناخ الاستثمار' },
    examples: { en: 'Oil price fluctuations, Diversification efforts, PPP opportunities', ar: 'تقلبات أسعار النفط، جهود التنويع، فرص الشراكة' }
  },
  { 
    key: 'social', 
    icon: Users, 
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
    title: { en: 'Social', ar: 'اجتماعي' },
    description: { en: 'Demographics, culture, lifestyle, education levels', ar: 'التركيبة السكانية والثقافة وأسلوب الحياة ومستويات التعليم' },
    examples: { en: 'Youth population growth, Urbanization trends, Women empowerment', ar: 'نمو الشباب، اتجاهات التحضر، تمكين المرأة' }
  },
  { 
    key: 'technological', 
    icon: Cpu, 
    color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300',
    title: { en: 'Technological', ar: 'تقني' },
    description: { en: 'Technology adoption, innovation, digital infrastructure', ar: 'تبني التقنية والابتكار والبنية التحتية الرقمية' },
    examples: { en: 'Smart city technologies, AI adoption, 5G rollout, E-government', ar: 'تقنيات المدن الذكية، اعتماد الذكاء الاصطناعي، نشر الجيل الخامس' }
  },
  { 
    key: 'environmental', 
    icon: Leaf, 
    color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300',
    title: { en: 'Environmental', ar: 'بيئي' },
    description: { en: 'Climate change, sustainability, natural resources', ar: 'تغير المناخ والاستدامة والموارد الطبيعية' },
    examples: { en: 'Saudi Green Initiative, Water scarcity, Renewable energy goals', ar: 'مبادرة السعودية الخضراء، ندرة المياه، أهداف الطاقة المتجددة' }
  },
  { 
    key: 'legal', 
    icon: Scale, 
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300',
    title: { en: 'Legal', ar: 'قانوني' },
    description: { en: 'Laws, regulations, compliance requirements', ar: 'القوانين واللوائح ومتطلبات الامتثال' },
    examples: { en: 'Municipal law updates, Data protection regulations, Labor law reforms', ar: 'تحديثات نظام البلديات، لوائح حماية البيانات، إصلاحات نظام العمل' }
  }
];

export default function Step4PESTEL({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  const addFactor = (category) => {
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
    const currentFactors = [...(data.pestel?.[category] || [])];
    currentFactors[index] = { ...currentFactors[index], [field]: value };
    onChange({ pestel: { ...data.pestel, [category]: currentFactors } });
  };

  const removeFactor = (category, index) => {
    const currentFactors = data.pestel?.[category] || [];
    onChange({ 
      pestel: { 
        ...data.pestel, 
        [category]: currentFactors.filter((_, i) => i !== index) 
      } 
    });
  };

  const impactOptions = [
    { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'text-green-600' },
    { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'text-yellow-600' },
    { value: 'high', label: { en: 'High', ar: 'مرتفع' }, color: 'text-red-600' }
  ];

  const trendOptions = [
    { value: 'declining', label: { en: 'Declining', ar: 'متراجع' } },
    { value: 'stable', label: { en: 'Stable', ar: 'مستقر' } },
    { value: 'growing', label: { en: 'Growing', ar: 'متنامي' } }
  ];

  const timeframeOptions = [
    { value: 'short_term', label: { en: 'Short-term (0-2 yrs)', ar: 'قصير المدى (0-2 سنة)' } },
    { value: 'medium_term', label: { en: 'Medium-term (2-5 yrs)', ar: 'متوسط المدى (2-5 سنوات)' } },
    { value: 'long_term', label: { en: 'Long-term (5+ yrs)', ar: 'طويل المدى (5+ سنوات)' } }
  ];

  const getTotalFactors = () => {
    return PESTEL_CATEGORIES.reduce((sum, cat) => sum + (data.pestel?.[cat.key]?.length || 0), 0);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with AI Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {t({ 
              en: 'Analyze external macro-environmental factors that may impact your strategic plan.',
              ar: 'تحليل العوامل البيئية الكلية الخارجية التي قد تؤثر على خطتك الاستراتيجية.'
            })}
          </p>
          <Badge variant="secondary" className="mt-2">
            {getTotalFactors()} {t({ en: 'factors identified', ar: 'عوامل محددة' })}
          </Badge>
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
            : t({ en: 'Generate PESTEL', ar: 'إنشاء تحليل PESTEL' })
          }
        </Button>
      </div>

      {/* PESTEL Categories */}
      <div className="grid gap-4">
        {PESTEL_CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          const factors = data.pestel?.[category.key] || [];
          
          return (
            <Card key={category.key} className={cn("border-2", category.color)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-5 h-5" />
                    <CardTitle className="text-lg">{category.title[language]}</CardTitle>
                    <Badge variant="secondary">{factors.length}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => addFactor(category.key)}>
                    <Plus className="w-4 h-4 mr-1" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                <CardDescription>{category.description[language]}</CardDescription>
                <p className="text-xs text-muted-foreground italic">
                  {t({ en: 'Examples:', ar: 'أمثلة:' })} {category.examples[language]}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {factors.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm border border-dashed rounded">
                    {t({ en: 'No factors added yet', ar: 'لم تتم إضافة عوامل بعد' })}
                  </div>
                ) : (
                  factors.map((factor, index) => (
                    <div key={factor.id} className="p-3 bg-background rounded-lg border space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            value={factor.factor_en || factor.factor || ''}
                            onChange={(e) => updateFactor(category.key, index, 'factor_en', e.target.value)}
                            placeholder={t({ en: 'Factor (English)...', ar: 'العامل (إنجليزي)...' })}
                            className="font-medium"
                          />
                          <Input
                            value={factor.factor_ar || ''}
                            onChange={(e) => updateFactor(category.key, index, 'factor_ar', e.target.value)}
                            placeholder={t({ en: 'Factor (Arabic)...', ar: 'العامل (عربي)...' })}
                            className="font-medium"
                            dir="rtl"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFactor(category.key, index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">{t({ en: 'Impact', ar: 'التأثير' })}</Label>
                          <Select
                            value={factor.impact}
                            onValueChange={(v) => updateFactor(category.key, index, 'impact', v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {impactOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <span className={opt.color}>{opt.label[language]}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">{t({ en: 'Trend', ar: 'الاتجاه' })}</Label>
                          <Select
                            value={factor.trend}
                            onValueChange={(v) => updateFactor(category.key, index, 'trend', v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {trendOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label[language]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">{t({ en: 'Timeframe', ar: 'الإطار الزمني' })}</Label>
                          <Select
                            value={factor.timeframe}
                            onValueChange={(v) => updateFactor(category.key, index, 'timeframe', v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
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
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">{t({ en: 'Implications (EN)', ar: 'الآثار (إنجليزي)' })}</Label>
                          <Input
                            value={factor.implications_en || factor.implications || ''}
                            onChange={(e) => updateFactor(category.key, index, 'implications_en', e.target.value)}
                            placeholder={t({ en: 'What does this mean for your strategy?', ar: 'ماذا يعني هذا لاستراتيجيتك؟' })}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t({ en: 'Implications (AR)', ar: 'الآثار (عربي)' })}</Label>
                          <Input
                            value={factor.implications_ar || ''}
                            onChange={(e) => updateFactor(category.key, index, 'implications_ar', e.target.value)}
                            placeholder={t({ en: 'Arabic implications', ar: 'الآثار بالعربية' })}
                            className="text-sm"
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
