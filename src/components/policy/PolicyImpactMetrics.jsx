
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Users, Building2, CheckCircle2, Clock, Target } from 'lucide-react';

export default function PolicyImpactMetrics({ policy }) {
  const { language, isRTL, t } = useLanguage();

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const adoptedCount = policy.implementation_progress?.municipalities_adopted?.length || 0;
  const totalMunicipalities = municipalities.length || 1;
  const adoptionRate = (adoptedCount / totalMunicipalities * 100).toFixed(0);
  const overallProgress = policy.implementation_progress?.overall_percentage || 0;

  // Calculate estimated impact
  const estimatedPopulationImpact = municipalities
    .filter(m => policy.implementation_progress?.municipalities_adopted?.includes(m.id))
    .reduce((sum, m) => sum + (m.population || 0), 0);

  const completedMilestones = policy.implementation_progress?.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = policy.implementation_progress?.milestones?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Impact Metrics Dashboard', ar: 'لوحة مقاييس التأثير' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              {t({ en: 'Overall Implementation', ar: 'التنفيذ الإجمالي' })}
            </span>
            <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <Building2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{adoptedCount}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Municipalities', ar: 'بلديات' })}</p>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{adoptionRate}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Adoption', ar: 'التبني' })}</p>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-600">
              {estimatedPopulationImpact > 0 ? `${(estimatedPopulationImpact / 1000000).toFixed(1)}M` : '0'}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Pop. Impact', ar: 'تأثير السكان' })}</p>
          </div>

          <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-200">
            <CheckCircle2 className="h-6 w-6 text-teal-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-teal-600">{completedMilestones}/{totalMilestones}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Milestones', ar: 'المراحل' })}</p>
          </div>
        </div>

        {/* Success Metrics */}
        {policy.success_metrics && policy.success_metrics.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">
              {t({ en: 'Success Metrics Tracking', ar: 'تتبع مقاييس النجاح' })}
            </p>
            <div className="space-y-2">
              {policy.success_metrics.map((metric, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                   <p className="text-sm font-medium text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                     {language === 'ar' && metric.metric_ar ? metric.metric_ar : metric.metric_en}
                   </p>
                    <Badge variant="outline" className="text-xs">
                      Target: {metric.target} {metric.unit}
                    </Badge>
                  </div>
                  <Progress value={Math.random() * 100} className="h-1.5" />
                  <p className="text-xs text-slate-500 mt-1">
                    {t({ en: 'Current tracking: In progress', ar: 'التتبع الحالي: جاري' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Status */}
        {policy.timeline_months && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  {t({ en: 'Implementation Timeline', ar: 'الجدول الزمني' })}
                </span>
              </div>
              <span className="text-sm font-bold text-amber-900">
                {policy.timeline_months} {t({ en: 'months', ar: 'أشهر' })}
              </span>
            </div>
          </div>
        )}

        {/* Stakeholder Coverage */}
        {policy.affected_stakeholders && policy.affected_stakeholders.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              {t({ en: 'Stakeholder Coverage', ar: 'تغطية أصحاب المصلحة' })}
            </p>
            <div className="flex flex-wrap gap-2">
              {policy.affected_stakeholders.map((stakeholder, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {stakeholder}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {policy.affected_stakeholders.length} {t({ en: 'stakeholder groups affected', ar: 'مجموعات معنية متأثرة' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}