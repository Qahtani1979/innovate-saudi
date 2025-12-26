import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, TrendingUp } from 'lucide-react';

export default function FeatureUsageHeatmap({ data = [] }) {
  const { language, isRTL, t } = useLanguage();

  const features = [
    { name: 'Challenges', key: 'challenges', usage: 85, trend: 'up' },
    { name: 'Pilots', key: 'pilots', usage: 72, trend: 'up' },
    { name: 'Solutions', key: 'solutions', usage: 65, trend: 'stable' },
    { name: 'R&D Projects', key: 'rd', usage: 48, trend: 'down' },
    { name: 'Programs', key: 'programs', usage: 58, trend: 'up' },
    { name: 'Analytics', key: 'analytics', usage: 92, trend: 'up' },
    { name: 'Knowledge', key: 'knowledge', usage: 41, trend: 'stable' },
    { name: 'Network', key: 'network', usage: 35, trend: 'up' }
  ];

  const getColor = (usage) => {
    if (usage >= 80) return 'bg-green-500';
    if (usage >= 60) return 'bg-blue-500';
    if (usage >= 40) return 'bg-amber-500';
    return 'bg-slate-300';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          {t({ en: 'Feature Usage Heatmap', ar: 'خريطة استخدام الميزات' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((feature) => (
            <div key={feature.key} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-900">{feature.name}</p>
                {feature.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getColor(feature.usage)} transition-all duration-500`}
                    style={{ width: `${feature.usage}%` }}
                  />
                </div>
                <Badge variant="outline" className="text-xs">{feature.usage}%</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span className="text-slate-600">{t({ en: 'High (80%+)', ar: 'عالي (80%+)' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span className="text-slate-600">{t({ en: 'Good (60-79%)', ar: 'جيد (60-79%)' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-amber-500" />
            <span className="text-slate-600">{t({ en: 'Medium (40-59%)', ar: 'متوسط (40-59%)' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-slate-300" />
            <span className="text-slate-600">{t({ en: 'Low (<40%)', ar: 'منخفض (<40%)' })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
