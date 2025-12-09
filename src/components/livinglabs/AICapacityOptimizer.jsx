import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import { useLanguage } from '../LanguageContext';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AICapacityOptimizer({ livingLab }) {
  const { t, isRTL } = useLanguage();
  const [analysis, setAnalysis] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateAnalysis = async () => {
    const [bookings, projects] = await Promise.all([
      base44.entities.LivingLabBooking.filter({ living_lab_id: livingLab.id }).catch(() => []),
      base44.entities.RDProject.filter({ living_lab_id: livingLab.id }).catch(() => [])
    ]);

    const result = await invokeAI({
      prompt: `Analyze this Living Lab's capacity and provide optimization recommendations:

Lab: ${livingLab.name_en}
Type: ${livingLab.type}
Status: ${livingLab.status}
Available Equipment: ${livingLab.equipment_catalog?.length || 0} items
Total Bookings: ${bookings.length}
Active Projects: ${projects.length}
Max Capacity: ${livingLab.max_capacity || 'Not specified'}

Provide:
1. Current utilization rate estimate (0-100%)
2. Peak usage periods (days/times)
3. Underutilized resources
4. Capacity expansion recommendations
5. Scheduling optimization suggestions
6. Resource allocation improvements`,
      response_json_schema: {
        type: 'object',
        properties: {
          utilization_rate: { type: 'number' },
          peak_periods: { type: 'array', items: { type: 'string' } },
          underutilized: { type: 'array', items: { type: 'string' } },
          expansion_recommendations: { type: 'array', items: { type: 'string' } },
          scheduling_tips: { type: 'array', items: { type: 'string' } },
          allocation_improvements: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      setAnalysis(result.data);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Capacity Optimizer', ar: 'محسّن السعة الذكي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis && (
          <div className="text-center py-8">
            <div className="h-20 w-20 rounded-full bg-purple-100 mx-auto flex items-center justify-center mb-3">
              <Sparkles className="h-10 w-10 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {t({ 
                en: 'AI will analyze lab usage patterns and provide optimization recommendations',
                ar: 'سيحلل الذكاء أنماط استخدام المختبر ويقدم توصيات التحسين'
              })}
            </p>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
            <Button onClick={generateAnalysis} disabled={loading || !isAvailable} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'يحلل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t({ en: 'Generate Analysis', ar: 'إنشاء التحليل' })}
                </>
              )}
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            {/* Utilization Rate */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{t({ en: 'Current Utilization', ar: 'الاستخدام الحالي' })}</p>
                <Badge className={
                  analysis.utilization_rate >= 80 ? 'bg-green-600' :
                  analysis.utilization_rate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                }>
                  {analysis.utilization_rate}%
                </Badge>
              </div>
              <Progress value={analysis.utilization_rate} className="h-2" />
            </div>

            {/* Peak Periods */}
            {analysis.peak_periods?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  {t({ en: 'Peak Usage Periods', ar: 'فترات الذروة' })}
                </h4>
                <ul className="space-y-1">
                  {analysis.peak_periods.map((period, i) => (
                    <li key={i} className="text-sm text-slate-700">• {period}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Underutilized */}
            {analysis.underutilized?.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  {t({ en: 'Underutilized Resources', ar: 'موارد غير مستغلة' })}
                </h4>
                <ul className="space-y-1">
                  {analysis.underutilized.map((item, i) => (
                    <li key={i} className="text-sm text-slate-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {analysis.expansion_recommendations?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {t({ en: 'Expansion Recommendations', ar: 'توصيات التوسع' })}
                </h4>
                <ul className="space-y-1">
                  {analysis.expansion_recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-slate-700">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scheduling Tips */}
            {analysis.scheduling_tips?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm mb-2">{t({ en: 'Scheduling Optimization', ar: 'تحسين الجدولة' })}</h4>
                <ul className="space-y-1">
                  {analysis.scheduling_tips.map((tip, i) => (
                    <li key={i} className="text-sm text-slate-700">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Allocation Improvements */}
            {analysis.allocation_improvements?.length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-sm mb-2">{t({ en: 'Resource Allocation', ar: 'تخصيص الموارد' })}</h4>
                <ul className="space-y-1">
                  {analysis.allocation_improvements.map((imp, i) => (
                    <li key={i} className="text-sm text-slate-700">• {imp}</li>
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