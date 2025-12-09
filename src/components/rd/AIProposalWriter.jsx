import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIProposalWriter({ rdCallId, onGenerated }) {
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
        prompt: `You are an academic research proposal writer. Generate a comprehensive R&D proposal:

Researcher's Initial Thoughts:
${userThoughts}

Generate a structured research proposal with:
1. Research title (EN + AR) - compelling and academic
2. Abstract (EN + AR) - 250 words, problem + approach + expected impact
3. Research objectives (EN + AR) - specific, measurable objectives
4. Methodology (EN + AR) - detailed research approach
5. Expected outputs (publications, datasets, prototypes)
6. Timeline breakdown (12-18 months)
7. Budget justification
8. Team composition needs
9. Literature review summary
10. Risk assessment

Make it publication-quality and fundable.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            abstract_en: { type: 'string' },
            abstract_ar: { type: 'string' },
            objectives_en: { type: 'string' },
            objectives_ar: { type: 'string' },
            methodology_en: { type: 'string' },
            methodology_ar: { type: 'string' },
            expected_outputs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  output_en: { type: 'string' },
                  output_ar: { type: 'string' },
                  type: { type: 'string' },
                  target_date: { type: 'string' }
                }
              }
            },
            timeline: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  phase: { type: 'string' },
                  duration_months: { type: 'number' },
                  deliverables: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            budget_breakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category_en: { type: 'string' },
                  category_ar: { type: 'string' },
                  amount: { type: 'number' },
                  justification: { type: 'string' }
                }
              }
            },
            team_requirements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role_en: { type: 'string' },
                  role_ar: { type: 'string' },
                  expertise: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  risk: { type: 'string' },
                  mitigation: { type: 'string' }
                }
              }
            }
          }
        }
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
              {t({ en: 'Title:', ar: 'العنوان:' })} <strong>{generatedProposal.title_en}</strong>
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