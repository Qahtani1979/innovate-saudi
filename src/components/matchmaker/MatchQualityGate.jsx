import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Sparkles, CheckCircle2, AlertTriangle, Loader2, Network } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  QUALITY_GATE_SYSTEM_PROMPT,
  buildQualityGatePrompt,
  QUALITY_GATE_SCHEMA
} from '@/lib/ai/prompts/matchmaker/qualityGate';

export default function MatchQualityGate({ application, matchedChallenges = [], onApprove }) {
  const { language, isRTL, t } = useLanguage();
  const [qualityScores, setQualityScores] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const runQualityAnalysis = async () => {
    const result = await invokeAI({
      prompt: buildQualityGatePrompt({ application, matchedChallenges }),
      system_prompt: QUALITY_GATE_SYSTEM_PROMPT,
      response_json_schema: QUALITY_GATE_SCHEMA
    });

    if (result.success) {
      setQualityScores(result.data);
      toast.success(t({ en: 'Match quality analyzed', ar: 'تم تحليل جودة المطابقة' }));
    }
  };

  const passThreshold = 75;
  const canProceed = qualityScores && qualityScores.overall_quality >= passThreshold;

  return (
    <Card className="border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-teal-600" />
          {t({ en: 'Match Quality Gate (AI)', ar: 'بوابة جودة المطابقة (ذكاء)' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        <div className="p-4 bg-white border rounded-lg">
          <p className="text-sm font-medium mb-2">{t({ en: 'Matched Challenges:', ar: 'التحديات المطابقة:' })}</p>
          <p className="text-2xl font-bold text-teal-600">{matchedChallenges.length}</p>
        </div>

        <Button
          onClick={runQualityAnalysis}
          disabled={isLoading || !isAvailable || matchedChallenges.length === 0}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'Run AI Quality Analysis', ar: 'تشغيل تحليل الجودة الذكي' })}</>
          )}
        </Button>

        {qualityScores && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'sector_alignment', label: { en: 'Sector Alignment', ar: 'توافق القطاع' } },
                { key: 'capability_fit', label: { en: 'Capability Fit', ar: 'توافق القدرات' } },
                { key: 'geographic_suitability', label: { en: 'Geographic Fit', ar: 'التوافق الجغرافي' } },
                { key: 'strategic_priority', label: { en: 'Strategic Priority', ar: 'الأولوية الاستراتيجية' } }
              ].map(({ key, label }) => (
                <div key={key} className="p-3 bg-white border rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">{label[language]}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={qualityScores[key]} className="h-2 flex-1" />
                    <span className="text-sm font-bold">{qualityScores[key]}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-2 rounded-lg text-center" style={{
              borderColor: canProceed ? '#16a34a' : '#dc2626',
              backgroundColor: canProceed ? '#f0fdf4' : '#fef2f2'
            }}>
              <p className="text-sm text-slate-600 mb-2">{t({ en: 'Overall Match Quality', ar: 'جودة المطابقة الإجمالية' })}</p>
              <p className="text-5xl font-bold" style={{ color: canProceed ? '#16a34a' : '#dc2626' }}>
                {qualityScores.overall_quality}
              </p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Threshold: 75', ar: 'الحد الأدنى: 75' })}</p>
            </div>

            {qualityScores.concerns?.length > 0 && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="font-semibold text-red-900 text-sm mb-2">{t({ en: '⚠️ Concerns:', ar: '⚠️ مخاوف:' })}</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  {qualityScores.concerns.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {qualityScores.opportunities?.length > 0 && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="font-semibold text-green-900 text-sm mb-2">{t({ en: '✨ Opportunities:', ar: '✨ فرص:' })}</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  {qualityScores.opportunities.map((o, i) => (
                    <li key={i}>• {o}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => onApprove(qualityScores)}
              disabled={!canProceed}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Approve for Engagement', ar: 'الموافقة للمشاركة' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
