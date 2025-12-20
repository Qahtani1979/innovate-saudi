import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Bell, AlertCircle } from 'lucide-react';

export default function AlertingSystem() {
  const { t } = useLanguage();

  const alertRules = [
    { name: 'High Error Rate', threshold: '>5% in 5min', enabled: false },
    { name: 'API Response Slow', threshold: '>500ms avg', enabled: false },
    { name: 'Database Connection Issues', threshold: '>3 failures', enabled: false },
    { name: 'Disk Space Low', threshold: '<10% free', enabled: false },
    { name: 'Failed Login Attempts', threshold: '>10 from same IP', enabled: false }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-600" />
          {t({ en: 'Alerting & Monitoring', ar: 'التنبيهات والمراقبة' })}
          <Badge className="ml-auto bg-red-600">Not Configured</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Alert System Not Configured</p>
              <p>PagerDuty, Opsgenie, or similar service needed</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {alertRules.map((rule, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{rule.name}</p>
                <p className="text-xs text-slate-500">Threshold: {rule.threshold}</p>
              </div>
              <Switch checked={rule.enabled} disabled />
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Alert channels:</p>
          <ul className="space-y-1 ml-4">
            <li>• Email notifications</li>
            <li>• Slack/Teams integration</li>
            <li>• SMS for critical alerts</li>
            <li>• On-call rotation schedule</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}