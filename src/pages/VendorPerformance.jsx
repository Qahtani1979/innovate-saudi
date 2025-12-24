import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Building2, Star, TrendingUp, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useVendors } from '@/hooks/useVendors';

function VendorPerformance() {
  const { t } = useLanguage();
  const { data: vendors = [], isLoading } = useVendors();

  const topVendors = vendors
    .filter(v => v.performance_rating)
    .sort((a, b) => (b.performance_rating || 0) - (a.performance_rating || 0))
    .slice(0, 10);

  const chartData = topVendors.map(v => ({
    name: (v.name_en || v.name_ar || '').substring(0, 20),
    rating: v.performance_rating || 0,
    contracts: v.total_contracts || 0
  }));

  const stats = {
    total: vendors.length,
    top_rated: vendors.filter(v => v.performance_rating >= 4.5).length,
    active: vendors.filter(v => v.status === 'active').length,
    avg_rating: vendors.reduce((sum, v) => sum + (v.performance_rating || 0), 0) / (vendors.length || 1)
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
          {t({ en: 'Vendor Performance', ar: 'أداء الموردين' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Vendor ratings and performance analytics', ar: 'تقييمات الموردين وتحليلات الأداء' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Building2 className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Vendors', ar: 'إجمالي الموردين' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-center">
            <Star className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.top_rated}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Top Rated (4.5+)', ar: 'الأعلى تقييماً (4.5+)' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.avg_rating.toFixed(1)}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Rating', ar: 'متوسط التقييم' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Top Performing Vendors', ar: 'الموردون الأعلى أداءً' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={11} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="rating" fill="#3b82f6" name="Rating" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Vendor Leaderboard', ar: 'قائمة الموردين المتصدرين' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topVendors.map((vendor, idx) => (
              <div key={vendor.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{vendor.name_en || vendor.name_ar}</h4>
                  <p className="text-xs text-slate-500">{vendor.vendor_type?.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-lg">{vendor.performance_rating?.toFixed(1)}</span>
                </div>
                <Badge variant="outline">{vendor.total_contracts || 0} contracts</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(VendorPerformance, { requireAdmin: true });