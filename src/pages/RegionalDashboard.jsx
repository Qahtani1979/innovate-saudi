import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  MapPin, Building2, AlertCircle,
  TestTube, Activity, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useRegions } from '@/hooks/useRegions';
import { useLocations } from '@/hooks/useLocations';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';

function RegionalDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState(null);

  const { data: regions = [] } = useRegions();
  const { data: municipalities = [] } = useLocations();
  const { data: challenges = [] } = useChallengesWithVisibility();
  const { data: pilots = [] } = usePilotsWithVisibility();
  const { data: solutions = [] } = useSolutionsWithVisibility();
  const { data: programs = [] } = useProgramsWithVisibility();

  // Calculate regional metrics
  const regionalMetrics = regions.map(region => {
    const regionMunicipalities = municipalities.filter(m => m.region_id === region.id);
    const municipalityIds = regionMunicipalities.map(m => m.id);

    const regionChallenges = challenges.filter(c => municipalityIds.includes(c.municipality_id));
    const regionPilots = pilots.filter(p => municipalityIds.includes(p.municipality_id));
    const regionPrograms = programs.filter(p =>
      p.region_targets?.includes(region.id) || p.municipality_targets?.some(m => municipalityIds.includes(m))
    );

    const avgMII = regionMunicipalities.length > 0
      ? regionMunicipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / regionMunicipalities.length
      : 0;

    const activePilots = regionPilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length;
    const resolvedChallenges = regionChallenges.filter(c => c.status === 'resolved').length;
    const resolutionRate = regionChallenges.length > 0
      ? (resolvedChallenges / regionChallenges.length) * 100
      : 0;

    return {
      ...region,
      municipalityCount: regionMunicipalities.length,
      totalChallenges: regionChallenges.length,
      openChallenges: regionChallenges.filter(c => !['resolved', 'archived'].includes(c.status)).length,
      resolvedChallenges,
      resolutionRate,
      totalPilots: regionPilots.length,
      activePilots,
      completedPilots: regionPilots.filter(p => p.stage === 'completed').length,
      activePrograms: regionPrograms.length,
      avgMII,
      municipalities: regionMunicipalities
    };
  });

  const currentRegion = selectedRegion
    ? regionalMetrics.find(r => r.id === selectedRegion)
    : null;

  const chartData = regionalMetrics.map(r => ({
    name: r.name_en || r.name_ar,
    challenges: r.totalChallenges,
    pilots: r.totalPilots,
    mii: Math.round(r.avgMII)
  }));

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          {t({ en: '🗺️ Regional Innovation Dashboard', ar: '🗺️ لوحة الابتكار الإقليمية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Aggregate innovation metrics, challenges, and performance across regions', ar: 'مقاييس الابتكار المجمعة والتحديات والأداء عبر المناطق' })}
        </p>
      </div>

      {/* National Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{regions.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Regions', ar: 'مناطق' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{municipalities.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Municipalities', ar: 'بلديات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{challenges.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TestTube className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{pilots.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots', ar: 'تجارب' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">{programs.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Programs', ar: 'برامج' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">
              {Math.round(regionalMetrics.reduce((sum, r) => sum + r.avgMII, 0) / Math.max(regionalMetrics.length, 1))}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg MII', ar: 'متوسط MII' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Regional Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Regional Innovation Comparison', ar: 'مقارنة الابتكار الإقليمي' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="challenges" fill="#f59e0b" name={t({ en: 'Challenges', ar: 'تحديات' })} />
              <Bar dataKey="pilots" fill="#8b5cf6" name={t({ en: 'Pilots', ar: 'تجارب' })} />
              <Bar dataKey="mii" fill="#10b981" name="MII" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regionalMetrics.map((region) => (
          <Card key={region.id} className="border-2 hover:border-blue-300 transition-all">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{region.name_en || region.name_ar}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{region.municipalityCount} municipalities</p>
                </div>
                <Badge className={
                  region.avgMII >= 75 ? 'bg-green-600' :
                    region.avgMII >= 60 ? 'bg-blue-600' :
                      region.avgMII >= 40 ? 'bg-amber-600' : 'bg-red-600'
                }>
                  MII: {Math.round(region.avgMII)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{region.openChallenges}</p>
                  <p className="text-xs text-slate-600">Open</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{region.activePilots}</p>
                  <p className="text-xs text-slate-600">Pilots</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{Math.round(region.resolutionRate)}%</p>
                  <p className="text-xs text-slate-600">Resolution</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-600">Top Municipalities:</div>
                {region.municipalities
                  .sort((a, b) => (b.mii_score || 0) - (a.mii_score || 0))
                  .slice(0, 3)
                  .map((mun, idx) => (
                    <div key={mun.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                      <Link to={createPageUrl('MunicipalityProfile') + `?id=${mun.id}`} className="text-blue-600 hover:underline">
                        {mun.name_en || mun.name_ar}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        MII: {mun.mii_score || 0}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(RegionalDashboard, { requireAdmin: true });