import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp } from 'lucide-react';

export default function FeatureUsageHeatmap() {
  const { language, isRTL, t } = useLanguage();

  const features = [
    { name: 'Challenges', usage: 89, trend: 'up' },
    { name: 'Pilots', usage: 76, trend: 'up' },
    { name: 'Solutions', usage: 65, trend: 'stable' },
    { name: 'R&D Projects', usage: 54, trend: 'up' },
    { name: 'Programs', usage: 48, trend: 'down' },
    { name: 'Sandboxes', usage: 42, trend: 'up' },
    { name: 'Living Labs', usage: 38, trend: 'stable' },
    { name: 'Matchmaker', usage: 35, trend: 'up' },
    { name: 'Reports', usage: 72, trend: 'up' },
    { name: 'Analytics', usage: 81, trend: 'up' }
  ];

  const getUsageColor = (usage) => {
    if (usage >= 75) return 'bg-green-500';
    if (usage >= 50) return 'bg-yellow-500';
    if (usage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Feature Usage Heatmap', ar: 'خريطة استخدام الميزات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Visualize feature adoption and usage patterns', ar: 'تصور اعتماد الميزات وأنماط الاستخدام' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {Math.round(features.reduce((sum, f) => sum + f.usage, 0) / features.length)}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Average Usage', ar: 'متوسط الاستخدام' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {features.filter(f => f.trend === 'up').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Growing Features', ar: 'ميزات متنامية' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Feature Usage', ar: 'استخدام الميزات' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.map(feature => (
            <div key={feature.name} className="flex items-center gap-3">
              <div className="w-32 text-sm font-medium text-slate-900">{feature.name}</div>
              <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                <div 
                  className={`h-full ${getUsageColor(feature.usage)} transition-all`}
                  style={{ width: `${feature.usage}%` }}
                />
              </div>
              <div className="w-16 text-sm font-bold text-slate-900 text-right">{feature.usage}%</div>
              <div className="w-12">
                {feature.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
