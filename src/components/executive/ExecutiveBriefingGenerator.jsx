import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { FileText, Download, Loader2, Sparkles, Award, AlertCircle, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildExecutiveBriefingPrompt, 
  executiveBriefingSchema, 
  EXECUTIVE_BRIEFING_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/executive';

export default function ExecutiveBriefingGenerator() {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading: generating, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [briefing, setBriefing] = useState(null);
  const [period, setPeriod] = useState('monthly');

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-brief'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-brief'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-brief'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const generateBriefing = async () => {
    if (!isAvailable) return;
    
    const ecosystemData = {
      totalChallenges: challenges.length,
      activePilots: pilots.filter(p => p.stage === 'active').length,
      scaledSolutions: pilots.filter(p => p.stage === 'scaled').length,
      municipalityCount: municipalities.length,
      averageMII: municipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / (municipalities.length || 1)
    };

    const result = await invokeAI({
      systemPrompt: getSystemPrompt(EXECUTIVE_BRIEFING_SYSTEM_PROMPT),
      prompt: buildExecutiveBriefingPrompt(period, ecosystemData),
      response_json_schema: executiveBriefingSchema
    });

    if (result.success && result.data) {
      setBriefing(result.data);
      toast.success(t({ en: 'Briefing generated', ar: 'تم توليد الموجز' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t({ en: 'Executive Briefing Generator', ar: 'مولد الموجز التنفيذي' })}
          </CardTitle>
          <div className="flex gap-2">
            {['weekly', 'monthly', 'quarterly'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        <Button
          onClick={generateBriefing}
          disabled={generating || !isAvailable}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Generate Briefing', ar: 'توليد الموجز' })}
        </Button>

        {briefing && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? briefing.executive_summary_ar : briefing.executive_summary_en}
              </p>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">{t({ en: '📊 Key Metrics', ar: '📊 المؤشرات الرئيسية' })}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {briefing.key_metrics?.map((metric, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{metric.value}</div>
                    <div className="text-sm font-medium text-slate-900">{metric.metric}</div>
                    <div className="text-xs text-slate-600 mt-1">{metric.context}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">
                {t({ en: '🏆 Notable Achievements', ar: '🏆 إنجازات بارزة' })}
              </h4>
              <ul className="space-y-2">
                {briefing.achievements?.map((achievement, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <Award className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-3">
                {t({ en: '⚠️ Areas of Concern', ar: '⚠️ مجالات القلق' })}
              </h4>
              <ul className="space-y-2">
                {briefing.concerns?.map((concern, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">
                {t({ en: '🎯 Strategic Recommendations', ar: '🎯 التوصيات الاستراتيجية' })}
              </h4>
              <ul className="space-y-2">
                {briefing.recommendations?.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Outlook */}
            <div className="p-4 bg-slate-100 rounded-lg border">
              <h4 className="font-semibold text-slate-900 mb-2">
                {t({ en: '🔮 Outlook', ar: '🔮 التوقعات' })}
              </h4>
              <p className="text-sm text-slate-700">{briefing.outlook}</p>
            </div>

            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t({ en: 'Download PDF', ar: 'تحميل PDF' })}
            </Button>
          </div>
        )}

        {!briefing && !generating && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {t({ en: 'Generate comprehensive executive briefing', ar: 'توليد موجز تنفيذي شامل' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}