import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function KnowledgeQualityAuditor({ documentId }) {
  const { language, t } = useLanguage();
  const [audit, setAudit] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const runAudit = async () => {
    const response = await invokeAI({
      prompt: `Audit knowledge document quality:

Checklist:
1. Accuracy (factual correctness)
2. Completeness (covers all aspects)
3. Clarity (easy to understand)
4. Relevance (applies to Saudi context)
5. Actionability (provides clear steps)

Score each 0-100 and suggest improvements.`,
      response_json_schema: {
        type: "object",
        properties: {
          scores: {
            type: "object",
            properties: {
              accuracy: { type: "number" },
              completeness: { type: "number" },
              clarity: { type: "number" },
              relevance: { type: "number" },
              actionability: { type: "number" }
            }
          },
          overall: { type: "number" },
          improvements: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (response.success && response.data) {
      setAudit(response.data);
      toast.success(t({ en: 'Audit complete', ar: 'التدقيق مكتمل' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            {t({ en: 'Quality Auditor', ar: 'مدقق الجودة' })}
          </CardTitle>
          <Button onClick={runAudit} disabled={isLoading || !isAvailable} size="sm" className="bg-green-600">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Run Audit', ar: 'تشغيل التدقيق' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
        {audit && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg border-2 border-green-300 text-center">
              <p className="text-4xl font-bold text-green-900">{audit.overall}%</p>
              <p className="text-sm text-green-700">{t({ en: 'Overall Quality', ar: 'الجودة الإجمالية' })}</p>
            </div>

            {Object.entries(audit.scores).map(([key, score]) => (
              <div key={key} className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold capitalize">{key}</p>
                  <Badge className={score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-amber-600' : 'bg-red-600'}>
                    {score}%
                  </Badge>
                </div>
              </div>
            ))}

            {audit.improvements?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded border-2 border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2">{t({ en: '💡 Improvements:', ar: '💡 تحسينات:' })}</p>
                <ul className="space-y-1">
                  {audit.improvements.map((imp, i) => (
                    <li key={i} className="text-xs text-blue-700">• {imp}</li>
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
