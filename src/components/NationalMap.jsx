import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { MapPin } from 'lucide-react';
import { useSystemEntities } from '@/hooks/useSystemData';

export default function NationalMap() {
  const { language, isRTL, t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState(null);

  const { data: municipalities = [] } = useSystemEntities('Municipality');
  const { data: regions = [] } = useSystemEntities('Region');

  const getMIIColor = (score) => {
    if (!score) return 'bg-slate-200';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const regionStats = regions.map(region => {
    const regionMunicipalities = municipalities.filter(m => m.region === region.name_en);
    const avgMII = regionMunicipalities.length > 0
      ? regionMunicipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / regionMunicipalities.length
      : 0;

    return {
      ...region,
      municipality_count: regionMunicipalities.length,
      avg_mii: Math.round(avgMII),
      municipalities: regionMunicipalities
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          {t({ en: 'National Innovation Map', ar: 'خريطة الابتكار الوطنية' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Region List */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">
              {t({ en: 'Regions', ar: 'المناطق' })}
            </h3>
            {regionStats.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${selectedRegion?.id === region.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {language === 'ar' && region.name_ar ? region.name_ar : region.name_en}
                    </p>
                    <p className="text-xs text-slate-600">
                      {region.municipality_count} {t({ en: 'municipalities', ar: 'بلدية' })}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`h-10 w-10 rounded-full ${getMIIColor(region.avg_mii)} flex items-center justify-center text-white font-bold text-sm`}>
                      {region.avg_mii}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Municipality Details */}
          <div className="lg:col-span-2">
            {selectedRegion ? (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {language === 'ar' && selectedRegion.name_ar ? selectedRegion.name_ar : selectedRegion.name_en}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    <span>{selectedRegion.municipality_count} {t({ en: 'municipalities', ar: 'بلدية' })}</span>
                    <span>{t({ en: 'Avg MII', ar: 'متوسط المؤشر' })}: {selectedRegion.avg_mii}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedRegion.municipalities.sort((a, b) => (b.mii_score || 0) - (a.mii_score || 0)).map((municipality) => (
                    <Link key={municipality.id} to={createPageUrl(`MunicipalityProfile?id=${municipality.id}`)}>
                      <div className="p-3 bg-white rounded-lg border hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 text-sm">
                              {language === 'ar' && municipality.name_ar ? municipality.name_ar : municipality.name_en}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{municipality.city_type}</Badge>
                              <span className="text-xs text-slate-500">
                                {municipality.active_challenges} {t({ en: 'challenges', ar: 'تحدي' })} •
                                {municipality.active_pilots} {t({ en: 'pilots', ar: 'تجربة' })}
                              </span>
                            </div>
                          </div>
                          <div className={`h-12 w-12 rounded-full ${getMIIColor(municipality.mii_score)} flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold">{municipality.mii_score || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MapPin className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t({ en: 'Select a region to view municipalities', ar: 'اختر منطقة لعرض البلديات' })}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
