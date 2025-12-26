import React from 'react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useStrategicPlans } from '@/hooks/useStrategicPlans';

export default function StrategicPlanSelector({
  selectedPlanIds = [],
  selectedObjectiveIds = [],
  onPlanChange,
  onObjectiveChange,
  showObjectives = true,
  label,
  className = ""
}) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const { data: strategicPlans = [], isLoading } = useStrategicPlans();

  const handlePlanToggle = (planId) => {
    const newPlanIds = selectedPlanIds.includes(planId)
      ? selectedPlanIds.filter(id => id !== planId)
      : [...selectedPlanIds, planId];
    onPlanChange?.(newPlanIds);
  };

  const handleObjectiveToggle = (objectiveId) => {
    const newObjectiveIds = selectedObjectiveIds.includes(objectiveId)
      ? selectedObjectiveIds.filter(id => id !== objectiveId)
      : [...selectedObjectiveIds, objectiveId];
    onObjectiveChange?.(newObjectiveIds);
  };

  const selectedPlans = strategicPlans.filter(p => selectedPlanIds.includes(p.id));

  const removeFromPlan = (planId, e) => {
    e.stopPropagation();
    handlePlanToggle(planId);
  };

  if (isLoading) {
    return <div className="animate-pulse h-10 bg-muted rounded" />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="flex items-center gap-2">
        <Target className="h-4 w-4 text-indigo-600" />
        {label || t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
      </Label>

      {selectedPlans.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedPlans.map(plan => (
            <Badge
              key={plan.id}
              variant="secondary"
              className="bg-indigo-100 text-indigo-800 flex items-center gap-1"
            >
              {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600"
                onClick={(e) => removeFromPlan(plan.id, e)}
              />
            </Badge>
          ))}
        </div>
      )}

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>
              {selectedPlanIds.length === 0
                ? t({ en: 'Select Strategic Plans', ar: 'اختر الخطط الاستراتيجية' })
                : t({ en: `${selectedPlanIds.length} plan(s) selected`, ar: `تم اختيار ${selectedPlanIds.length} خطة` })}
            </span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <ScrollArea className="h-64 border rounded-md p-2">
            {strategicPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t({ en: 'No strategic plans available', ar: 'لا توجد خطط استراتيجية' })}
              </p>
            ) : (
              <div className="space-y-3">
                {strategicPlans.map(plan => (
                  <div key={plan.id} className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                      <Checkbox
                        id={`plan-${plan.id}`}
                        checked={selectedPlanIds.includes(plan.id)}
                        onCheckedChange={() => handlePlanToggle(plan.id)}
                      />
                      <label
                        htmlFor={`plan-${plan.id}`}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
                        {plan.status && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {plan.status}
                          </Badge>
                        )}
                      </label>
                    </div>

                    {showObjectives && selectedPlanIds.includes(plan.id) && plan.objectives?.length > 0 && (
                      <div className="ml-6 pl-4 border-l-2 border-indigo-200 space-y-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          {t({ en: 'Objectives:', ar: 'الأهداف:' })}
                        </p>
                        {plan.objectives.map(obj => (
                          <div key={obj.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`obj-${obj.id}`}
                              checked={selectedObjectiveIds.includes(obj.id)}
                              onCheckedChange={() => handleObjectiveToggle(obj.id)}
                            />
                            <label
                              htmlFor={`obj-${obj.id}`}
                              className="text-xs cursor-pointer"
                            >
                              {obj.name || obj.title || obj.description?.slice(0, 50)}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {selectedObjectiveIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t({
            en: `${selectedObjectiveIds.length} objective(s) selected`,
            ar: `تم اختيار ${selectedObjectiveIds.length} هدف`
          })}
        </p>
      )}
    </div>
  );
}
