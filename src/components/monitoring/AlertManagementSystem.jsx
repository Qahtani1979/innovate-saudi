import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Bell, AlertTriangle } from 'lucide-react';

export default function AlertManagementSystem() {
  const { t } = useLanguage();

  const alertTypes = [
    { type: 'Error Rate Spike', threshold: '>5% in 5min', channel: 'Slack + Email', status: 'not_configured' },
    { type: 'Response Time Degradation', threshold: '>2s p95', channel: 'PagerDuty', status: 'not_configured' },
    { type: 'Database Connection Issues', threshold: '3 failures', channel: 'SMS + Email', status: 'not_configured' },
    { type: 'Failed Deployments', threshold: 'Any', channel: 'Slack', status: 'not_configured' },
    { type: 'Security Events', threshold: 'Any', channel: 'All', status: 'not_configured' },
    { type: 'Disk Space Low', threshold: '<10% free', channel: 'Email', status: 'not_configured' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-600" />
          {t({ en: 'Alert Management', ar: 'إدارة التنبيهات' })}
          <Badge className="ml-auto bg-red-600">Not Setup</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">No Alert System Configured</p>
              <p>Critical issues may go unnoticed</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {alertTypes.map((alert, i) => (
            <div key={i} className="p-3 border rounded-lg text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{alert.type}</span>
                <Badge variant="outline">{alert.status}</Badge>
              </div>
              <div className="text-slate-600 space-y-0.5">
                <p>Threshold: {alert.threshold}</p>
                <p>Channel: {alert.channel}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Recommended tools:</p>
          <ul className="space-y-1 ml-4">
            <li>• PagerDuty for critical alerts</li>
            <li>• Opsgenie for on-call management</li>
            <li>• Slack webhooks for team alerts</li>
            <li>• SMS gateway for urgent issues</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}