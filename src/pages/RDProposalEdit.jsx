import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../components/LanguageContext';
import { Save, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useRDProposal } from '@/hooks/useRDProposal';
import { useRDProposalMutations } from '@/hooks/useRDProposalMutations';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { RD_PROPOSAL_SYSTEM_PROMPT, rdProposalPrompts } from '@/lib/ai/prompts/rd/proposalPrompts';
import { buildPrompt } from '@/lib/ai/promptBuilder';

export default function RDProposalEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const { invokeAI, status, isLoading: aiEnhancing, rateLimitInfo, isAvailable } = useAIWithFallback();

  const { data: proposal, isLoading } = useRDProposal(proposalId);
  const { updateRDProposal } = useRDProposalMutations();

  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (proposal && !formData) {
      setFormData({
        ...proposal,
        principal_investigator: proposal.principal_investigator || { name: '', title: '', email: '', expertise: [] },
        team_members: proposal.team_members || [],
        budget_breakdown: proposal.budget_breakdown || [],
        expected_outputs: proposal.expected_outputs || []
      });
    }
  }, [proposal]);

  const handleUpdate = () => {
    updateRDProposal.mutate({ id: proposalId, updates: formData }, {
      onSuccess: () => {
        navigate(createPageUrl(`RDProposalDetail?id=${proposalId}`));
      }
    });
  };

  const handleAIEnhance = async () => {
    // Build Prompt
    const { prompt, schema } = buildPrompt(rdProposalPrompts.enhance, {
      formData
    });

    const result = await invokeAI({
      prompt,
      system_prompt: RD_PROPOSAL_SYSTEM_PROMPT,
      response_json_schema: schema
    });

    if (result.success) {
      setFormData(prev => ({ ...prev, ...result.data }));
      toast.success(t({ en: '✨ AI academic enhancement complete!', ar: '✨ تم التحسين الأكاديمي الذكي!' }));
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Edit Research Proposal', ar: 'تعديل المقترح البحثي' })}
        </h1>
        <p className="text-slate-600 mt-1">{formData.title_en}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Proposal Information', ar: 'معلومات المقترح' })}</CardTitle>
            <Button onClick={handleAIEnhance} disabled={aiEnhancing || !isAvailable} variant="outline" size="sm">
              {aiEnhancing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Enhancing...', ar: 'جاري التحسين...' })}</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'AI Enhance', ar: 'تحسين ذكي' })}</>
              )}
            </Button>
            <AIStatusIndicator status={status} error={null} rateLimitInfo={rateLimitInfo} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Title (English) *', ar: 'العنوان (إنجليزي) *' })}</Label>
              <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
              <Input value={formData.title_ar || ''} onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })} dir="rtl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</Label>
              <Input value={formData.tagline_en || ''} onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</Label>
              <Input value={formData.tagline_ar || ''} onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })} dir="rtl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Abstract (English) *', ar: 'الملخص (إنجليزي) *' })}</Label>
            <Textarea value={formData.abstract_en || ''} onChange={(e) => setFormData({ ...formData, abstract_en: e.target.value })} rows={6} />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Abstract (Arabic)', ar: 'الملخص (عربي)' })}</Label>
            <Textarea value={formData.abstract_ar || ''} onChange={(e) => setFormData({ ...formData, abstract_ar: e.target.value })} rows={6} dir="rtl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Lead Institution *', ar: 'المؤسسة الرائدة *' })}</Label>
              <Input value={formData.lead_institution || ''} onChange={(e) => setFormData({ ...formData, lead_institution: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Research Area', ar: 'مجال البحث' })}</Label>
              <Input value={formData.research_area || ''} onChange={(e) => setFormData({ ...formData, research_area: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Methodology (English)', ar: 'المنهجية (إنجليزي)' })}</Label>
            <Textarea value={formData.methodology_en || ''} onChange={(e) => setFormData({ ...formData, methodology_en: e.target.value })} rows={4} />
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">{t({ en: 'Principal Investigator', ar: 'الباحث الرئيسي' })}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Name *', ar: 'الاسم *' })}</Label>
                <Input
                  value={formData.principal_investigator?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    principal_investigator: { ...(formData.principal_investigator || {}), name: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Title', ar: 'اللقب' })}</Label>
                <Input
                  value={formData.principal_investigator?.title || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    principal_investigator: { ...(formData.principal_investigator || {}), title: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Email *', ar: 'البريد الإلكتروني *' })}</Label>
                <Input
                  type="email"
                  value={formData.principal_investigator?.email || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    principal_investigator: { ...(formData.principal_investigator || {}), email: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'TRL Start', ar: 'المستوى التقني الحالي' })}</Label>
              <Input type="number" min="1" max="9" value={formData.trl_start || ''} onChange={(e) => setFormData({ ...formData, trl_start: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'TRL Target', ar: 'المستوى المستهدف' })}</Label>
              <Input type="number" min="1" max="9" value={formData.trl_target || ''} onChange={(e) => setFormData({ ...formData, trl_target: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Duration (months)', ar: 'المدة (شهور)' })}</Label>
              <Input type="number" value={formData.duration_months || ''} onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</Label>
              <Input type="number" value={formData.budget_requested || ''} onChange={(e) => setFormData({ ...formData, budget_requested: parseFloat(e.target.value) })} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => navigate(createPageUrl(`RDProposalDetail?id=${proposalId}`))}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateRDProposal.isPending || !formData.title_en || !formData.lead_institution}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {updateRDProposal.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Saving...', ar: 'جاري الحفظ...' })}</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />{t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
