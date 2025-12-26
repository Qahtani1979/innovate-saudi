import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Award, TrendingUp, Target, Users, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PROVIDER_PERFORMANCE_SYSTEM_PROMPT, buildProviderPerformancePrompt, PROVIDER_PERFORMANCE_SCHEMA } from '@/lib/ai/prompts/matchmaker';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function ProviderPerformanceScorecard({ application, pilots = [] }) {
  const { language, isRTL, t } = useLanguage();
  const [scorecard, setScorecard] = useState(null);
  const { invokeAI, status, isLoading: loading, rateLimitInfo, isAvailable } = useAIWithFallback();

  const generateScorecard = async () => {
    if (!isAvailable) return;
    
    const result = await invokeAI({
      prompt: buildProviderPerformancePrompt(application, pilots),
      system_prompt: PROVIDER_PERFORMANCE_SYSTEM_PROMPT,
      response_json_schema: PROVIDER_PERFORMANCE_SCHEMA
    });

    if (result.success && result.data) {
      setScorecard(result.data);
      toast.success(t({ en: 'Scorecard generated', ar: 'تم إنشاء بطاقة الأداء' }));
    }
  };

  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          {t({ en: 'Provider Performance Scorecard (AI)', ar: 'بطاقة أداء المزود (ذكاء)' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white border rounded-lg text-center">
            <p className="text-xs text-slate-600">{t({ en: 'Base Score', ar: 'الدرجة الأساسية' })}</p>
            <p className="text-2xl font-bold text-blue-600">{application.evaluation_score?.total_score || 0}</p>
          </div>
          <div className="p-3 bg-white border rounded-lg text-center">
            <p className="text-xs text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
            <p className="text-2xl font-bold text-purple-600">{pilots.length}</p>
          </div>
        </div>

        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        <Button
          onClick={generateScorecard}
          disabled={loading || !isAvailable}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'Generate AI Scorecard', ar: 'إنشاء بطاقة الأداء الذكية' })}</>
          )}
        </Button>

        {scorecard && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'delivery_excellence', label: { en: 'Delivery', ar: 'التسليم' }, icon: Target },
                { key: 'innovation_impact', label: { en: 'Innovation', ar: 'الابتكار' }, icon: Sparkles },
                { key: 'partnership_effectiveness', label: { en: 'Partnership', ar: 'الشراكة' }, icon: Users },
                { key: 'scalability_potential', label: { en: 'Scalability', ar: 'التوسع' }, icon: TrendingUp }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-amber-600" />
                    <p className="text-xs text-slate-600">{label[language]}</p>
                  </div>
                  <Progress value={scorecard[key]} className="h-2 mb-1" />
                  <p className="text-sm font-bold text-right">{scorecard[key]}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-2 rounded-lg text-center" style={{
              borderColor: scorecard.overall_score >= 80 ? '#16a34a' : scorecard.overall_score >= 60 ? '#f59e0b' : '#dc2626'
            }}>
              <p className="text-sm text-slate-600 mb-2">{t({ en: 'Overall Provider Score', ar: 'درجة المزود الإجمالية' })}</p>
              <p className="text-5xl font-bold" style={{
                color: scorecard.overall_score >= 80 ? '#16a34a' : scorecard.overall_score >= 60 ? '#f59e0b' : '#dc2626'
              }}>
                {scorecard.overall_score}
              </p>
              <Badge className="mt-2 capitalize">{scorecard.recommendation?.replace(/_/g, ' ')}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="font-semibold text-green-900 text-sm mb-2">{t({ en: 'Strengths', ar: 'نقاط القوة' })}</p>
                <ul className="text-xs text-slate-700 space-y-1">
                  {scorecard.strengths?.map((s, i) => (
                    <li key={i}>✓ {s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <p className="font-semibold text-amber-900 text-sm mb-2">{t({ en: 'Improvement Areas', ar: 'مجالات التحسين' })}</p>
                <ul className="text-xs text-slate-700 space-y-1">
                  {scorecard.improvement_areas?.map((a, i) => (
                    <li key={i}>⚠️ {a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
