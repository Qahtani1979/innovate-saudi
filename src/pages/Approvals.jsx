import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle2, XCircle, Clock, AlertCircle, TestTube, Microscope, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

export default function Approvals() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState({});
  const [aiBriefs, setAiBriefs] = useState({});
  const { invokeAI, status, isLoading: generatingBrief, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [currentBriefId, setCurrentBriefId] = useState(null);

  const { data: challenges = [] } = useQuery({
    queryKey: ['pending-challenges'],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.status === 'submitted' || c.status === 'under_review');
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pending-pilots'],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => p.stage === 'approval_pending');
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ entity, id, newStatus }) => {
      if (entity === 'Challenge') {
        return base44.entities.Challenge.update(id, { status: newStatus });
      } else {
        return base44.entities.Pilot.update(id, { stage: newStatus });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-challenges']);
      queryClient.invalidateQueries(['pending-pilots']);
      toast.success(t({ en: 'Action completed', ar: 'تم الإجراء' }));
    }
  });

  const handleApprove = (entity, id) => {
    const newStatus = entity === 'Challenge' ? 'approved' : 'approved';
    approveMutation.mutate({ entity, id, newStatus });
  };

  const handleReject = (entity, id) => {
    const newStatus = entity === 'Challenge' ? 'draft' : 'design';
    approveMutation.mutate({ entity, id, newStatus });
  };

  const generateAIBrief = async (entity, id) => {
    setCurrentBriefId(id);
    const item = entity === 'Challenge' ? challenges.find(c => c.id === id) : pilots.find(p => p.id === id);
    
    const prompt = entity === 'Challenge' 
      ? `Generate approval decision brief for this challenge:
Title: ${item.title_en}
Sector: ${item.sector}
Priority: ${item.priority}
Description: ${item.description_en?.substring(0, 300)}
Score: ${item.overall_score}

Provide: approval recommendation (approve/reject/conditional), rationale, key risks, required actions, suggested track (pilot/R&D/policy)`
      : `Generate approval decision brief for this pilot:
Title: ${item.title_en}
Sector: ${item.sector}
Budget: ${item.budget} ${item.budget_currency}
Duration: ${item.duration_weeks} weeks
Success Probability: ${item.success_probability}%
KPIs: ${item.kpis?.length || 0} defined

Provide: approval recommendation, budget assessment, risk analysis, readiness score, required conditions`;

    const response = await invokeAI({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendation: { type: "string", enum: ["approve", "reject", "conditional"] },
          rationale: { type: "string" },
          key_risks: { type: "array", items: { type: "string" } },
          conditions: { type: "array", items: { type: "string" } },
          readiness_score: { type: "number" }
        }
      }
    });
    
    if (response.success) {
      setAiBriefs({ ...aiBriefs, [id]: response.data });
      toast.success('AI decision brief generated');
    } else {
      toast.error('Failed to generate brief');
    }
    setCurrentBriefId(null);
  };

  const totalPending = challenges.length + pilots.length;

  return (
    <PageLayout>
      <PageHeader
        icon={Clock}
        title={t({ en: 'Approvals & Reviews', ar: 'الموافقات والمراجعات' })}
        description={t({ en: 'Review and approve pending submissions', ar: 'مراجعة والموافقة على الطلبات المعلقة' })}
        stats={[
          { icon: Clock, value: totalPending, label: t({ en: 'Pending', ar: 'معلق' }) },
          { icon: TestTube, value: challenges.length, label: t({ en: 'Challenges', ar: 'تحديات' }) },
          { icon: Microscope, value: pilots.length, label: t({ en: 'Pilots', ar: 'تجارب' }) },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
                <p className="text-3xl font-bold text-yellow-600">{challenges.length + pilots.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'التحديات' })}</p>
                <p className="text-3xl font-bold text-red-600">{challenges.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
                <p className="text-3xl font-bold text-blue-600">{pilots.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Today', ar: 'اليوم' })}</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="challenges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges">{t({ en: 'Challenges', ar: 'التحديات' })} ({challenges.length})</TabsTrigger>
          <TabsTrigger value="pilots">{t({ en: 'Pilots', ar: 'التجارب' })} ({pilots.length})</TabsTrigger>
          <TabsTrigger value="completed">{t({ en: 'Completed', ar: 'المكتمل' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges">
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{challenge.code}</Badge>
                          <Badge>{challenge.status}</Badge>
                          <Badge variant="outline">{challenge.sector?.replace(/_/g, ' ')}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {language === 'ar' && challenge.description_ar ? challenge.description_ar : challenge.description_en}
                        </p>
                      </div>
                      <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                        <Button variant="outline" size="sm">
                          {t({ en: 'View', ar: 'عرض' })}
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg text-sm">
                      <div>
                        <span className="text-slate-500">{t({ en: 'Priority:', ar: 'الأولوية:' })}</span>
                        <p className="font-medium">{challenge.priority}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">{t({ en: 'Score:', ar: 'النقاط:' })}</span>
                        <p className="font-medium">{challenge.overall_score || 0}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">{t({ en: 'Submitted:', ar: 'تاريخ التقديم:' })}</span>
                        <p className="font-medium text-xs">{new Date(challenge.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <Textarea
                      placeholder={t({ en: 'Add review comments...', ar: 'أضف تعليقات المراجعة...' })}
                      value={comments[challenge.id] || ''}
                      onChange={(e) => setComments({ ...comments, [challenge.id]: e.target.value })}
                      rows={2}
                    />

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleApprove('Challenge', challenge.id)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 flex-1"
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t({ en: 'Approve', ar: 'موافقة' })}
                      </Button>
                      <Button
                        onClick={() => handleReject('Challenge', challenge.id)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                        disabled={approveMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t({ en: 'Return', ar: 'إرجاع' })}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {challenges.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">{t({ en: 'No pending challenges', ar: 'لا توجد تحديات معلقة' })}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pilots">
          <div className="space-y-4">
            {pilots.map((pilot) => (
              <Card key={pilot.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{pilot.code}</Badge>
                          <Badge>{pilot.stage}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {pilot.sector?.replace(/_/g, ' ')} • {pilot.duration_weeks}w • {pilot.budget ? `${(pilot.budget / 1000).toFixed(0)}K SAR` : 'TBD'}
                        </p>
                      </div>
                      <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                        <Button variant="outline" size="sm">
                          {t({ en: 'View', ar: 'عرض' })}
                        </Button>
                      </Link>
                    </div>

                    <div className="mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateAIBrief('Pilot', pilot.id)}
                        disabled={generatingBrief[pilot.id]}
                        className="mb-2"
                      >
                        {generatingBrief[pilot.id] ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                        ) : (
                          <><Sparkles className="h-4 w-4 mr-2" /> AI Decision Brief</>
                        )}
                      </Button>
                      
                      {aiBriefs[pilot.id] && (
                        <div className={`p-3 rounded-lg border-2 mb-3 ${
                          aiBriefs[pilot.id].recommendation === 'approve' ? 'bg-green-50 border-green-300' :
                          aiBriefs[pilot.id].recommendation === 'reject' ? 'bg-red-50 border-red-300' :
                          'bg-yellow-50 border-yellow-300'
                        }`}>
                          <p className="text-sm font-semibold mb-2">
                            AI Recommends: {aiBriefs[pilot.id].recommendation.toUpperCase()}
                            {aiBriefs[pilot.id].readiness_score && ` (${aiBriefs[pilot.id].readiness_score}% ready)`}
                          </p>
                          <p className="text-sm text-slate-700 mb-2">{aiBriefs[pilot.id].rationale}</p>
                          {aiBriefs[pilot.id].key_risks?.length > 0 && (
                            <div className="text-xs text-slate-600">
                              <span className="font-medium">Risks:</span> {aiBriefs[pilot.id].key_risks.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Textarea
                      placeholder={t({ en: 'Add review comments...', ar: 'أضف تعليقات المراجعة...' })}
                      value={comments[pilot.id] || ''}
                      onChange={(e) => setComments({ ...comments, [pilot.id]: e.target.value })}
                      rows={2}
                    />

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleApprove('Pilot', pilot.id)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 flex-1"
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t({ en: 'Approve Pilot', ar: 'الموافقة على التجربة' })}
                      </Button>
                      <Button
                        onClick={() => handleReject('Pilot', pilot.id)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                        disabled={approveMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t({ en: 'Return', ar: 'إرجاع' })}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pilots.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">{t({ en: 'No pending pilots', ar: 'لا توجد تجارب معلقة' })}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-700 font-medium">{t({ en: 'No completed approvals today', ar: 'لا توجد موافقات مكتملة اليوم' })}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}