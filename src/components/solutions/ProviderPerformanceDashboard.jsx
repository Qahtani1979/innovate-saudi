import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Award, TrendingUp, DollarSign, ThumbsUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProviderPerformanceStats } from '@/hooks/useSolutionAnalytics';

export default function ProviderPerformanceDashboard({ providerId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: stats, isLoading } = useProviderPerformanceStats(providerId);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const { winRate, successRate, avgRating, totalDeployments, sectorData } = stats || {
    winRate: 0,
    successRate: 0,
    avgRating: 0,
    totalDeployments: 0,
    sectorData: []
  };

  // chartData is just sectorData from the hook
  const chartData = sectorData;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{winRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Win Rate', ar: 'معدل الفوز' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{successRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6 text-center">
            <ThumbsUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Rating', ar: 'متوسط التقييم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{totalDeployments}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Deployments', ar: 'عمليات النشر' })}</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {t({ en: 'Solutions by Sector', ar: 'الحلول حسب القطاع' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
