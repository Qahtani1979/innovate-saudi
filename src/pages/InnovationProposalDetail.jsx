import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Lightbulb, User, Calendar, Target, DollarSign, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIProposalScreening from '../components/citizen/AIProposalScreening';
import StakeholderAlignmentGate from '../components/citizen/StakeholderAlignmentGate';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import InnovationProposalWorkflowTab from '../components/citizen/InnovationProposalWorkflowTab';

function InnovationProposalDetail() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('id');

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['innovation-proposal', proposalId],
    queryFn: async () => {
      const proposals = await base44.entities.InnovationProposal.list();
      return proposals.find(p => p.id === proposalId);
    },
    enabled: !!proposalId
  });

  if (isLoading || !proposal) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_evaluation: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    converted: 'bg-purple-100 text-purple-700'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-white/20 text-white border-white/40">{proposal.code}</Badge>
            <Badge className={statusColors[proposal.status]}>{proposal.status?.replace(/_/g, ' ')}</Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/40 capitalize">
              {proposal.proposal_type?.replace(/_/g, ' ')}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-2">{proposal.title_en}</h1>
          {proposal.title_ar && (
            <h2 className="text-2xl font-medium text-white/90" dir="rtl">{proposal.title_ar}</h2>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workflow">{t({ en: 'Workflow', ar: 'سير العمل' })}</TabsTrigger>
          <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'نظرة عامة' })}</TabsTrigger>
          <TabsTrigger value="screening">{t({ en: 'AI Screening', ar: 'الفحص الذكي' })}</TabsTrigger>
          <TabsTrigger value="evaluation">{t({ en: 'Expert Review', ar: 'المراجعة' })}</TabsTrigger>
          <TabsTrigger value="alignment">{t({ en: 'Stakeholder Gate', ar: 'بوابة الأطراف' })}</TabsTrigger>
          <TabsTrigger value="conversion">{t({ en: 'Conversion', ar: 'التحويل' })}</TabsTrigger>
        </TabsList>

        {/* Workflow Tab */}
        <TabsContent value="workflow">
          <div className="space-y-6">
            <InnovationProposalWorkflowTab proposal={proposal} />
            <UnifiedWorkflowApprovalTab
              entityType="InnovationProposal"
              entityId={proposalId}
              currentStage={
                proposal.status === 'submitted' ? 'screening' :
                proposal.status === 'under_evaluation' ? 'review' :
                proposal.stakeholder_alignment_gate?.decision === 'pending' ? 'alignment' :
                proposal.status === 'approved' ? 'approved' :
                proposal.status === 'rejected' ? 'rejected' : 'screening'
              }
            />
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Description', ar: 'الوصف' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{proposal.description_en}</p>
                  {proposal.description_ar && (
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mt-4 border-t pt-4" dir="rtl">
                      {proposal.description_ar}
                    </p>
                  )}
                </CardContent>
              </Card>

          {proposal.implementation_plan && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Implementation Plan', ar: 'خطة التنفيذ' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{proposal.implementation_plan}</p>
              </CardContent>
            </Card>
          )}

          {proposal.success_metrics_proposed?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {proposal.success_metrics_proposed.map((metric, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-green-600 mt-1" />
                      <span className="text-sm text-slate-700">{metric}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

              {proposal.team_composition?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Team Composition', ar: 'تكوين الفريق' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {proposal.team_composition.map((member, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="font-medium text-slate-900">{member.role}</p>
                          <p className="text-sm text-slate-600">{member.expertise}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t({ en: 'Submission Details', ar: 'تفاصيل التقديم' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Submitter', ar: 'المقدم' })}</p>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" />
                      <p className="font-medium">{proposal.submitter_email}</p>
                    </div>
                    {proposal.submitter_organization && (
                      <p className="text-xs text-slate-500 mt-1">{proposal.submitter_organization}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Submitter Type', ar: 'نوع المقدم' })}</p>
                    <Badge variant="outline" className="capitalize">
                      {proposal.submitter_type?.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  {proposal.budget_estimate && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <p className="font-medium">{(proposal.budget_estimate / 1000).toFixed(0)}K SAR</p>
                      </div>
                    </div>
                  )}

                  {proposal.timeline_proposal && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t({ en: 'Timeline', ar: 'المدة' })}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <p className="font-medium">{proposal.timeline_proposal}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Submitted', ar: 'تاريخ التقديم' })}</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <p className="font-medium text-xs">{new Date(proposal.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* AI Screening Tab */}
        <TabsContent value="screening">
          <AIProposalScreening proposal={proposal} />
        </TabsContent>

        {/* Expert Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          <EvaluationConsensusPanel 
            entityId={proposal.id}
            entityType="InnovationProposal"
          />
          <UnifiedEvaluationForm
            entityId={proposal.id}
            entityType="InnovationProposal"
            entityName={proposal.title_en}
          />
        </TabsContent>

        {/* Stakeholder Alignment Tab */}
        <TabsContent value="alignment">
          <StakeholderAlignmentGate proposal={proposal} />
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Convert this proposal to: Challenge, Solution, Pilot, R&D Project, or Program
              </p>
              {proposal.converted_entity_type ? (
                <Badge className="bg-purple-600">
                  Converted to {proposal.converted_entity_type}
                </Badge>
              ) : (
                <p className="text-sm text-slate-500">Conversion pending approval</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(InnovationProposalDetail, { requiredPermissions: [] });