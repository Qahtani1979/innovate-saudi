import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';

export default function PerformanceProfiler() {
  const { t } = useLanguage();

  const metrics = [
    { name: 'API Response Time', current: 'Unknown', target: '<200ms', status: 'not_monitored' },
    { name: 'Database Query Time', current: 'Unknown', target: '<50ms', status: 'not_monitored' },
    { name: 'Page Load Time', current: 'Unknown', target: '<2s', status: 'not_monitored' },
    { name: 'Time to Interactive', current: 'Unknown', target: '<3s', status: 'not_monitored' },
    { name: 'Memory Usage', current: 'Unknown', target: '<512MB', status: 'not_monitored' },
    { name: 'CPU Usage', current: 'Unknown', target: '<70%', status: 'not_monitored' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Performance Profiler', ar: 'محلل الأداء' })}
          <Badge className="ml-auto bg-red-600">Not Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">No Performance Monitoring</p>
              <p>Unable to track or optimize system performance</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {metrics.map((metric, i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded text-xs">
              <div>
                <p className="font-medium">{metric.name}</p>
                <p className="text-slate-600">Target: {metric.target}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-900">{metric.current}</p>
                <Badge variant="outline" className="mt-1">{metric.status}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">APM tools needed:</p>
          <ul className="space-y-1 ml-4">
            <li>• New Relic APM</li>
            <li>• Datadog APM</li>
            <li>• Elastic APM</li>
            <li>• Custom profiling endpoints</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}