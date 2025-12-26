import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Bell, AlertCircle } from 'lucide-react';

export default function PushNotificationConfig() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-purple-600" />
          {t({ en: 'Push Notifications', ar: 'إشعارات الدفع' })}
          <Badge className="ml-auto bg-red-600">Not Implemented</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Push Service Required</p>
              <p>Firebase Cloud Messaging or OneSignal integration needed</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Browser Push</p>
              <p className="text-xs text-slate-500">Desktop & mobile web</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Mobile App Push</p>
              <p className="text-xs text-slate-500">iOS & Android native</p>
            </div>
            <Switch disabled />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium mb-2">Notification Types:</p>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled />
                <span>Approval requests</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled />
                <span>Task assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled />
                <span>Deadline reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" disabled />
                <span>System alerts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Implementation needs:</p>
          <ul className="space-y-1 ml-4">
            <li>• FCM or OneSignal account setup</li>
            <li>• Service worker registration</li>
            <li>• Device token management</li>
            <li>• Push scheduling & delivery</li>
            <li>• Analytics & tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
