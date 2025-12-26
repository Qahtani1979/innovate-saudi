import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PerformanceMonitor() {
  const { t } = useLanguage();

  const data = [
    { time: '00:00', responseTime: 120 },
    { time: '04:00', responseTime: 110 },
    { time: '08:00', responseTime: 145 },
    { time: '12:00', responseTime: 180 },
    { time: '16:00', responseTime: 160 },
    { time: '20:00', responseTime: 130 }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Activity className="h-8 w-8 text-green-600" />
        {t({ en: 'Performance Monitor', ar: 'مراقب الأداء' })}
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">135ms</p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Response', ar: 'متوسط الاستجابة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">99.9%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Uptime', ar: 'وقت التشغيل' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">0.02%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Error Rate', ar: 'معدل الخطأ' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Response Time (24h)', ar: 'وقت الاستجابة (24 ساعة)' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="responseTime" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(PerformanceMonitor, { requireAdmin: true });
