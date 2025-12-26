import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BarChart3, AlertCircle } from 'lucide-react';

export default function AdvancedAnalyticsDashboard() {
  const { t } = useLanguage();

  const analyticsModules = [
    { name: 'Cohort Analysis', description: 'Track user cohorts over time', status: 'partial' },
    { name: 'Funnel Analytics', description: 'Challenge → Pilot → Scale conversion', status: 'partial' },
    { name: 'Attribution Modeling', description: 'Impact attribution to initiatives', status: 'missing' },
    { name: 'Predictive Insights', description: 'ML-powered forecasting', status: 'partial' },
    { name: 'Custom Metrics', description: 'User-defined KPIs and formulas', status: 'missing' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          {t({ en: 'Advanced Analytics', ar: 'التحليلات المتقدمة' })}
          <Badge className="ml-auto bg-amber-600">Partial</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Enhancement Opportunities</p>
              <p>More sophisticated analytics modules for deeper insights</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {analyticsModules.map((module, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{module.name}</p>
                  <p className="text-xs text-slate-600">{module.description}</p>
                </div>
                <Badge variant={module.status === 'partial' ? 'outline' : 'secondary'}>
                  {module.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
