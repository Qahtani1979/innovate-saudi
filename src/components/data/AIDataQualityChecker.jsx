import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Shield, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  buildDataQualityPrompt, 
  DATA_QUALITY_SYSTEM_PROMPT, 
  DATA_QUALITY_SCHEMA 
} from '@/lib/ai/prompts/data/qualityChecker';

export default function AIDataQualityChecker({ entityType, data }) {
  const { language, t } = useLanguage();
  const [results, setResults] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const checkQuality = async () => {
    const response = await invokeAI({
      system_prompt: DATA_QUALITY_SYSTEM_PROMPT,
      prompt: buildDataQualityPrompt({ entityType, data }),
      response_json_schema: DATA_QUALITY_SCHEMA
    });

    if (response.success) {
      setResults(response.data);
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
          <Button onClick={checkQuality} disabled={isLoading || !isAvailable} size="sm" className="bg-green-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Check', ar: 'فحص' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!results && !isLoading && (
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
