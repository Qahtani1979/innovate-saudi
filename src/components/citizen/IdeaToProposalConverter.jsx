import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, FileText, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { IDEA_TO_PROPOSAL_SYSTEM_PROMPT, buildIdeaToProposalPrompt, IDEA_TO_PROPOSAL_SCHEMA } from '@/lib/ai/prompts/citizen';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useConvertIdeaToProposal } from '@/hooks/useCitizenIdeas';

export default function IdeaToProposalConverter({ idea, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const convertToProposal = useConvertIdeaToProposal();

  const [proposalData, setProposalData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    implementation_plan_en: '',
    implementation_plan_ar: '',
    budget_estimate: 0,
    duration_weeks: 12,
    team_composition: [],
    success_metrics_proposed: []
  });

  const generateWithAI = async () => {
    const response = await invokeAI({
      prompt: buildIdeaToProposalPrompt(idea),
      system_prompt: IDEA_TO_PROPOSAL_SYSTEM_PROMPT,
      response_json_schema: IDEA_TO_PROPOSAL_SCHEMA
    });

    if (response.success && response.data) {
      setProposalData(response.data);
      toast.success(t({ en: 'AI generated proposal', ar: 'تم توليد المقترح بالذكاء' }));
    }
  };

  const handleSubmit = async () => {
    if (!proposalData.title_en || !proposalData.description_en) {
      toast.error(t({ en: 'Title and description required', ar: 'العنوان والوصف مطلوبان' }));
      return;
    }

    // Map fields to innovation_proposals schema
    const targetData = {
      title_en: proposalData.title_en,
      title_ar: proposalData.title_ar,
      description_en: proposalData.description_en,
      description_ar: proposalData.description_ar,
      proposed_solution: proposalData.implementation_plan_en,
      budget_estimate: proposalData.budget_estimate,
      timeline: `${proposalData.duration_weeks} weeks`,
      team_info: proposalData.team_composition,
      expected_impact: proposalData.success_metrics_proposed ? JSON.stringify(proposalData.success_metrics_proposed) : null,
      submitter_email: idea.user_email || idea.submitter_email,
      municipality_id: idea.municipality_id,
      proposal_type: 'solution',
      status: 'submitted'
    };

    try {
      // @ts-ignore - Variables type inference issue
      const proposal = await convertToProposal.mutateAsync({ idea, proposalData: targetData });

      onSuccess?.(proposal);
      onClose?.();
    } catch (error) {
      console.error('Conversion error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {t({ en: 'Convert Idea to Structured Proposal', ar: 'تحويل الفكرة إلى مقترح منظم' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Source Idea */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              {t({ en: 'Source Idea:', ar: 'الفكرة المصدر:' })}
            </p>
            <p className="text-sm text-slate-900">{idea.title || idea.title_en || idea.title_ar}</p>
            <p className="text-xs text-slate-600 mt-1">{idea.description?.slice(0, 200)}...</p>
          </div>

          <AIStatusIndicator status={status} error={null} rateLimitInfo={rateLimitInfo} className="mb-4" />

          {/* AI Generate Button */}
          <Button
            onClick={generateWithAI}
            disabled={isLoading || !isAvailable}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t({ en: 'Generating Structured Proposal...', ar: 'توليد مقترح منظم...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t({ en: 'Generate with AI', ar: 'توليد بالذكاء' })}
              </>
            )}
          </Button>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                {t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}
              </label>
              <Input
                value={proposalData.title_en}
                onChange={(e) => setProposalData({ ...proposalData, title_en: e.target.value })}
                placeholder="Proposal title..."
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                {t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}
              </label>
              <Input
                value={proposalData.title_ar}
                onChange={(e) => setProposalData({ ...proposalData, title_ar: e.target.value })}
                placeholder="عنوان المقترح..."
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                {t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
              </label>
              <Textarea
                value={proposalData.description_en}
                onChange={(e) => setProposalData({ ...proposalData, description_en: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                {t({ en: 'Implementation Plan (English)', ar: 'خطة التنفيذ (إنجليزي)' })}
              </label>
              <Textarea
                value={proposalData.implementation_plan_en}
                onChange={(e) => setProposalData({ ...proposalData, implementation_plan_en: e.target.value })}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  {t({ en: 'Budget Estimate (SAR)', ar: 'تقدير الميزانية (ريال)' })}
                </label>
                <Input
                  type="number"
                  value={proposalData.budget_estimate}
                  onChange={(e) => setProposalData({ ...proposalData, budget_estimate: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  {t({ en: 'Duration (Weeks)', ar: 'المدة (أسابيع)' })}
                </label>
                <Input
                  type="number"
                  value={proposalData.duration_weeks}
                  onChange={(e) => setProposalData({ ...proposalData, duration_weeks: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {proposalData.success_metrics_proposed?.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  {t({ en: 'Success Metrics:', ar: 'مقاييس النجاح:' })}
                </p>
                {proposalData.success_metrics_proposed.map((metric, i) => (
                  <div key={i} className="text-xs text-slate-700 mb-1">
                    • {metric.metric_en || metric.metric_ar}: {metric.target}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={convertToProposal.isPending}
            >
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={convertToProposal.isPending || !proposalData.title_en}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {convertToProposal.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t({ en: 'Create Proposal', ar: 'إنشاء المقترح' })}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}