import { useState } from 'react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { usePilotsList } from '@/hooks/usePilots';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { BarChart3, Sparkles, Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PilotPerformanceBenchmarking({ pilot }) {
  const { language, t } = useLanguage();
  const [benchmark, setBenchmark] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: peers = [] } = usePilotsList({
    stage: 'completed',
    sector: pilot.sector
  });

  const analyzeBenchmark = async () => {
    try {
      const filteredPeers = peers.filter(p => p.id !== pilot.id);

      const response = await invokeAI({
        prompt: `Benchmark pilot performance:

PILOT: ${pilot.title_en}
SECTOR: ${pilot.sector}
BUDGET: ${pilot.budget || 'N/A'}
DURATION: ${pilot.duration_weeks || 'N/A'} weeks

PEER PILOTS: ${filteredPeers.length} completed pilots in same sector
Sample: ${filteredPeers.slice(0, 5).map(p =>
          `${p.title_en} - ${p.recommendation || 'unknown'} - ${p.duration_weeks || '?'} weeks`
        ).join('\n')}

Provide:
1. Percentile ranking: where does this pilot rank? (0-100)
2. Comparison vs average peer
3. Outliers detected (budget, timeline, success)
4. Improvement suggestions from top performers`,
        response_json_schema: {
          type: "object",
          properties: {
            percentile: { type: "number" },
            rank_interpretation: { type: "string" },
            vs_average: {
              type: "object",
              properties: {
                budget: { type: "string" },
                timeline: { type: "string" },
                success: { type: "string" }
              }
            },
            outliers: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } }
          }
        }
      });

      if (response.success) {
        setBenchmark(response.data);
        toast.success(t({ en: 'Benchmark complete', ar: 'المعيار مكتمل' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Benchmark failed', ar: 'فشل المعيار' }));
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {t({ en: 'Performance Benchmark', ar: 'معيار الأداء' })}
          </CardTitle>
          <Button onClick={analyzeBenchmark} disabled={analyzing} size="sm" className="bg-blue-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Benchmark', ar: 'قارن' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!benchmark && !analyzing && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI compares pilot against peers in same sector', ar: 'الذكاء يقارن التجربة مع الأقران في نفس القطاع' })}
            </p>
          </div>
        )}

        {benchmark && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 text-center">
              <TrendingUp className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <p className="text-4xl font-bold text-blue-600">{benchmark.percentile}th</p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'Percentile', ar: 'النسبة المئوية' })}</p>
              <p className="text-xs text-slate-500 mt-2">{benchmark.rank_interpretation}</p>
            </div>

            {benchmark.vs_average && (
              <div className="p-4 bg-white rounded border">
                <h4 className="font-semibold text-sm text-slate-900 mb-3">
                  {t({ en: 'vs Average Peer', ar: 'مقابل متوسط الأقران' })}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t({ en: 'Budget', ar: 'الميزانية' })}:</span>
                    <span className="font-medium">{benchmark.vs_average.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t({ en: 'Timeline', ar: 'الجدول' })}:</span>
                    <span className="font-medium">{benchmark.vs_average.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t({ en: 'Success', ar: 'النجاح' })}:</span>
                    <span className="font-medium">{benchmark.vs_average.success}</span>
                  </div>
                </div>
              </div>
            )}

            {benchmark.outliers?.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded border border-yellow-300">
                <h4 className="font-semibold text-sm text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t({ en: 'Outliers Detected', ar: 'قيم شاذة مكتشفة' })}
                </h4>
                <ul className="space-y-1">
                  {benchmark.outliers.map((outlier, i) => (
                    <li key={i} className="text-sm text-slate-700">⚠️ {outlier}</li>
                  ))}
                </ul>
              </div>
            )}

            {benchmark.improvements?.length > 0 && (
              <div className="p-3 bg-green-50 rounded border border-green-300">
                <h4 className="font-semibold text-sm text-green-900 mb-2">
                  {t({ en: '💡 Improvement Suggestions', ar: '💡 اقتراحات التحسين' })}
                </h4>
                <ul className="space-y-1">
                  {benchmark.improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-slate-700">→ {imp}</li>
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
