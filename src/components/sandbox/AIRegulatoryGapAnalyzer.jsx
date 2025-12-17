import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, Sparkles, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getRegulatoryGapAnalyzerPrompt, regulatoryGapAnalyzerSchema } from '@/lib/ai/prompts/sandbox';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function AIRegulatoryGapAnalyzer({ application }) {
  const { language, t } = useLanguage();
  const [analysis, setAnalysis] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const analyzeRegulatory = async () => {
    const result = await invokeAI({
      prompt: getRegulatoryGapAnalyzerPrompt({ application }),
      system_prompt: getSystemPrompt('COMPACT', true),
      response_json_schema: regulatoryGapAnalyzerSchema
    });

    if (result.success) {
      setAnalysis(result.data);
      toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
    }
  };

  return (
    <Card className="border-2 border-orange-300">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            {t({ en: 'AI Regulatory Gap Analyzer', ar: 'محلل الفجوات التنظيمية الذكي' })}
          </CardTitle>
          <Button onClick={analyzeRegulatory} disabled={isLoading || !isAvailable} size="sm" className="bg-orange-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!analysis && !isLoading && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-orange-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI detects regulatory conflicts and suggests exemptions', ar: 'الذكاء يكتشف النزاعات التنظيمية ويقترح الإعفاءات' })}
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-4 rounded-lg border-2 text-center ${
                analysis.risk_level === 'high' ? 'bg-red-50 border-red-300' :
                analysis.risk_level === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                'bg-green-50 border-green-300'
              }`}>
                <p className="text-sm text-slate-600 mb-1">{t({ en: 'Risk Level', ar: 'مستوى المخاطر' })}</p>
                <p className="text-2xl font-bold">{analysis.risk_level?.toUpperCase()}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
                <p className="text-sm text-slate-600 mb-1">{t({ en: 'Exemptions Needed', ar: 'الإعفاءات المطلوبة' })}</p>
                <p className="text-2xl font-bold text-blue-600">{analysis.required_exemptions?.length || 0}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300 text-center">
                <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-600">{analysis.estimated_approval_weeks}w</p>
                <p className="text-xs text-slate-600">{t({ en: 'Est. Approval', ar: 'الموافقة المقدرة' })}</p>
              </div>
            </div>

            {analysis.conflicts?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  {t({ en: 'Regulatory Conflicts', ar: 'النزاعات التنظيمية' })}
                </h4>
                <div className="space-y-2">
                  {analysis.conflicts.map((conflict, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${
                      conflict.severity === 'high' ? 'bg-red-50 border-red-300' :
                      conflict.severity === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                      'bg-blue-50 border-blue-300'
                    }`}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm text-slate-900">{conflict.regulation}</p>
                        <Badge className="text-xs">{conflict.severity}</Badge>
                      </div>
                      <p className="text-xs text-slate-700">{conflict.conflict_description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.required_exemptions?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <p className="font-semibold text-blue-900 mb-2">
                  {t({ en: 'Required Exemptions:', ar: 'الإعفاءات المطلوبة:' })}
                </p>
                <ul className="space-y-1">
                  {analysis.required_exemptions.map((exemption, idx) => (
                    <li key={idx} className="text-sm text-slate-700">📋 {exemption}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.precedents?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-300">
                <p className="font-semibold text-green-900 mb-2">
                  {t({ en: 'Precedent Cases:', ar: 'الحالات السابقة:' })}
                </p>
                <ul className="space-y-1">
                  {analysis.precedents.map((precedent, idx) => (
                    <li key={idx} className="text-sm text-slate-700">✓ {precedent}</li>
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
