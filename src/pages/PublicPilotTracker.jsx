import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  TestTube, MapPin, Calendar, TrendingUp, Users, Target,
  Search, Filter, Eye, Bell, CheckCircle2, AlertCircle,
  Sparkles, BarChart3, Globe
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/components/auth/AuthContext';

function PublicPilotTracker() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const { data: pilots = [], isLoading } = useQuery({
    queryKey: ['public-pilots'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*')
        .eq('is_published', true)
        .eq('is_confidential', false)
        .eq('is_deleted', false)
        .order('created_date', { ascending: false })
        .limit(100);
      return data || [];
    }
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-public'],
    queryFn: async () => {
      const { data } = await supabase.from('municipalities').select('*');
      return data || [];
    }
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await supabase.from('citizen_pilot_enrollments').select('*').eq('citizen_email', user.email);
      return data || [];
    },
    enabled: !!user?.email
  });

  const filtered = pilots.filter(p => {
    if (selectedSector !== 'all' && p.sector !== selectedSector) return false;
    if (selectedCity !== 'all' && p.municipality_id !== selectedCity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (p.title_en?.toLowerCase().includes(q) || 
              p.title_ar?.includes(q) ||
              p.code?.toLowerCase().includes(q));
    }
    return true;
  });

  const myAreaPilots = user?.municipality_id 
    ? pilots.filter(p => p.municipality_id === user.municipality_id)
    : [];

  const sectors = [...new Set(pilots.map(p => p.sector).filter(Boolean))];

  const stageColors = {
    design: 'bg-slate-100 text-slate-700',
    approved: 'bg-blue-100 text-blue-700',
    preparation: 'bg-purple-100 text-purple-700',
    active: 'bg-green-100 text-green-700',
    monitoring: 'bg-teal-100 text-teal-700',
    evaluation: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    scaled: 'bg-blue-100 text-blue-700'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="h-12 w-12" />
          <div>
            <h1 className="text-4xl font-bold">
              {t({ en: 'Public Pilot Tracker', ar: 'متتبع التجارب العامة' })}
            </h1>
            <p className="text-lg text-white/90 mt-2">
              {t({ 
                en: 'Discover innovation pilots testing solutions in your area',
                ar: 'اكتشف تجارب الابتكار التي تختبر الحلول في منطقتك'
              })}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{pilots.length}</p>
            <p className="text-sm">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{myAreaPilots.length}</p>
            <p className="text-sm">{t({ en: 'In Your Area', ar: 'في منطقتك' })}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{enrollments.length}</p>
            <p className="text-sm">{t({ en: 'Your Enrollments', ar: 'تسجيلاتك' })}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{sectors.length}</p>
            <p className="text-sm">{t({ en: 'Sectors', ar: 'قطاعات' })}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search pilots...', ar: 'بحث التجارب...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t({ en: 'All Sectors', ar: 'كل القطاعات' })}</option>
              {sectors.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t({ en: 'All Cities', ar: 'كل المدن' })}</option>
              {municipalities.map(m => (
                <option key={m.id} value={m.id}>
                  {language === 'ar' && m.name_ar ? m.name_ar : m.name_en}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {myAreaPilots.length > 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MapPin className="h-5 w-5" />
              {t({ en: 'Pilots in Your Area', ar: 'تجارب في منطقتك' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAreaPilots.slice(0, 4).map(pilot => (
                <Card key={pilot.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge className={stageColors[pilot.stage] || 'bg-slate-100'}>
                          {pilot.stage?.replace(/_/g, ' ')}
                        </Badge>
                        {pilot.sector && (
                          <Badge variant="outline" className="ml-2">
                            {pilot.sector.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {language === 'ar' && pilot.description_ar ? pilot.description_ar : pilot.description_en}
                    </p>
                    <div className="flex items-center justify-between">
                      <Link to={createPageUrl(`PublicPilotDetail?id=${pilot.id}`)}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-2" />
                          {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                        </Button>
                      </Link>
                      <Link to={createPageUrl(`CitizenPilotEnrollment?pilot_id=${pilot.id}`)}>
                        <Button size="sm" className="bg-blue-600">
                          <Bell className="h-3 w-3 mr-2" />
                          {t({ en: 'Enroll', ar: 'تسجيل' })}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filtered.map(pilot => {
          const municipality = municipalities.find(m => m.id === pilot.municipality_id);
          const isEnrolled = enrollments.some(e => e.pilot_id === pilot.id);

          return (
            <Card key={pilot.id} className="hover:shadow-xl transition-all">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {pilot.code && (
                      <Badge variant="outline" className="mb-2 font-mono text-xs">
                        {pilot.code}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                    </h3>
                    {pilot.tagline_en && (
                      <p className="text-sm text-slate-600 mb-2">
                        {language === 'ar' && pilot.tagline_ar ? pilot.tagline_ar : pilot.tagline_en}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-slate-700">
                      {municipality ? (language === 'ar' && municipality.name_ar ? municipality.name_ar : municipality.name_en) : 'N/A'}
                    </span>
                  </div>
                  {pilot.sector && (
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-slate-700">{pilot.sector.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  {pilot.timeline?.pilot_start && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-slate-700">{pilot.timeline.pilot_start}</span>
                    </div>
                  )}
                  {pilot.target_population?.size && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-amber-600" />
                      <span className="text-slate-700">
                        {pilot.target_population.size.toLocaleString()} {t({ en: 'beneficiaries', ar: 'مستفيد' })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge className={stageColors[pilot.stage] || 'bg-slate-100 text-slate-700'}>
                    {pilot.stage?.replace(/_/g, ' ')}
                  </Badge>
                  {isEnrolled && (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t({ en: 'Enrolled', ar: 'مسجل' })}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={createPageUrl(`PublicPilotDetail?id=${pilot.id}`)} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-3 w-3 mr-2" />
                      {t({ en: 'Details', ar: 'التفاصيل' })}
                    </Button>
                  </Link>
                  {!isEnrolled && ['active', 'preparation'].includes(pilot.stage) && (
                    <Link to={createPageUrl(`CitizenPilotEnrollment?pilot_id=${pilot.id}`)}>
                      <Button size="sm" className="bg-blue-600">
                        <Bell className="h-3 w-3 mr-2" />
                        {t({ en: 'Enroll', ar: 'تسجيل' })}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TestTube className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t({ en: 'No pilots found matching your filters', ar: 'لم يتم العثور على تجارب' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(PublicPilotTracker, { requiredPermissions: [] });