import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Target, Loader2, CheckCircle2, AlertTriangle, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useApprovalRequest } from '@/hooks/useApprovalRequest';

export default function StrategyChallengeGenerator({ strategicPlanId, strategicPlan, onChallengeCreated }) {
  const { t, isRTL } = useLanguage();
  const { createApprovalRequest } = useApprovalRequest();
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [challengeCount, setChallengeCount] = useState(3);
  const [generatedChallenges, setGeneratedChallenges] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');

  // Use the passed strategicPlanId from context
  const selectedPlanId = strategicPlanId;
  const objectives = strategicPlan?.objectives || [];

  const { data: sectors } = useQuery({
    queryKey: ['sectors-for-challenge-gen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name_en, name_ar')
        .eq('is_active', true)
        .order('name_en');
      if (error) throw error;
      return data || [];
    }
  });

  const handleObjectiveToggle = (objectiveId) => {
    setSelectedObjectives(prev => 
      prev.includes(objectiveId) 
        ? prev.filter(id => id !== objectiveId)
        : [...prev, objectiveId]
    );
  };

  const handleGenerate = async () => {
    if (!selectedPlanId || selectedObjectives.length === 0) {
      toast.error(t({ en: 'Please select a plan and at least one objective', ar: 'الرجاء اختيار خطة وهدف واحد على الأقل' }));
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-challenge-generator', {
        body: {
          strategic_plan_id: selectedPlanId,
          objective_ids: selectedObjectives,
          sector_id: selectedSector || null,
          challenge_count: challengeCount,
          additional_context: additionalContext
        }
      });

      if (error) throw error;
      setGeneratedChallenges(data?.challenges || []);
      toast.success(t({ en: 'Challenges generated successfully', ar: 'تم إنشاء التحديات بنجاح' }));
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(t({ en: 'Failed to generate challenges', ar: 'فشل في إنشاء التحديات' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveChallenge = async (challenge, index, submitForApproval = false) => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          title_en: challenge.title_en,
          title_ar: challenge.title_ar,
          description_en: challenge.description_en,
          description_ar: challenge.description_ar,
          problem_statement_en: challenge.problem_statement_en,
          problem_statement_ar: challenge.problem_statement_ar,
          desired_outcome_en: challenge.desired_outcome_en,
          desired_outcome_ar: challenge.desired_outcome_ar,
          sector_id: selectedSector || null,
          strategic_plan_ids: [selectedPlanId],
          is_strategy_derived: true,
          strategy_derivation_date: new Date().toISOString(),
          status: submitForApproval ? 'pending' : 'draft',
          source: 'ai_generated'
        })
        .select()
        .single();

      if (error) throw error;

      // Create approval request if submitting for approval (Phase 4 integration)
      if (submitForApproval) {
        await createApprovalRequest({
          entityType: 'challenge',
          entityId: data.id,
          entityTitle: challenge.title_en,
          isStrategyDerived: true,
          strategicPlanIds: [selectedPlanId],
          metadata: {
            sector_id: selectedSector,
            source: 'cascade_generator'
          }
        });
      }

      const updated = [...generatedChallenges];
      updated[index] = { ...updated[index], saved: true, savedId: data.id, submitted: submitForApproval };
      setGeneratedChallenges(updated);
      
      toast.success(t({ 
        en: submitForApproval ? 'Challenge saved and submitted for approval' : 'Challenge saved successfully', 
        ar: submitForApproval ? 'تم حفظ التحدي وإرساله للموافقة' : 'تم حفظ التحدي بنجاح' 
      }));
      onChallengeCreated?.(data);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t({ en: 'Failed to save challenge', ar: 'فشل في حفظ التحدي' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t({ en: 'AI Challenge Generator', ar: 'مولد التحديات بالذكاء الاصطناعي' })}
          </CardTitle>
          <CardDescription>
            {t({ 
              en: 'Generate innovation challenges aligned with strategic objectives',
              ar: 'إنشاء تحديات الابتكار المتوافقة مع الأهداف الاستراتيجية'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {strategicPlan && (
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-700">
                <span className="font-medium">{t({ en: 'Active Plan:', ar: 'الخطة النشطة:' })}</span>{' '}
                {isRTL && strategicPlan.name_ar ? strategicPlan.name_ar : strategicPlan.name_en}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t({ en: 'Sector Focus', ar: 'القطاع المستهدف' })}
              </label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'All sectors', ar: 'جميع القطاعات' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t({ en: 'All sectors', ar: 'جميع القطاعات' })}</SelectItem>
                  {sectors?.map(sector => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {isRTL ? sector.name_ar : sector.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {objectives.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">
                {t({ en: 'Select Objectives to Address', ar: 'اختر الأهداف المراد معالجتها' })}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {objectives.map((obj, idx) => (
                  <div key={obj.id || idx} className="flex items-center gap-2">
                    <Checkbox
                      id={`obj-${idx}`}
                      checked={selectedObjectives.includes(obj.id || idx)}
                      onCheckedChange={() => handleObjectiveToggle(obj.id || idx)}
                    />
                    <label htmlFor={`obj-${idx}`} className="text-sm cursor-pointer">
                      {isRTL ? obj.title_ar : obj.title_en}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t({ en: 'Additional Context (Optional)', ar: 'سياق إضافي (اختياري)' })}
            </label>
            <Textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder={t({ 
                en: 'Add any specific requirements or focus areas...',
                ar: 'أضف أي متطلبات محددة أو مجالات تركيز...'
              })}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">
                {t({ en: 'Generate', ar: 'إنشاء' })}
              </label>
              <Select value={String(challengeCount)} onValueChange={(v) => setChallengeCount(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {t({ en: 'challenges', ar: 'تحديات' })}
              </span>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !selectedPlanId || selectedObjectives.length === 0}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate Challenges', ar: 'إنشاء التحديات' })}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t({ en: 'Generated Challenges', ar: 'التحديات المُنشأة' })}
            <Badge variant="secondary">{generatedChallenges.length}</Badge>
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {generatedChallenges.map((challenge, idx) => (
              <Card key={idx} className={challenge.saved ? 'border-green-500/50 bg-green-50/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {isRTL ? challenge.title_ar : challenge.title_en}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {isRTL ? challenge.description_ar : challenge.description_en}
                      </CardDescription>
                    </div>
                    {challenge.saved ? (
                      <Badge variant="outline" className={challenge.submitted ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {challenge.submitted 
                          ? t({ en: 'Submitted', ar: 'مُرسل' })
                          : t({ en: 'Saved', ar: 'محفوظ' })}
                      </Badge>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleSaveChallenge(challenge, idx, false)}>
                          <Plus className="h-3 w-3 mr-1" />
                          {t({ en: 'Save', ar: 'حفظ' })}
                        </Button>
                        <Button size="sm" onClick={() => handleSaveChallenge(challenge, idx, true)}>
                          <Send className="h-3 w-3 mr-1" />
                          {t({ en: 'Save & Submit', ar: 'حفظ وإرسال' })}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {t({ en: 'Problem Statement', ar: 'بيان المشكلة' })}
                    </span>
                    <p className="text-sm mt-1">
                      {isRTL ? challenge.problem_statement_ar : challenge.problem_statement_en}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {t({ en: 'Desired Outcome', ar: 'النتيجة المرجوة' })}
                    </span>
                    <p className="text-sm mt-1">
                      {isRTL ? challenge.desired_outcome_ar : challenge.desired_outcome_en}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
