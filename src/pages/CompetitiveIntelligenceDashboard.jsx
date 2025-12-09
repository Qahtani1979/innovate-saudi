import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function CompetitiveIntelligenceDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const competitors = [
    { city: 'Dubai', pilots: 234, mii: 81, scaling: 35 },
    { city: 'Singapore', pilots: 312, mii: 87, scaling: 42 },
    { city: 'Barcelona', pilots: 189, mii: 79, scaling: 28 },
    { city: 'Saudi (Avg)', pilots: 145, mii: 72, scaling: 23 }
  ];

  const radarData = [
    { metric: 'Pilots', Dubai: 234, Singapore: 312, Saudi: 145 },
    { metric: 'MII', Dubai: 81, Singapore: 87, Saudi: 72 },
    { metric: 'Scaling %', Dubai: 35, Singapore: 42, Saudi: 23 }
  ];

  const generateInsights = async () => {
    const result = await invokeAI({
      prompt: `Analyze competitive landscape:

Competitors: ${JSON.stringify(competitors)}

Provide:
1. Strengths where Saudi leads
2. Critical gaps vs best-in-class
3. Best practices to adopt
4. Strategic recommendations`,
      response_json_schema: {
        type: 'object',
        properties: {
          strengths: { type: 'array', items: { type: 'string' } },
          gaps: { type: 'array', items: { type: 'string' } },
          best_practices: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    
    if (result.success) {
      setInsights(result.data);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Competitive Intelligence', ar: 'الذكاء التنافسي' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Benchmark against global innovation leaders', ar: 'المقارنة مع قادة الابتكار العالميين' })}
          </p>
        </div>
        <Button onClick={generateInsights} disabled={loading || !isAvailable} className="bg-purple-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'AI Analysis', ar: 'تحليل ذكي' })}
        </Button>
      </div>
      
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Competitive Comparison', ar: 'المقارنة التنافسية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={competitors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pilots" fill="#3b82f6" name="Pilots" />
              <Bar dataKey="mii" fill="#a855f7" name="MII" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'Competitive Analysis', ar: 'التحليل التنافسي' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Our Strengths', ar: 'نقاط قوتنا' })}</h4>
              <ul className="space-y-1 text-sm">{insights.strengths?.map((s, i) => <li key={i}>✓ {s}</li>)}</ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Critical Gaps', ar: 'الفجوات الحرجة' })}</h4>
              <ul className="space-y-1 text-sm">{insights.gaps?.map((g, i) => <li key={i}>• {g}</li>)}</ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(CompetitiveIntelligenceDashboard, { requiredPermissions: [] });