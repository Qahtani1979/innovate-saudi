import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Sparkles, Loader2, Shield } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { ROLLOUT_RISK_PROMPTS } from '@/lib/ai/prompts/scaling';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function RolloutRiskPredictor({ pilot, targetMunicipalities }) {
  const { language, t } = useLanguage();
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const analyzeRolloutRisks = async () => {
    const result = await invokeAI({
      systemPrompt: getSystemPrompt('scaling_rollout_risk'),
      prompt: ROLLOUT_RISK_PROMPTS.buildPrompt(pilot, targetMunicipalities),
      response_json_schema: ROLLOUT_RISK_PROMPTS.schema
    });

    if (result.success) {
      setRiskAnalysis(result.data);
      toast.success(t({ en: 'Risk analysis complete', ar: 'اكتمل تحليل المخاطر' }));
    } else {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    }
  };

  const radarData = riskAnalysis ? [
    { dimension: t({ en: 'Technical', ar: 'التقني' }), score: 100 - riskAnalysis.dimension_scores.technical },
    { dimension: t({ en: 'Change Mgmt', ar: 'إدارة التغيير' }), score: 100 - riskAnalysis.dimension_scores.change_management },
    { dimension: t({ en: 'Resources', ar: 'الموارد' }), score: 100 - riskAnalysis.dimension_scores.resources },
    { dimension: t({ en: 'Political', ar: 'السياسي' }), score: 100 - riskAnalysis.dimension_scores.political },
    { dimension: t({ en: 'Budget', ar: 'الميزانية' }), score: 100 - riskAnalysis.dimension_scores.budget }
  ] : [];

  return (
    <Card className="border-2 border-red-300">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {t({ en: 'AI Rollout Risk Predictor', ar: 'متنبئ مخاطر النشر الذكي' })}
          </CardTitle>
          <Button onClick={analyzeRolloutRisks} disabled={analyzing || !isAvailable} size="sm" className="bg-red-600">
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
        <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} className="mb-4" />

        {!riskAnalysis && !analyzing && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: `AI predicts rollout risks for ${targetMunicipalities.length} target cities`, ar: `الذكاء يتنبأ بمخاطر النشر لـ ${targetMunicipalities.length} مدينة مستهدفة` })}
            </p>
          </div>
        )}

        {riskAnalysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-6 rounded-lg border-2 text-center ${
                riskAnalysis.overall_risk_score <= 30 ? 'bg-green-50 border-green-300' :
                riskAnalysis.overall_risk_score <= 60 ? 'bg-yellow-50 border-yellow-300' :
                'bg-red-50 border-red-300'
              }`}>
                <p className="text-sm text-slate-600 mb-2">{t({ en: 'Overall Risk Score', ar: 'درجة المخاطر الإجمالية' })}</p>
                <p className="text-5xl font-bold text-slate-900">{riskAnalysis.overall_risk_score}</p>
                <Badge className="mt-2">
                  {riskAnalysis.risk_level?.toUpperCase() || 
                    (riskAnalysis.overall_risk_score <= 30 ? 'LOW' : 
                     riskAnalysis.overall_risk_score <= 60 ? 'MEDIUM' : 'HIGH')}
                </Badge>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {riskAnalysis.top_risks?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  {t({ en: 'Top Risks', ar: 'أعلى المخاطر' })}
                </h4>
                <div className="space-y-2">
                  {riskAnalysis.top_risks.map((risk, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${
                      risk.impact === 'high' ? 'bg-red-50 border-red-300' :
                      risk.impact === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                      'bg-blue-50 border-blue-300'
                    }`}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm text-slate-900">{risk.risk}</p>
                        <div className="flex gap-1">
                          <Badge className="text-xs">{risk.probability}</Badge>
                          <Badge className="text-xs">{risk.impact}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {riskAnalysis.mitigation_strategies?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t({ en: 'Mitigation Strategies:', ar: 'استراتيجيات التخفيف:' })}
                </h4>
                <ul className="space-y-1">
                  {riskAnalysis.mitigation_strategies.map((strategy, idx) => (
                    <li key={idx} className="text-sm text-slate-700">✓ {strategy}</li>
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
