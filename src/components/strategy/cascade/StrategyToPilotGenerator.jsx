import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Rocket, Loader2, CheckCircle2, Plus, Clock, Users, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useApprovalRequest } from '@/hooks/useApprovalRequest';

export default function StrategyToPilotGenerator({ strategicPlanId, strategicPlan, onPilotCreated }) {
  const { t, isRTL } = useLanguage();
  const { createApprovalRequest } = useApprovalRequest();
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [selectedSolution, setSelectedSolution] = useState('');
  const [pilotDuration, setPilotDuration] = useState('3');
  const [targetParticipants, setTargetParticipants] = useState('100');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedPilots, setGeneratedPilots] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter challenges by strategic plan
  const { data: challenges } = useQuery({
    queryKey: ['challenges-for-pilot-gen', strategicPlanId],
    queryFn: async () => {
      let query = supabase
        .from('challenges')
        .select('id, title_en, title_ar, municipality_id, strategic_plan_ids')
        .eq('is_deleted', false)
        .in('status', ['approved', 'published', 'open'])
        .order('created_at', { ascending: false })
        .limit(50);
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by strategic plan if one is selected
      if (strategicPlanId) {
        return (data || []).filter(c => c.strategic_plan_ids?.includes(strategicPlanId));
      }
      return data || [];
    }
  });

  const { data: solutions } = useQuery({
    queryKey: ['solutions-for-pilot-gen', selectedChallenge],
    queryFn: async () => {
      let query = supabase
        .from('solutions')
        .select('id, name_en, name_ar, provider_id')
        .eq('is_deleted', false)
        .in('status', ['approved', 'validated'])
        .order('created_at', { ascending: false })
        .limit(50);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true
  });

  const handleGenerate = async () => {
    if (!selectedChallenge) {
      toast.error(t({ en: 'Please select a challenge', ar: 'الرجاء اختيار تحدٍ' }));
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-pilot-generator', {
        body: {
          challenge_id: selectedChallenge,
          solution_id: selectedSolution || null,
          pilot_duration_months: Number(pilotDuration),
          target_participants: Number(targetParticipants),
          additional_context: additionalContext
        }
      });

      if (error) throw error;
      setGeneratedPilots(data?.pilots || []);
      toast.success(t({ en: 'Pilot designs generated', ar: 'تم إنشاء تصميمات التجارب' }));
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(t({ en: 'Failed to generate pilots', ar: 'فشل في إنشاء التجارب' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePilot = async (pilot, index, submitForApproval = false) => {
    const challenge = challenges?.find(c => c.id === selectedChallenge);
    
    try {
      // Get strategic_plan_ids from the challenge
      const challengeData = challenges?.find(c => c.id === selectedChallenge);
      const strategicPlanIds = challengeData?.strategic_plan_ids || [];
      
      const { data, error } = await supabase
        .from('pilots')
        .insert({
          name_en: pilot.name_en,
          name_ar: pilot.name_ar,
          description_en: pilot.description_en,
          description_ar: pilot.description_ar,
          challenge_id: selectedChallenge,
          solution_id: selectedSolution || null,
          municipality_id: challenge?.municipality_id,
          duration_months: Number(pilotDuration),
          target_participants: Number(targetParticipants),
          success_criteria: pilot.success_criteria,
          kpis: pilot.kpis,
          risks: pilot.risks,
          strategic_plan_ids: strategicPlanIds,
          is_strategy_derived: strategicPlanIds.length > 0,
          strategy_derivation_date: strategicPlanIds.length > 0 ? new Date().toISOString() : null,
          status: submitForApproval ? 'pending' : 'proposed'
        })
        .select()
        .single();

      if (error) throw error;

      // Create approval request if submitting for approval (Phase 4 integration)
      if (submitForApproval && strategicPlanIds.length > 0) {
        await createApprovalRequest({
          entityType: 'pilot',
          entityId: data.id,
          entityTitle: pilot.name_en,
          isStrategyDerived: true,
          strategicPlanIds: strategicPlanIds,
          metadata: {
            challenge_id: selectedChallenge,
            source: 'cascade_generator'
          }
        });
      }

      const updated = [...generatedPilots];
      updated[index] = { ...updated[index], saved: true, savedId: data.id, submitted: submitForApproval };
      setGeneratedPilots(updated);
      
      toast.success(t({ 
        en: submitForApproval ? 'Pilot saved and submitted for approval' : 'Pilot saved successfully', 
        ar: submitForApproval ? 'تم حفظ التجربة وإرسالها للموافقة' : 'تم حفظ التجربة بنجاح' 
      }));
      onPilotCreated?.(data);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t({ en: 'Failed to save pilot', ar: 'فشل في حفظ التجربة' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            {t({ en: 'Pilot Design Generator', ar: 'مولد تصميم التجارب' })}
          </CardTitle>
          <CardDescription>
            {t({ 
              en: 'Generate pilot project designs from challenges and solutions',
              ar: 'إنشاء تصميمات المشاريع التجريبية من التحديات والحلول'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t({ en: 'Challenge', ar: 'التحدي' })}
              </label>
              <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select a challenge', ar: 'اختر تحدياً' })} />
                </SelectTrigger>
                <SelectContent>
                  {challenges?.map(challenge => (
                    <SelectItem key={challenge.id} value={challenge.id}>
                      {isRTL ? challenge.title_ar : challenge.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t({ en: 'Solution (Optional)', ar: 'الحل (اختياري)' })}
              </label>
              <Select value={selectedSolution} onValueChange={setSelectedSolution}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select a solution', ar: 'اختر حلاً' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t({ en: 'No specific solution', ar: 'بدون حل محدد' })}</SelectItem>
                  {solutions?.map(solution => (
                    <SelectItem key={solution.id} value={solution.id}>
                      {isRTL ? solution.name_ar : solution.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {t({ en: 'Pilot Duration', ar: 'مدة التجربة' })}
              </label>
              <Select value={pilotDuration} onValueChange={setPilotDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 6, 9, 12].map(m => (
                    <SelectItem key={m} value={String(m)}>
                      {m} {t({ en: 'months', ar: 'شهر' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                {t({ en: 'Target Participants', ar: 'المشاركون المستهدفون' })}
              </label>
              <Input
                type="number"
                value={targetParticipants}
                onChange={(e) => setTargetParticipants(e.target.value)}
                min="10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t({ en: 'Additional Context (Optional)', ar: 'سياق إضافي (اختياري)' })}
            </label>
            <Textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder={t({ 
                en: 'Any specific requirements, constraints, or focus areas...',
                ar: 'أي متطلبات محددة أو قيود أو مجالات تركيز...'
              })}
              rows={2}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating || !selectedChallenge} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Generate Pilot Designs', ar: 'إنشاء تصميمات التجارب' })}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedPilots.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            {t({ en: 'Generated Pilot Designs', ar: 'تصميمات التجارب المُنشأة' })}
            <Badge variant="secondary">{generatedPilots.length}</Badge>
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {generatedPilots.map((pilot, idx) => (
              <Card key={idx} className={pilot.saved ? 'border-green-500/50 bg-green-50/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {isRTL ? pilot.name_ar : pilot.name_en}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {isRTL ? pilot.description_ar : pilot.description_en}
                      </CardDescription>
                    </div>
                    {pilot.saved ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t({ en: 'Saved', ar: 'محفوظ' })}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleSavePilot(pilot, idx)}>
                        <Plus className="h-3 w-3 mr-1" />
                        {t({ en: 'Save', ar: 'حفظ' })}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {pilotDuration} {t({ en: 'months', ar: 'شهر' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {targetParticipants} {t({ en: 'participants', ar: 'مشارك' })}
                    </span>
                  </div>
                  {pilot.success_criteria && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {t({ en: 'Success Criteria', ar: 'معايير النجاح' })}
                      </span>
                      <p className="text-sm mt-1">{pilot.success_criteria}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
