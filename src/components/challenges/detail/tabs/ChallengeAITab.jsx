import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Sparkles, Zap, AlertTriangle, Loader2 } from 'lucide-react';

export default function ChallengeAITab({ 
  challenge, 
  freshAiInsights, 
  generatingInsights, 
  onGenerateInsights 
}) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button
          onClick={onGenerateInsights}
          disabled={generatingInsights}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {generatingInsights ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Generate Fresh AI Insights', ar: 'إنشاء رؤى ذكية جديدة' })}
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI-Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 leading-relaxed">
            {challenge.ai_summary || challenge.description_en?.substring(0, 200) + '...'}
          </p>
        </CardContent>
      </Card>

      {freshAiInsights && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t({ en: 'Fresh Strategic Analysis', ar: 'التحليل الاستراتيجي الجديد' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2">
                {t({ en: 'Strategic Importance', ar: 'الأهمية الاستراتيجية' })}
              </p>
              <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' && freshAiInsights.strategic_importance_ar 
                  ? freshAiInsights.strategic_importance_ar 
                  : freshAiInsights.strategic_importance_en || freshAiInsights.strategic_importance}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-500 mb-1">
                  {t({ en: 'Recommended Approach', ar: 'النهج الموصى به' })}
                </p>
                <Badge className="bg-blue-100 text-blue-700">
                  {freshAiInsights.recommended_approach}
                </Badge>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-500 mb-1">
                  {t({ en: 'Complexity', ar: 'التعقيد' })}
                </p>
                <Badge className={
                  freshAiInsights.complexity === 'high' ? 'bg-red-100 text-red-700' :
                  freshAiInsights.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }>
                  {freshAiInsights.complexity}
                </Badge>
              </div>
            </div>

            {freshAiInsights.next_steps?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-2">
                  {t({ en: 'Next Steps', ar: 'الخطوات التالية' })}
                </p>
                <div className="space-y-2">
                  {freshAiInsights.next_steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {typeof step === 'object' ? step.priority || i + 1 : i + 1}
                      </div>
                      <span className="text-slate-700 pt-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {typeof step === 'string' ? step : (language === 'ar' && step.ar ? step.ar : step.en)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {freshAiInsights.potential_partners?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-2">
                  {t({ en: 'Potential Partners', ar: 'الشركاء المحتملون' })}
                </p>
                <div className="space-y-2">
                  {freshAiInsights.potential_partners.map((p, i) => (
                    <div key={i} className="p-2 bg-white rounded border">
                      <p className="text-sm font-medium">{typeof p === 'string' ? p : p.type}</p>
                      {typeof p === 'object' && p.reason && (
                        <p className="text-xs text-slate-600 mt-1">{p.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {freshAiInsights.risk_factors?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-2">
                  {t({ en: 'Risk Factors', ar: 'عوامل المخاطر' })}
                </p>
                <div className="space-y-1">
                  {freshAiInsights.risk_factors.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {typeof risk === 'string' ? risk : (language === 'ar' && risk.ar ? risk.ar : risk.en)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {challenge.ai_suggestions && (
        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions (Original)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">Recommended Track</p>
                <p className="text-sm text-slate-700 mt-1">
                  Based on complexity and maturity, this challenge is best suited for{' '}
                  <span className="font-semibold">{challenge.track || 'pilot testing'}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
