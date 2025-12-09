import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Award, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIProposalScorer({ proposal }) {
  const { language, isRTL, t } = useLanguage();
  const [score, setScore] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const scoreProposal = async () => {
    const response = await invokeAI({
      prompt: `Score this R&D proposal:

TITLE: ${proposal.title_en}
ABSTRACT: ${proposal.abstract_en}
METHODOLOGY: ${proposal.methodology_en || 'Not provided'}
TEAM SIZE: ${proposal.team_members?.length || 0}
BUDGET: ${proposal.budget_requested}

Score (0-100) on:
1. Technical Merit: novelty, rigor, feasibility
2. Innovation Level: how groundbreaking
3. Team Capability: experience, track record
4. Feasibility: realistic timeline, resources
5. Budget Justification: appropriate allocation

Identify weak sections and suggest improvements.`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          scores: {
            type: "object",
            properties: {
              technical_merit: { type: "number" },
              innovation: { type: "number" },
              team_capability: { type: "number" },
              feasibility: { type: "number" },
              budget_justification: { type: "number" }
            }
          },
          weak_sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                section: { type: "string" },
                score: { type: "number" },
                issue: { type: "string" },
                suggestion: { type: "string" }
              }
            }
          },
          recommendation: { type: "string" }
        }
      }
    });

    if (response.success) {
      setScore(response.data);
    }
  };

  const radarData = score ? [
    { dimension: 'Technical', score: score.scores.technical_merit },
    { dimension: 'Innovation', score: score.scores.innovation },
    { dimension: 'Team', score: score.scores.team_capability },
    { dimension: 'Feasibility', score: score.scores.feasibility },
    { dimension: 'Budget', score: score.scores.budget_justification }
  ] : [];

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            {t({ en: 'AI Quality Scorer', ar: 'مقيم الجودة الذكي' })}
          </CardTitle>
          <Button onClick={scoreProposal} disabled={isLoading || !isAvailable} size="sm" className="bg-indigo-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Score', ar: 'تسجيل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!score && !isLoading && (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI evaluates proposal quality before human review', ar: 'الذكاء الاصطناعي يقيم جودة المقترح قبل المراجعة البشرية' })}
            </p>
          </div>
        )}

        {score && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>

              <div className="flex flex-col justify-center">
                <div className={`p-6 rounded-lg border-2 text-center ${
                  score.overall_score >= 85 ? 'bg-green-50 border-green-300' :
                  score.overall_score >= 70 ? 'bg-blue-50 border-blue-300' :
                  score.overall_score >= 40 ? 'bg-yellow-50 border-yellow-300' :
                  'bg-red-50 border-red-300'
                }`}>
                  <p className="text-sm text-slate-600 mb-2">{t({ en: 'Overall Score', ar: 'النتيجة الإجمالية' })}</p>
                  <p className="text-5xl font-bold text-slate-900">{score.overall_score}</p>
                  <Badge className="mt-2">
                    {score.overall_score >= 85 ? 'Fast-Track' :
                     score.overall_score >= 70 ? 'Strong' :
                     score.overall_score >= 40 ? 'Needs Improvement' :
                     'Weak'}
                  </Badge>
                </div>
              </div>
            </div>

            {score.weak_sections?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  {t({ en: 'Sections Needing Improvement', ar: 'الأقسام التي تحتاج تحسين' })}
                </h4>
                <div className="space-y-3">
                  {score.weak_sections.map((section, idx) => (
                    <div key={idx} className="p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-slate-900">{section.section}</h5>
                        <Badge className="bg-yellow-100 text-yellow-700">{section.score}/100</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        <strong>{t({ en: 'Issue:', ar: 'المشكلة:' })}</strong> {section.issue}
                      </p>
                      <div className="p-3 bg-white rounded border">
                        <p className="text-sm font-medium text-blue-900">
                          💡 {t({ en: 'Suggestion:', ar: 'الاقتراح:' })}
                        </p>
                        <p className="text-sm text-slate-700">{section.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`p-4 rounded-lg border-2 ${
              score.recommendation.includes('approve') || score.recommendation.includes('fast-track')
                ? 'bg-green-50 border-green-300'
                : score.recommendation.includes('improve')
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <h4 className="font-semibold text-slate-900 mb-2">
                {t({ en: 'AI Recommendation', ar: 'توصية الذكاء الاصطناعي' })}
              </h4>
              <p className="text-sm text-slate-700">{score.recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}