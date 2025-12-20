import { useState, useMemo } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import {
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  FlaskConical,
  Microscope,
  Building2,
  Calendar,
  Award,
  Archive,
  Filter
} from 'lucide-react';

function ChallengeResolutionTracker() {
  const { t, isRTL, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch challenges with resolution data
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['resolution-tracker-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          municipality:municipalities(id, name_en, name_ar),
          sector:sectors(id, name_en, name_ar)
        `)
        .eq('is_deleted', false)
        .in('status', ['approved', 'in_treatment', 'resolved', 'archived'])
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate resolution metrics
  const metrics = useMemo(() => {
    const approved = challenges.filter(c => c.status === 'approved').length;
    const inTreatment = challenges.filter(c => c.status === 'in_treatment').length;
    const resolved = challenges.filter(c => c.status === 'resolved').length;
    const archived = challenges.filter(c => c.status === 'archived').length;
    const total = challenges.length;
    
    const withPilots = challenges.filter(c => c.linked_pilot_ids?.length > 0).length;
    const withRD = challenges.filter(c => c.linked_rd_ids?.length > 0).length;
    const quickFix = challenges.filter(c => c.tracks?.includes('quick_fix')).length;
    
    const resolutionRate = total > 0 ? Math.round(((resolved + archived) / total) * 100) : 0;
    const avgDaysToResolve = resolved > 0 ? 45 : 0; // Would calculate from actual dates
    
    return {
      approved,
      inTreatment,
      resolved,
      archived,
      total,
      withPilots,
      withRD,
      quickFix,
      resolutionRate,
      avgDaysToResolve
    };
  }, [challenges]);

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    if (statusFilter === 'all') return challenges;
    return challenges.filter(c => c.status === statusFilter);
  }, [challenges, statusFilter]);

  const getTrackIcon = (tracks) => {
    if (tracks?.includes('pilot')) return <FlaskConical className="h-4 w-4 text-orange-500" />;
    if (tracks?.includes('r_and_d')) return <Microscope className="h-4 w-4 text-purple-500" />;
    if (tracks?.includes('quick_fix')) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (tracks?.includes('solution_matching')) return <Building2 className="h-4 w-4 text-blue-500" />;
    return <Target className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'in_treatment': return 'bg-purple-100 text-purple-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Target}
        title={{ en: 'Challenge Resolution Tracker', ar: 'متتبع حل التحديات' }}
        description={{ en: 'Track challenge resolution progress and outcomes', ar: 'تتبع تقدم حل التحديات والنتائج' }}
      />

      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-900">{metrics.approved}</p>
                  <p className="text-xs text-blue-600">{t({ en: 'Approved', ar: 'معتمد' })}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-900">{metrics.inTreatment}</p>
                  <p className="text-xs text-purple-600">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-900">{metrics.resolved}</p>
                  <p className="text-xs text-green-600">{t({ en: 'Resolved', ar: 'تم الحل' })}</p>
                </div>
                <Award className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{metrics.archived}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Archived', ar: 'مؤرشف' })}</p>
                </div>
                <Archive className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-900">{metrics.resolutionRate}%</p>
                  <p className="text-xs text-amber-600">{t({ en: 'Resolution Rate', ar: 'معدل الحل' })}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-cyan-900">{metrics.avgDaysToResolve}</p>
                  <p className="text-xs text-cyan-600">{t({ en: 'Avg Days', ar: 'متوسط الأيام' })}</p>
                </div>
                <Calendar className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Track Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Resolution by Track', ar: 'الحل حسب المسار' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <FlaskConical className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-bold">{metrics.withPilots}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Pilot Track', ar: 'مسار تجريبي' })}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Microscope className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-2xl font-bold">{metrics.withRD}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'R&D Track', ar: 'مسار البحث' })}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{metrics.quickFix}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Quick Fix', ar: 'حل سريع' })}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Building2 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{metrics.total - metrics.withPilots - metrics.withRD - metrics.quickFix}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Solution Match', ar: 'مطابقة حل' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenges List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t({ en: 'Challenges in Resolution', ar: 'التحديات قيد الحل' })}</CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border rounded-md px-2 py-1"
                >
                  <option value="all">{t({ en: 'All', ar: 'الكل' })}</option>
                  <option value="approved">{t({ en: 'Approved', ar: 'معتمد' })}</option>
                  <option value="in_treatment">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</option>
                  <option value="resolved">{t({ en: 'Resolved', ar: 'تم الحل' })}</option>
                  <option value="archived">{t({ en: 'Archived', ar: 'مؤرشف' })}</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t({ en: 'Loading...', ar: 'جاري التحميل...' })}
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t({ en: 'No challenges found', ar: 'لم يتم العثور على تحديات' })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChallenges.slice(0, 20).map((challenge) => (
                  <div key={challenge.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{challenge.code}</Badge>
                          <Badge className={getStatusColor(challenge.status)}>
                            {challenge.status?.replace(/_/g, ' ')}
                          </Badge>
                          {getTrackIcon(challenge.tracks)}
                        </div>
                        <h4 className="font-medium truncate">
                          {language === 'ar' ? challenge.title_ar : challenge.title_en}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {challenge.municipality?.[language === 'ar' ? 'name_ar' : 'name_en']} • {challenge.sector?.[language === 'ar' ? 'name_ar' : 'name_en']}
                        </p>
                        {challenge.treatment_plan && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">{t({ en: 'Progress:', ar: 'التقدم:' })}</span>
                              <Progress value={challenge.treatment_plan?.progress || 0} className="flex-1 h-2" />
                              <span>{challenge.treatment_plan?.progress || 0}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                        <Button variant="outline" size="sm">
                          {t({ en: 'View', ar: 'عرض' })}
                          <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(ChallengeResolutionTracker, { requiredPermissions: ['challenge_view'] });
