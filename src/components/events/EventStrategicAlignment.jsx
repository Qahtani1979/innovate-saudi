import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, CheckCircle2, AlertCircle, Loader2, Link2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';
import { useEvents } from '@/hooks/useEvents';

export default function EventStrategicAlignment({ event, onUpdate }) {
  const { language, t } = useLanguage();
  const [selectedPlanIds, setSelectedPlanIds] = useState(event?.strategic_plan_ids || []);
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState(event?.strategic_objective_ids || []);

  const { data: strategicPlans = [] } = useStrategicPlans({ status: 'active' });
  const { updateEvent, isUpdating } = useEvents();

  // Calculate alignment score
  const alignmentScore = selectedObjectiveIds.length
    ? Math.min(100, (selectedObjectiveIds.length * 25))
    : selectedPlanIds.length
      ? Math.min(50, (selectedPlanIds.length * 15))
      : 0;

  const handleSaveAlignment = async () => {
    try {
      await updateEvent({
        eventId: event.id,
        updates: {
          strategic_plan_ids: selectedPlanIds,
          strategic_objective_ids: selectedObjectiveIds,
          strategic_alignment_score: alignmentScore,
        }
      });
      onUpdate?.();
    } catch (error) {
      console.error('Alignment update error:', error);
    }
  };

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
            <div className="space-y-4">
              {strategicPlans.map(plan => (
                <div key={plan.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Checkbox
                        id={`plan-${plan.id}`}
                        checked={selectedPlanIds.includes(plan.id)}
                        onCheckedChange={() => togglePlan(plan.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={`plan-${plan.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {/* @ts-ignore */}
                          {language === 'ar' ? plan.title_ar : plan.title_en}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {/* @ts-ignore */}
                          {plan.strategic_objectives?.length || 0} {t({ en: 'Objectives', ar: 'أهداف' })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {/* @ts-ignore */}
                      {plan.plan_type}
                    </Badge>
                  </div>

                  {selectedPlanIds.includes(plan.id) && (
                    <div className="pl-9 rtl:pr-9 space-y-2 border-l-2 rtl:border-l-0 rtl:border-r-2 border-muted">
                      {/* @ts-ignore */}
                      {plan.strategic_objectives?.map(obj => (
                        <div key={obj.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                          <Checkbox
                            id={`obj-${obj.id}`}
                            checked={selectedObjectiveIds.includes(obj.id)}
                            onCheckedChange={() => toggleObjective(obj.id)}
                          />
                          <label
                            htmlFor={`obj-${obj.id}`}
                            className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {/* @ts-ignore */}
                            {language === 'ar' ? obj.title_ar : obj.title_en}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-slate-600">
            <span>{selectedPlanIds.length} {t({ en: 'plans', ar: 'خطط' })}</span>
            <span className="mx-2">•</span>
            <span>{selectedObjectiveIds.length} {t({ en: 'objectives', ar: 'أهداف' })}</span>
          </div>
          <Button
            onClick={handleSaveAlignment}
            disabled={isUpdating}
          >
            {isUpdating ? (
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
