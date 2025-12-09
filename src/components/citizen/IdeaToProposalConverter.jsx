import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, FileText, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function IdeaToProposalConverter({ idea, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
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

  const createProposalMutation = useMutation({
    mutationFn: async (data) => {
      const proposal = await base44.entities.InnovationProposal.create(data);
      
      // Update idea status
      await base44.entities.CitizenIdea.update(idea.id, {
        status: 'converted_to_proposal',
        converted_entity_type: 'innovation_proposal',
        converted_entity_id: proposal.id
      });

      // Log activity
      await base44.entities.SystemActivity.create({
        entity_type: 'citizen_idea',
        entity_id: idea.id,
        action: 'converted_to_innovation_proposal',
        description: `Idea converted to InnovationProposal: ${proposal.title_en}`,
        metadata: { proposal_id: proposal.id }
      });

      return proposal;
    },
    onSuccess: (proposal) => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['innovation-proposals'] });
      toast.success(t({ en: 'Proposal created successfully', ar: 'تم إنشاء المقترح بنجاح' }));
      onSuccess?.(proposal);
      onClose?.();
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to create proposal', ar: 'فشل إنشاء المقترح' }));
    }
  });

  const generateWithAI = async () => {
    const response = await invokeAI({
      prompt: `Convert this citizen idea into a structured innovation proposal.

IDEA:
Title: ${idea.title || idea.title_en || idea.title_ar}
Description: ${idea.description || idea.description_en || idea.description_ar}
Category: ${idea.category || 'Not specified'}
Municipality: ${idea.municipality_id || 'Not specified'}

Generate a structured innovation proposal with:
1. Title (both Arabic and English)
2. Description (both Arabic and English) - expand on the idea
3. Implementation plan (both Arabic and English) - concrete steps
4. Budget estimate (realistic number in SAR)
5. Timeline (weeks)
6. Team requirements (roles needed)
7. Success metrics (3-5 measurable outcomes)

Be specific and actionable. Make it implementation-ready.`,
      response_json_schema: {
        type: "object",
        properties: {
          title_en: { type: "string" },
          title_ar: { type: "string" },
          description_en: { type: "string" },
          description_ar: { type: "string" },
          implementation_plan_en: { type: "string" },
          implementation_plan_ar: { type: "string" },
          budget_estimate: { type: "number" },
          duration_weeks: { type: "number" },
          team_composition: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role_en: { type: "string" },
                role_ar: { type: "string" },
                count: { type: "number" }
              }
            }
          },
          success_metrics_proposed: {
            type: "array",
            items: {
              type: "object",
              properties: {
                metric_en: { type: "string" },
                metric_ar: { type: "string" },
                target: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (response.success && response.data) {
      setProposalData(response.data);
      toast.success(t({ en: 'AI generated proposal', ar: 'تم توليد المقترح بالذكاء' }));
    }
  };

  const handleSubmit = () => {
    if (!proposalData.title_en || !proposalData.description_en) {
      toast.error(t({ en: 'Title and description required', ar: 'العنوان والوصف مطلوبان' }));
      return;
    }

    createProposalMutation.mutate({
      ...proposalData,
      submitter_email: idea.submitter_email,
      submitter_name: idea.submitter_name,
      municipality_id: idea.municipality_id,
      proposal_type: 'solution',
      innovation_type: idea.category,
      origin_idea_id: idea.id,
      status: 'submitted'
    });
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

          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

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
              disabled={createProposalMutation.isPending}
            >
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createProposalMutation.isPending || !proposalData.title_en}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {createProposalMutation.isPending ? (
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