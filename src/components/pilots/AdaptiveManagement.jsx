import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { RefreshCw, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AdaptiveManagement({ pilot }) {
  const { language, t } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);

  const completedMilestones = pilot.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = pilot.milestones?.length || 1;
  const velocity = Math.round((completedMilestones / totalMilestones) * 100);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const getAdjustments = async () => {
    const response = await invokeAI({
      prompt: `Pilot adaptive management analysis:

PILOT: ${pilot.title_en}
PROGRESS: ${completedMilestones}/${totalMilestones} milestones (${velocity}%)
TIMELINE: ${pilot.duration_weeks} weeks planned
BUDGET: ${pilot.budget} SAR

MILESTONES STATUS:
${pilot.milestones?.slice(0, 5).map(m => `${m.name}: ${m.status}`).join('\n')}

Velocity is ${velocity < 80 ? 'BELOW' : 'ON'} target.

Recommend:
1. Should we adjust scope, timeline, or resources?
2. Specific changes to milestones
3. Resource reallocation suggestions
4. Impact assessment of changes
5. Risk mitigation`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendation_type: { 
            type: "string",
            enum: ["continue_as_planned", "reduce_scope", "extend_timeline", "add_resources", "pivot_approach"]
          },
          rationale: { type: "string" },
          proposed_changes: { type: "array", items: { type: "string" } },
          impact_assessment: { type: "string" },
          new_velocity_estimate: { type: "number" },
          risks: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (response.success) {
      setRecommendations(response.data);
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            {t({ en: 'Adaptive Management', ar: 'الإدارة التكيفية' })}
          </CardTitle>
          <Button onClick={getAdjustments} disabled={isLoading || !isAvailable} size="sm" className="bg-blue-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-700">{t({ en: 'Velocity', ar: 'السرعة' })}</span>
            <span className={`font-bold ${velocity >= 80 ? 'text-green-600' : velocity >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {velocity}%
            </span>
          </div>
          <Progress value={velocity} className="h-2" />
          <p className="text-xs text-slate-500 mt-1">
            {completedMilestones}/{totalMilestones} {t({ en: 'milestones completed', ar: 'معالم مكتملة' })}
          </p>
        </div>

        {velocity < 80 && (
          <div className="p-3 bg-amber-50 rounded border border-amber-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-slate-700">
              {t({ 
                en: 'Pilot is behind schedule. AI can suggest adjustments to improve success probability.', 
                ar: 'التجربة متأخرة عن الجدول. الذكاء يمكنه اقتراح تعديلات لتحسين احتمالية النجاح.' 
              })}
            </p>
          </div>
        )}

        {!recommendations && !isLoading && (
          <div className="text-center py-6">
            <RefreshCw className="h-10 w-10 text-blue-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI analyzes progress and suggests dynamic adjustments', ar: 'الذكاء يحلل التقدم ويقترح تعديلات ديناميكية' })}
            </p>
          </div>
        )}

        {recommendations && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg border-2 ${
              recommendations.recommendation_type === 'continue_as_planned' ? 'bg-green-50 border-green-300' :
              recommendations.recommendation_type === 'extend_timeline' ? 'bg-yellow-50 border-yellow-300' :
              'bg-amber-50 border-amber-300'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="capitalize">
                  {recommendations.recommendation_type.replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="text-sm text-slate-700 mb-2">{recommendations.rationale}</p>
              {recommendations.new_velocity_estimate && (
                <p className="text-xs text-slate-600">
                  {t({ en: `New velocity estimate: ${recommendations.new_velocity_estimate}%`, ar: `تقدير السرعة الجديد: ${recommendations.new_velocity_estimate}%` })}
                </p>
              )}
            </div>

            {recommendations.proposed_changes?.length > 0 && (
              <div className="p-3 bg-white rounded border">
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  {t({ en: 'Proposed Changes', ar: 'التغييرات المقترحة' })}
                </h4>
                <ul className="space-y-1">
                  {recommendations.proposed_changes.map((change, i) => (
                    <li key={i} className="text-sm text-slate-700">• {change}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.impact_assessment && (
              <div className="p-3 bg-blue-50 rounded border border-blue-300">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  {t({ en: 'Impact Assessment', ar: 'تقييم التأثير' })}
                </h4>
                <p className="text-sm text-slate-700">{recommendations.impact_assessment}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}