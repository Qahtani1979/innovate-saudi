import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Plus, X, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '../../../LanguageContext';
import { MOMAH_SECTORS } from '../StrategyWizardSteps';

export default function Step3Objectives({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating 
}) {
  const { language, t } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  const objectives = data.objectives || [];

  const addObjective = () => {
    onChange({
      objectives: [...objectives, {
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        sector_code: '',
        priority: 'medium',
        target_year: data.end_year
      }]
    });
    setExpandedIndex(objectives.length);
  };

  const updateObjective = (index, updates) => {
    const updated = objectives.map((obj, i) => 
      i === index ? { ...obj, ...updates } : obj
    );
    onChange({ objectives: updated });
  };

  const removeObjective = (index) => {
    onChange({ objectives: objectives.filter((_, i) => i !== index) });
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{t({ en: 'AI-Powered Objectives Generation', ar: 'إنشاء الأهداف بالذكاء الاصطناعي' })}</h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Generate 12-15 sector-specific objectives based on your context and SWOT', ar: 'إنشاء 12-15 هدفاً قطاعياً محدداً بناءً على سياقك وتحليل SWOT' })}
              </p>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Objectives', ar: 'إنشاء الأهداف' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Objectives Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="font-semibold">
            {objectives.length} {t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}
          </span>
        </div>
        <Button onClick={addObjective} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Add Objective', ar: 'إضافة هدف' })}
        </Button>
      </div>

      {/* Objectives List */}
      <div className="space-y-3">
        {objectives.map((obj, index) => (
          <Card key={index} className={expandedIndex === index ? 'ring-2 ring-primary' : ''}>
            <Collapsible open={expandedIndex === index} onOpenChange={(open) => setExpandedIndex(open ? index : null)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                      {obj.sector_code && (
                        <Badge className="text-xs bg-primary/10 text-primary">
                          {MOMAH_SECTORS.find(s => s.code === obj.sector_code)?.[language === 'ar' ? 'name_ar' : 'name_en'] || obj.sector_code}
                        </Badge>
                      )}
                      <span className="font-medium text-sm line-clamp-1">
                        {language === 'ar' ? (obj.name_ar || obj.name_en || t({ en: 'New Objective', ar: 'هدف جديد' })) : (obj.name_en || t({ en: 'New Objective', ar: 'هدف جديد' }))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getPriorityColor(obj.priority)}`}>
                        {obj.priority || 'medium'}
                      </Badge>
                      {expandedIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Objective Name (English)', ar: 'اسم الهدف (إنجليزي)' })}</Label>
                      <Input
                        value={obj.name_en}
                        onChange={(e) => updateObjective(index, { name_en: e.target.value })}
                        placeholder={t({ en: 'Clear, actionable objective', ar: 'هدف واضح وقابل للتنفيذ' })}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Objective Name (Arabic)', ar: 'اسم الهدف (عربي)' })}</Label>
                      <Input
                        value={obj.name_ar}
                        onChange={(e) => updateObjective(index, { name_ar: e.target.value })}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                      <Textarea
                        value={obj.description_en}
                        onChange={(e) => updateObjective(index, { description_en: e.target.value })}
                        rows={3}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                      <Textarea
                        value={obj.description_ar}
                        onChange={(e) => updateObjective(index, { description_ar: e.target.value })}
                        rows={3}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Sector', ar: 'القطاع' })}</Label>
                      <Select 
                        value={obj.sector_code} 
                        onValueChange={(v) => updateObjective(index, { sector_code: v })}
                      >
                        <SelectTrigger><SelectValue placeholder={t({ en: 'Select sector', ar: 'اختر القطاع' })} /></SelectTrigger>
                        <SelectContent>
                          {MOMAH_SECTORS.map(s => (
                            <SelectItem key={s.code} value={s.code}>
                              {language === 'ar' ? s.name_ar : s.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                      <Select 
                        value={obj.priority} 
                        onValueChange={(v) => updateObjective(index, { priority: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                          <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                          <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Target Year', ar: 'السنة المستهدفة' })}</Label>
                      <Select 
                        value={String(obj.target_year)} 
                        onValueChange={(v) => updateObjective(index, { target_year: parseInt(v) })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="destructive" size="sm" onClick={() => removeObjective(index)}>
                      <X className="h-4 w-4 mr-2" />
                      {t({ en: 'Remove Objective', ar: 'حذف الهدف' })}
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {objectives.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t({ en: 'No objectives yet. Use AI generation or add manually.', ar: 'لا توجد أهداف بعد. استخدم الإنشاء بالذكاء الاصطناعي أو أضف يدوياً.' })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sector Coverage Summary */}
      {objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Sector Coverage', ar: 'تغطية القطاعات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {MOMAH_SECTORS.map(sector => {
                const count = objectives.filter(o => o.sector_code === sector.code).length;
                return (
                  <Badge 
                    key={sector.code} 
                    variant={count > 0 ? 'default' : 'outline'}
                    className={count === 0 ? 'opacity-50' : ''}
                  >
                    {language === 'ar' ? sector.name_ar : sector.name_en} ({count})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
