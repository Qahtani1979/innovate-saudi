import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Mail, Send, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildMatchNotifierPrompt, MATCH_NOTIFIER_SCHEMA } from '@/lib/ai/prompts/matchmaker';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export default function AutomatedMatchNotifier({ match, provider, challenge }) {
  const { language, t } = useLanguage();
  const [emailContent, setEmailContent] = useState('');
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { notify, isNotifying } = useNotificationSystem();

  const generateEmail = async () => {
    const result = await invokeAI({
      prompt: buildMatchNotifierPrompt(provider, challenge, match),
      response_json_schema: MATCH_NOTIFIER_SCHEMA
    });

    if (result.success) {
      setEmailContent(`Subject: ${result.data.subject}\n\n${result.data.body}`);
      toast.success(t({ en: 'Email generated', ar: 'تم إنشاء البريد' }));
    }
  };

  const handleSendNotification = async () => {
    const [subject, ...bodyLines] = emailContent.split('\n').filter(line => line.trim());
    const body = bodyLines.join('\n');

    const emailSubjectRaw = subject.replace('Subject: ', '');

    try {
      await notify({
        type: 'matchmaker_match',
        entityType: 'match',
        entityId: match.id,
        recipientEmails: [provider.contact_email],
        title: 'New Challenge Match',
        message: `You've been matched to challenge: ${challenge.title_en}`,
        sendEmail: true,
        emailTemplate: 'MATCHMAKER_MATCH', // Assuming this template or generic handling exists in edge function
        // If the edge function expects specific body structure for ad-hoc emails, we might need to adjust useNotificationSystem
        // But based on useNotificationSystem implementation, it invokes 'email-trigger-hub' with variables.
        emailVariables: {
          providerName: provider.name_en,
          challengeTitle: challenge.title_en,
          matchScore: match.match_score,
          emailSubject: emailSubjectRaw,
          emailBody: body
        }
      });
      toast.success(t({ en: 'Notification sent', ar: 'تم إرسال الإشعار' }));
      setEmailContent('');
    } catch (error) {
      toast.error(t({ en: 'Failed to send notification', ar: 'فشل إرسال الإشعار' }));
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          {t({ en: 'Automated Match Notifier', ar: 'مخطر المطابقة الآلي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />

        {!emailContent && (
          <div className="text-center py-6">
            <Mail className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'AI generates personalized notification emails for matches', ar: 'الذكاء ينشئ رسائل إشعار مخصصة للمطابقات' })}
            </p>
            <Button onClick={generateEmail} disabled={isLoading || !isAvailable} className="bg-gradient-to-r from-blue-600 to-cyan-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Email', ar: 'إنشاء بريد' })}
            </Button>
          </div>
        )}

        {emailContent && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-green-100 text-green-700">
                  {t({ en: 'AI Generated', ar: 'منشأ بالذكاء' })}
                </Badge>
                <Button variant="outline" size="sm" onClick={generateEmail} disabled={isLoading || !isAvailable}>
                  {t({ en: 'Regenerate', ar: 'إعادة إنشاء' })}
                </Button>
              </div>
              <Textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSendNotification}
                disabled={isNotifying}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                <Send className="h-4 w-4 mr-2" />
                {t({ en: 'Send to Provider', ar: 'إرسال للمزود' })}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEmailContent('')}
              >
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-slate-700">
                <strong>{t({ en: 'Will send to:', ar: 'سيُرسل إلى:' })}</strong> {provider.contact_email}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
