import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, ArrowRight, Loader2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';

export default function FirstActionRecommender({ user }) {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-open'],
    queryFn: () => base44.entities.Challenge.filter({ status: 'approved' }, '-created_date', 5),
    initialData: []
  });

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['rd-calls-open'],
    queryFn: () => base44.entities.RDCall.filter({ status: 'published' }, '-created_date', 3),
    initialData: []
  });

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Recommend the most impactful first action for this user:

User Role: ${user.role}
User Email Domain: ${user.email.split('@')[1]}
Available Challenges: ${challenges.slice(0, 3).map(c => c.title_en).join(', ')}
Available R&D Calls: ${rdCalls.map(r => r.title_en).join(', ')}

Based on their role and platform needs, recommend:
1. Primary action (most impactful)
2. Secondary action
3. Quick win action

For municipality users: focus on submitting challenges
For startup users: focus on browsing challenges and submitting proposals
For researchers: focus on exploring R&D calls
For admins: focus on reviewing submissions`,
        response_json_schema: {
          type: "object",
          properties: {
            primary: {
              type: "object",
              properties: {
                action: { type: "string" },
                reason: { type: "string" },
                page: { type: "string" }
              }
            },
            secondary: {
              type: "object",
              properties: {
                action: { type: "string" },
                reason: { type: "string" },
                page: { type: "string" }
              }
            },
            quick_win: {
              type: "object",
              properties: {
                action: { type: "string" },
                reason: { type: "string" },
                page: { type: "string" }
              }
            }
          }
        }
      });

      setRecommendations(response);
    } catch (error) {
      toast.error(t({ en: 'Failed to get recommendations', ar: 'فشل الحصول على التوصيات' }));
    } finally {
      setLoading(false);
    }
  };

  const roleBasedQuickActions = {
    municipality_admin: [
      { label: 'Submit First Challenge', page: 'ChallengeCreate' },
      { label: 'View Open Pilots', page: 'Pilots' },
      { label: 'Complete City Profile', page: 'MunicipalityDashboard' }
    ],
    startup_user: [
      { label: 'Browse Challenges', page: 'Challenges' },
      { label: 'Complete Solution Profile', page: 'SolutionCreate' },
      { label: 'Join Matchmaker', page: 'MatchmakerJourney' }
    ],
    researcher: [
      { label: 'Explore R&D Calls', page: 'RDCalls' },
      { label: 'Complete Researcher Profile', page: 'ResearcherProfile' },
      { label: 'Browse Living Labs', page: 'LivingLabs' }
    ],
    admin: [
      { label: 'Review Pending Challenges', page: 'ChallengeReviewQueue' },
      { label: 'Check System Health', page: 'SystemHealthDashboard' },
      { label: 'View Analytics', page: 'ExecutiveDashboard' }
    ]
  };

  const quickActions = roleBasedQuickActions[user.role] || roleBasedQuickActions.admin;

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          {t({ en: 'Recommended First Actions', ar: 'الإجراءات الأولى الموصى بها' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {!recommendations ? (
          <div>
            <div className="text-center py-6 mb-4">
              <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-4">
                {t({ en: 'Get AI-powered recommendations for your first action', ar: 'احصل على توصيات ذكية لإجراءك الأول' })}
              </p>
              <Button onClick={getRecommendations} disabled={loading} className="bg-purple-600">
                {loading ? (
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
                  <Link key={i} to={createPageUrl(action.page)}>
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
              <Link to={createPageUrl(recommendations.primary.page)}>
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
                <Link to={createPageUrl(recommendations.secondary.page)}>
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
                <Link to={createPageUrl(recommendations.quick_win.page)}>
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