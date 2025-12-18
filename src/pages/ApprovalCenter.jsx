import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { 
  CheckCircle, Clock, AlertCircle, FileText, TestTube, Microscope, 
  Calendar, Send, Sparkles, Loader2, TrendingUp, Shield, Target, Users,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';
import InlineApprovalWizard from '../components/approval/InlineApprovalWizard';
import { getGateConfig } from '../components/approval/ApprovalGateConfig';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';
import {
  APPROVAL_ANALYSIS_SCHEMA,
  CHALLENGE_APPROVAL_PROMPT_TEMPLATE,
  MILESTONE_APPROVAL_PROMPT_TEMPLATE
} from '@/lib/ai/prompts/approval/approvalAnalysis';

function ApprovalCenter() {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { invokeAI, status: aiStatus, isLoading: analyzingLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [analyzingId, setAnalyzingId] = useState(null);

  const queryClient = useQueryClient();

  // Fetch all approval requests by entity type
  const { data: policyApprovals = [] } = useQuery({
    queryKey: ['policy-approvals'],
    queryFn: async () => {
      const approvals = await base44.entities.ApprovalRequest.filter({ 
        entity_type: 'policy_recommendation',
        status: { $in: ['pending', 'under_review'] }
      });
      const policies = await base44.entities.PolicyRecommendation.list();
      return approvals.map(a => ({ ...a, policyData: policies.find(p => p.id === a.entity_id) })).filter(a => a.policyData);
    }
  });

  const { data: challengeApprovals = [] } = useQuery({
    queryKey: ['challenge-approvals'],
    queryFn: async () => {
      const approvals = await base44.entities.ApprovalRequest.filter({ 
        entity_type: 'challenge',
        status: { $in: ['pending', 'under_review'] }
      });
      const challenges = await base44.entities.Challenge.list();
      return approvals.map(a => ({ ...a, challengeData: challenges.find(c => c.id === a.entity_id) })).filter(a => a.challengeData);
    }
  });

  const { data: pilotApprovals = [] } = useQuery({
    queryKey: ['pilot-approvals'],
    queryFn: async () => {
      const approvals = await base44.entities.ApprovalRequest.filter({ 
        entity_type: 'pilot',
        status: { $in: ['pending', 'under_review'] }
      });
      const pilots = await base44.entities.Pilot.list();
      return approvals.map(a => ({ ...a, pilotData: pilots.find(p => p.id === a.entity_id) })).filter(a => a.pilotData);
    }
  });

  // Fetch pending challenges assigned to me
  const { data: myChallenges = [] } = useQuery({
    queryKey: ['my-challenge-reviews', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.review_assigned_to === user?.email && c.status === 'under_review');
    },
    enabled: !!user
  });

  // Fetch pending pilot milestones & budget approvals
  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const pendingPilotApprovals = pilots.flatMap(pilot => {
    const approvals = [];
    
    // Milestone approvals
    if (pilot.milestones) {
      pilot.milestones.forEach((milestone, idx) => {
        if (milestone.requires_approval && milestone.approval_status === 'pending') {
          approvals.push({
            type: 'milestone',
            pilotId: pilot.id,
            pilotTitle: pilot.title_en,
            milestoneIndex: idx,
            milestone: milestone,
            entity: 'pilot'
          });
        }
      });
    }

    // Budget approvals
    if (pilot.budget_approvals) {
      pilot.budget_approvals.forEach((budget, idx) => {
        if (!budget.approved && user?.role === 'admin') {
          approvals.push({
            type: 'budget',
            pilotId: pilot.id,
            pilotTitle: pilot.title_en,
            budgetIndex: idx,
            budget: budget,
            entity: 'pilot'
          });
        }
      });
    }

    return approvals;
  });

  // Fetch program applications
  const { data: programApps = [] } = useQuery({
    queryKey: ['program-applications'],
    queryFn: async () => {
      const all = await base44.entities.ProgramApplication.list();
      return all.filter(app => app.status === 'submitted' || app.status === 'under_review');
    }
  });

  // Fetch R&D proposals
  const { data: rdProposals = [] } = useQuery({
    queryKey: ['rd-proposals'],
    queryFn: async () => {
      const all = await base44.entities.RDProposal.list();
      return all.filter(p => p.status === 'submitted' || p.status === 'under_review');
    }
  });

  // Fetch matchmaker applications
  const { data: matchmakerApps = [] } = useQuery({
    queryKey: ['matchmaker-applications'],
    queryFn: async () => {
      const all = await base44.entities.MatchmakerApplication.list();
      return all.filter(app => app.status === 'submitted' || app.status === 'screening');
    }
  });

  // Fetch R&D approval requests
  const { data: rdApprovals = [] } = useQuery({
    queryKey: ['rd-approvals'],
    queryFn: async () => {
      const approvals = await base44.entities.ApprovalRequest.filter({ 
        entity_type: 'rd_proposal',
        status: { $in: ['pending', 'under_review'] }
      });
      const proposals = await base44.entities.RDProposal.list();
      return approvals.map(a => ({ ...a, proposalData: proposals.find(p => p.id === a.entity_id) })).filter(a => a.proposalData);
    }
  });

  // Fetch Program Application approval requests
  const { data: programApprovalRequests = [] } = useQuery({
    queryKey: ['program-approvals'],
    queryFn: async () => {
      const approvals = await base44.entities.ApprovalRequest.filter({ 
        entity_type: 'program_application',
        status: { $in: ['pending', 'under_review'] }
      });
      const apps = await base44.entities.ProgramApplication.list();
      return approvals.map(a => ({ ...a, applicationData: apps.find(p => p.id === a.entity_id) })).filter(a => a.applicationData);
    }
  });

  // Fetch Matchmaker approval requests
  const { data: matchmakerApprovalRequests = [] } = useQuery({
    queryKey: ['matchmaker-approvals'],
    queryFn: async () => {
      const approvals = await base44.entities.ApprovalRequest.filter({ 
        entity_type: 'matchmaker_application',
        status: { $in: ['pending', 'under_review'] }
      });
      const apps = await base44.entities.MatchmakerApplication.list();
      return approvals.map(a => ({ ...a, matchmakerData: apps.find(p => p.id === a.entity_id) })).filter(a => a.matchmakerData);
    }
  });

  // Fetch Solution approval requests
  const { data: solutionApprovals = [] } = useQuery({
    queryKey: ['solution-approvals'],
    queryFn: async () => {
      const approvals = await base44.entities.ApprovalRequest.filter({ 
        entity_type: 'solution',
        status: { $in: ['pending', 'under_review'] }
      });
      const solutions = await base44.entities.Solution.list();
      return approvals.map(a => ({ ...a, solutionData: solutions.find(s => s.id === a.entity_id) })).filter(a => a.solutionData);
    }
  });

  // Fetch Program entity approval requests
  const { data: programEntityApprovals = [] } = useQuery({
    queryKey: ['program-entity-approvals'],
    queryFn: async () => {
      const approvals = await base44.entities.ApprovalRequest.filter({ 
        entity_type: 'program',
        status: { $in: ['pending', 'under_review'] }
      });
      const programs = await base44.entities.Program.list();
      return approvals.map(a => ({ ...a, programData: programs.find(p => p.id === a.entity_id) })).filter(a => a.programData);
    }
  });

  // Fetch citizen idea approval requests
  const { data: citizenIdeas = [] } = useQuery({
    queryKey: ['citizen-ideas-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_ideas')
        .select('*')
        .in('status', ['submitted', 'under_review'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch innovation proposal approval requests
  const { data: innovationProposalApprovals = [] } = useQuery({
    queryKey: ['innovation-proposal-approvals'],
    queryFn: async () => {
      const approvals = await base44.entities.ApprovalRequest.filter({ 
        entity_type: 'innovation_proposal',
        status: { $in: ['pending', 'under_review'] }
      });
      const proposals = await base44.entities.InnovationProposal.list();
      return approvals.map(a => ({ ...a, proposalData: proposals.find(p => p.id === a.entity_id) })).filter(a => a.proposalData);
    }
  });

  // Fetch innovation proposals pending screening
  const { data: innovationProposals = [] } = useQuery({
    queryKey: ['innovation-proposals-screening'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_proposals')
        .select('*')
        .in('status', ['submitted', 'under_review', 'pending'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch R&D projects pending approval/kickoff
  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-approval'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_projects')
        .select('*')
        .in('status', ['proposed', 'pending_approval', 'submitted'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch events pending approval (via approval_requests for workflow integration)
  const { data: eventApprovalRequests = [] } = useQuery({
    queryKey: ['event-approval-requests'],
    queryFn: async () => {
      // First try approval_requests table (new workflow)
      const { data: approvalData, error: approvalError } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('entity_type', 'event')
        .in('approval_status', ['pending', 'under_review'])
        .order('created_at', { ascending: false });
      
      if (approvalError) throw approvalError;
      
      // Fetch event details for each approval
      if (approvalData && approvalData.length > 0) {
        const eventIds = approvalData.map(a => a.entity_id);
        const { data: events } = await supabase
          .from('events')
          .select('*, programs:program_id (title_en, title_ar)')
          .in('id', eventIds);
        
        return approvalData.map(a => ({
          ...a,
          eventData: events?.find(e => e.id === a.entity_id)
        })).filter(a => a.eventData);
      }
      return [];
    }
  });

  // Also fetch legacy events with status='pending' (direct table query)
  const { data: eventApprovals = [] } = useQuery({
    queryKey: ['event-approvals-legacy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          programs:program_id (title_en, title_ar)
        `)
        .eq('status', 'pending')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ entity, id, updates }) => {
      if (entity === 'challenge') {
        return base44.entities.Challenge.update(id, updates);
      } else if (entity === 'pilot') {
        return base44.entities.Pilot.update(id, updates);
      } else if (entity === 'program_app') {
        return base44.entities.ProgramApplication.update(id, updates);
      } else if (entity === 'rd_proposal') {
        return base44.entities.RDProposal.update(id, updates);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(t({ en: 'Approved successfully', ar: 'تمت الموافقة بنجاح' }));
    }
  });

  const handleApprove = (item) => {
    if (item.entity === 'challenge') {
      approveMutation.mutate({
        entity: 'challenge',
        id: item.id,
        updates: {
          status: 'approved',
          review_date: new Date().toISOString().split('T')[0]
        }
      });
    } else if (item.type === 'milestone') {
      const pilot = pilots.find(p => p.id === item.pilotId);
      const updatedMilestones = [...pilot.milestones];
      updatedMilestones[item.milestoneIndex].approval_status = 'approved';
      updatedMilestones[item.milestoneIndex].approved_by = user?.email;
      updatedMilestones[item.milestoneIndex].approval_date = new Date().toISOString().split('T')[0];
      
      approveMutation.mutate({
        entity: 'pilot',
        id: item.pilotId,
        updates: { milestones: updatedMilestones }
      });
    } else if (item.type === 'budget') {
      const pilot = pilots.find(p => p.id === item.pilotId);
      const updatedBudget = [...pilot.budget_approvals];
      updatedBudget[item.budgetIndex].approved = true;
      updatedBudget[item.budgetIndex].approved_by = user?.email;
      updatedBudget[item.budgetIndex].approval_date = new Date().toISOString().split('T')[0];
      
      approveMutation.mutate({
        entity: 'pilot',
        id: item.pilotId,
        updates: { budget_approvals: updatedBudget }
      });
    }
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
            challengeApprovals.map((approval) => {
              const challenge = approval.challengeData;
              const gateConfig = getGateConfig('challenge', approval.gate_name);
              
              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={challenge}
                  gateConfig={gateConfig}
                  onComplete={() => queryClient.invalidateQueries(['challenge-approvals'])}
                />
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
            pilotApprovals.map((approval) => {
              const pilot = approval.pilotData;
              const gateConfig = getGateConfig('pilot', approval.gate_name);
              
              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={pilot}
                  gateConfig={gateConfig}
                  onComplete={() => queryClient.invalidateQueries(['pilot-approvals'])}
                />
              );
            })
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
              const app = approval.applicationData;
              const gateConfig = getGateConfig('program_application', approval.gate_name);
              
              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={app}
                  gateConfig={gateConfig}
                  onComplete={() => queryClient.invalidateQueries(['program-approvals'])}
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
              const program = approval.programData;
              const gateConfig = getGateConfig('program', approval.gate_name);
              
              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={program}
                  gateConfig={gateConfig}
                  onComplete={() => queryClient.invalidateQueries(['program-entity-approvals'])}
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
              const proposal = approval.proposalData;
              const gateConfig = getGateConfig('rd_proposal', approval.gate_name);
              
              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={proposal}
                  gateConfig={gateConfig}
                  onComplete={() => queryClient.invalidateQueries(['rd-approvals'])}
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
              const app = approval.matchmakerData;
              const gateConfig = getGateConfig('matchmaker_application', approval.gate_name);
              
              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={app}
                  gateConfig={gateConfig}
                  onComplete={() => queryClient.invalidateQueries(['matchmaker-approvals'])}
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
              const solution = approval.solutionData;
              const gateConfig = getGateConfig('solution', approval.gate_name);
              
              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={solution}
                  gateConfig={gateConfig}
                  onComplete={() => queryClient.invalidateQueries(['solution-approvals'])}
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
            const event = approval.eventData;
            const gateConfig = getGateConfig('event', approval.metadata?.gate_name || 'approval');
            
            return (
              <InlineApprovalWizard
                key={approval.id}
                approvalRequest={approval}
                entityData={event}
                gateConfig={gateConfig}
                onComplete={() => {
                  queryClient.invalidateQueries(['event-approval-requests']);
                  queryClient.invalidateQueries(['event-approvals-legacy']);
                }}
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
                      {event.programs && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {language === 'ar' ? (event.programs.title_ar || event.programs.title_en) : event.programs.title_en}
                        </span>
                      )}
                      {event.max_participants && (
                        <span>{event.max_participants} {t({ en: 'max capacity', ar: 'الحد الأقصى' })}</span>
                      )}
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
                      onClick={async () => {
                        const { error } = await supabase
                          .from('events')
                          .update({ status: 'scheduled', is_published: true, approved_by: user?.email, approved_at: new Date().toISOString() })
                          .eq('id', event.id);
                        if (!error) {
                          queryClient.invalidateQueries(['event-approvals-legacy']);
                          toast.success(t({ en: 'Event approved and scheduled', ar: 'تمت الموافقة وجدولة الفعالية' }));
                          // Trigger email notification
                          try {
                            const { supabase: sb } = await import('@/integrations/supabase/client');
                            await sb.functions.invoke('email-trigger-hub', {
                              body: {
                                trigger: 'event.approved',
                                entity_type: 'event',
                                entity_id: event.id,
                                recipient_email: event.created_by,
                                entity_data: { title: event.title_en, start_date: event.start_date, location: event.location }
                              }
                            });
                          } catch (e) { console.warn('Email trigger failed:', e); }
                        }
                      }}
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
              const policy = approval.policyData;
              const gateConfig = getGateConfig('policy_recommendation', approval.gate_name);
              
              return (
                <InlineApprovalWizard
                  key={approval.id}
                  approvalRequest={approval}
                  entityData={policy}
                  gateConfig={gateConfig}
                  onComplete={() => queryClient.invalidateQueries(['policy-approvals'])}
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
                        <span>{idea.submitter_name}</span>
                        <span>• {idea.vote_count || 0} votes</span>
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
                        <Badge variant="outline">{proposal.code}</Badge>
                        <Badge className="bg-indigo-100 text-indigo-700 capitalize">{proposal.proposal_type?.replace(/_/g, ' ')}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-700">{proposal.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">{proposal.title_en}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{proposal.description_en}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{proposal.submitter_email}</span>
                        {proposal.budget_estimate && <span>• {(proposal.budget_estimate / 1000).toFixed(0)}K SAR</span>}
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
                              <p className="text-sm text-slate-600 mt-1">{project.institution_en}</p>
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
                                <span>{idea.municipality_name}</span>
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
                              <h3 className="font-semibold text-slate-900 line-clamp-1">{proposal.title}</h3>
                              <p className="text-sm text-slate-600 mt-1">{proposal.submitter_name || proposal.created_by}</p>
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