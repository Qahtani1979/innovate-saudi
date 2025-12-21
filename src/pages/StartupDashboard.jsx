import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import OpportunityPipelineDashboard from '../components/provider/OpportunityPipelineDashboard';
import MarketIntelligenceFeed from '../components/solutions/MarketIntelligenceFeed';
import ProviderPerformanceDashboard from '../components/solutions/ProviderPerformanceDashboard';
import ProposalWorkflowTracker from '../components/startup/ProposalWorkflowTracker';
import FirstActionRecommender from '../components/onboarding/FirstActionRecommender';
import ProfileCompletenessCoach from '../components/onboarding/ProfileCompletenessCoach';
import ProgressiveProfilingPrompt from '../components/onboarding/ProgressiveProfilingPrompt';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Lightbulb, Target, Rocket, Calendar, Plus,
  Users, CheckCircle2, Sparkles, TestTube, FileText,
  Clock
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function StartupDashboard() {
  const { language, isRTL, t } = useLanguage();
  const { user, userProfile } = useAuth();

  // Find startup's organization profile
  const { data: myOrganization } = useQuery({
    queryKey: ['my-organization', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('organizations').select('*');
      return data?.find(o =>
        o.contact_email === user?.email ||
        o.primary_contact_name === user?.full_name
      );
    },
    enabled: !!user
  });

  // RLS: Startup sees only PUBLISHED challenges
  const { data: openChallenges = [] } = useQuery({
    queryKey: ['published-challenges'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('is_deleted', false).eq('is_published', true);
      return data?.filter(c =>
        ['approved', 'in_treatment'].includes(c.status)
      );
    }
  });

  // Matchmaker application
  const { data: myMatchmakerApp } = useQuery({
    queryKey: ['my-matchmaker-app', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matchmaker_applications')
        .select('*')
        .eq('contact_email', user?.email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.email
  });

  // Matched challenges from matchmaker
  const { data: matchedChallenges = [] } = useQuery({
    queryKey: ['my-matched-challenges', myMatchmakerApp?.id],
    queryFn: async () => {
      if (!myMatchmakerApp?.matched_challenges?.length) return [];

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .in('id', myMatchmakerApp.matched_challenges)
        .eq('is_published', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!myMatchmakerApp?.matched_challenges?.length
  });

  // My solutions
  const { data: mySolutions = [] } = useQuery({
    queryKey: ['my-solutions', myOrganization?.id, user?.email],
    queryFn: async () => {
      let query = supabase.from('solutions').select('*');

      if (myOrganization?.id) {
        query = query.eq('provider_id', myOrganization.id);
      } else {
        query = query.eq('created_by', user?.email);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!myOrganization || !!user
  });

  // My pilots (where my solution is used)
  const { data: myPilots = [] } = useQuery({
    queryKey: ['my-pilots-startup', myOrganization?.id, mySolutions.length],
    queryFn: async () => {
      if (mySolutions.length === 0) return [];
      const solutionIds = mySolutions.map(s => s.id);

      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .in('solution_id', solutionIds);

      if (error) throw error;
      return data || [];
    },
    enabled: mySolutions.length > 0
  });

  // My proposals
  const { data: myProposals = [] } = useQuery({
    queryKey: ['my-proposals-startup', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_proposals')
        .select('*')
        .or(`proposer_email.eq.${user?.email},created_by.eq.${user?.email}`);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  // Programs I can apply to
  const { data: openPrograms = [] } = useQuery({
    queryKey: ['open-programs-startup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('status', 'applications_open')
        .eq('is_published', true)
        .in('program_type', ['accelerator', 'incubator', 'matchmaker']);

      if (error) throw error;
      return data || [];
    }
  });

  // My program applications
  const { data: myProgramApps = [] } = useQuery({
    queryKey: ['my-program-apps', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_applications')
        .select('*')
        .or(`applicant_email.eq.${user?.email},created_by.eq.${user?.email}`);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  return (
    <PageLayout>
      <PageHeader
        icon={Rocket}
        title={t({ en: 'Startup & Provider Portal', ar: 'بوابة الشركات الناشئة والمزودين' })}
        description={t({ en: 'Discover opportunities, submit proposals, and grow your impact', ar: 'اكتشف الفرص، قدم المقترحات، وزد تأثيرك' })}
        stats={[
          { icon: Target, value: openChallenges.length, label: t({ en: 'Open Challenges', ar: 'تحديات مفتوحة' }) },
          { icon: Lightbulb, value: mySolutions.length, label: t({ en: 'My Solutions', ar: 'حلولي' }) },
          { icon: Calendar, value: openPrograms.length, label: t({ en: 'Open Programs', ar: 'برامج مفتوحة' }) },
        ]}
      />

      {/* Matchmaker Status Banner */}
      {myMatchmakerApp && (
        <Card className="border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-purple-900">
                  {t({ en: 'Matchmaker Program:', ar: 'برنامج التوفيق:' })} {myMatchmakerApp.classification?.replace(/_/g, ' ') || 'Active'}
                </p>
                <p className="text-sm text-purple-700">
                  {matchedChallenges.length} {t({ en: 'challenges matched • ', ar: 'تحديات مطابقة • ' })}
                  {t({ en: 'Stage:', ar: 'المرحلة:' })} {myMatchmakerApp.stage?.replace(/_/g, ' ')}
                </p>
              </div>
              <Link to={createPageUrl('MatchmakerApplicationDetail') + `?id=${myMatchmakerApp.id}`}>
                <Button className="bg-purple-600">
                  {t({ en: 'View Details', ar: 'التفاصيل' })}
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
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{openChallenges.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Open Challenges', ar: 'تحديات مفتوحة' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{matchedChallenges.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'AI Matches', ar: 'مطابقات ذكية' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Lightbulb className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{mySolutions.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'My Solutions', ar: 'حلولي' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-indigo-600">{openPrograms.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Open Programs', ar: 'برامج مفتوحة' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-pink-600">{myProgramApps.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Applications', ar: 'الطلبات' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completeness & First Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCompletenessCoach profile={userProfile} role="startup_user" />
        <FirstActionRecommender user={{ role: 'startup_user', email: user?.email || '' }} />
      </div>

      {/* Progressive Profiling Prompt */}
      <ProgressiveProfilingPrompt />

      {/* Opportunity Pipeline */}
      {myOrganization && (
        <OpportunityPipelineDashboard providerId={myOrganization.id} providerEmail={user?.email} />
      )}

      {/* Proposal Workflow Tracker */}
      {myOrganization && (
        <ProposalWorkflowTracker providerId={myOrganization.id} providerEmail={user?.email} />
      )}

      {/* Market Intelligence Feed - Integrated */}
      {myOrganization && (
        <MarketIntelligenceFeed providerSectors={myOrganization.sectors} />
      )}

      {/* Provider Performance Dashboard - Integrated */}
      {myOrganization && (
        <ProviderPerformanceDashboard providerId={myOrganization.id} />
      )}

      {/* My Solutions Showcase */}
      {mySolutions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-green-600" />
                {t({ en: 'My Solutions Portfolio', ar: 'محفظة حلولي' })}
              </CardTitle>
              <Link to={createPageUrl('ProviderPortfolioDashboard')}>
                <Button size="sm" variant="outline">
                  {t({ en: 'Manage All', ar: 'إدارة الكل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mySolutions.slice(0, 6).map((solution) => (
                <Link key={solution.id} to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
                  <Card className="hover:shadow-lg transition-all border-2 hover:border-green-400">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={
                          solution.verification_status === 'approved' ? 'bg-green-100 text-green-700 text-xs' :
                            solution.verification_status === 'in_progress' ? 'bg-blue-100 text-blue-700 text-xs' :
                              'bg-yellow-100 text-yellow-700 text-xs'
                        }>{solution.verification_status?.replace(/_/g, ' ')}</Badge>
                        {solution.is_verified && (
                          <Badge className="bg-green-600 text-white text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t({ en: 'Verified', ar: 'معتمد' })}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                      </h3>
                      <p className="text-xs text-slate-600 mb-3">{solution.maturity_level?.replace(/_/g, ' ')}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{t({ en: 'Deployments', ar: 'نشر' })}</span>
                          <span className="font-bold text-blue-600">{solution.deployment_count || 0}</span>
                        </div>
                        {solution.average_rating && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">{t({ en: 'Rating', ar: 'تقييم' })}</span>
                            <span className="font-bold text-amber-600">{solution.average_rating.toFixed(1)}/5</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{openChallenges.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Open Challenges', ar: 'تحديات مفتوحة' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <TestTube className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-600">{myPilots.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'تجاربي' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-teal-600">{myProposals.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Proposals', ar: 'مقترحات' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!myMatchmakerApp && (
              <Link to={createPageUrl('MatchmakerApplicationCreate')}>
                <Button className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600">
                  <Users className="h-4 w-4 mr-2" />
                  {t({ en: 'Join Matchmaker', ar: 'انضم للتوفيق' })}
                </Button>
              </Link>
            )}
            <Link to={createPageUrl('SolutionCreate')}>
              <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-teal-600">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Solution', ar: 'إضافة حل' })}
              </Button>
            </Link>
            <Link to={createPageUrl('OpportunityFeed')}>
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                {t({ en: 'Browse Challenges', ar: 'تصفح التحديات' })}
              </Button>
            </Link>
            <Link to={createPageUrl('ProgramApplicationWizard')}>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                {t({ en: 'Apply to Program', ar: 'التقديم لبرنامج' })}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Matched Challenges */}
        <Card className="lg:col-span-2 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {matchedChallenges.length > 0 ? (
                <>
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Your AI-Matched Challenges', ar: 'التحديات المطابقة لك' })} ({matchedChallenges.length})
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Featured Opportunities', ar: 'الفرص المميزة' })}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(matchedChallenges.length > 0 ? matchedChallenges : openChallenges).slice(0, 5).map((challenge, idx) => (
                <Link
                  key={challenge.id}
                  to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}
                  className="block p-4 border-2 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs font-mono">{challenge.code}</Badge>
                        <Badge variant="outline" className="text-xs">{challenge.sector?.replace(/_/g, ' ')}</Badge>
                        {matchedChallenges.length > 0 && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {95 - idx * 2}% {t({ en: 'Match', ar: 'مطابقة' })}
                          </Badge>
                        )}
                        {challenge.priority === 'tier_1' && (
                          <Badge className="bg-red-600 text-white text-xs">
                            {t({ en: 'High Priority', ar: 'أولوية عالية' })}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {language === 'ar' && challenge.description_ar ? challenge.description_ar : challenge.description_en}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{challenge.municipality_id?.substring(0, 25)}</span>
                        {challenge.budget_estimate && <span>• {(challenge.budget_estimate / 1000).toFixed(0)}K SAR</span>}
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-600">
                      {t({ en: 'Submit Proposal', ar: 'تقديم مقترح' })}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Pilots Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-600" />
              {t({ en: 'My Pilots', ar: 'تجاربي' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myPilots.length > 0 ? (
              myPilots.slice(0, 4).map((pilot) => (
                <Link key={pilot.id} to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs font-mono">{pilot.code}</Badge>
                      <Badge className={
                        pilot.stage === 'active' ? 'bg-green-100 text-green-700 text-xs' :
                          pilot.stage === 'monitoring' ? 'bg-blue-100 text-blue-700 text-xs' :
                            pilot.stage === 'completed' ? 'bg-teal-100 text-teal-700 text-xs' :
                              'bg-slate-100 text-slate-700 text-xs'
                      }>{pilot.stage}</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate mb-1">
                      {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                    </p>
                    <div className="text-xs text-slate-600">
                      {t({ en: 'Success:', ar: 'النجاح:' })} {pilot.success_probability || 0}%
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-6">
                <TestTube className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">{t({ en: 'No pilots yet', ar: 'لا توجد تجارب بعد' })}</p>
                <p className="text-xs text-slate-400">{t({ en: 'Submit proposals to challenges', ar: 'قدم مقترحات للتحديات' })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Proposals & Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t({ en: 'My Proposals', ar: 'مقترحاتي' })}</CardTitle>
              <Link to={createPageUrl('OpportunityFeed')}>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  {t({ en: 'New', ar: 'جديد' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {myProposals.slice(0, 4).map((proposal) => {
              const challenge = openChallenges.find(c => c.id === proposal.challenge_id);
              return (
                <div key={proposal.id} className="p-3 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={
                      proposal.status === 'approved' ? 'bg-green-100 text-green-700' :
                        proposal.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                          proposal.status === 'shortlisted' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                    }>{proposal.status?.replace(/_/g, ' ')}</Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(proposal.created_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{proposal.proposal_title}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {t({ en: 'For:', ar: 'لـ:' })} {challenge?.code || proposal.challenge_id}
                  </p>
                </div>
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t({ en: 'Programs & Opportunities', ar: 'البرامج والفرص' })}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {openPrograms.slice(0, 4).map((program) => (
              <Link
                key={program.id}
                to={createPageUrl(`ProgramDetail?id=${program.id}`)}
                className="block p-3 border-2 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-purple-100 text-purple-700 text-xs">{program.program_type?.replace(/_/g, ' ')}</Badge>
                  {program.timeline?.application_close && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(program.timeline.application_close).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="font-medium text-sm text-slate-900">
                  {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                </p>
                {program.funding_details?.max_amount && (
                  <p className="text-xs text-green-600 mt-1">
                    {t({ en: 'Funding:', ar: 'التمويل:' })} {(program.funding_details.max_amount / 1000).toFixed(0)}K SAR
                  </p>
                )}
              </Link>
            ))}
            {openPrograms.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">{t({ en: 'No open programs', ar: 'لا توجد برامج مفتوحة' })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started (for new startups) */}
      {!myMatchmakerApp && mySolutions.length === 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-600" />
              {t({ en: 'Getting Started', ar: 'البدء' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  {t({ en: 'Register Your Solution', ar: 'سجل حلك' })}
                </p>
                <p className="text-xs text-slate-600 mb-3">
                  {t({ en: 'Add your innovation to the platform', ar: 'أضف ابتكارك للمنصة' })}
                </p>
                <Link to={createPageUrl('SolutionCreate')}>
                  <Button size="sm" className="w-full bg-blue-600">
                    {t({ en: 'Add Solution', ar: 'إضافة حل' })}
                  </Button>
                </Link>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-purple-600">2</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  {t({ en: 'Join Matchmaker', ar: 'انضم للتوفيق' })}
                </p>
                <p className="text-xs text-slate-600 mb-3">
                  {t({ en: 'Get AI-matched with challenges', ar: 'احصل على مطابقة ذكية مع التحديات' })}
                </p>
                <Link to={createPageUrl('MatchmakerApplicationCreate')}>
                  <Button size="sm" className="w-full bg-purple-600">
                    {t({ en: 'Apply Now', ar: 'التقديم الآن' })}
                  </Button>
                </Link>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-green-600">3</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  {t({ en: 'Submit Proposals', ar: 'قدم المقترحات' })}
                </p>
                <p className="text-xs text-slate-600 mb-3">
                  {t({ en: 'Respond to open challenges', ar: 'استجب للتحديات المفتوحة' })}
                </p>
                <Link to={createPageUrl('OpportunityFeed')}>
                  <Button size="sm" className="w-full bg-green-600">
                    {t({ en: 'Browse', ar: 'تصفح' })}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(StartupDashboard, { requiredPermissions: [] });