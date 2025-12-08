import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { BarChart3, TrendingUp, TrendingDown, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PilotBenchmarking({ pilot }) {
  const { language, t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [benchmarks, setBenchmarks] = useState(null);

  const { data: similarPilots = [] } = useQuery({
    queryKey: ['similar-pilots', pilot.sector],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => 
        p.sector === pilot.sector && 
        p.id !== pilot.id && 
        p.status === 'completed'
      ).slice(0, 10);
    },
    initialData: []
  });

  const runBenchmark = async () => {
    setAnalyzing(true);
    try {
      const context = similarPilots.map(p => ({
        title: p.title_en,
        duration: p.duration_months,
        budget: p.budget_allocated,
        kpi_achievement: p.overall_score
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare this pilot against similar completed pilots:

Current Pilot: ${pilot.title_en}
- Duration: ${pilot.duration_months} months
- Budget: ${pilot.budget_allocated}
- Current Score: ${pilot.overall_score}

Similar Pilots:
${JSON.stringify(context, null, 2)}

Provide:
1. Performance percentile (e.g., "Top 25% in efficiency")
2. Areas where this pilot outperforms peers
3. Areas where this pilot underperforms
4. Specific recommendations based on what top performers did`,
        response_json_schema: {
          type: "object",
          properties: {
            percentile: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setBenchmarks(response);
      toast.success(t({ en: 'Benchmark complete', ar: 'اكتمل القياس' }));
    } catch (error) {
      toast.error(t({ en: 'Benchmark failed', ar: 'فشل القياس' }));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Performance Benchmarking', ar: 'قياس الأداء' })}
          </CardTitle>
          <Button onClick={runBenchmark} disabled={analyzing || similarPilots.length === 0} size="sm" className="bg-indigo-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Run Benchmark', ar: 'تشغيل القياس' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!benchmarks && !analyzing && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: `Compare against ${similarPilots.length} similar pilots`, ar: `قارن مع ${similarPilots.length} تجربة مماثلة` })}
            </p>
          </div>
        )}

        {benchmarks && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-300 text-center">
              <p className="text-sm text-indigo-900 mb-1">{t({ en: 'Performance Ranking', ar: 'تصنيف الأداء' })}</p>
              <p className="text-2xl font-bold text-indigo-600">{benchmarks.percentile}</p>
            </div>

            {benchmarks.strengths?.length > 0 && (
              <div className="p-4 bg-green-50 rounded border border-green-300">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-sm text-green-900">
                    {t({ en: 'Strengths', ar: 'نقاط القوة' })}
                  </h4>
                </div>
                <ul className="space-y-1">
                  {benchmarks.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-700">• {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {benchmarks.weaknesses?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded border border-amber-300">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-sm text-amber-900">
                    {t({ en: 'Areas for Improvement', ar: 'مجالات التحسين' })}
                  </h4>
                </div>
                <ul className="space-y-1">
                  {benchmarks.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-slate-700">• {w}</li>
                  ))}
                </ul>
              </div>
            )}

            {benchmarks.recommendations?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded border border-blue-300">
                <h4 className="font-semibold text-sm text-blue-900 mb-3">
                  {t({ en: 'Best Practice Recommendations', ar: 'توصيات أفضل الممارسات' })}
                </h4>
                <ul className="space-y-2">
                  {benchmarks.recommendations.map((r, i) => (
                    <li key={i} className="text-xs text-slate-700 p-2 bg-white rounded">
                      {r}
                    </li>
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