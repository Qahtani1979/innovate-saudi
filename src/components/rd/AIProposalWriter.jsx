import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PROPOSAL_WRITER_PROMPTS } from '@/lib/ai/prompts/rd';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function AIProposalWriter({ rdCallId, rdCallContext, onGenerated }) {
  const { language, isRTL, t } = useLanguage();
  const [userThoughts, setUserThoughts] = useState('');
  const [generatedProposal, setGeneratedProposal] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateProposal = async () => {
    if (!userThoughts.trim()) {
      toast.error(t({ en: 'Enter your research ideas first', ar: 'أدخل أفكارك البحثية أولاً' }));
      return;
    }

    try {
      const result = await invokeAI({
        systemPrompt: getSystemPrompt('rd_proposal_writer'),
        prompt: PROPOSAL_WRITER_PROMPTS.buildPrompt(userThoughts, rdCallContext),
        response_json_schema: PROPOSAL_WRITER_PROMPTS.schema
      });

      if (result.success) {
        setGeneratedProposal(result.data);
        onGenerated?.(result.data);
        toast.success(t({ en: 'AI generated proposal!', ar: 'تم إنشاء المقترح!' }));
      } else {
        toast.error(t({ en: 'Generation failed', ar: 'فشل الإنشاء' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل الإنشاء' }));
    }
  };

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Academic Writing Assistant', ar: 'مساعد الكتابة الأكاديمية الذكي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} className="mb-2" />
        
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Describe your research idea in your own words:', ar: 'صف فكرتك البحثية بكلماتك:' })}
          </label>
          <Textarea
            value={userThoughts}
            onChange={(e) => setUserThoughts(e.target.value)}
            rows={6}
            placeholder={t({
              en: 'E.g., I want to research how AI can improve traffic flow in Riyadh...',
              ar: 'مثلاً: أريد البحث في كيفية تحسين الذكاء الاصطناعي لحركة المرور في الرياض...'
            })}
            className="font-mono"
          />
        </div>

        <Button
          onClick={generateProposal}
          disabled={generating || !userThoughts.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t({ en: 'AI Writing Proposal...', ar: 'الذكاء يكتب المقترح...' })}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              {t({ en: 'Generate Full Proposal with AI', ar: 'إنشاء مقترح كامل بالذكاء' })}
            </>
          )}
        </Button>

        {generatedProposal && (
          <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-green-600" />
              <p className="font-semibold text-green-900">
                {t({ en: 'Proposal Generated!', ar: 'تم إنشاء المقترح!' })}
              </p>
            </div>
            <p className="text-sm text-slate-700">
              {t({ en: 'Title:', ar: 'العنوان:' })} <strong>{language === 'ar' && generatedProposal.title_ar ? generatedProposal.title_ar : generatedProposal.title_en}</strong>
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {t({ en: 'All fields have been auto-filled. Review and edit as needed.', ar: 'تم ملء جميع الحقول تلقائياً. راجع وعدل حسب الحاجة.' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
