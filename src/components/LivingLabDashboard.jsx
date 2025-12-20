import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Microscope, Activity, TrendingUp, Package, Calendar, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function LivingLabDashboard() {
  const { language, isRTL, t } = useLanguage();

  const { data: labs = [] } = useQuery({
    queryKey: ['living-labs'],
    queryFn: () => base44.entities.LivingLab.list()
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['lab-bookings'],
    queryFn: () => base44.entities.LivingLabBooking.list()
  });

  const { data: resourceBookings = [] } = useQuery({
    queryKey: ['resource-bookings'],
    queryFn: () => base44.entities.LivingLabResourceBooking.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  // Calculate metrics
  const activeLabs = labs.filter(l => l.status === 'active').length;
  const totalCapacity = labs.reduce((acc, lab) => acc + (lab.capacity || 0), 0);
  const usedCapacity = labs.reduce((acc, lab) => acc + (lab.current_projects || 0), 0);
  const avgUtilization = labs.length > 0 ? Math.round(labs.reduce((acc, lab) => acc + (lab.utilization_rate || 0), 0) / labs.length) : 0;
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const pendingApprovals = [...bookings.filter(b => b.status === 'pending'), ...resourceBookings.filter(b => b.status === 'pending')].length;

  // Utilization trend (simulated weekly data)
  const utilizationTrend = [
    { week: 'W-4', rate: avgUtilization - 15 },
    { week: 'W-3', rate: avgUtilization - 10 },
    { week: 'W-2', rate: avgUtilization - 5 },
    { week: 'W-1', rate: avgUtilization - 2 },
    { week: 'Now', rate: avgUtilization }
  ];

  // Lab type distribution
  const labTypeData = labs.reduce((acc, lab) => {
    const type = lab.lab_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(labTypeData).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  const COLORS = ['#8b5cf6', '#3b82f6', '#14b8a6', '#10b981', '#f59e0b', '#ef4444'];

  // Top performing labs
  const topLabs = [...labs]
    .filter(l => l.utilization_rate)
    .sort((a, b) => (b.utilization_rate || 0) - (a.utilization_rate || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Living Labs Dashboard', ar: 'لوحة قيادة المختبرات الحية' })}
        </h2>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Real-time capacity, utilization, and performance metrics', ar: 'المقاييس الفورية للسعة والاستخدام والأداء' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Labs', ar: 'المختبرات النشطة' })}</p>
                <p className="text-3xl font-bold text-purple-600">{activeLabs}</p>
              </div>
              <Microscope className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Capacity', ar: 'السعة الإجمالية' })}</p>
                <p className="text-3xl font-bold text-blue-600">{totalCapacity}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'In Use', ar: 'قيد الاستخدام' })}</p>
                <p className="text-3xl font-bold text-teal-600">{usedCapacity}</p>
              </div>
              <Activity className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Utilization', ar: 'متوسط الاستخدام' })}</p>
                <p className="text-3xl font-bold text-green-600">{avgUtilization}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'المشاريع النشطة' })}</p>
                <p className="text-3xl font-bold text-indigo-600">{activeBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
                <p className="text-3xl font-bold text-amber-600">{pendingApprovals}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Utilization Trend', ar: 'اتجاه الاستخدام' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={utilizationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lab Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Lab Type Distribution', ar: 'توزيع أنواع المختبرات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Labs */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Top Performing Labs', ar: 'المختبرات الأكثر أداءً' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topLabs.map((lab, index) => (
            <Link key={lab.id} to={createPageUrl(`LivingLabDetail?id=${lab.id}`)}>
              <div className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl font-bold text-slate-300">#{index + 1}</div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{lab.code}</Badge>
                        <Badge className="text-xs">{lab.lab_type?.replace(/_/g, ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{lab.utilization_rate}%</p>
                    <p className="text-xs text-slate-500">
                      {lab.current_projects}/{lab.capacity} {t({ en: 'projects', ar: 'مشاريع' })}
                    </p>
                  </div>
                </div>
                <Progress value={lab.utilization_rate} className="h-2 mt-3" />
              </div>
            </Link>
          ))}

          {topLabs.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No lab data available', ar: 'لا توجد بيانات متاحة' })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Real-time Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Real-time Capacity Overview', ar: 'نظرة عامة على السعة الفورية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {labs.map((lab) => (
              <div key={lab.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <Badge className={
                      lab.status === 'active' ? 'bg-green-100 text-green-700' :
                      lab.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                      lab.status === 'full' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {lab.status}
                    </Badge>
                    <p className="font-medium text-sm">
                      {language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{lab.current_projects || 0}/{lab.capacity || 0}</p>
                    <p className="text-xs text-slate-500">{lab.utilization_rate || 0}%</p>
                  </div>
                </div>
                <Progress value={lab.utilization_rate || 0} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}