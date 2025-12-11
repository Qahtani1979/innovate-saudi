import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  TestTube, MapPin, Calendar, TrendingUp, Users, Target,
  Eye, Bell, CheckCircle2, Loader2, ArrowRight
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { 
  CitizenPageLayout, 
  CitizenPageHeader, 
  CitizenSearchFilter, 
  CitizenCardGrid, 
  CitizenEmptyState 
} from '@/components/citizen/CitizenPageLayout';

function PublicPilotTracker() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { user } = useAuth();

  const { data: pilots = [], isLoading } = useQuery({
    queryKey: ['public-pilots'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*')
        .eq('is_published', true)
        .eq('is_confidential', false)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
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
    design: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    preparation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    monitoring: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    evaluation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    scaled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  };

  const activeFiltersCount = (selectedSector !== 'all' ? 1 : 0) + (selectedCity !== 'all' ? 1 : 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={TestTube}
        title={t({ en: 'Public Pilots', ar: 'التجارب العامة' })}
        description={t({ en: 'Discover innovation pilots testing solutions in your area', ar: 'اكتشف تجارب الابتكار التي تختبر الحلول في منطقتك' })}
        stats={[
          { value: pilots.length, label: t({ en: 'Active Pilots', ar: 'تجارب نشطة' }), icon: TestTube },
          { value: myAreaPilots.length, label: t({ en: 'In Your Area', ar: 'في منطقتك' }), icon: MapPin },
          { value: enrollments.length, label: t({ en: 'Your Enrollments', ar: 'تسجيلاتك' }), icon: Users },
          { value: sectors.length, label: t({ en: 'Sectors', ar: 'قطاعات' }) },
        ]}
      />

      <CitizenSearchFilter
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t({ en: 'Search pilots...', ar: 'بحث التجارب...' })}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeFilters={activeFiltersCount}
        onClearFilters={() => { setSelectedSector('all'); setSelectedCity('all'); }}
        filters={[
          {
            label: t({ en: 'Sectors', ar: 'القطاعات' }),
            placeholder: t({ en: 'Sector', ar: 'القطاع' }),
            value: selectedSector,
            onChange: setSelectedSector,
            options: sectors.map(s => ({ value: s, label: s.replace(/_/g, ' ') }))
          },
          {
            label: t({ en: 'Cities', ar: 'المدن' }),
            placeholder: t({ en: 'City', ar: 'المدينة' }),
            value: selectedCity,
            onChange: setSelectedCity,
            options: municipalities.map(m => ({ 
              value: m.id, 
              label: language === 'ar' && m.name_ar ? m.name_ar : m.name_en 
            }))
          }
        ]}
      />

      {/* My Area Pilots */}
      {myAreaPilots.length > 0 && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t({ en: 'Pilots in Your Area', ar: 'تجارب في منطقتك' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAreaPilots.slice(0, 4).map(pilot => (
                <Card key={pilot.id} className="hover:shadow-lg transition-shadow border-border/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={stageColors[pilot.stage] || 'bg-slate-100'}>
                          {pilot.stage?.replace(/_/g, ' ')}
                        </Badge>
                        {pilot.sector && (
                          <Badge variant="outline">
                            {pilot.sector.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {language === 'ar' && pilot.description_ar ? pilot.description_ar : pilot.description_en}
                    </p>
                    <Link to={createPageUrl('CitizenPilotEnrollment') + `?pilotId=${pilot.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        {t({ en: 'Learn More', ar: 'اعرف المزيد' })}
                        <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Pilots */}
      <CitizenCardGrid 
        viewMode={viewMode}
        emptyState={
          <CitizenEmptyState
            icon={TestTube}
            title={t({ en: 'No pilots found', ar: 'لم يتم العثور على تجارب' })}
            description={t({ en: 'Try adjusting your filters or check back later', ar: 'حاول تعديل الفلاتر أو تحقق لاحقاً' })}
          />
        }
      >
        {filtered.map(pilot => (
          <Card 
            key={pilot.id} 
            className={`group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}
          >
            <CardContent className={`p-5 ${viewMode === 'list' ? 'flex items-center gap-6 w-full' : ''}`}>
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={stageColors[pilot.stage] || 'bg-slate-100'}>
                      {pilot.stage?.replace(/_/g, ' ')}
                    </Badge>
                    {pilot.sector && (
                      <Badge variant="outline" className="text-xs">
                        {pilot.sector.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  {enrollments.some(e => e.pilot_id === pilot.id) && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t({ en: 'Enrolled', ar: 'مسجل' })}
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {language === 'ar' && pilot.description_ar ? pilot.description_ar : pilot.description_en}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  {pilot.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(pilot.start_date).toLocaleDateString()}
                    </span>
                  )}
                  {pilot.target_beneficiaries && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {pilot.target_beneficiaries}
                    </span>
                  )}
                </div>

                <Link to={createPageUrl('CitizenPilotEnrollment') + `?pilotId=${pilot.id}`}>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                    <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </CitizenCardGrid>
    </CitizenPageLayout>
  );
}

export default ProtectedPage(PublicPilotTracker, { requiredPermissions: [] });
