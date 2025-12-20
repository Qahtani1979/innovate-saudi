import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { BarChart3, Mail, Eye, MousePointer, XCircle, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function EmailAnalyticsDashboard() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState('30');

  const startDate = subDays(new Date(), parseInt(dateRange));

  // Fetch overall stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['email-analytics-stats', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('status')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const counts = { 
        sent: 0, 
        delivered: 0, 
        opened: 0, 
        clicked: 0, 
        failed: 0, 
        bounced: 0 
      };
      
      data?.forEach(log => {
        if (log.status && counts[log.status] !== undefined) {
          counts[log.status]++;
        }
      });

      const total = data?.length || 0;
      return { ...counts, total };
    }
  });

  // Fetch category breakdown
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['email-analytics-categories', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('template_key')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const categories = {};
      data?.forEach(log => {
        const category = log.template_key?.split('_')[0] || 'other';
        categories[category] = (categories[category] || 0) + 1;
      });

      return Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    }
  });

  // Fetch time series data
  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['email-analytics-timeseries', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('created_at, status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const byDate = {};
      data?.forEach(log => {
        const date = format(new Date(log.created_at), 'MMM d');
        if (!byDate[date]) {
          byDate[date] = { date, sent: 0, opened: 0, clicked: 0 };
        }
        byDate[date].sent++;
        if (log.status === 'opened') byDate[date].opened++;
        if (log.status === 'clicked') byDate[date].clicked++;
      });

      return Object.values(byDate);
    }
  });

  // Fetch top templates
  const { data: topTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['email-analytics-templates', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('template_key, status')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const templates = {};
      data?.forEach(log => {
        const key = log.template_key || 'unknown';
        if (!templates[key]) {
          templates[key] = { template_key: key, sent: 0, opened: 0, clicked: 0 };
        }
        templates[key].sent++;
        if (log.status === 'opened') templates[key].opened++;
        if (log.status === 'clicked') templates[key].clicked++;
      });

      return Object.values(templates)
        .map(t => ({
          ...t,
          openRate: t.sent > 0 ? ((t.opened / t.sent) * 100).toFixed(1) : '0.0'
        }))
        .sort((a, b) => b.sent - a.sent)
        .slice(0, 10);
    }
  });

  const isLoading = statsLoading || categoryLoading || timeSeriesLoading || templatesLoading;

  const statCards = [
    { key: 'total', label: { en: 'Total Sent', ar: 'إجمالي المرسل' }, icon: Mail, color: 'bg-slate-100 text-slate-600' },
    { key: 'delivered', label: { en: 'Delivered', ar: 'تم التسليم' }, icon: Mail, color: 'bg-emerald-100 text-emerald-600', rate: true },
    { key: 'opened', label: { en: 'Opened', ar: 'مفتوح' }, icon: Eye, color: 'bg-blue-100 text-blue-600', rate: true },
    { key: 'clicked', label: { en: 'Clicked', ar: 'تم النقر' }, icon: MousePointer, color: 'bg-purple-100 text-purple-600', rate: true },
    { key: 'failed', label: { en: 'Failed', ar: 'فشل' }, icon: XCircle, color: 'bg-red-100 text-red-600', rate: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">{t({ en: 'Email Analytics', ar: 'تحليلات البريد' })}</h2>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">{t({ en: 'Last 7 days', ar: 'آخر 7 أيام' })}</SelectItem>
            <SelectItem value="30">{t({ en: 'Last 30 days', ar: 'آخر 30 يوم' })}</SelectItem>
            <SelectItem value="90">{t({ en: 'Last 90 days', ar: 'آخر 90 يوم' })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4">
            {statCards.map(stat => {
              const Icon = stat.icon;
              const value = stats?.[stat.key] || 0;
              const rate = stat.rate && stats?.total > 0 
                ? ((value / stats.total) * 100).toFixed(1) + '%' 
                : null;
              
              return (
                <Card key={stat.key} className={stat.color}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-5 w-5 opacity-70" />
                      {rate && <Badge variant="secondary" className="text-xs">{rate}</Badge>}
                    </div>
                    <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                    <p className="text-sm opacity-80">{t(stat.label)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  {t({ en: 'Email Volume Over Time', ar: 'حجم البريد عبر الوقت' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" fontSize={12} tick={{ fill: '#64748b' }} />
                      <YAxis fontSize={12} tick={{ fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} dot={false} name="Sent" />
                      <Line type="monotone" dataKey="opened" stroke="#10b981" strokeWidth={2} dot={false} name="Opened" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  {t({ en: 'By Category', ar: 'حسب الفئة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData?.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value) => <span className="text-sm capitalize">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Templates Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" />
                {t({ en: 'Top Performing Templates', ar: 'أفضل القوالب أداءً' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {t({ en: 'Template', ar: 'القالب' })}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        {t({ en: 'Sent', ar: 'مرسل' })}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        {t({ en: 'Opened', ar: 'مفتوح' })}
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                        {t({ en: 'Open Rate', ar: 'معدل الفتح' })}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTemplates?.map((template, idx) => (
                      <tr key={template.template_key} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {template.template_key}
                          </code>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {template.sent.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          {template.opened.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge 
                            variant="secondary" 
                            className={`${parseFloat(template.openRate) > 50 ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}
                          >
                            {template.openRate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {(!topTemplates || topTemplates.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          {t({ en: 'No email data available for this period', ar: 'لا توجد بيانات بريد لهذه الفترة' })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
