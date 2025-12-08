import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  TrendingUp, Users, Shield, AlertCircle, CheckCircle2, Activity
} from 'lucide-react';

export default function PermissionUsageAnalytics() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch access logs
  const { data: accessLogs = [] } = useQuery({
    queryKey: ['access-logs', timeRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));
      
      return base44.entities.AccessLog.filter({
        timestamp: { $gte: startDate.toISOString() }
      });
    }
  });

  // Calculate analytics
  const analytics = React.useMemo(() => {
    const permissionCounts = {};
    const userActivity = {};
    const deniedAttempts = [];
    const entityAccess = {};

    accessLogs.forEach(log => {
      // Count permissions
      if (!permissionCounts[log.permission]) {
        permissionCounts[log.permission] = { total: 0, denied: 0 };
      }
      permissionCounts[log.permission].total++;
      if (!log.allowed) {
        permissionCounts[log.permission].denied++;
        deniedAttempts.push(log);
      }

      // User activity
      if (!userActivity[log.user_email]) {
        userActivity[log.user_email] = { total: 0, denied: 0 };
      }
      userActivity[log.user_email].total++;
      if (!log.allowed) userActivity[log.user_email].denied++;

      // Entity access
      if (log.entity_type) {
        if (!entityAccess[log.entity_type]) {
          entityAccess[log.entity_type] = 0;
        }
        entityAccess[log.entity_type]++;
      }
    });

    return {
      permissionCounts,
      userActivity,
      deniedAttempts,
      entityAccess,
      totalRequests: accessLogs.length,
      deniedCount: deniedAttempts.length,
      successRate: ((accessLogs.length - deniedAttempts.length) / accessLogs.length * 100).toFixed(1)
    };
  }, [accessLogs]);

  // Prepare chart data
  const topPermissions = Object.entries(analytics.permissionCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([name, data]) => ({
      name: name.split('_').slice(-1)[0],
      total: data.total,
      denied: data.denied
    }));

  const entityData = Object.entries(analytics.entityAccess)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics.totalRequests}</p>
                <p className="text-xs text-slate-600">
                  {t({ en: 'Total Requests', ar: 'إجمالي الطلبات' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics.successRate}%</p>
                <p className="text-xs text-slate-600">
                  {t({ en: 'Success Rate', ar: 'معدل النجاح' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics.deniedCount}</p>
                <p className="text-xs text-slate-600">
                  {t({ en: 'Denied Attempts', ar: 'محاولات مرفوضة' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {Object.keys(analytics.permissionCounts).length}
                </p>
                <p className="text-xs text-slate-600">
                  {t({ en: 'Permissions Used', ar: 'صلاحيات مستخدمة' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t({ en: 'Top 10 Permissions Used', ar: 'أكثر 10 صلاحيات استخداماً' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPermissions}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" name="Total" />
                <Bar dataKey="denied" fill="#ef4444" name="Denied" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              {t({ en: 'Entity Access Distribution', ar: 'توزيع الوصول للكيانات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={entityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {entityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            {t({ en: 'Recent Denied Attempts', ar: 'المحاولات المرفوضة الأخيرة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.deniedAttempts.slice(0, 10).map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-sm">{log.user_email}</p>
                  <p className="text-xs text-slate-600">
                    {log.permission} on {log.entity_type}
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">Denied</Badge>
              </div>
            ))}
            {analytics.deniedAttempts.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                {t({ en: 'No denied attempts', ar: 'لا توجد محاولات مرفوضة' })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            {t({ en: 'Most Active Users', ar: 'المستخدمون الأكثر نشاطاً' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analytics.userActivity)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 10)
              .map(([email, data], i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium text-sm">{email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{data.total} requests</Badge>
                    {data.denied > 0 && (
                      <Badge variant="destructive">{data.denied} denied</Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}