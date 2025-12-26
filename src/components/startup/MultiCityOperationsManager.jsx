
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Building2, MapPin } from 'lucide-react';
import { useProviderSolutions, useProviderPilots, useProviderScalingPlans } from '@/hooks/useProviderPipeline';

export default function MultiCityOperationsManager({ providerId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: solutions = [] } = useProviderSolutions(providerId);
  const solutionIds = solutions.map(s => s.id);

  const { data: pilots = [] } = useProviderPilots(solutionIds);
  const { data: scalingPlans = [] } = useProviderScalingPlans(solutionIds);

  // Group deployments by city
  const deploymentsByCity = pilots.reduce((acc, pilot) => {
    const city = pilot.city_id || pilot.municipality_id;
    if (!acc[city]) {
      acc[city] = {
        city,
        pilots: [],
        solutions: new Set(),
        stages: { active: 0, completed: 0, scaled: 0 }
      };
    }
    acc[city].pilots.push(pilot);
    acc[city].solutions.add(pilot.solution_id);
    if (pilot.stage === 'active') acc[city].stages.active++;
    if (pilot.stage === 'completed') acc[city].stages.completed++;
    if (pilot.stage === 'scaled') acc[city].stages.scaled++;
    return acc;
  }, {});

  const cities = Object.values(deploymentsByCity).sort((a, b) => b.pilots.length - a.pilots.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          {t({ en: 'Multi-City Operations', ar: 'العمليات متعددة المدن' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-2xl font-bold text-blue-600">{cities.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Cities', ar: 'مدن' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <p className="text-2xl font-bold text-green-600">{pilots.filter(p => p.stage === 'active').length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <p className="text-2xl font-bold text-purple-600">{pilots.filter(p => p.stage === 'completed').length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
          </div>
          <div className="p-3 bg-teal-50 rounded">
            <p className="text-2xl font-bold text-teal-600">{scalingPlans.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Scaling', ar: 'توسع' })}</p>
          </div>
        </div>

        <div className="space-y-3">
          {cities.map((cityData, idx) => (
            <div key={idx} className="p-4 border-2 rounded-lg hover:bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-slate-900">{cityData.city}</h4>
                  <Badge variant="outline">{cityData.pilots.length} {t({ en: 'pilots', ar: 'تجارب' })}</Badge>
                </div>
                <Badge className="bg-purple-100 text-purple-700">
                  {cityData.solutions.size} {t({ en: 'solutions', ar: 'حلول' })}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded text-center">
                  <p className="font-bold text-blue-600">{cityData.stages.active}</p>
                  <p className="text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                </div>
                <div className="p-2 bg-green-50 rounded text-center">
                  <p className="font-bold text-green-600">{cityData.stages.completed}</p>
                  <p className="text-slate-600">{t({ en: 'Done', ar: 'منتهي' })}</p>
                </div>
                <div className="p-2 bg-teal-50 rounded text-center">
                  <p className="font-bold text-teal-600">{cityData.stages.scaled}</p>
                  <p className="text-slate-600">{t({ en: 'Scaled', ar: 'موسع' })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cities.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {t({ en: 'No multi-city deployments yet', ar: 'لا توجد عمليات نشر متعددة المدن بعد' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
