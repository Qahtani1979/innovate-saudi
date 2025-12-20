import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  FlaskConical, BookOpen, Users,
  Clock, Target, GraduationCap, Link2, ExternalLink
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import FirstActionRecommender from '../components/onboarding/FirstActionRecommender';
import ProfileCompletenessCoach from '../components/onboarding/ProfileCompletenessCoach';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';

function ResearcherDashboard() {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile } = useAuth();

  // Fetch researcher profile
  const { data: researcherProfile } = useQuery({
    queryKey: ['researcher-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('researcher_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch R&D calls
  const { data: rdCalls = [] } = useQuery({
    queryKey: ['rd-calls-researcher'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_calls')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch R&D projects
  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-researcher', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_projects')
        .select('*')
        .eq('researcher_email', user?.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  // Fetch living labs
  const { data: livingLabs = [] } = useQuery({
    queryKey: ['living-labs-researcher'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('living_labs')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    draft: 'bg-slate-100 text-slate-700'
  };

  const activeProjects = rdProjects.filter(p => p.status === 'active').length;

  return (
    <PageLayout>
      <PageHeader
        icon={FlaskConical}
        title={t({ en: 'Researcher Dashboard', ar: 'لوحة الباحث' })}
        description={t({ en: 'Collaborate with municipalities on impactful research', ar: 'تعاون مع البلديات في البحوث المؤثرة' })}
        stats={[
          { icon: FlaskConical, value: activeProjects, label: t({ en: 'Active Projects', ar: 'مشاريع نشطة' }) },
          { icon: BookOpen, value: rdCalls.length, label: t({ en: 'Open Calls', ar: 'نداءات مفتوحة' }) },
          { icon: Target, value: livingLabs.length, label: t({ en: 'Living Labs', ar: 'مختبرات حية' }) },
          { icon: Users, value: researcherProfile?.collaboration_interests?.length || 0, label: t({ en: 'Collaborations', ar: 'تعاونات' }) },
        ]}
        action={
          <div className="flex gap-2">
            <Link to={createPageUrl('RDCalls')}>
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                {t({ en: 'Browse R&D Calls', ar: 'تصفح نداءات البحث' })}
              </Button>
            </Link>
            <Link to={createPageUrl('MyResearcherProfileEditor')}>
              <PersonaButton>
                <GraduationCap className="h-4 w-4 mr-2" />
                {t({ en: 'Edit Profile', ar: 'تعديل الملف' })}
              </PersonaButton>
            </Link>
          </div>
        }
      />

      {/* Profile Summary & Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                {t({ en: 'Research Profile', ar: 'الملف البحثي' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Institution', ar: 'المؤسسة' })}</p>
                  <p className="font-semibold">{researcherProfile?.institution || userProfile?.organization || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Title', ar: 'اللقب' })}</p>
                  <p className="font-semibold">{researcherProfile?.academic_title || userProfile?.job_title || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Department', ar: 'القسم' })}</p>
                  <p className="font-semibold">{researcherProfile?.department || userProfile?.department || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Verified', ar: 'موثق' })}</p>
                  <Badge className={researcherProfile?.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {researcherProfile?.is_verified ? t({ en: 'Verified', ar: 'موثق' }) : t({ en: 'Pending', ar: 'قيد المراجعة' })}
                  </Badge>
                </div>
              </div>
              {researcherProfile?.research_areas?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">{t({ en: 'Research Areas', ar: 'مجالات البحث' })}</p>
                  <div className="flex flex-wrap gap-2">
                    {researcherProfile.research_areas.map((area, i) => (
                      <Badge key={i} variant="outline" className="border-green-300">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(researcherProfile?.orcid_id || researcherProfile?.google_scholar_url) && (
                <div className="mt-4 flex gap-3">
                  {researcherProfile.orcid_id && (
                    <a href={`https://orcid.org/${researcherProfile.orcid_id}`} target="_blank" rel="noopener noreferrer" 
                       className="text-sm text-green-600 hover:underline flex items-center gap-1">
                      <Link2 className="h-4 w-4" /> ORCID
                    </a>
                  )}
                  {researcherProfile.google_scholar_url && (
                    <a href={researcherProfile.google_scholar_url} target="_blank" rel="noopener noreferrer" 
                       className="text-sm text-green-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" /> Google Scholar
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <ProfileCompletenessCoach profile={userProfile} role="researcher" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'المشاريع النشطة' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {rdProjects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <FlaskConical className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Open R&D Calls', ar: 'نداءات البحث المفتوحة' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{rdCalls.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Living Labs', ar: 'مختبرات حية' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{livingLabs.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Collaborations', ar: 'التعاونات' })}</p>
                <p className="text-3xl font-bold text-teal-600 mt-1">
                  {researcherProfile?.collaboration_interests?.length || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* First Action Recommender */}
      <FirstActionRecommender user={{ role: 'researcher', email: user?.email || '' }} />

      {/* Tabs */}
      <Tabs defaultValue="rd-calls" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rd-calls">
            <BookOpen className="h-4 w-4 mr-2" />
            {t({ en: 'R&D Calls', ar: 'نداءات البحث' })}
          </TabsTrigger>
          <TabsTrigger value="my-projects">
            <FlaskConical className="h-4 w-4 mr-2" />
            {t({ en: 'My Projects', ar: 'مشاريعي' })}
          </TabsTrigger>
          <TabsTrigger value="living-labs">
            <Target className="h-4 w-4 mr-2" />
            {t({ en: 'Living Labs', ar: 'مختبرات حية' })}
          </TabsTrigger>
        </TabsList>

        {/* R&D Calls Tab */}
        <TabsContent value="rd-calls" className="space-y-4">
          {rdCalls.length > 0 ? (
            rdCalls.map((call) => (
              <Link key={call.id} to={createPageUrl(`RDCallDetail?id=${call.id}`)}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={statusColors[call.status] || statusColors.draft}>
                            {call.status}
                          </Badge>
                          {call.deadline && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(call.deadline).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900">
                          {language === 'ar' ? call.title_ar : call.title_en}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {language === 'ar' ? call.description_ar : call.description_en}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        {t({ en: 'View', ar: 'عرض' })}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No open R&D calls at the moment', ar: 'لا توجد نداءات بحث مفتوحة حالياً' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Projects Tab */}
        <TabsContent value="my-projects" className="space-y-4">
          {rdProjects.length > 0 ? (
            rdProjects.map((project) => (
              <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={statusColors[project.status] || statusColors.draft}>
                            {project.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900">
                          {language === 'ar' ? project.title_ar : project.title_en}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {language === 'ar' ? project.description_ar : project.description_en}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FlaskConical className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">{t({ en: 'No projects yet', ar: 'لا توجد مشاريع بعد' })}</p>
                <Link to={createPageUrl('RDCalls')}>
                  <Button>{t({ en: 'Apply to R&D Call', ar: 'تقدم لنداء بحث' })}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Living Labs Tab */}
        <TabsContent value="living-labs" className="space-y-4">
          {livingLabs.length > 0 ? (
            livingLabs.map((lab) => (
              <Link key={lab.id} to={createPageUrl(`LivingLabDetail?id=${lab.id}`)}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {language === 'ar' ? lab.name_ar : lab.name_en}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {language === 'ar' ? lab.description_ar : lab.description_en}
                        </p>
                        {lab.focus_areas && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {lab.focus_areas.slice(0, 3).map((area, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        {t({ en: 'Explore', ar: 'استكشف' })}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No living labs available', ar: 'لا توجد مختبرات حية متاحة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(ResearcherDashboard, { requiredPermissions: [] });
