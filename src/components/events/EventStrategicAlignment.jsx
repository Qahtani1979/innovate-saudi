import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, CheckCircle2, AlertCircle, Loader2, Link2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';

export default function EventStrategicAlignment({ event, onUpdate }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedPlanIds, setSelectedPlanIds] = useState(event?.strategic_plan_ids || []);
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState(event?.strategic_objective_ids || []);

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-event-align'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  // Calculate alignment score
  const alignmentScore = selectedObjectiveIds.length 
    ? Math.min(100, (selectedObjectiveIds.length * 25))
    : selectedPlanIds.length 
      ? Math.min(50, (selectedPlanIds.length * 15))
      : 0;

  const updateAlignmentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('events')
        .update({
          strategic_plan_ids: selectedPlanIds,
          strategic_objective_ids: selectedObjectiveIds,
          strategic_alignment_score: alignmentScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', event.id);

      if (error) throw error;
      return { strategic_plan_ids: selectedPlanIds, strategic_objective_ids: selectedObjectiveIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(t({ en: 'Strategic alignment updated', ar: 'تم تحديث التوافق الاستراتيجي' }));
      onUpdate?.();
    },
    onError: (error) => {
      console.error('Alignment update error:', error);
      toast.error(t({ en: 'Failed to update alignment', ar: 'فشل في تحديث التوافق' }));
    }
  });

  const togglePlan = (planId) => {
    setSelectedPlanIds(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const toggleObjective = (objectiveId) => {
    setSelectedObjectiveIds(prev => 
      prev.includes(objectiveId) 
        ? prev.filter(id => id !== objectiveId)
        : [...prev, objectiveId]
    );
  };

  // Extract objectives from plans
  const allObjectives = strategicPlans.flatMap(plan => 
    (plan.objectives || plan.strategic_objectives || []).map((obj, i) => ({
      id: typeof obj === 'object' && obj.id ? obj.id : `${plan.id}-obj-${i}`,
      plan_id: plan.id,
      plan_name: language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en || plan.title_en,
      name: typeof obj === 'object' 
        ? (language === 'ar' && obj.name_ar ? obj.name_ar : obj.name_en || obj.title)
        : obj
    }))
  );

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <Target className="h-5 w-5" />
            {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{t({ en: 'Score:', ar: 'الدرجة:' })}</span>
            <Badge className={alignmentScore >= 50 ? 'bg-green-600' : alignmentScore > 0 ? 'bg-amber-500' : 'bg-slate-400'}>
              {alignmentScore}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Strategic Plans */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 text-sm">
            {t({ en: 'Link to Strategic Plans', ar: 'الربط بالخطط الاستراتيجية' })}
          </h4>
          
          {strategicPlans.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              {t({ en: 'No strategic plans available', ar: 'لا توجد خطط استراتيجية متاحة' })}
            </div>
          ) : (
            <div className="space-y-2">
              {strategicPlans.map(plan => (
                <div 
                  key={plan.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedPlanIds.includes(plan.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                  onClick={() => togglePlan(plan.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedPlanIds.includes(plan.id)}
                      onCheckedChange={() => togglePlan(plan.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en || plan.title_en}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {plan.start_year} - {plan.end_year}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {(plan.objectives || plan.strategic_objectives || []).length} {t({ en: 'objectives', ar: 'أهداف' })}
                        </Badge>
                      </div>
                    </div>
                    {selectedPlanIds.includes(plan.id) && (
                      <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strategic Objectives (if plans selected) */}
        {selectedPlanIds.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 text-sm">
              {t({ en: 'Link to Strategic Objectives', ar: 'الربط بالأهداف الاستراتيجية' })}
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allObjectives
                .filter(obj => selectedPlanIds.includes(obj.plan_id))
                .map(objective => (
                  <div 
                    key={objective.id}
                    className={`p-2 border rounded cursor-pointer transition-all ${
                      selectedObjectiveIds.includes(objective.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    }`}
                    onClick={() => toggleObjective(objective.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedObjectiveIds.includes(objective.id)}
                        onCheckedChange={() => toggleObjective(objective.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-800">{objective.name}</p>
                        <p className="text-xs text-slate-500">{objective.plan_name}</p>
                      </div>
                      {selectedObjectiveIds.includes(objective.id) && (
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Summary & Save */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-slate-600">
            <span>{selectedPlanIds.length} {t({ en: 'plans', ar: 'خطط' })}</span>
            <span className="mx-2">•</span>
            <span>{selectedObjectiveIds.length} {t({ en: 'objectives', ar: 'أهداف' })}</span>
          </div>
          <Button 
            onClick={() => updateAlignmentMutation.mutate()}
            disabled={updateAlignmentMutation.isPending}
          >
            {updateAlignmentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                {t({ en: 'Save Alignment', ar: 'حفظ التوافق' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
