import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SandboxAIRiskAssessment({ application, sandbox }) {
  const { language, isRTL, t } = useLanguage();
  const [assessment, setAssessment] = useState(null);

  const assessMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Perform comprehensive risk assessment for this sandbox application:

Sandbox: ${sandbox.name_en} (${sandbox.domain})
Project: ${application.project_title}
Organization: ${application.applicant_organization}
Duration: ${application.duration_months} months
Requested Exemptions: ${JSON.stringify(application.requested_exemptions)}
Risk Assessment: ${application.risk_assessment}
Safety Plan: ${application.public_safety_plan}

Analyze:
1. Safety risks (public, operational, environmental)
2. Regulatory compliance risks
3. Technical failure risks
4. Reputational risks
5. Financial risks

Provide JSON with risk scores, mitigation strategies, and approval recommendation.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_risk_score: { type: "number", description: "0-100" },
            risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
            confidence: { type: "string", enum: ["low", "medium", "high"] },
            risk_breakdown: {
              type: "object",
              properties: {
                safety_risk: { type: "number" },
                compliance_risk: { type: "number" },
                technical_risk: { type: "number" },
                reputational_risk: { type: "number" },
                financial_risk: { type: "number" }
              }
            },
            key_risks: {
              type: "array",
              items: { type: "string" }
            },
            mitigation_strategies: {
              type: "array",
              items: { type: "string" }
            },
            recommendation: {
              type: "string",
              enum: ["approve", "conditional_approve", "reject", "request_more_info"]
            },
            recommendation_rationale: { type: "string" },
            required_conditions: {
              type: "array",
              items: { type: "string" }
            },
            monitoring_requirements: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setAssessment(data);
      toast.success(t({ en: 'Risk assessment completed', ar: 'اكتمل تقييم المخاطر' }));
    }
  });

  const riskLevelColors = {
    low: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    critical: 'bg-red-100 text-red-700 border-red-300'
  };

  const recommendationColors = {
    approve: 'bg-green-100 text-green-700',
    conditional_approve: 'bg-yellow-100 text-yellow-700',
    reject: 'bg-red-100 text-red-700',
    request_more_info: 'bg-blue-100 text-blue-700'
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Risk Assessment', ar: 'تقييم المخاطر الذكي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!assessment ? (
          <div className="text-center py-6">
            <Button
              onClick={() => assessMutation.mutate()}
              disabled={assessMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {assessMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Run AI Risk Assessment', ar: 'تشغيل تقييم المخاطر الذكي' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Risk Score */}
            <div className={`text-center p-6 bg-white rounded-lg border-2 ${riskLevelColors[assessment.risk_level]}`}>
              <p className="text-sm text-slate-600 mb-2">
                {t({ en: 'Overall Risk Score', ar: 'درجة المخاطر الإجمالية' })}
              </p>
              <p className="text-5xl font-bold">{assessment.overall_risk_score}</p>
              <Badge className={`mt-3 ${riskLevelColors[assessment.risk_level]}`}>
                {assessment.risk_level.toUpperCase()}
              </Badge>
            </div>

            {/* Risk Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {t({ en: 'Risk Breakdown', ar: 'تفصيل المخاطر' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(assessment.risk_breakdown).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            value >= 70 ? 'bg-red-600' :
                            value >= 40 ? 'bg-yellow-600' : 'bg-green-600'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8">{value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Risks */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <p className="font-semibold text-amber-900">
                  {t({ en: 'Key Risks Identified', ar: 'المخاطر الرئيسية المحددة' })}
                </p>
              </div>
              <ul className="space-y-2">
                {assessment.key_risks.map((risk, idx) => (
                  <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-600">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mitigation Strategies */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <p className="font-semibold text-blue-900">
                  {t({ en: 'Mitigation Strategies', ar: 'استراتيجيات التخفيف' })}
                </p>
              </div>
              <ul className="space-y-2">
                {assessment.mitigation_strategies.map((strategy, idx) => (
                  <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-600">→</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendation */}
            <div className={`p-4 rounded-lg border-2 ${recommendationColors[assessment.recommendation]}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-lg">
                  {t({ en: 'AI Recommendation', ar: 'التوصية الذكية' })}
                </p>
                <Badge className={recommendationColors[assessment.recommendation]}>
                  {assessment.recommendation.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm mb-3">{assessment.recommendation_rationale}</p>

              {assessment.required_conditions?.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium mb-2">
                    {t({ en: 'Required Conditions:', ar: 'الشروط المطلوبة:' })}
                  </p>
                  <ul className="text-xs space-y-1">
                    {assessment.required_conditions.map((cond, idx) => (
                      <li key={idx}>• {cond}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Monitoring Requirements */}
            {assessment.monitoring_requirements?.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="font-semibold text-slate-900 mb-2">
                  {t({ en: 'Monitoring Requirements', ar: 'متطلبات المراقبة' })}
                </p>
                <ul className="text-sm text-slate-700 space-y-1">
                  {assessment.monitoring_requirements.map((req, idx) => (
                    <li key={idx}>• {req}</li>
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