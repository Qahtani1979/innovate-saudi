import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Globe, Sparkles } from 'lucide-react';

export default function SectorBenchmarkingDashboard({ sectorId }) {
  const { t } = useLanguage();
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState(null);

  const { data: challenges = [] } = useQuery({
    queryKey: ['sector-challenges', sectorId],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.sector_id === sectorId);
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['sector-pilots', sectorId],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => p.sector === sectorId);
    }
  });

  const generateBenchmark = async () => {
    setBenchmarking(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Benchmark this sector against national/international standards:

Sector Performance:
- Total Challenges: ${challenges.length}
- Active Pilots: ${pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length}
- Completed Pilots: ${pilots.filter(p => p.stage === 'completed').length}
- Success Rate: ${pilots.length > 0 ? Math.round((pilots.filter(p => p.recommendation === 'scale').length / pilots.length) * 100) : 0}%

Provide benchmarking against:
1. National average for this sector
2. International best practices
3. Top performing municipalities in this sector
4. Areas for improvement
5. Recommendations`,
        response_json_schema: {
          type: 'object',
          properties: {
            national_average: {
              type: 'object',
              properties: {
                challenges_per_municipality: { type: 'number' },
                pilot_success_rate: { type: 'number' },
                innovation_score: { type: 'number' }
              }
            },
            international_benchmarks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  country: { type: 'string' },
                  metric: { type: 'string' },
                  value: { type: 'number' },
                  source: { type: 'string' }
                }
              }
            },
            performance_gap: { type: 'number' },
            strengths: { type: 'array', items: { type: 'string' } },
            areas_for_improvement: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        },
        add_context_from_internet: true
      });

      setBenchmarkData(result);
    } catch (error) {
      console.error(error);
    }
    setBenchmarking(false);
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
        {!benchmarkData && (
          <div className="text-center py-6">
            <Globe className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'Compare to national and international standards', ar: 'قارن مع المعايير الوطنية والدولية' })}
            </p>
            <Button onClick={generateBenchmark} disabled={benchmarking}>
              {benchmarking ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
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