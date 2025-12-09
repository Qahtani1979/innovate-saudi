import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function SolutionReadinessGate({ solution, onProceed }) {
  const { language, t } = useLanguage();
  const [assessment, setAssessment] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const checkReadiness = async () => {
    const result = await invokeAI({
      prompt: `Assess if this solution is ready for municipal piloting:

SOLUTION: ${solution.name_en}
PROVIDER: ${solution.provider_name}
MATURITY: ${solution.maturity_level}
TRL: ${solution.trl || 'N/A'}
VERIFIED: ${solution.is_verified}
DEPLOYMENTS: ${solution.deployment_count || 0}
CERTIFICATIONS: ${solution.certifications?.length || 0}
DOCUMENTATION: ${solution.documentation_url ? 'Yes' : 'No'}
PRICING: ${solution.pricing_model || 'N/A'}

Check against pilot readiness criteria:
1. Technical maturity (TRL ≥ 6 for pilots)
2. Provider verification status
3. Documentation completeness
4. Pricing clarity
5. Support infrastructure
6. Compliance certifications

Return: ready (boolean), score (0-100), blockers (critical issues), warnings (minor issues)`,
      response_json_schema: {
        type: "object",
        properties: {
          ready: { type: "boolean" },
          score: { type: "number" },
          blockers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                severity: { type: "string" },
                resolution: { type: "string" }
              }
            }
          },
          warnings: { type: "array", items: { type: "string" } },
          passed_checks: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (result.success) {
      setAssessment(result.data);
    }
  };

  return (
    <Card className="border-4 border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Shield className="h-6 w-6" />
          {t({ en: 'Solution Readiness Gate', ar: 'بوابة جاهزية الحل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
          <p className="text-sm text-blue-900 font-medium mb-2">
            {t({ en: '🛡️ Quality Gate: Verify solution readiness before pilot', ar: '🛡️ بوابة الجودة: التحقق من جاهزية الحل قبل التجربة' })}
          </p>
          <p className="text-xs text-slate-600">
            {t({ 
              en: 'This mandatory check ensures solution meets minimum criteria for municipal piloting',
              ar: 'هذا الفحص الإلزامي يضمن أن الحل يلبي الحد الأدنى من المعايير للتجريب البلدي'
            })}
          </p>
        </div>

        {!assessment && (
          <Button onClick={checkReadiness} disabled={isLoading || !isAvailable} className="w-full bg-blue-600 hover:bg-blue-700">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Checking...', ar: 'جاري الفحص...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Run Readiness Check', ar: 'تشغيل فحص الجاهزية' })}
              </>
            )}
          </Button>
        )}

        {assessment && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg border-4 text-center ${
              assessment.ready
                ? 'bg-green-50 border-green-400'
                : 'bg-red-50 border-red-400'
            }`}>
              {assessment.ready ? (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-green-900 mb-1">
                    {t({ en: 'READY FOR PILOT', ar: 'جاهز للتجربة' })}
                  </p>
                  <p className="text-sm text-green-700">
                    Score: {assessment.score}/100
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-red-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-red-900 mb-1">
                    {t({ en: 'NOT READY', ar: 'غير جاهز' })}
                  </p>
                  <p className="text-sm text-red-700">
                    {t({ en: 'Critical blockers must be resolved', ar: 'يجب حل العوائق الحرجة' })}
                  </p>
                </>
              )}
            </div>

            {assessment.passed_checks?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-300">
                <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {t({ en: 'Passed Checks', ar: 'الفحوصات المجتازة' })}
                </p>
                <div className="space-y-1">
                  {assessment.passed_checks.map((check, i) => (
                    <div key={i} className="text-sm text-green-800">✓ {check}</div>
                  ))}
                </div>
              </div>
            )}

            {assessment.blockers?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-400">
                <p className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {t({ en: 'Critical Blockers', ar: 'العوائق الحرجة' })}
                </p>
                <div className="space-y-3">
                  {assessment.blockers.map((blocker, i) => (
                    <div key={i} className="p-3 bg-white rounded border border-red-300">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-red-900">{blocker.issue}</p>
                        <Badge className="bg-red-600">{blocker.severity}</Badge>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">
                        {t({ en: 'Resolution:', ar: 'الحل:' })} {blocker.resolution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assessment.warnings?.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300">
                <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t({ en: 'Warnings', ar: 'تحذيرات' })}
                </p>
                <div className="space-y-1">
                  {assessment.warnings.map((warning, i) => (
                    <div key={i} className="text-sm text-yellow-800">⚠️ {warning}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={checkReadiness} disabled={isLoading || !isAvailable} variant="outline" className="flex-1">
                {t({ en: 'Re-check', ar: 'إعادة الفحص' })}
              </Button>
              {assessment.ready && onProceed && (
                <Button onClick={onProceed} className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t({ en: 'Proceed to Pilot', ar: 'المتابعة للتجربة' })}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
