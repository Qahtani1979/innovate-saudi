
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { MapPin, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useMunicipalitiesList } from '@/hooks/usePolicies';

export default function PolicyAdoptionMap({ policy }) {
  const { language, isRTL, t } = useLanguage();

  const { data: municipalities = [], isLoading } = useMunicipalitiesList();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const adoptedIds = policy.implementation_progress?.municipalities_adopted || [];
  const adoptedMunicipalities = municipalities.filter(m => adoptedIds.includes(m.id));
  const pendingMunicipalities = municipalities.filter(m => !adoptedIds.includes(m.id));

  const adoptionRate = municipalities.length > 0
    ? (adoptedIds.length / municipalities.length * 100).toFixed(0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          {t({ en: 'Municipality Adoption Map', ar: 'خريطة تبني البلديات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Summary */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              {t({ en: 'Adoption Progress', ar: 'تقدم التبني' })}
            </span>
            <span className="text-2xl font-bold text-blue-600">{adoptionRate}%</span>
          </div>
          <Progress value={adoptionRate} className="h-2" />
          <p className="text-xs text-slate-600 mt-2">
            {adoptedIds.length} of {municipalities.length} municipalities
          </p>
        </div>

        {/* Adopted Municipalities */}
        {adoptedMunicipalities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-green-900">
                {t({ en: 'Adopted', ar: 'متبني' })} ({adoptedMunicipalities.length})
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {adoptedMunicipalities.map(m => (
                <div key={m.id} className="p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' && m.name_ar ? m.name_ar : m.name_en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Municipalities */}
        {pendingMunicipalities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-slate-500" />
              <p className="text-sm font-semibold text-slate-900">
                {t({ en: 'Pending Adoption', ar: 'في انتظار التبني' })} ({pendingMunicipalities.length})
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {pendingMunicipalities.map(m => (
                <div key={m.id} className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center gap-2">
                  <Clock className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' && m.name_ar ? m.name_ar : m.name_en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
