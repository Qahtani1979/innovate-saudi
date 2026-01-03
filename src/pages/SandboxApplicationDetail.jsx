import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Shield, FileText, Users, AlertTriangle, CheckCircle2, XCircle, MessageSquare, Send, Calendar, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ApprovalStageProgress from '../components/approval/ApprovalStageProgress';
import SandboxAIRiskAssessment from '../components/SandboxAIRiskAssessment';
import AutomatedComplianceChecker from '../components/AutomatedComplianceChecker';
import SandboxCertificationWorkflow from '../components/sandboxes/SandboxCertificationWorkflow';
import { useSandboxApplication, useSandboxApplicationMutations } from '@/hooks/useSandboxApplications';
import { useSandbox } from '@/hooks/useSandbox';
import { useExpertEvaluationsByEntity } from '@/hooks/useExpertData';
import { useAuth } from '@/lib/AuthContext';

export default function SandboxApplicationDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const appId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const [comment, setComment] = useState('');

  const { data: application, isLoading } = useSandboxApplication(appId);
  const { data: sandbox } = useSandbox(application?.sandbox_id);
  const { data: expertTechnicalReviews = [] } = useExpertEvaluationsByEntity('sandbox_application', appId);

  const { updateApplication } = useSandboxApplicationMutations();

  const handlePostComment = () => {
    if (!application || !comment) return;

    const updatedComments = [
      ...(application.review_comments || []),
      {
        reviewer: user?.user_metadata?.full_name || user?.email || 'Current User',
        role: 'reviewer', // Ideally distinguish role based on user perm
        stage: application.current_review_stage,
        comment: comment,
        date: new Date().toISOString()
      }
    ];

    updateApplication.mutate(
      { id: appId, data: { review_comments: updatedComments } },
      {
        onSuccess: () => {
          setComment('');
          toast.success('Comment added');
        }
      }
    );
  };

  if (isLoading || !application) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    active: 'bg-teal-100 text-teal-700',
    completed: 'bg-slate-100 text-slate-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusConfig = {
    draft: { color: 'bg-slate-100 text-slate-700', icon: FileText },
    submitted: { color: 'bg-blue-100 text-blue-700', icon: Send },
    under_review: { color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
    technical_review: { color: 'bg-purple-100 text-purple-700', icon: Shield },
    legal_review: { color: 'bg-amber-100 text-amber-700', icon: FileText },
    safety_review: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    active: { color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
    completed: { color: 'bg-slate-100 text-slate-700', icon: CheckCircle2 },
    rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
    withdrawn: { color: 'bg-gray-100 text-gray-700', icon: XCircle }
  };

  const statusInfo = statusConfig[application.status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {application.status?.replace(/_/g, ' ')}
                </Badge>
                {sandbox && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                    {sandbox.name_en}
                  </Badge>
                )}
                {application.current_review_stage && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                    {application.current_review_stage} review
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {application.project_title}
              </h1>
              <p className="text-xl text-white/90">{application.applicant_organization}</p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{application.duration_months} months</span>
                </div>
                {application.start_date && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Starts {application.start_date}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                {t({ en: 'Edit', ar: 'تعديل' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Duration', ar: 'المدة' })}</p>
                <p className="text-3xl font-bold text-blue-600">{application.duration_months}m</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Team Size', ar: 'حجم الفريق' })}</p>
                <p className="text-3xl font-bold text-purple-600">{application.team_members?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                <p className="text-xl font-bold text-amber-600">{application.budget_range?.replace(/_/g, ' ')}</p>
              </div>
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Exemptions', ar: 'الإعفاءات' })}</p>
                <p className="text-3xl font-bold text-green-600">{application.requested_exemptions?.length || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Progress */}
      <ApprovalStageProgress application={application} />

      {/* AI Analysis */}
      {sandbox && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SandboxAIRiskAssessment application={application} sandbox={sandbox} />
          <AutomatedComplianceChecker application={application} sandbox={sandbox} />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 h-auto">
          <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
            <FileText className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex flex-col gap-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Details', ar: 'تفاصيل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex flex-col gap-1 py-3">
            <Users className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Team', ar: 'فريق' })}</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex flex-col gap-1 py-3">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Safety', ar: 'سلامة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="exemptions" className="flex flex-col gap-1 py-3">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Exemptions', ar: 'إعفاءات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex flex-col gap-1 py-3">
            <Award className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Experts', ar: 'خبراء' })}</span>
          </TabsTrigger>
          <TabsTrigger value="certification" className="flex flex-col gap-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Certify', ar: 'اعتماد' })}</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex flex-col gap-1 py-3">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Comments', ar: 'تعليقات' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Project Overview', ar: 'نظرة عامة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">{t({ en: 'Description', ar: 'الوصف' })}</p>
                <p className="text-sm text-slate-600">{application.project_description}</p>
              </div>
              {application.testing_scope && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">{t({ en: 'Testing Scope', ar: 'نطاق الاختبار' })}</p>
                  <p className="text-sm text-slate-600">{application.testing_scope}</p>
                </div>
              )}
              {application.expected_outcomes && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">{t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}</p>
                  <p className="text-sm text-slate-600">{application.expected_outcomes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Project Details', ar: 'تفاصيل المشروع' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">{t({ en: 'Start Date', ar: 'تاريخ البدء' })}</p>
                  <p className="text-sm text-slate-600">{application.start_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{t({ en: 'Duration', ar: 'المدة' })}</p>
                  <p className="text-sm text-slate-600">{application.duration_months} months</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{t({ en: 'Budget Range', ar: 'نطاق الميزانية' })}</p>
                  <p className="text-sm text-slate-600">{application.budget_range?.replace(/_/g, ' ')}</p>
                </div>
                {application.funding_source && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t({ en: 'Funding Source', ar: 'مصدر التمويل' })}</p>
                    <p className="text-sm text-slate-600">{application.funding_source}</p>
                  </div>
                )}
              </div>
              {application.success_metrics && application.success_metrics.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}</p>
                  <div className="space-y-2">
                    {application.success_metrics.map((metric, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-medium">{metric.metric}</p>
                        <p className="text-xs text-slate-600">Target: {metric.target}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {application.team_members && application.team_members.length > 0 ? (
                <div className="space-y-3">
                  {application.team_members.map((member, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-600">{member.role}</p>
                          {member.email && <p className="text-xs text-slate-500">{member.email}</p>}
                          {member.qualifications && (
                            <p className="text-xs text-slate-500 mt-1">{member.qualifications}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No team members listed', ar: 'لا يوجد أعضاء فريق' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Safety & Risk', ar: 'السلامة والمخاطر' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">{t({ en: 'Risk Assessment', ar: 'تقييم المخاطر' })}</p>
                <p className="text-sm text-slate-600">{application.risk_assessment}</p>
              </div>
              {application.risk_mitigation_plan && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">{t({ en: 'Mitigation Plan', ar: 'خطة التخفيف' })}</p>
                  <p className="text-sm text-slate-600">{application.risk_mitigation_plan}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">{t({ en: 'Public Safety Plan', ar: 'خطة السلامة العامة' })}</p>
                <p className="text-sm text-slate-600">{application.public_safety_plan}</p>
              </div>
              {application.environmental_impact && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">{t({ en: 'Environmental Impact', ar: 'الأثر البيئي' })}</p>
                  <p className="text-sm text-slate-600">{application.environmental_impact}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exemptions">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Requested Exemptions', ar: 'الإعفاءات المطلوبة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {application.requested_exemptions && application.requested_exemptions.length > 0 ? (
                <div className="space-y-2">
                  {application.requested_exemptions.map((exemption, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{exemption}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No exemptions requested', ar: 'لا توجد إعفاءات مطلوبة' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Expert Technical Reviews', ar: 'المراجعات الفنية للخبراء' })}
                </CardTitle>
                <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=sandbox_application&entity_id=${appId}`)} target="_blank">
                  <Button size="sm" className="bg-purple-600">
                    <Users className="h-4 w-4 mr-2" />
                    {t({ en: 'Assign Experts', ar: 'تعيين خبراء' })}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {expertTechnicalReviews.length > 0 ? (
                <div className="space-y-4">
                  {expertTechnicalReviews.map((evaluation) => (
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
                          <div className="text-sm font-bold text-blue-600">{evaluation.technical_quality_score}</div>
                          <div className="text-xs text-slate-600">{t({ en: 'Tech Quality', ar: 'الجودة' })}</div>
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

                      {evaluation.risk_factors && evaluation.risk_factors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-red-700 mb-1">{t({ en: 'Risk Factors:', ar: 'عوامل المخاطر:' })}</p>
                          <ul className="text-xs text-slate-700 space-y-1">
                            {evaluation.risk_factors.map((r, i) => (
                              <li key={i}>• {r}</li>
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
                  <p className="text-slate-500 mb-4">{t({ en: 'No expert reviews yet', ar: 'لا توجد مراجعات' })}</p>
                  <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=sandbox_application&entity_id=${appId}`)} target="_blank">
                    <Button className="bg-purple-600">
                      <Users className="h-4 w-4 mr-2" />
                      {t({ en: 'Assign Technical Experts', ar: 'تعيين خبراء فنيين' })}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certification">
          {sandbox && (
            <SandboxCertificationWorkflow sandboxId={sandbox.id} />
          )}
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Review Comments', ar: 'تعليقات المراجعة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.review_comments && application.review_comments.length > 0 ? (
                <div className="space-y-3">
                  {application.review_comments.map((c, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900">{c.reviewer}</p>
                          <p className="text-xs text-slate-500">{c.role} - {c.stage} stage</p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{c.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No comments yet', ar: 'لا توجد تعليقات' })}
                </p>
              )}

              <div className="space-y-3 pt-4 border-t">
                <Textarea
                  placeholder={t({ en: 'Add a review comment...', ar: 'إضافة تعليق...' })}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handlePostComment}
                  disabled={!comment || updateApplication.isPending}
                  className="bg-gradient-to-r from-blue-600 to-teal-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t({ en: 'Post Comment', ar: 'نشر التعليق' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
