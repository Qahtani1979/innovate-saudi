import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Database } from 'lucide-react';

export default function DataQualityTracker() {
  const { t } = useLanguage();

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-quality'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions-quality'],
    queryFn: () => base44.entities.Region.list()
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities-quality'],
    queryFn: () => base44.entities.City.list()
  });

  const qualityChecks = {
    municipalities: {
      total: municipalities.length,
      hasCoordinates: municipalities.filter(m => m.coordinates?.latitude).length,
      hasPopulation: municipalities.filter(m => m.population).length,
      hasContact: municipalities.filter(m => m.contact_email).length,
      hasMII: municipalities.filter(m => m.mii_score).length
    },
    regions: {
      total: regions.length,
      hasCoordinates: regions.filter(r => r.coordinates?.latitude).length,
      hasPopulation: regions.filter(r => r.population).length
    },
    cities: {
      total: cities.length,
      hasCoordinates: cities.filter(c => c.coordinates?.latitude).length,
      hasPopulation: cities.filter(c => c.population).length
    }
  };

  const overallQuality = Math.round(
    ((qualityChecks.municipalities.hasCoordinates / Math.max(qualityChecks.municipalities.total, 1)) * 100 * 0.4) +
    ((qualityChecks.municipalities.hasPopulation / Math.max(qualityChecks.municipalities.total, 1)) * 100 * 0.3) +
    ((qualityChecks.municipalities.hasContact / Math.max(qualityChecks.municipalities.total, 1)) * 100 * 0.3)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          {t({ en: 'Data Quality Status', ar: 'حالة جودة البيانات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <p className="text-sm text-slate-600 mb-2">{t({ en: 'Overall Quality', ar: 'الجودة الإجمالية' })}</p>
          <p className="text-4xl font-bold text-blue-600">{overallQuality}%</p>
          <Progress value={overallQuality} className="mt-2 h-2" />
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-sm">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span>{t({ en: 'Coordinates', ar: 'إحداثيات' })}</span>
              <Badge variant={qualityChecks.municipalities.hasCoordinates === qualityChecks.municipalities.total ? 'default' : 'outline'}>
                {qualityChecks.municipalities.hasCoordinates}/{qualityChecks.municipalities.total}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span>{t({ en: 'Population', ar: 'سكان' })}</span>
              <Badge variant={qualityChecks.municipalities.hasPopulation === qualityChecks.municipalities.total ? 'default' : 'outline'}>
                {qualityChecks.municipalities.hasPopulation}/{qualityChecks.municipalities.total}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span>{t({ en: 'Contact', ar: 'جهة اتصال' })}</span>
              <Badge variant={qualityChecks.municipalities.hasContact === qualityChecks.municipalities.total ? 'default' : 'outline'}>
                {qualityChecks.municipalities.hasContact}/{qualityChecks.municipalities.total}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span>{t({ en: 'MII Score', ar: 'نقاط MII' })}</span>
              <Badge variant={qualityChecks.municipalities.hasMII === qualityChecks.municipalities.total ? 'default' : 'outline'}>
                {qualityChecks.municipalities.hasMII}/{qualityChecks.municipalities.total}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}