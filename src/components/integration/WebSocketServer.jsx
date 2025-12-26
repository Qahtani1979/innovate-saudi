import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Wifi, Activity, AlertCircle, CheckCircle } from 'lucide-react';

export default function WebSocketServer() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-blue-600" />
          {t({ en: 'Real-Time WebSocket Server', ar: 'خادم WebSocket الفعلي' })}
          <Badge className="ml-auto bg-red-600">Not Deployed</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">WebSocket Server Deployment Needed</p>
              <p>Backend WebSocket server for real-time notifications and updates</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium mb-3">Frontend Ready:</p>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>useWebSocketNotifications hook</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>RealTimeNotificationProvider</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Toast notification integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-amber-600" />
              <span>Polling fallback (active)</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Backend requirements:</p>
          <ul className="space-y-1 ml-4">
            <li>• WebSocket server (ws/Socket.io)</li>
            <li>• Authentication & authorization</li>
            <li>• Room/channel management</li>
            <li>• Message broadcasting</li>
            <li>• Reconnection handling</li>
            <li>• Load balancing for scale</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
