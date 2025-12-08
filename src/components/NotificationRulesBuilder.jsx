import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from './LanguageContext';
import { Bell, Plus, Edit2, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';

function NotificationRulesBuilder() {
  const { language, isRTL, t } = useLanguage();

  const [rules, setRules] = useState([
    {
      id: '1',
      name: 'Pilot Deadline Alert',
      trigger: 'pilot_deadline_approaching',
      condition: '3 days before',
      action: 'send_email',
      recipients: ['pilot_owner', 'municipality_lead'],
      enabled: true
    },
    {
      id: '2',
      name: 'Challenge Approval Required',
      trigger: 'challenge_status_change',
      condition: 'status = submitted',
      action: 'send_notification',
      recipients: ['admin', 'gdisb_admin'],
      enabled: true
    },
    {
      id: '3',
      name: 'KPI Threshold Warning',
      trigger: 'kpi_below_threshold',
      condition: 'value < 50% of target',
      action: 'send_alert',
      recipients: ['pilot_owner', 'tech_lead'],
      enabled: true
    }
  ]);

  const handleToggle = (id) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
    toast.success(t({ en: 'Rule updated', ar: 'تم تحديث القاعدة' }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            {t({ en: 'Notification Rules', ar: 'قواعد الإشعارات' })}
          </CardTitle>
          <Button size="sm">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'New Rule', ar: 'قاعدة جديدة' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                rule.enabled ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => handleToggle(rule.id)}
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{rule.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Zap className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {rule.trigger}
                      </Badge>
                      <Badge className={rule.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                        {rule.enabled ? t({ en: 'Active', ar: 'نشط' }) : t({ en: 'Disabled', ar: 'معطل' })}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">{t({ en: 'Condition', ar: 'الشرط' })}</p>
                  <p className="text-slate-900 font-medium">{rule.condition}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">{t({ en: 'Action', ar: 'الإجراء' })}</p>
                  <p className="text-slate-900 font-medium">{rule.action}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">{t({ en: 'Recipients', ar: 'المستلمون' })}</p>
                  <div className="flex flex-wrap gap-1">
                    {rule.recipients.map((recipient, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {recipient.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationRulesBuilder;