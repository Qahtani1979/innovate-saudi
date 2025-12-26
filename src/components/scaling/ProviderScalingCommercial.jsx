
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  TrendingUp, DollarSign, MapPin, Clock
} from 'lucide-react';
import { useScalingPlans } from '@/hooks/useScalingPlans';

export default function ProviderScalingCommercial({ solutionId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: scalingPlans = [] } = useScalingPlans({ solutionId });

  if (scalingPlans.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            {t({ en: 'No scaling deployments yet', ar: 'لا توجد عمليات نشر توسعية بعد' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalCities = scalingPlans.reduce((sum, plan) => sum + (plan.target_cities?.length || 0), 0);
  const totalRevenue = scalingPlans.reduce((sum, plan) => sum + (plan.contract_value_total || 0), 0);
  const activeScaling = scalingPlans.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{totalCities}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Cities', ar: 'مدن' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total SAR', ar: 'إجمالي ريال' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{activeScaling}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشطة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Scaling Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {t({ en: 'Scaling Deployments', ar: 'عمليات النشر التوسعية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scalingPlans.map((plan) => (
              <Card key={plan.id} className="hover:bg-slate-50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {language === 'ar' && plan.title_ar ? plan.title_ar : plan.title_en}
                      </h4>
                      <Badge className={
                        plan.status === 'active' ? 'bg-green-600' :
                          plan.status === 'completed' ? 'bg-blue-600' :
                            'bg-slate-600'
                      } size="sm">{plan.status}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-600">Cities:</p>
                      <p className="font-semibold">{plan.target_cities?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Contract Value:</p>
                      <p className="font-semibold">{(plan.contract_value_total || 0).toLocaleString()} SAR</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Deployed:</p>
                      <p className="font-semibold">{plan.deployed_count || 0}</p>
                    </div>
                  </div>

                  {plan.target_cities && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {plan.target_cities.slice(0, 5).map((city, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {city}
                        </Badge>
                      ))}
                      {plan.target_cities.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.target_cities.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <Link to={createPageUrl(`ScalingPlanDetail?id=${plan.id}`)} className="mt-3 block">
                    <Button size="sm" variant="outline" className="w-full">
                      {t({ en: 'View Scaling Plan', ar: 'عرض خطة التوسع' })}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
