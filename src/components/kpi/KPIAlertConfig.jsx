import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Bell, Plus, Trash, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

export default function KPIAlertConfig({ kpis }) {
  const { language, isRTL, t } = useLanguage();
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      kpi: 'Pilot Success Rate',
      rule_type: 'threshold_breach',
      threshold: 70,
      recipients: ['admin@example.com'],
      frequency: 'realtime',
      enabled: true
    }
  ]);

  const addAlert = () => {
    setAlerts([...alerts, {
      id: Date.now(),
      kpi: kpis[0]?.name_en,
      rule_type: 'threshold_breach',
      threshold: 0,
      recipients: [],
      frequency: 'daily',
      enabled: true
    }]);
  };

  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const saveAlerts = () => {
    toast.success(t({ en: 'Alert rules saved', ar: 'تم حفظ قواعد التنبيه' }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t({ en: 'Alert Configuration', ar: 'تكوين التنبيهات' })}
          </CardTitle>
          <Button onClick={addAlert} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Alert', ar: 'إضافة تنبيه' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 border-2 rounded-lg bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Switch checked={alert.enabled} />
                  <Badge>{alert.kpi}</Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeAlert(alert.id)}>
                  <Trash className="h-4 w-4 text-red-600" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">{t({ en: 'Rule Type', ar: 'نوع القاعدة' })}</label>
                  <Select value={alert.rule_type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="threshold_breach">{t({ en: 'Threshold Breach', ar: 'خرق العتبة' })}</SelectItem>
                      <SelectItem value="anomaly">{t({ en: 'Anomaly Detected', ar: 'شذوذ مكتشف' })}</SelectItem>
                      <SelectItem value="forecast_miss">{t({ en: 'Forecast Miss', ar: 'فقدان التنبؤ' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">{t({ en: 'Threshold', ar: 'العتبة' })}</label>
                  <Input type="number" value={alert.threshold} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">{t({ en: 'Frequency', ar: 'التكرار' })}</label>
                  <Select value={alert.frequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">{t({ en: 'Real-time', ar: 'فوري' })}</SelectItem>
                      <SelectItem value="daily">{t({ en: 'Daily', ar: 'يومي' })}</SelectItem>
                      <SelectItem value="weekly">{t({ en: 'Weekly', ar: 'أسبوعي' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">{t({ en: 'Recipients', ar: 'المستلمون' })}</label>
                  <Input placeholder="email@example.com" className="text-sm" />
                </div>
              </div>
            </div>
          ))}

          <Button onClick={saveAlerts} className="w-full bg-blue-600">
            <Save className="h-4 w-4 mr-2" />
            {t({ en: 'Save Alert Rules', ar: 'حفظ قواعد التنبيه' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}