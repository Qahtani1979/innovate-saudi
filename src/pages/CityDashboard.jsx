
import { useCityAnalytics } from '@/hooks/useCityAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  Building2, Users, TrendingUp, AlertCircle, TestTube, Lightbulb, MapPin, DollarSign, Briefcase, Activity
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useCity, useCityMunicipalities } from '@/hooks/useCityData';



function CityDashboard() {
  const { t, isRTL } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const cityId = urlParams.get('id');

  const {
    useCityChallenges,
    useCityPilots,
    useCitySolutions,
    isVisibilityLoading
  } = useCityAnalytics(cityId);

  const { data: city, isLoading: isCityLoading } = useCity(cityId);
  const { data: municipalities = [], isLoading: isMuniLoading } = useCityMunicipalities(cityId);

  const { data: challenges = [], isLoading: isChallengesLoading } = useCityChallenges();
  const { data: pilots = [], isLoading: isPilotsLoading } = useCityPilots();
  const { data: solutions = [], isLoading: isSolutionsLoading } = useCitySolutions();

  const isLoading = isCityLoading || isChallengesLoading || isPilotsLoading || isSolutionsLoading || isVisibilityLoading || isMuniLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Activity className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!city) {
    return <div className="text-center p-12">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <p className="text-slate-600">{t({ en: 'City not found', ar: 'المدينة غير موجودة' })}</p>
    </div>;
  }

  const stats = {
    population: city.population || 0,
    municipalities: municipalities.length,
    challenges: challenges.length,
    activePilots: pilots.filter(p => p.stage === 'active').length,
    solutions: solutions.length,
    // Removed economic_indicators as they are not in schema
    avgGDP: 0,
    unemployment: 0,
    keyIndustries: []
  };

  return (
    <PageLayout>
      <PageHeader
        icon={MapPin}
        title={city.name_en + (city.name_ar ? ` / ${city.name_ar}` : '')}
        subtitle={{ en: 'City Analytics Dashboard', ar: 'لوحة تحليلات المدينة' }}
        description=""
        action={
          <Badge className="text-lg px-4 py-2">
            {city.municipality_id ? t({ en: 'Has Municipality', ar: 'لها بلدية' }) : t({ en: 'No Municipality', ar: 'بدون بلدية' })}
          </Badge>
        }
        actions={null}
        stats={[
          { icon: Users, value: stats.population.toLocaleString(), label: { en: 'Population', ar: 'السكان' } },
          { icon: Building2, value: stats.municipalities, label: { en: 'Municipalities', ar: 'البلديات' } },
          { icon: AlertCircle, value: stats.challenges, label: { en: 'Challenges', ar: 'التحديات' } },
        ]}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.population.toLocaleString()}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Population', ar: 'السكان' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.municipalities}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.avgGDP.toLocaleString()}</p>
            <p className="text-sm text-slate-600">{t({ en: 'GDP per Capita (SAR)', ar: 'الناتج المحلي للفرد' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.unemployment}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Unemployment Rate', ar: 'معدل البطالة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Innovation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {t({ en: 'Innovation Performance', ar: 'أداء الابتكار' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.challenges}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'التحديات' })}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TestTube className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.activePilots}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Lightbulb className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{stats.solutions}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Removed Economic Indicators Card as per instruction */}

      {/* Municipalities List */}
      {municipalities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              {t({ en: 'Municipalities', ar: 'البلديات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {municipalities.map((muni) => (
                <div key={muni.id} className="p-3 border rounded-lg hover:bg-slate-50">
                  <h4 className="font-semibold text-slate-900">{muni.name_en} / {muni.name_ar}</h4>
                  {muni.mii_score && (
                    <p className="text-sm text-slate-600 mt-1">
                      MII Score: <span className="font-bold">{muni.mii_score}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(CityDashboard, { requireAdmin: true });
