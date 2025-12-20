import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

export default function PerformanceMetrics() {
  const { t } = useLanguage();

  const metrics = [
    { name: 'Page Load Time', value: '2.3s', target: '<1.5s', status: 'warning', trend: 'down' },
    { name: 'Time to Interactive', value: '3.1s', target: '<2s', status: 'warning', trend: 'down' },
    { name: 'API Response Time', value: '180ms', target: '<100ms', status: 'good', trend: 'up' },
    { name: 'Database Query Time', value: '45ms', target: '<30ms', status: 'good', trend: 'up' },
    { name: 'Bundle Size', value: '2.8MB', target: '<1.5MB', status: 'critical', trend: 'down' },
    { name: 'Lighthouse Score', value: '78', target: '>90', status: 'warning', trend: 'up' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          {t({ en: 'Performance Metrics', ar: 'مقاييس الأداء' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 border rounded">
            <div className="flex-1">
              <p className="text-sm font-medium">{metric.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-600">Current: {metric.value}</span>
                <span className="text-xs text-slate-400">→</span>
                <span className="text-xs text-slate-600">Target: {metric.target}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {metric.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <Badge className={
                metric.status === 'good' ? 'bg-green-600' :
                metric.status === 'warning' ? 'bg-amber-600' :
                'bg-red-600'
              }>
                {metric.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}