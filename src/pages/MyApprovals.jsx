import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle2, XCircle, Clock, AlertCircle, Sparkles, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function MyApprovals() {
  const { language, isRTL, t } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState({});
  const queryClient = useQueryClient();
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { user } = useAuth();

  const { data: pendingChallenges = [] } = useQuery({
    queryKey: ['pending-challenge-reviews', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('review_assigned_to', user?.email).eq('status', 'under_review');
      return data || [];
    },
    enabled: !!user
  });

  const { data: pendingPilots = [] } = useQuery({
    queryKey: ['pending-pilot-approvals', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*');
      return (data || []).filter(p => 
        p.milestones?.some(m => m.requires_approval && m.approval_status === 'pending') ||
        p.budget_approvals?.some(b => !b.approved && b.approved_by === user?.email)
      );
    },
    enabled: !!user
  });

  const { data: pendingExpertEvaluations = [] } = useQuery({
    queryKey: ['pending-expert-evaluations', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('expert_evaluations').select('*').eq('recommendation', 'approve_with_conditions');
      return (data || []).filter(e => !e.conditions_reviewed);
    },
    enabled: !!user
  });

  const { data: pendingExpertEvaluations = [] } = useQuery({
    queryKey: ['pending-expert-evaluations', user?.email],
    queryFn: async () => {
      const evaluations = await base44.entities.ExpertEvaluation.list();
      return evaluations.filter(e => 
        e.recommendation === 'approve_with_conditions' && 
        !e.conditions_reviewed
      );
    },
    enabled: !!user
  });

  const approveMutation = useMutation({
    mutationFn: async ({ type, id, data }) => {
      if (type === 'challenge') {
        const { error } = await supabase.from('challenges').update(data).eq('id', id);
        if (error) throw error;
      } else if (type === 'pilot') {
        const { error } = await supabase.from('pilots').update(data).eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-challenge-reviews']);
      queryClient.invalidateQueries(['pending-pilot-approvals']);
      toast.success(t({ en: 'Approved successfully', ar: 'تمت الموافقة بنجاح' }));
    }
  });

  const getAIRecommendation = async (item, type) => {
    const result = await invokeAI({
      prompt: `Analyze this ${type} and provide approval recommendation:

${type === 'challenge' ? `Title: ${item.title_en}
Sector: ${item.sector}
Priority: ${item.priority}
Description: ${item.description_en}` : `Title: ${item.title_en}
Stage: ${item.stage}
Budget: ${item.budget}
Success Probability: ${item.success_probability}`}

Provide: 1) Recommendation (APPROVE/DEFER/REJECT), 2) Reasoning, 3) Conditions (if any)`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendation: { type: 'string' },
          reasoning: { type: 'string' },
          conditions: { type: 'string' }
        }
      }
    });

    if (result.success) {
      setAiAnalysis({ ...aiAnalysis, [item.id]: result.data });
    }
  };

  const handleApprove = (type, item) => {
    if (type === 'challenge') {
      approveMutation.mutate({
        type: 'challenge',
        id: item.id,
        data: { status: 'approved', review_date: new Date().toISOString() }
      });
    } else if (type === 'pilot_milestone') {
      const updatedMilestones = item.milestones.map(m => 
        m.requires_approval && m.approval_status === 'pending'
          ? { ...m, approval_status: 'approved', approved_by: user?.email, approval_date: new Date().toISOString() }
          : m
      );
      approveMutation.mutate({
        type: 'pilot',
        id: item.id,
        data: { milestones: updatedMilestones }
      });
    }
  };

  const totalPending = pendingChallenges.length + pendingPilots.length + pendingExpertEvaluations.length;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'My Approvals Queue', ar: 'قائمة موافقاتي' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Items awaiting your approval', ar: 'العناصر في انتظار موافقتك' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{totalPending}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Approvals', ar: 'موافقات معلقة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{pendingChallenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Challenge Reviews', ar: 'مراجعات التحديات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{pendingPilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pilot Approvals', ar: 'موافقات التجارب' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{pendingExpertEvaluations.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Expert Reviews', ar: 'مراجعات الخبراء' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Challenge Reviews */}
      {pendingChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Challenge Reviews', ar: 'مراجعات التحديات' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingChallenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border-2 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{challenge.code}</Badge>
                      <Badge className={challenge.priority === 'tier_1' ? 'bg-red-600' : 'bg-blue-600'}>
                        {challenge.priority}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900">{challenge.title_en}</h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{challenge.description_en}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => getAIRecommendation(challenge, 'challenge')}
                    disabled={aiAnalysis[challenge.id]}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>

                {aiAnalysis[challenge.id] && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-3">
                    <p className="text-sm font-medium text-purple-900">AI Recommendation: {aiAnalysis[challenge.id].recommendation}</p>
                    <p className="text-sm text-slate-700 mt-1">{aiAnalysis[challenge.id].reasoning}</p>
                    {aiAnalysis[challenge.id].conditions && (
                      <p className="text-sm text-amber-700 mt-1">Conditions: {aiAnalysis[challenge.id].conditions}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove('challenge', challenge)}
                    className="bg-green-600"
                    size="sm"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Approve', ar: 'الموافقة' })}
                  </Button>
                  <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                    <Button variant="outline" size="sm">
                      {t({ en: 'Review Details', ar: 'مراجعة التفاصيل' })}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Expert Evaluations */}
      {pendingExpertEvaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'Expert Evaluation Reviews', ar: 'مراجعات تقييمات الخبراء' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingExpertEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-600">{evaluation.entity_type}</Badge>
                      <Badge variant="outline">Score: {evaluation.overall_score}</Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-900">Expert: {evaluation.expert_email}</p>
                    <p className="text-sm text-slate-600 mt-1">Recommendation: {evaluation.recommendation}</p>
                    {evaluation.conditions?.length > 0 && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <p className="text-xs font-semibold text-amber-700">Conditions to review:</p>
                        <ul className="text-xs text-slate-700 mt-1">
                          {evaluation.conditions.slice(0, 3).map((c, i) => (
                            <li key={i}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Accept Conditions', ar: 'قبول الشروط' })}
                  </Button>
                  <Button variant="outline" size="sm">
                    {t({ en: 'View Full Evaluation', ar: 'عرض التقييم الكامل' })}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Pilot Approvals */}
      {pendingPilots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Pilot Milestone Approvals', ar: 'موافقات معالم التجارب' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingPilots.map((pilot) => (
              <div key={pilot.id} className="p-4 border-2 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">{pilot.code}</Badge>
                    <h3 className="font-semibold text-slate-900">{pilot.title_en}</h3>
                    <p className="text-sm text-slate-600">
                      {pilot.milestones?.filter(m => m.requires_approval && m.approval_status === 'pending').length} milestone(s) need approval
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove('pilot_milestone', pilot)}
                    className="bg-green-600"
                    size="sm"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Approve Milestones', ar: 'الموافقة على المعالم' })}
                  </Button>
                  <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                    <Button variant="outline" size="sm">
                      {t({ en: 'Review Details', ar: 'مراجعة التفاصيل' })}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {totalPending === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {t({ en: 'All caught up!', ar: 'كل شيء محدّث!' })}
            </h3>
            <p className="text-slate-600">
              {t({ en: 'No pending approvals at this time', ar: 'لا توجد موافقات معلقة في هذا الوقت' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(MyApprovals, { requiredPermissions: [] });