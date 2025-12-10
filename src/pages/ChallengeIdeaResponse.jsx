import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Target, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function ChallengeIdeaResponse() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const challengeId = urlParams.get('challenge_id');
  const { invokeAI, status, isLoading: enhancing, rateLimitInfo, isAvailable } = useAIWithFallback();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    challenge_alignment_id: challengeId || '',
    title_en: '',
    description_en: '',
    proposal_type: 'solution',
    submitter_type: 'startup',
    submitter_email: '',
    submitter_organization: '',
    implementation_plan: '',
    budget_estimate: '',
    timeline_proposal: ''
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-open'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('is_published', true).in('status', ['approved', 'in_treatment']);
      return data || [];
    }
  });

  const selectedChallenge = challenges.find(c => c.id === formData.challenge_alignment_id);

  const enhanceWithAI = async () => {
    if (!selectedChallenge) return;
    
    const result = await invokeAI({
      prompt: `Generate a solution proposal for this challenge:

Challenge: ${selectedChallenge.title_en}
Description: ${selectedChallenge.description_en}
Current input: ${formData.title_en}

Generate a structured solution proposal with:
1. Title (EN & AR)
2. Detailed approach
3. Implementation plan
4. Timeline
5. Budget estimate`,
      response_json_schema: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          implementation_plan: { type: 'string' },
          timeline_proposal: { type: 'string' },
          budget_estimate: { type: 'number' }
        }
      }
    });

    if (result.success) {
      setFormData({ ...formData, ...result.data });
      toast.success(t({ en: 'AI enhanced proposal', ar: 'تم تحسين المقترح' }));
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase.from('innovation_proposals').insert({
        ...data,
        code: `RESP-${Date.now().toString().slice(-8)}`,
        status: 'submitted',
        created_by: user?.email || data.submitter_email
      }).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success(t({ en: 'Response submitted!', ar: 'تم التقديم!' }));
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-900 to-orange-700 bg-clip-text text-transparent">
          {t({ en: 'Respond to Challenge', ar: 'الرد على التحدي' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Submit your solution proposal', ar: 'قدم مقترح الحل الخاص بك' })}
        </p>
      </div>

      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label>{t({ en: 'Select Challenge', ar: 'اختر التحدي' })}</Label>
            <Select value={formData.challenge_alignment_id} onValueChange={(v) => setFormData({ ...formData, challenge_alignment_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Choose challenge...', ar: 'اختر التحدي...' })} />
              </SelectTrigger>
              <SelectContent>
                {challenges.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedChallenge && (
              <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-900 font-medium">{selectedChallenge.title_en}</p>
                <p className="text-xs text-slate-600 mt-1">{selectedChallenge.description_en?.substring(0, 200)}...</p>
              </div>
            )}
          </div>

          <Button onClick={enhanceWithAI} disabled={enhancing || !selectedChallenge || !isAvailable} variant="outline" className="w-full">
            {enhancing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'AI Enhance My Response', ar: 'تحسين ردي بالذكاء' })}
          </Button>

          <div>
            <Label>{t({ en: 'Solution Title', ar: 'عنوان الحل' })}</Label>
            <Input
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>{t({ en: 'Detailed Approach', ar: 'النهج التفصيلي' })}</Label>
            <Textarea
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={5}
              required
            />
          </div>

          <div>
            <Label>{t({ en: 'Implementation Plan', ar: 'خطة التنفيذ' })}</Label>
            <Textarea
              value={formData.implementation_plan}
              onChange={(e) => setFormData({ ...formData, implementation_plan: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</Label>
              <Input
                type="number"
                value={formData.budget_estimate}
                onChange={(e) => setFormData({ ...formData, budget_estimate: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>{t({ en: 'Timeline', ar: 'المدة' })}</Label>
              <Input
                value={formData.timeline_proposal}
                onChange={(e) => setFormData({ ...formData, timeline_proposal: e.target.value })}
                placeholder="8 weeks"
              />
            </div>
          </div>

          <Button 
            onClick={() => submitMutation.mutate(formData)}
            disabled={submitMutation.isPending || !formData.title_en || !formData.challenge_alignment_id}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600"
          >
            {submitMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            {t({ en: 'Submit Response', ar: 'تقديم الرد' })}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ChallengeIdeaResponse, { requiredPermissions: [] });
