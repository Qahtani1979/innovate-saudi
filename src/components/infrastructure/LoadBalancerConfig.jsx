import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Server, AlertCircle } from 'lucide-react';

export default function LoadBalancerConfig() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-purple-600" />
          {t({ en: 'Load Balancer', ar: 'موازن الحمل' })}
          <Badge className="ml-auto bg-red-600">Not Configured</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Single Point of Failure</p>
              <p>No load balancing or failover configured</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium mb-1">Algorithm</p>
            <p className="text-xs text-slate-600">Round Robin / Least Connections</p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium mb-1">Health Checks</p>
            <p className="text-xs text-slate-600">HTTP endpoint monitoring every 30s</p>
          </div>

          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium mb-1">Session Persistence</p>
            <p className="text-xs text-slate-600">Sticky sessions for authenticated users</p>
          </div>

          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium mb-1">Auto-Scaling</p>
            <p className="text-xs text-slate-600">Scale based on CPU/memory thresholds</p>
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Benefits:</p>
          <ul className="space-y-1 ml-4">
            <li>• High availability (99.9%+)</li>
            <li>• Automatic failover</li>
            <li>• Better performance under load</li>
            <li>• Zero-downtime deployments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}