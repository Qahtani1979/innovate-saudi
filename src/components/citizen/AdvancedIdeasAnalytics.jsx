import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Sparkles, Loader2, Brain, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AdvancedIdeasAnalytics({ ideas }) {
  const { language, isRTL, t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const { invokeAI, status, isLoading: generating, rateLimitInfo, isAvailable } = useAIWithFallback();

  const generateInsights = async () => {
    if (!isAvailable) return;
    
    const categoryCounts = ideas.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {});

    const topIdeas = ideas.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 10);

    const result = await invokeAI({
      prompt: `Analyze citizen ideas data:

Total Ideas: ${ideas.length}
Categories: ${JSON.stringify(categoryCounts)}
Top Voted Ideas: ${topIdeas.map(i => i.title).join(', ')}

Generate:
1. Top 3 emerging themes/trends
2. 3 strategic recommendations
3. Risk areas to monitor
4. Predicted trends for next quarter`,
      response_json_schema: {
        type: 'object',
        properties: {
          emerging_themes: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          risk_areas: { type: 'array', items: { type: 'string' } },
          predictions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success && result.data) {
      setInsights(result.data);
    }
  };

  // Prepare time series data
  const monthlyData = ideas.reduce((acc, idea) => {
    const month = new Date(idea.created_date).toLocaleDateString('en', { year: 'numeric', month: 'short' });
    const existing = acc.find(d => d.month === month);
    if (existing) {
      existing.count++;
      existing.votes += (idea.vote_count || 0);
    } else {
      acc.push({ month, count: 1, votes: idea.vote_count || 0 });
    }
    return acc;
  }, []);

  // Category breakdown
  const categoryData = Object.entries(
    ideas.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([category, count]) => ({ category: category?.replace(/_/g, ' ') || 'Other', count }));

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button onClick={generateInsights} disabled={generating || !isAvailable} className="bg-purple-600">
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate', ar: 'إنشاء' })}
            </Button>
          </div>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </CardHeader>
        {insights && (
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-2">
                {t({ en: 'Emerging Themes', ar: 'المواضيع الناشئة' })}
              </p>
              <div className="space-y-2">
                {insights.emerging_themes?.map((theme, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <p className="text-sm text-slate-700">{theme}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-purple-900 mb-2">
                {t({ en: 'Strategic Recommendations', ar: 'التوصيات الاستراتيجية' })}
              </p>
              <div className="space-y-2">
                {insights.recommendations?.map((rec, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-slate-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t({ en: 'Submission Trends', ar: 'اتجاهات التقديم' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#c4b5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t({ en: 'Category Distribution', ar: 'توزيع الفئات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}