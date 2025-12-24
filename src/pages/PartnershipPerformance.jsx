

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { Handshake, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

import { useOrganizationPartnerships } from '@/hooks/useOrganizationPartnerships';

function PartnershipPerformance() {
  const { t } = useLanguage();
  const { partnerships, isLoading } = useOrganizationPartnerships();

  const activePartnerships = partnerships.filter(p => p?.['status'] === 'active');

  const byType = partnerships.reduce((acc, p) => {
    const type = p?.['partnership_type'] || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(byType).map(([type, count]) => ({
    type: type.replace(/_/g, ' '),
    count
  }));

  const stats = {
    total: partnerships.length,
    active: activePartnerships.length,
    with_mou: partnerships.filter(p => p?.['mou_signed']).length,
    high_impact: partnerships.filter(p => p?.['impact_level'] === 'high').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Partnership Performance', ar: 'أداء الشراكات' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Organization partnership analytics and outcomes', ar: 'تحليلات ونتائج شراكات المنظمات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Handshake className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.with_mou}</p>
            <p className="text-xs text-slate-600">{t({ en: 'MOUs Signed', ar: 'اتفاقيات موقعة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.high_impact}</p>
            <p className="text-xs text-slate-600">{t({ en: 'High Impact', ar: 'تأثير عالي' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Partnerships by Type', ar: 'الشراكات حسب النوع' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(PartnershipPerformance, { requireAdmin: true });