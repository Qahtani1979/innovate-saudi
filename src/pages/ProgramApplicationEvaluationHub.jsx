import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
// import { base44 } from '@/api/base44Client'; // Removed legacy client
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle2, XCircle, Clock, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

function ProgramApplicationEvaluationHub() {
  const { language, isRTL, t } = useLanguage();
  const [aiScores, setAiScores] = useState({});
  const [aiInsights, setAiInsights] = useState(null);
  const [scoringApp, setScoringApp] = useState(null);
  const { invokeAI, status, isLoading, rateLimitInfo, isAvailable } = useAIWithFallback();
  const queryClient = useQueryClient();

  const { data: applications = [] } = useQuery({
    queryKey: ['program-applications-eval'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-eval'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('program_applications')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['program-applications-eval']);
      toast.success(t({ en: 'Application updated', ar: 'تم تحديث الطلب' }));
    }
  });

  const pending = applications.filter(a => a.status === 'submitted' || a.status === 'under_review');
  const reviewed = applications.filter(a => a.status === 'accepted' || a.status === 'rejected');

  const totalApplicants = applications.length;
  const acceptedApplicants = applications.filter(a => a.status === 'accepted').length;

  const getAIScore = async (app) => {
    setScoringApp(app.id);
    const result = await invokeAI({
      prompt: `Evaluate this program application and provide scoring:

Applicant: ${app.applicant_name}
Organization: ${app.organization_name || 'N/A'}
Motivation: ${app.motivation || 'N/A'}
Experience: ${app.experience_summary || 'N/A'}

Score on these criteria (0-100):
1. Alignment with program goals
2. Applicant readiness
3. Expected impact
4. Resource availability

Also provide overall recommendation (ACCEPT/DEFER/REJECT) with reasoning.`,
      response_json_schema: {
        type: 'object',
        properties: {
          alignment_score: { type: 'number' },
          readiness_score: { type: 'number' },
          impact_score: { type: 'number' },
          resources_score: { type: 'number' },
          overall_score: { type: 'number' },
          recommendation: { type: 'string' },
          reasoning: { type: 'string' }
        }
      }
    });

    if (result.success) {
      setAiScores({ ...aiScores, [app.id]: result.data });
    }
    setScoringApp(null);
  };

  const handleDecision = (appId, decision) => {
    updateMutation.mutate({
      id: appId,
      data: { status: decision, evaluation_date: new Date().toISOString() }
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Application Evaluation Hub', ar: 'مركز تقييم الطلبات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Review and evaluate program applications', ar: 'مراجعة وتقييم طلبات البرامج' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{applications.filter(a => a.status === 'accepted').length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Accepted', ar: 'مقبول' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{applications.filter(a => a.status === 'rejected').length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Rejected', ar: 'مرفوض' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {totalApplicants > 0 ? Math.round((acceptedApplicants / totalApplicants) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Acceptance Rate', ar: 'معدل القبول' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Portfolio Insights */}
      {aiInsights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Portfolio Analysis', ar: 'تحليل المحفظة الذكي' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Gaps', ar: 'الفجوات' })}</h4>
              <ul className="space-y-1 text-sm">{aiInsights.gaps?.map((g, i) => <li key={i}>• {g}</li>)}</ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Recommendations', ar: 'التوصيات' })}</h4>
              <ul className="space-y-1 text-sm">{aiInsights.recommendations?.map((r, i) => <li key={i}>• {r}</li>)}</ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">{t({ en: 'Pending', ar: 'معلق' })} ({pending.length})</TabsTrigger>
          <TabsTrigger value="reviewed">{t({ en: 'Reviewed', ar: 'تمت المراجعة' })} ({reviewed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pending.map(app => {
            const aiScore = aiScores[app.id];
            return (
              <Card key={app.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{app.applicant_name}</h3>
                      <p className="text-sm text-slate-600">{app.organization_name}</p>
                      <Badge className="mt-2">{app.program_id}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => getAIScore(app)} disabled={(isLoading && scoringApp === app.id) || !isAvailable}>
                      {isLoading && scoringApp === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                  </div>

                  {aiScore && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">AI Score</span>
                        <Badge className="bg-purple-600">{Math.round(aiScore.overall_score)}/100</Badge>
                      </div>
                      <p className="text-sm text-slate-700">{aiScore.recommendation}: {aiScore.reasoning}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600" onClick={() => handleDecision(app.id, 'accepted')}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Accept', ar: 'قبول' })}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDecision(app.id, 'rejected')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      {t({ en: 'Reject', ar: 'رفض' })}
                    </Button>
                    <Link to={createPageUrl(`ProgramApplicationDetail?id=${app.id}`)}>
                      <Button size="sm" variant="outline">{t({ en: 'Details', ar: 'التفاصيل' })}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-3">
          {reviewed.map(app => (
            <Link key={app.id} to={createPageUrl(`ProgramApplicationDetail?id=${app.id}`)}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{app.applicant_name}</h3>
                      <p className="text-sm text-slate-600">{app.organization_name}</p>
                    </div>
                    <Badge className={app.status === 'accepted' ? 'bg-green-600' : 'bg-red-600'}>
                      {app.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(ProgramApplicationEvaluationHub, { requiredPermissions: [], requiredRoles: ['Program Director', 'Program Evaluator'] });