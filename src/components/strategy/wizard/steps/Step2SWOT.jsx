import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Plus, X, TrendingUp, TrendingDown, Target, AlertTriangle, Save } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { useSwotAnalysis } from '@/hooks/strategy/useSwotAnalysis';

export default function Step2SWOT({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating,
  strategicPlanId = null // Optional: for DB persistence
}) {
  const { language, t, isRTL } = useLanguage();
  const [newItems, setNewItems] = useState({ strengths: { en: '', ar: '' }, weaknesses: { en: '', ar: '' }, opportunities: { en: '', ar: '' }, threats: { en: '', ar: '' } });
  
  // DB persistence hook - only active when strategicPlanId is provided
  const { 
    swotData: dbSwotData, 
    loading: dbLoading, 
    saving: dbSaving, 
    saveSwotAnalysis 
  } = useSwotAnalysis(strategicPlanId);
  
  // Sync DB data to local state on load (only if planId exists and DB has data)
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

  const addItem = (category) => {
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
    const updated = {
      ...swot,
      [category]: swot[category].filter((_, i) => i !== index)
    };
    onChange({ swot: updated });
  };

  const setPriority = (category, index, priority) => {
    const updated = {
      ...swot,
      [category]: swot[category].map((item, i) => 
        i === index ? { ...item, priority } : item
      )
    };
    onChange({ swot: updated });
  };

  const updateItem = (category, index, field, value) => {
    const updated = {
      ...swot,
      [category]: swot[category].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    };
    onChange({ swot: updated });
  };

  // Helper to get display text (handles legacy 'text' field)
  const getDisplayText = (item) => {
    if (item.text_en || item.text_ar) {
      return language === 'ar' ? (item.text_ar || item.text_en) : (item.text_en || item.text_ar);
    }
    return typeof item === 'string' ? item : (item.text || '');
  };

  const categories = [
    { 
      key: 'strengths', 
      title: { en: 'Strengths', ar: 'نقاط القوة' },
      description: { en: 'Internal positive factors', ar: 'العوامل الإيجابية الداخلية' },
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    },
    { 
      key: 'weaknesses', 
      title: { en: 'Weaknesses', ar: 'نقاط الضعف' },
      description: { en: 'Internal negative factors', ar: 'العوامل السلبية الداخلية' },
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200'
    },
    { 
      key: 'opportunities', 
      title: { en: 'Opportunities', ar: 'الفرص' },
      description: { en: 'External positive factors', ar: 'العوامل الإيجابية الخارجية' },
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    { 
      key: 'threats', 
      title: { en: 'Threats', ar: 'التهديدات' },
      description: { en: 'External negative factors', ar: 'العوامل السلبية الخارجية' },
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200'
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{t({ en: 'AI-Powered SWOT Analysis', ar: 'تحليل SWOT بالذكاء الاصطناعي' })}</h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Generate SWOT based on your context and Saudi municipal landscape', ar: 'إنشاء تحليل SWOT بناءً على سياقك والمشهد البلدي السعودي' })}
              </p>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate SWOT', ar: 'إنشاء SWOT' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const items = swot[cat.key] || [];
          
          return (
            <Card key={cat.key} className={cat.bgColor}>
              <CardHeader className="pb-2">
                <CardTitle className={`flex items-center gap-2 ${cat.color}`}>
                  <Icon className="h-5 w-5" />
                  {cat.title[language]}
                </CardTitle>
                <CardDescription className="text-xs">
                  {cat.description[language]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Add new item - bilingual inputs */}
                <div className="space-y-2 p-2 bg-white/50 rounded border border-dashed">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">English</Label>
                      <Input
                        value={newItems[cat.key].en}
                        onChange={(e) => setNewItems({ ...newItems, [cat.key]: { ...newItems[cat.key], en: e.target.value } })}
                        placeholder={t({ en: 'English text...', ar: 'النص بالإنجليزية...' })}
                        className="bg-white text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && addItem(cat.key)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">العربية</Label>
                      <Input
                        value={newItems[cat.key].ar}
                        onChange={(e) => setNewItems({ ...newItems, [cat.key]: { ...newItems[cat.key], ar: e.target.value } })}
                        placeholder={t({ en: 'Arabic text...', ar: 'النص بالعربية...' })}
                        className="bg-white text-sm"
                        dir="rtl"
                        onKeyDown={(e) => e.key === 'Enter' && addItem(cat.key)}
                      />
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addItem(cat.key)} className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>

                {/* Items list */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={item.id || index} className="p-2 bg-white rounded-md border space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <Input
                            value={item.text_en || item.text || ''}
                            onChange={(e) => updateItem(cat.key, index, 'text_en', e.target.value)}
                            placeholder="English"
                            className="text-sm h-8"
                          />
                          <Input
                            value={item.text_ar || ''}
                            onChange={(e) => updateItem(cat.key, index, 'text_ar', e.target.value)}
                            placeholder="العربية"
                            className="text-sm h-8"
                            dir="rtl"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <select 
                            className="text-xs border rounded px-1 py-0.5"
                            value={item.priority || 'medium'}
                            onChange={(e) => setPriority(cat.key, index, e.target.value)}
                          >
                            <option value="high">{t({ en: 'High', ar: 'عالي' })}</option>
                            <option value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</option>
                            <option value="low">{t({ en: 'Low', ar: 'منخفض' })}</option>
                          </select>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem(cat.key, index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t({ en: `No ${cat.key} added yet`, ar: 'لم تتم إضافة عناصر بعد' })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'SWOT Summary', ar: 'ملخص SWOT' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            {categories.map(cat => (
              <div key={cat.key}>
                <p className={`text-2xl font-bold ${cat.color}`}>{(swot[cat.key] || []).length}</p>
                <p className="text-sm text-muted-foreground">{cat.title[language]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
