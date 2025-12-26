import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

import { useRDMutations } from '@/hooks/useRDMutations';

export default function RDProposalAIScorerWidget({ proposal }) {
  const { language, t } = useLanguage();
  const { updateProposal } = useRDMutations();
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo, error } = useAIWithFallback();

  const runAIScoring = async () => {
    const result = await invokeAI({
      prompt: `Score this R&D proposal comprehensively:

Title: ${proposal.title_en}
Abstract: ${proposal.abstract_en || 'N/A'}
Budget: ${proposal.budget_requested || 'N/A'}
Duration: ${proposal.duration_months || 'N/A'} months
TRL: ${proposal.trl_start} → ${proposal.trl_target}

Provide scores (0-100) for:
1. Innovation novelty
2. Scientific feasibility
3. Team adequacy
4. Budget reasonability
5. Municipal impact potential
6. Commercialization potential
7. Strategic alignment with Saudi Vision 2030
8. Risk level (0=high risk, 100=low risk)

Calculate overall score (weighted average).`,
      response_json_schema: {
        type: 'object',
        properties: {
          innovation_score: { type: 'number' },
          feasibility_score: { type: 'number' },
          team_score: { type: 'number' },
          budget_score: { type: 'number' },
          impact_score: { type: 'number' },
          commercialization_score: { type: 'number' },
          strategic_alignment_score: { type: 'number' },
          risk_score: { type: 'number' },
          overall_score: { type: 'number' },
          recommendation: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          concerns: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      updateProposal.mutate({
        id: proposal.id,
        data: {
          ai_score: result.data.overall_score,
          ai_scoring_breakdown: {
            innovation_score: result.data.innovation_score,
            feasibility_score: result.data.feasibility_score,
            team_score: result.data.team_score,
            budget_score: result.data.budget_score,
            impact_score: result.data.impact_score,
            commercialization_score: result.data.commercialization_score,
            strategic_alignment_score: result.data.strategic_alignment_score,
            risk_score: result.data.risk_score
          },
          ai_recommendation: result.data.recommendation,
          ai_strengths: result.data.strengths,
          ai_concerns: result.data.concerns
        }
      });
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="h-5 w-5" />
            {t({ en: 'AI Scoring & Analysis', ar: 'التقييم والتحليل الذكي' })}
          </CardTitle>
          {!proposal.ai_score && (
            <Button
              onClick={runAIScoring}
              disabled={isLoading || !isAvailable}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Scoring...', ar: 'جاري التقييم...' })}</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'Run AI Score', ar: 'تشغيل التقييم' })}</>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} error={error} className="mb-4" />

        {proposal.ai_score ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-900">
                  {t({ en: 'Overall AI Score', ar: 'التقييم الكلي' })}
                </span>
                <div className="text-5xl font-bold text-purple-700">{proposal.ai_score}</div>
              </div>
              <Progress value={proposal.ai_score} className="h-3 mt-3" />
            </div>

            {proposal.ai_scoring_breakdown && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(proposal.ai_scoring_breakdown).map(([key, value]) => (
                  <div key={key} className="p-3 bg-white rounded border">
                    <p className="text-xs text-slate-600 mb-1">{key.replace(/_/g, ' ')}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={value} className="flex-1 h-2" />
                      <span className="font-bold text-purple-600">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {proposal.ai_recommendation && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  {t({ en: 'AI Recommendation:', ar: 'التوصية الذكية:' })}
                </p>
                <p className="text-sm text-slate-700">{proposal.ai_recommendation}</p>
              </div>
            )}

            {proposal.ai_strengths?.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  {t({ en: 'AI-Identified Strengths:', ar: 'نقاط القوة:' })}
                </p>
                <ul className="space-y-1">
                  {proposal.ai_strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {proposal.ai_concerns?.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  {t({ en: 'AI-Identified Concerns:', ar: 'المخاوف:' })}
                </p>
                <ul className="space-y-1">
                  {proposal.ai_concerns.map((concern, i) => (
                    <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">
              {t({ en: 'No AI scoring yet. Click "Run AI Score" to analyze this proposal.', ar: 'لا يوجد تقييم ذكي بعد. انقر "تشغيل التقييم" لتحليل هذا المقترح.' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
