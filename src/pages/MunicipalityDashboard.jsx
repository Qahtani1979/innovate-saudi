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

import {
  Building2, AlertCircle, TestTube, TrendingUp, Sparkles, Loader2, X
} from 'lucide-react';
import MunicipalPolicyTracker from '../components/policy/MunicipalPolicyTracker';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import EscalatedChallengesAlert from '../components/municipalities/alerts/EscalatedChallengesAlert';
import PendingReviewsAlert from '../components/municipalities/alerts/PendingReviewsAlert';
import CitizenIdeasAlert from '../components/municipalities/alerts/CitizenIdeasAlert';
import PendingTasksWidget from '../components/municipalities/widgets/PendingTasksWidget';
import QuickActionsWidget from '../components/municipalities/widgets/QuickActionsWidget';
import MatchedSolutionsWidget from '../components/municipalities/widgets/MatchedSolutionsWidget';
import ActivityFeedWidget from '../components/municipalities/widgets/ActivityFeedWidget';
import MIIProfileCard from '../components/municipalities/dashboard/MIIProfileCard';
import ChallengesOverviewCard from '../components/municipalities/dashboard/ChallengesOverviewCard';
import PilotsOverviewCard from '../components/municipalities/dashboard/PilotsOverviewCard';
import RDProjectsCard from '../components/municipalities/dashboard/RDProjectsCard';
import OwnedChallengesCard from '../components/municipalities/dashboard/OwnedChallengesCard';
import StrategicAlignmentSection from '../components/municipalities/dashboard/StrategicAlignmentSection';
import RegionalProgramsSection from '../components/municipalities/dashboard/RegionalProgramsSection';
import MunicipalityHighlightCard from '../components/municipalities/dashboard/MunicipalityHighlightCard';

function MunicipalityDashboard() {
  const { language, isRTL, t } = useLanguage();
  const { user: authUser, userProfile } = useAuth();
  const [user, setUser] = React.useState(null);
  const [showAIInsights, setShowAIInsights] = React.useState(false);
  const [aiInsights, setAiInsights] = React.useState(null);

  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();

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
  const { data: challenges = [] } = useQuery({
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
  const { data: pilots = [] } = useQuery({
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
        .select('*')
        .or('is_template.is.null,is_template.eq.false')
        .or('is_deleted.is.null,is_deleted.eq.false');
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
        .eq('is_deleted', false)
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
      <EscalatedChallengesAlert escalatedChallenges={escalatedChallenges} t={t} />

      <PendingReviewsAlert pendingReviews={pendingReviews} t={t} />

      <CitizenIdeasAlert citizenIdeas={citizenIdeas} myMunicipality={myMunicipality} t={t} />

      {/* MII Profile Card */}
      <MunicipalityHighlightCard myMunicipality={myMunicipality} t={t} language={language} />

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
        <PendingTasksWidget
          pendingReviews={pendingReviews}
          escalatedChallenges={escalatedChallenges}
          challenges={challenges}
          citizenIdeas={citizenIdeas}
          myMunicipality={myMunicipality}
          t={t}
        />

        <QuickActionsWidget myMunicipality={myMunicipality} t={t} />

        <MatchedSolutionsWidget matchedSolutions={matchedSolutions} challenges={challenges} t={t} />

        <ActivityFeedWidget recentActivities={recentActivities} challenges={challenges} t={t} />
      </div>


      {/* Main Content Grid */}
      < div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >
        <ChallengesOverviewCard challenges={challenges} user={user} t={t} language={language} />

        {/* Owned Challenges (Separate from Created) */}
        <OwnedChallengesCard ownedChallenges={ownedChallenges} t={t} language={language} />
      </div >

      {/* Strategic Alignment & Performance */}
      <StrategicAlignmentSection challenges={challenges} strategicPlans={strategicPlans} t={t} language={language} />

      {/* Recommended Solutions Widget */}
      {
        myMunicipality && challenges.length > 0 && (
          <QuickSolutionsMarketplace municipalityId={myMunicipality.id} challenges={challenges} />
        )
      }

      {/* Policy Tracker */}
      {
        myMunicipality && (
          <MunicipalPolicyTracker municipalityId={myMunicipality.id} />
        )
      }

      <RegionalProgramsSection regionalPrograms={regionalPrograms} t={t} language={language} />

      {/* Pilots & R&D + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PilotsOverviewCard pilots={pilots} t={t} language={language} />

        <RDProjectsCard rdProjects={rdProjects} t={t} language={language} />

        {/* Performance vs Peers */}
        <MIIProfileCard myMunicipality={myMunicipality} challenges={challenges} t={t} />
      </div>
    </PageLayout >
  );
}

export default ProtectedPage(MunicipalityDashboard, { requiredPermissions: [] });