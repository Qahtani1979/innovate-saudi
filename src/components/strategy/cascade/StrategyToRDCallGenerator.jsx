import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, GraduationCap, Loader2, CheckCircle2, Plus, DollarSign, Calendar, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useApprovalRequest } from '@/hooks/useApprovalRequest';

export default function StrategyToRDCallGenerator({ onRDCallCreated }) {
  const { t, isRTL } = useLanguage();
  const { createApprovalRequest } = useApprovalRequest();
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [budgetMin, setBudgetMin] = useState('50000');
  const [budgetMax, setBudgetMax] = useState('500000');
  const [duration, setDuration] = useState('12');
  const [generatedCalls, setGeneratedCalls] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: challenges } = useQuery({
    queryKey: ['challenges-for-rd-gen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title_en, title_ar, status, sector_id, strategic_plan_ids')
        .eq('is_deleted', false)
        .in('status', ['approved', 'published', 'open'])
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  const handleChallengeToggle = (challengeId) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleGenerate = async () => {
    if (selectedChallenges.length === 0) {
      toast.error(t({ en: 'Please select at least one challenge', ar: 'الرجاء اختيار تحدٍ واحد على الأقل' }));
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-rd-call-generator', {
        body: {
          challenge_ids: selectedChallenges,
          budget_range: { min: Number(budgetMin), max: Number(budgetMax) },
          duration_months: Number(duration)
        }
      });

      if (error) throw error;
      setGeneratedCalls(data?.rd_calls || []);
      toast.success(t({ en: 'R&D calls generated successfully', ar: 'تم إنشاء طلبات البحث والتطوير بنجاح' }));
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(t({ en: 'Failed to generate R&D calls', ar: 'فشل في إنشاء طلبات البحث والتطوير' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCall = async (call, index) => {
    try {
      // Get strategic_plan_ids from the selected challenges
      const selectedChallengesData = challenges?.filter(c => selectedChallenges.includes(c.id)) || [];
      const strategicPlanIds = [...new Set(selectedChallengesData.flatMap(c => c.strategic_plan_ids || []))];
      
      const { data, error } = await supabase
        .from('rd_calls')
        .insert({
          title_en: call.title_en,
          title_ar: call.title_ar,
          description_en: call.description_en,
          description_ar: call.description_ar,
          research_objectives: call.research_objectives,
          eligibility_criteria: call.eligibility_criteria,
          budget_min: Number(budgetMin),
          budget_max: Number(budgetMax),
          duration_months: Number(duration),
          challenge_ids: selectedChallenges,
          strategic_plan_ids: strategicPlanIds,
          is_strategy_derived: strategicPlanIds.length > 0,
          strategy_derivation_date: strategicPlanIds.length > 0 ? new Date().toISOString() : null,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      const updated = [...generatedCalls];
      updated[index] = { ...updated[index], saved: true, savedId: data.id };
      setGeneratedCalls(updated);
      
      toast.success(t({ en: 'R&D call saved successfully', ar: 'تم حفظ طلب البحث والتطوير بنجاح' }));
      onRDCallCreated?.(data);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t({ en: 'Failed to save R&D call', ar: 'فشل في حفظ طلب البحث والتطوير' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {t({ en: 'R&D Call Generator', ar: 'مولد طلبات البحث والتطوير' })}
          </CardTitle>
          <CardDescription>
            {t({ 
              en: 'Generate research and development calls from strategic challenges',
              ar: 'إنشاء طلبات البحث والتطوير من التحديات الاستراتيجية'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {t({ en: 'Select Challenges', ar: 'اختر التحديات' })}
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {challenges?.map(challenge => (
                <div key={challenge.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`challenge-${challenge.id}`}
                    checked={selectedChallenges.includes(challenge.id)}
                    onCheckedChange={() => handleChallengeToggle(challenge.id)}
                  />
                  <label htmlFor={`challenge-${challenge.id}`} className="text-sm cursor-pointer flex-1">
                    {isRTL ? challenge.title_ar : challenge.title_en}
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {challenge.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {t({ en: 'Min Budget (SAR)', ar: 'الحد الأدنى للميزانية (ريال)' })}
              </label>
              <Input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {t({ en: 'Max Budget (SAR)', ar: 'الحد الأقصى للميزانية (ريال)' })}
              </label>
              <Input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {t({ en: 'Duration (months)', ar: 'المدة (أشهر)' })}
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 9, 12, 18, 24, 36].map(m => (
                    <SelectItem key={m} value={String(m)}>{m} {t({ en: 'months', ar: 'شهر' })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating || selectedChallenges.length === 0} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Generate R&D Calls', ar: 'إنشاء طلبات البحث والتطوير' })}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedCalls.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {t({ en: 'Generated R&D Calls', ar: 'طلبات البحث والتطوير المُنشأة' })}
            <Badge variant="secondary">{generatedCalls.length}</Badge>
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {generatedCalls.map((call, idx) => (
              <Card key={idx} className={call.saved ? 'border-green-500/50 bg-green-50/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {isRTL ? call.title_ar : call.title_en}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {isRTL ? call.description_ar : call.description_en}
                      </CardDescription>
                    </div>
                    {call.saved ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t({ en: 'Saved', ar: 'محفوظ' })}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleSaveCall(call, idx)}>
                        <Plus className="h-3 w-3 mr-1" />
                        {t({ en: 'Save', ar: 'حفظ' })}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {Number(budgetMin).toLocaleString()} - {Number(budgetMax).toLocaleString()} SAR
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {duration} {t({ en: 'months', ar: 'شهر' })}
                    </span>
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
