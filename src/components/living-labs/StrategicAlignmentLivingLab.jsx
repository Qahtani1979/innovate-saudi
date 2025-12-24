import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, CheckCircle2, AlertCircle, Microscope } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';

export default function StrategicAlignmentLivingLab({ livingLab }) {
  const { language, t } = useLanguage();

  const { data: strategicPlans = [] } = useStrategicPlans();

  const linkedPlans = strategicPlans.filter(p =>
    livingLab?.strategic_plan_ids?.includes(p.id)
  );

  const linkedObjectives = strategicPlans.flatMap(plan =>
    (plan.objectives || []).filter(obj =>
      livingLab?.strategic_objective_ids?.includes(obj.id)
    ).map(obj => ({ ...obj, planName: language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en }))
  );

  const alignmentScore = livingLab?.strategic_objective_ids?.length
    ? Math.min(100, (livingLab.strategic_objective_ids.length * 20))
    : 0;

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-teal-600" />
          {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
          {livingLab?.is_strategy_derived && (
            <Badge variant="outline" className="ml-2 bg-teal-50 text-teal-700 border-teal-300">
              <Microscope className="h-3 w-3 mr-1" />
              {t({ en: 'Strategy-Derived', ar: 'مشتق من الاستراتيجية' })}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
          <div>
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Alignment Score', ar: 'درجة التوافق' })}</p>
            <p className="text-3xl font-bold text-teal-600">{alignmentScore}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Research Priorities', ar: 'أولويات البحث' })}</p>
            <p className="text-2xl font-bold text-teal-700">{livingLab?.research_priorities?.length || 0}</p>
          </div>
        </div>

        {livingLab?.research_priorities?.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-sm text-slate-900">
              {t({ en: 'Research Priorities:', ar: 'أولويات البحث:' })}
            </p>
            <div className="flex flex-wrap gap-2">
              {livingLab.research_priorities.map((priority, idx) => (
                <Badge key={idx} variant="secondary" className="bg-teal-100 text-teal-800">
                  {priority}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {linkedPlans.length > 0 ? (
          <div className="space-y-2">
            <p className="font-semibold text-sm text-slate-900">
              {t({ en: 'Linked Strategic Plans:', ar: 'الخطط الاستراتيجية المرتبطة:' })}
            </p>
            {linkedPlans.map((plan) => (
              <div key={plan.id} className="p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="font-medium text-sm text-slate-900">
                    {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
                  </p>
                </div>
                {plan.description_en && (
                  <p className="text-xs text-slate-600 ml-6">
                    {language === 'ar' && plan.description_ar ? plan.description_ar : plan.description_en}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {t({ en: 'Not linked to strategic plans', ar: 'غير مرتبط بالخطط الاستراتيجية' })}
            </p>
            <Link to={createPageUrl(`LivingLabEdit?id=${livingLab?.id}`)}>
              <Button size="sm" className="mt-3" variant="outline">
                {t({ en: 'Link to Strategy', ar: 'ربط بالاستراتيجية' })}
              </Button>
            </Link>
          </div>
        )}

        {livingLab?.strategic_taxonomy_codes?.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-sm text-slate-900">
              {t({ en: 'Taxonomy Codes:', ar: 'رموز التصنيف:' })}
            </p>
            <div className="flex flex-wrap gap-1">
              {livingLab.strategic_taxonomy_codes.map((code, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {livingLab?.strategy_derivation_date && (
          <div className="text-xs text-slate-500 border-t pt-2">
            {t({ en: 'Derived on:', ar: 'تاريخ الاشتقاق:' })} {new Date(livingLab.strategy_derivation_date).toLocaleDateString()}
          </div>
        )}

        <Link to={createPageUrl('StrategyCockpit')}>
          <Button variant="outline" className="w-full" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t({ en: 'View Strategy Dashboard', ar: 'عرض لوحة الاستراتيجية' })}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
