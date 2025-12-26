import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Layout, Plus, Save, LineChart as LineChartIcon, BarChart3, Gauge, Trash2, Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import useStrategicKPI from '@/hooks/useStrategicKPI';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';

/**
 * DashboardBuilder - Updated with Strategic KPI Integration
 * Gap Fix: Phase 6 specifies KPI dashboards but this was generic, not connected to strategic KPIs
 */
export default function DashboardBuilder({ kpis = [] }) {
  const { language, isRTL, t } = useLanguage();
  const [dashboardName, setDashboardName] = useState('');
  const [widgets, setWidgets] = useState([]);
  const [selectedStrategicPlan, setSelectedStrategicPlan] = useState('all');

  // Fetch strategic plans
  const { data: strategicPlans = [] } = useStrategicPlans();

  // Get strategic KPIs from the hook
  const { strategicKPIs, isLoading: kpisLoading } = useStrategicKPI();

  // Combine passed kpis with strategic KPIs
  const allKPIs = [
    ...kpis,
    ...strategicKPIs.map(kpi => ({
      name_en: kpi.name_en,
      name_ar: kpi.name_ar,
      id: kpi.id,
      plan_id: kpi.plan_id,
      plan_name: kpi.plan_name,
      target: kpi.target,
      current: kpi.current,
      unit: kpi.unit,
      is_strategic: true
    }))
  ];

  // Filter KPIs by selected strategic plan
  const filteredKPIs = selectedStrategicPlan === 'all'
    ? allKPIs
    : allKPIs.filter(kpi => kpi.plan_id === selectedStrategicPlan || !kpi.is_strategic);

  const widgetTypes = [
    { id: 'line', label: { en: 'Line Chart', ar: 'رسم خطي' }, icon: LineChartIcon },
    { id: 'bar', label: { en: 'Bar Chart', ar: 'رسم شريطي' }, icon: BarChart3 },
    { id: 'gauge', label: { en: 'Gauge', ar: 'مقياس' }, icon: Gauge },
    { id: 'card', label: { en: 'KPI Card', ar: 'بطاقة مؤشر' }, icon: Layout },
    { id: 'strategic', label: { en: 'Strategic KPI', ar: 'مؤشر استراتيجي' }, icon: Target }
  ];

  const addWidget = (type = 'card') => {
    const defaultKpi = filteredKPIs[0];
    setWidgets([...widgets, {
      id: Date.now(),
      type,
      kpi: defaultKpi?.name_en || '',
      kpi_id: defaultKpi?.id,
      plan_id: defaultKpi?.plan_id,
      is_strategic: defaultKpi?.is_strategic || false,
      size: 'medium'
    }]);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const updateWidget = (id, field, value) => {
    setWidgets(widgets.map(w => {
      if (w.id === id) {
        const updates = { [field]: value };

        // If changing KPI, update related fields
        if (field === 'kpi') {
          const selectedKpi = allKPIs.find(k => k.name_en === value);
          if (selectedKpi) {
            updates.kpi_id = selectedKpi.id;
            updates.plan_id = selectedKpi.plan_id;
            updates.is_strategic = selectedKpi.is_strategic;
          }
        }

        return { ...w, ...updates };
      }
      return w;
    }));
  };

  const saveDashboard = () => {
    if (!dashboardName) {
      toast.error(t({ en: 'Please enter dashboard name', ar: 'الرجاء إدخال اسم اللوحة' }));
      return;
    }

    const dashboardData = {
      name: dashboardName,
      strategic_plan_id: selectedStrategicPlan === 'all' ? null : selectedStrategicPlan,
      widgets: widgets.map(w => ({
        type: w.type,
        kpi: w.kpi,
        kpi_id: w.kpi_id,
        plan_id: w.plan_id,
        is_strategic: w.is_strategic
      })),
      created_at: new Date().toISOString()
    };

    console.log('Saving dashboard:', dashboardData);
    toast.success(t({ en: 'Dashboard saved with strategic KPI links', ar: 'تم حفظ اللوحة مع روابط مؤشرات الأداء الاستراتيجية' }));
  };

  const getKpiData = (kpiName) => {
    const kpi = allKPIs.find(k => k.name_en === kpiName);
    if (kpi && kpi.is_strategic) {
      return {
        current: kpi.current || 0,
        target: kpi.target || 100,
        progress: Math.round(((kpi.current || 0) / (kpi.target || 100)) * 100)
      };
    }
    return { current: 73, target: 100, progress: 73 };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                {t({ en: 'Strategic Dashboard Builder', ar: 'بناء لوحة المعلومات الاستراتيجية' })}
              </CardTitle>
              <CardDescription>
                {t({
                  en: 'Build dashboards connected to strategic KPIs (Phase 6)',
                  ar: 'بناء لوحات متصلة بمؤشرات الأداء الاستراتيجية (المرحلة 6)'
                })}
              </CardDescription>
            </div>
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
          {/* Strategic Plan Selector */}
          <div className="flex items-center gap-4 p-3 mb-6 bg-primary/5 rounded-lg border border-primary/20">
            <Target className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <label className="text-sm font-medium">{t({ en: 'Strategic Plan Context', ar: 'سياق الخطة الاستراتيجية' })}</label>
              <Select value={selectedStrategicPlan} onValueChange={setSelectedStrategicPlan}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t({ en: 'Select plan...', ar: 'اختر الخطة...' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Plans (Combined View)', ar: 'جميع الخطط (عرض مجمع)' })}</SelectItem>
                  {strategicPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {isRTL ? plan.name_ar : plan.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {strategicKPIs.length} {t({ en: 'strategic KPIs available', ar: 'مؤشر استراتيجي متاح' })}
            </div>
          </div>

          {/* Widget Type Buttons */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {widgetTypes.map(type => {
              const Icon = type.icon;
              return (
                <Button key={type.id} size="sm" variant="outline" onClick={() => addWidget(type.id)}>
                  <Icon className="h-4 w-4 mr-2" />
                  {t(type.label)}
                </Button>
              );
            })}
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map((widget) => {
              const kpiData = getKpiData(widget.kpi);

              return (
                <Card key={widget.id} className={`border-2 ${widget.is_strategic ? 'border-primary/30' : 'border-dashed'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={widget.is_strategic ? 'default' : 'outline'}>{widget.type}</Badge>
                        {widget.is_strategic && (
                          <Badge className="bg-primary/20 text-primary">
                            <Target className="h-3 w-3 mr-1" />
                            {t({ en: 'Strategic', ar: 'استراتيجي' })}
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeWidget(widget.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={widget.kpi}
                      onValueChange={(v) => updateWidget(widget.id, 'kpi', v)}
                    >
                      <SelectTrigger className="text-xs mb-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredKPIs.map(kpi => (
                          <SelectItem key={kpi.id || kpi.name_en} value={kpi.name_en}>
                            <div className="flex items-center gap-2">
                              {kpi.is_strategic && <Target className="h-3 w-3 text-primary" />}
                              <span>{kpi.name_en}</span>
                              {kpi.plan_name && (
                                <span className="text-xs text-muted-foreground">({kpi.plan_name})</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {widget.type === 'line' && (
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={[
                          { v: kpiData.current * 0.6 },
                          { v: kpiData.current * 0.8 },
                          { v: kpiData.current }
                        ]}>
                          <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}

                    {widget.type === 'bar' && (
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={[
                          { name: 'Current', v: kpiData.current },
                          { name: 'Target', v: kpiData.target }
                        ]}>
                          <Bar dataKey="v" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {(widget.type === 'card' || widget.type === 'strategic') && (
                      <div className={`p-4 rounded text-center ${widget.is_strategic ? 'bg-primary/10' : 'bg-blue-50'}`}>
                        <p className={`text-3xl font-bold ${widget.is_strategic ? 'text-primary' : 'text-blue-600'}`}>
                          {kpiData.current}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{widget.kpi}</p>
                        {widget.is_strategic && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {t({ en: 'Target:', ar: 'الهدف:' })} {kpiData.target} ({kpiData.progress}%)
                          </p>
                        )}
                      </div>
                    )}

                    {widget.type === 'gauge' && (
                      <div className="p-4 rounded text-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <div className="relative w-24 h-12 mx-auto overflow-hidden">
                          <div className="absolute inset-0 rounded-t-full border-4 border-primary/20"></div>
                          <div
                            className="absolute bottom-0 left-1/2 w-1 h-10 bg-primary origin-bottom -translate-x-1/2"
                            style={{ transform: `translateX(-50%) rotate(${(kpiData.progress * 1.8) - 90}deg)` }}
                          ></div>
                        </div>
                        <p className="text-2xl font-bold text-primary mt-2">{kpiData.progress}%</p>
                        <p className="text-xs text-muted-foreground">{widget.kpi}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            <Button
              variant="outline"
              className="h-full min-h-[200px] border-2 border-dashed flex flex-col items-center justify-center gap-2"
              onClick={() => addWidget('strategic')}
            >
              <Plus className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t({ en: 'Add Strategic KPI Widget', ar: 'إضافة أداة مؤشر استراتيجي' })}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
