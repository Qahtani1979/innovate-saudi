import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Shield, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIDataQualityChecker({ entityType, data }) {
  const { language, t } = useLanguage();
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);

  const checkQuality = async () => {
    setChecking(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Assess data quality for ${entityType}:

DATA: ${JSON.stringify(data).substring(0, 1000)}

Check:
1. Completeness (% fields filled)
2. Consistency (contradictions, format issues)
3. Accuracy (realistic values, proper ranges)
4. Missing critical fields
5. Data quality score (0-100)
6. Specific issues with recommendations`,
        response_json_schema: {
          type: "object",
          properties: {
            quality_score: { type: "number" },
            completeness: { type: "number" },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  issue: { type: "string" },
                  severity: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            strengths: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResults(response);
      toast.success(t({ en: 'Quality check complete', ar: 'فحص الجودة مكتمل' }));
    } catch (error) {
      toast.error(t({ en: 'Check failed', ar: 'فشل الفحص' }));
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            {t({ en: 'Data Quality Check', ar: 'فحص جودة البيانات' })}
          </CardTitle>
          <Button onClick={checkQuality} disabled={checking} size="sm" className="bg-green-600">
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
        {!results && !checking && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI validates data completeness and accuracy', ar: 'الذكاء يتحقق من اكتمال ودقة البيانات' })}
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <p className="text-5xl font-bold text-green-600 mb-1">{results.quality_score}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Quality Score', ar: 'نقاط الجودة' })}</p>
              <Progress value={results.quality_score} className="mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded border">
                <p className="text-xs text-slate-600">{t({ en: 'Completeness', ar: 'الاكتمال' })}</p>
                <p className="text-2xl font-bold text-blue-600">{results.completeness}%</p>
              </div>
              <div className="p-3 bg-red-50 rounded border">
                <p className="text-xs text-slate-600">{t({ en: 'Issues', ar: 'المشاكل' })}</p>
                <p className="text-2xl font-bold text-red-600">{results.issues?.length || 0}</p>
              </div>
            </div>

            {results.issues?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  {t({ en: 'Issues Found:', ar: 'المشاكل المكتشفة:' })}
                </h4>
                <div className="space-y-2">
                  {results.issues.map((issue, idx) => (
                    <div key={idx} className={`p-3 rounded border ${
                      issue.severity === 'high' ? 'bg-red-50 border-red-300' :
                      issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                      'bg-blue-50 border-blue-300'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{issue.field}</p>
                          <p className="text-xs text-slate-600">{issue.issue}</p>
                          <p className="text-xs text-blue-700 mt-1">💡 {issue.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}