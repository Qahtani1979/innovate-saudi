import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SuccessMonitoringDashboard({ scalingPlan, municipalities = [] }) {
  const { language, isRTL, t } = useLanguage();

  // Sample KPI data per municipality
  const kpiData = municipalities.map(muni => ({
    municipality: muni.name_en,
    adoption: Math.floor(Math.random() * 100),
    satisfaction: Math.floor(Math.random() * 100),
    efficiency: Math.floor(Math.random() * 100),
    cost: Math.floor(Math.random() * 100)
  }));

  const trendData = [
    { month: 'Jan', adoption: 20, satisfaction: 60 },
    { month: 'Feb', adoption: 35, satisfaction: 65 },
    { month: 'Mar', adoption: 50, satisfaction: 70 },
    { month: 'Apr', adoption: 68, satisfaction: 75 },
    { month: 'May', adoption: 82, satisfaction: 80 },
    { month: 'Jun', adoption: 90, satisfaction: 85 }
  ];

  const avgAdoption = kpiData.length > 0 ? (kpiData.reduce((sum, m) => sum + m.adoption, 0) / kpiData.length).toFixed(0) : 0;
  const avgSatisfaction = kpiData.length > 0 ? (kpiData.reduce((sum, m) => sum + m.satisfaction, 0) / kpiData.length).toFixed(0) : 0;
  const onTrackCount = kpiData.filter(m => m.adoption >= 70).length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Adoption', ar: 'متوسط التبني' })}</p>
                <p className="text-3xl font-bold text-blue-600">{avgAdoption}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Satisfaction', ar: 'الرضا' })}</p>
                <p className="text-3xl font-bold text-green-600">{avgSatisfaction}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'On Track', ar: 'على المسار' })}</p>
                <p className="text-3xl font-bold text-green-600">{onTrackCount}/{municipalities.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
                <p className="text-3xl font-bold text-red-600">{municipalities.length - onTrackCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Adoption & Satisfaction Trends', ar: 'اتجاهات التبني والرضا' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="adoption" stroke="#3b82f6" strokeWidth={2} name="Adoption %" />
              <Line type="monotone" dataKey="satisfaction" stroke="#10b981" strokeWidth={2} name="Satisfaction %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comparative Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Municipal Performance Comparison', ar: 'مقارنة أداء البلديات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="municipality" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="adoption" fill="#3b82f6" name="Adoption %" />
              <Bar dataKey="satisfaction" fill="#10b981" name="Satisfaction %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Municipality Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Municipality Status', ar: 'حالة البلديات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kpiData.map((muni, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{muni.municipality}</h4>
                  <Badge className={muni.adoption >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {muni.adoption >= 70 ? t({ en: 'On Track', ar: 'على المسار' }) : t({ en: 'Needs Attention', ar: 'يحتاج انتباه' })}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-slate-600">{t({ en: 'Adoption', ar: 'التبني' })}</p>
                    <p className="font-bold">{muni.adoption}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">{t({ en: 'Satisfaction', ar: 'الرضا' })}</p>
                    <p className="font-bold">{muni.satisfaction}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">{t({ en: 'Efficiency', ar: 'الكفاءة' })}</p>
                    <p className="font-bold">{muni.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">{t({ en: 'Cost', ar: 'التكلفة' })}</p>
                    <p className="font-bold">{muni.cost}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}