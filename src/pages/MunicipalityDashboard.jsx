import React from 'react';
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';
import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
import { useCitizenIdeas } from '@/hooks/useCitizenIdeas';
import { useChallengeMatches } from '@/hooks/useChallengeMatches';
import { useChallengeActivities } from '@/hooks/useChallengeActivities';
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
    // Get user from auth context
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email });
    }
  }, [authUser]);

  // Visibility hooks using context automatically
  // Visibility hooks - normalizing data access
  const { data: municipalitiesData } = useMunicipalitiesWithVisibility();
  const municipalitiesList = Array.isArray(municipalitiesData) ? municipalitiesData : (municipalitiesData?.data || []);

  const myMunicipality = municipalitiesList.find(m => m.id === myMunicipalityId) || municipalitiesList[0];

  const { data: challengesData } = useChallengesWithVisibility();
  const challenges = Array.isArray(challengesData) ? challengesData : (challengesData?.data || []);

  const { data: pilotsData } = usePilotsWithVisibility();
  const pilots = Array.isArray(pilotsData) ? pilotsData : (pilotsData?.data || []);

  const { data: rdProjectsData } = useRDProjectsWithVisibility();
  const rdProjects = Array.isArray(rdProjectsData) ? rdProjectsData : (rdProjectsData?.data || []);

  const { data: strategicPlansData } = useStrategiesWithVisibility();
  const strategicPlans = Array.isArray(strategicPlansData) ? strategicPlansData : (strategicPlansData?.data || []);

  const { data: programsData } = useProgramsWithVisibility({ publishedOnly: true });
  const regionalPrograms = Array.isArray(programsData) ? programsData : (programsData?.data || []);

  const { data: ownedChallengesData } = useChallengesWithVisibility();
  const ownedChallenges = Array.isArray(ownedChallengesData) ? ownedChallengesData : (ownedChallengesData?.data || []);

  // Client-side filtering for specific subsets if needed, matching original logic approximation
  // or just accepting the hook's scoped data which is usually better (Org wide vs Personal)

  // Escalated challenges - filter client side from the main challenges list if possible, or use specific hook options if available.
  // The hook returns all challenges visible to user.
  const escalatedChallenges = challenges.filter(c => c.escalation_level > 0);

  // Pending reviews
  const pendingReviews = challenges.filter(c => c.status === 'submitted' && c.review_assigned_to === user?.email);

  // Citizen ideas
  const { data: citizenIdeas = [] } = useCitizenIdeas({
    municipalityId: myMunicipalityId,
    status: 'approved'
  });

  const myChallengeIds = challenges.map(c => c.id);

  const { data: matchedSolutions = [] } = useChallengeMatches({
    challengeIds: myChallengeIds,
    status: 'pending',
    minScore: 70,
    limit: 5
  });

  const { data: recentActivities = [] } = useChallengeActivities({
    challengeIds: myChallengeIds,
    limit: 10
  });

  const municipalities = municipalitiesList; // Reuse existing list

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
      },
      system_prompt: 'You are an expert AI analyst for municipal innovation ecosystems. Analyze specific data points to provide actionable strategic insights.'
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
        action={<Button onClick={handleAIInsights} variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
        </Button>} subtitle={undefined} actions={undefined} children={undefined} />

      {/* Alert Banners */}
      <EscalatedChallengesAlert escalatedChallenges={escalatedChallenges} t={t} />

      <PendingReviewsAlert pendingReviews={pendingReviews} t={t} />

      <CitizenIdeasAlert citizenIdeas={citizenIdeas} myMunicipality={myMunicipality} t={t} />

      {/* MII Profile Card */}
      <MunicipalityHighlightCard myMunicipality={myMunicipality} t={t} language={language} />

      {/* Profile Completeness & First Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCompletenessCoach
          profile={userProfile}
          role="municipality_admin"
          onComplete={() => { }}
          onDismiss={() => { }}
        />
        <FirstActionRecommender user={{ role: 'municipality_admin', email: authUser?.email || user?.email || '' }} />
      </div>

      {/* Progressive Profiling Prompt */}
      <ProgressiveProfilingPrompt onComplete={undefined} onDismiss={undefined} />

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
