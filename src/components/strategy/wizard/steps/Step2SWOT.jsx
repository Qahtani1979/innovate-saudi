import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Plus, X, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

export default function Step2SWOT({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating 
}) {
  const { language, t } = useLanguage();
  const [newItems, setNewItems] = useState({ strengths: '', weaknesses: '', opportunities: '', threats: '' });

  const swot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };

  const addItem = (category) => {
    if (newItems[category].trim()) {
      const updated = {
        ...swot,
        [category]: [...(swot[category] || []), { text: newItems[category].trim(), priority: 'medium' }]
      };
      onChange({ swot: updated });
      setNewItems({ ...newItems, [category]: '' });
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
    <div className="space-y-6">
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
                {/* Add new item */}
                <div className="flex gap-2">
                  <Input
                    value={newItems[cat.key]}
                    onChange={(e) => setNewItems({ ...newItems, [cat.key]: e.target.value })}
                    placeholder={t({ en: `Add ${cat.key.slice(0, -1)}...`, ar: 'أضف عنصراً...' })}
                    className="bg-white"
                    onKeyDown={(e) => e.key === 'Enter' && addItem(cat.key)}
                  />
                  <Button size="sm" variant="outline" onClick={() => addItem(cat.key)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items list */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-md border">
                      <span className="flex-1 text-sm">{typeof item === 'string' ? item : item.text}</span>
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
