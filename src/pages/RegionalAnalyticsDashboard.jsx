import { useLocations } from '@/hooks/useLocations';
import { useMatchingEntities } from '@/hooks/useMatchingEntities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { MapPin, Building2, ChevronRight } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { Link } from 'react-router-dom';

function RegionalAnalyticsDashboard() {
  const { t, language } = useLanguage();

  const { useRegions, useMunicipalities } = useLocations();
  const { usePilots } = useMatchingEntities();

  const { data: regions = [] } = useRegions();
  const { data: municipalities = [] } = useMunicipalities();
  const { data: pilots = [] } = usePilots({ limit: 2000 }); // Increase limit for analytics to be safe

  const regionalData = regions.map(region => {
    const regionMunis = municipalities.filter(m => m.region_id === region.id);
    const muniIds = regionMunis.map(m => m.id);
    const regionPilots = pilots.filter(p => muniIds.includes(p.municipality_id));
    const avgMII = regionMunis.reduce((sum, m) => sum + (m.mii_score || 0), 0) / (regionMunis.length || 1);

    return {
      id: region.id,
      name: region.name_en,
      name_ar: region.name_ar,
      municipalities: regionMunis,
      municipalityCount: regionMunis.length,
      pilots: regionPilots.length,
      avgMII: Math.round(avgMII),
      population: region.population || 0
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t({ en: 'Regional Analytics Dashboard', ar: 'لوحة التحليلات الإقليمية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Regional innovation performance and coordination', ar: 'الأداء والتنسيق الإقليمي للابتكار' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Pilots by Region', ar: 'التجارب حسب المنطقة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pilots" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Average MII by Region', ar: 'متوسط المؤشر حسب المنطقة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgMII" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regionalData.map((region) => (
          <Card key={region.id}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                {language === 'ar' && region.name_ar ? region.name_ar : region.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t({ en: 'Municipalities', ar: 'البلديات' })}:</span>
                <Badge>{region.municipalityCount}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}:</span>
                <Badge className="bg-purple-600">{region.pilots}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t({ en: 'Avg MII', ar: 'متوسط المؤشر' })}:</span>
                <Badge className={region.avgMII > 50 ? 'bg-green-600' : 'bg-amber-600'}>
                  {region.avgMII}
                </Badge>
              </div>
              <Progress value={region.avgMII} className="mt-2" />

              {/* Municipality Links */}
              {region.municipalities.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {t({ en: 'Municipalities', ar: 'البلديات' })}
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {region.municipalities.map((muni) => (
                      <Link
                        key={muni.id}
                        to={`/mii-drill-down?id=${muni.id}`}
                        className="flex items-center justify-between p-2 text-sm rounded-md hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">
                            {language === 'ar' && muni.name_ar ? muni.name_ar : muni.name_en}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {muni.mii_score || 0}
                          </Badge>
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(RegionalAnalyticsDashboard, {
  requiredPermission: 'analytics_view',
  requiredRoles: ['admin', 'executive', 'deputyship_admin', 'deputyship_staff']
});
