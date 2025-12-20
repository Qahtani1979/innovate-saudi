import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ChallengeAnalyticsDashboard() {
  const { language, isRTL, t } = useLanguage();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  // Funnel data
  const funnelData = [
    { stage: t({ en: 'Submitted', ar: 'مقدم' }), count: challenges.filter(c => c.status === 'submitted').length },
    { stage: t({ en: 'Under Review', ar: 'قيد المراجعة' }), count: challenges.filter(c => c.status === 'under_review').length },
    { stage: t({ en: 'Approved', ar: 'موافق عليه' }), count: challenges.filter(c => c.status === 'approved').length },
    { stage: t({ en: 'In Treatment', ar: 'قيد المعالجة' }), count: challenges.filter(c => c.status === 'in_treatment').length },
    { stage: t({ en: 'Resolved', ar: 'محلول' }), count: challenges.filter(c => c.status === 'resolved').length }
  ];

  // Sector performance
  const sectorData = [...new Set(challenges.map(c => c.sector))].map(sector => ({
    name: sector?.replace(/_/g, ' ') || 'other',
    count: challenges.filter(c => c.sector === sector).length,
    resolved: challenges.filter(c => c.sector === sector && c.status === 'resolved').length
  }));

  // Track assignment
  const trackData = [
    { name: 'Pilot', value: challenges.filter(c => c.track === 'pilot').length },
    { name: 'R&D', value: challenges.filter(c => c.track === 'r_and_d').length },
    { name: 'Program', value: challenges.filter(c => c.track === 'program').length },
    { name: 'Procurement', value: challenges.filter(c => c.track === 'procurement').length },
    { name: 'Policy', value: challenges.filter(c => c.track === 'policy').length }
  ].filter(t => t.value > 0);

  // Conversion rates
  const totalApproved = challenges.filter(c => c.status === 'approved').length;
  const totalResolved = challenges.filter(c => c.status === 'resolved').length;
  const conversionRate = totalApproved > 0 ? Math.round((totalResolved / totalApproved) * 100) : 0;

  // Average resolution time
  const resolvedChallenges = challenges.filter(c => c.status === 'resolved' && c.created_date && c.resolution_date);
  const avgResolutionDays = resolvedChallenges.length > 0 
    ? Math.round(resolvedChallenges.reduce((sum, c) => {
        const days = Math.floor((new Date(c.resolution_date) - new Date(c.created_date)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / resolvedChallenges.length)
    : 0;

  // Resolution rate trends (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      resolved: challenges.filter(c => {
        if (!c.resolution_date) return false;
        const resDate = new Date(c.resolution_date);
        return resDate.getMonth() === date.getMonth() && resDate.getFullYear() === date.getFullYear();
      }).length,
      submitted: challenges.filter(c => {
        if (!c.submission_date) return false;
        const subDate = new Date(c.submission_date);
        return subDate.getMonth() === date.getMonth() && subDate.getFullYear() === date.getFullYear();
      }).length
    };
  });

  // Time-to-treatment metrics
  const avgTimeToTreatment = challenges
    .filter(c => c.submission_date && c.status === 'in_treatment')
    .reduce((sum, c) => {
      const days = Math.floor((new Date() - new Date(c.submission_date)) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / Math.max(challenges.filter(c => c.status === 'in_treatment').length, 1);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Challenge Analytics', ar: 'تحليلات التحديات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Performance metrics and conversion tracking', ar: 'مقاييس الأداء وتتبع التحويل' })}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-300">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-blue-600">{challenges.length}</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Total Challenges', ar: 'إجمالي التحديات' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-green-600">{conversionRate}%</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Resolution Rate', ar: 'معدل الحل' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-purple-600">{avgResolutionDays}</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Avg Days to Resolve', ar: 'متوسط أيام الحل' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-300">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-amber-600">{challenges.filter(c => c.status === 'approved').length}</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Active Pipeline', ar: 'الخط النشط' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Challenge Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t({ en: 'Challenge Funnel', ar: 'قمع التحديات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sector Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t({ en: 'Sector Performance', ar: 'أداء القطاعات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sectorData.slice(0, 6).map((sector, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{sector.name}</span>
                    <span className="font-medium">{sector.resolved}/{sector.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${sector.count > 0 ? (sector.resolved / sector.count) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Track Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {t({ en: 'Track Distribution', ar: 'توزيع المسارات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={trackData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                  {trackData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Rate Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t({ en: 'Resolution Rate Trends', ar: 'اتجاهات معدل الحل' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={last6Months}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="submitted" fill="#3b82f6" name="Submitted" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time to Treatment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            {t({ en: 'Time-to-Treatment Metrics', ar: 'مقاييس وقت المعالجة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-amber-600">{Math.round(avgTimeToTreatment)}</p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'Avg Days to Treatment', ar: 'متوسط أيام المعالجة' })}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">{avgResolutionDays}</p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'Avg Days to Resolve', ar: 'متوسط أيام الحل' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Municipality Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Municipality Leaderboard', ar: 'لوحة المتصدرين للبلديات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...new Set(challenges.map(c => c.municipality_id))]
              .filter(Boolean)
              .slice(0, 5)
              .map((muniId, i) => {
                const muniChallenges = challenges.filter(c => c.municipality_id === muniId);
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-600">{i + 1}</Badge>
                      <span className="font-medium text-slate-900">{muniId.substring(0, 20)}</span>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span className="text-slate-600">
                        {muniChallenges.length} {t({ en: 'total', ar: 'إجمالي' })}
                      </span>
                      <span className="text-green-600 font-medium">
                        {muniChallenges.filter(c => c.status === 'resolved').length} {t({ en: 'resolved', ar: 'محلول' })}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ChallengeAnalyticsDashboard, { requiredPermissions: [] });