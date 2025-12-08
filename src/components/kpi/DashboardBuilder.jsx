import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Layout, Plus, Save, LineChart as LineChartIcon, BarChart3, Gauge } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function DashboardBuilder({ kpis }) {
  const { language, isRTL, t } = useLanguage();
  const [dashboardName, setDashboardName] = useState('');
  const [widgets, setWidgets] = useState([]);

  const widgetTypes = [
    { id: 'line', label: { en: 'Line Chart', ar: 'رسم خطي' }, icon: LineChartIcon },
    { id: 'bar', label: { en: 'Bar Chart', ar: 'رسم شريطي' }, icon: BarChart3 },
    { id: 'gauge', label: { en: 'Gauge', ar: 'مقياس' }, icon: Gauge },
    { id: 'card', label: { en: 'KPI Card', ar: 'بطاقة مؤشر' }, icon: Layout }
  ];

  const addWidget = () => {
    setWidgets([...widgets, {
      id: Date.now(),
      type: 'card',
      kpi: kpis[0]?.name_en,
      size: 'medium'
    }]);
  };

  const saveDashboard = () => {
    if (!dashboardName) {
      toast.error(t({ en: 'Please enter dashboard name', ar: 'الرجاء إدخال اسم اللوحة' }));
      return;
    }
    toast.success(t({ en: 'Dashboard saved', ar: 'تم حفظ اللوحة' }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              {t({ en: 'Dashboard Builder', ar: 'بناء اللوحة' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t({ en: 'Dashboard name...', ar: 'اسم اللوحة...' })}
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="w-48"
              />
              <Button onClick={saveDashboard} size="sm" className="bg-blue-600">
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Save', ar: 'حفظ' })}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            {widgetTypes.map(type => {
              const Icon = type.icon;
              return (
                <Button key={type.id} size="sm" variant="outline" onClick={() => {
                  setWidgets([...widgets, { id: Date.now(), type: type.id, kpi: kpis[0]?.name_en }]);
                }}>
                  <Icon className="h-4 w-4 mr-2" />
                  {type.label[language]}
                </Button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map((widget, idx) => (
              <Card key={widget.id} className="border-2 border-dashed">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge>{widget.type}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => setWidgets(widgets.filter(w => w.id !== widget.id))}>
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Select value={widget.kpi} onValueChange={(v) => {
                    const updated = [...widgets];
                    updated[idx].kpi = v;
                    setWidgets(updated);
                  }}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kpis.map(kpi => (
                        <SelectItem key={kpi.name_en} value={kpi.name_en}>{kpi.name_en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {widget.type === 'line' && (
                    <ResponsiveContainer width="100%" height={120} className="mt-3">
                      <LineChart data={[{v:10},{v:20},{v:15}]}>
                        <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  
                  {widget.type === 'card' && (
                    <div className="mt-3 p-4 bg-blue-50 rounded text-center">
                      <p className="text-3xl font-bold text-blue-600">73</p>
                      <p className="text-xs text-slate-600 mt-1">{widget.kpi}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="outline"
              className="h-full min-h-[200px] border-2 border-dashed flex flex-col items-center justify-center gap-2"
              onClick={addWidget}
            >
              <Plus className="h-8 w-8 text-slate-400" />
              <span className="text-sm text-slate-500">{t({ en: 'Add Widget', ar: 'إضافة أداة' })}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}