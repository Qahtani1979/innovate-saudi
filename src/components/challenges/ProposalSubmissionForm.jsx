import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { useChallengeProposalMutations } from '@/hooks/useChallengeProposalMutations';
import { useSolutions } from '@/hooks/useSolutions';

export default function ProposalSubmissionForm({ challenge, onSuccess, onCancel }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { triggerEmail } = useEmailTrigger();

  const { createProposal } = useChallengeProposalMutations();
  const { solutions } = useSolutions({
    publishedOnly: false,
    limit: 100
  });

  const [formData, setFormData] = useState({
    proposal_title: '',
    proposal_text: '',
    approach_summary: '',
    solution_id: '',
    timeline_weeks: 12,
    pricing_model: 'fixed_price',
    estimated_cost: 0,
    key_deliverables: [''],
    success_metrics: [{ metric: '', target: '' }]
  });

  const handleSubmit = (data) => {
    createProposal.mutate({
      challenge_id: challenge.id,
      proposer_email: user.email,
      ...data,
      submission_date: new Date().toISOString(),
      status: 'submitted'
    }, {
      onSuccess: async (proposal) => {
        // Trigger email notification for proposal submission
        await triggerEmail('challenge.proposal_received', {
          entity_type: 'challenge_proposal',
          entityId: proposal.id,
          variables: {
            proposal_title: formData.proposal_title,
            challenge_title: challenge.title_en,
            challenge_id: challenge.id,
            proposer_email: user.email
          }
        }).catch(err => console.error('Email trigger failed:', err));

        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            {t({ en: 'Submit Proposal', ar: 'إرسال مقترح' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Challenge Info */}
          <div className="p-3 bg-slate-50 rounded-lg border">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Challenge', ar: 'التحدي' })}</p>
            <p className="font-semibold text-slate-900">{challenge.title_en}</p>
          </div>

          {/* Link Existing Solution */}
          {solutions.length > 0 && (
            <div className="space-y-2">
              <Label>{t({ en: 'Link Your Solution (Optional)', ar: 'ربط حلك (اختياري)' })}</Label>
              <Select
                value={formData.solution_id}
                onValueChange={(value) => setFormData({ ...formData, solution_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select solution...', ar: 'اختر حلاً...' })} />
                </SelectTrigger>
                <SelectContent>
                  {solutions.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Proposal Title */}
          <div className="space-y-2">
            <Label>{t({ en: 'Proposal Title', ar: 'عنوان المقترح' })}</Label>
            <Input
              value={formData.proposal_title}
              onChange={(e) => setFormData({ ...formData, proposal_title: e.target.value })}
              placeholder={t({ en: 'Brief title for your proposal', ar: 'عنوان مختصر لمقترحك' })}
            />
          </div>

          {/* Approach Summary */}
          <div className="space-y-2">
            <Label>{t({ en: 'Approach Summary', ar: 'ملخص النهج' })}</Label>
            <Textarea
              value={formData.approach_summary}
              onChange={(e) => setFormData({ ...formData, approach_summary: e.target.value })}
              placeholder={t({ en: 'Executive summary of your approach', ar: 'ملخص تنفيذي لنهجك' })}
              rows={3}
            />
          </div>

          {/* Detailed Proposal */}
          <div className="space-y-2">
            <Label>{t({ en: 'Detailed Proposal', ar: 'المقترح التفصيلي' })}</Label>
            <Textarea
              value={formData.proposal_text}
              onChange={(e) => setFormData({ ...formData, proposal_text: e.target.value })}
              placeholder={t({ en: 'Detailed description of your proposed solution, methodology, and implementation plan', ar: 'وصف تفصيلي للحل المقترح والمنهجية وخطة التنفيذ' })}
              rows={8}
            />
          </div>

          {/* Timeline & Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Timeline (Weeks)', ar: 'الجدول الزمني (أسابيع)' })}</Label>
              <Input
                type="number"
                value={formData.timeline_weeks}
                onChange={(e) => setFormData({ ...formData, timeline_weeks: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Estimated Cost (SAR)', ar: 'التكلفة المقدرة (ريال)' })}</Label>
              <Input
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          {/* Pricing Model */}
          <div className="space-y-2">
            <Label>{t({ en: 'Pricing Model', ar: 'نموذج التسعير' })}</Label>
            <Select
              value={formData.pricing_model}
              onValueChange={(value) => setFormData({ ...formData, pricing_model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_price">{t({ en: 'Fixed Price', ar: 'سعر ثابت' })}</SelectItem>
                <SelectItem value="time_and_materials">{t({ en: 'Time & Materials', ar: 'وقت ومواد' })}</SelectItem>
                <SelectItem value="milestone_based">{t({ en: 'Milestone-Based', ar: 'حسب المعالم' })}</SelectItem>
                <SelectItem value="subscription">{t({ en: 'Subscription', ar: 'اشتراك' })}</SelectItem>
                <SelectItem value="other">{t({ en: 'Other', ar: 'أخرى' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          {t({ en: 'Cancel', ar: 'إلغاء' })}
        </Button>
        <Button
          onClick={() => handleSubmit(formData)}
          disabled={createProposal.isPending || !formData.proposal_text}
          className="bg-gradient-to-r from-green-600 to-teal-600"
        >
          {createProposal.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Submitting...', ar: 'جاري الإرسال...' })}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {t({ en: 'Submit Proposal', ar: 'إرسال المقترح' })}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
