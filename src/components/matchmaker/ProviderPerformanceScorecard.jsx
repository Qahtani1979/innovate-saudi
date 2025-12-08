import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Award, TrendingUp, Target, Users, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProviderPerformanceScorecard({ application, pilots = [] }) {
  const { language, isRTL, t } = useLanguage();
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateScorecard = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a performance scorecard for this Matchmaker provider:

Organization: ${application.organization_name_en}
Evaluation Score: ${application.evaluation_score?.total_score}
Classification: ${application.classification}
Pilots Converted: ${pilots.length}

Pilot Details:
${pilots.map(p => `- ${p.title_en}: Stage ${p.stage}, TRL ${p.trl_current}`).join('\n')}

Calculate scores (0-100) for:
1. Delivery excellence (on-time, quality)
2. Innovation impact (TRL advancement, outcomes)
3. Partnership effectiveness (communication, collaboration)
4. Scalability potential (replicability, market)
5. Overall provider score (weighted average)

Also provide:
- strengths (3 bullets)
- improvement_areas (3 bullets)
- recommendation (tier_1_partner / tier_2_partner / conditional / review)`,
        response_json_schema: {
          type: 'object',
          properties: {
            delivery_excellence: { type: 'number' },
            innovation_impact: { type: 'number' },
            partnership_effectiveness: { type: 'number' },
            scalability_potential: { type: 'number' },
            overall_score: { type: 'number' },
            strengths: { type: 'array', items: { type: 'string' } },
            improvement_areas: { type: 'array', items: { type: 'string' } },
            recommendation: { type: 'string' }
          }
        }
      });

      setScorecard(result);
      toast.success(t({ en: 'Scorecard generated', ar: 'تم إنشاء بطاقة الأداء' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate', ar: 'فشل الإنشاء' }));
    } finally {
      setLoading(false);
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

        <Button
          onClick={generateScorecard}
          disabled={loading}
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