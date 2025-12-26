import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EnhancedProgressDashboard({ program }) {
  const { language, isRTL, t } = useLanguage();

  const weeklyProgress = [
    { week: 'W1', engagement: 95, deliverables: 20, attendance: 100 },
    { week: 'W2', engagement: 92, deliverables: 40, attendance: 98 },
    { week: 'W3', engagement: 88, deliverables: 55, attendance: 94 },
    { week: 'W4', engagement: 90, deliverables: 70, attendance: 96 }
  ];

  const metrics = [
    { label: t({ en: 'Overall Progress', ar: 'التقدم الإجمالي' }), value: 68, target: 75, status: 'at_risk' },
    { label: t({ en: 'Avg Attendance', ar: 'متوسط الحضور' }), value: 94, target: 85, status: 'on_track' },
    { label: t({ en: 'Deliverables', ar: 'المخرجات' }), value: 72, target: 70, status: 'on_track' },
    { label: t({ en: 'Engagement Score', ar: 'مؤشر المشاركة' }), value: 88, target: 80, status: 'excellent' }
  ];

  const cohortHealth = [
    { category: 'Excellent', count: 8, color: 'bg-green-600' },
    { category: 'On Track', count: 15, color: 'bg-blue-600' },
    { category: 'At Risk', count: 4, color: 'bg-yellow-600' },
    { category: 'Critical', count: 1, color: 'bg-red-600' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Program Progress Dashboard', ar: 'لوحة متابعة التقدم' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">{metric.label}</p>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-2xl font-bold">{metric.value}%</p>
                <p className="text-xs text-slate-500 mb-1">/ {metric.target}%</p>
              </div>
              <Progress value={metric.value} className="h-2" />
              <Badge className={`mt-2 text-xs ${
                metric.status === 'excellent' ? 'bg-green-100 text-green-700' :
                metric.status === 'on_track' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {metric.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div>
          <h4 className="font-semibold text-sm mb-3">{t({ en: 'Weekly Trends', ar: 'الاتجاهات الأسبوعية' })}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="engagement" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="attendance" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cohort Health */}
        <div>
          <h4 className="font-semibold text-sm mb-3">{t({ en: 'Cohort Health', ar: 'صحة المجموعة' })}</h4>
          <div className="space-y-2">
            {cohortHealth.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded ${item.color}`} />
                <span className="text-sm flex-1">{item.category}</span>
                <Badge variant="outline">{item.count}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm text-yellow-900">{t({ en: 'Attention Required', ar: 'يتطلب الانتباه' })}</p>
              <p className="text-xs text-yellow-800 mt-1">{t({ en: '1 participant at critical risk, 4 need intervention', ar: 'مشارك واحد في خطر حرج، 4 يحتاجون إلى تدخل' })}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
