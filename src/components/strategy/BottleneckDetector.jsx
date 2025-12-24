import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Sparkles, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import {
  buildBottleneckDetectorPrompt,
  bottleneckDetectorSchema,
  BOTTLENECK_DETECTOR_SYSTEM_PROMPT
} from '@/lib/ai/prompts/strategy';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsList } from '@/hooks/usePilots';

export default function BottleneckDetector() {
  const { language, isRTL, t } = useLanguage();
  const [bottlenecks, setBottlenecks] = useState(null);
  const { invokeAI, status, isLoading: loading, rateLimitInfo, isAvailable } = useAIWithFallback();

  // Fetch 'under_review' challenges directly using the hook
  const { data: challenges = [] } = useChallengesWithVisibility({
    status: 'under_review'
  });

  // Fetch 'approval_pending' pilots directly using the new hook
  const { data: pilots = [] } = usePilotsList({
    stage: 'approval_pending'
  });

  const detectBottlenecks = async () => {
    const now = new Date();

    // Process challenges (already filtered by hook, but matching data shape expectations)
    const challengesInReview = challenges.map(c => {
      const reviewDate = new Date(c.submission_date || c.created_at); // Note: created_date vs created_at standardization
      const days = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
      return { ...c, days_in_review: days };
    });

    // Process pilots (already filtered by hook)
    const pilotsInApproval = pilots.map(p => {
      const submissionDate = new Date(p.timeline?.submission_date || p.created_at);
      const days = Math.floor((now - submissionDate) / (1000 * 60 * 60 * 24));
      return { ...p, days_pending: days };
    });

    const result = await invokeAI({
      system_prompt: getSystemPrompt(BOTTLENECK_DETECTOR_SYSTEM_PROMPT),
      prompt: buildBottleneckDetectorPrompt(challengesInReview, pilotsInApproval),
      response_json_schema: bottleneckDetectorSchema
    });

    if (result.success) {
      setBottlenecks(result.data.bottlenecks);
      toast.success(t({ en: 'Bottlenecks identified', ar: 'تم تحديد الاختناقات' }));
    }
  };

  const severityColors = {
    critical: 'border-red-300 bg-red-50',
    high: 'border-orange-300 bg-orange-50',
    medium: 'border-yellow-300 bg-yellow-50'
  };

  return (
    <Card className="border-2 border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="h-5 w-5" />
            {t({ en: 'Bottleneck Detector', ar: 'كاشف الاختناقات' })}
          </CardTitle>
          <Button onClick={detectBottlenecks} disabled={loading || !isAvailable} size="sm" variant="outline">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Detect', ar: 'كشف' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

        {bottlenecks ? (
          <div className="space-y-3">
            {bottlenecks.map((bottleneck, idx) => (
              <div key={idx} className={`p-4 border-2 rounded-lg ${severityColors[bottleneck.severity]}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <p className="font-semibold text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' ? bottleneck.stage_ar : bottleneck.stage_en}
                    </p>
                  </div>
                  <Badge className={bottleneck.severity === 'critical' ? 'bg-red-600' : bottleneck.severity === 'high' ? 'bg-orange-600' : 'bg-yellow-600'}>
                    {bottleneck.severity}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-white rounded text-center">
                    <p className="text-xs text-slate-600">{t({ en: 'Items Affected', ar: 'العناصر المتأثرة' })}</p>
                    <p className="text-xl font-bold text-red-600">{bottleneck.items_affected}</p>
                  </div>
                  <div className="p-2 bg-white rounded text-center">
                    <p className="text-xs text-slate-600">{t({ en: 'Avg Delay', ar: 'التأخير المتوسط' })}</p>
                    <p className="text-xl font-bold text-orange-600">{bottleneck.avg_delay_days}d</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">{t({ en: 'Root Cause:', ar: 'السبب الجذري:' })}</p>
                    <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' ? bottleneck.root_cause_ar : bottleneck.root_cause_en}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs font-semibold text-green-700 mb-1">💡 {t({ en: 'Recommendation:', ar: 'التوصية:' })}</p>
                    <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' ? bottleneck.recommendation_ar : bottleneck.recommendation_en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {t({ en: 'Click Detect to analyze pipeline bottlenecks', ar: 'انقر على كشف لتحليل اختناقات خط الابتكار' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
