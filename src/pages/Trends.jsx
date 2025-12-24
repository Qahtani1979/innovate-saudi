import { useMemo } from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, TrendingDown, AlertCircle, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function TrendsPage() {
  const { language, isRTL, t } = useLanguage();
  const { useTrendsData, useInnovationPipelineData } = useAnalyticsData();

  const { data: trendsData = { trends: [], globalTrends: [] } } = useTrendsData();
  const { data: pipelineData = { challenges: [], pilots: [], solutions: [] } } = useInnovationPipelineData();

  const { trends, globalTrends } = trendsData;
  const { challenges, pilots, solutions } = pipelineData;


  // Calculate real trend data from last 6 months
  const trendData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = date.toLocaleDateString('en', { month: 'short' });

      const challengesInMonth = challenges.filter(c => {
        const created = new Date(c.created_at);
        return created >= date && created <= monthEnd;
      }).length;

      const pilotsInMonth = pilots.filter(p => {
        const created = new Date(p.created_at);
        return created >= date && created <= monthEnd;
      }).length;

      const solutionsInMonth = solutions.filter(s => {
        const created = new Date(s.created_at);
        return created >= date && created <= monthEnd;
      }).length;

      months.push({
        month: monthName,
        challenges: challengesInMonth,
        pilots: pilotsInMonth,
        solutions: solutionsInMonth
      });
    }

    return months;
  }, [challenges, pilots, solutions]);

  // Calculate growth rates
  const calculateGrowth = (data, field) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, d) => sum + d[field], 0);
    const previous = data.slice(0, 3).reduce((sum, d) => sum + d[field], 0);
    if (previous === 0) return recent > 0 ? 100 : 0;
    return Math.round(((recent - previous) / previous) * 100);
  };

  const challengeGrowth = calculateGrowth(trendData, 'challenges');
  const pilotGrowth = calculateGrowth(trendData, 'pilots');
  const solutionGrowth = calculateGrowth(trendData, 'solutions');

  // Get emerging challenges (recent high-priority ones)
  const emergingChallenges = challenges
    .filter(c => c.status === 'submitted' || c.status === 'under_review')
    .slice(0, 3);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Innovation Trends', ar: 'اتجاهات الابتكار' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Monitor innovation patterns and emerging opportunities', ar: 'مراقبة أنماط الابتكار والفرص الناشئة' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Challenge Growth', ar: 'نمو التحديات' })}</p>
                <p className={`text-3xl font-bold ${challengeGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {challengeGrowth >= 0 ? '+' : ''}{challengeGrowth}%
                </p>
              </div>
              {challengeGrowth >= 0 ? (
                <TrendingUp className="h-8 w-8 text-red-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-green-600" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
                <p className={`text-3xl font-bold ${pilotGrowth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {pilotGrowth >= 0 ? '+' : ''}{pilotGrowth}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Solution Growth', ar: 'نمو الحلول' })}</p>
                <p className={`text-3xl font-bold ${solutionGrowth >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {solutionGrowth >= 0 ? '+' : ''}{solutionGrowth}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: '6-Month Trend Analysis', ar: 'تحليل اتجاهات 6 أشهر' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="challenges" stroke="#ef4444" strokeWidth={2} name="Challenges" />
              <Line type="monotone" dataKey="pilots" stroke="#3b82f6" strokeWidth={2} name="Pilots" />
              <Line type="monotone" dataKey="solutions" stroke="#8b5cf6" strokeWidth={2} name="Solutions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              {t({ en: 'Pending Challenges', ar: 'التحديات المعلقة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergingChallenges.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  {t({ en: 'No pending challenges', ar: 'لا توجد تحديات معلقة' })}
                </p>
              ) : (
                emergingChallenges.map((challenge, i) => (
                  <div key={challenge.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-red-900">
                        {t({ en: `Challenge ${i + 1}`, ar: `تحدي ${i + 1}` })}
                      </p>
                      <Badge className="bg-red-600 text-white">{challenge.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              {t({ en: 'Global Best Practices', ar: 'أفضل الممارسات العالمية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {globalTrends.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  {t({ en: 'No global trends available', ar: 'لا توجد اتجاهات عالمية' })}
                </p>
              ) : (
                globalTrends.slice(0, 3).map((trend) => (
                  <div key={trend.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      {language === 'ar' && trend.title_ar ? trend.title_ar : trend.title_en}
                    </p>
                    {trend.source && (
                      <p className="text-xs text-slate-600 mt-1">{trend.source}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(TrendsPage, { requiredPermissions: [] });
