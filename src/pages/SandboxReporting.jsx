import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Shield, TrendingUp, FileText, Download, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';

function SandboxReporting() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSandbox, setSelectedSandbox] = useState('all');
  const [timeRange, setTimeRange] = useState('6m');
  const { user } = useAuth();

  // RLS: Sandbox operators see only their sandboxes, admins see all
  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes', user?.email, user?.role],
    queryFn: async () => {
      let query = supabase.from('sandboxes').select('*');
      if (user?.role !== 'admin') {
        query = query.or(`manager_email.eq.${user?.email},created_by.eq.${user?.email}`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // RLS: Applications for accessible sandboxes only
  const { data: applications = [] } = useQuery({
    queryKey: ['sandbox-applications', sandboxes.length],
    queryFn: async () => {
      const sandboxIds = sandboxes.map(s => s.id);
      const { data, error } = await supabase
        .from('sandbox_applications')
        .select('*')
        .in('sandbox_id', sandboxIds);
      if (error) throw error;
      return data || [];
    },
    enabled: sandboxes.length > 0
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pilots').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  // Filter data based on selected sandbox
  const filteredApplications = selectedSandbox === 'all' 
    ? applications 
    : applications.filter(a => a.sandbox_id === selectedSandbox);

  // Calculate utilization trends (mock data - in real scenario would be historical)
  const utilizationTrends = [
    { month: 'Jul', utilization: 45, capacity: 100 },
    { month: 'Aug', utilization: 52, capacity: 100 },
    { month: 'Sep', utilization: 61, capacity: 100 },
    { month: 'Oct', utilization: 68, capacity: 100 },
    { month: 'Nov', utilization: 73, capacity: 100 },
    { month: 'Dec', utilization: 78, capacity: 100 },
  ];

  // Exemption breakdown
  const exemptionData = {};
  filteredApplications.forEach(app => {
    if (app.requested_exemptions) {
      app.requested_exemptions.forEach(exemption => {
        exemptionData[exemption] = (exemptionData[exemption] || 0) + 1;
      });
    }
  });

  const exemptionChartData = Object.entries(exemptionData).map(([name, count]) => ({
    name: name.length > 30 ? name.substring(0, 30) + '...' : name,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 10);

  // Project status breakdown
  const statusData = {};
  filteredApplications.forEach(app => {
    statusData[app.status] = (statusData[app.status] || 0) + 1;
  });

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Active projects summary
  const activeProjects = filteredApplications.filter(a => a.status === 'active');
  const approvedProjects = filteredApplications.filter(a => a.status === 'approved');
  const pendingProjects = filteredApplications.filter(a => a.status === 'submitted' || a.status === 'under_review');

  // Calculate metrics
  const totalCapacity = sandboxes.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const totalUsed = sandboxes.reduce((sum, s) => sum + (s.current_pilots || 0), 0);
  const overallUtilization = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Sandbox Analytics & Reports', ar: 'تحليلات وتقارير مناطق الاختبار' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Advanced reporting and insights', ar: 'تقارير ورؤى متقدمة' })}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Download className="h-4 w-4 mr-2" />
          {t({ en: 'Export Report', ar: 'تصدير التقرير' })}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Sandbox', ar: 'منطقة الاختبار' })}
              </label>
              <Select value={selectedSandbox} onValueChange={setSelectedSandbox}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Sandboxes', ar: 'جميع المناطق' })}</SelectItem>
                  {sandboxes.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Time Range', ar: 'النطاق الزمني' })}
              </label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">{t({ en: '3 Months', ar: '3 أشهر' })}</SelectItem>
                  <SelectItem value="6m">{t({ en: '6 Months', ar: '6 أشهر' })}</SelectItem>
                  <SelectItem value="1y">{t({ en: '1 Year', ar: 'سنة' })}</SelectItem>
                  <SelectItem value="all">{t({ en: 'All Time', ar: 'كل الوقت' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                {t({ en: 'Custom Range', ar: 'نطاق مخصص' })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Sandboxes', ar: 'إجمالي المناطق' })}</p>
                <p className="text-3xl font-bold text-blue-600">{sandboxes.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'المشاريع النشطة' })}</p>
                <p className="text-3xl font-bold text-green-600">{activeProjects.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</p>
                <p className="text-3xl font-bold text-amber-600">{pendingProjects.length}</p>
              </div>
              <FileText className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
                <p className="text-3xl font-bold text-purple-600">{overallUtilization}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {t({ en: 'Utilization Trends Over Time', ar: 'اتجاهات الاستخدام عبر الزمن' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={utilizationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="utilization" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name={t({ en: 'Utilization %', ar: 'الاستخدام %' })}
              />
              <Line 
                type="monotone" 
                dataKey="capacity" 
                stroke="#94a3b8" 
                strokeDasharray="5 5"
                name={t({ en: 'Capacity', ar: 'السعة' })}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              {t({ 
                en: `Utilization increased by ${utilizationTrends[utilizationTrends.length-1].utilization - utilizationTrends[0].utilization}% over the last 6 months, showing strong demand for sandbox environments.`,
                ar: `ازداد الاستخدام بنسبة ${utilizationTrends[utilizationTrends.length-1].utilization - utilizationTrends[0].utilization}٪ خلال الأشهر الستة الماضية، مما يدل على طلب قوي على بيئات الاختبار.`
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exemption Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: 'Top Requested Regulatory Exemptions', ar: 'أكثر الإعفاءات التنظيمية طلباً' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exemptionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={exemptionChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-500">
                {t({ en: 'No exemption data available', ar: 'لا توجد بيانات إعفاءات' })}
              </div>
            )}
            <div className="mt-4 space-y-2">
              {exemptionChartData.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{item.name}</span>
                  <Badge variant="outline">{item.count} {t({ en: 'requests', ar: 'طلب' })}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: 'Project Status Distribution', ar: 'توزيع حالة المشاريع' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {statusChartData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm text-slate-700 capitalize">{item.name}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t({ en: 'Active Projects Summary', ar: 'ملخص المشاريع النشطة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{project.project_title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{project.applicant_organization}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-green-100 text-green-700">{project.status}</Badge>
                        <span className="text-xs text-slate-500">
                          {project.duration_months} {t({ en: 'months', ar: 'أشهر' })}
                        </span>
                        {project.start_date && (
                          <span className="text-xs text-slate-500">
                            {t({ en: 'Started:', ar: 'بدأ:' })} {project.start_date}
                          </span>
                        )}
                      </div>
                      {project.requested_exemptions && project.requested_exemptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.requested_exemptions.slice(0, 3).map((ex, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {ex.length > 25 ? ex.substring(0, 25) + '...' : ex}
                            </Badge>
                          ))}
                          {project.requested_exemptions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.requested_exemptions.length - 3} {t({ en: 'more', ar: 'أكثر' })}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                {t({ en: 'No active projects', ar: 'لا توجد مشاريع نشطة' })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sandbox Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t({ en: 'Sandbox Performance Comparison', ar: 'مقارنة أداء المناطق' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Sandbox', ar: 'المنطقة' })}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Domain', ar: 'المجال' })}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Capacity', ar: 'السعة' })}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Active', ar: 'نشط' })}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Utilization', ar: 'الاستخدام' })}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Status', ar: 'الحالة' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sandboxes.map((sandbox) => {
                  const sandboxApps = applications.filter(a => a.sandbox_id === sandbox.id && a.status === 'active').length;
                  const util = sandbox.capacity > 0 ? Math.round((sandbox.current_pilots / sandbox.capacity) * 100) : 0;
                  return (
                    <tr key={sandbox.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{sandbox.name_en}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 capitalize">
                        {sandbox.domain?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">{sandbox.capacity || 0}</td>
                      <td className="py-3 px-4 text-sm text-center">{sandbox.current_pilots || 0}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${util}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{util}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          sandbox.status === 'active' ? 'bg-green-100 text-green-700' :
                          sandbox.status === 'full' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {sandbox.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(SandboxReporting, { requiredPermissions: ['sandbox_view'] });