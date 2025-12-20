import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [selectedPlans, setSelectedPlans] = useState(challenge?.strategic_plan_ids || []);
  const { invokeAI, status, isLoading: validating, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: async () => {
      const { data } = await supabase.from('strategic_plans').select('*');
      return data || [];
    }
  });

  const { data: existingLinks = [] } = useQuery({
    queryKey: ['strategic-links', challenge?.id],
    queryFn: async () => {
      const { data } = await supabase.from('strategic_plan_challenge_links').select('*').eq('challenge_id', challenge?.id);
      return data || [];
    },
    enabled: !!challenge?.id
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!challenge.id || challenge.id === 'preview') {
        if (onUpdate) onUpdate(selectedPlans);
        return;
      }

      await supabase.from('challenges').update({
        strategic_plan_ids: selectedPlans
      }).eq('id', challenge.id);

      const currentLinks = existingLinks.map(l => l.strategic_plan_id);
      const toAdd = selectedPlans.filter(id => !currentLinks.includes(id));
      const toRemove = currentLinks.filter(id => !selectedPlans.includes(id));

      await Promise.all([
        ...toAdd.map(plan_id => 
          supabase.from('strategic_plan_challenge_links').insert({
            strategic_plan_id: plan_id,
            challenge_id: challenge.id,
            contribution_type: 'addresses',
            linked_date: new Date().toISOString()
          })
        ),
        ...toRemove.map(plan_id => {
          const link = existingLinks.find(l => l.strategic_plan_id === plan_id);
          return link ? supabase.from('strategic_plan_challenge_links').delete().eq('id', link.id) : Promise.resolve();
        })
      ]);
    },
    onSuccess: () => {
      if (challenge.id && challenge.id !== 'preview') {
        queryClient.invalidateQueries(['challenge', challenge.id]);
        queryClient.invalidateQueries(['strategic-links']);
      }
      toast.success(t({ en: 'Strategic alignment updated', ar: 'تم تحديث التوافق الاستراتيجي' }));
      if (onUpdate) onUpdate(selectedPlans);
    }
  });

  const validateAlignment = async () => {
    if (selectedPlans.length === 0) {
      toast.error(t({ en: 'Select at least one strategic objective', ar: 'اختر هدفاً استراتيجياً واحداً على الأقل' }));
      return;
    }

    try {
      const selectedPlanObjects = strategicPlans.filter(p => selectedPlans.includes(p.id));
      
      const response = await invokeAI({
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
                    {language === 'ar' && plan.objective_ar ? plan.objective_ar : plan.objective_en || plan.title_en}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {language === 'ar' && plan.description_ar ? plan.description_ar : plan.description_en}
                  </p>
                  {plan.target_kpis?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plan.target_kpis.slice(0, 3).map((kpi, i) => (
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
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-teal-600"
        >
          {updateMutation.isPending ? (
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