import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle2, XCircle, Clock, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllProgramApplications } from '@/hooks/useProgramDetails';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
import { useProgramMutations } from '@/hooks/useProgramMutations';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProgramApplicationEvaluationHub() {
  const { language, isRTL, t } = useLanguage();
  const [aiScores, setAiScores] = useState({});
  const [scoringApp, setScoringApp] = useState(null);
  const { invokeAI, isLoading: aiLoading, isAvailable } = useAIWithFallback();

  // Fetch all program applications using the standardized hook
  const { data: applications = [] } = useAllProgramApplications();
  const { data: programs = [] } = useProgramsWithVisibility();
  const { updateApplicationBatch } = useProgramMutations();

  const handleDecision = async (appId, decision) => {
    try {
      await updateApplicationBatch([
        { id: appId, data: { status: decision, evaluation_date: new Date().toISOString() } }
      ]);
    } catch (error) {
      // toast is handled by hook
    }
  };

  const pending = applications.filter(a => ['submitted', 'under_review'].includes(a.status));
  const reviewed = applications.filter(a => ['accepted', 'rejected'].includes(a.status));

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
            <p className="text-3xl font-bold text-green-600">{acceptedApplicants}</p>
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

      {/* Applications */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">{t({ en: 'Pending', ar: 'معلق' })} ({pending.length})</TabsTrigger>
          <TabsTrigger value="reviewed">{t({ en: 'Reviewed', ar: 'تمت المراجعة' })} ({reviewed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pending.length > 0 ? pending.map(app => {
            const aiScore = aiScores[app.id];
            const program = programs.find(p => p.id === app.program_id);
            return (
              <Card key={app.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{app.applicant_name}</h3>
                      <p className="text-sm text-slate-600">{app.organization_name}</p>
                      <Badge className="mt-2" variant="outline">{program?.name_en || 'Program'}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => getAIScore(app)} disabled={(aiLoading && scoringApp === app.id) || !isAvailable}>
                      {aiLoading && scoringApp === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
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
          }) : (
            <Card className="p-12 text-center text-slate-500">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>{t({ en: 'All applications have been reviewed', ar: 'تمت مراجعة جميع الطلبات' })}</p>
            </Card>
          )}
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
