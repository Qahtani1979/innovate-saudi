import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Users, CheckCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMarketplaceAnalytics } from '@/hooks/useSolutionAnalytics';

export default function MarketplaceAnalytics() {
  const { language, t } = useLanguage();

  const { data: analytics, isLoading } = useMarketplaceAnalytics();

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const {
    totalSolutions,
    totalDeployments,
    trendingData,
    topSolutions,
    leaderboard,
    providerCount
  } = analytics || {
    totalSolutions: 0,
    totalDeployments: 0,
    trendingData: [],
    topSolutions: [],
    leaderboard: [],
    providerCount: 0
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Marketplace Analytics', ar: 'تحليلات السوق' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 text-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{totalSolutions}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Solutions', ar: 'حلول' })}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{totalDeployments}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Deployments', ar: 'عمليات النشر' })}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 text-center">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{providerCount}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Providers', ar: 'مقدمون' })}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200 text-center">
            <TrendingUp className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600">+{Math.round(totalSolutions * 0.15)}</p>
            <p className="text-xs text-slate-600">{t({ en: 'This Quarter', ar: 'هذا الربع' })}</p>
          </div>
        </div>

        {/* Trending Sectors */}
        <div>
          <h4 className="font-semibold text-sm text-slate-900 mb-3">
            {t({ en: '📈 Trending Sectors', ar: '📈 القطاعات الرائجة' })}
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendingData}>
              <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Solutions */}
        <div>
          <h4 className="font-semibold text-sm text-slate-900 mb-3">
            {t({ en: '🏆 Top Solutions by Deployments', ar: '🏆 أفضل الحلول حسب النشر' })}
          </h4>
          <div className="space-y-2">
            {topSolutions.map((sol, i) => (
              <div key={i} className="p-3 bg-white rounded border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-600">{i + 1}</Badge>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{sol.name}</p>
                    <p className="text-xs text-slate-500">
                      {sol.deployments} {t({ en: 'deployments', ar: 'نشر' })} • {sol.rating}★
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Provider Leaderboard */}
        <div>
          <h4 className="font-semibold text-sm text-slate-900 mb-3">
            {t({ en: '👥 Provider Leaderboard', ar: '👥 لوحة المتصدرين للمقدمين' })}
          </h4>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((provider, i) => (
              <div key={i} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={i === 0 ? 'bg-amber-600' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-600' : 'bg-slate-300'}>
                      #{i + 1}
                    </Badge>
                    <span className="text-sm font-medium text-slate-900">{provider.provider}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600">
                    <span>{provider.solutions} solutions</span>
                    <span>{provider.deployments} deployments</span>
                    <span>{provider.avgRating}★</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
