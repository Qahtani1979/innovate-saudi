import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import {
  CheckCircle, AlertCircle, FileText, TestTube, Microscope,
  Calendar, Sparkles, Shield, Target, Users,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';
import InlineApprovalWizard from '../components/approval/InlineApprovalWizard';
import { getGateConfig } from '../components/approval/ApprovalGateConfig';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useAuth } from '@/lib/AuthContext';
import {
  APPROVAL_ANALYSIS_SCHEMA,
  CHALLENGE_APPROVAL_PROMPT_TEMPLATE,
  MILESTONE_APPROVAL_PROMPT_TEMPLATE
} from '@/lib/ai/prompts/approval/approvalAnalysis';
import { useApprovalRequests } from '@/hooks/useApprovalRequests';
import { useAllProgramApplications } from '@/hooks/useProgramDetails';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { usePendingLegacyPolicies } from '@/hooks/usePolicies';

function ApprovalCenter() {
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { invokeAI, status: aiStatus, isLoading: analyzingLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [analyzingId, setAnalyzingId] = useState(null);

  // Hub for all approvals
  const {
    useApprovalRequestsByType,
    useLegacyPendingItems,
    useMyChallengeReviews,
    usePendingPilots,
    processApproval,
    isProcessing
  } = useApprovalRequests();

  const { data: challengeApprovals = [] } = useMyChallengeReviews();
  const { data: pilots = [] } = usePendingPilots();

  const pilotApprovals = pilots.flatMap(pilot => {
    const approvals = [];
    if (Array.isArray(pilot.milestones)) {
      pilot.milestones.forEach((milestone, idx) => {
        const m = milestone;
        if (m?.requires_approval && m.approval_status === 'pending') {
          approvals.push({ type: 'milestone', pilotId: pilot.id, pilotTitle: pilot.title_en, milestoneIndex: idx, milestone: m, entity: 'pilot' });
        }
      });
    }
    if (Array.isArray(pilot.budget_approvals)) {
      pilot.budget_approvals.forEach((budget, idx) => {
        const b = budget;
        if (b && !b.approved && user?.role === 'admin') {
          approvals.push({ type: 'budget', pilotId: pilot.id, pilotTitle: pilot.title_en, budgetIndex: idx, budget: b, entity: 'pilot' });
        }
      });
    }
    return approvals;
  });

  const { data: rdApprovals = [] } = useApprovalRequestsByType('rd_proposal');
  const { data: programApprovalRequests = [] } = useApprovalRequestsByType('program_application');
  const { data: matchmakerApprovalRequests = [] } = useApprovalRequestsByType('matchmaker_application');
  const { data: solutionApprovals = [] } = useApprovalRequestsByType('solution');
  const { data: programEntityApprovals = [] } = useApprovalRequestsByType('program');
  const { data: innovationProposalApprovals = [] } = useApprovalRequestsByType('innovation_proposal');
  const { data: eventApprovalRequests = [] } = useApprovalRequestsByType('event');

  const { data: rdProposals = [] } = useLegacyPendingItems('rd_proposals', 'status', 'submitted');
  const { data: matchmakerApps = [] } = useLegacyPendingItems('matchmaker_applications', 'status', 'submitted');
  const { data: citizenIdeas = [] } = useLegacyPendingItems('citizen_ideas', 'status', 'submitted');
  const { data: innovationProposals = [] } = useLegacyPendingItems('innovation_proposals', 'status', 'submitted');
  const { data: rdProjects = [] } = useLegacyPendingItems('rd_projects', 'status', 'submitted');
  const { data: eventApprovals = [] } = useLegacyPendingItems('events', 'status', 'pending', { is_deleted: false });

  // Policy approvals (legacy - still need to handle)
  // Policy approvals (legacy - still need to handle)
  const { data: policyApprovals = [] } = usePendingLegacyPolicies();

  const handleApprove = async (item) => {
    let entityType = item.entity || item.type;
    let id = item.id;
    let updates = { status: 'approved' };
    let reason = 'Approved via Approval Center';

    if (item.type === 'milestone') {
      const pilot = pilots.find(p => p.id === item.pilotId);
      const updatedMilestones = [...pilot.milestones];
      updatedMilestones[item.milestoneIndex].approval_status = 'approved';
      updatedMilestones[item.milestoneIndex].approved_by = user?.email;
      updatedMilestones[item.milestoneIndex].approval_date = new Date().toISOString();
      entityType = 'pilot';
      id = item.pilotId;
      updates = { milestones: updatedMilestones };
    } else if (item.type === 'budget') {
      const pilot = pilots.find(p => p.id === item.pilotId);
      const updatedBudget = [...pilot.budget_approvals];
      updatedBudget[item.budgetIndex].approved = true;
      updatedBudget[item.budgetIndex].approved_by = user?.email;
      updatedBudget[item.budgetIndex].approval_date = new Date().toISOString();
      entityType = 'pilot';
      id = item.pilotId;
      updates = { budget_approvals: updatedBudget };
    } else if (item.entity_type) {
      entityType = item.entity_type;
      id = item.entity_id;
    }

    processApproval({ id, entityType, action: 'approve', updates, reason });
  };

  const handleReject = async (item, reason) => {
    let entityType = item.entity || item.type;
    let id = item.id;
    let updates = { status: 'rejected' };

    if (item.entity_type) {
      entityType = item.entity_type;
      id = item.entity_id;
    }

    processApproval({ id, entityType, action: 'reject', updates, reason });
  };

  const handleAIAnalysis = async (item) => {
    setAnalyzingId(item.id || item.pilotId);
    try {
      let prompt = '';
      if (item.entity === 'challenge') {
        prompt = CHALLENGE_APPROVAL_PROMPT_TEMPLATE(item);
      } else if (item.type === 'milestone') {
        prompt = MILESTONE_APPROVAL_PROMPT_TEMPLATE(item.pilotTitle, item.milestone);
      }

      const result = await invokeAI({
        prompt,
        system_prompt: 'You are an approval analysis assistant. Analyze the provided request and suggest a recommendation.',
        response_json_schema: APPROVAL_ANALYSIS_SCHEMA
      });

      if (result.success) {
        setAiAnalysis({ id: item.id || item.pilotId, analysis: result.data });
      } else {
        toast.error(t({ en: 'Failed to analyze', ar: 'فشل التحليل' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to analyze', ar: 'فشل التحليل' }));
    } finally {
      setAnalyzingId(null);
    }
  };

  const totalPending = challengeApprovals.length + pilotApprovals.length +
    rdApprovals.length + programApprovalRequests.length +
    matchmakerApprovalRequests.length + policyApprovals.length +
    solutionApprovals.length + programEntityApprovals.length +
    citizenIdeas.length + innovationProposalApprovals.length +
    eventApprovalRequests.length + eventApprovals.length;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Approval Center', ar: 'مركز الموافقات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Unified approval queue for all pending items', ar: 'قائمة موحدة لجميع الموافقات المعلقة' })}
          </p>
        </div>
        <Badge className="text-2xl px-4 py-2">
          {totalPending} {t({ en: 'Pending', ar: 'معلق' })}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-11 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'التحديات' })}</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{challengeApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{pilotApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{solutionApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Events', ar: 'الفعاليات' })}</p>
              <p className="text-3xl font-bold text-cyan-600 mt-1">{eventApprovalRequests.length + eventApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Program Apps', ar: 'طلبات البرامج' })}</p>
              <p className="text-3xl font-bold text-teal-600 mt-1">{programApprovalRequests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Programs', ar: 'البرامج' })}</p>
              <p className="text-3xl font-bold text-pink-600 mt-1">{programEntityApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-white from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'R&D', ar: 'البحث' })}</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{rdApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Matchmaker', ar: 'التوفيق' })}</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{matchmakerApprovalRequests.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Policies', ar: 'السياسات' })}</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">{policyApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Ideas', ar: 'الأفكار' })}</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{citizenIdeas.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600">{t({ en: 'Proposals', ar: 'مقترحات' })}</p>
              <p className="text-3xl font-bold text-rose-600 mt-1">{innovationProposalApprovals.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="challenges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-11 h-auto">
          <TabsTrigger value="challenges" className="flex flex-col gap-1 py-3">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Challenges', ar: 'التحديات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="pilots" className="flex flex-col gap-1 py-3">
            <TestTube className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Pilots', ar: 'التجارب' })}</span>
          </TabsTrigger>
          <TabsTrigger value="solutions" className="flex flex-col gap-1 py-3">
            <Target className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Solutions', ar: 'الحلول' })}</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex flex-col gap-1 py-3">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Events', ar: 'الفعاليات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="program-apps" className="flex flex-col gap-1 py-3">
            <FileText className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'App Review', ar: 'مراجعة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex flex-col gap-1 py-3">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Programs', ar: 'البرامج' })}</span>
          </TabsTrigger>
          <TabsTrigger value="rd" className="flex flex-col gap-1 py-3">
            <Microscope className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'R&D', ar: 'البحث' })}</span>
          </TabsTrigger>
          <TabsTrigger value="matchmaker" className="flex flex-col gap-1 py-3">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Matchmaker', ar: 'التوفيق' })}</span>
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex flex-col gap-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Policies', ar: 'السياسات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="ideas" className="flex flex-col gap-1 py-3">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Ideas', ar: 'الأفكار' })}</span>
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex flex-col gap-1 py-3">
            <FileText className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Proposals', ar: 'المقترحات' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          {challengeApprovals.length > 0 ? (
            challengeApprovals.map((challenge) => {
              // Standard challenges use a simpler review flow
              return (
                <Card key={challenge.id} className="border-2 hover:border-blue-400">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700">{challenge.category}</Badge>
                          <Badge className="bg-yellow-100 text-yellow-700">{challenge.status}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg text-slate-900 mb-1">{challenge.title_en}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{challenge.description_en}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={createPageUrl(`ChallengeReviewQueue?id=${challenge.id}`)}>
                          <Button size="sm" variant="outline">
                            {t({ en: 'Review', ar: 'مراجعة' })}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending challenge approvals', ar: 'لا توجد موافقات معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pilots" className="space-y-4">
          {pilotApprovals.length > 0 ? (
            pilotApprovals.map((approval, idx) => (
              <Card key={`${approval.pilotId}-${idx}`} className="border-2 hover:border-purple-400">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-700">{approval.type === 'milestone' ? 'Milestone' : 'Budget'}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-700">{t({ en: 'Pending', ar: 'معلق' })}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">{approval.pilotTitle}</h3>
                      <p className="text-sm text-slate-600">
                        {approval.type === 'milestone' ? approval.milestone.title : `Budget Approval Request: ${approval.budget.amount} ${approval.budget.currency || 'SAR'}`}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="bg-green-600" onClick={() => handleApprove(approval)}>
                        {t({ en: 'Approve', ar: 'موافقة' })}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(approval, 'Rejected via Center')}>
                        {t({ en: 'Reject', ar: 'رفض' })}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending pilot approvals', ar: 'لا توجد موافقات معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="program-apps" className="space-y-4">
          {programApprovalRequests.length > 0 ? (
            programApprovalRequests.map((approval) => {
              const metadata = (approval.metadata && typeof approval.metadata === 'object') ? approval.metadata : {};
              const gateConfig = getGateConfig('program_application', metadata['gate_name'] || 'approval');

              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={approval['entityData']}
                  gateConfig={gateConfig}
                  onComplete={() => { }}
                />
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending applications', ar: 'لا توجد طلبات معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          {programEntityApprovals.length > 0 ? (
            programEntityApprovals.map((approval) => {
              const metadata = (approval.metadata && typeof approval.metadata === 'object') ? approval.metadata : {};
              const gateConfig = getGateConfig('program', metadata['gate_name'] || 'approval');

              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={approval['entityData']}
                  gateConfig={gateConfig}
                  onComplete={() => { }}
                />
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending program approvals', ar: 'لا توجد موافقات برامج معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rd" className="space-y-4">
          {rdApprovals.length > 0 ? (
            rdApprovals.map((approval) => {
              const metadata = (approval.metadata && typeof approval.metadata === 'object') ? approval.metadata : {};
              const gateConfig = getGateConfig('rd_proposal', metadata['gate_name'] || 'publication_review');

              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={approval['entityData']}
                  gateConfig={gateConfig}
                  onComplete={() => { }}
                />
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending proposals', ar: 'لا توجد مقترحات معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="matchmaker" className="space-y-4">
          {matchmakerApprovalRequests.length > 0 ? (
            matchmakerApprovalRequests.map((approval) => {
              const metadata = (approval.metadata && typeof approval.metadata === 'object') ? approval.metadata : {};
              const gateConfig = getGateConfig('matchmaker_application', metadata['gate_name'] || 'initial_review');

              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={approval['entityData']}
                  gateConfig={gateConfig}
                  onComplete={() => { }}
                />
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending applications', ar: 'لا توجد طلبات معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="solutions" className="space-y-4">
          {solutionApprovals.length > 0 ? (
            solutionApprovals.map((approval) => {
              const metadata = (approval.metadata && typeof approval.metadata === 'object') ? approval.metadata : {};
              const gateConfig = getGateConfig('solution', metadata['gate_name'] || 'initial_review');

              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={approval['entityData']}
                  gateConfig={gateConfig}
                  onComplete={() => { }}
                />
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending solution approvals', ar: 'لا توجد موافقات حلول معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {/* Workflow-based approvals (via approval_requests) */}
          {eventApprovalRequests.length > 0 && eventApprovalRequests.map((approval) => {
            const metadata = (approval.metadata && typeof approval.metadata === 'object') ? approval.metadata : {};
            const gateConfig = getGateConfig('event', metadata['gate_name'] || 'approval');

            return (
              <InlineApprovalWizard
                key={approval.id}
                approvalRequest={approval}
                entityData={approval['entityData']}
                gateConfig={gateConfig}
                onComplete={() => { }}
              />
            );
          })}

          {/* Legacy direct approvals (events with status='pending' but no approval_request) */}
          {eventApprovals.length > 0 && eventApprovals.map((event) => (
            <Card key={event.id} className="border-2 hover:border-cyan-400">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-cyan-100 text-cyan-700">{event.event_type}</Badge>
                      <Badge className="bg-yellow-100 text-yellow-700">{event.status}</Badge>
                      {event.is_virtual && (
                        <Badge variant="outline">{t({ en: 'Virtual', ar: 'افتراضي' })}</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">
                      {language === 'ar' ? (event.title_ar || event.title_en) : event.title_en}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {language === 'ar' ? (event.description_ar || event.description_en) : event.description_en}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {event.start_date ? format(new Date(event.start_date), 'MMM d, yyyy') : 'TBD'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link to={createPageUrl(`EventDetail?id=${event.id}`)}>
                      <Button size="sm" variant="outline">
                        {t({ en: 'Review', ar: 'مراجعة' })}
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                      onClick={() => processApproval({
                        id: event.id,
                        entityType: 'event',
                        action: 'approve',
                        updates: { status: 'scheduled', is_published: true, approved_by: user?.email, approved_at: new Date().toISOString() },
                        reason: 'Approved via Approval Center'
                      })}
                    >
                      {t({ en: 'Approve', ar: 'موافقة' })}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {eventApprovalRequests.length === 0 && eventApprovals.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending event approvals', ar: 'لا توجد موافقات فعاليات معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          {policyApprovals.length > 0 ? (
            policyApprovals.map((approval) => {
              const metadata = (approval.metadata && typeof approval.metadata === 'object') ? approval.metadata : {};
              const gateConfig = getGateConfig('policy_recommendation', metadata['gate_name'] || 'legal_review');

              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={approval['entityData']}
                  gateConfig={gateConfig}
                  onComplete={() => { }}
                />
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending policy approvals', ar: 'لا توجد موافقات سياسية معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ideas" className="space-y-4">
          {citizenIdeas.length > 0 ? (
            citizenIdeas.map((idea) => (
              <Card key={idea.id} className="border-2 hover:border-purple-400">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-700">{idea.category}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-700">{idea.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">{idea.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{idea.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{idea.submitter_name || t({ en: 'Anonymous', ar: 'مجهول' })}</span>
                        <span>• {idea.votes_count || 0} {t({ en: 'votes', ar: 'أصوات' })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={createPageUrl(`IdeaDetail?id=${idea.id}`)}>
                        <Button size="sm" variant="outline">
                          {t({ en: 'Review', ar: 'مراجعة' })}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending citizen ideas', ar: 'لا توجد أفكار معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          {innovationProposalApprovals.length > 0 ? (
            innovationProposalApprovals.map((proposal) => (
              <Card key={proposal.id} className="border-2 hover:border-indigo-400">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{proposal.entityData?.code}</Badge>
                        <Badge className="bg-indigo-100 text-indigo-700 capitalize">{proposal.entityData?.proposal_type?.replace(/_/g, ' ')}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-700">{proposal.entityData?.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">{proposal.entityData?.title_en}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{proposal.entityData?.description_en}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{proposal.entityData?.submitter_email}</span>
                        {proposal.entityData?.budget_estimate && <span>• {(proposal.entityData.budget_estimate / 1000).toFixed(0)}K SAR</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={createPageUrl(`InnovationProposalDetail?id=${proposal.id}`)}>
                        <Button size="sm" variant="outline">
                          {t({ en: 'Review', ar: 'مراجعة' })}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending innovation proposals', ar: 'لا توجد مقترحات معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rd_projects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5 text-indigo-600" />
                {t({ en: 'R&D Project Kickoffs', ar: 'بدء مشاريع البحث' })} ({rdProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rdProjects.length > 0 ? (
                <div className="space-y-3">
                  {rdProjects.map((project) => (
                    <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)} className="block">
                      <Card className="hover:shadow-lg transition-all border-2 hover:border-indigo-400">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{project.code}</Badge>
                                <Badge className="bg-indigo-100 text-indigo-700">Kickoff Pending</Badge>
                              </div>
                              <h3 className="font-semibold text-slate-900">{project.title_en}</h3>
                              <p className="text-sm text-slate-600 mt-1">{project.institution_name}</p>
                            </div>
                            <Button size="sm" className="bg-indigo-600">
                              {t({ en: 'Review Kickoff', ar: 'مراجعة البدء' })}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">{t({ en: 'No R&D kickoffs pending', ar: 'لا توجد بدايات بحث معلقة' })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citizen_ideas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                {t({ en: 'Citizen Ideas Screening', ar: 'فرز أفكار المواطنين' })} ({citizenIdeas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {citizenIdeas.length > 0 ? (
                <div className="space-y-3">
                  {citizenIdeas.map((idea) => (
                    <Link key={idea.id} to={createPageUrl(`IdeaDetail?id=${idea.id}`)} className="block">
                      <Card className="hover:shadow-lg transition-all border-2 hover:border-purple-400">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Badge className="mb-2">{idea.category}</Badge>
                              <h3 className="font-semibold text-slate-900 line-clamp-1">{idea.title}</h3>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{idea.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                <span>👍 {idea.votes_count || 0}</span>
                              </div>
                            </div>
                            <Button size="sm" className="bg-purple-600">
                              {t({ en: 'Screen', ar: 'فرز' })}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">{t({ en: 'No ideas pending screening', ar: 'لا توجد أفكار معلقة' })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="innovation_proposals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-600" />
                {t({ en: 'Innovation Proposals', ar: 'مقترحات الابتكار' })} ({innovationProposals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {innovationProposals.length > 0 ? (
                <div className="space-y-3">
                  {innovationProposals.map((proposal) => (
                    <Link key={proposal.id} to={createPageUrl(`InnovationProposalDetail?id=${proposal.id}`)} className="block">
                      <Card className="hover:shadow-lg transition-all border-2 hover:border-pink-400">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-pink-100 text-pink-700">{proposal.innovation_type}</Badge>
                                <Badge variant="outline">{proposal.status?.replace(/_/g, ' ')}</Badge>
                              </div>
                              <h3 className="font-semibold text-slate-900 line-clamp-1">{proposal.title_en || proposal.title}</h3>
                              <p className="text-sm text-slate-600 mt-1">{proposal.submitter_name || (typeof proposal.created_by === 'string' ? proposal.created_by : '')}</p>
                            </div>
                            <Button size="sm" className="bg-pink-600">
                              {t({ en: 'Review', ar: 'مراجعة' })}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">{t({ en: 'No proposals pending', ar: 'لا توجد مقترحات معلقة' })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(ApprovalCenter, {
  requiredPermissions: ['challenge_approve', 'pilot_approve', 'program_approve', 'rd_proposal_approve', 'solution_approve', 'matchmaker_approve', 'event_approve'],
  requireAll: false
});
