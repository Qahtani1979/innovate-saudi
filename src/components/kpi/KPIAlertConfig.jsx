import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Bell, Plus, Trash2, Save, Target, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import useStrategicKPI from '@/hooks/useStrategicKPI';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';

/**
 * KPIAlertConfig - Updated with Strategic KPI Thresholds
 * Gap Fix: Phase 6 specifies alerts with strategic KPI thresholds awareness
 */
export default function KPIAlertConfig({ kpis = [] }) {
  const { language, isRTL, t } = useLanguage();

  // Fetch strategic plans
  const { data: strategicPlans = [] } = useStrategicPlans();

  // Get strategic KPIs
  const { strategicKPIs, isLoading: kpisLoading } = useStrategicKPI();

  // Combine passed kpis with strategic KPIs
  const allKPIs = useMemo(() => [
    ...kpis.map(k => ({ ...k, is_strategic: false })),
    ...strategicKPIs.map(kpi => ({
      id: kpi.id,
      name_en: kpi.name_en,
      name_ar: kpi.name_ar,
      plan_id: kpi.plan_id,
      plan_name: kpi.plan_name,
      target: kpi.target,
      current: kpi.current,
      unit: kpi.unit,
      is_strategic: true
    }))
  ], [kpis, strategicKPIs]);

  const [selectedStrategicPlan, setSelectedStrategicPlan] = useState('all');

  // Filter KPIs by selected strategic plan
  const filteredKPIs = selectedStrategicPlan === 'all'
    ? allKPIs
    : allKPIs.filter(kpi => kpi.plan_id === selectedStrategicPlan || !kpi.is_strategic);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      kpi: strategicKPIs[0]?.name_en || 'Pilot Success Rate',
      kpi_id: strategicKPIs[0]?.id,
      is_strategic: true,
      rule_type: 'threshold_breach',
      threshold: 70,
      threshold_type: 'below_target_percentage',
      target_value: strategicKPIs[0]?.target || 100,
      recipients: ['admin@example.com'],
      frequency: 'realtime',
      enabled: true,
      escalate_on_breach: true,
      escalation_level: 'high'
    }
  ]);

  const ruleTypes = [
    { value: 'threshold_breach', label: { en: 'Threshold Breach', ar: 'خرق العتبة' }, icon: AlertTriangle },
    { value: 'below_target', label: { en: 'Below Target %', ar: 'أقل من الهدف%' }, icon: TrendingDown },
    { value: 'above_target', label: { en: 'Above Target', ar: 'أعلى من الهدف' }, icon: TrendingUp },
    { value: 'anomaly', label: { en: 'Anomaly Detected', ar: 'شذوذ مكتشف' }, icon: AlertTriangle },
    { value: 'forecast_miss', label: { en: 'Forecast Miss', ar: 'فقدان التنبؤ' }, icon: TrendingDown }
  ];

  const escalationLevels = [
    { value: 'low', label: { en: 'Low', ar: 'منخفض' }, color: 'bg-green-500' },
    { value: 'medium', label: { en: 'Medium', ar: 'متوسط' }, color: 'bg-amber-500' },
    { value: 'high', label: { en: 'High', ar: 'عالي' }, color: 'bg-orange-500' },
    { value: 'critical', label: { en: 'Critical (Strategic)', ar: 'حرج (استراتيجي)' }, color: 'bg-red-500' }
  ];

  const addAlert = () => {
    const defaultKpi = filteredKPIs[0];
    setAlerts([...alerts, {
      id: Date.now(),
      kpi: defaultKpi?.name_en || '',
      kpi_id: defaultKpi?.id,
      is_strategic: defaultKpi?.is_strategic || false,
      rule_type: 'threshold_breach',
      threshold: defaultKpi?.target ? Math.round(defaultKpi.target * 0.7) : 70,
      threshold_type: 'below_target_percentage',
      target_value: defaultKpi?.target || 100,
      recipients: [],
      frequency: 'daily',
      enabled: true,
      escalate_on_breach: defaultKpi?.is_strategic || false,
      escalation_level: defaultKpi?.is_strategic ? 'high' : 'medium'
    }]);
  };

  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const updateAlert = (id, field, value) => {
    setAlerts(alerts.map(a => {
      if (a.id === id) {
        const updates = { [field]: value };

        // If changing KPI, update related fields
        if (field === 'kpi') {
          const selectedKpi = allKPIs.find(k => k.name_en === value);
          if (selectedKpi) {
            updates.kpi_id = selectedKpi.id;
            updates.is_strategic = selectedKpi.is_strategic;
            updates.target_value = selectedKpi.target || 100;
            updates.threshold = Math.round((selectedKpi.target || 100) * 0.7);

            // Auto-escalate for strategic KPIs
            if (selectedKpi.is_strategic) {
              updates.escalate_on_breach = true;
              updates.escalation_level = 'high';
            }
          }
        }

        return { ...a, ...updates };
      }
      return a;
    }));
  };

  const saveAlerts = () => {
    const alertData = alerts.map(alert => ({
      ...alert,
      strategic_context: alert.is_strategic ? {
        plan_id: allKPIs.find(k => k.name_en === alert.kpi)?.plan_id,
        target_value: alert.target_value,
        auto_escalate: alert.escalate_on_breach
      } : null
    }));

    console.log('Saving alerts with strategic context:', alertData);
    toast.success(t({ en: 'Alert rules saved with strategic thresholds', ar: 'تم حفظ قواعد التنبيه مع العتبات الاستراتيجية' }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t({ en: 'Strategic KPI Alert Configuration', ar: 'تكوين تنبيهات مؤشرات الأداء الاستراتيجية' })}
            </CardTitle>
            <CardDescription>
              {t({
                en: 'Configure alerts with strategic KPI thresholds (Phase 6)',
                ar: 'تكوين التنبيهات مع عتبات مؤشرات الأداء الاستراتيجية (المرحلة 6)'
              })}
            </CardDescription>
          </div>
          <Button onClick={addAlert} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Alert', ar: 'إضافة تنبيه' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Strategic Plan Filter */}
        <div className="flex items-center gap-4 p-3 mb-4 bg-primary/5 rounded-lg border border-primary/20">
          <Target className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <label className="text-sm font-medium">{t({ en: 'Strategic Plan Context', ar: 'سياق الخطة الاستراتيجية' })}</label>
            <Select value={selectedStrategicPlan} onValueChange={setSelectedStrategicPlan}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t({ en: 'Select plan...', ar: 'اختر الخطة...' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Plans', ar: 'جميع الخطط' })}</SelectItem>
                {strategicPlans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {isRTL ? plan.name_ar : plan.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {strategicKPIs.length} {t({ en: 'strategic KPIs', ar: 'مؤشر استراتيجي' })}
          </div>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 border-2 rounded-lg ${alert.is_strategic ? 'bg-primary/5 border-primary/30' : 'bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alert.enabled}
                    onCheckedChange={(v) => updateAlert(alert.id, 'enabled', v)}
                  />
                  <Badge variant={alert.is_strategic ? 'default' : 'outline'}>{alert.kpi}</Badge>
                  {alert.is_strategic && (
                    <Badge className="bg-primary/20 text-primary">
                      <Target className="h-3 w-3 mr-1" />
                      {t({ en: 'Strategic', ar: 'استراتيجي' })}
                    </Badge>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeAlert(alert.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">{t({ en: 'KPI', ar: 'المؤشر' })}</label>
                  <Select
                    value={alert.kpi}
                    onValueChange={(v) => updateAlert(alert.id, 'kpi', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredKPIs.map(kpi => (
                        <SelectItem key={kpi.id || kpi.name_en} value={kpi.name_en}>
                          <div className="flex items-center gap-2">
                            {kpi.is_strategic && <Target className="h-3 w-3 text-primary" />}
                            <span>{kpi.name_en}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">{t({ en: 'Rule Type', ar: 'نوع القاعدة' })}</label>
                  <Select
                    value={alert.rule_type}
                    onValueChange={(v) => updateAlert(alert.id, 'rule_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleTypes.map(rule => (
                        <SelectItem key={rule.value} value={rule.value}>{t(rule.label)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    {t({ en: 'Threshold', ar: 'العتبة' })}
                    {alert.is_strategic && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (Target: {alert.target_value})
                      </span>
                    )}
                  </label>
                  <Input
                    type="number"
                    value={alert.threshold}
                    onChange={(e) => updateAlert(alert.id, 'threshold', parseInt(e.target.value))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">{t({ en: 'Frequency', ar: 'التكرار' })}</label>
                  <Select
                    value={alert.frequency}
                    onValueChange={(v) => updateAlert(alert.id, 'frequency', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">{t({ en: 'Real-time', ar: 'فوري' })}</SelectItem>
                      <SelectItem value="hourly">{t({ en: 'Hourly', ar: 'كل ساعة' })}</SelectItem>
                      <SelectItem value="daily">{t({ en: 'Daily', ar: 'يومي' })}</SelectItem>
                      <SelectItem value="weekly">{t({ en: 'Weekly', ar: 'أسبوعي' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Strategic Escalation Settings */}
              {alert.is_strategic && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">
                      {t({ en: 'Strategic KPI Escalation Settings', ar: 'إعدادات تصعيد مؤشر الأداء الاستراتيجي' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-xs">{t({ en: 'Auto-escalate on breach', ar: 'تصعيد تلقائي عند الخرق' })}</span>
                      <Switch
                        checked={alert.escalate_on_breach}
                        onCheckedChange={(v) => updateAlert(alert.id, 'escalate_on_breach', v)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">{t({ en: 'Escalation Level', ar: 'مستوى التصعيد' })}</label>
                      <Select
                        value={alert.escalation_level}
                        onValueChange={(v) => updateAlert(alert.id, 'escalation_level', v)}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {escalationLevels.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${level.color}`} />
                                {t(level.label)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-xs text-amber-600">
                    {t({
                      en: `Alert will trigger at ${alert.threshold}% of target (${alert.target_value})`,
                      ar: `سيتم تشغيل التنبيه عند ${alert.threshold}% من الهدف (${alert.target_value})`
                    })}
                  </div>
                </div>
              )}

              <div className="mt-3">
                <label className="text-xs font-medium mb-1 block">{t({ en: 'Recipients', ar: 'المستلمون' })}</label>
                <Input
                  placeholder="email@example.com"
                  className="text-sm"
                  value={alert.recipients?.join(', ') || ''}
                  onChange={(e) => updateAlert(alert.id, 'recipients', e.target.value.split(',').map(s => s.trim()))}
                />
              </div>
            </div>
          ))}

          <Button onClick={saveAlerts} className="w-full bg-blue-600">
            <Save className="h-4 w-4 mr-2" />
            {t({ en: 'Save Alert Rules with Strategic Thresholds', ar: 'حفظ قواعد التنبيه مع العتبات الاستراتيجية' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
