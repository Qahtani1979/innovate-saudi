import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Loader2, 
  Target, 
  BarChart3,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

export default function StrategyObjectiveGenerator({ strategicPlanId, onObjectivesGenerated }) {
  const { t, language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [objectives, setObjectives] = useState([]);
  const [selectedPillar, setSelectedPillar] = useState('');
  const [objectivesPerPillar, setObjectivesPerPillar] = useState(3);

  // Fetch strategic plan with pillars
  const { data: strategicPlan } = useQuery({
    queryKey: ['strategic-plan', strategicPlanId],
    queryFn: () => base44.entities.StrategicPlan.get(strategicPlanId),
    enabled: !!strategicPlanId
  });

  const pillars = strategicPlan?.pillars || [];

  const generateObjectives = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-objective-generator', {
        body: {
          strategic_plan_id: strategicPlanId,
          pillar_name: selectedPillar || undefined,
          vision_statement: strategicPlan?.vision_en,
          objectives_per_pillar: objectivesPerPillar,
          include_kpis: true
        }
      });

      if (error) throw error;

      if (data?.objectives) {
        setObjectives(data.objectives);
        toast.success(t({ 
          en: `Generated ${data.objectives.length} strategic objectives with KPIs`, 
          ar: `تم إنشاء ${data.objectives.length} أهداف استراتيجية مع مؤشرات الأداء` 
        }));
        onObjectivesGenerated?.(data.objectives);
      }
    } catch (error) {
      console.error('Error generating objectives:', error);
      toast.error(t({ en: 'Failed to generate objectives', ar: 'فشل في إنشاء الأهداف' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const updateObjective = (index, field, value) => {
    const updated = [...objectives];
    updated[index] = { ...updated[index], [field]: value };
    setObjectives(updated);
  };

  const removeObjective = (index) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const saveObjectives = async () => {
    if (!strategicPlanId) {
      toast.error(t({ en: 'No strategic plan selected', ar: 'لم يتم تحديد خطة استراتيجية' }));
      return;
    }

    try {
      const existingObjectives = strategicPlan?.objectives || [];
      const updatedObjectives = [...existingObjectives, ...objectives];

      const { error } = await supabase
        .from('strategic_plans')
        .update({ 
          objectives: updatedObjectives,
          objectives_generated_at: new Date().toISOString()
        })
        .eq('id', strategicPlanId);

      if (error) throw error;

      queryClient.invalidateQueries(['strategic-plan', strategicPlanId]);
      queryClient.invalidateQueries(['strategic-plans']);
      toast.success(t({ en: 'Objectives saved successfully', ar: 'تم حفظ الأهداف بنجاح' }));
    } catch (error) {
      console.error('Error saving objectives:', error);
      toast.error(t({ en: 'Failed to save objectives', ar: 'فشل في حفظ الأهداف' }));
    }
  };

  const getProgressColor = (baseline, current, target) => {
    const progress = ((current - baseline) / (target - baseline)) * 100;
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t({ en: 'Strategic Objectives & KPIs Generator', ar: 'مولد الأهداف الاستراتيجية ومؤشرات الأداء' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">
              {t({ en: 'Select Pillar (Optional)', ar: 'اختر الركيزة (اختياري)' })}
            </label>
            <Select value={selectedPillar} onValueChange={setSelectedPillar}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'All Pillars', ar: 'جميع الركائز' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t({ en: 'All Pillars', ar: 'جميع الركائز' })}</SelectItem>
                {pillars.map((pillar, index) => (
                  <SelectItem key={index} value={pillar.name_en}>
                    {language === 'ar' ? pillar.name_ar : pillar.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">
              {t({ en: 'Objectives per Pillar', ar: 'الأهداف لكل ركيزة' })}
            </label>
            <Input
              type="number"
              min={1}
              max={5}
              value={objectivesPerPillar}
              onChange={(e) => setObjectivesPerPillar(parseInt(e.target.value) || 3)}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={generateObjectives} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Objectives', ar: 'إنشاء الأهداف' })}
            </Button>
          </div>
        </div>

        {pillars.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            {t({ 
              en: 'No pillars found. Generate strategic pillars first for better objective alignment.', 
              ar: 'لم يتم العثور على ركائز. قم بإنشاء الركائز الاستراتيجية أولاً لتحسين توافق الأهداف.' 
            })}
          </div>
        )}

        {/* Generated Objectives */}
        {objectives.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {t({ en: 'Generated Objectives', ar: 'الأهداف المُنشأة' })} ({objectives.length})
              </h3>
              <Button size="sm" onClick={saveObjectives}>
                <Save className="h-4 w-4 mr-1" />
                {t({ en: 'Save All', ar: 'حفظ الكل' })}
              </Button>
            </div>

            <Accordion type="multiple" className="space-y-2">
              {objectives.map((objective, index) => (
                <AccordionItem key={index} value={`obj-${index}`} className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      <Target className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{objective.name_en}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{objective.pillar_name}</Badge>
                          <span>Target: {objective.target_value}{objective.unit === 'percentage' ? '%' : ` ${objective.unit}`}</span>
                          <span>by {objective.target_year}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); removeObjective(index); }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* Objective Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">{t({ en: 'Name (EN)', ar: 'الاسم (EN)' })}</label>
                          <Input
                            value={objective.name_en}
                            onChange={(e) => updateObjective(index, 'name_en', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">{t({ en: 'Name (AR)', ar: 'الاسم (AR)' })}</label>
                          <Input
                            value={objective.name_ar}
                            onChange={(e) => updateObjective(index, 'name_ar', e.target.value)}
                            dir="rtl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">{t({ en: 'Description', ar: 'الوصف' })}</label>
                        <Textarea
                          value={objective.description_en}
                          onChange={(e) => updateObjective(index, 'description_en', e.target.value)}
                          rows={2}
                        />
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Baseline: {objective.baseline_value}</span>
                          <span>Target: {objective.target_value}</span>
                        </div>
                        <Progress value={((objective.baseline_value / objective.target_value) * 100)} className="h-2" />
                      </div>

                      {/* KPIs */}
                      {objective.kpis?.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })}
                          </h4>
                          <div className="space-y-3">
                            {objective.kpis.map((kpi, kIndex) => (
                              <div key={kIndex} className="bg-background rounded p-3 border">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-sm">{kpi.name_en}</div>
                                    <div className="text-xs text-muted-foreground">{kpi.description_en}</div>
                                  </div>
                                  <Badge variant="secondary">
                                    {kpi.baseline} → {kpi.target} {kpi.unit}
                                  </Badge>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                                  <span><strong>Frequency:</strong> {kpi.frequency}</span>
                                  <span><strong>Source:</strong> {kpi.data_source}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Milestones */}
                      {objective.milestones?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {t({ en: 'Milestones', ar: 'المراحل' })}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {objective.milestones.map((milestone, mIndex) => (
                              <Badge key={mIndex} variant="outline" className="text-xs">
                                {milestone.quarter} {milestone.year}: {milestone.target_value} - {milestone.description}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Risks & Enablers */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-red-600 mb-1">{t({ en: 'Risks', ar: 'المخاطر' })}</h5>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {objective.risks?.map((risk, rIndex) => (
                              <li key={rIndex}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-green-600 mb-1">{t({ en: 'Enablers', ar: 'الممكنات' })}</h5>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {objective.enablers?.map((enabler, eIndex) => (
                              <li key={eIndex}>{enabler}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {objectives.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t({ en: 'Select options and click Generate to create strategic objectives with KPIs', ar: 'حدد الخيارات وانقر على إنشاء لإنشاء الأهداف الاستراتيجية مع مؤشرات الأداء' })}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
