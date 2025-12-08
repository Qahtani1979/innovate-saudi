import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  Building2, Users, TrendingUp, AlertCircle, TestTube, Lightbulb,
  BarChart3, MapPin, DollarSign, Briefcase, Activity
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function CityDashboard() {
  const { t, isRTL } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const cityId = urlParams.get('id');

  const { data: city, isLoading } = useQuery({
    queryKey: ['city', cityId],
    queryFn: () => base44.entities.City.get(cityId),
    enabled: !!cityId
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['city-municipalities', cityId],
    queryFn: () => base44.entities.Municipality.filter({ city_id: cityId }),
    enabled: !!cityId
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['city-challenges', cityId],
    queryFn: () => base44.entities.Challenge.filter({ city_id: cityId }),
    enabled: !!cityId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['city-pilots', cityId],
    queryFn: () => base44.entities.Pilot.filter({ city_id: cityId }),
    enabled: !!cityId
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['city-solutions', cityId],
    queryFn: () => base44.entities.Solution.filter({ city_id: cityId }),
    enabled: !!cityId
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">
      <Activity className="h-8 w-8 animate-spin text-blue-600" />
    </div>;
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
    avgGDP: city.economic_indicators?.gdp_per_capita || 0,
    unemployment: city.economic_indicators?.unemployment_rate || 0,
    keyIndustries: city.economic_indicators?.key_industries || []
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {city.name_en} {city.name_ar && `/ ${city.name_ar}`}
          </h1>
          <p className="text-slate-600 mt-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t({ en: 'City Analytics Dashboard', ar: 'لوحة تحليلات المدينة' })}
          </p>
        </div>
        <Badge className="text-lg px-4 py-2">
          {city.is_municipality ? t({ en: 'Has Municipality', ar: 'لها بلدية' }) : t({ en: 'No Municipality', ar: 'بدون بلدية' })}
        </Badge>
      </div>

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

      {/* Economic Indicators */}
      {stats.keyIndustries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              {t({ en: 'Key Industries', ar: 'الصناعات الرئيسية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.keyIndustries.map((industry, idx) => (
                <Badge key={idx} variant="outline" className="px-3 py-1">
                  {industry}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}

export default ProtectedPage(CityDashboard, { requireAdmin: true });