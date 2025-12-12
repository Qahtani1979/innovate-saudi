import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { Building2, FileText, CheckCircle2, Target, Award, Users } from 'lucide-react';
import { toast } from 'sonner';
import ScreeningChecklist from '../components/matchmaker/ScreeningChecklist';
import EvaluationRubrics from '../components/matchmaker/EvaluationRubrics';
import StrategicChallengeMapper from '../components/matchmaker/StrategicChallengeMapper';
import ClassificationDashboard from '../components/matchmaker/ClassificationDashboard';
import StakeholderReviewGate from '../components/matchmaker/StakeholderReviewGate';
import ExecutiveReviewGate from '../components/matchmaker/ExecutiveReviewGate';
import MatchQualityGate from '../components/matchmaker/MatchQualityGate';
import EngagementReadinessGate from '../components/matchmaker/EngagementReadinessGate';
import MatchmakerEngagementHub from '../components/matchmaker/MatchmakerEngagementHub';
import ProviderPerformanceScorecard from '../components/matchmaker/ProviderPerformanceScorecard';
import EnhancedMatchingEngine from '../components/matchmaker/EnhancedMatchingEngine';
import PilotConversionWizard from '../components/matchmaker/PilotConversionWizard';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

export default function MatchmakerApplicationDetail() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const applicationId = urlParams.get('id');

  const { data: application, isLoading } = useQuery({
    queryKey: ['matchmaker-application', applicationId],
    queryFn: async () => {
      const apps = await base44.entities.MatchmakerApplication.list();
      return apps.find(a => a.id === applicationId);
    },
    enabled: !!applicationId
  });

  const { data: matchedChallenges = [] } = useQuery({
    queryKey: ['matched-challenges', applicationId],
    queryFn: async () => {
      if (!application?.matched_challenges?.length) return [];
      const challenges = await base44.entities.Challenge.list();
      return challenges.filter(c => application.matched_challenges.includes(c.id));
    },
    enabled: !!application
  });

  const { data: convertedPilots = [] } = useQuery({
    queryKey: ['converted-pilots', applicationId],
    queryFn: async () => {
      const pilots = await base44.entities.Pilot.list();
      return pilots.filter(p => p.solution_id === application.organization_id);
    },
    enabled: !!application
  });

  const { data: expertEvaluations = [] } = useQuery({
    queryKey: ['matchmaker-expert-evaluations', applicationId],
    queryFn: async () => {
      const all = await base44.entities.ExpertEvaluation.list();
      return all.filter(e => e.entity_type === 'matchmaker_application' && e.entity_id === applicationId);
    },
    enabled: !!applicationId
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MatchmakerApplication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['matchmaker-application', applicationId]);
      toast.success(t({ en: 'Updated successfully', ar: 'تم التحديث بنجاح' }));
    }
  });

  const createEvaluationSession = useMutation({
    mutationFn: (sessionData) => base44.entities.MatchmakerEvaluationSession.create({
      application_id: applicationId,
      ...sessionData
    }),
    onSuccess: (response) => {
      // Update application with calculated scores
      const baseScore = response.calculated_base_score;
      const bonusPoints = application.strategic_challenges?.reduce((sum, c) => sum + (c.bonus_points || 0), 0) || 0;
      const totalScore = baseScore + bonusPoints;

      let classification = 'not_qualified';
      if (totalScore >= 85 && baseScore >= 75 && bonusPoints >= 10) {
        classification = 'fast_pass';
      } else if (totalScore >= 75) {
        classification = 'strong_qualified';
      } else if (totalScore >= 60) {
        classification = 'conditional';
      }

      updateMutation.mutate({
        id: applicationId,
        data: {
          evaluation_score: {
            ...response.scores,
            base_score: baseScore,
            bonus_points: bonusPoints,
            total_score: totalScore
          },
          classification,
          stage: 'detailed_evaluation',
          evaluation_date: new Date().toISOString().split('T')[0]
        }
      });
    }
  });

  if (isLoading) {
    return <div className="text-center py-12">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div>;
  }

  if (!application) {
    return <div className="text-center py-12">{t({ en: 'Application not found', ar: 'لم يتم العثور على الطلب' })}</div>;
  }

  return (
    <PageLayout>
      <PageHeader
        icon={Building2}
        title={language === 'ar' && application.organization_name_ar ? application.organization_name_ar : application.organization_name_en}
        description={application.application_code}
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline">{application.stage?.replace(/_/g, ' ')}</Badge>
            {application.classification && (
              <Badge className={
                application.classification === 'fast_pass' ? 'bg-purple-600' :
                application.classification === 'strong_qualified' ? 'bg-green-600' :
                application.classification === 'conditional' ? 'bg-amber-600' : 'bg-red-600'
              }>
                {application.classification.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
        }
      />

      {/* Classification Dashboard (if evaluated) */}
      {application.evaluation_score && (
        <ClassificationDashboard application={application} />
      )}

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="grid w-full grid-cols-11 text-xs">
          <TabsTrigger value="info">{t({ en: 'Info', ar: 'معلومات' })}</TabsTrigger>
          <TabsTrigger value="screening">{t({ en: 'Screen', ar: 'فحص' })}</TabsTrigger>
          <TabsTrigger value="stakeholder">{t({ en: 'Stake', ar: 'أطراف' })}</TabsTrigger>
          <TabsTrigger value="evaluation">{t({ en: 'Eval', ar: 'تقييم' })}</TabsTrigger>
          <TabsTrigger value="challenges">{t({ en: 'Align', ar: 'مواءمة' })}</TabsTrigger>
          <TabsTrigger value="executive">{t({ en: 'Exec', ar: 'قيادة' })}</TabsTrigger>
          <TabsTrigger value="matching">{t({ en: 'Match', ar: 'مطابقة' })}</TabsTrigger>
          <TabsTrigger value="quality">{t({ en: 'Quality', ar: 'جودة' })}</TabsTrigger>
          <TabsTrigger value="engagement">{t({ en: 'Engage', ar: 'مشاركة' })}</TabsTrigger>
          <TabsTrigger value="experts">{t({ en: 'Experts', ar: 'خبراء' })}</TabsTrigger>
          <TabsTrigger value="conversion">{t({ en: 'Convert', ar: 'تحويل' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t({ en: 'Application Details', ar: 'تفاصيل الطلب' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-600">{t({ en: 'HQ:', ar: 'المقر:' })}</span> <span className="font-medium">{application.headquarters_location}</span></div>
                <div><span className="text-slate-600">{t({ en: 'Founded:', ar: 'التأسيس:' })}</span> <span className="font-medium">{application.year_established}</span></div>
                <div><span className="text-slate-600">{t({ en: 'Stage:', ar: 'المرحلة:' })}</span> <span className="font-medium">{application.company_stage?.replace(/_/g, ' ')}</span></div>
                <div><span className="text-slate-600">{t({ en: 'Website:', ar: 'الموقع:' })}</span> <a href={application.website} target="_blank" className="text-blue-600 hover:underline">{application.website}</a></div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Sectors:', ar: 'القطاعات:' })}</p>
                <div className="flex flex-wrap gap-2">
                  {application.sectors?.map((sector, i) => (
                    <Badge key={i} variant="outline">{sector.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </div>

              {application.collaboration_approach && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Collaboration Approach:', ar: 'نهج التعاون:' })}</p>
                  <p className="text-sm text-slate-600 p-4 bg-slate-50 rounded-lg">{application.collaboration_approach}</p>
                </div>
              )}

              {application.portfolio_url && (
                <div>
                  <a href={application.portfolio_url} target="_blank">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      {t({ en: 'View Portfolio', ar: 'عرض الملف' })}
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening" className="mt-6">
          <ScreeningChecklist
            application={application}
            onComplete={(screeningData) => {
              updateMutation.mutate({
                id: applicationId,
                data: {
                  intake_gate: screeningData,
                  stage: screeningData.passed ? 'stakeholder_review' : 'screening'
                }
              });
            }}
          />
        </TabsContent>

        <TabsContent value="stakeholder" className="mt-6">
          <StakeholderReviewGate
            application={application}
            onComplete={(reviewData) => {
              updateMutation.mutate({
                id: applicationId,
                data: {
                  stakeholder_review_gate: reviewData,
                  stage: reviewData.passed ? 'detailed_evaluation' : 'stakeholder_review'
                }
              });
            }}
          />
        </TabsContent>

        <TabsContent value="evaluation" className="mt-6">
          <EvaluationRubrics
            application={application}
            sessionType="post_meeting"
            onSave={(sessionData) => createEvaluationSession.mutate(sessionData)}
          />
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <StrategicChallengeMapper
            application={application}
            onUpdate={(challenges) => {
              const bonusPoints = challenges.reduce((sum, c) => sum + (c.bonus_points || 0), 0);
              updateMutation.mutate({
                id: applicationId,
                data: { 
                  strategic_challenges: challenges,
                  'evaluation_score.bonus_points': bonusPoints
                }
              });
            }}
          />
        </TabsContent>

        <TabsContent value="executive" className="mt-6">
          <ExecutiveReviewGate
            application={application}
            onComplete={(executiveData) => {
              updateMutation.mutate({
                id: applicationId,
                data: {
                  executive_review_gate: {
                    ...executiveData,
                    submitted_to_executive: true,
                    decision_date: new Date().toISOString().split('T')[0]
                  },
                  stage: executiveData.decision === 'approved' ? 'approved' : 
                         executiveData.decision === 'rejected' ? 'rejected' : 'on_hold'
                }
              });
            }}
          />
        </TabsContent>

        <TabsContent value="matching" className="mt-6">
          <EnhancedMatchingEngine
            application={application}
            onMatchComplete={(matches) => {
              updateMutation.mutate({
                id: applicationId,
                data: {
                  matched_challenges: matches.map(m => m.id)
                }
              });
            }}
          />
        </TabsContent>

        <TabsContent value="quality" className="mt-6">
          <MatchQualityGate
            application={application}
            matchedChallenges={matchedChallenges}
            onApprove={(qualityData) => {
              updateMutation.mutate({
                id: applicationId,
                data: {
                  match_quality_score: qualityData.overall_quality,
                  stage: qualityData.overall_quality >= 75 ? 'engagement' : 'matching'
                }
              });
            }}
          />
        </TabsContent>

        <TabsContent value="engagement" className="mt-6 space-y-6">
          <EngagementReadinessGate
            application={application}
            onComplete={(readinessData) => {
              updateMutation.mutate({
                id: applicationId,
                data: {
                  engagement_readiness: readinessData,
                  stage: readinessData.passed ? 'engagement' : 'matching'
                }
              });
            }}
          />
          
          <MatchmakerEngagementHub
            application={application}
            onUpdate={(data) => {
              updateMutation.mutate({
                id: applicationId,
                data
              });
            }}
          />

          <ProviderPerformanceScorecard
            application={application}
            pilots={convertedPilots}
          />
        </TabsContent>

        <TabsContent value="experts" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Expert Evaluations', ar: 'تقييمات الخبراء' })}
                </CardTitle>
                <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=matchmaker_application&entity_id=${applicationId}`)} target="_blank">
                  <Button size="sm" className="bg-purple-600">
                    <Users className="h-4 w-4 mr-2" />
                    {t({ en: 'Assign Experts', ar: 'تعيين خبراء' })}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {expertEvaluations.length > 0 ? (
                <div className="space-y-4">
                  {expertEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900">{evaluation.expert_email}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(evaluation.evaluation_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-purple-600">{evaluation.overall_score}</div>
                          <Badge className={
                            evaluation.recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                            evaluation.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {evaluation.recommendation?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-sm font-bold text-green-600">{evaluation.feasibility_score}</div>
                          <div className="text-xs text-slate-600">{t({ en: 'Feasibility', ar: 'الجدوى' })}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-sm font-bold text-blue-600">{evaluation.strategic_alignment_score}</div>
                          <div className="text-xs text-slate-600">{t({ en: 'Alignment', ar: 'التوافق' })}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-sm font-bold text-amber-600">{evaluation.innovation_score}</div>
                          <div className="text-xs text-slate-600">{t({ en: 'Innovation', ar: 'الابتكار' })}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-sm font-bold text-red-600">{evaluation.risk_score}</div>
                          <div className="text-xs text-slate-600">{t({ en: 'Risk', ar: 'المخاطر' })}</div>
                        </div>
                      </div>

                      {evaluation.feedback_text && (
                        <div className="p-3 bg-white rounded border">
                          <p className="text-sm text-slate-700">{evaluation.feedback_text}</p>
                        </div>
                      )}

                      {evaluation.strengths && evaluation.strengths.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-green-700 mb-1">{t({ en: 'Strengths:', ar: 'نقاط القوة:' })}</p>
                          <ul className="text-xs text-slate-700 space-y-1">
                            {evaluation.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">{t({ en: 'No expert evaluations yet', ar: 'لا توجد تقييمات خبراء' })}</p>
                  <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=matchmaker_application&entity_id=${applicationId}`)} target="_blank">
                    <Button className="bg-purple-600">
                      <Users className="h-4 w-4 mr-2" />
                      {t({ en: 'Assign Experts Now', ar: 'تعيين خبراء الآن' })}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="mt-6">
          <PilotConversionWizard
            application={application}
            challenge={matchedChallenges[0]}
            onClose={() => {}}
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}