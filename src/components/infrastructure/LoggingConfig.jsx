import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { FileText, AlertCircle } from 'lucide-react';

export default function LoggingConfig() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-600" />
          {t({ en: 'Centralized Logging', ar: 'التسجيل المركزي' })}
          <Badge className="ml-auto bg-amber-600">Partial</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Structured Logging Needed</p>
              <p>Centralized logging system for better debugging and monitoring</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Application Logs</p>
              <p className="text-xs text-slate-500">Info, warning, error logs</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Access Logs</p>
              <p className="text-xs text-slate-500">API and page access</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Security Logs</p>
              <p className="text-xs text-slate-500">Auth attempts, violations</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Performance Logs</p>
              <p className="text-xs text-slate-500">Slow queries, bottlenecks</p>
            </div>
            <Switch disabled />
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Recommended tools:</p>
          <ul className="space-y-1 ml-4">
            <li>• ELK Stack (Elasticsearch, Logstash, Kibana)</li>
            <li>• Datadog or New Relic</li>
            <li>• CloudWatch Logs (AWS)</li>
            <li>• Structured JSON logging</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}