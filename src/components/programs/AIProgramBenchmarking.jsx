import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { BarChart3, TrendingUp, Award, Sparkles, Loader2, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';

export default function AIProgramBenchmarking({ program }) {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [benchmarkData, setBenchmarkData] = useState(null);

  // Fetch similar programs (limit 100 to find diverse set)
  const { data: allPrograms = [] } = useProgramsWithVisibility({ limit: 100 });

  const similarPrograms = allPrograms.filter(p =>
    p.id !== program.id &&
    (p.program_type === program.program_type ||
      p.focus_areas?.some(f => program.focus_areas?.includes(f)))
  );

  const handleAnalyze = async () => {
    const peerData = similarPrograms.slice(0, 15).map(p => ({
      name: p.name_en,
      type: p.program_type,
      graduation_rate: p.graduation_rate || 0,
      employment_rate: p.post_program_employment_rate || 0,
      application_count: p.application_count || 0,
      accepted_count: p.accepted_count || 0,
      outcomes: p.outcomes,
      duration_weeks: p.duration_weeks
    }));

    const result = await invokeAI({
      prompt: `Benchmark this program against peers in BOTH English and Arabic:

Current Program: ${program.name_en}
Type: ${program.program_type}
Graduation Rate: ${program.graduation_rate || 0}%
Employment Rate: ${program.post_program_employment_rate || 0}%
Applications: ${program.application_count || 0}
Accepted: ${program.accepted_count || 0}
Duration: ${program.duration_weeks || 0} weeks

Peer Programs (${similarPrograms.length} similar):
${JSON.stringify(peerData)}

Provide bilingual analysis:
1. Percentile rankings for key metrics (graduation, employment, cost-per-participant, satisfaction)
2. Best practices from top performers
3. Improvement opportunities
4. Cost-efficiency comparison
5. Outcome quality comparison`,
      response_json_schema: {
        type: 'object',
        properties: {
          percentile_rankings: {
            type: 'object',
            properties: {
              graduation_rate: { type: 'number' },
              employment_rate: { type: 'number' },
              application_volume: { type: 'number' },
              outcome_quality: { type: 'number' }
            }
          },
          best_practices: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                practice_en: { type: 'string' },
                practice_ar: { type: 'string' },
                source_program: { type: 'string' }
              }
            }
          },
          improvement_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area_en: { type: 'string' },
                area_ar: { type: 'string' },
                recommendation_en: { type: 'string' },
                recommendation_ar: { type: 'string' }
              }
            }
          },
          cost_analysis: {
            type: 'object',
            properties: {
              percentile: { type: 'number' },
              insight_en: { type: 'string' },
              insight_ar: { type: 'string' }
            }
          }
        }
      }
    });

    if (result.success) {
      setBenchmarkData(result.data);
    }
  };

  // Calculate simple rankings
  const calculatePercentile = (value, metric) => {
    const values = similarPrograms
      .map(p => {
        if (metric === 'graduation_rate') return p.graduation_rate || 0;
        if (metric === 'employment_rate') return p.post_program_employment_rate || 0;
        if (metric === 'applications') return p.application_count || 0;
        return 0;
      })
      .filter(v => v > 0);

    if (values.length === 0) return 0;
    const below = values.filter(v => v < value).length;
    return Math.round((below / values.length) * 100);
  };

  const chartData = [
    {
      metric: t({ en: 'Graduation', ar: 'التخرج' }),
      current: program.graduation_rate || 0,
      average: similarPrograms.length > 0
        ? similarPrograms.reduce((sum, p) => sum + (p.graduation_rate || 0), 0) / similarPrograms.length
        : 0,
      percentile: calculatePercentile(program.graduation_rate || 0, 'graduation_rate')
    },
    {
      metric: t({ en: 'Employment', ar: 'التوظيف' }),
      current: program.post_program_employment_rate || 0,
      average: similarPrograms.length > 0
        ? similarPrograms.reduce((sum, p) => sum + (p.post_program_employment_rate || 0), 0) / similarPrograms.length
        : 0,
      percentile: calculatePercentile(program.post_program_employment_rate || 0, 'employment_rate')
    },
    {
      metric: t({ en: 'Applications', ar: 'الطلبات' }),
      current: program.application_count || 0,
      average: similarPrograms.length > 0
        ? similarPrograms.reduce((sum, p) => sum + (p.application_count || 0), 0) / similarPrograms.length
        : 0,
      percentile: calculatePercentile(program.application_count || 0, 'applications')
    }
  ];

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {t({ en: 'Peer Benchmarking & Comparison', ar: 'المقارنة بالأقران' })}
          </CardTitle>
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || similarPrograms.length === 0 || !isAvailable}
            className="bg-blue-600"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'AI Analysis', ar: 'تحليل ذكي' })}
          </Button>
        </div>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Peer Count */}
        <div className="p-4 bg-white rounded-lg border-2 border-blue-300 text-center">
          <p className="text-3xl font-bold text-blue-600">{similarPrograms.length}</p>
          <p className="text-sm text-slate-600 mt-1">
            {t({ en: 'Similar Programs for Comparison', ar: 'برنامج مشابه للمقارنة' })}
          </p>
        </div>

        {/* Performance Chart */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            {t({ en: 'Performance vs Peers', ar: 'الأداء مقابل الأقران' })}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#3b82f6" name={t({ en: 'This Program', ar: 'هذا البرنامج' })} />
              <Bar dataKey="average" fill="#94a3b8" name={t({ en: 'Peer Average', ar: 'متوسط الأقران' })} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Percentile Rankings */}
        <div className="grid grid-cols-3 gap-3">
          {chartData.map((item, idx) => (
            <div key={idx} className="p-3 bg-white rounded-lg border text-center">
              <p className="text-xs text-slate-600 mb-1">{item.metric}</p>
              <p className="text-2xl font-bold text-blue-600">{item.percentile}%</p>
              <p className="text-xs text-slate-500">{t({ en: 'percentile', ar: 'مئوي' })}</p>
            </div>
          ))}
        </div>

        {/* AI Generated Insights */}
        {benchmarkData && (
          <div className="space-y-4">
            {/* Best Practices */}
            {benchmarkData.best_practices?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  {t({ en: 'Best Practices from Top Performers', ar: 'أفضل الممارسات' })}
                </h4>
                <div className="space-y-2">
                  {benchmarkData.best_practices.map((practice, i) => (
                    <div key={i} className="text-sm">
                      <p className="text-green-800">
                        • {language === 'ar' ? practice.practice_ar : practice.practice_en}
                      </p>
                      <p className="text-xs text-green-600 ml-4">{t({ en: 'Source:', ar: 'المصدر:' })} {practice.source_program}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Opportunities */}
            {benchmarkData.improvement_opportunities?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {t({ en: 'Improvement Opportunities', ar: 'فرص التحسين' })}
                </h4>
                <div className="space-y-3">
                  {benchmarkData.improvement_opportunities.map((opp, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium text-amber-900">
                        {language === 'ar' ? opp.area_ar : opp.area_en}
                      </p>
                      <p className="text-amber-700 ml-4">
                        → {language === 'ar' ? opp.recommendation_ar : opp.recommendation_en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Analysis */}
            {benchmarkData.cost_analysis && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t({ en: 'Cost Efficiency', ar: 'كفاءة التكلفة' })}
                </h4>
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {benchmarkData.cost_analysis.percentile}%
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${benchmarkData.cost_analysis.percentile}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-blue-800">
                  {language === 'ar' ? benchmarkData.cost_analysis.insight_ar : benchmarkData.cost_analysis.insight_en}
                </p>
              </div>
            )}
          </div>
        )}

        {similarPrograms.length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {t({ en: 'No similar programs found for comparison', ar: 'لا توجد برامج مشابهة للمقارنة' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
