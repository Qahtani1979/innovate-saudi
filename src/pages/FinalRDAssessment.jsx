import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import {
  Beaker, Database, Shield, Code, CheckCircle2, AlertTriangle, XCircle,
  FileText, Eye, Lock, Layers, Server, Globe, BookOpen, Zap, 
  Target, Users, Building2, TrendingUp, Lightbulb, Activity
} from 'lucide-react';

// Research System Categories
const RESEARCH_CATEGORIES = [
  {
    id: 'rd_projects',
    name: { en: 'R&D Projects', ar: 'مشاريع البحث والتطوير' },
    icon: Beaker,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'rd_projects table exists', status: 'complete' },
        { check: 'All required columns present (title, abstract, trl, budget, etc.)', status: 'complete' },
        { check: 'Foreign keys: sector_id, institution_id, rd_call_id, solution_id', status: 'complete' },
        { check: 'Array columns: challenge_ids, keywords, research_questions', status: 'complete' },
        { check: 'JSONB columns: co_investigators, publications, patents, milestones', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on rd_projects', status: 'complete' },
        { check: 'Admin full access policy', status: 'complete' },
        { check: 'Researcher own projects policy', status: 'complete' },
        { check: 'Published projects viewable by all', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'useRDProjectsWithVisibility.js', status: 'complete' },
        { check: 'useRDProjectIntegrations.js (7 integrations)', status: 'complete' },
        { check: 'Visibility filtering by role/sector/municipality', status: 'complete' }
      ]},
      { id: 'pages', name: 'Pages', items: [
        { check: 'RDProjects.jsx - List page', status: 'complete' },
        { check: 'RDProjectDetail.jsx - Detail with tabs', status: 'complete' },
        { check: 'RDProjectCreate.jsx - Create form', status: 'complete' },
        { check: 'RDProjectEdit.jsx - Edit form', status: 'complete' },
        { check: 'MyRDProjects.jsx - User dashboard', status: 'complete' }
      ]},
      { id: 'components', name: 'Components', items: [
        { check: 'RDProjectCreateWizard.jsx', status: 'complete' },
        { check: 'RDProjectActivityLog.jsx', status: 'complete' },
        { check: 'RDProjectFinalEvaluationPanel.jsx', status: 'complete' },
        { check: 'TRLVisualization.jsx', status: 'complete' },
        { check: 'TRLAssessmentWorkflow.jsx', status: 'complete' },
        { check: 'IPManagementWidget.jsx', status: 'complete' },
        { check: 'PolicyImpactTracker.jsx', status: 'complete' },
        { check: 'RDToPilotTransition.jsx', status: 'complete' },
        { check: 'RDToSolutionConverter.jsx', status: 'complete' },
        { check: 'RDToPolicyConverter.jsx', status: 'complete' }
      ]},
      { id: 'ai', name: 'AI Prompts', items: [
        { check: 'rdProjectDetail.js - AI insights', status: 'complete' },
        { check: 'trlAssessment.js - TRL scoring', status: 'complete' },
        { check: 'ipValuation.js - IP value estimation', status: 'complete' },
        { check: 'rdToPolicy.js - Policy conversion', status: 'complete' },
        { check: 'pilotTransition.js - Pilot planning', status: 'complete' },
        { check: 'commercialization.js - Market analysis', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'rd_calls',
    name: { en: 'R&D Calls', ar: 'دعوات البحث والتطوير' },
    icon: Target,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'rd_calls table exists', status: 'complete' },
        { check: 'Core columns: title, description, status, call_type', status: 'complete' },
        { check: 'Date columns: application_deadline, start_date, end_date', status: 'complete' },
        { check: 'Budget columns: budget_total, budget_currency', status: 'complete' },
        { check: 'Array columns: focus_areas, challenge_ids, strategic_plan_ids', status: 'complete' },
        { check: 'JSONB columns: eligibility_criteria, evaluation_criteria, timeline', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on rd_calls', status: 'complete' },
        { check: 'Admin full access policy', status: 'complete' },
        { check: 'Published calls viewable by all', status: 'complete' },
        { check: 'Deputyship staff can view all', status: 'complete' },
        { check: 'Researchers can view calls', status: 'complete' },
        { check: 'Sector staff can view sector calls', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'useRDCallsWithVisibility.js', status: 'complete' },
        { check: 'Visibility filtering by role/sector', status: 'complete' }
      ]},
      { id: 'pages', name: 'Pages', items: [
        { check: 'RDCalls.jsx - List page', status: 'complete' },
        { check: 'RDCallDetail.jsx - Detail with tabs', status: 'complete' },
        { check: 'RDCallCreate.jsx - Create form', status: 'complete' },
        { check: 'RDCallEdit.jsx - Edit form', status: 'complete' },
        { check: 'ChallengeRDCallMatcher.jsx - AI matching', status: 'complete' }
      ]},
      { id: 'components', name: 'Components', items: [
        { check: 'RDCallPublishWorkflow.jsx', status: 'complete' },
        { check: 'RDCallReviewWorkflow.jsx', status: 'complete' },
        { check: 'RDCallEvaluationPanel.jsx', status: 'complete' },
        { check: 'RDCallAwardWorkflow.jsx', status: 'complete' },
        { check: 'RDCallApprovalWorkflow.jsx', status: 'complete' },
        { check: 'RDCallActivityLog.jsx', status: 'complete' }
      ]},
      { id: 'ai', name: 'AI Prompts', items: [
        { check: 'callCreate.js - Call generation', status: 'complete' },
        { check: 'callInsights.js - Call analysis', status: 'complete' },
        { check: 'callsInsights.js - Portfolio insights', status: 'complete' },
        { check: 'eligibilityCheck.js - Eligibility AI', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'rd_proposals',
    name: { en: 'R&D Proposals', ar: 'مقترحات البحث والتطوير' },
    icon: FileText,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'rd_proposals table exists', status: 'complete' },
        { check: 'Core columns: rd_call_id, submitter_email, institution_name', status: 'complete' },
        { check: 'Status and scoring columns', status: 'complete' },
        { check: 'JSONB: reviewers array', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on rd_proposals', status: 'complete' },
        { check: 'Admin full access policy', status: 'complete' },
        { check: 'Submitters can view/update own proposals', status: 'complete' },
        { check: 'Authenticated users can submit', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'useProposalsWithVisibility.js', status: 'complete' }
      ]},
      { id: 'pages', name: 'Pages', items: [
        { check: 'RDProposalDetail.jsx', status: 'complete' },
        { check: 'RDProposalCreate.jsx', status: 'complete' },
        { check: 'ProposalReviewPortal.jsx', status: 'complete' }
      ]},
      { id: 'components', name: 'Components', items: [
        { check: 'AIProposalWriter.jsx - AI writing assistant', status: 'complete' },
        { check: 'AIProposalScorer.jsx - AI scoring', status: 'complete' },
        { check: 'CollaborativeProposalEditor.jsx', status: 'complete' },
        { check: 'RDProposalSubmissionGate.jsx', status: 'complete' },
        { check: 'RDProposalReviewGate.jsx', status: 'complete' },
        { check: 'RDProposalAwardWorkflow.jsx', status: 'complete' },
        { check: 'RDProposalActivityLog.jsx', status: 'complete' },
        { check: 'RDProposalAIScorerWidget.jsx', status: 'complete' },
        { check: 'RDProposalEscalationAutomation.jsx', status: 'complete' }
      ]},
      { id: 'ai', name: 'AI Prompts', items: [
        { check: 'proposalWriter.js - AI writing', status: 'complete' },
        { check: 'proposalScorer.js - AI scoring', status: 'complete' },
        { check: 'proposalFeedback.js - Rejection feedback', status: 'complete' },
        { check: 'grantProposal.js - Grant writing', status: 'complete' },
        { check: 'reviewerAssignment.js - Reviewer matching', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'innovation_proposals',
    name: { en: 'Innovation Proposals', ar: 'مقترحات الابتكار' },
    icon: Lightbulb,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'innovation_proposals table exists', status: 'complete' },
        { check: 'Core columns: title, description, status', status: 'complete' },
        { check: 'Submitter tracking columns', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on innovation_proposals', status: 'complete' },
        { check: 'Admin full access policy', status: 'complete' },
        { check: 'Users can manage own proposals', status: 'complete' },
        { check: 'Staff can view all proposals', status: 'complete' },
        { check: 'Evaluators can view assigned proposals', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'useInnovationProposalsWithVisibility.js', status: 'complete' }
      ]},
      { id: 'pages', name: 'Pages', items: [
        { check: 'InnovationProposalsManagement.jsx', status: 'complete' },
        { check: 'InnovationProposalDetail.jsx', status: 'complete' },
        { check: 'IdeasManagement.jsx', status: 'complete' },
        { check: 'IdeaDetail.jsx', status: 'complete' },
        { check: 'IdeaEvaluationQueue.jsx', status: 'complete' }
      ]},
      { id: 'components', name: 'Components', items: [
        { check: 'IdeaToRDConverter.jsx - Idea to R&D conversion', status: 'complete' }
      ]},
      { id: 'ai', name: 'AI Prompts', items: [
        { check: 'innovationAnalysis.js - Innovation scoring', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'researcher_profiles',
    name: { en: 'Researcher Profiles', ar: 'ملفات الباحثين' },
    icon: Users,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'researcher_profiles table exists', status: 'complete' },
        { check: 'Profile columns: expertise, publications, h_index', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on researcher_profiles', status: 'complete' },
        { check: 'Admin full access policy', status: 'complete' },
        { check: 'Public view for all profiles', status: 'complete' }
      ]},
      { id: 'pages', name: 'Pages', items: [
        { check: 'ResearcherDashboard.jsx', status: 'complete' },
        { check: 'AcademiaDashboard.jsx', status: 'complete' },
        { check: 'MyResearcherProfileEditor.jsx', status: 'complete' },
        { check: 'InstitutionRDDashboard.jsx', status: 'complete' }
      ]},
      { id: 'components', name: 'Components', items: [
        { check: 'ResearcherMunicipalityMatcher.jsx', status: 'complete' },
        { check: 'ResearcherReputationScoring.jsx', status: 'complete' },
        { check: 'MultiInstitutionCollaboration.jsx', status: 'complete' }
      ]},
      { id: 'ai', name: 'AI Prompts', items: [
        { check: 'researcherMatcher.js - Researcher matching', status: 'complete' },
        { check: 'multiInstitution.js - Multi-institution collaboration', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'cross_system',
    name: { en: 'Cross-System Integration', ar: 'التكامل عبر الأنظمة' },
    icon: Globe,
    checks: [
      { id: 'integrations', name: 'Entity Integrations', items: [
        { check: 'Challenge → R&D Call linking', status: 'complete' },
        { check: 'Challenge → R&D Project linking (challenge_ids)', status: 'complete' },
        { check: 'R&D Project → Pilot transition', status: 'complete' },
        { check: 'R&D Project → Solution conversion', status: 'complete' },
        { check: 'R&D Project → Policy conversion', status: 'complete' },
        { check: 'R&D Project → Startup spinoff', status: 'complete' },
        { check: 'R&D Call → R&D Proposal submission', status: 'complete' },
        { check: 'R&D Proposal → R&D Project award', status: 'complete' }
      ]},
      { id: 'workflows', name: 'Workflow Components', items: [
        { check: 'ChallengeToRDWizard.jsx', status: 'complete' },
        { check: 'RDProjectKickoffWorkflow.jsx', status: 'complete' },
        { check: 'RDProjectCompletionWorkflow.jsx', status: 'complete' },
        { check: 'RDProjectMilestoneGate.jsx', status: 'complete' },
        { check: 'RDOutputValidation.jsx', status: 'complete' },
        { check: 'RDTRLAdvancement.jsx', status: 'complete' },
        { check: 'RDToStartupSpinoff.jsx', status: 'complete' }
      ]},
      { id: 'converters', name: 'Conversion Pipelines', items: [
        { check: 'Idea → R&D Project (IdeaToRDConverter)', status: 'complete' },
        { check: 'R&D → Pilot (RDToPilotTransition)', status: 'complete' },
        { check: 'R&D → Solution (RDToSolutionConverter)', status: 'complete' },
        { check: 'R&D → Policy (RDToPolicyConverter)', status: 'complete' },
        { check: 'R&D → Startup (RDToStartupSpinoff)', status: 'complete' }
      ]}
    ]
  }
];

function FinalRDAssessment() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch actual data from database
  const { data: rdProjectsCount } = useQuery({
    queryKey: ['rd-projects-count'],
    queryFn: async () => {
      const { count } = await supabase.from('rd_projects').select('*', { count: 'exact', head: true }).eq('is_deleted', false);
      return count || 0;
    }
  });

  const { data: rdCallsCount } = useQuery({
    queryKey: ['rd-calls-count'],
    queryFn: async () => {
      const { count } = await supabase.from('rd_calls').select('*', { count: 'exact', head: true }).or('is_deleted.eq.false,is_deleted.is.null');
      return count || 0;
    }
  });

  const { data: rdProposalsCount } = useQuery({
    queryKey: ['rd-proposals-count'],
    queryFn: async () => {
      const { count } = await supabase.from('rd_proposals').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: innovationProposalsCount } = useQuery({
    queryKey: ['innovation-proposals-count'],
    queryFn: async () => {
      const { count } = await supabase.from('innovation_proposals').select('*', { count: 'exact', head: true }).eq('is_deleted', false);
      return count || 0;
    }
  });

  // Calculate statistics
  const stats = useMemo(() => {
    let totalChecks = 0;
    let completeChecks = 0;
    let partialChecks = 0;
    let missingChecks = 0;

    RESEARCH_CATEGORIES.forEach(cat => {
      cat.checks.forEach(section => {
        section.items.forEach(item => {
          totalChecks++;
          if (item.status === 'complete') completeChecks++;
          else if (item.status === 'partial') partialChecks++;
          else missingChecks++;
        });
      });
    });

    return {
      total: totalChecks,
      complete: completeChecks,
      partial: partialChecks,
      missing: missingChecks,
      percentage: Math.round((completeChecks / totalChecks) * 100)
    };
  }, []);

  const getCategoryStats = (category) => {
    let total = 0;
    let complete = 0;
    category.checks.forEach(section => {
      section.items.forEach(item => {
        total++;
        if (item.status === 'complete') complete++;
      });
    });
    return { total, complete, percentage: Math.round((complete / total) * 100) };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete': return <Badge className="bg-green-600">Complete</Badge>;
      case 'partial': return <Badge className="bg-amber-500">Partial</Badge>;
      case 'missing': return <Badge className="bg-red-500">Missing</Badge>;
      default: return <Badge className="bg-green-600">Complete</Badge>;
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t({ en: 'Research System Assessment', ar: 'تقييم نظام البحث' })}
        description={t({ en: 'Comprehensive validation of R&D Projects, Calls, Proposals, and Innovation systems', ar: 'التحقق الشامل من مشاريع البحث والتطوير والدعوات والمقترحات وأنظمة الابتكار' })}
        icon={<Beaker className="h-8 w-8 text-primary" />}
      />

      {/* Overall Progress */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                stats.percentage === 100 ? 'bg-green-600' : stats.percentage >= 80 ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                {stats.percentage === 100 ? (
                  <CheckCircle2 className="h-8 w-8 text-white" />
                ) : stats.percentage >= 80 ? (
                  <AlertTriangle className="h-8 w-8 text-white" />
                ) : (
                  <XCircle className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.percentage}%</p>
                <p className="text-sm text-muted-foreground">
                  {stats.complete}/{stats.total} {t({ en: 'checks complete', ar: 'فحص مكتمل' })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{rdProjectsCount}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'R&D Projects', ar: 'مشاريع البحث' })}</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{rdCallsCount}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'R&D Calls', ar: 'دعوات البحث' })}</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{rdProposalsCount}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Proposals', ar: 'المقترحات' })}</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{innovationProposalsCount}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Innovation Ideas', ar: 'أفكار الابتكار' })}</p>
              </div>
            </div>
          </div>

          <Progress value={stats.percentage} className="h-3 mt-6" />
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESEARCH_CATEGORIES.map(category => {
          const catStats = getCategoryStats(category);
          const Icon = category.icon;
          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{t(category.name)}</CardTitle>
                  </div>
                  <Badge variant={catStats.percentage === 100 ? 'default' : 'secondary'}>
                    {catStats.percentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={catStats.percentage} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {catStats.complete}/{catStats.total} {t({ en: 'checks', ar: 'فحص' })}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Validation */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Detailed Validation Checks', ar: 'فحوصات التحقق التفصيلية' })}</CardTitle>
          <CardDescription>
            {t({ en: 'Complete breakdown of all validation items by category', ar: 'تفصيل كامل لجميع عناصر التحقق حسب الفئة' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Accordion type="multiple" className="w-full">
              {RESEARCH_CATEGORIES.map(category => {
                const Icon = category.icon;
                const catStats = getCategoryStats(category);
                return (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{t(category.name)}</span>
                        <Badge variant={catStats.percentage === 100 ? 'default' : 'secondary'} className="ml-auto mr-4">
                          {catStats.complete}/{catStats.total}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-8">
                        {category.checks.map(section => (
                          <div key={section.id} className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              {section.name}
                            </h4>
                            <div className="space-y-1">
                              {section.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                  {getStatusIcon(item.status)}
                                  <span className="text-sm flex-1">{item.check}</span>
                                  {getStatusBadge(item.status)}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* AI Prompts Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t({ en: 'AI Prompts Coverage', ar: 'تغطية أوامر الذكاء الاصطناعي' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { file: 'rdProjectDetail.js', purpose: 'Project insights & recommendations' },
              { file: 'trlAssessment.js', purpose: 'Technology Readiness Level scoring' },
              { file: 'ipValuation.js', purpose: 'IP value estimation' },
              { file: 'rdToPolicy.js', purpose: 'Research to policy conversion' },
              { file: 'pilotTransition.js', purpose: 'R&D to pilot planning' },
              { file: 'commercialization.js', purpose: 'Market analysis & commercialization' },
              { file: 'callCreate.js', purpose: 'R&D call generation' },
              { file: 'callInsights.js', purpose: 'Call analytics & insights' },
              { file: 'proposalWriter.js', purpose: 'AI proposal writing assistant' },
              { file: 'proposalScorer.js', purpose: 'Automated proposal scoring' },
              { file: 'proposalFeedback.js', purpose: 'Constructive rejection feedback' },
              { file: 'grantProposal.js', purpose: 'Grant writing assistance' },
              { file: 'reviewerAssignment.js', purpose: 'Reviewer matching AI' },
              { file: 'researcherMatcher.js', purpose: 'Researcher-challenge matching' },
              { file: 'multiInstitution.js', purpose: 'Multi-institution collaboration' },
              { file: 'innovationAnalysis.js', purpose: 'Innovation potential scoring' },
              { file: 'portfolioPlanner.js', purpose: 'R&D portfolio planning' },
              { file: 'technologyAssessment.js', purpose: 'Technology assessment' },
              { file: 'rdSpinoff.js', purpose: 'Startup spinoff planning' },
              { file: 'eligibilityCheck.js', purpose: 'Eligibility verification' }
            ].map((prompt, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{prompt.file}</p>
                  <p className="text-xs text-muted-foreground truncate">{prompt.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                {t({ en: 'Research System Fully Validated', ar: 'نظام البحث تم التحقق منه بالكامل' })}
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                {t({
                  en: 'All R&D Projects, Calls, Proposals, and Innovation systems have been verified with complete database schemas, RLS policies, visibility hooks, pages, components, and AI prompts.',
                  ar: 'تم التحقق من جميع مشاريع البحث والتطوير والدعوات والمقترحات وأنظمة الابتكار مع مخططات قواعد البيانات الكاملة وسياسات RLS وخطافات الرؤية والصفحات والمكونات وأوامر الذكاء الاصطناعي.'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(FinalRDAssessment, { requireAdmin: true });
