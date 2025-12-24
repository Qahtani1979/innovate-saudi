import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from './LanguageContext';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createNotification } from './AutoNotification';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildProposalFeedbackPrompt } from '@/lib/ai/prompts/rd';

export default function ProposalFeedbackWorkflow({ proposal, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState('');
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const feedbackMutation = useMutation({
    mutationFn: async (data) => {
      const { supabase } = await import('@/integrations/supabase/client');

      const { error } = await supabase
        .from('rd_proposals')
        .update({
          feedback_provided: true,
          feedback_text: data.feedback,
          feedback_date: new Date().toISOString()
        })
        .eq('id', proposal.id);
      if (error) throw error;

      await createNotification({
        title: 'Proposal Feedback Available',
        body: `Feedback has been provided for your proposal "${proposal.title_en}"`,
        type: 'info',
        priority: 'medium',
        linkUrl: `RDProposalDetail?id=${proposal.id}`,
        entityType: 'proposal',
        entityId: proposal.id,
        recipientEmail: proposal.principal_investigator?.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['proposals']);
      toast.success(t({ en: 'Feedback sent', ar: 'تم إرسال الملاحظات' }));
      onClose();
    }
  });

  const generateAIFeedback = async () => {
    const reviewScores = proposal.reviewer_scores || [];
    const avgScore = reviewScores.length > 0
      ? reviewScores.reduce((sum, r) => sum + r.total, 0) / reviewScores.length
      : 0;

    const prompt = buildProposalFeedbackPrompt({
      proposal,
      avgScore,
      reviewComments: reviewScores.map(r => r.comments).join('\n') || 'No detailed comments'
    });

    const response = await invokeAI({ prompt });

    if (response.success && response.data) {
      setFeedback(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
    }
  };

  const handleSend = () => {
    feedbackMutation.mutate({ feedback });
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          {t({ en: 'Provide Feedback', ar: 'تقديم الملاحظات' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900">{proposal.title_en}</p>
          <p className="text-xs text-slate-600 mt-1">{proposal.lead_institution}</p>
        </div>

        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-3" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{t({ en: 'Feedback to Applicant', ar: 'الملاحظات للمتقدم' })}</Label>
            <Button
              onClick={generateAIFeedback}
              disabled={isLoading || !isAvailable}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              {t({ en: 'AI Draft', ar: 'مسودة ذكية' })}
            </Button>
          </div>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t({
              en: 'Provide constructive feedback to help improve future proposals...',
              ar: 'قدم ملاحظات بناءة للمساعدة في تحسين المقترحات المستقبلية...'
            })}
            rows={8}
          />
          <p className="text-xs text-slate-500">
            {t({
              en: 'This feedback will be sent to the principal investigator via notification and email.',
              ar: 'سيتم إرسال هذه الملاحظات إلى الباحث الرئيسي عبر الإشعار والبريد الإلكتروني.'
            })}
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleSend}
            disabled={!feedback || feedbackMutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {t({ en: 'Send Feedback', ar: 'إرسال الملاحظات' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}