import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function ScalingReadiness({ pilot }) {
  const { language, isRTL, t } = useLanguage();
  const [assessment, setAssessment] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const assessReadiness = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Assess scaling readiness for this pilot:

PILOT: ${pilot.title_en}
SUCCESS CRITERIA MET: ${pilot.success_criteria?.filter(c => c.met).length || 0}/${pilot.success_criteria?.length || 0}
BUDGET: ${pilot.budget} SAR
TEAM SIZE: ${pilot.team?.length || 0}
KPI ACHIEVEMENT: ${pilot.kpis?.filter(k => k.status === 'achieved').length || 0}/${pilot.kpis?.length || 0}

Assess readiness across 5 dimensions (score 0-100 each):
1. Operational: processes documented, team trained, systems ready
2. Financial: cost model validated, funding secured, ROI proven
3. Stakeholder: buy-in from leadership, user acceptance, partner commitment
4. Regulatory: approvals obtained, compliance verified, exemptions secured
5. Technical: solution stable, scalable architecture, integration ready

Identify gaps and generate action plan to close them.`,
        response_json_schema: {
          type: "object",
          properties: {
            dimension_scores: {
              type: "object",
              properties: {
                operational: { type: "number" },
                financial: { type: "number" },
                stakeholder: { type: "number" },
                regulatory: { type: "number" },
                technical: { type: "number" }
              }
            },
            overall_score: { type: "number" },
            readiness_level: { type: "string" },
            gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dimension: { type: "string" },
                  gap: { type: "string" },
                  severity: { type: "string" }
                }
              }
            },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" },
                  estimated_impact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAssessment(response);
      
      await base44.entities.ScalingReadiness.create({
        pilot_id: pilot.id,
        assessment_date: new Date().toISOString().split('T')[0],
        overall_score: response.overall_score,
        dimension_scores: response.dimension_scores,
        gaps: response.gaps,
        action_plan: response.action_plan,
        ready_to_scale: response.overall_score >= 75,
        readiness_level: response.readiness_level
      });

      toast.success(t({ en: 'Readiness assessment complete', ar: 'اكتمل تقييم الجاهزية' }));
    } catch (error) {
      toast.error(t({ en: 'Assessment failed', ar: 'فشل التقييم' }));
    } finally {
      setAnalyzing(false);
    }
  };

  const radarData = assessment ? [
    { dimension: 'Operational', score: assessment.dimension_scores.operational },
    { dimension: 'Financial', score: assessment.dimension_scores.financial },
    { dimension: 'Stakeholder', score: assessment.dimension_scores.stakeholder },
    { dimension: 'Regulatory', score: assessment.dimension_scores.regulatory },
    { dimension: 'Technical', score: assessment.dimension_scores.technical }
  ] : [];

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t({ en: 'Scaling Readiness Assessment', ar: 'تقييم الجاهزية للتوسع' })}
          </CardTitle>
          <Button onClick={assessReadiness} disabled={analyzing} size="sm" className="bg-gradient-to-r from-green-600 to-teal-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Assess', ar: 'تقييم' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!assessment && !analyzing && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'Click "Assess" to evaluate scaling readiness with AI', ar: 'انقر "تقييم" لتقييم جاهزية التوسع بالذكاء الاصطناعي' })}
            </p>
          </div>
        )}

        {assessment && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Readiness" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center">
                <div className={`p-6 rounded-lg border-2 text-center ${
                  assessment.overall_score >= 80 ? 'bg-green-50 border-green-300' :
                  assessment.overall_score >= 60 ? 'bg-yellow-50 border-yellow-300' :
                  'bg-red-50 border-red-300'
                }`}>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    {t({ en: 'Overall Readiness', ar: 'الجاهزية الإجمالية' })}
                  </p>
                  <p className="text-5xl font-bold text-slate-900 mb-2">
                    {assessment.overall_score}
                  </p>
                  <Badge className={
                    assessment.readiness_level === 'optimal' ? 'bg-green-600 text-white' :
                    assessment.readiness_level === 'ready' ? 'bg-green-500 text-white' :
                    assessment.readiness_level === 'partially_ready' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }>
                    {assessment.readiness_level}
                  </Badge>
                </div>
              </div>
            </div>

            {assessment.gaps?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">
                  {t({ en: 'Identified Gaps', ar: 'الفجوات المحددة' })}
                </h4>
                <div className="space-y-2">
                  {assessment.gaps.map((gap, idx) => {
                    const severityColors = {
                      critical: 'border-red-300 bg-red-50',
                      high: 'border-orange-300 bg-orange-50',
                      medium: 'border-yellow-300 bg-yellow-50',
                      low: 'border-blue-300 bg-blue-50'
                    };
                    return (
                      <div key={idx} className={`p-3 rounded-lg border-2 ${severityColors[gap.severity.toLowerCase()] || severityColors.medium}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-1">{gap.dimension}</Badge>
                            <p className="text-sm text-slate-900">{gap.gap}</p>
                          </div>
                          <Badge className={
                            gap.severity === 'critical' ? 'bg-red-600 text-white' :
                            gap.severity === 'high' ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }>
                            {gap.severity}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
              <h4 className="font-semibold text-blue-900 mb-3">
                {t({ en: 'Gap-Closing Action Plan', ar: 'خطة عمل سد الفجوات' })}
              </h4>
              <div className="space-y-3">
                {assessment.action_plan?.map((action, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900 mb-1">{action.action}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge className={
                          action.priority === 'high' ? 'bg-red-100 text-red-700' :
                          action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {action.priority}
                        </Badge>
                        <span className="text-slate-600">Timeline: {action.timeline}</span>
                        <span className="text-green-600">Impact: {action.estimated_impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {assessment.overall_score >= 75 ? (
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="font-bold text-green-900">
                  {t({ en: '✅ Ready to Scale', ar: '✅ جاهز للتوسع' })}
                </p>
                <p className="text-sm text-slate-700">
                  {t({ en: 'Pilot meets scaling criteria. Proceed with scaling plan.', ar: 'التجربة تستوفي معايير التوسع. تابع بخطة التوسع.' })}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
                <p className="font-bold text-yellow-900">
                  {t({ en: 'Action Required Before Scaling', ar: 'إجراءات مطلوبة قبل التوسع' })}
                </p>
                <p className="text-sm text-slate-700">
                  {t({ en: 'Complete action plan to improve readiness score.', ar: 'أكمل خطة العمل لتحسين درجة الجاهزية.' })}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}