import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Microscope, BookOpen, Calendar, Target, FileText, Plus,
  Beaker, Clock, Bell
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useAcademiaData } from '@/hooks/useAcademiaData';
import { Loader2 } from 'lucide-react';

function AcademiaDashboard() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const {
    profile: myResearcherProfile,
    openRDCalls = [],
    myRDProjects = [],
    myProposals = [],
    researchChallenges = [],
    livingLabs = [],
    myLabBookings = [],
    researchPrograms = [],
    isLoading
  } = useAcademiaData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalFunding = openRDCalls.reduce((acc, c) => acc + (c.budget_total || 0), 0);
  const programCount = researchPrograms.length; // Derived from useAcademiaData

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'Academia & Research Portal', ar: 'بوابة الأكاديميين والباحثين' }}
        subtitle={{ en: 'Advance municipal innovation through applied research', ar: 'تطوير الابتكار البلدي من خلال البحث التطبيقي' }}
        icon={<Microscope className="h-6 w-6 text-white" />}
        description=""
        action={null}
        actions={null}
        stats={[]}
      />

      {/* Urgent Deadlines */}
      {openRDCalls.filter(c => {
        const daysLeft = Math.ceil((new Date(c.application_deadline || '') - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 14 && daysLeft > 0;
      }).length > 0 && (
          <Card className="border-2 border-red-400 bg-gradient-to-r from-red-50 to-orange-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-red-900">
                    {openRDCalls.filter(c => {
                      const daysLeft = Math.ceil((new Date(c.application_deadline || '') - new Date()) / (1000 * 60 * 60 * 24));
                      return daysLeft <= 14;
                    }).length} {t({ en: 'R&D Call(s) Closing Soon', ar: 'دعوات بحث تغلق قريباً' })}
                  </p>
                  <p className="text-sm text-red-700">
                    {t({ en: 'Deadlines within 2 weeks', ar: 'مواعيد نهائية خلال أسبوعين' })}
                  </p>
                </div>
                <Link to={createPageUrl('RDCalls')}>
                  <Button className="bg-red-600 hover:bg-red-700">
                    {t({ en: 'View Calls', ar: 'عرض الدعوات' })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{openRDCalls.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Open Calls', ar: 'الدعوات المفتوحة' })}</p>
              <p className="text-xs text-slate-500 mt-1">
                {(totalFunding / 1000000).toFixed(1)}M {t({ en: 'SAR', ar: 'ريال' })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Microscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{myRDProjects.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'My Projects', ar: 'مشاريعي' })}</p>
              <p className="text-xs text-slate-500 mt-1">
                {myRDProjects.filter(p => p.workflow_stage === 'active').length} {t({ en: 'active', ar: 'نشطة' })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-teal-600">{myProposals.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Proposals', ar: 'مقترحات' })}</p>
              <p className="text-xs text-slate-500 mt-1">
                {myProposals.filter(p => p.status === 'under_review').length} {t({ en: 'under review', ar: 'قيد المراجعة' })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Beaker className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{livingLabs.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Living Labs', ar: 'المختبرات' })}</p>
              <p className="text-xs text-slate-500 mt-1">
                {myLabBookings.length} {t({ en: 'bookings', ar: 'حجوزات' })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-600">{researchChallenges.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'R&D Challenges', ar: 'تحديات بحثية' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open R&D Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                {t({ en: 'Open R&D Calls', ar: 'دعوات البحث المفتوحة' })}
              </CardTitle>
              <Link to={createPageUrl('RDCalls')}>
                <Button variant="outline" size="sm">
                  {t({ en: 'View All', ar: 'عرض الكل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openRDCalls.slice(0, 5).map((call) => {
                const daysLeft = Math.ceil((new Date(call.application_deadline || '') - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <Link
                    key={call.id}
                    to={createPageUrl(`RDCallDetail?id=${call.id}`)}
                    className="block p-4 border-2 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs font-mono">{call.code}</Badge>
                          {daysLeft <= 7 && daysLeft > 0 && (
                            <Badge className="bg-red-600 text-white text-xs animate-pulse">
                              <Clock className="h-3 w-3 mr-1" />
                              {daysLeft} {t({ en: 'days left', ar: 'يوم متبقي' })}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {language === 'ar' && call.title_ar ? call.title_ar : call.title_en}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">{call.description_en?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600 font-semibold">
                            {call.budget_total ? `${(call.budget_total / 1000000).toFixed(1)}M SAR` : 'TBD'}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {t({ en: 'Closes:', ar: 'يغلق:' })} {call.application_deadline ? new Date(call.application_deadline).toLocaleDateString() : 'TBD'}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                        {t({ en: 'Submit', ar: 'تقديم' })}
                      </Button>
                    </div>
                    {(call.challenge_ids?.length || 0) > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        {call.challenge_ids.length} {t({ en: 'linked challenges', ar: 'تحديات مرتبطة' })}
                      </Badge>
                    )}
                  </Link>
                );
              })}
              {openRDCalls.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t({ en: 'No open R&D calls', ar: 'لا توجد دعوات بحث مفتوحة' })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={createPageUrl('ProposalWizard')}>
              <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Submit Proposal', ar: 'تقديم مقترح' })}
              </Button>
            </Link>
            <Link to={createPageUrl('RDProjectCreate')}>
              <Button variant="outline" className="w-full justify-start">
                <Microscope className="h-4 w-4 mr-2" />
                {t({ en: 'New R&D Project', ar: 'مشروع بحث جديد' })}
              </Button>
            </Link>
            <Link to={createPageUrl('LivingLabs')}>
              <Button variant="outline" className="w-full justify-start">
                <Beaker className="h-4 w-4 mr-2" />
                {t({ en: 'Book Lab', ar: 'حجز مختبر' })}
              </Button>
            </Link>
            <Link to={createPageUrl('Knowledge')}>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                {t({ en: 'Research Library', ar: 'مكتبة البحث' })}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* My Research Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Microscope className="h-5 w-5 text-purple-600" />
                {t({ en: 'My Active Projects', ar: 'مشاريعي النشطة' })}
              </CardTitle>
              <Link to={createPageUrl('MyRDProjects')}>
                <Button size="sm" variant="outline">
                  {t({ en: 'All', ar: 'الكل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {myRDProjects.filter(p => p.workflow_stage === 'active').slice(0, 4).map((project) => {
              const timeline = project.timeline && typeof project.timeline === 'object' ? project.timeline : {};
              return (
                <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                  <div className="p-3 border-2 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs font-mono">{project.code}</Badge>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {t({ en: 'Active', ar: 'نشط' })}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm text-slate-900 mb-1 truncate">
                      {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>TRL: {project.trl_current || project.trl_start || 0}→{project.trl_target || 9}</span>
                      {timeline.end_date && (
                        <span>• {t({ en: 'Ends:', ar: 'ينتهي:' })} {new Date(timeline.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
            {myRDProjects.filter(p => p.workflow_stage === 'active').length === 0 && (
              <div className="text-center py-8">
                <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">{t({ en: 'No active projects', ar: 'لا توجد مشاريع نشطة' })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                {t({ en: 'My Proposals', ar: 'مقترحاتي' })}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {myProposals.slice(0, 4).map((proposal) => {
              const call = proposal.rd_calls;
              const titleEn = call?.title_en || 'Proposal';
              const titleAr = call?.title_ar || 'مقترح';
              return (
                <Link key={proposal.id} to={createPageUrl(`RDProposalDetail?id=${proposal.id}`)}>
                  <div className="p-3 border rounded-lg hover:bg-teal-50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={
                        proposal.status === 'approved' ? 'bg-green-100 text-green-700 text-xs' :
                          proposal.status === 'under_review' ? 'bg-yellow-100 text-yellow-700 text-xs' :
                            proposal.status === 'shortlisted' ? 'bg-purple-100 text-purple-700 text-xs' :
                              'bg-blue-100 text-blue-700 text-xs'
                      }>{proposal.status?.replace(/_/g, ' ')}</Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(proposal.created_at || '').toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm text-slate-900 truncate">
                      {language === 'ar' ? titleAr : titleEn}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {t({ en: 'For:', ar: 'لـ:' })} {call?.title_en || 'R&D Call'}
                    </p>
                  </div>
                </Link>
              );
            })}
            {myProposals.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">{t({ en: 'No proposals yet', ar: 'لا توجد مقترحات' })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Programs for Researchers */}
      {researchPrograms.length > 0 && (
        <Card className="border-2 border-purple-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                {t({ en: 'Fellowship & Training Programs', ar: 'برامج الزمالة والتدريب' })}
              </CardTitle>
              <Link to={createPageUrl('Programs')}>
                <Button size="sm" variant="outline">
                  {t({ en: 'All Programs', ar: 'كل البرامج' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {researchPrograms.slice(0, 6).map((program) => {
                const timeline = program.timeline && typeof program.timeline === 'object' ? program.timeline : {};
                return (
                  <Link key={program.id} to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                    <Card className="hover:shadow-lg transition-all border-2 hover:border-purple-400">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-purple-100 text-purple-700 text-xs">{program.program_type?.replace(/_/g, ' ')}</Badge>
                          {program.budget && program.budget > 0 && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {t({ en: 'Funded', ar: 'ممول' })}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                          {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                        </h3>
                        {timeline.application_close && (
                          <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                            <Clock className="h-3 w-3" />
                            {new Date(String(timeline.application_close)).toLocaleDateString()}
                          </div>
                        )}
                        <Button size="sm" className="w-full bg-purple-600 mt-2">
                          {t({ en: 'Apply', ar: 'تقديم' })}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Challenges & Living Labs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Research-Track Challenges', ar: 'تحديات مسار البحث' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {researchChallenges.slice(0, 4).map((challenge) => (
              <Link key={challenge.id} to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                <div className="p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-mono">{challenge.code}</Badge>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{challenge.sector?.replace(/_/g, ' ')}</Badge>
                  </div>
                  <h4 className="font-medium text-sm text-slate-900 mb-1">
                    {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                  </h4>
                  <p className="text-xs text-slate-600">{challenge.municipality_id?.substring(0, 30)}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Beaker className="h-5 w-5 text-green-600" />
                {t({ en: 'Available Living Labs', ar: 'المختبرات المتاحة' })}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {livingLabs.slice(0, 4).map((lab) => (
              <Link key={lab.id} to={createPageUrl(`LivingLabDetail?id=${lab.id}`)}>
                <div className="p-3 border rounded-lg hover:border-green-300 hover:bg-green-50 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm text-slate-900">
                      {language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {lab.status === 'active' ? '100%' : '0%'} {t({ en: 'active', ar: 'نشط' })}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{lab.research_priorities?.slice(0, 2).join(', ')}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(AcademiaDashboard, { requiredPermissions: [] });