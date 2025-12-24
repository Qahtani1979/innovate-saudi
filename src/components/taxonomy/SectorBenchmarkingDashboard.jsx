import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Globe, Sparkles, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  buildSectorBenchmarkPrompt,
  SECTOR_BENCHMARK_SYSTEM_PROMPT,
  SECTOR_BENCHMARK_SCHEMA
} from '@/lib/ai/prompts/taxonomy/sectorBenchmark';

import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';

export default function SectorBenchmarkingDashboard({ sectorId }) {
  const { t } = useLanguage();
  const { invokeAI, status, isLoading: benchmarking, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [benchmarkData, setBenchmarkData] = useState(null);

  // Use hooks for data
  const { data: allChallenges = [] } = useChallengesWithVisibility({ limit: 1000 });
  const challenges = allChallenges.filter(c => c.sector_id === sectorId || c.sector === sectorId);

  const { data: allPilots = [] } = usePilotsWithVisibility();
  const pilots = allPilots.filter(p => p.sector === sectorId);

  const generateBenchmark = async () => {
    if (!isAvailable) return;

    const activePilotCount = pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length;
    const completedPilotCount = pilots.filter(p => p.stage === 'completed').length;
    const successRate = pilots.length > 0 ? Math.round((pilots.filter(p => p.recommendation === 'scale').length / pilots.length) * 100) : 0;

    const result = await invokeAI({
      system_prompt: SECTOR_BENCHMARK_SYSTEM_PROMPT,
      prompt: buildSectorBenchmarkPrompt({
        challengeCount: challenges.length,
        activePilots: activePilotCount,
        completedPilots: completedPilotCount,
        successRate
      }),
      response_json_schema: SECTOR_BENCHMARK_SCHEMA
    });

    if (result.success && result.data) {
      setBenchmarkData(result.data);
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Sector Benchmarking', ar: 'مقارنة القطاع' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        {!benchmarkData && (
          <div className="text-center py-6">
            <Globe className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'Compare to national and international standards', ar: 'قارن مع المعايير الوطنية والدولية' })}
            </p>
            <Button onClick={generateBenchmark} disabled={benchmarking || !isAvailable}>
              {benchmarking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'يحلل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate Benchmark', ar: 'إنشاء مقارنة' })}
                </>
              )}
            </Button>
          </div>
        )}

        {benchmarkData && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-sm mb-2">{t({ en: 'Performance Gap', ar: 'فجوة الأداء' })}</p>
              <div className="flex items-center gap-4">
                <Progress value={Math.max(0, 100 - benchmarkData.performance_gap)} className="flex-1 h-3" />
                <Badge className={benchmarkData.performance_gap > 30 ? 'bg-red-600' : 'bg-green-600'}>
                  {benchmarkData.performance_gap}% gap
                </Badge>
              </div>
            </div>

            {benchmarkData.strengths?.length > 0 && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="font-semibold text-xs text-green-900 mb-1">{t({ en: 'Strengths', ar: 'نقاط القوة' })}</p>
                <ul className="text-xs text-green-800 space-y-0.5">
                  {benchmarkData.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}

            {benchmarkData.recommendations?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <p className="font-semibold text-xs text-amber-900 mb-1">{t({ en: 'Recommendations', ar: 'التوصيات' })}</p>
                <ul className="text-xs text-amber-800 space-y-0.5">
                  {benchmarkData.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}