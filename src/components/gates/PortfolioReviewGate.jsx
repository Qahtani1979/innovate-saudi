import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BarChart3, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function PortfolioReviewGate({ portfolioData, onApprove, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [comments, setComments] = useState('');
  const [aiInsights, setAiInsights] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const performanceMetrics = [
    { metric: 'On-Track KPIs', value: 73, target: 80, status: 'at_risk' },
    { metric: 'Budget Utilization', value: 68, target: 75, status: 'on_track' },
    { metric: 'Pilot Success Rate', value: 82, target: 85, status: 'on_track' },
    { metric: 'Challenge Resolution', value: 45, target: 60, status: 'off_track' }
  ];

  const chartData = performanceMetrics.map(m => ({
    metric: m.metric,
    current: m.value,
    target: m.target
  }));

  const generateAIReview = async () => {
    const result = await invokeAI({
      prompt: `Perform quarterly portfolio review for Saudi municipal innovation:

Performance: ${JSON.stringify(performanceMetrics)}

Provide bilingual review:
1. Key achievements this quarter
2. Areas of concern
3. Recommendations for next quarter`,
      response_json_schema: {
        type: 'object',
        properties: {
          achievements: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          concerns: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      }
    });

    if (result.success) {
      setAiInsights(result.data);
    }
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          {t({ en: 'Quarterly Portfolio Review Gate', ar: 'بوابة المراجعة الربعية للمحفظة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Performance vs Targets', ar: 'الأداء مقابل الأهداف' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill="#3b82f6" name="Current" />
                <Bar dataKey="target" fill="#10b981" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Review */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
            
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-purple-900">{t({ en: 'AI Quarterly Review', ar: 'المراجعة الربعية الذكية' })}</p>
              <Button onClick={generateAIReview} disabled={isLoading || !isAvailable} size="sm">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
            {aiInsights && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded">
                  <p className="text-xs font-medium text-green-700 mb-2">{t({ en: 'Achievements', ar: 'الإنجازات' })}</p>
                  <ul className="text-xs space-y-1">
                    {aiInsights.achievements?.map((item, i) => (
                      <li key={i}>✓ {language === 'ar' ? item.ar : item.en}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs font-medium text-red-700 mb-2">{t({ en: 'Concerns', ar: 'المخاوف' })}</p>
                  <ul className="text-xs space-y-1">
                    {aiInsights.concerns?.map((item, i) => (
                      <li key={i}>⚠ {language === 'ar' ? item.ar : item.en}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs font-medium text-blue-700 mb-2">{t({ en: 'Next Steps', ar: 'الخطوات التالية' })}</p>
                  <ul className="text-xs space-y-1">
                    {aiInsights.recommendations?.map((item, i) => (
                      <li key={i}>→ {language === 'ar' ? item.ar : item.en}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">{t({ en: 'Review Comments:', ar: 'تعليقات المراجعة:' })}</label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={() => onApprove(comments)} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
            <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Approve & Continue', ar: 'الموافقة والمتابعة' })}
          </Button>
          <Button onClick={onClose} variant="outline">
            {t({ en: 'Close', ar: 'إغلاق' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
