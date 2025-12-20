import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { MessageSquare, Sparkles, Loader2, CheckCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  buildConversationIntelligencePrompt, 
  CONVERSATION_INTELLIGENCE_SYSTEM_PROMPT, 
  CONVERSATION_INTELLIGENCE_SCHEMA 
} from '@/lib/ai/prompts/communications/conversationIntelligence';

export default function ConversationIntelligence({ messages }) {
  const { language, t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const { invokeAI, isLoading: analyzing, status, error, rateLimitInfo } = useAIWithFallback();

  const analyzeThread = async () => {
    const threadText = messages.map(m => `${m.sender}: ${m.content}`).join('\n');
    
    const result = await invokeAI({
      system_prompt: CONVERSATION_INTELLIGENCE_SYSTEM_PROMPT,
      prompt: buildConversationIntelligencePrompt({ threadText }),
      response_json_schema: CONVERSATION_INTELLIGENCE_SCHEMA
    });

    if (result.success && result.data) {
      setSummary(result.data);
      toast.success(t({ en: 'Thread analyzed', ar: 'السلسلة محللة' }));
    }
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-teal-600" />
            {t({ en: 'Conversation Intelligence', ar: 'ذكاء المحادثات' })}
          </CardTitle>
          <Button onClick={analyzeThread} disabled={analyzing || !messages?.length} size="sm" className="bg-teal-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} className="mb-4" />
        
        {!summary && !analyzing && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-teal-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: `AI summarizes ${messages?.length || 0} messages and extracts action items`, ar: `الذكاء يلخص ${messages?.length || 0} رسالة ويستخرج عناصر الإجراء` })}
            </p>
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded border">
              <h4 className="font-semibold text-sm text-slate-900 mb-2">
                {t({ en: 'Summary', ar: 'الملخص' })}
              </h4>
              <p className="text-sm text-slate-700">{summary.summary}</p>
            </div>

            {summary.action_items?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded border-2 border-blue-300">
                <h4 className="font-semibold text-sm text-blue-900 mb-3">
                  {t({ en: '✓ Action Items', ar: '✓ عناصر الإجراء' })}
                </h4>
                <div className="space-y-2">
                  {summary.action_items.map((item, i) => (
                    <div key={i} className="p-2 bg-white rounded text-sm">
                      <div className="flex items-start justify-between">
                        <span className="text-slate-900">{item.action}</span>
                        {item.deadline && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.deadline}
                          </Badge>
                        )}
                      </div>
                      {item.owner && (
                        <p className="text-xs text-slate-500 mt-1">Owner: {item.owner}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.decisions?.length > 0 && (
              <div className="p-4 bg-green-50 rounded border border-green-300">
                <h4 className="font-semibold text-sm text-green-900 mb-2">
                  {t({ en: 'Decisions Made', ar: 'القرارات المتخذة' })}
                </h4>
                <ul className="space-y-1">
                  {summary.decisions.map((decision, i) => (
                    <li key={i} className="text-xs text-slate-700">
                      <CheckCircle className="h-3 w-3 inline text-green-600 mr-1" />
                      {decision}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.follow_ups?.length > 0 && (
              <div className="p-4 bg-purple-50 rounded border border-purple-300">
                <h4 className="font-semibold text-sm text-purple-900 mb-2">
                  {t({ en: 'Recommended Follow-ups', ar: 'المتابعات الموصى بها' })}
                </h4>
                <ul className="space-y-1">
                  {summary.follow_ups.map((followup, i) => (
                    <li key={i} className="text-xs text-slate-700">• {followup}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
