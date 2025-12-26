import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Activity, TrendingUp } from 'lucide-react';

export default function AIPerformanceMonitor() {
  const { language, isRTL, t } = useLanguage();
  const metrics = [
    { feature: 'Challenge Classification', accuracy: 94, usage: 1247, status: 'good' },
    { feature: 'Solution Matching', accuracy: 89, usage: 856, status: 'good' },
    { feature: 'Success Prediction', accuracy: 76, usage: 423, status: 'warning' },
    { feature: 'Budget Optimization', accuracy: 91, usage: 178, status: 'good' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t({ en: 'AI Performance Monitor', ar: 'مراقبة أداء الذكاء الاصطناعي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{metric.feature}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{metric.usage} uses</Badge>
                <Badge className={metric.status === 'good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {metric.accuracy}%
                </Badge>
              </div>
            </div>
            <Progress value={metric.accuracy} className="h-2" />
          </div>
        ))}
        
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-blue-900">{t({ en: 'Overall AI performance: Excellent', ar: 'الأداء الإجمالي للذكاء الاصطناعي: ممتاز' })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
