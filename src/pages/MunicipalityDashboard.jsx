import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import QuickSolutionsMarketplace from '../components/municipalities/QuickSolutionsMarketplace';
import MIIImprovementAI from '../components/municipalities/MIIImprovementAI';
import PeerBenchmarkingTool from '../components/municipalities/PeerBenchmarkingTool';
import FirstActionRecommender from '../components/onboarding/FirstActionRecommender';
import ProfileCompletenessCoach from '../components/onboarding/ProfileCompletenessCoach';
import ProgressiveProfilingPrompt from '../components/onboarding/ProgressiveProfilingPrompt';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Building2, AlertCircle, TestTube, TrendingUp, Plus, Target, CheckCircle2, Users, Sparkles, 
  Loader2, X, Microscope, Clock, Bell, Activity, Lightbulb, MessageSquare, Calendar,
  BarChart3, Shield, Zap, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import MunicipalPolicyTracker from '../components/policy/MunicipalPolicyTracker';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';

function MunicipalityDashboard() {
  const { language, isRTL, t } = useLanguage();
  const { user: authUser, userProfile } = useAuth();
  const [user, setUser] = React.useState(null);
  const [showAIInsights, setShowAIInsights] = React.useState(false);
  const [aiInsights, setAiInsights] = React.useState(null);
  
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  // Use userProfile.municipality_id for direct Supabase queries (server-side RLS)
  const myMunicipalityId = userProfile?.municipality_id;

  React.useEffect(() => {
    // Get user from auth context instead of base44
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email });
    }
  }, [authUser]);

  // Direct Supabase query for municipality - server-side RLS
  const { data: myMunicipality } = useQuery({
    queryKey: ['my-municipality', myMunicipalityId],
    queryFn: async () => {
      if (!myMunicipalityId) return null;
      const { data, error } = await supabase
        .from('municipalities')
        .select('*')
        .eq('id', myMunicipalityId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!myMunicipalityId
  });

  // Direct Supabase query for challenges - server-side RLS
  const { data: challenges = [], error: challengesError } = useQuery({
    queryKey: ['municipality-challenges', myMunicipalityId, user?.email],
    queryFn: async () => {
      if (!myMunicipalityId && !user?.email) return [];
      
      // Build query with OR conditions for municipality OR ownership
      let query = supabase
        .from('challenges')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (myMunicipalityId) {
        // If user has municipality, get challenges from their municipality
        const { data, error } = await query.eq('municipality_id', myMunicipalityId);
        if (error) throw error;
        return data || [];
      } else if (user?.email) {
        // Fallback: get only challenges they own/created
        const { data, error } = await query.or(`created_by.eq.${user.email},challenge_owner_email.eq.${user.email}`);
        if (error) throw error;
        return data || [];
      }
      return [];
    },
    enabled: !!myMunicipalityId || !!user?.email
  });

  // Direct Supabase query for pilots - server-side RLS
  const { data: pilots = [], error: pilotsError } = useQuery({
    queryKey: ['municipality-pilots', myMunicipalityId, user?.email],
    queryFn: async () => {
      if (!myMunicipalityId && !user?.email) return [];
      
      let query = supabase
        .from('pilots')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (myMunicipalityId) {
        const { data, error } = await query.eq('municipality_id', myMunicipalityId);
        if (error) throw error;
        return data || [];
      } else if (user?.email) {
        const { data, error } = await query.eq('created_by', user.email);
        if (error) throw error;
        return data || [];
      }
      return [];
    },
    enabled: !!myMunicipalityId || !!user?.email
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['my-rd-projects', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('rd_projects')
        .select('*')
        .eq('created_by', user.email)
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  const { data: ownedChallenges = [] } = useQuery({
    queryKey: ['owned-challenges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('challenge_owner_email', user.email)
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  // Escalated challenges - server-side filtering
  const { data: escalatedChallenges = [] } = useQuery({
    queryKey: ['escalated-challenges', myMunicipalityId],
    queryFn: async () => {
      if (!myMunicipalityId) return [];
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('municipality_id', myMunicipalityId)
        .gt('escalation_level', 0)
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!myMunicipalityId
  });

  // Pending reviews - server-side filtering
  const { data: pendingReviews = [] } = useQuery({
    queryKey: ['pending-reviews', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('status', 'submitted')
        .eq('review_assigned_to', user.email)
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  // Citizen ideas - server-side filtering (approved ideas not yet converted)
  const { data: citizenIdeas = [] } = useQuery({
    queryKey: ['municipality-citizen-ideas', myMunicipalityId],
    queryFn: async () => {
      if (!myMunicipalityId) return [];
      const { data, error } = await supabase
        .from('citizen_ideas')
        .select('*')
        .eq('municipality_id', myMunicipalityId)
        .eq('status', 'approved'); // 'approved' status means not yet converted
      if (error) throw error;
      return data || [];
    },
    enabled: !!myMunicipalityId
  });

  const { data: matchedSolutions = [] } = useQuery({
    queryKey: ['matched-solutions-feed', challenges.length],
    queryFn: async () => {
      if (challenges.length === 0) return [];
      const myChallengeIds = challenges.map(c => c.id);
      const { data, error } = await supabase
        .from('challenge_solution_matches')
        .select('*')
        .in('challenge_id', myChallengeIds)
        .eq('status', 'pending')
        .gte('match_score', 70)
        .limit(5);
      if (error) return [];
      return data || [];
    },
    enabled: challenges.length > 0
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['municipality-activities', challenges.length],
    queryFn: async () => {
      if (challenges.length === 0) return [];
      const myChallengeIds = challenges.map(c => c.id);
      const { data, error } = await supabase
        .from('challenge_activities')
        .select('*')
        .in('challenge_id', myChallengeIds)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) return [];
      return data || [];
    },
    enabled: challenges.length > 0
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*');
      if (error) return [];
      return data || [];
    }
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipalities')
        .select('*');
      if (error) return [];
      return data || [];
    }
  });

  const { data: regionalPrograms = [] } = useQuery({
    queryKey: ['regional-programs', myMunicipality?.region_id],
    queryFn: async () => {
      if (!myMunicipality) return [];
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_published', true);
      if (error) return [];
      return (data || []).filter(p => 
        p.region_targets?.includes(myMunicipality?.region_id) ||
        p.municipality_targets?.includes(myMunicipality?.id) ||
        (!p.region_targets && !p.municipality_targets)
      );
    },
    enabled: !!myMunicipality
  });

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    const result = await invokeAI({
      prompt: `Analyze the Municipality Innovation ecosystem:

Total Municipalities: ${municipalities.length}
Average MII Score: ${(municipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / municipalities.length).toFixed(1)}
My Challenges: ${challenges.length}
My Pilots: ${pilots.length}

Provide:
1. Key innovation gaps in my municipality
2. Recommended priority areas
3. Peer municipalities to learn from
4. Quick wins for MII improvement
5. Collaboration opportunities`,
      response_json_schema: {
        type: 'object',
        properties: {
          innovation_gaps: { type: 'array', items: { type: 'string' } },
          priority_areas: { type: 'array', items: { type: 'string' } },
          peer_learning: { type: 'array', items: { type: 'string' } },
          quick_wins: { type: 'array', items: { type: 'string' } },
          collaboration_opportunities: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    
    if (result.success && result.data) {
      setAiInsights(result.data);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Building2}
        title={t({ en: 'Municipality Hub', ar: 'مركز البلدية' })}
        description={t({ en: 'Manage your innovation initiatives', ar: 'إدارة مبادرات الابتكار' })}
        stats={[
          { icon: AlertCircle, value: challenges.length, label: t({ en: 'Challenges', ar: 'التحديات' }) },
          { icon: TestTube, value: pilots.length, label: t({ en: 'Pilots', ar: 'التجارب' }) },
          { icon: TrendingUp, value: myMunicipality?.mii_score?.toFixed(1) || '—', label: t({ en: 'MII Score', ar: 'مؤشر MII' }) },
        ]}
        action={
          <Button onClick={handleAIInsights} variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
          </Button>
        }
      />

      {/* Alert Banners */}
      {escalatedChallenges.length > 0 && (
        <Card className="border-2 border-red-400 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900">
                  {escalatedChallenges.length} {t({ en: 'Escalated Challenge(s) Need Attention', ar: 'تحديات متصاعدة تحتاج انتباه' })}
                </p>
                <p className="text-sm text-red-700">
                  {t({ en: 'SLA violations detected - immediate action required', ar: 'انتهاكات SLA - مطلوب إجراء فوري' })}
                </p>
              </div>
              <Link to={createPageUrl('MyChallenges') + '?filter=escalated'}>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  {t({ en: 'Review Now', ar: 'مراجعة الآن' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingReviews.length > 0 && (
        <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-600 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">
                  {pendingReviews.length} {t({ en: 'Challenge(s) Awaiting Your Review', ar: 'تحديات تنتظر مراجعتك' })}
                </p>
                <p className="text-sm text-yellow-700">
                  {t({ en: 'You have been assigned as reviewer', ar: 'تم تعيينك كمراجع' })}
                </p>
              </div>
              <Link to={createPageUrl('ChallengeReviewQueue')}>
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  {t({ en: 'Review Queue', ar: 'قائمة المراجعة' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {citizenIdeas.length > 0 && (
        <Card className="border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-purple-900">
                  {citizenIdeas.length} {t({ en: 'Citizen Idea(s) Ready to Convert', ar: 'أفكار مواطنين جاهزة للتحويل' })}
                </p>
                <p className="text-sm text-purple-700">
                  {t({ en: 'Approved ideas from your municipality', ar: 'أفكار معتمدة من بلديتك' })}
                </p>
              </div>
              <Link to={createPageUrl('IdeasManagement') + `?municipality=${myMunicipality?.id}`}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  {t({ en: 'View Ideas', ar: 'عرض الأفكار' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MII Profile Card */}
      {myMunicipality && (
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-teal-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {language === 'ar' && myMunicipality.name_ar ? myMunicipality.name_ar : myMunicipality.name_en}
              </CardTitle>
              <Link to={createPageUrl('MunicipalityProfile') + `?id=${myMunicipality.id}`}>
                <Button size="sm" variant="outline">
                  {t({ en: 'View Profile', ar: 'عرض الملف' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'MII Score', ar: 'مؤشر الابتكار' })}</p>
                <div className="text-4xl font-bold text-blue-600">{myMunicipality.mii_score || 0}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">{t({ en: 'National Rank', ar: 'الترتيب الوطني' })}</p>
                <div className="text-3xl font-bold text-teal-600">#{myMunicipality.mii_rank || '-'}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-white rounded-lg">
                <div className="text-2xl font-bold text-red-600">{myMunicipality.active_challenges || 0}</div>
                <div className="text-xs text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</div>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{myMunicipality.active_pilots || 0}</div>
                <div className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</div>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">{myMunicipality.completed_pilots || 0}</div>
                <div className="text-xs text-slate-600">{t({ en: 'Complete', ar: 'مكتمل' })}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Completeness & First Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCompletenessCoach profile={userProfile} role="municipality_admin" />
        <FirstActionRecommender user={{ role: 'municipality_admin', email: authUser?.email || user?.email || '' }} />
      </div>

      {/* Progressive Profiling Prompt */}
      <ProgressiveProfilingPrompt />

      {/* Municipality AI Tools */}
      {myMunicipality && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MIIImprovementAI municipality={myMunicipality} />
          <PeerBenchmarkingTool municipality={myMunicipality} />
        </div>
      )}

      {showAIInsights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Sparkles className="h-5 w-5" />
                {t({ en: 'AI Strategic Insights', ar: 'رؤى استراتيجية ذكية' })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing...', ar: 'يحلل...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiInsights.innovation_gaps?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Innovation Gaps', ar: 'فجوات الابتكار' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.innovation_gaps.map((gap, i) => (
                        <li key={i} className="text-slate-700">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.priority_areas?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Priority Areas', ar: 'مجالات الأولوية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.priority_areas.map((area, i) => (
                        <li key={i} className="text-slate-700">• {area}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.peer_learning?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Peer Learning', ar: 'التعلم من الأقران' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.peer_learning.map((peer, i) => (
                        <li key={i} className="text-slate-700">• {peer}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.quick_wins?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Quick Wins', ar: 'نجاحات سريعة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.quick_wins.map((win, i) => (
                        <li key={i} className="text-slate-700">• {win}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.collaboration_opportunities?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Collaboration', ar: 'فرص التعاون' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.collaboration_opportunities.map((opp, i) => (
                        <li key={i} className="text-slate-700">• {opp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pending Tasks Widget */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-orange-600" />
              {t({ en: 'Pending Tasks', ar: 'المهام المعلقة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReviews.length > 0 && (
              <Link to={createPageUrl('ChallengeReviewQueue')}>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-400 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-700" />
                      <span className="text-sm font-medium text-yellow-900">
                        {t({ en: 'Reviews', ar: 'مراجعات' })}
                      </span>
                    </div>
                    <Badge className="bg-yellow-600 text-white">{pendingReviews.length}</Badge>
                  </div>
                </div>
              </Link>
            )}
            
            {challenges.filter(c => c.treatment_plan?.milestones?.some(m => m.status !== 'completed')).length > 0 && (
              <Link to={createPageUrl('MyChallenges') + '?filter=in_treatment'}>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-700" />
                      <span className="text-sm font-medium text-purple-900">
                        {t({ en: 'Milestones Due', ar: 'معالم مستحقة' })}
                      </span>
                    </div>
                    <Badge className="bg-purple-600 text-white">
                      {challenges.filter(c => c.treatment_plan?.milestones?.some(m => m.status !== 'completed')).length}
                    </Badge>
                  </div>
                </div>
              </Link>
            )}

            {escalatedChallenges.length > 0 && (
              <Link to={createPageUrl('MyChallenges') + '?filter=escalated'}>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 hover:border-red-400 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-red-700" />
                      <span className="text-sm font-medium text-red-900">
                        {t({ en: 'SLA Violations', ar: 'انتهاكات SLA' })}
                      </span>
                    </div>
                    <Badge className="bg-red-600 text-white">{escalatedChallenges.filter(c => c.escalation_level === 2).length}</Badge>
                  </div>
                </div>
              </Link>
            )}

            {citizenIdeas.length > 0 && (
              <Link to={createPageUrl('IdeasManagement') + `?municipality=${myMunicipality?.id}`}>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-purple-700" />
                      <span className="text-sm font-medium text-purple-900">
                        {t({ en: 'Ideas to Convert', ar: 'أفكار للتحويل' })}
                      </span>
                    </div>
                    <Badge className="bg-purple-600 text-white">{citizenIdeas.length}</Badge>
                  </div>
                </div>
              </Link>
            )}

            {pendingReviews.length === 0 && escalatedChallenges.length === 0 && challenges.filter(c => c.treatment_plan?.milestones?.some(m => m.status !== 'completed')).length === 0 && citizenIdeas.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">{t({ en: 'All caught up!', ar: 'كل شيء محدث!' })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={createPageUrl('ChallengeCreate')}>
              <Button className="w-full justify-start bg-gradient-to-r from-red-600 to-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Submit Challenge', ar: 'تقديم تحدي' })}
              </Button>
            </Link>
            <Link to={createPageUrl('PilotCreate')}>
              <Button variant="outline" className="w-full justify-start">
                <TestTube className="h-4 w-4 mr-2" />
                {t({ en: 'Design Pilot', ar: 'تصميم تجربة' })}
              </Button>
            </Link>
            <Link to={createPageUrl('Solutions')}>
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                {t({ en: 'Find Solutions', ar: 'البحث عن حلول' })}
              </Button>
            </Link>
            <Link to={createPageUrl('IdeasManagement') + `?municipality=${myMunicipality?.id}`}>
              <Button variant="outline" className="w-full justify-start">
                <Lightbulb className="h-4 w-4 mr-2" />
                {t({ en: 'Review Ideas', ar: 'مراجعة الأفكار' })}
              </Button>
            </Link>
            <Link to={createPageUrl('ChallengeSolutionMatching')}>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'AI Matching', ar: 'المطابقة الذكية' })}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Matched Solutions Feed */}
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-teal-600" />
              {t({ en: 'New Solution Matches', ar: 'مطابقات حلول جديدة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {matchedSolutions.length > 0 ? (
              matchedSolutions.map((match) => {
                const challenge = challenges.find(c => c.id === match.challenge_id);
                return (
                  <div key={match.id} className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-teal-600 text-white text-xs">{match.match_score}% Match</Badge>
                      <Badge variant="outline" className="text-xs">{challenge?.code}</Badge>
                    </div>
                    <p className="text-xs text-slate-700 mb-1 truncate">{match.solution_name}</p>
                    <Link to={createPageUrl(`ChallengeSolutionMatching?challenge_id=${match.challenge_id}`)}>
                      <Button size="sm" variant="outline" className="w-full text-xs mt-2">
                        {t({ en: 'Review Match', ar: 'مراجعة المطابقة' })}
                      </Button>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">{t({ en: 'No new matches', ar: 'لا توجد مطابقات جديدة' })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-blue-600" />
              {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const challenge = challenges.find(c => c.id === activity.challenge_id);
                return (
                  <div key={activity.id} className="p-2 bg-blue-50 rounded border border-blue-100">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 truncate">{activity.description}</p>
                        <p className="text-xs text-slate-500">{challenge?.code}</p>
                        <p className="text-xs text-slate-400">{new Date(activity.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">{t({ en: 'No recent activity', ar: 'لا يوجد نشاط حديث' })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t({ en: 'My Challenges Overview', ar: 'نظرة عامة على تحدياتي' })}</CardTitle>
              <Link to={createPageUrl('MyChallenges')}>
                <Button variant="outline" size="sm">
                  {t({ en: 'View All', ar: 'عرض الكل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Status Breakdown */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-slate-700">{challenges.filter(c => c.status === 'draft').length}</div>
                <div className="text-xs text-slate-500">{t({ en: 'Draft', ar: 'مسودة' })}</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-700">{challenges.filter(c => c.status === 'submitted').length}</div>
                <div className="text-xs text-slate-500">{t({ en: 'Submitted', ar: 'مقدمة' })}</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="text-lg font-bold text-yellow-700">{challenges.filter(c => c.status === 'under_review').length}</div>
                <div className="text-xs text-slate-500">{t({ en: 'Review', ar: 'مراجعة' })}</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-700">{challenges.filter(c => c.status === 'approved').length}</div>
                <div className="text-xs text-slate-500">{t({ en: 'Approved', ar: 'معتمد' })}</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-700">{challenges.filter(c => c.status === 'in_treatment').length}</div>
                <div className="text-xs text-slate-500">{t({ en: 'Treatment', ar: 'معالجة' })}</div>
              </div>
            </div>

            {/* Recent Challenges */}
            <div className="space-y-3">
              {challenges.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5).map((challenge) => (
                <Link
                  key={challenge.id}
                  to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}
                  className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">{challenge.code}</Badge>
                        <Badge className={
                          challenge.status === 'approved' ? 'bg-green-100 text-green-700' :
                          challenge.status === 'in_treatment' ? 'bg-purple-100 text-purple-700' :
                          challenge.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                          challenge.status === 'resolved' ? 'bg-teal-100 text-teal-700' :
                          'bg-slate-100 text-slate-700'
                        }>{challenge.status}</Badge>
                        {challenge.escalation_level > 0 && (
                          <Badge className="bg-red-600 text-white text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            SLA
                          </Badge>
                        )}
                        {challenge.challenge_owner_email === user?.email && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {t({ en: 'Owner', ar: 'مالك' })}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-slate-900 mb-1">
                        {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span>{challenge.sector?.replace(/_/g, ' ')}</span>
                        {challenge.track && <span>• {challenge.track}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">{challenge.overall_score || 0}</div>
                      <div className="text-xs text-slate-500">{t({ en: 'Score', ar: 'نقاط' })}</div>
                    </div>
                  </div>
                </Link>
              ))}
              {challenges.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t({ en: 'No challenges yet', ar: 'لا توجد تحديات بعد' })}</p>
                  <Link to={createPageUrl('ChallengeCreate')}>
                    <Button className="mt-3 bg-red-600">
                      <Plus className="h-4 w-4 mr-2" />
                      {t({ en: 'Create First Challenge', ar: 'إنشاء أول تحدي' })}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Owned Challenges (Separate from Created) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-blue-600" />
                {t({ en: 'Challenges I Own', ar: 'التحديات التي أملكها' })}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {ownedChallenges.length > 0 ? (
              ownedChallenges.slice(0, 4).map((challenge) => (
                <Link key={challenge.id} to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="font-mono text-xs">{challenge.code}</Badge>
                      <Badge className={
                        challenge.status === 'in_treatment' ? 'bg-purple-100 text-purple-700 text-xs' :
                        challenge.status === 'approved' ? 'bg-green-100 text-green-700 text-xs' :
                        'bg-blue-100 text-blue-700 text-xs'
                      }>{challenge.status}</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                    </p>
                    {challenge.treatment_plan?.milestones && (
                      <div className="mt-2 text-xs text-slate-600">
                        {challenge.treatment_plan.milestones.filter(m => m.status === 'completed').length}/{challenge.treatment_plan.milestones.length} {t({ en: 'milestones', ar: 'معالم' })}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-6">
                <Shield className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">{t({ en: 'No owned challenges', ar: 'لا توجد تحديات مملوكة' })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategic Alignment & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Pipeline by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Challenge Pipeline', ar: 'خط التحديات' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to={createPageUrl('MyChallenges') + '?status=draft'}>
              <div className="p-3 bg-slate-50 rounded-lg border hover:border-slate-400 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-900">{t({ en: 'Drafts', ar: 'مسودات' })}</span>
                  </div>
                  <Badge variant="outline">{challenges.filter(c => c.status === 'draft').length}</Badge>
                </div>
              </div>
            </Link>
            
            <Link to={createPageUrl('MyChallenges') + '?status=submitted'}>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">{t({ en: 'In Review', ar: 'قيد المراجعة' })}</span>
                  </div>
                  <Badge className="bg-blue-600 text-white">{challenges.filter(c => c.status === 'submitted' || c.status === 'under_review').length}</Badge>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl('MyChallenges') + '?status=approved'}>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">{t({ en: 'Approved', ar: 'معتمدة' })}</span>
                  </div>
                  <Badge className="bg-green-600 text-white">{challenges.filter(c => c.status === 'approved').length}</Badge>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl('MyChallenges') + '?status=in_treatment'}>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</span>
                  </div>
                  <Badge className="bg-purple-600 text-white">{challenges.filter(c => c.status === 'in_treatment').length}</Badge>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl('MyChallenges') + '?status=resolved'}>
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 hover:border-teal-400 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium text-teal-900">{t({ en: 'Resolved', ar: 'محلولة' })}</span>
                  </div>
                  <Badge className="bg-teal-600 text-white">{challenges.filter(c => c.status === 'resolved').length}</Badge>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Treatment Progress Tracker */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-green-600" />
              {t({ en: 'Treatment Progress', ar: 'تقدم المعالجة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {challenges.filter(c => c.status === 'in_treatment' && c.treatment_plan).slice(0, 4).map((challenge) => {
              const milestones = challenge.treatment_plan?.milestones || [];
              const completed = milestones.filter(m => m.status === 'completed').length;
              const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
              
              return (
                <Link key={challenge.id} to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs font-mono">{challenge.code}</Badge>
                      <Badge className="bg-green-600 text-white text-xs">{progress}%</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>{completed}/{milestones.length} {t({ en: 'milestones', ar: 'معالم' })}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {challenges.filter(c => c.status === 'in_treatment').length === 0 && (
              <div className="text-center py-6">
                <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">{t({ en: 'No active treatments', ar: 'لا توجد معالجات نشطة' })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategic Alignment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-indigo-600" />
                {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
              </CardTitle>
              <Link to={createPageUrl('StrategyCockpit')}>
                <Button size="sm" variant="outline">
                  {t({ en: 'Details', ar: 'التفاصيل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {strategicPlans.slice(0, 3).map((plan) => {
              const linkedCount = challenges.filter(c => 
                c.strategic_plan_ids?.includes(plan.id)
              ).length;
              return (
                <div key={plan.id} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-indigo-900 truncate">
                      {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
                    </p>
                    <Badge variant="outline" className="text-xs">{linkedCount} {t({ en: 'challenges', ar: 'تحديات' })}</Badge>
                  </div>
                  <div className="text-xs text-slate-600">
                    {linkedCount > 0 ? (
                      <span className="text-green-700">✓ {t({ en: 'Contributing', ar: 'مساهم' })}</span>
                    ) : (
                      <span className="text-slate-500">{t({ en: 'No active challenges', ar: 'لا توجد تحديات نشطة' })}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Solutions Widget */}
      {myMunicipality && challenges.length > 0 && (
        <QuickSolutionsMarketplace municipalityId={myMunicipality.id} challenges={challenges} />
      )}

      {/* Policy Tracker */}
      {myMunicipality && (
        <MunicipalPolicyTracker municipalityId={myMunicipality.id} />
      )}

      {/* Programs & Capacity Building */}
      {regionalPrograms.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-pink-600" />
                {t({ en: 'Available Programs for Your Region', ar: 'البرامج المتاحة لمنطقتك' })}
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
              {regionalPrograms.filter(p => p.status === 'applications_open' || p.status === 'active').slice(0, 6).map((program) => (
                <Link key={program.id} to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                  <Card className="hover:shadow-lg transition-all border-2 hover:border-pink-400">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={
                          program.status === 'applications_open' ? 'bg-green-100 text-green-700 text-xs' :
                          'bg-blue-100 text-blue-700 text-xs'
                        }>{program.status?.replace(/_/g, ' ')}</Badge>
                        <Badge variant="outline" className="text-xs">{program.program_type?.replace(/_/g, ' ')}</Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                      </h3>
                      {program.timeline?.application_close && (
                        <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{t({ en: 'Closes:', ar: 'يغلق:' })} {new Date(program.timeline.application_close).toLocaleDateString()}</span>
                        </div>
                      )}
                      <Link to={createPageUrl('ProgramApplicationWizard')}>
                        <Button size="sm" className="w-full bg-pink-600 mt-2">
                          {t({ en: 'Apply', ar: 'تقديم' })}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pilots & R&D + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</CardTitle>
              <Link to={createPageUrl('MyPilots')}>
                <Button variant="outline" size="sm">{t({ en: 'All', ar: 'الكل' })}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pilots.filter(p => ['active', 'monitoring', 'preparation'].includes(p.stage)).slice(0, 4).map((pilot) => (
                <Link
                  key={pilot.id}
                  to={createPageUrl(`PilotDetail?id=${pilot.id}`)}
                  className="block p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="font-mono text-xs">{pilot.code}</Badge>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">{pilot.stage}</Badge>
                  </div>
                  <h3 className="font-medium text-slate-900 text-sm mb-1 truncate">
                    {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                  </h3>
                  {pilot.timeline?.pilot_end && (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Calendar className="h-3 w-3" />
                      <span>{t({ en: 'Ends:', ar: 'ينتهي:' })} {new Date(pilot.timeline.pilot_end).toLocaleDateString()}</span>
                    </div>
                  )}
                </Link>
              ))}
              {pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length === 0 && (
                <div className="text-center py-6">
                  <TestTube className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">{t({ en: 'No active pilots', ar: 'لا توجد تجارب نشطة' })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t({ en: 'R&D Projects', ar: 'مشاريع البحث' })}</CardTitle>
              <Link to={createPageUrl('MyRDProjects')}>
                <Button variant="outline" size="sm">{t({ en: 'All', ar: 'الكل' })}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rdProjects.slice(0, 4).map((project) => (
                <Link
                  key={project.id}
                  to={createPageUrl(`RDProjectDetail?id=${project.id}`)}
                  className="block p-3 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="font-mono text-xs">{project.code}</Badge>
                    <Badge className={
                      project.status === 'active' ? 'bg-green-100 text-green-700 text-xs' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-700 text-xs' :
                      'bg-slate-100 text-slate-700 text-xs'
                    }>{project.status}</Badge>
                  </div>
                  <h3 className="font-medium text-slate-900 text-sm truncate">
                    {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                    <span>TRL: {project.trl_current || project.trl_start || 0}</span>
                  </div>
                </Link>
              ))}
              {rdProjects.length === 0 && (
                <div className="text-center py-6">
                  <Microscope className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">{t({ en: 'No R&D projects', ar: 'لا توجد مشاريع بحث' })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance vs Peers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                {t({ en: 'Performance', ar: 'الأداء' })}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {myMunicipality && (
              <>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-slate-700">{t({ en: 'MII Score', ar: 'مؤشر الابتكار' })}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{myMunicipality.mii_score || 0}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{t({ en: 'National Rank', ar: 'الترتيب الوطني' })}</span>
                  <span className="text-xl font-bold text-teal-600">#{myMunicipality.mii_rank || '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-slate-700">{t({ en: 'Resolution Rate', ar: 'معدل الحل' })}</span>
                  <span className="text-xl font-bold text-green-600">
                    {challenges.length > 0 
                      ? Math.round((challenges.filter(c => c.status === 'resolved').length / challenges.length) * 100)
                      : 0}%
                  </span>
                </div>
                <Link to={createPageUrl('MII')}>
                  <Button size="sm" variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t({ en: 'View MII Details', ar: 'تفاصيل المؤشر' })}
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(MunicipalityDashboard, { requiredPermissions: [] });