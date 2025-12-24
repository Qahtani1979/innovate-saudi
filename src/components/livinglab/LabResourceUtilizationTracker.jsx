import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Activity, TrendingUp, Beaker } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { useLivingLab } from '@/hooks/useLivingLab';
import { useLivingLabBookings } from '@/hooks/useLivingLabBookings';

export default function LabResourceUtilizationTracker({ labId }) {
  const { language, t } = useLanguage();

  const { data: lab } = useLivingLab(labId);
  const { data: bookings = [] } = useLivingLabBookings(labId);

  // @ts-ignore - equipment is part of the extended LivingLab type
  const totalEquipment = lab?.equipment?.length || 0;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;

  const equipmentUtilization = {};
  // @ts-ignore - equipment is part of the extended LivingLab type
  lab?.equipment?.forEach(eq => {
    // @ts-ignore - resource_name is from legacy booking structure, pending migration
    const eqBookings = bookings.filter(b => b.resource_name === eq.name);
    equipmentUtilization[eq.name] = {
      total: eqBookings.length,
      active: eqBookings.filter(b => b.status === 'active' || b.status === 'confirmed').length
    };
  });

  const utilizationData = Object.entries(equipmentUtilization)
    .map(([name, data]) => ({
      name: name.substring(0, 15),
      bookings: data.total
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 8);

  const statusData = [
    { name: 'Active', value: bookings.filter(b => b.status === 'active').length, color: '#10b981' },
    { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: '#3b82f6' },
    { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: '#8b5cf6' },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const avgUtilization = totalEquipment > 0
    ? Math.round((activeBookings / totalEquipment) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-teal-600" />
          {t({ en: 'Resource Utilization Analytics', ar: 'تحليلات استخدام الموارد' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <Beaker className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{totalEquipment}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Equipment', ar: 'معدات' })}</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <Activity className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-600">{totalBookings}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Bookings', ar: 'حجوزات' })}</p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{activeBookings}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </div>

          <div className={`p-3 rounded-lg border text-center ${avgUtilization >= 70 ? 'bg-green-50 border-green-300' :
            avgUtilization >= 40 ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
            <p className="text-xs text-slate-600 mb-1">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
            <p className="text-2xl font-bold">{avgUtilization}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {utilizationData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                {t({ en: 'Equipment Usage', ar: 'استخدام المعدات' })}
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#0d9488" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {statusData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                {t({ en: 'Booking Status', ar: 'حالة الحجوزات' })}
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-lg border-2 ${avgUtilization >= 70 ? 'bg-green-50 border-green-300' :
          avgUtilization >= 40 ? 'bg-yellow-50 border-yellow-300' :
            'bg-red-50 border-red-300'
          }`}>
          <h4 className="font-semibold text-slate-900 mb-2">
            {t({ en: 'AI Optimization Insight', ar: 'رؤية التحسين الذكي' })}
          </h4>
          <p className="text-sm text-slate-700">
            {avgUtilization >= 70
              ? t({ en: 'Excellent utilization. Lab capacity is well-optimized. Consider expansion if demand increases.', ar: 'استخدام ممتاز. سعة المختبر محسّنة بشكل جيد. ضع في الاعتبار التوسع إذا زاد الطلب.' })
              : avgUtilization >= 40
                ? t({ en: 'Moderate utilization. Promote underused equipment and consider scheduling optimization.', ar: 'استخدام متوسط. روّج للمعدات قليلة الاستخدام وضع في الاعتبار تحسين الجدولة.' })
                : t({ en: 'Low utilization detected. Recommend reviewing equipment relevance and marketing lab capabilities.', ar: 'تم اكتشاف استخدام منخفض. نوصي بمراجعة أهمية المعدات والترويج لإمكانيات المختبر.' })
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}