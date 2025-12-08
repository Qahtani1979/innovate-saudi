import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, TrendingUp, AlertCircle } from 'lucide-react';

export default function QueryMonitoringPanel() {
  const { t } = useLanguage();

  const slowQueries = [
    { query: 'Challenge list with filters', avgTime: 'Unknown', calls: 'Unknown', status: 'not_monitored' },
    { query: 'Pilot KPI aggregation', avgTime: 'Unknown', calls: 'Unknown', status: 'not_monitored' },
    { query: 'User activity feed', avgTime: 'Unknown', calls: 'Unknown', status: 'not_monitored' },
    { query: 'MII calculation query', avgTime: 'Unknown', calls: 'Unknown', status: 'not_monitored' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Query Monitoring', ar: 'مراقبة الاستعلامات' })}
          <Badge className="ml-auto bg-red-600">Not Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">No Query Performance Monitoring</p>
              <p>Cannot identify slow queries or optimization opportunities</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {slowQueries.map((q, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-1">{q.query}</p>
              <div className="grid grid-cols-3 gap-4 text-xs text-slate-600">
                <div>Avg Time: {q.avgTime}</div>
                <div>Calls/day: {q.calls}</div>
                <Badge variant="outline">{q.status}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Monitoring needs:</p>
          <ul className="space-y-1 ml-4">
            <li>• Query performance profiler</li>
            <li>• Slow query log analysis</li>
            <li>• N+1 query detection</li>
            <li>• Query plan visualization</li>
            <li>• Automatic optimization suggestions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}