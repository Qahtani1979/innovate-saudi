
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Activity, TrendingDown, Shield } from 'lucide-react';
import { useScalingPlan } from '@/hooks/useScalingPlans';

export default function ScalingFailureEarlyWarning({ scalingPlanId }) {
  const { language, t } = useLanguage();

  const { data: plan } = useScalingPlan(scalingPlanId);

  const deploymentProgress = plan?.deployment_progress || [];

  const warnings = deploymentProgress.filter(d => {
    const adoptionRate = d.adoption_rate || 0;
    const targetRate = 70;
    const daysActive = Math.floor((new Date() - new Date(d.deployment_date)) / (1000 * 60 * 60 * 24));

    return adoptionRate < targetRate && daysActive > 30;
  });

  const criticalRisks = warnings.filter(w => (w.adoption_rate || 0) < 40);

  return (
    <Card className="border-2 border-orange-300">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          {t({ en: 'Scaling Failure Early Warning', ar: 'الإنذار المبكر لفشل التوسع' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-slate-50 rounded-lg border text-center">
            <Activity className="h-5 w-5 text-slate-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900">{deploymentProgress.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300 text-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-yellow-600">{warnings.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
          </div>

          <div className="p-3 bg-red-50 rounded-lg border-2 border-red-300 text-center">
            <TrendingDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{criticalRisks.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Critical', ar: 'حرج' })}</p>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-900">
              {t({ en: 'Municipalities Needing Support', ar: 'البلديات المحتاجة للدعم' })}
            </h4>
            {warnings.map((warning, idx) => {
              const isCritical = (warning.adoption_rate || 0) < 40;
              return (
                <div key={idx} className={`p-4 rounded-lg border-2 ${isCritical ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
                  }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-slate-900">{warning.municipality_name}</p>
                        <Badge className={isCritical ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                          {isCritical ? t({ en: 'CRITICAL', ar: 'حرج' }) : t({ en: 'At Risk', ar: 'في خطر' })}
                        </Badge>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-600">
                        <span>{t({ en: 'Adoption:', ar: 'الاعتماد:' })} {warning.adoption_rate || 0}%</span>
                        <span>{t({ en: 'Target:', ar: 'الهدف:' })} 70%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border mt-3">
                    <p className="text-xs font-medium text-slate-900 mb-2">
                      {t({ en: 'AI Intervention Playbook:', ar: 'دليل التدخل الذكي:' })}
                    </p>
                    <ul className="space-y-1 text-xs text-slate-700">
                      <li>→ {t({ en: 'Schedule awareness campaign with local stakeholders', ar: 'جدولة حملة توعية مع أصحاب المصلحة المحليين' })}</li>
                      <li>→ {t({ en: 'Provide 2-day intensive training for staff', ar: 'توفير تدريب مكثف لمدة يومين للموظفين' })}</li>
                      <li>→ {t({ en: 'Assign dedicated support champion', ar: 'تعيين بطل دعم مخصص' })}</li>
                    </ul>
                  </div>

                  <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-orange-600 to-red-600">
                    <Shield className="h-3 w-3 mr-1" />
                    {t({ en: 'Deploy Intervention', ar: 'نشر التدخل' })}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {warnings.length === 0 && deploymentProgress.length > 0 && (
          <div className="text-center py-6 bg-green-50 rounded-lg border-2 border-green-300">
            <p className="text-sm font-medium text-green-900">
              ✅ {t({ en: 'All deployments on track!', ar: 'جميع عمليات النشر على المسار!' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
