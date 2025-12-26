import { useState } from 'react';
import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useStrategicLinks } from '@/hooks/useStrategicLinks';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Target, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { buildStrategicAlignmentPrompt, STRATEGIC_ALIGNMENT_SCHEMA } from '@/lib/ai/prompts/challenges';

export default function StrategicAlignmentSelector({ challenge, onUpdate }) {
  const { language, isRTL, t } = useLanguage();
  const [selectedPlans, setSelectedPlans] = useState(challenge?.strategic_plan_ids || []);
  const { invokeAI, status, isLoading: validating, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { data: strategicPlans = [] } = useStrategiesWithVisibility();

  const { links: existingLinks, updateLinks, isUpdating: isUpdatingLinks } = useStrategicLinks(challenge?.id);
  const { updateChallenge, isUpdating: isUpdatingChallenge } = useChallengeMutations();

  const handleUpdate = async () => {
    if (!challenge.id || challenge.id === 'preview') {
      if (onUpdate) onUpdate(selectedPlans);
      return;
    }

    try {
      await Promise.all([
        updateChallenge.mutateAsync({
          id: challenge.id,
          data: { strategic_plan_ids: selectedPlans }
        }),
        updateLinks({
          challengeId: challenge.id,
          selectedPlanIds: selectedPlans,
          existingLinks
        })
      ]);
      toast.success(t({ en: 'Strategic alignment updated', ar: 'تم تحديث التوافق الاستراتيجي' }));
      if (onUpdate) onUpdate(selectedPlans);
    } catch (error) {
      toast.error(t({ en: 'Failed to update alignment', ar: 'فشل في تحديث التوافق' }));
    }
  };

  const isPending = isUpdatingLinks || isUpdatingChallenge;

  const validateAlignment = async () => {
    if (selectedPlans.length === 0) {
      toast.error(t({ en: 'Select at least one strategic objective', ar: 'اختر هدفاً استراتيجياً واحداً على الأقل' }));
      return;
    }

    try {
      const selectedPlanObjects = strategicPlans.filter(p => selectedPlans.includes(p.id));

      const response = await invokeAI({
        system_prompt: 'You are a strategic alignment expert. Analyze the challenge against the selected strategic plan objectives.',
        prompt: buildStrategicAlignmentPrompt(challenge, selectedPlanObjects),
        response_json_schema: STRATEGIC_ALIGNMENT_SCHEMA
      });

      if (response.success) {
        toast.success(t({ en: 'Validation complete - see analysis', ar: 'اكتمل التحقق - راجع التحليل' }));
        console.log('Alignment validation:', response.data);
      }
    } catch (error) {
      toast.error(t({ en: 'Validation failed', ar: 'فشل التحقق' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {t({ en: 'Link to Strategic Objectives', ar: 'الربط بالأهداف الاستراتيجية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            {t({
              en: 'Select which strategic plan objectives this challenge addresses',
              ar: 'اختر الأهداف الاستراتيجية التي يعالجها هذا التحدي'
            })}
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {strategicPlans.map((plan) => (
              <div key={plan.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
                <Checkbox
                  checked={selectedPlans.includes(plan.id)}
                  onCheckedChange={(checked) => {
                    setSelectedPlans(prev =>
                      checked
                        ? [...prev, plan.id]
                        : prev.filter(id => id !== plan.id)
                    );
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">
                    {language === 'ar' && plan?.['objective_ar'] ? plan?.['objective_ar'] : plan?.['objective_en'] || plan?.['title_en']}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {language === 'ar' && plan?.['description_ar'] ? plan?.['description_ar'] : plan?.['description_en']}
                  </p>
                  {plan?.['target_kpis']?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plan?.['target_kpis'].slice(0, 3).map((kpi, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {kpi.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedPlans.length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✓ {selectedPlans.length} {t({ en: 'strategic objective(s) selected', ar: 'هدف استراتيجي محدد' })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Validation */}
      <Button
        onClick={validateAlignment}
        disabled={validating || selectedPlans.length === 0}
        variant="outline"
        className="w-full"
      >
        {validating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t({ en: 'Validating...', ar: 'جاري التحقق...' })}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'AI: Validate Alignment', ar: 'ذكاء: التحقق من التوافق' })}
          </>
        )}
      </Button>

      {/* Save */}
      <div className="flex gap-3 justify-end">
        <Button
          onClick={handleUpdate}
          disabled={isPending}
          className="bg-gradient-to-r from-blue-600 to-teal-600"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Save Alignment', ar: 'حفظ التوافق' })}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
