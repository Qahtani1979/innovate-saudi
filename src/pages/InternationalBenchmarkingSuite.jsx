import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function InternationalBenchmarkingSuite() {
  const { language, isRTL, t } = useLanguage();
  const [analysis, setAnalysis] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const benchmarkData = [
    { metric: 'MII Score', Saudi: 72, Dubai: 81, Singapore: 87, Barcelona: 79 },
    { metric: 'Pilots', Saudi: 60, Dubai: 78, Singapore: 92, Barcelona: 71 },
    { metric: 'Scaling Rate', Saudi: 38, Dubai: 58, Singapore: 70, Barcelona: 52 },
    { metric: 'Challenge Resolution', Saudi: 78, Dubai: 65, Singapore: 72, Barcelona: 68 },
    { metric: 'Innovation Spend', Saudi: 65, Dubai: 72, Singapore: 88, Barcelona: 70 }
  ];

  const generateBenchmarkAnalysis = async () => {
    // Import centralized prompt module
    const { 
      BENCHMARKING_PROMPT_TEMPLATE, 
      BENCHMARKING_RESPONSE_SCHEMA 
    } = await import('@/lib/ai/prompts/analytics/benchmarking');
    
    const response = await invokeAI({
      prompt: BENCHMARKING_PROMPT_TEMPLATE(benchmarkData),
      response_json_schema: BENCHMARKING_RESPONSE_SCHEMA
    });
    if (response.success) {
      setAnalysis(response.data);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'International Benchmarking Suite', ar: 'مجموعة المقارنة الدولية' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Compare with global smart city leaders', ar: 'المقارنة مع قادة المدن الذكية العالميين' })}
          </p>
        </div>
        <Button onClick={generateBenchmarkAnalysis} disabled={loading || !isAvailable} className="bg-purple-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'Generate Analysis', ar: 'توليد التحليل' })}
        </Button>
      </div>

      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      {/* Radar Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Performance Radar', ar: 'رادار الأداء' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={benchmarkData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Saudi" dataKey="Saudi" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              <Radar name="Singapore" dataKey="Singapore" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {analysis && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'Benchmark Analysis', ar: 'تحليل المقارنة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Strengths', ar: 'نقاط القوة' })}</h4>
              <ul className="space-y-1 text-sm">{analysis.strengths?.map((s, i) => <li key={i}>✓ {s}</li>)}</ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Best Practices', ar: 'أفضل الممارسات' })}</h4>
              <ul className="space-y-1 text-sm">{analysis.best_practices?.map((bp, i) => <li key={i}>• {bp}</li>)}</ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(InternationalBenchmarkingSuite, { requiredPermissions: [] });
