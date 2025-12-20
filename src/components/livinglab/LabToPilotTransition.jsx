import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildPilotTransitionPrompt, 
  getPilotTransitionSchema,
  PILOT_TRANSITION_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/livinglab';

export default function LabToPilotTransition({ labProject }) {
  const { language, t } = useLanguage();
  const [readiness, setReadiness] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const assessReadiness = async () => {
    const result = await invokeAI({
      prompt: buildPilotTransitionPrompt(labProject),
      response_json_schema: getPilotTransitionSchema(),
      system_prompt: getSystemPrompt(PILOT_TRANSITION_SYSTEM_PROMPT)
    });

    if (result.success && result.data) {
      setReadiness(result.data);
      toast.success(t({ en: 'Assessment complete', ar: 'التقييم مكتمل' }));
    }
  };

  const getLocalizedArray = (data, field) => {
    if (language === 'ar' && data[`${field}_ar`]) {
      return data[`${field}_ar`];
    }
    return data[field] || [];
  };

  const getLocalizedField = (data, field) => {
    if (language === 'ar' && data[`${field}_ar`]) {
      return data[`${field}_ar`];
    }
    return data[field];
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-teal-600" />
            {t({ en: 'Lab → Pilot Transition', ar: 'الانتقال من المختبر للتجربة' })}
          </CardTitle>
          <Button onClick={assessReadiness} disabled={isLoading || !isAvailable} size="sm" className="bg-teal-600">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t({ en: 'Assess', ar: 'تقييم' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        {readiness && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-lg border-2 border-teal-300 text-center">
              <p className="text-4xl font-bold text-teal-900">{readiness.readiness_score}%</p>
              <p className="text-sm text-teal-700">{t({ en: 'Pilot Readiness', ar: 'جاهزية التجربة' })}</p>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <p className="text-xs text-slate-500 font-semibold">{t({ en: 'Regulatory Status:', ar: 'الحالة التنظيمية:' })}</p>
              <p className="text-sm font-bold text-slate-900">{getLocalizedField(readiness, 'regulatory_status')}</p>
            </div>
            
            <div className="p-3 bg-white rounded border">
              <p className="text-xs text-slate-500 font-semibold">{t({ en: 'Budget Estimate:', ar: 'تقدير الميزانية:' })}</p>
              <p className="text-sm font-bold text-slate-900">{getLocalizedField(readiness, 'budget_estimate')}</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded border">
              <p className="text-xs text-blue-700 font-semibold mb-2">{t({ en: 'Recommended Municipalities:', ar: 'البلديات الموصى بها:' })}</p>
              <div className="flex flex-wrap gap-1">
                {getLocalizedArray(readiness, 'municipalities').map((m, i) => (
                  <Badge key={i} className="bg-blue-600">{m}</Badge>
                ))}
              </div>
            </div>
            
            {readiness.risks?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs text-amber-700 font-semibold mb-2">{t({ en: 'Risk Factors:', ar: 'عوامل الخطر:' })}</p>
                <ul className="space-y-1">
                  {getLocalizedArray(readiness, 'risks').map((risk, i) => (
                    <li key={i} className="text-xs text-slate-700">• {risk}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {readiness.next_steps?.length > 0 && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-xs text-green-700 font-semibold mb-2">{t({ en: 'Next Steps:', ar: 'الخطوات التالية:' })}</p>
                <ul className="space-y-1">
                  {getLocalizedArray(readiness, 'next_steps').map((step, i) => (
                    <li key={i} className="text-xs text-slate-700">• {step}</li>
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
