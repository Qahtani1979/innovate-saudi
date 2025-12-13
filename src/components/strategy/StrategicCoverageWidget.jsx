import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { useStrategicCascadeValidation } from '@/hooks/useStrategicCascadeValidation';
import { Target, Beaker, Shield, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function StrategicCoverageWidget() {
  const { t } = useLanguage();
  const { coverage, isLoading } = useStrategicCascadeValidation();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-8 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const entityMetrics = [
    { 
      key: 'programs', 
      label: { en: 'Programs', ar: 'البرامج' }, 
      icon: TrendingUp, 
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    { 
      key: 'challenges', 
      label: { en: 'Challenges', ar: 'التحديات' }, 
      icon: Target, 
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    { 
      key: 'sandboxes', 
      label: { en: 'Sandboxes', ar: 'مناطق الاختبار' }, 
      icon: Shield, 
      color: 'text-amber-600',
      bg: 'bg-amber-100'
    },
    { 
      key: 'livingLabs', 
      label: { en: 'Living Labs', ar: 'المختبرات الحية' }, 
      icon: Beaker, 
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    { 
      key: 'partnerships', 
      label: { en: 'Partnerships', ar: 'الشراكات' }, 
      icon: Users, 
      color: 'text-teal-600',
      bg: 'bg-teal-100'
    }
  ];

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t({ en: 'Strategic Coverage', ar: 'التغطية الاستراتيجية' })}
          </span>
          <Badge 
            variant={coverage.overall >= 80 ? 'default' : coverage.overall >= 50 ? 'secondary' : 'destructive'}
            className="text-lg px-3"
          >
            {coverage.overall}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={coverage.overall} className="h-2" />
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {entityMetrics.map(({ key, label, icon: Icon, color, bg }) => {
            const data = coverage.byEntity?.[key] || { linked: 0, total: 0 };
            const percentage = data.total > 0 ? Math.round((data.linked / data.total) * 100) : 0;
            
            return (
              <div key={key} className={`p-3 rounded-lg ${bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-xs font-medium text-slate-700">{t(label)}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className={`text-2xl font-bold ${color}`}>{data.linked}</span>
                  <span className="text-xs text-slate-500">/{data.total}</span>
                </div>
                <Progress value={percentage} className="h-1 mt-2" />
              </div>
            );
          })}
        </div>

        {coverage.uncoveredPlans?.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">
                {t({ 
                  en: `${coverage.uncoveredPlans.length} strategic plan(s) have low coverage`, 
                  ar: `${coverage.uncoveredPlans.length} خطة استراتيجية ذات تغطية منخفضة` 
                })}
              </p>
              <p className="text-amber-700 text-xs mt-1">
                {t({ 
                  en: 'Consider linking more entities to improve strategic alignment', 
                  ar: 'فكر في ربط المزيد من الكيانات لتحسين التوافق الاستراتيجي' 
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
