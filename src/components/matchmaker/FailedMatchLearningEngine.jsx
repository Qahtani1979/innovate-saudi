import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertCircle, Sparkles, Loader2, TrendingDown, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function FailedMatchLearningEngine() {
  const { language, t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: failedMatches = [] } = useQuery({
    queryKey: ['failed-matches'],
    queryFn: async () => {
      const all = await base44.entities.MatchmakerApplication.list();
      return all.filter(m => m.status === 'failed' || m.status === 'terminated');
    }
  });

  const analyzeFailures = async () => {
    const result = await invokeAI({
      prompt: `Analyze failed matchmaker matches to extract learnings:

FAILED MATCHES DATA:
Total failures: ${failedMatches.length}
Sample reasons: ${failedMatches.slice(0, 10).map(m => m.failure_reason || 'Not specified').join(', ')}

Identify:
1. Top 5 failure categories with percentages
2. Most common root cause
3. Preventable vs unavoidable failures
4. Algorithm improvement recommendations
5. Pre-engagement validation suggestions`,
      response_json_schema: {
        type: "object",
        properties: {
          failure_categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                percentage: { type: "number" },
                examples: { type: "array", items: { type: "string" } }
              }
            }
          },
          root_cause: { type: "string" },
          preventable_rate: { type: "number" },
          algorithm_improvements: { type: "array", items: { type: "string" } },
          validation_checks: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (result.success) {
      setInsights(result.data);
      toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
    }
  };

  const categoryData = insights?.failure_categories?.map(c => ({
    name: c.category,
    value: c.percentage,
    color: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'][insights.failure_categories.indexOf(c) % 5]
  })) || [];

  return (
    <Card className="border-2 border-red-300">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            {t({ en: 'Failed Match Learning System', ar: 'نظام التعلم من المطابقات الفاشلة' })}
          </CardTitle>
          <Button onClick={analyzeFailures} disabled={isLoading || !isAvailable} size="sm" className="bg-red-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

        {!insights && !isLoading && (
          <div className="text-center py-8">
            <TrendingDown className="h-12 w-12 text-red-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: `AI analyzes ${failedMatches.length} failed matches to improve matching algorithm`, ar: `الذكاء يحلل ${failedMatches.length} مطابقة فاشلة لتحسين خوارزمية المطابقة` })}
            </p>
          </div>
        )}

        {insights && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  {t({ en: 'Failure Categories', ar: 'فئات الفشل' })}
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={(entry) => `${entry.name}: ${entry.value}%`}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-300">
                  <p className="text-xs text-slate-600 mb-1">{t({ en: 'Primary Root Cause', ar: 'السبب الجذري الأساسي' })}</p>
                  <p className="text-sm font-semibold text-red-900">{insights.root_cause}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-300">
                  <p className="text-xs text-slate-600 mb-1">{t({ en: 'Preventable', ar: 'قابل للمنع' })}</p>
                  <p className="text-2xl font-bold text-yellow-900">{insights.preventable_rate}%</p>
                </div>
              </div>
            </div>

            {insights.failure_categories?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  {t({ en: 'Failure Breakdown', ar: 'تفصيل الفشل' })}
                </h4>
                <div className="space-y-2">
                  {insights.failure_categories.map((cat, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm text-slate-900">{cat.category}</p>
                        <Badge className="bg-red-100 text-red-700">{cat.percentage}%</Badge>
                      </div>
                      {cat.examples?.length > 0 && (
                        <div className="space-y-1">
                          {cat.examples.slice(0, 2).map((ex, i) => (
                            <p key={i} className="text-xs text-slate-600">• {ex}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.algorithm_improvements?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {t({ en: 'Algorithm Improvements:', ar: 'تحسينات الخوارزمية:' })}
                </h4>
                <ul className="space-y-1">
                  {insights.algorithm_improvements.map((imp, idx) => (
                    <li key={idx} className="text-sm text-slate-700">→ {imp}</li>
                  ))}
                </ul>
              </div>
            )}

            {insights.validation_checks?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                <h4 className="font-semibold text-green-900 mb-2">
                  {t({ en: 'Pre-Engagement Validation Checks:', ar: 'فحوصات التحقق قبل المشاركة:' })}
                </h4>
                <ul className="space-y-1">
                  {insights.validation_checks.map((check, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{check}</span>
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
