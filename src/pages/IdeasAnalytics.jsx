import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import { Sparkles, Loader2, CheckCircle2, Lightbulb } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function IdeasAnalytics() {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading: generatingInsights, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [aiInsights, setAiInsights] = useState(null);

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['ideas-analytics'],
    queryFn: () => base44.entities.CitizenIdea.list('-created_date', 500)
  });

  const categoryData = Object.entries(
    ideas.reduce((acc, idea) => {
      acc[idea.category] = (acc[idea.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name?.replace(/_/g, ' '), value }));

  const statusData = Object.entries(
    ideas.reduce((acc, idea) => {
      acc[idea.status] = (acc[idea.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name?.replace(/_/g, ' '), value }));

  const monthlyData = Object.entries(
    ideas.reduce((acc, idea) => {
      const month = new Date(idea.created_date).toLocaleDateString('en', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {})
  ).slice(-12).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  const stats = {
    total: ideas.length,
    thisMonth: ideas.filter(i => new Date(i.created_date) > new Date(Date.now() - 30*24*60*60*1000)).length,
    converted: ideas.filter(i => i.status === 'converted_to_challenge').length,
    conversionRate: ideas.length > 0 ? ((ideas.filter(i => i.status === 'converted_to_challenge').length / ideas.length) * 100).toFixed(1) : 0,
    avgVotes: ideas.length > 0 ? (ideas.reduce((sum, i) => sum + (i.vote_count || 0), 0) / ideas.length).toFixed(1) : 0,
    topCategory: categoryData.length > 0 ? categoryData.reduce((a, b) => a.value > b.value ? a : b).name : 'N/A'
  };

  const generateInsights = async () => {
    const topIdeas = ideas.slice(0, 10);
    const prompt = `Analyze these citizen ideas and provide strategic insights:

${topIdeas.map(i => `- ${i.title} (Category: ${i.category}, Votes: ${i.vote_count || 0})`).join('\n')}

Provide:
1. Top 3 emerging themes from citizen input
2. Recommended actions for the municipality
3. Ideas with highest potential impact (list 3)
4. Suggested improvements to the ideas submission process`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          themes: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          high_impact_ideas: { type: 'array', items: { type: 'string' } },
          process_improvements: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      setAiInsights(result.data);
      toast.success(t({ en: 'AI insights generated', ar: 'تم إنشاء الرؤى الذكية' }));
    }
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Lightbulb}
        title={{ en: 'Ideas Analytics', ar: 'تحليلات الأفكار' }}
        description={{ en: 'Insights from citizen engagement', ar: 'رؤى من مشاركة المواطنين' }}
        action={
          <Button
            onClick={generateInsights}
            disabled={generatingInsights || !isAvailable}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {generatingInsights ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
          </Button>
        }
      />
      </div>

      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total Ideas', ar: 'إجمالي الأفكار' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.thisMonth}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'This Month', ar: 'هذا الشهر' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.converted}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Converted', ar: 'محول' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-pink-600">{stats.conversionRate}%</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Conversion', ar: 'معدل التحويل' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.avgVotes}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Avg Votes', ar: 'متوسط الأصوات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-sm font-bold text-teal-600 truncate">{stats.topCategory}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Top Category', ar: 'الفئة الأعلى' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiInsights.themes?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Emerging Themes', ar: 'المواضيع الناشئة' })}</p>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.themes.map((theme, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700">{theme}</Badge>
                  ))}
                </div>
              </div>
            )}
            {aiInsights.recommendations?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Recommendations', ar: 'التوصيات' })}</p>
                <div className="space-y-2">
                  {aiInsights.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-slate-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Ideas by Category', ar: 'الأفكار حسب الفئة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Ideas by Status', ar: 'الأفكار حسب الحالة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Submission Trend', ar: 'اتجاه التقديم' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(IdeasAnalytics, { requiredPermissions: ['idea_view_all'] });