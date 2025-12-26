
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useSandboxData } from '@/hooks/useSandboxData';

export default function SandboxPerformanceAnalytics({ sandboxId }) {
  const { language, t } = useLanguage();

  const { applications = [], incidents = [] } = useSandboxData(sandboxId);

  const successRate = applications.length > 0
    ? (applications.filter(a => a.status === 'completed' && a.outcome === 'successful').length / applications.filter(a => a.status === 'completed').length) * 100
    : 0;

  const avgApprovalTime = applications.filter(a => a.approval_date).length > 0
    ? applications.filter(a => a.approval_date).reduce((sum, a) => {
      const days = Math.floor((new Date(a.approval_date) - new Date(a.created_date)) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / applications.filter(a => a.approval_date).length
    : 0;

  const utilization = applications.filter(a => a.status === 'active').length;

  const incidentRate = applications.length > 0 ? (incidents.length / applications.length) * 100 : 0;

  const monthlyData = applications.reduce((acc, app) => {
    const month = new Date(app.created_date).toLocaleDateString('en', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{successRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{avgApprovalTime.toFixed(0)}d</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Approval', ar: 'متوسط الموافقة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-600">{utilization}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{incidentRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Incident Rate', ar: 'معدل الحوادث' })}</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Application Volume Over Time', ar: 'حجم الطلبات مع الوقت' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className={`p-4 rounded-lg border-2 ${successRate >= 80 ? 'bg-green-50 border-green-300' :
        successRate >= 60 ? 'bg-yellow-50 border-yellow-300' :
          'bg-red-50 border-red-300'
        }`}>
        <h4 className="font-semibold text-slate-900 mb-2">
          {t({ en: 'AI Performance Analysis', ar: 'تحليل الأداء الذكي' })}
        </h4>
        <p className="text-sm text-slate-700">
          {successRate >= 80
            ? t({ en: 'Sandbox performing excellently. Continue current practices and consider capacity expansion.', ar: 'منطقة التجريب تؤدي بامتياز. واصل الممارسات الحالية وضع في الاعتبار توسيع القدرة.' })
            : successRate >= 60
              ? t({ en: 'Moderate performance. Review failed projects to identify improvement areas.', ar: 'أداء متوسط. راجع المشاريع الفاشلة لتحديد مجالات التحسين.' })
              : t({ en: 'Underperforming sandbox. Recommend process review and additional regulatory support.', ar: 'منطقة تجريب ضعيفة الأداء. نوصي بمراجعة العملية ودعم تنظيمي إضافي.' })
          }
        </p>
      </div>
    </div>
  );
}