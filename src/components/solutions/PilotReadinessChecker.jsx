import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { CheckCircle, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

export default function PilotReadinessChecker({ solution }) {
  const { language, t } = useLanguage();
  const [assessment, setAssessment] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: checking, isAvailable, rateLimitInfo } = useAIWithFallback();

  const checkReadiness = async () => {
    const result = await invokeAI({
      prompt: `Assess pilot readiness for this solution:

SOLUTION: ${solution.name_en}
TRL: ${solution.trl}
MATURITY: ${solution.maturity_level}
DEPLOYMENTS: ${solution.deployments?.length || 0}
CERTIFICATIONS: ${solution.certifications?.length || 0}

Check readiness across:
1. Technical maturity (TRL, testing)
2. Team capacity
3. Documentation completeness
4. Compliance & legal
5. Integration requirements
6. Support infrastructure

Provide score (0-100), gaps, and action items.`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          ready_for_pilot: { type: "boolean" },
          dimension_scores: {
            type: "object",
            properties: {
              technical: { type: "number" },
              team: { type: "number" },
              documentation: { type: "number" },
              compliance: { type: "number" },
              integration: { type: "number" },
              support: { type: "number" }
            }
          },
          gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                area: { type: "string" },
                issue: { type: "string" },
                severity: { type: "string" }
              }
            }
          },
          action_items: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (result.success) {
      setAssessment(result.data);
      toast.success(t({ en: 'Assessment complete', ar: 'اكتمل التقييم' }));
    } else {
      toast.error(t({ en: 'Assessment failed', ar: 'فشل التقييم' }));
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            {t({ en: 'Pilot Readiness Check', ar: 'فحص جاهزية التجربة' })}
          </CardTitle>
          <Button onClick={checkReadiness} disabled={checking} size="sm" className="bg-blue-600">
            {checking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Check', ar: 'فحص' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!assessment && !checking && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI validates if solution is ready for municipal piloting', ar: 'الذكاء الاصطناعي يتحقق إذا كان الحل جاهزًا للتجريب البلدي' })}
            </p>
          </div>
        )}

        {assessment && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg border-2 text-center ${
              assessment.ready_for_pilot
                ? 'bg-green-50 border-green-300'
                : 'bg-yellow-50 border-yellow-300'
            }`}>
              <p className="text-sm text-slate-600 mb-2">
                {t({ en: 'Overall Readiness', ar: 'الجاهزية الإجمالية' })}
              </p>
              <p className="text-5xl font-bold text-slate-900 mb-2">{assessment.overall_score}</p>
              <Badge className={assessment.ready_for_pilot ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                {assessment.ready_for_pilot 
                  ? t({ en: 'Ready for Pilot', ar: 'جاهز للتجربة' })
                  : t({ en: 'Needs Improvement', ar: 'يحتاج تحسين' })}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(assessment.dimension_scores || {}).map(([key, score]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-600 mb-1 capitalize">{key}</p>
                  <p className={`text-2xl font-bold ${
                    score >= 80 ? 'text-green-600' :
                    score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{score}</p>
                </div>
              ))}
            </div>

            {assessment.gaps?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  {t({ en: 'Gaps to Address', ar: 'الفجوات التي يجب معالجتها' })}
                </h4>
                <div className="space-y-2">
                  {assessment.gaps.map((gap, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${
                      gap.severity === 'high' ? 'bg-red-50 border-red-300' :
                      gap.severity === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                      'bg-blue-50 border-blue-300'
                    }`}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm text-slate-900">{gap.area}</p>
                        <Badge className="text-xs">{gap.severity}</Badge>
                      </div>
                      <p className="text-xs text-slate-700">{gap.issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assessment.action_items?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <p className="font-semibold text-blue-900 mb-2">
                  {t({ en: 'Action Items:', ar: 'بنود العمل:' })}
                </p>
                <ul className="space-y-1">
                  {assessment.action_items.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
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