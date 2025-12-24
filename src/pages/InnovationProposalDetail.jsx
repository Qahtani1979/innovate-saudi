import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { User, Calendar, Target, DollarSign, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIProposalScreening from '../components/citizen/AIProposalScreening';
import StakeholderAlignmentGate from '../components/citizen/StakeholderAlignmentGate';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import InnovationProposalWorkflowTab from '../components/citizen/InnovationProposalWorkflowTab';

import { useInnovationProposal } from '@/hooks/useInnovationProposal';

function InnovationProposalDetail() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('id');

  const { data: proposal, isLoading, error: proposalError } = useInnovationProposal(proposalId);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}
          </div>
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (proposalError || !proposal) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{t({ en: 'Error loading proposal or proposal not found', ar: 'Ø®Ø·Ø£ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‚ØªØ±Ø­' })}</p>
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
            <Badge variant="outline" className="bg-white/20 text-white border-white/40">{proposal?.['code']}</Badge>
            <Badge className={statusColors[proposal?.['status']]}>{proposal?.['status']?.replace(/_/g, ' ')}</Badge>
            <Badge variant="outline" className="bg-white/20 text-white border-white/40 capitalize">
              {proposal?.['proposal_type']?.replace(/_/g, ' ')}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-2">{proposal?.['title_en']}</h1>
          {proposal?.['title_ar'] && (
            <h2 className="text-2xl font-medium text-white/90" dir="rtl">{proposal?.['title_ar']}</h2>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workflow">{t({ en: 'Workflow', ar: 'Ø³ÙŠØ± Ø§Ù„Ø¹Ù…Ù„' })}</TabsTrigger>
          <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©' })}</TabsTrigger>
          <TabsTrigger value="screening">{t({ en: 'AI Screening', ar: 'Ø§Ù„ÙØ­Øµ Ø§Ù„Ø°ÙƒÙŠ' })}</TabsTrigger>
          <TabsTrigger value="evaluation">{t({ en: 'Expert Review', ar: 'Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©' })}</TabsTrigger>
          <TabsTrigger value="alignment">{t({ en: 'Stakeholder Gate', ar: 'Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø£Ø·Ø±Ø§Ù' })}</TabsTrigger>
          <TabsTrigger value="conversion">{t({ en: 'Conversion', ar: 'Ø§Ù„ØªØ­ÙˆÙŠÙ„' })}</TabsTrigger>
        </TabsList>

        {/* Workflow Tab */}
        <TabsContent value="workflow">
          <div className="space-y-6">
            <InnovationProposalWorkflowTab proposal={proposal} />
            <UnifiedWorkflowApprovalTab
              entityType="InnovationProposal"
              entityId={proposalId}
              entityData={proposal}
            />
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Description', ar: 'Ø§Ù„ÙˆØµÙ ' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{proposal?.['description_en']}</p>
                  {proposal?.['description_ar'] && (
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mt-4 border-t pt-4" dir="rtl">
                      {proposal?.['description_ar']}
                    </p>
                  )}
                </CardContent>
              </Card>

              {proposal?.['proposed_solution'] && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Proposed Solution', ar: 'Ø®Ø·ة Ø§Ù„ØªÙ†Ù ÙŠØ°' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 whitespace-pre-wrap">{proposal?.['proposed_solution']}</p>
                  </CardContent>
                </Card>
              )}

              {proposal?.['expected_impact'] && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Expected Impact', ar: 'Ù…Ù‚Ø§ÙŠÙŠØ³ Ø§Ù„Ù†Ø¬Ø§Ø­' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 whitespace-pre-wrap">{proposal?.['expected_impact']}</p>
                  </CardContent>
                </Card>
              )}

              {proposal.team_info && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Team Information', ar: 'ØªÙƒÙˆÙŠÙ† Ø§Ù„Ù Ø±ÙŠÙ‚' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {typeof proposal.team_info === 'object' && proposal.team_info !== null && Object.entries(proposal.team_info).map(([key, value], i) => (
                        <div key={i} className="p-3 border rounded-lg bg-slate-50">
                          <p className="font-semibold text-slate-900 capitalize text-xs mb-1">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </p>
                        </div>
                      ))}
                      {typeof proposal.team_info === 'string' && (
                        <p className="text-slate-700 whitespace-pre-wrap">{proposal.team_info}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t({ en: 'Submission Details', ar: 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„ØªÙ‚Ø¯ÙŠÙ…' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Submitter', ar: 'Ø§Ù„Ù…Ù‚Ø¯Ù…' })}</p>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" />
                      <p className="font-medium">{proposal?.['submitter_email']}</p>
                    </div>
                    {proposal?.['submitter_organization'] && (
                      <p className="text-xs text-slate-500 mt-1">{proposal?.['submitter_organization']}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Submitter Type', ar: 'Ù†ÙˆØ¹ Ø§Ù„Ù…Ù‚Ø¯Ù…' })}</p>
                    <Badge variant="outline" className="capitalize">
                      {proposal?.['submitter_type']?.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  {proposal?.['budget_estimate'] && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t({ en: 'Budget', ar: 'Ø§Ù„Ù…ÙŠØ²Ø§Ù†ÙŠØ©' })}</p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <p className="font-medium">{(proposal?.['budget_estimate'] / 1000).toFixed(0)}K SAR</p>
                      </div>
                    </div>
                  )}

                  {proposal?.['timeline'] && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{t({ en: 'Timeline', ar: 'Ø§Ù„Ù…Ø¯Ø©' })}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <p className="font-medium">{proposal?.['timeline']}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Submitted', ar: 'ØªØ§Ø±ÙŠØ® Ø§Ù„ØªÙ‚Ø¯ÙŠÙ…' })}</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <p className="font-medium text-xs">{new Date(proposal?.['submitted_at'] || proposal?.['created_at']).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* AI Screening Tab */}
        <TabsContent value="screening">
          <AIProposalScreening
            proposal={proposal}
            onScreeningComplete={() => { }}
          />
        </TabsContent>

        {/* Expert Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          <EvaluationConsensusPanel
            entityId={proposal.id}
            entityType="InnovationProposal"
          />
          <UnifiedEvaluationForm
            entityId={proposal?.['id']}
            entityType="InnovationProposal"
            assignmentId={null}
            onComplete={() => { }}
          />
        </TabsContent>

        {/* Stakeholder Alignment Tab */}
        <TabsContent value="alignment">
          <StakeholderAlignmentGate
            proposal={proposal}
            onGateComplete={() => { }}
          />
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
              {proposal?.['converted_entity_type'] ? (
                <Badge className="bg-purple-600">
                  Converted to {proposal?.['converted_entity_type']}
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
