import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eye, Target, Heart, Plus, X, Columns } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

export default function Step2Vision({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  const addValue = () => {
    const newValue = { 
      id: Date.now().toString(),
      name_en: '', 
      name_ar: '',
      description_en: '',
      description_ar: ''
    };
    onChange({ core_values: [...(data.core_values || []), newValue] });
  };

  const updateValue = (index, field, value) => {
    const updated = [...(data.core_values || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ core_values: updated });
  };

  const removeValue = (index) => {
    onChange({ core_values: data.core_values.filter((_, i) => i !== index) });
  };

  const addPillar = () => {
    const newPillar = { 
      id: Date.now().toString(),
      name_en: '', 
      name_ar: '',
      description_en: '',
      description_ar: '',
      icon: 'Target'
    };
    onChange({ strategic_pillars: [...(data.strategic_pillars || []), newPillar] });
  };

  const updatePillar = (index, field, value) => {
    const updated = [...(data.strategic_pillars || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ strategic_pillars: updated });
  };

  const removePillar = (index) => {
    onChange({ strategic_pillars: data.strategic_pillars.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generate Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={onGenerateAI} 
          disabled={isGenerating || !data.name_en}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating 
            ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' })
            : t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })
          }
        </Button>
      </div>

      {/* Vision Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5 text-primary" />
            {t({ en: 'Vision Statement', ar: 'بيان الرؤية' })}
            <Badge variant="destructive" className="text-[10px]">{t({ en: 'Required', ar: 'مطلوب' })}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t({ 
              en: 'A vision statement describes the desired future state. It should be aspirational, clear, and inspiring.',
              ar: 'يصف بيان الرؤية الحالة المستقبلية المرغوبة. يجب أن يكون طموحًا وواضحًا وملهمًا.'
            })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t({ en: 'Vision (English)', ar: 'الرؤية (إنجليزي)' })} *</Label>
              <Textarea
                value={data.vision_en || ''}
                onChange={(e) => onChange({ vision_en: e.target.value })}
                placeholder={t({ 
                  en: 'e.g., "To be the leading municipality in sustainable urban development..."',
                  ar: 'مثال: "أن نكون البلدية الرائدة في التنمية الحضرية المستدامة..."'
                })}
                rows={4}
              />
            </div>
            <div>
              <Label>{t({ en: 'Vision (Arabic)', ar: 'الرؤية (عربي)' })}</Label>
              <Textarea
                value={data.vision_ar || ''}
                onChange={(e) => onChange({ vision_ar: e.target.value })}
                placeholder="الرؤية بالعربية..."
                rows={4}
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            {t({ en: 'Mission Statement', ar: 'بيان الرسالة' })}
            <Badge variant="destructive" className="text-[10px]">{t({ en: 'Required', ar: 'مطلوب' })}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t({ 
              en: 'A mission statement describes the organization\'s purpose and how it will achieve the vision.',
              ar: 'يصف بيان الرسالة غرض المنظمة وكيفية تحقيق الرؤية.'
            })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t({ en: 'Mission (English)', ar: 'الرسالة (إنجليزي)' })} *</Label>
              <Textarea
                value={data.mission_en || ''}
                onChange={(e) => onChange({ mission_en: e.target.value })}
                placeholder={t({ 
                  en: 'e.g., "We provide innovative municipal services that enhance quality of life..."',
                  ar: 'مثال: "نقدم خدمات بلدية مبتكرة تعزز جودة الحياة..."'
                })}
                rows={4}
              />
            </div>
            <div>
              <Label>{t({ en: 'Mission (Arabic)', ar: 'الرسالة (عربي)' })}</Label>
              <Textarea
                value={data.mission_ar || ''}
                onChange={(e) => onChange({ mission_ar: e.target.value })}
                placeholder="الرسالة بالعربية..."
                rows={4}
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Values */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-primary" />
            {t({ en: 'Core Values', ar: 'القيم الجوهرية' })}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addValue}>
            <Plus className="w-4 h-4 mr-1" />
            {t({ en: 'Add Value', ar: 'إضافة قيمة' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t({ 
              en: 'Core values define the guiding principles that shape the organization\'s culture and decision-making.',
              ar: 'تحدد القيم الجوهرية المبادئ التوجيهية التي تشكل ثقافة المنظمة وصنع القرار.'
            })}
          </p>
          
          {(data.core_values || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No core values defined yet', ar: 'لم يتم تحديد قيم جوهرية بعد' })}
            </div>
          ) : (
            <div className="grid gap-4">
              {data.core_values.map((value, index) => (
                <div key={value.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeValue(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder={t({ en: 'Value name (English)', ar: 'اسم القيمة (إنجليزي)' })}
                      value={value.name_en}
                      onChange={(e) => updateValue(index, 'name_en', e.target.value)}
                    />
                    <Input
                      placeholder={t({ en: 'Value name (Arabic)', ar: 'اسم القيمة (عربي)' })}
                      value={value.name_ar}
                      onChange={(e) => updateValue(index, 'name_ar', e.target.value)}
                      dir="rtl"
                    />
                    <Textarea
                      placeholder={t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
                      value={value.description_en}
                      onChange={(e) => updateValue(index, 'description_en', e.target.value)}
                      rows={2}
                    />
                    <Textarea
                      placeholder={t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}
                      value={value.description_ar}
                      onChange={(e) => updateValue(index, 'description_ar', e.target.value)}
                      rows={2}
                      dir="rtl"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Pillars */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Columns className="w-5 h-5 text-primary" />
            {t({ en: 'Strategic Pillars', ar: 'الركائز الاستراتيجية' })}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addPillar}>
            <Plus className="w-4 h-4 mr-1" />
            {t({ en: 'Add Pillar', ar: 'إضافة ركيزة' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t({ 
              en: 'Strategic pillars are the main thematic areas that organize your strategic objectives.',
              ar: 'الركائز الاستراتيجية هي المجالات الموضوعية الرئيسية التي تنظم أهدافك الاستراتيجية.'
            })}
          </p>
          
          {(data.strategic_pillars || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No strategic pillars defined yet', ar: 'لم يتم تحديد ركائز استراتيجية بعد' })}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {data.strategic_pillars.map((pillar, index) => (
                <div key={pillar.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge>
                      {t({ en: 'Pillar', ar: 'ركيزة' })} #{index + 1}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => removePillar(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder={t({ en: 'Pillar name (English)', ar: 'اسم الركيزة (إنجليزي)' })}
                    value={pillar.name_en}
                    onChange={(e) => updatePillar(index, 'name_en', e.target.value)}
                  />
                  <Input
                    placeholder={t({ en: 'Pillar name (Arabic)', ar: 'اسم الركيزة (عربي)' })}
                    value={pillar.name_ar}
                    onChange={(e) => updatePillar(index, 'name_ar', e.target.value)}
                    dir="rtl"
                  />
                  <Textarea
                    placeholder={t({ en: 'Brief description...', ar: 'وصف مختصر...' })}
                    value={pillar.description_en}
                    onChange={(e) => updatePillar(index, 'description_en', e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
