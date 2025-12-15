import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Plus, X, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '../../../LanguageContext';

export default function Step6ActionPlans({ 
  data, 
  onChange, 
  onGenerateAI, 
  isGenerating 
}) {
  const { language, t, isRTL } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  const objectives = data.objectives || [];
  const actionPlans = data.action_plans || [];

  const addActionPlan = (objectiveIndex = null) => {
    onChange({
      action_plans: [...actionPlans, {
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        objective_index: objectiveIndex,
        type: 'initiative',
        priority: 'medium',
        budget_estimate: '',
        start_date: '',
        end_date: '',
        owner: '',
        deliverables: [],
        dependencies: []
      }]
    });
    setExpandedIndex(actionPlans.length);
  };

  const updateActionPlan = (index, updates) => {
    const updated = actionPlans.map((ap, i) => 
      i === index ? { ...ap, ...updates } : ap
    );
    onChange({ action_plans: updated });
  };

  const removeActionPlan = (index) => {
    onChange({ action_plans: actionPlans.filter((_, i) => i !== index) });
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const getActionPlansForObjective = (objectiveIndex) => {
    return actionPlans.filter(ap => ap.objective_index === objectiveIndex);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-muted';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'initiative': return 'bg-blue-100 text-blue-700';
      case 'program': return 'bg-purple-100 text-purple-700';
      case 'project': return 'bg-cyan-100 text-cyan-700';
      case 'pilot': return 'bg-orange-100 text-orange-700';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* AI Generation */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">{t({ en: 'AI-Powered Action Plan Generation', ar: 'إنشاء خطط العمل بالذكاء الاصطناعي' })}</h4>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Generate initiatives, programs, and projects for each objective', ar: 'إنشاء المبادرات والبرامج والمشاريع لكل هدف' })}
              </p>
            </div>
            <Button onClick={onGenerateAI} disabled={isGenerating || objectives.length === 0}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Actions', ar: 'إنشاء الإجراءات' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {objectives.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t({ en: 'Please define objectives first (Step 3) before creating action plans.', ar: 'يرجى تحديد الأهداف أولاً (الخطوة 3) قبل إنشاء خطط العمل.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Action Plans by Objective */}
          {objectives.map((obj, objIndex) => {
            const objActions = getActionPlansForObjective(objIndex);
            return (
              <Card key={objIndex}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline">#{objIndex + 1}</Badge>
                      <span className="line-clamp-1">{language === 'ar' ? (obj.name_ar || obj.name_en) : obj.name_en}</span>
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={() => addActionPlan(objIndex)}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t({ en: 'Add Action', ar: 'إضافة إجراء' })}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {objActions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t({ en: 'No action plans for this objective', ar: 'لا توجد خطط عمل لهذا الهدف' })}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {objActions.map((ap) => {
                        const apIndex = actionPlans.indexOf(ap);
                        return (
                          <Collapsible key={apIndex} open={expandedIndex === apIndex}>
                            <div className="border rounded-lg">
                              <CollapsibleTrigger asChild>
                                <div 
                                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                  onClick={() => setExpandedIndex(expandedIndex === apIndex ? null : apIndex)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-primary" />
                                    <Badge className={`text-xs ${getTypeColor(ap.type)}`}>{ap.type}</Badge>
                                    <span className="font-medium text-sm line-clamp-1">
                                      {ap.name_en || t({ en: 'New Action', ar: 'إجراء جديد' })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={`text-xs ${getPriorityColor(ap.priority)}`}>{ap.priority}</Badge>
                                    {expandedIndex === apIndex ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                <div className="p-3 pt-0 space-y-4 border-t">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}</Label>
                                      <Input
                                        value={ap.name_en}
                                        onChange={(e) => updateActionPlan(apIndex, { name_en: e.target.value })}
                                        dir="ltr"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}</Label>
                                      <Input
                                        value={ap.name_ar}
                                        onChange={(e) => updateActionPlan(apIndex, { name_ar: e.target.value })}
                                        dir="rtl"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Description (EN)', ar: 'الوصف (إنجليزي)' })}</Label>
                                      <Textarea
                                        value={ap.description_en}
                                        onChange={(e) => updateActionPlan(apIndex, { description_en: e.target.value })}
                                        rows={2}
                                        dir="ltr"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Description (AR)', ar: 'الوصف (عربي)' })}</Label>
                                      <Textarea
                                        value={ap.description_ar}
                                        onChange={(e) => updateActionPlan(apIndex, { description_ar: e.target.value })}
                                        rows={2}
                                        dir="rtl"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                                      <Select value={ap.type} onValueChange={(v) => updateActionPlan(apIndex, { type: v })}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="initiative">{t({ en: 'Initiative', ar: 'مبادرة' })}</SelectItem>
                                          <SelectItem value="program">{t({ en: 'Program', ar: 'برنامج' })}</SelectItem>
                                          <SelectItem value="project">{t({ en: 'Project', ar: 'مشروع' })}</SelectItem>
                                          <SelectItem value="pilot">{t({ en: 'Pilot', ar: 'تجريبي' })}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                                      <Select value={ap.priority} onValueChange={(v) => updateActionPlan(apIndex, { priority: v })}>
                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                                          <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                                          <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</Label>
                                      <Input
                                        value={ap.budget_estimate}
                                        onChange={(e) => updateActionPlan(apIndex, { budget_estimate: e.target.value })}
                                        placeholder="1,000,000"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs">{t({ en: 'Owner', ar: 'المسؤول' })}</Label>
                                      <Input
                                        value={ap.owner}
                                        onChange={(e) => updateActionPlan(apIndex, { owner: e.target.value })}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end">
                                    <Button size="sm" variant="destructive" onClick={() => removeActionPlan(apIndex)}>
                                      <X className="h-4 w-4 mr-1" />
                                      {t({ en: 'Remove', ar: 'حذف' })}
                                    </Button>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t({ en: 'Action Plans Summary', ar: 'ملخص خطط العمل' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{actionPlans.filter(ap => ap.type === 'initiative').length}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Initiatives', ar: 'مبادرات' })}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{actionPlans.filter(ap => ap.type === 'program').length}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Programs', ar: 'برامج' })}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-600">{actionPlans.filter(ap => ap.type === 'project').length}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Projects', ar: 'مشاريع' })}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{actionPlans.filter(ap => ap.type === 'pilot').length}</p>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Pilots', ar: 'تجريبي' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
