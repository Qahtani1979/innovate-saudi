
import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function StrategicAlignmentWidget({ program }) {
  const { language, t } = useLanguage();

  const { data: strategicPlans = [] } = useStrategiesWithVisibility();

  const linkedPlans = strategicPlans.filter(p =>
    program.strategic_plan_ids?.includes(p.id)
  );

  const linkedObjectives = strategicPlans.filter(p =>
    program.strategic_objective_ids?.includes(p.id)
  );

  const alignmentScore = program.strategic_objective_ids?.length
    ? Math.min(100, (program.strategic_objective_ids.length * 20))
    : 0;

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
          <div>
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Alignment Score', ar: 'درجة التوافق' })}</p>
            <p className="text-3xl font-bold text-indigo-600">{alignmentScore}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
            <p className="text-2xl font-bold text-purple-600">{program.strategic_objective_ids?.length || 0}</p>
          </div>
        </div>

        {linkedObjectives.length > 0 ? (
          <div className="space-y-2">
            <p className="font-semibold text-sm text-slate-900">
              {t({ en: 'Contributing to Strategic Objectives:', ar: 'يساهم في الأهداف الاستراتيجية:' })}
            </p>
            {linkedObjectives.map((plan) => (
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
              {t({ en: 'Not linked to strategic objectives', ar: 'غير مرتبط بالأهداف الاستراتيجية' })}
            </p>
            <Link to={createPageUrl(`ProgramEdit?id=${program.id}`)}>
              <Button size="sm" className="mt-3" variant="outline">
                {t({ en: 'Link Objectives', ar: 'ربط الأهداف' })}
              </Button>
            </Link>
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