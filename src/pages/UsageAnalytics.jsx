import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Clock,
  Target,
  Activity
} from 'lucide-react';

export default function UsageAnalytics() {
  const { language, isRTL, t } = useLanguage();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['system-activities'],
    queryFn: async () => {
      const all = await base44.entities.SystemActivity.list();
      return all.slice(0, 100);
    }
  });

  // Mock data for visualization
  const weeklyActivity = [
    { week: 'W1', users: 45, actions: 234 },
    { week: 'W2', users: 52, actions: 289 },
    { week: 'W3', users: 48, actions: 267 },
    { week: 'W4', users: 61, actions: 312 }
  ];

  const featureUsage = [
    { name: 'Pilots', value: 340, color: '#3b82f6' },
    { name: 'Challenges', value: 280, color: '#ef4444' },
    { name: 'Solutions', value: 190, color: '#8b5cf6' },
    { name: 'Analytics', value: 120, color: '#10b981' }
  ];

  const roleDistribution = [
    { role: 'Admin', count: users.filter(u => u.role === 'admin').length },
    { role: 'User', count: users.filter(u => u.role === 'user').length },
    { role: 'Tech Lead', count: users.filter(u => u.special_roles?.includes('tech_lead')).length },
    { role: 'Municipality', count: users.filter(u => u.special_roles?.includes('municipality_lead')).length }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
            {t({ en: 'Usage Analytics', ar: 'تحليلات الاستخدام' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Platform adoption, engagement, and feature usage', ar: 'اعتماد المنصة والمشاركة واستخدام الميزات' })}
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Users', ar: 'إجمالي المستخدمين' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active (7d)', ar: 'نشط (7 أيام)' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{Math.floor(users.length * 0.65)}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Session', ar: 'متوسط الجلسة' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">12m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Actions/Day', ar: 'إجراءات/يوم' })}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">287</p>
              </div>
              <MousePointer className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trends */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Weekly Activity Trend', ar: 'اتجاه النشاط الأسبوعي' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Active Users" />
              <Line type="monotone" dataKey="actions" stroke="#8b5cf6" strokeWidth={2} name="Actions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Feature Usage', ar: 'استخدام الميزات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={featureUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Roles */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'User Role Distribution', ar: 'توزيع أدوار المستخدمين' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roleDistribution.map((role, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-900">{role.role}</span>
                  <Badge>{role.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Most Visited Pages', ar: 'الصفحات الأكثر زيارة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { page: 'Home', visits: 1245 },
              { page: 'Pilots', visits: 987 },
              { page: 'Challenges', visits: 856 },
              { page: 'Solutions', visits: 723 },
              { page: 'PilotDetail', visits: 612 }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-900">{item.page}</span>
                </div>
                <Badge variant="outline">{item.visits} views</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}