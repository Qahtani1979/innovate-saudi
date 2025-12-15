import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Plus, X, Calendar, Flag } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

export default function Step7Timeline({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating 
}) {
  const { language, t, isRTL } = useLanguage();
  
  const milestones = data.milestones || [];
  const phases = data.phases || [];
  const objectives = data.objectives || [];

  const addMilestone = () => {
    onChange({
      milestones: [...milestones, {
        name_en: '',
        name_ar: '',
        date: '',
        type: 'milestone',
        status: 'planned',
        description_en: '',
        description_ar: ''
      }]
    });
  };

  const updateMilestone = (index, updates) => {
    const updated = milestones.map((m, i) => i === index ? { ...m, ...updates } : m);
    onChange({ milestones: updated });
  };

  const removeMilestone = (index) => {
    onChange({ milestones: milestones.filter((_, i) => i !== index) });
  };

  const addPhase = () => {
    onChange({
      phases: [...phases, {
        name_en: '',
        name_ar: '',
        start_date: '',
        end_date: '',
        description_en: '',
        description_ar: '',
        objectives_covered: []
      }]
    });
  };

  const updatePhase = (index, updates) => {
    const updated = phases.map((p, i) => i === index ? { ...p, ...updates } : p);
    onChange({ phases: updated });
  };

  const removePhase = (index) => {
    onChange({ phases: phases.filter((_, i) => i !== index) });
  };

  const toggleObjectiveCovered = (phaseIndex, objectiveIndex, checked) => {
    const current = phases[phaseIndex]?.objectives_covered || [];
    const next = checked
      ? Array.from(new Set([...current, objectiveIndex]))
      : current.filter((i) => i !== objectiveIndex);

    updatePhase(phaseIndex, { objectives_covered: next });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'launch': return '🚀';
      case 'review': return '📊';
      case 'gate': return '🚦';
      case 'deliverable': return '📦';
      default: return '🏁';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{t({ en: 'AI-Powered Timeline Generation', ar: 'إنشاء الجدول الزمني بالذكاء الاصطناعي' })}</h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Generate phases and milestones based on your plan duration and action items', ar: 'إنشاء المراحل والمعالم بناءً على مدة خطتك وعناصر العمل' })}
              </p>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Timeline', ar: 'إنشاء الجدول' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Duration Reference */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{t({ en: 'Plan Duration', ar: 'مدة الخطة' })}</p>
                <p className="text-sm text-muted-foreground">
                  {data.start_year} - {data.end_year} ({data.end_year - data.start_year} {t({ en: 'years', ar: 'سنوات' })})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
              <p className="font-medium">{objectives.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t({ en: 'Implementation Phases', ar: 'مراحل التنفيذ' })}</CardTitle>
              <CardDescription>{t({ en: 'Define major phases of the strategy', ar: 'حدد المراحل الرئيسية للاستراتيجية' })}</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addPhase}>
              <Plus className="h-4 w-4 mr-1" />
              {t({ en: 'Add Phase', ar: 'إضافة مرحلة' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {phases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t({ en: 'No phases defined. Add phases or use AI generation.', ar: 'لم يتم تحديد مراحل. أضف مراحل أو استخدم الإنشاء بالذكاء الاصطناعي.' })}
            </p>
          ) : (
            <div className="space-y-3">
              {phases.map((phase, index) => (
                <div key={phase.id || index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {t({ en: 'Phase', ar: 'مرحلة' })} {index + 1}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => removePhase(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Phase Name (EN)', ar: 'اسم المرحلة (إنجليزي)' })}</Label>
                      <Input
                        value={phase.name_en}
                        onChange={(e) => updatePhase(index, { name_en: e.target.value })}
                        placeholder={t({ en: 'e.g., Foundation Phase', ar: 'مثال: مرحلة التأسيس' })}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Phase Name (AR)', ar: 'اسم المرحلة (عربي)' })}</Label>
                      <Input
                        value={phase.name_ar}
                        onChange={(e) => updatePhase(index, { name_ar: e.target.value })}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Start Date', ar: 'تاريخ البداية' })}</Label>
                      <Input
                        type="date"
                        value={phase.start_date}
                        onChange={(e) => updatePhase(index, { start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'End Date', ar: 'تاريخ النهاية' })}</Label>
                      <Input
                        type="date"
                        value={phase.end_date}
                        onChange={(e) => updatePhase(index, { end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Phase Description (EN)', ar: 'وصف المرحلة (إنجليزي)' })}</Label>
                      <Textarea
                        value={phase.description_en || phase.description || ''}
                        onChange={(e) => updatePhase(index, { description_en: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Phase Description (AR)', ar: 'وصف المرحلة (عربي)' })}</Label>
                      <Textarea
                        dir="rtl"
                        value={phase.description_ar || ''}
                        onChange={(e) => updatePhase(index, { description_ar: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>

                  {objectives.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs">{t({ en: 'Objectives Covered', ar: 'الأهداف المشمولة' })}</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {objectives.map((obj, objIndex) => {
                          const checked = (phase.objectives_covered || []).includes(objIndex);
                          const label = language === 'ar' ? (obj.name_ar || obj.name_en) : (obj.name_en || obj.name_ar);
                          return (
                            <label key={objIndex} className="flex items-start gap-2 rounded-md border p-2">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => toggleObjectiveCovered(index, objIndex, Boolean(v))}
                              />
                              <span className="text-sm leading-5">{label || `${t({ en: 'Objective', ar: 'هدف' })} ${objIndex + 1}`}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                {t({ en: 'Key Milestones', ar: 'المعالم الرئيسية' })}
              </CardTitle>
              <CardDescription>{t({ en: 'Important dates and checkpoints', ar: 'التواريخ المهمة ونقاط المراجعة' })}</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addMilestone}>
              <Plus className="h-4 w-4 mr-1" />
              {t({ en: 'Add Milestone', ar: 'إضافة معلم' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t({ en: 'No milestones defined yet.', ar: 'لم يتم تحديد معالم بعد.' })}
            </p>
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div key={milestone.id || index} className="border rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Milestone (EN)', ar: 'المعلم (إنجليزي)' })}</Label>
                      <Input
                        value={milestone.name_en}
                        onChange={(e) => updateMilestone(index, { name_en: e.target.value })}
                        placeholder={t({ en: 'Milestone name', ar: 'اسم المعلم' })}
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Milestone (AR)', ar: 'المعلم (عربي)' })}</Label>
                      <Input
                        value={milestone.name_ar}
                        onChange={(e) => updateMilestone(index, { name_ar: e.target.value })}
                        placeholder={t({ en: 'Arabic milestone name', ar: 'اسم المعلم بالعربية' })}
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Date', ar: 'التاريخ' })}</Label>
                      <Input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => updateMilestone(index, { date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                      <Select value={milestone.type} onValueChange={(v) => updateMilestone(index, { type: v })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="milestone">{getTypeIcon('milestone')} {t({ en: 'Milestone', ar: 'معلم' })}</SelectItem>
                          <SelectItem value="launch">{getTypeIcon('launch')} {t({ en: 'Launch', ar: 'إطلاق' })}</SelectItem>
                          <SelectItem value="review">{getTypeIcon('review')} {t({ en: 'Review', ar: 'مراجعة' })}</SelectItem>
                          <SelectItem value="gate">{getTypeIcon('gate')} {t({ en: 'Gate', ar: 'بوابة' })}</SelectItem>
                          <SelectItem value="deliverable">{getTypeIcon('deliverable')} {t({ en: 'Deliverable', ar: 'تسليم' })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeMilestone(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Description (EN)', ar: 'الوصف (إنجليزي)' })}</Label>
                      <Textarea
                        value={milestone.description_en || milestone.description || ''}
                        onChange={(e) => updateMilestone(index, { description_en: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t({ en: 'Description (AR)', ar: 'الوصف (عربي)' })}</Label>
                      <Textarea
                        dir="rtl"
                        value={milestone.description_ar || ''}
                        onChange={(e) => updateMilestone(index, { description_ar: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t({ en: 'Timeline Summary', ar: 'ملخص الجدول الزمني' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{phases.length}</p>
              <p className="text-sm text-muted-foreground">{t({ en: 'Phases', ar: 'مراحل' })}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{milestones.length}</p>
              <p className="text-sm text-muted-foreground">{t({ en: 'Milestones', ar: 'معالم' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

