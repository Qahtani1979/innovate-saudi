import { useState } from 'react';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useRDCallsWithVisibility } from '@/hooks/useRDCallsWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, ArrowRight, Loader2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  buildFirstActionPrompt,
  FIRST_ACTION_SYSTEM_PROMPT,
  FIRST_ACTION_SCHEMA
} from '@/lib/ai/prompts/onboarding/firstAction';

export default function FirstActionRecommender({ user }) {
  const { language, t } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  // Fetch approved/published challenges
  const { data: challenges = [] } = useChallengesWithVisibility({
    status: 'approved',
    limit: 5,
    publishedOnly: true
  });

  // Fetch published R&D calls
  const { data: rdCalls = [] } = useRDCallsWithVisibility({
    status: 'published',
    limit: 5
  });

  const userRole = user?.role || 'citizen';

  const getRecommendations = async () => {
    const { success, data } = await invokeAI({
      system_prompt: FIRST_ACTION_SYSTEM_PROMPT,
      prompt: buildFirstActionPrompt({
        userRole,
        emailDomain: user?.email?.split('@')[1],
        challenges: challenges.slice(0, 3).map(c => c.title_en).join(', '),
        rdCalls: rdCalls.map(r => r.title_en).join(', ')
      }),
      response_json_schema: FIRST_ACTION_SCHEMA
    });

    if (success && data) {
      setRecommendations(data);
    }
  };

  const roleBasedQuickActions = {
    municipality_admin: [
      { label: t({ en: 'Submit First Challenge', ar: 'إرسال التحدي الأول' }), page: 'ChallengeCreate' },
      { label: t({ en: 'View Open Pilots', ar: 'عرض التجارب المفتوحة' }), page: 'Pilots' },
      { label: t({ en: 'Complete City Profile', ar: 'إكمال ملف المدينة' }), page: 'MunicipalityDashboard' }
    ],
    startup_user: [
      { label: t({ en: 'Browse Challenges', ar: 'تصفح التحديات' }), page: 'Challenges' },
      { label: t({ en: 'Complete Solution Profile', ar: 'إكمال ملف الحل' }), page: 'SolutionCreate' },
      { label: t({ en: 'Join Matchmaker', ar: 'انضم للمطابقة' }), page: 'MatchmakerJourney' }
    ],
    researcher: [
      { label: t({ en: 'Explore R&D Calls', ar: 'استكشاف طلبات البحث' }), page: 'RDCalls' },
      { label: t({ en: 'Complete Researcher Profile', ar: 'إكمال ملف الباحث' }), page: 'ResearcherProfile' },
      { label: t({ en: 'Browse Living Labs', ar: 'تصفح المختبرات الحية' }), page: 'LivingLabs' }
    ],
    citizen: [
      { label: t({ en: 'Submit Your First Idea', ar: 'أرسل فكرتك الأولى' }), page: 'CitizenIdeaSubmission' },
      { label: t({ en: 'Respond to a Challenge', ar: 'الرد على تحدي' }), page: 'ChallengeIdeaResponse' },
      { label: t({ en: 'Vote on Ideas', ar: 'صوت للأفكار' }), page: 'PublicIdeasBoard' }
    ],
    user: [
      { label: t({ en: 'Submit Your First Idea', ar: 'أرسل فكرتك الأولى' }), page: 'CitizenIdeaSubmission' },
      { label: t({ en: 'Respond to a Challenge', ar: 'الرد على تحدي' }), page: 'ChallengeIdeaResponse' },
      { label: t({ en: 'Vote on Ideas', ar: 'صوت للأفكار' }), page: 'PublicIdeasBoard' }
    ],
    viewer: [
      { label: t({ en: 'Browse Public Ideas', ar: 'تصفح الأفكار العامة' }), page: 'PublicIdeasBoard' },
      { label: t({ en: 'View Upcoming Events', ar: 'عرض الفعاليات القادمة' }), page: 'EventCalendar' },
      { label: t({ en: 'Read Latest News', ar: 'اقرأ آخر الأخبار' }), page: 'News' }
    ],
    admin: [
      { label: t({ en: 'Review Pending Challenges', ar: 'مراجعة التحديات المعلقة' }), page: 'ChallengeReviewQueue' },
      { label: t({ en: 'Check System Health', ar: 'فحص صحة النظام' }), page: 'SystemHealthDashboard' },
      { label: t({ en: 'View Analytics', ar: 'عرض التحليلات' }), page: 'ExecutiveDashboard' }
    ]
  };

  const quickActions = roleBasedQuickActions[userRole] || roleBasedQuickActions.citizen || [];

  // Helper to safely create page URLs
  const safePageUrl = (page) => page ? createPageUrl(page) : '/citizen-dashboard';

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          {t({ en: 'Recommended First Actions', ar: 'الإجراءات الأولى الموصى بها' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />

        {!recommendations ? (
          <div>
            <div className="text-center py-6 mb-4">
              <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-4">
                {t({ en: 'Get AI-powered recommendations for your first action', ar: 'احصل على توصيات ذكية لإجراءك الأول' })}
              </p>
              <Button onClick={getRecommendations} disabled={isLoading || !isAvailable} className="bg-purple-600">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Get AI Recommendations', ar: 'احصل على التوصيات الذكية' })}
              </Button>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-3">
                {t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}
              </h4>
              <div className="space-y-2">
                {quickActions.map((action, i) => (
                  <Link key={i} to={safePageUrl(action.page)}>
                    <button className="w-full text-left p-3 bg-white hover:bg-purple-50 rounded-lg border border-slate-200 transition-colors flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{action.label}</span>
                      <ArrowRight className="h-4 w-4 text-purple-600" />
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-600">Primary</Badge>
                <h4 className="font-bold text-purple-900">{recommendations.primary.action}</h4>
              </div>
              <p className="text-sm text-slate-700 mb-3">{recommendations.primary.reason}</p>
              <Link to={safePageUrl(recommendations.primary?.page)}>
                <Button className="bg-purple-600 w-full">
                  {t({ en: 'Start Now', ar: 'ابدأ الآن' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {recommendations.secondary && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600">Secondary</Badge>
                  <h4 className="font-semibold text-blue-900">{recommendations.secondary.action}</h4>
                </div>
                <p className="text-sm text-slate-700 mb-2">{recommendations.secondary.reason}</p>
                <Link to={safePageUrl(recommendations.secondary?.page)}>
                  <Button variant="outline" size="sm">
                    {t({ en: 'View', ar: 'عرض' })}
                  </Button>
                </Link>
              </div>
            )}

            {recommendations.quick_win && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600">Quick Win</Badge>
                  <h4 className="font-semibold text-green-900">{recommendations.quick_win.action}</h4>
                </div>
                <p className="text-sm text-slate-700 mb-2">{recommendations.quick_win.reason}</p>
                <Link to={safePageUrl(recommendations.quick_win?.page)}>
                  <Button variant="outline" size="sm">
                    {t({ en: 'View', ar: 'عرض' })}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}