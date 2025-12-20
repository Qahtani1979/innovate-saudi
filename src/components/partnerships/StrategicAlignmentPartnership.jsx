import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, CheckCircle2, AlertCircle, Handshake } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function StrategicAlignmentPartnership({ partnership }) {
  const { language, t } = useLanguage();

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-alignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const linkedPlans = strategicPlans.filter(p => 
    partnership?.strategic_plan_ids?.includes(p.id)
  );

  const linkedObjectives = strategicPlans.flatMap(plan => 
    (plan.objectives || []).filter(obj => 
      partnership?.strategic_objective_ids?.includes(obj.id)
    ).map(obj => ({ ...obj, planName: language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en }))
  );

  const alignmentScore = partnership?.strategic_objective_ids?.length 
    ? Math.min(100, (partnership.strategic_objective_ids.length * 25))
    : 0;

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
          {partnership?.strategic_plan_ids?.length > 0 && (
            <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-300">
              <Handshake className="h-3 w-3 mr-1" />
              {t({ en: 'Strategy-Linked', ar: 'مرتبط بالاستراتيجية' })}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
          <div>
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Alignment Score', ar: 'درجة التوافق' })}</p>
            <p className="text-3xl font-bold text-purple-600">{alignmentScore}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Objectives', ar: 'الأهداف' })}</p>
            <p className="text-2xl font-bold text-purple-700">{partnership?.strategic_objective_ids?.length || 0}</p>
          </div>
        </div>

        {linkedPlans.length > 0 ? (
          <div className="space-y-2">
            <p className="font-semibold text-sm text-slate-900">
              {t({ en: 'Contributing to Strategic Plans:', ar: 'يساهم في الخطط الاستراتيجية:' })}
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
            <Link to={createPageUrl(`PartnershipEdit?id=${partnership?.id}`)}>
              <Button size="sm" className="mt-3" variant="outline">
                {t({ en: 'Link to Strategy', ar: 'ربط بالاستراتيجية' })}
              </Button>
            </Link>
          </div>
        )}

        {linkedObjectives.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-sm text-slate-900">
              {t({ en: 'Strategic Objectives:', ar: 'الأهداف الاستراتيجية:' })}
            </p>
            {linkedObjectives.slice(0, 3).map((obj, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>{obj.name || obj.title}</span>
                <Badge variant="outline" className="text-xs">{obj.planName}</Badge>
              </div>
            ))}
            {linkedObjectives.length > 3 && (
              <p className="text-xs text-slate-500">
                +{linkedObjectives.length - 3} {t({ en: 'more objectives', ar: 'أهداف أخرى' })}
              </p>
            )}
          </div>
        )}

        {partnership?.strategy_derivation_date && (
          <div className="text-xs text-slate-500 border-t pt-2">
            {t({ en: 'Linked on:', ar: 'تاريخ الربط:' })} {new Date(partnership.strategy_derivation_date).toLocaleDateString()}
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
