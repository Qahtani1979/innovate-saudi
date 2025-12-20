import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { AlertTriangle, CheckCircle2, Target, TrendingUp,
  ChevronDown, ChevronRight, Workflow, Network, Database, Brain,
  Building2, Map, Tags, Zap, Activity, BarChart3, Beaker,
  Award, BookOpen, Users, Rocket, Calendar,
  Microscope, FileText, Bell, Lock, Handshake
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ParallelUniverseTrackerPage() {
  const { t, language, isRTL } = useLanguage();
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // Fetch data for metrics
  const { data: programs = [] } = useQuery({
    queryKey: ['programs-universe'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes-universe'],
    queryFn: () => base44.entities.Sandbox.list()
  });

  const { data: livingLabs = [] } = useQuery({
    queryKey: ['livinglabs-universe'],
    queryFn: () => base44.entities.LivingLab.list()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations-universe'],
    queryFn: () => base44.entities.Organization.list()
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-universe'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors-universe'],
    queryFn: () => base44.entities.Sector.list()
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions-universe'],
    queryFn: () => base44.entities.Region.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-universe'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const { data: experts = [] } = useQuery({
    queryKey: ['experts-universe'],
    queryFn: () => base44.entities.ExpertProfile.list()
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['evaluations-universe'],
    queryFn: () => base44.entities.ExpertEvaluation.list()
  });

  const { data: knowledgeDocs = [] } = useQuery({
    queryKey: ['knowledge-universe'],
    queryFn: () => base44.entities.KnowledgeDocument.list()
  });

  const { data: approvalRequests = [] } = useQuery({
    queryKey: ['approvals-universe'],
    queryFn: () => base44.entities.ApprovalRequest.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-universe'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-universe'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-universe'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: scalingPlans = [] } = useQuery({
    queryKey: ['scaling-universe'],
    queryFn: () => base44.entities.ScalingPlan.list()
  });

  const { data: citizenIdeas = [] } = useQuery({
    queryKey: ['ideas-universe'],
    queryFn: () => base44.entities.CitizenIdea.list()
  });

  const { data: innovationProposals = [] } = useQuery({
    queryKey: ['proposals-universe'],
    queryFn: () => base44.entities.InnovationProposal.list()
  });

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['rdcalls-universe'],
    queryFn: () => base44.entities.RDCall.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rdprojects-universe'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const { data: rdProposals = [] } = useQuery({
    queryKey: ['rdproposals-universe'],
    queryFn: () => base44.entities.RDProposal.list()
  });

  const { data: policies = [] } = useQuery({
    queryKey: ['policies-universe'],
    queryFn: () => base44.entities.PolicyRecommendation.list()
  });

  const { data: programApplications = [] } = useQuery({
    queryKey: ['programapps-universe'],
    queryFn: () => base44.entities.ProgramApplication.list()
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-universe'],
    queryFn: () => base44.entities.Notification.list()
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages-universe'],
    queryFn: () => base44.entities.Message.list()
  });

  const { data: miiResults = [] } = useQuery({
    queryKey: ['mii-universe'],
    queryFn: () => base44.entities.MIIResult.list()
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles-universe'],
    queryFn: () => base44.entities.Role.list()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams-universe'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: partnerships = [] } = useQuery({
    queryKey: ['partnerships-universe'],
    queryFn: () => base44.entities.OrganizationPartnership.list()
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events-universe'],
    queryFn: () => base44.entities.Event.list()
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts-universe'],
    queryFn: () => base44.entities.Contract.list()
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets-universe'],
    queryFn: () => base44.entities.Budget.list()
  });

  const universes = [
    {
      id: 'pipeline',
      name: 'Innovation Pipeline Core',
      icon: Rocket,
      color: 'emerald',
      internalHealth: 100,
      ecosystemIntegration: 75,
      status: 'PLATINUM_STANDARD',
      description: '✅ PLATINUM: Challenge→Solution→Pilot→Scaling pipeline at 100% completion. Solutions module validated with all 10 conversions operational, full engagement workflows, performance tracking complete.',
      
      assets: [
        '✅ Challenge entity + 40+ pages (PLATINUM - 100%)',
        '✅ Solution entity + 20+ pages (PLATINUM - 100%)',
        '✅ Pilot entity + 30+ pages (PLATINUM)',
        '✅ ScalingPlan entity + workflows',
        '✅ 11 conversion workflows (100% verified)',
        '✅ AI matching & recommendations',
        '✅ All engagement workflows (Interest, Demo, Reviews)',
        '✅ Quality features (blind review, version history, deprecation)',
        `📊 ${challenges.length} challenges, ${solutions.length} solutions, ${pilots.length} pilots, ${scalingPlans.length} scaling plans`
      ],

      isolationSymptoms: [
        { symptom: 'Scaling→Policy institutionalization missing', severity: 'critical', impact: 'Successful scaling does not become permanent policy - one-off wins' },
        { symptom: 'Multi-city pilots exist but no coordination workflow', severity: 'critical', impact: 'Cross-city initiatives fragmented, no central orchestration' },
        { symptom: 'No real-time pipeline intelligence dashboard', severity: 'high', impact: 'Cannot see bottlenecks, velocity, health in real-time' },
        { symptom: 'Pipeline metrics exist but not PREDICTIVE', severity: 'high', impact: 'Cannot forecast which pilots will succeed or where delays will occur' },
        { symptom: 'Challenge clustering manual only', severity: 'medium', impact: 'Cannot auto-detect systemic issues or create strategic programs' }
      ],

      integrationGaps: [
        { from: 'ScalingPlan', to: 'Policy', status: 'missing', coverage: 0, gap: 'Successful scaling should auto-trigger policy recommendation creation' },
        { from: 'Pilot', to: 'Multi-City Coordination', status: 'exists_not_integrated', coverage: 20, gap: 'PilotCollaboration entity + MultiCityOrchestration page exist but not connected' },
        { from: 'Pipeline', to: 'Real-Time Intelligence', status: 'partial', coverage: 50, gap: 'CommandCenter exists but limited real-time analytics' },
        { from: 'Pipeline', to: 'Predictive Analytics', status: 'partial', coverage: 40, gap: 'Success predictors exist but not centralized' },
        { from: 'Challenge', to: 'Auto-Clustering', status: 'manual_only', coverage: 30, gap: 'Clustering exists but manual trigger only' }
      ],

      requiredWorkflows: [
        '❌ Scaling→Policy Institutionalization (successful scaling auto-creates policy recommendation)',
        '❌ Multi-City Pilot Coordination Workflow (integrate PilotCollaboration + MultiCityOrchestration)',
        '❌ Real-Time Pipeline Intelligence Dashboard (velocity, bottlenecks, health, alerts)',
        '❌ Predictive Pipeline Analytics (success forecasting, delay prediction, resource optimization)',
        '❌ Auto Challenge Clustering (detect systemic issues, trigger strategic programs)',
        '❌ Pipeline Velocity Optimization (identify and resolve slow points)'
      ],

      metrics: {
        pipelineConversionRate: Math.round((pilots.length / Math.max(challenges.length, 1)) * 100),
        scalingToPolicyRate: 0,
        multiCityPilotsCoordinated: 0,
        realTimeMonitoring: 50,
        pipelineIntegrationScore: 65
      }
    },

    {
      id: 'citizen',
      name: 'Citizen Engagement System',
      icon: Users,
      color: 'sky',
      internalHealth: 75,
      ecosystemIntegration: 40,
      status: 'INPUT_ONLY',
      description: 'Citizens can submit ideas and vote BUT weak feedback loops, no closure notifications, weak living lab integration, one-way engagement',
      
      assets: [
        '✅ CitizenIdea entity + workflow',
        '✅ InnovationProposal entity + workflow',
        '✅ CitizenVote, CitizenPoints, CitizenBadge entities',
        '✅ 20+ citizen engagement components',
        '✅ Public portal with submission forms',
        `📊 ${citizenIdeas.length} citizen ideas, ${innovationProposals.length} innovation proposals`,
        '📊 Gamification system (points, badges, leaderboard)'
      ],

      isolationSymptoms: [
        { symptom: 'Citizens submit ideas but no closure notification', severity: 'critical', impact: 'Citizens never learn if idea implemented - engagement broken' },
        { symptom: 'Citizen→LivingLab workflow missing', severity: 'critical', impact: 'Citizens cannot participate in living lab research (core value proposition)' },
        { symptom: 'Pilot feedback from citizens limited', severity: 'high', impact: 'Citizens are test users but feedback not systematically captured' },
        { symptom: 'No citizen contribution to policy', severity: 'high', impact: 'Citizen expertise wasted in policy making' },
        { symptom: 'Citizen engagement is INPUT-ONLY not TWO-WAY', severity: 'high', impact: 'Citizens give but do not receive outcomes/recognition' }
      ],

      integrationGaps: [
        { from: 'CitizenIdea', to: 'Closure Notification', status: 'missing', coverage: 0, gap: 'No workflow to notify citizen when idea becomes challenge/pilot/solution' },
        { from: 'Citizen', to: 'LivingLab Participation', status: 'missing', coverage: 0, gap: 'No citizen recruitment/participation/recognition workflow for labs' },
        { from: 'Citizen', to: 'Pilot Feedback', status: 'partial', coverage: 40, gap: 'CitizenPilotEnrollment exists but limited feedback capture' },
        { from: 'Citizen', to: 'Policy Consultation', status: 'exists_not_integrated', coverage: 20, gap: 'PolicyPublicConsultationManager exists but not widely used' },
        { from: 'CitizenEngagement', to: 'Municipal Capacity', status: 'missing', coverage: 0, gap: 'Citizen contributions do not improve municipal innovation capacity scores' }
      ],

      requiredWorkflows: [
        '❌ Citizen Idea Closure Notification (auto-notify when idea becomes challenge/pilot/solution)',
        '❌ Citizen→LivingLab Participation Workflow (recruitment → research → recognition)',
        '❌ Citizen Pilot Feedback Enhancement (systematic feedback capture, analysis, action)',
        '❌ Citizen→Policy Consultation Workflow (citizens review/comment on draft policies)',
        '❌ Citizen Contribution→MII Impact (measure how citizen engagement improves MII)',
        '❌ Two-Way Engagement Dashboard (show citizens what happened to their contributions)',
        '❌ Citizen Expert Recognition (identify power users, elevate to expert roles)'
      ],

      metrics: {
        ideasWithClosureNotification: 0,
        citizensInLivingLabs: 0,
        citizenPilotFeedback: citizenIdeas.filter(i => i.status === 'converted_to_pilot').length,
        citizenPolicyConsultations: 0,
        citizenEngagementScore: 40
      }
    },

    {
      id: 'strategy',
      name: 'Strategic Planning Universe',
      icon: Target,
      color: 'purple',
      internalHealth: 75,
      ecosystemIntegration: 15,
      status: 'ISOLATED',
      description: 'Strategic plans, pillars, objectives exist but do not DRIVE entity creation or define innovation priorities',
      
      assets: [
        '✅ StrategicPlan entity (comprehensive)',
        '✅ Strategic planning pages (15 pages)',
        '✅ OKR tracking system',
        '✅ Strategic dashboard',
        `📊 ${strategicPlans.length} strategic plans defined`
      ],

      isolationSymptoms: [
        { symptom: 'Strategy→Program: manual strategic_themes field exists, AI automation missing', severity: 'critical', impact: 'Programs created ad-hoc without AI theme generation' },
        { symptom: 'Strategy→Sandbox: infrastructure planning not automated', severity: 'critical', impact: 'Sandboxes not auto-spawned for strategic sectors' },
        { symptom: 'Strategy→LivingLab: research theme generation missing', severity: 'critical', impact: 'Lab research priorities not derived from strategy' },
        { symptom: 'Strategy→RDCall: manual rd_call_alignment exists, AI generator missing', severity: 'critical', impact: 'R&D calls not auto-generated from gaps' },
        { symptom: 'Strategic Priority Scoring: manual field exists, automation missing', severity: 'critical', impact: 'strategic_priority_level not auto-calculated' }
      ],

      integrationGaps: [
        { from: 'StrategicPlan', to: 'Program', status: 'missing', coverage: 0, gap: 'No workflow to create program campaigns FROM strategic priorities' },
        { from: 'StrategicPlan', to: 'Sandbox', status: 'missing', coverage: 0, gap: 'No workflow to plan sandbox infrastructure FROM strategic needs' },
        { from: 'StrategicPlan', to: 'LivingLab', status: 'missing', coverage: 0, gap: 'No workflow to define lab research themes FROM strategy' },
        { from: 'StrategicPlan', to: 'RDCall', status: 'missing', coverage: 0, gap: 'No workflow to create R&D calls FROM strategic gaps' },
        { from: 'Entity', to: 'StrategicPlan', status: 'partial', coverage: 30, gap: 'Entities have strategic_plan_ids but not DERIVED from strategy' }
      ],

      requiredWorkflows: [
        '❌ Strategy→ProgramTheme AI Generator (AI creates from strategic_themes field)',
        '❌ Strategy→SandboxPlanner (auto-spawn from strategic sectors)',
        '❌ Strategy→LabResearchPriorities (AI generates from strategy)',
        '❌ Strategy→RDCallGenerator (AI creates from rd_call_alignment field)',
        '❌ Strategic Priority Auto-Scorer (auto-calculate strategic_priority_level)'
      ],

      metrics: {
        entitiesWithStrategicLink: programs.filter(p => p.strategic_pillar_id || p.strategic_plan_ids?.length).length + sandboxes.filter(s => s.strategic_pillar_id).length + livingLabs.filter(l => l.strategic_pillar_id).length,
        entitiesDerivedFromStrategy: 0,
        strategicCoverageScore: 15
      }
    },

    {
      id: 'taxonomy',
      name: 'Taxonomy Universe',
      icon: Tags,
      color: 'indigo',
      internalHealth: 85,
      ecosystemIntegration: 30,
      status: 'PASSIVE',
      description: 'Sectors, subsectors, services exist and properly categorize entities BUT no analytics, routing, or intelligence',
      
      assets: [
        '✅ Sector entity (comprehensive)',
        '✅ Subsector entity (hierarchical)',
        '✅ Service entity (with SLA targets)',
        '✅ TaxonomyBuilder page',
        '✅ SectorDashboard page',
        `📊 ${sectors.length} sectors defined`,
        '📊 90% entity categorization (challenges/solutions/pilots use sectors)'
      ],

      isolationSymptoms: [
        { symptom: '✅ RESOLVED: ServicePerformanceDashboard exists (SLA tracking operational)', severity: 'resolved', impact: 'Service quality monitoring now available' },
        { symptom: '✅ RESOLVED: SectorDashboard exists (sector analytics operational)', severity: 'resolved', impact: 'Sector performance insights available' },
        { symptom: '⚠️ REMAINING: Service SLA automation needs enhancement', severity: 'medium', impact: 'Manual SLA monitoring, needs automation' },
        { symptom: '⚠️ REMAINING: Sector-based routing not implemented', severity: 'medium', impact: 'Could route solutions to sector-specialized sandboxes' },
        { symptom: 'Taxonomy analytics exist but could be more proactive', severity: 'low', impact: 'Foundation solid, AI layer optional' }
      ],

      integrationGaps: [
        { from: 'Service', to: 'Performance Tracking', status: 'missing', coverage: 0, gap: 'SLA targets defined but never monitored' },
        { from: 'Service', to: 'Challenge Analysis', status: 'missing', coverage: 0, gap: 'Cannot identify problematic services from challenge patterns' },
        { from: 'Sector', to: 'Analytics', status: 'partial', coverage: 30, gap: 'SectorDashboard exists but limited insights' },
        { from: 'Sector', to: 'Routing/Matching', status: 'missing', coverage: 0, gap: 'No sector-based sandbox/expert routing' },
        { from: 'Taxonomy', to: 'AI Intelligence', status: 'missing', coverage: 0, gap: 'No AI gap detection, sector insights, or service prediction' }
      ],

      requiredWorkflows: [
        '❌ Service Performance Monitoring (SLA compliance, quality scores, citizen ratings)',
        '❌ Service→Challenge aggregator (which services most problematic)',
        '❌ Sector Analytics & Benchmarking (compare sectors, detect gaps, AI insights)',
        '❌ Sector-based routing (route entities to sector-specialized infrastructure)',
        '❌ AI Taxonomy Intelligence (gap detection, auto-categorization, evolution)'
      ],

      metrics: {
        servicesWithSLA: 0,
        servicesMonitored: 0,
        sectorsAnalyzed: 0,
        taxonomyIntelligenceScore: 30
      }
    },

    {
      id: 'geography',
      name: 'Geography Universe',
      icon: Map,
      color: 'green',
      internalHealth: 85,
      ecosystemIntegration: 30,
      status: 'LABELS_ONLY',
      description: 'Regions, cities, municipalities exist with excellent entity linking BUT no regional analytics, multi-city coordination, or geographic AI',
      
      assets: [
        '✅ Region entity (hierarchical)',
        '✅ City entity (with demographics)',
        '✅ Municipality entity (with MII)',
        '✅ Management pages for all 3 levels',
        `📊 ${regions.length} regions, ${municipalities.length} municipalities`,
        '📊 90% entity linking (challenges/pilots properly assigned)'
      ],

      isolationSymptoms: [
        { symptom: '✅ RESOLVED: RegionalDashboard page exists (analytics operational)', severity: 'resolved', impact: 'Regional analytics now available' },
        { symptom: 'Cities exist but CityManagement is CRUD only, no analytics dashboard', severity: 'critical', impact: 'City-level analytics missing' },
        { symptom: 'Multi-City entity + page exist but workflow integration missing', severity: 'medium', impact: 'MultiCityOrchestration + PilotCollaboration exist but disconnected' },
        { symptom: 'Municipality AI components (7) exist but low integration', severity: 'medium', impact: 'MII improvement, peer benchmarking tools underutilized' },
        { symptom: 'Geography used to LABEL but analytics limited', severity: 'medium', impact: 'Some geographic intelligence exists, more coordination needed' }
      ],

      integrationGaps: [
        { from: 'Region', to: 'Analytics', status: 'missing', coverage: 0, gap: 'No regional dashboard or aggregated metrics' },
        { from: 'City', to: 'Analytics', status: 'missing', coverage: 0, gap: 'No city dashboard or performance tracking' },
        { from: 'Municipality', to: 'MII Improvement AI', status: 'exists_not_integrated', coverage: 0, gap: 'MIIImprovementAI component exists but not in dashboard' },
        { from: 'Municipality', to: 'Peer Benchmarking', status: 'exists_not_integrated', coverage: 0, gap: 'PeerBenchmarkingTool exists but not integrated' },
        { from: 'Multi-Municipality', to: 'Collaboration Workflow', status: 'exists_not_integrated', coverage: 0, gap: 'MultiCityOrchestration page + PilotCollaboration entity exist but not operational' }
      ],

      requiredWorkflows: [
        '✅ COMPLETE: RegionalDashboard page (verified exists)',
        '❌ City Analytics Dashboard (enhance CityManagement beyond CRUD)',
        '⚠️ OPTIONAL: Multi-City Collaboration enhancement (components exist)',
        '⚠️ OPTIONAL: Cross-City Learning Exchange (nice-to-have)',
        '⚠️ OPTIONAL: Geographic AI Integration (future enhancement)',
        '⚠️ OPTIONAL: Municipality AI components integration (future enhancement)'
      ],

      metrics: {
        regionsWithDashboard: 0,
        citiesWithMetrics: 0,
        multiCityPilots: 0,
        aiComponentsIntegrated: 0,
        geographicIntelligenceScore: 30
      }
    },

    {
      id: 'infrastructure',
      name: 'Testing Infrastructure Universe',
      icon: Beaker,
      color: 'blue',
      internalHealth: 70,
      ecosystemIntegration: 20,
      status: 'UNDERUTILIZED',
      description: 'Sandboxes and LivingLabs exist with good internal operations BUT bypassed by innovation pipeline, no policy feedback, weak transitions',
      
      assets: [
        '✅ Sandbox entity + 9 pages',
        '✅ LivingLab entity + 4 pages',
        '✅ 40+ infrastructure components',
        '✅ Monitoring systems',
        `📊 ${sandboxes.length} sandboxes, ${livingLabs.length} living labs`
      ],

      isolationSymptoms: [
        { symptom: 'Sandbox→Policy regulatory feedback workflow missing', severity: 'critical', impact: 'Regulatory learnings do not inform policy reform (core value gap)' },
        { symptom: 'LivingLab→Policy evidence workflow missing', severity: 'critical', impact: 'Citizen science findings not linked to policy recommendations' },
        { symptom: '⚠️ Sandbox risk routing: manual (optional automation)', severity: 'medium', impact: 'Risk assessment exists, auto-routing nice-to-have' },
        { symptom: '⚠️ Lab citizen workflow: exists but could enhance', severity: 'medium', impact: 'CitizenPilotEnrollment covers some, expansion optional' },
        { symptom: 'Infrastructure operational, key feedback loops missing', severity: 'critical', impact: '2 critical feedback workflows needed for policy impact' }
      ],

      integrationGaps: [
        { from: 'Pilot/Solution/R&D', to: 'Sandbox', status: 'missing', coverage: 0, gap: 'No automatic risk-based routing to sandboxes' },
        { from: 'Challenge', to: 'LivingLab', status: 'missing', coverage: 0, gap: 'No citizen research workflow for challenges' },
        { from: 'Sandbox', to: 'Policy', status: 'missing', coverage: 0, gap: 'Regulatory learnings do not feed policy reform' },
        { from: 'LivingLab', to: 'Policy', status: 'missing', coverage: 0, gap: 'Citizen evidence does not inform policy' },
        { from: 'Sandbox', to: 'Solution', status: 'missing', coverage: 0, gap: 'No sandbox-tested certification' },
        { from: 'LivingLab', to: 'Solution', status: 'missing', coverage: 0, gap: 'No citizen-tested commercialization' },
        { from: 'Citizen', to: 'LivingLab', status: 'missing', coverage: 0, gap: 'No citizen participant workflow' }
      ],

      requiredWorkflows: [
        '❌ Sandbox→Policy Regulatory Feedback (regulatory learnings → policy reform)',
        '❌ LivingLab→Policy Evidence Workflow (citizen science → policy recommendations)',
        '⚠️ OPTIONAL: Risk-based sandbox routing (manual works)',
        '⚠️ OPTIONAL: Sandbox→Solution certification (nice-to-have badge)',
        '⚠️ OPTIONAL: Lab citizen workflow enhancement (basic exists)',
        '⚠️ OPTIONAL: Lab→Solution commercialization (future)',
        '⚠️ OPTIONAL: Challenge→LivingLab routing (future)'
      ],

      metrics: {
        sandboxesStrategicallyPlanned: sandboxes.filter(s => s.strategic_pillar_id).length,
        sandboxUtilizationRate: 0,
        labsWithCitizenWorkflow: 0,
        infraPolicyFeedbackCount: 0,
        infrastructureIntegrationScore: 20
      }
    },

    {
      id: 'organizations',
      name: 'Organizations + Startups Universe',
      icon: Building2,
      color: 'cyan',
      internalHealth: 95,
      ecosystemIntegration: 90,
      status: 'INTEGRATED',
      description: '✅ MAJOR PROGRESS: Startup verification, awards, leaderboard, portfolio, proposal workflow, ecosystem health, R&D spinoff all implemented (30% → 90%)',
      
      assets: [
        '✅ Organization entity (comprehensive)',
        '✅ StartupProfile entity + StartupVerification entity',
        '✅ ProviderAward entity (recognition system)',
        '✅ OrganizationPartnership entity',
        '✅ ProviderPortfolioDashboard (multi-solution management)',
        '✅ StartupVerificationQueue (verification workflow)',
        '✅ ProviderLeaderboard (top 20 rankings)',
        '✅ StartupEcosystemDashboard (admin analytics)',
        '✅ ProviderProposalWizard (startup→challenge proposals)',
        '✅ RDToStartupSpinoff (commercialization workflow)',
        '✅ autoGenerateSuccessStory function',
        '✅ 17 AI components (partner discovery, network analysis, expert finder)',
        `📊 ${organizations.length} organizations, startup ecosystem operational`
      ],

      isolationSymptoms: [
        { symptom: '✅ RESOLVED: Startup verification workflow implemented', severity: 'resolved', impact: 'Trust and fraud prevention now operational' },
        { symptom: '✅ RESOLVED: Portfolio dashboard and performance tracking active', severity: 'resolved', impact: 'Providers can manage multi-solution portfolios' },
        { symptom: '✅ RESOLVED: Recognition system with leaderboard operational', severity: 'resolved', impact: 'Top providers showcased, awards tracked' },
        { symptom: '⚠️ REMAINING: 17 AI components still not fully integrated (18%)', severity: 'high', impact: 'AI tools exist but need workflow integration' },
        { symptom: '⚠️ REMAINING: Partnership e-signature workflow incomplete', severity: 'medium', impact: 'MOUs tracked manually' }
      ],

      integrationGaps: [
        { from: 'Organization', to: 'Startup Verification', status: 'implemented', coverage: 100, gap: '✅ Complete with StartupVerificationQueue' },
        { from: 'Organization', to: 'Performance Dashboard', status: 'implemented', coverage: 100, gap: '✅ ProviderPortfolioDashboard operational' },
        { from: 'Organization', to: 'Recognition System', status: 'implemented', coverage: 100, gap: '✅ ProviderAward + Leaderboard active' },
        { from: 'Startup', to: 'Challenge Proposal', status: 'implemented', coverage: 100, gap: '✅ ProviderProposalWizard + MunicipalProposalInbox' },
        { from: 'R&D', to: 'Startup Spinoff', status: 'implemented', coverage: 100, gap: '✅ RDToStartupSpinoff component' }
      ],

      requiredWorkflows: [
        '✅ COMPLETE: Startup verification workflow (11-point checklist, scoring)',
        '✅ COMPLETE: Provider proposal submission (wizard + municipal review)',
        '✅ COMPLETE: Awards & recognition (entity + leaderboard + badges)',
        '✅ COMPLETE: Portfolio management (multi-solution dashboard)',
        '✅ COMPLETE: Ecosystem health (admin analytics dashboard)',
        '✅ COMPLETE: Success story auto-generation (AI-powered)',
        '✅ COMPLETE: R&D commercialization (spinoff workflow)',
        '⚠️ TODO: INTEGRATE 17 AI components (partner discovery, network analysis, expert finder)',
        '⚠️ TODO: Partnership e-signature workflow'
      ],

      metrics: {
        orgsWithReputation: organizations.filter(o => o.reputation_score).length,
        orgsWithPerformanceTracking: solutions.filter(s => s.provider_id).length,
        aiComponentsIntegrated: 3,
        networkIntelligenceScore: 90,
        startupVerificationActive: true,
        providerAwardsTracked: true,
        leaderboardOperational: true
      }
    },

    {
      id: 'integration_index',
      name: 'AI Component Integration Index',
      icon: Brain,
      color: 'pink',
      internalHealth: 80,
      ecosystemIntegration: 15,
      status: 'BUILT_NOT_USED',
      description: '50+ AI components exist across the platform but integration rate is only 15% - massive capability waste',
      
      assets: [
        '📊 Programs: 4/4 AI widgets integrated (100%)',
        '📊 Sandboxes: 11 AI components built, 2 integrated (18%)',
        '📊 LivingLabs: 10 AI components built, 0 integrated (0%)',
        '📊 Organizations: 17 AI components built, 0 integrated (0%)',
        '📊 Municipalities: 7 AI components built, 0 integrated (0%)',
        '📊 Taxonomy: 7 AI features defined, 1 partial (14%)'
      ],

      isolationSymptoms: [
        { symptom: '50+ AI components exist but only ~15% integrated', severity: 'critical', impact: 'AI development effort wasted - built but unused' },
        { symptom: 'Components exist as standalone pages/widgets', severity: 'high', impact: 'Users must manually discover and trigger' },
        { symptom: 'No proactive AI recommendations', severity: 'high', impact: 'Platform has intelligence but does not advise users' },
        { symptom: 'AI scattered across codebase', severity: 'high', impact: 'Inconsistent UX, hard to maintain' }
      ],

      integrationGaps: [
        { from: 'SandboxAI', to: 'Workflows', status: 'exists_not_integrated', coverage: 18, gap: '11 sandbox AI components (exemption suggester, safety generator, risk assessment) not in application flow' },
        { from: 'LivingLabAI', to: 'Workflows', status: 'exists_not_integrated', coverage: 0, gap: '10 lab AI components (project matcher, expert matcher, citizen science) completely unused' },
        { from: 'OrganizationAI', to: 'Workflows', status: 'exists_not_integrated', coverage: 0, gap: '17 org AI components (partner discovery, network analysis, expert finder) totally disconnected' },
        { from: 'MunicipalityAI', to: 'Dashboard', status: 'exists_not_integrated', coverage: 0, gap: '7 municipality AI components (MII improvement, peer benchmarking, training) not in municipal dashboard' },
        { from: 'TaxonomyAI', to: 'System', status: 'exists_not_integrated', coverage: 14, gap: 'Gap detector exists, auto-categorize manual trigger only' }
      ],

      requiredWorkflows: [
        '❌ INTEGRATE Sandbox AI (exemption suggester + safety generator + risk assessment in application wizard)',
        '❌ INTEGRATE LivingLab AI (all 10 components into lab booking/research workflow)',
        '❌ INTEGRATE Organization AI (all 17 components into network pages)',
        '❌ INTEGRATE Municipality AI (7 components into MunicipalityDashboard)',
        '❌ INTEGRATE Taxonomy AI (gap detector auto-run, auto-categorize default)',
        '❌ Build Proactive AI Recommendation Engine (suggest actions across platform)',
        '❌ Build AI Component Registry & Usage Analytics'
      ],

      metrics: {
        totalAIComponents: 56,
        integratedComponents: 8,
        integrationRate: 14,
        wastedAICapability: 86
      }
    },

    {
      id: 'cross_entity',
      name: 'Cross-Entity Intelligence Universe',
      icon: Network,
      color: 'orange',
      internalHealth: 70,
      ecosystemIntegration: 25,
      status: 'WEAK_CONNECTIONS',
      description: 'Entity relations exist (ChallengeRelation, conversions) but weak ecosystem-wide intelligence, pattern detection, and opportunity matching',
      
      assets: [
        '✅ ChallengeRelation entity',
        '✅ Conversion workflows (11 conversions)',
        '✅ Matching systems (Challenge-Solution, Expert matching)',
        '✅ CrossEntityActivityStream page',
        '✅ Knowledge graph foundation'
      ],

      isolationSymptoms: [
        { symptom: 'Matchmaker programs have 20% engagement vs target 90%', severity: 'critical', impact: 'Partnership facilitation broken - matchmaker programs ineffective' },
        { symptom: 'Scaling plans exist but no policy institutionalization', severity: 'critical', impact: 'Successful scaling does not become permanent policy' },
        { symptom: 'Program graduates tracked but municipal capacity impact not measured', severity: 'high', impact: 'Cannot prove program effectiveness on municipal capability' },
        { symptom: 'Cross-entity recommendations exist but not proactive', severity: 'high', impact: 'Users must discover opportunities manually' }
      ],

      integrationGaps: [
        { from: 'MatchmakerProgram', to: 'Partnership Formation', status: 'weak', coverage: 20, gap: 'Matchmaker engagement 20% vs 90% target - workflow incomplete' },
        { from: 'ScalingPlan', to: 'Policy', status: 'missing', coverage: 0, gap: 'Successful scaling should institutionalize as policy' },
        { from: 'Program', to: 'Municipal Capacity', status: 'field_exists_no_automation', coverage: 0, gap: 'municipal_capacity_impact field exists but not calculated' },
        { from: 'CrossEntity', to: 'Recommendations', status: 'partial', coverage: 40, gap: 'Recommendations exist but not proactive' }
      ],

      requiredWorkflows: [
        '❌ Matchmaker Engagement Facilitation (move from 20% to 90% success rate)',
        '❌ Scaling→Policy Institutionalization (scaling plans become formal policies)',
        '❌ Program→Municipal Capacity Impact Tracking (measure capacity improvement)',
        '❌ Proactive Cross-Entity Recommender (suggest pilots for challenges, R&D for gaps, etc.)',
        '❌ Ecosystem Health Monitoring (detect bottlenecks, orphaned entities, dead-ends)'
      ],

      metrics: {
        matchmakerEngagementRate: 20,
        scalingToPolicy: 0,
        programCapacityImpactTracked: 0,
        crossEntityIntelligenceScore: 25
      }
    },

    {
      id: 'experts',
      name: 'Expert & Evaluation Universe',
      icon: Award,
      color: 'amber',
      internalHealth: 100,
      ecosystemIntegration: 100,
      status: 'PLATINUM_COMPLETE',
      description: '✅ PLATINUM: All 26 expert gaps resolved (14 P0 + 12 P1). Semantic search, consensus tracking, AI anomalies, workload balancing, 11 pages, 9 entity types, reputation scoring, expert discovery - all complete (Dec 3, 2025)',
      
      assets: [
        '✅ ExpertProfile entity (comprehensive)',
        '✅ ExpertAssignment entity',
        '✅ ExpertEvaluation entity (stage-specific)',
        '✅ EvaluationTemplate entity',
        '✅ ExpertRegistry page',
        '✅ ExpertMatchingEngine page',
        `📊 ${experts.length} experts registered`,
        `📊 ${evaluations.length} evaluations performed`
      ],

      isolationSymptoms: [
        { symptom: '✅ RESOLVED: Expert reputation via ExpertProfile.expert_rating + quality scores', severity: 'resolved', impact: 'Top experts identified via performance dashboard rankings' },
        { symptom: '✅ RESOLVED: Workload balancing in ExpertMatchingEngine with hours tracking', severity: 'resolved', impact: 'AI checks availability, prevents burnout, shows workload viz' },
        { symptom: '✅ RESOLVED: Expert discovery via semantic AI search in ExpertRegistry', severity: 'resolved', impact: 'AI-powered expert search + auto-matching for all 9 entity types' },
        { symptom: '✅ RESOLVED: Expert performance analytics in ExpertPerformanceDashboard + EvaluationAnalyticsDashboard', severity: 'resolved', impact: 'Comprehensive metrics: consensus rate, response time, quality, anomalies, burnout prediction' },
        { symptom: '✅ RESOLVED: Expert network via ExpertPanelManagement + cross-entity evaluations', severity: 'resolved', impact: 'Panel collaboration, consensus tracking, multi-expert workflows operational' }
      ],

      integrationGaps: [
        { from: 'Expert', to: 'Reputation System', status: 'implemented', coverage: 100, gap: '✅ ExpertProfile.expert_rating + evaluation_quality_score + performance rankings' },
        { from: 'Expert', to: 'Workload Dashboard', status: 'implemented', coverage: 100, gap: '✅ ExpertAssignmentQueue hours tracking + ExpertPerformanceDashboard workload viz + AI burnout detection' },
        { from: 'Expert', to: 'Proactive Discovery', status: 'implemented', coverage: 100, gap: '✅ ExpertRegistry semantic AI search + ExpertMatchingEngine 9-entity auto-matching' },
        { from: 'Expert', to: 'Network Intelligence', status: 'implemented', coverage: 100, gap: '✅ ExpertPanelManagement collaboration + EvaluationConsensusPanel + cross-entity analytics' },
        { from: 'Expert', to: 'Performance Analytics', status: 'implemented', coverage: 100, gap: '✅ ExpertPerformanceDashboard (consensus rate, anomalies, rankings) + EvaluationAnalyticsDashboard (cross-entity metrics, top 10, charts)' }
      ],

      requiredWorkflows: [
        '✅ Expert Reputation Scoring - expert_rating field + quality_score tracking',
        '✅ Expert Workload Balancing - hours tracking + AI burnout detection + workload visualization',
        '✅ Proactive Expert Discovery - semantic AI search + auto-matching 9 entity types',
        '✅ Expert Network Intelligence - panel collaboration + consensus analytics + cross-entity dashboard',
        '✅ Expert Performance Analytics - comprehensive metrics (consensus, anomalies, response time, quality)',
        '✅ Expert Profile Management - full CRUD with ExpertProfileEdit page'
      ],

      metrics: {
        expertsWithReputation: experts.filter(e => e.expert_rating > 0).length,
        expertsWithWorkloadTracking: experts.length,
        proactiveDiscoveryRate: 100,
        expertNetworkAnalyzed: experts.length,
        expertSystemIntegrationScore: 100
      }
    },

    {
      id: 'knowledge',
      name: 'Knowledge & Learning Universe',
      icon: BookOpen,
      color: 'teal',
      internalHealth: 65,
      ecosystemIntegration: 20,
      status: 'SCATTERED',
      description: 'Knowledge documents and case studies exist BUT not organized by taxonomy, no learning pathways, disconnected from entity workflows',
      
      assets: [
        '✅ KnowledgeDocument entity',
        '✅ CaseStudy entity',
        '✅ Knowledge page',
        '✅ 12 knowledge AI components built',
        `📊 ${knowledgeDocs.length} knowledge docs`,
        '📊 Knowledge graph foundation exists'
      ],

      isolationSymptoms: [
        { symptom: 'Knowledge not organized by sector/service taxonomy', severity: 'critical', impact: 'Cannot find relevant knowledge by challenge context' },
        { symptom: 'No learning pathways for users', severity: 'critical', impact: 'Users cannot develop expertise systematically' },
        { symptom: 'Knowledge disconnected from entities', severity: 'critical', impact: 'Pilots/R&D do not generate knowledge artifacts automatically' },
        { symptom: '12 knowledge AI components exist but 0% integrated', severity: 'critical', impact: 'AI learning path generator, content tagger, gap detector unused' },
        { symptom: 'Case studies not linked to scaling decisions', severity: 'high', impact: 'Past successes do not inform future scaling' }
      ],

      integrationGaps: [
        { from: 'Knowledge', to: 'Taxonomy', status: 'missing', coverage: 0, gap: 'Knowledge not categorized by sectors/services' },
        { from: 'User', to: 'Learning Pathways', status: 'missing', coverage: 0, gap: 'No personalized learning recommendations' },
        { from: 'Pilot/R&D', to: 'Knowledge Capture', status: 'manual_only', coverage: 20, gap: 'Lessons learned manual entry only, not automated' },
        { from: 'Knowledge', to: 'Decision Support', status: 'missing', coverage: 0, gap: 'Knowledge not surfaced in approval/scaling decisions' },
        { from: 'CaseStudy', to: 'Scaling Plans', status: 'missing', coverage: 0, gap: 'Past case studies not linked to new scaling decisions' },
        { from: 'Knowledge AI', to: 'Workflows', status: 'exists_not_integrated', coverage: 0, gap: '12 knowledge AI components completely unused' }
      ],

      requiredWorkflows: [
        '❌ Knowledge Taxonomy Organization (categorize by sector/service/theme)',
        '❌ Learning Pathway Generator (AI creates personalized learning paths)',
        '❌ Auto Knowledge Capture (Pilot→CaseStudy, R&D→Publication auto-generate)',
        '❌ Contextual Knowledge Widget (surface relevant knowledge in entity pages)',
        '❌ Knowledge→Scaling Decision Link (case studies inform scaling approvals)',
        '❌ INTEGRATE 12 Knowledge AI Components (tagger, gap detector, impact tracker, etc.)',
        '❌ Knowledge Contribution Gamification (reward knowledge sharing)'
      ],

      metrics: {
        knowledgeWithTaxonomy: knowledgeDocs.filter(k => k.sector_id || k.service_id).length,
        usersWithLearningPaths: 0,
        autoGeneratedKnowledge: 0,
        knowledgeAIIntegrated: 0,
        knowledgeSystemIntegrationScore: 20
      }
    },

    {
      id: 'workflow_system',
      name: 'Workflow & Approval Coordination',
      icon: Workflow,
      color: 'rose',
      internalHealth: 75,
      ecosystemIntegration: 35,
      status: 'ENTITY_SILOS',
      description: 'UnifiedWorkflowApprovalTab exists and works well per-entity (75%) BUT no cross-entity workflow coordination, bottleneck detection, or approval analytics',
      
      assets: [
        '✅ UnifiedWorkflowApprovalTab component',
        '✅ ApprovalCenter page (multi-entity queue)',
        '✅ ApprovalRequest entity',
        '✅ 25+ gate configs implemented',
        '✅ Workflow system operational',
        `📊 ${approvalRequests.length} approval requests tracked`
      ],

      isolationSymptoms: [
        { symptom: 'No cross-entity workflow orchestration', severity: 'critical', impact: 'Cannot coordinate multi-entity initiatives (Challenge+Pilot+Program)' },
        { symptom: 'No bottleneck detection across workflows', severity: 'critical', impact: 'Cannot identify which gates slow down ecosystem' },
        { symptom: 'No approval analytics dashboard', severity: 'high', impact: 'Cannot measure approval velocity, reviewer load, SLA compliance' },
        { symptom: 'No workflow intelligence', severity: 'high', impact: 'Cannot predict delays, suggest fast-tracks, optimize processes' },
        { symptom: 'Workflows work entity-by-entity but no ORCHESTRATION', severity: 'high', impact: 'Complex initiatives fragmented across entities' }
      ],

      integrationGaps: [
        { from: 'Workflow', to: 'Cross-Entity Orchestration', status: 'missing', coverage: 0, gap: 'Cannot coordinate Challenge+Solution+Pilot+Scaling as unified initiative' },
        { from: 'Workflow', to: 'Bottleneck Detection', status: 'missing', coverage: 0, gap: 'No AI detection of approval delays or stuck workflows' },
        { from: 'Workflow', to: 'Analytics Dashboard', status: 'partial', coverage: 40, gap: 'Basic ApprovalCenter exists but no analytics on velocity, SLA, reviewer load' },
        { from: 'Workflow', to: 'Predictive Intelligence', status: 'missing', coverage: 0, gap: 'No delay prediction or fast-track suggestions' },
        { from: 'Workflow', to: 'Capacity Planning', status: 'missing', coverage: 0, gap: 'No reviewer capacity planning or workload optimization' }
      ],

      requiredWorkflows: [
        '❌ Cross-Entity Initiative Orchestrator (coordinate Challenge→Solution→Pilot→Scaling as one journey)',
        '❌ Workflow Bottleneck Detector (AI identifies stuck workflows and delays)',
        '❌ Approval Analytics Dashboard (velocity, SLA compliance, reviewer load, trends)',
        '❌ Workflow Intelligence Engine (delay prediction, fast-track suggestions, optimization)',
        '❌ Reviewer Capacity Planning (workload balancing, burnout detection)',
        '❌ Automated Workflow Routing (smart routing based on complexity, priority, expertise)',
        '❌ Workflow Performance Benchmarking (compare approval times across entities/stages)'
      ],

      metrics: {
        crossEntityInitiatives: 0,
        bottlenecksDetected: 0,
        avgApprovalVelocity: 0,
        workflowIntelligenceScore: 35
      }
    },

    {
      id: 'programs',
      name: 'Programs & Acceleration Universe',
      icon: Calendar,
      color: 'violet',
      internalHealth: 80,
      ecosystemIntegration: 50,
      status: 'WELL_INTEGRATED',
      description: 'Innovation programs (accelerators, matchmakers, innovation campaigns) exist with excellent workflows BUT matchmaker engagement low (20%), weak municipal capacity impact measurement, no cross-program synergy',
      
      assets: [
        '✅ Program entity (comprehensive + strategic fields)',
        '✅ ProgramApplication entity + workflows',
        '✅ MatchmakerApplication entity + workflows',
        '✅ 25+ program components (curriculum, cohort, alumni, mentorship)',
        '✅ ProgramOperatorPortal (complete)',
        '✅ ParticipantDashboard (complete)',
        `📊 ${programs.length} programs, ${programApplications.length} applications`,
        '📊 AI: cohort optimizer, dropout predictor, alumni story generator, success predictor'
      ],

      isolationSymptoms: [
        { symptom: 'Matchmaker programs have 20% engagement vs 90% target', severity: 'critical', impact: 'Partnership facilitation broken - most matches do not engage' },
        { symptom: 'Municipal capacity impact not measured', severity: 'critical', impact: 'Cannot prove programs improve municipal innovation capability' },
        { symptom: 'Program graduates tracked but no deployment tracking', severity: 'high', impact: 'Unknown if startups/solutions actually deploy post-program' },
        { symptom: 'No cross-program synergy detection', severity: 'high', impact: 'Cannot identify overlap or complementary programs' },
        { symptom: 'Alumni network exists but not leveraged', severity: 'medium', impact: 'Alumni could mentor, evaluate, partner - untapped resource' }
      ],

      integrationGaps: [
        { from: 'MatchmakerApplication', to: 'Partnership Formation', status: 'weak', coverage: 20, gap: 'Match happens but no facilitation workflow - 80% matches inactive' },
        { from: 'Program', to: 'Municipal Capacity', status: 'field_exists_no_automation', coverage: 0, gap: 'municipal_capacity_impact field exists but never calculated' },
        { from: 'Program', to: 'Solution Deployment', status: 'missing', coverage: 0, gap: 'No tracking of graduate solutions deployed in marketplace' },
        { from: 'Program', to: 'Cross-Program Synergy', status: 'missing', coverage: 0, gap: 'No AI detection of overlapping or complementary programs' },
        { from: 'Alumni', to: 'Expert Network', status: 'missing', coverage: 0, gap: 'Alumni not auto-recruited as experts/mentors' }
      ],

      requiredWorkflows: [
        '❌ Matchmaker Engagement Facilitation (move from 20% to 90%: NDA templates, meeting scheduler, partnership tracker)',
        '❌ Municipal Capacity Impact Tracker (measure program effect on municipal innovation scores)',
        '❌ Graduate Deployment Tracker (track startup/solution market success post-program)',
        '❌ Cross-Program Synergy Detector (identify overlaps, suggest co-programming)',
        '❌ Alumni→Expert Pipeline (auto-recruit successful alumni as platform experts)',
        '❌ Program ROI Measurement (measure strategic KPI impact, deployment success, capacity improvement)'
      ],

      metrics: {
        matchmakerEngagementRate: 20,
        programsWithCapacityImpact: programs.filter(p => p.municipal_capacity_impact?.length).length,
        graduatesTrackedForDeployment: 0,
        crossProgramSynergyAnalyzed: 0,
        programIntegrationScore: 50
      }
    },

    {
      id: 'rd_research',
      name: 'R&D & Research Universe',
      icon: Microscope,
      color: 'indigo',
      internalHealth: 85,
      ecosystemIntegration: 55,
      status: 'WELL_DEVELOPED',
      description: 'R&D system comprehensive with calls, proposals, projects, TRL tracking, IP management BUT weak academia→policy impact tracking, limited R&D→solution commercialization rate',
      
      assets: [
        '✅ RDCall entity + 10 pages',
        '✅ RDProposal entity + workflows',
        '✅ RDProject entity + 15 pages',
        '✅ TRL assessment automation',
        '✅ IP management system',
        '✅ Publication tracking',
        `📊 ${rdCalls.length} R&D calls, ${rdProjects.length} projects, ${rdProposals.length} proposals`,
        '📊 All 15 R&D gaps from coverage report RESOLVED (100%)'
      ],

      isolationSymptoms: [
        { symptom: 'RDProject.publications field exists but no auto-tracker', severity: 'critical', impact: 'Publications manually entered, need external API automation' },
        { symptom: 'RDProject→PolicyRecommendation backlink missing', severity: 'critical', impact: 'Cannot track which research influenced which policies' },
        { symptom: '✅ IMPROVED: R&D→Solution conversion exists (RDToSolutionConverter)', severity: 'partial', impact: 'Workflow exists, adoption could increase' },
        { symptom: '✅ IMPROVED: Multi-institution supported (partner_institutions field)', severity: 'partial', impact: 'Data model supports, facilitation optional' },
        { symptom: '✅ IMPROVED: IP tracking exists (RDProject.patents, licenses)', severity: 'partial', impact: 'Manual tracking works, automation optional' }
      ],

      integrationGaps: [
        { from: 'RDProject Publications', to: 'Policy Impact', status: 'missing', coverage: 0, gap: 'No workflow to track which publications influenced policy recommendations' },
        { from: 'RDProject', to: 'Solution Commercialization', status: 'partial', coverage: 40, gap: 'RDToSolutionConverter exists but low adoption rate' },
        { from: 'RDProject', to: 'Multi-Institution Collaboration', status: 'exists_not_integrated', coverage: 20, gap: 'MultiInstitutionCollaboration component exists but rarely used' },
        { from: 'RDProject', to: 'Knowledge Repository', status: 'manual_only', coverage: 30, gap: 'Research outputs manually added to knowledge, not automated' },
        { from: 'IP', to: 'Commercialization Tracking', status: 'manual_only', coverage: 40, gap: 'IP licenses tracked but royalty/revenue not automated' }
      ],

      requiredWorkflows: [
        '❌ RDProject Publications Auto-Tracker (auto-update from external APIs)',
        '❌ RDProject→Policy Impact Link (track which publications influenced policy)',
        '⚠️ OPTIONAL: R&D→Solution adoption campaign (workflow exists, usage low)',
        '⚠️ OPTIONAL: Multi-institution facilitator (data model supports)',
        '⚠️ OPTIONAL: Auto knowledge capture (nice-to-have)',
        '⚠️ OPTIONAL: IP commercialization dashboard (manual tracking works)'
      ],

      metrics: {
        publicationsWithPolicyImpact: 0,
        rdToSolutionConversionRate: Math.round((solutions.filter(s => s.code?.includes('RD')).length / Math.max(rdProjects.length, 1)) * 100),
        multiInstitutionProjects: rdProjects.filter(p => p.partner_institutions?.length).length,
        autoKnowledgeCapture: 0,
        rdIntegrationScore: 55
      }
    },

    {
      id: 'policy',
      name: 'Policy & Regulation Universe',
      icon: FileText,
      color: 'slate',
      internalHealth: 70,
      ecosystemIntegration: 35,
      status: 'ENDPOINT_ONLY',
      description: 'Policy system exists as pipeline OUTPUT (pilots→policy, R&D→policy) BUT weak INPUT role - policy does not drive innovation or close regulatory loops',
      
      assets: [
        '✅ PolicyRecommendation entity',
        '✅ PolicyTemplate entity',
        '✅ PolicyHub page + 15 policy components',
        '✅ Policy workflows (legal review, ministry approval, public consultation)',
        `📊 ${policies.length} policy recommendations`,
        '📊 Multiple input paths (Pilot→Policy, R&D→Policy, Scaling→Policy, Challenge→Policy)'
      ],

      isolationSymptoms: [
        { symptom: 'Policy is OUTPUT only, not INPUT', severity: 'critical', impact: 'Policy documents created but do not drive new innovation priorities' },
        { symptom: 'Regulatory feedback loops incomplete', severity: 'critical', impact: 'Sandbox regulatory learnings do not reform regulations' },
        { symptom: 'LivingLab citizen evidence does not inform policy', severity: 'critical', impact: 'Citizen research wasted - findings not used in policy making' },
        { symptom: 'Policy adoption not tracked', severity: 'high', impact: 'Unknown if recommendations actually implemented by municipalities' },
        { symptom: 'Policy conflict detection manual only', severity: 'medium', impact: 'New policies may conflict with existing regulations' }
      ],

      integrationGaps: [
        { from: 'Policy', to: 'Innovation Priorities', status: 'missing', coverage: 0, gap: 'Adopted policies should trigger new challenges/programs' },
        { from: 'Sandbox', to: 'Regulatory Reform', status: 'missing', coverage: 0, gap: 'Sandbox learnings do not auto-feed policy recommendations' },
        { from: 'LivingLab', to: 'Policy Evidence', status: 'missing', coverage: 0, gap: 'Citizen research findings not linked to policy drafts' },
        { from: 'Policy', to: 'Adoption Tracking', status: 'missing', coverage: 0, gap: 'No workflow to track which municipalities adopted recommendations' },
        { from: 'Policy', to: 'Conflict Detection', status: 'exists_not_integrated', coverage: 30, gap: 'PolicyConflictDetector component exists but not in workflow' }
      ],

      requiredWorkflows: [
        '❌ Policy→Innovation Driver (adopted policies trigger challenges/R&D calls)',
        '❌ Sandbox→Policy Regulatory Feedback (sandbox learnings auto-generate reform recommendations)',
        '❌ LivingLab→Policy Evidence Workflow (citizen research data linked to policy drafts)',
        '❌ Policy Adoption Tracking System (track which municipalities implement recommendations)',
        '❌ Policy Conflict Auto-Detection (AI checks new policies against existing regulations)',
        '❌ Policy Impact Measurement (measure real-world effect of adopted policies)'
      ],

      metrics: {
        policiesDrivingInnovation: 0,
        sandboxFeedbackToPolicies: 0,
        labEvidenceInPolicies: 0,
        policyAdoptionTracked: policies.filter(p => p.adoption_status === 'implemented').length,
        policyIntegrationScore: 35
      }
    },

    {
      id: 'communications',
      name: 'Communications & Stakeholder Engagement Universe',
      icon: Bell,
      color: 'fuchsia',
      internalHealth: 65,
      ecosystemIntegration: 25,
      status: 'NOTIFICATION_ONLY',
      description: 'Notifications, messages, email templates exist BUT one-way broadcast only - no conversation intelligence, weak stakeholder mapping, missing engagement analytics',
      
      assets: [
        '✅ Notification entity + preferences',
        '✅ Message entity + messaging page',
        '✅ Email template system',
        '✅ Announcement system',
        '✅ 12+ communication components built',
        `📊 ${notifications.length} notifications, ${messages.length} messages`,
        '📊 NotificationCenter, AnnouncementSystem pages exist'
      ],

      isolationSymptoms: [
        { symptom: 'Communications are BROADCAST only, not CONVERSATION', severity: 'critical', impact: 'No two-way dialogue with stakeholders, cannot track responses' },
        { symptom: 'No stakeholder mapping or segmentation', severity: 'critical', impact: 'Cannot target communications to right audiences' },
        { symptom: 'No communication effectiveness analytics', severity: 'critical', impact: 'Unknown if stakeholders read/act on notifications' },
        { symptom: '12 AI components exist but 0% integrated', severity: 'critical', impact: 'AI message composer, notification router, conversation intelligence unused' },
        { symptom: 'No automated stakeholder engagement workflows', severity: 'high', impact: 'Cannot auto-engage stakeholders at decision points' }
      ],

      integrationGaps: [
        { from: 'Notification', to: 'Engagement Analytics', status: 'missing', coverage: 0, gap: 'No tracking of notification open rates, click rates, actions taken' },
        { from: 'Message', to: 'Conversation Intelligence', status: 'exists_not_integrated', coverage: 0, gap: 'ConversationIntelligence component exists but not integrated' },
        { from: 'Communication', to: 'Stakeholder Mapping', status: 'missing', coverage: 0, gap: 'No stakeholder segmentation or relationship tracking' },
        { from: 'Entity Workflow', to: 'Auto Stakeholder Engagement', status: 'partial', coverage: 20, gap: 'Some auto-notifications but not comprehensive' },
        { from: 'AI Communications', to: 'Workflows', status: 'exists_not_integrated', coverage: 0, gap: '12 AI components (message composer, notification router) completely unused' }
      ],

      requiredWorkflows: [
        '❌ Communication Engagement Analytics (track open rates, responses, actions)',
        '❌ Stakeholder Mapping & Segmentation (identify key stakeholders, track relationships)',
        '❌ Two-Way Conversation Intelligence (capture feedback, analyze sentiment, route responses)',
        '❌ Automated Stakeholder Engagement (auto-engage at workflow milestones)',
        '❌ INTEGRATE 12 AI Communication Components (message composer, router, analytics)',
        '❌ Multi-Channel Communication Orchestration (email + WhatsApp + in-app unified)',
        '❌ Stakeholder Sentiment Tracking (measure stakeholder satisfaction over time)'
      ],

      metrics: {
        notificationsWithAnalytics: 0,
        stakeholdersMapped: 0,
        conversationIntelligenceActive: 0,
        aiCommIntegrated: 0,
        communicationsIntegrationScore: 25
      }
    },

    {
      id: 'data_analytics',
      name: 'Data, Analytics & Reporting Universe',
      icon: Database,
      color: 'cyan',
      internalHealth: 70,
      ecosystemIntegration: 35,
      status: 'FRAGMENTED',
      description: 'MII calculation, KPI tracking, reporting systems exist BUT data quality weak, analytics fragmented across pages, no unified data governance',
      
      assets: [
        '✅ MIIResult entity + calculation',
        '✅ KPIReference entity + tracking',
        '✅ PilotKPI + PilotKPIDatapoint entities',
        '✅ ReportsBuilder, CustomReportBuilder pages',
        '✅ 25+ analytics dashboards',
        `📊 ${miiResults.length} MII results tracked`,
        '📊 Data quality, import/export tools exist'
      ],

      isolationSymptoms: [
        { symptom: 'Data quality monitoring exists but not enforced', severity: 'critical', impact: 'Bad data propagates through system, analytics unreliable' },
        { symptom: 'Analytics fragmented across 25+ dashboards', severity: 'critical', impact: 'No single source of truth, inconsistent metrics' },
        { symptom: 'No unified data governance', severity: 'critical', impact: 'No data stewards, ownership unclear, quality deteriorates' },
        { symptom: 'KPI tracking manual entry only', severity: 'high', impact: 'KPIs defined but not auto-populated from entity data' },
        { symptom: 'MII calculation not real-time', severity: 'high', impact: 'MII scores outdated, cannot track improvements dynamically' }
      ],

      integrationGaps: [
        { from: 'Data Quality', to: 'Enforcement', status: 'exists_not_enforced', coverage: 30, gap: 'DataQualityDashboard exists but no validation rules enforcement' },
        { from: 'Analytics', to: 'Unified Dashboard', status: 'fragmented', coverage: 40, gap: '25+ dashboards but no single source of truth' },
        { from: 'Data', to: 'Governance', status: 'missing', coverage: 0, gap: 'No data stewards, lineage tracking, or ownership model' },
        { from: 'KPI', to: 'Auto-Population', status: 'manual_only', coverage: 20, gap: 'KPIs tracked but not auto-calculated from entities' },
        { from: 'MII', to: 'Real-Time Calculation', status: 'batch_only', coverage: 40, gap: 'MII calculated periodically, not on entity changes' }
      ],

      requiredWorkflows: [
        '❌ Data Quality Enforcement Engine (auto-validate on entity create/update)',
        '❌ Unified Analytics Dashboard (single source of truth with drill-down)',
        '❌ Data Governance Framework (stewards, lineage, ownership, retention policies)',
        '❌ KPI Auto-Population System (calculate KPIs from entity data automatically)',
        '❌ Real-Time MII Calculation (recalculate MII on relevant entity changes)',
        '❌ Data Lineage Tracker (track data flow from source to reports)',
        '❌ Analytics AI Assistant (answer questions about data, generate insights)'
      ],

      metrics: {
        entitiesWithQualityScores: 0,
        kpisAutoPopulated: 0,
        dataGovernanceCoverage: 0,
        miiRealTimeEnabled: 0,
        dataAnalyticsIntegrationScore: 35
      }
    },

    {
      id: 'access_security',
      name: 'Access Control & Security Universe',
      icon: Lock,
      color: 'red',
      internalHealth: 80,
      ecosystemIntegration: 45,
      status: 'IMPLEMENTED_NOT_VALIDATED',
      description: 'RBAC system comprehensive with roles, teams, delegation, field-level permissions BUT security validation incomplete, RLS not enforced on all entities, audit gaps',
      
      assets: [
        '✅ Role entity + permission system',
        '✅ Team entity + membership',
        '✅ DelegationRule entity',
        '✅ RBACDashboard + 15 access management pages',
        '✅ Field-level permissions defined',
        `📊 ${roles.length} roles, ${teams.length} teams defined`,
        '📊 RBAC coverage reports exist (3 reports)'
      ],

      isolationSymptoms: [
        { symptom: 'RLS (Row-Level Security) defined but not enforced on all entities', severity: 'critical', impact: 'Data leakage risk - users may see unauthorized data' },
        { symptom: 'Permission checks exist but not comprehensive', severity: 'critical', impact: 'Some actions not permission-gated, security gaps' },
        { symptom: 'Audit trail incomplete', severity: 'high', impact: 'Cannot track who did what for compliance/forensics' },
        { symptom: 'Field-level permissions defined but enforcement spotty', severity: 'high', impact: 'Sensitive fields may be visible to unauthorized users' },
        { symptom: 'Security validation reports exist but findings not actioned', severity: 'high', impact: 'Known security gaps not prioritized for fixing' }
      ],

      integrationGaps: [
        { from: 'RLS', to: 'Entity Enforcement', status: 'partial', coverage: 60, gap: 'RLS rules defined but not enforced on all entity queries' },
        { from: 'Permissions', to: 'Action Gating', status: 'partial', coverage: 70, gap: 'Some pages/actions missing permission checks' },
        { from: 'Audit', to: 'Comprehensive Logging', status: 'partial', coverage: 50, gap: 'Some entity changes not logged to audit trail' },
        { from: 'Field Permissions', to: 'Frontend Enforcement', status: 'partial', coverage: 40, gap: 'Backend enforced but frontend still shows sensitive fields' },
        { from: 'Security Reports', to: 'Remediation Workflow', status: 'missing', coverage: 0, gap: 'Security findings documented but no remediation tracking' }
      ],

      requiredWorkflows: [
        '❌ RLS Comprehensive Enforcement (ensure all entity queries enforce RLS rules)',
        '❌ Permission Gating Audit (verify all actions have permission checks)',
        '❌ Comprehensive Audit Trail (log all entity changes, approvals, access)',
        '❌ Field-Level Security Frontend Enforcement (hide sensitive fields in UI)',
        '❌ Security Finding Remediation Tracker (prioritize and track security fixes)',
        '❌ Automated Security Testing (continuous validation of permission model)',
        '❌ Data Privacy Compliance Dashboard (GDPR, PDPL compliance monitoring)'
      ],

      metrics: {
        entitiesWithRLSEnforced: 0,
        actionsWithPermissionGates: 0,
        auditCoveragePercentage: 50,
        fieldSecurityEnforced: 40,
        securityIntegrationScore: 45
      }
    },

    {
      id: 'partnerships',
      name: 'Partnership Management Universe',
      icon: Handshake,
      color: 'lime',
      internalHealth: 60,
      ecosystemIntegration: 20,
      status: 'FRAGMENTED',
      description: 'Partnership entities exist (OrganizationPartnership, MatchmakerApplication) BUT no unified partnership lifecycle, weak MOU tracking, no partnership performance analytics',
      
      assets: [
        '✅ OrganizationPartnership entity',
        '✅ MatchmakerApplication entity + workflows',
        '✅ Partnership entity',
        '✅ 8+ partnership components built',
        `📊 ${partnerships.length} partnerships registered`,
        '✅ PartnershipMOUTracker page exists'
      ],

      isolationSymptoms: [
        { symptom: 'Partnership lifecycle fragmented across 3 entities', severity: 'critical', impact: 'Cannot track partnership from discovery→formation→execution→evaluation as unified journey' },
        { symptom: 'Matchmaker partnerships separate from org partnerships', severity: 'critical', impact: 'Same partnership tracked in 2 places, data inconsistency' },
        { symptom: 'No partnership performance analytics', severity: 'critical', impact: 'Cannot measure partnership success, ROI, or value delivered' },
        { symptom: 'MOU/agreements tracked but not workflow-integrated', severity: 'high', impact: 'Partnership agreements exist but not linked to approval gates or milestones' },
        { symptom: '8 AI partnership components exist but 0% integrated', severity: 'high', impact: 'Partner discovery, synergy detector, intelligence unused' }
      ],

      integrationGaps: [
        { from: 'Partnership', to: 'Unified Lifecycle', status: 'fragmented', coverage: 30, gap: 'No single journey from discovery→formation→delivery→evaluation' },
        { from: 'MatchmakerApp', to: 'OrganizationPartnership', status: 'missing', coverage: 0, gap: 'Successful matches should auto-create OrganizationPartnership records' },
        { from: 'Partnership', to: 'Performance Analytics', status: 'exists_not_integrated', coverage: 0, gap: 'PartnershipPerformanceDashboard component exists but not operational' },
        { from: 'Partnership', to: 'Workflow Gates', status: 'missing', coverage: 0, gap: 'Partnership agreements not linked to approval/milestone gates' },
        { from: 'AI Partnership', to: 'Workflows', status: 'exists_not_integrated', coverage: 0, gap: '8 AI components (discovery, synergy, intelligence) not integrated' }
      ],

      requiredWorkflows: [
        '❌ Unified Partnership Lifecycle (discovery→proposal→negotiation→MOU→execution→evaluation)',
        '❌ Matchmaker→Partnership Auto-Conversion (successful matches become formal partnerships)',
        '❌ Partnership Performance Dashboard (track deliverables, ROI, satisfaction, renewal)',
        '❌ Partnership Agreement Workflow Integration (link MOUs to approval gates)',
        '❌ INTEGRATE 8 Partnership AI Components (discovery, synergy detector, intelligence)',
        '❌ Partnership Network Analysis (identify strategic alliances, gap coverage)',
        '❌ Partnership Renewal & Expansion Automation (auto-suggest renewals based on success)'
      ],

      metrics: {
        partnershipsWithFullLifecycle: 0,
        matchmakerToPartnershipConversion: 0,
        partnershipsWithPerformanceTracking: 0,
        aiPartnershipIntegrated: 0,
        partnershipIntegrationScore: 20
      }
    },

    {
      id: 'events_campaigns',
      name: 'Events & Campaigns Universe',
      icon: Calendar,
      color: 'pink',
      internalHealth: 50,
      ecosystemIntegration: 15,
      status: 'DISCONNECTED',
      description: 'Event entity exists, campaign planning capabilities built BUT completely disconnected from programs, challenges, citizen engagement, and knowledge sharing',
      
      assets: [
        '✅ Event entity',
        '✅ CampaignPlanner page',
        '✅ EventCalendar page',
        '✅ AnnouncementSystem',
        `📊 ${events.length} events tracked`,
        '✅ Event registration capabilities'
      ],

      isolationSymptoms: [
        { symptom: 'Events exist but not linked to programs/pilots/challenges', severity: 'critical', impact: 'Events planned in isolation, not supporting core platform activities' },
        { symptom: 'No innovation campaign orchestration', severity: 'critical', impact: 'Cannot run campaigns to source challenges or engage citizens at scale' },
        { symptom: 'Event attendance not tracked or analyzed', severity: 'critical', impact: 'Cannot measure event effectiveness or engagement' },
        { symptom: 'No event→entity conversion workflows', severity: 'critical', impact: 'Hackathons/events should generate challenges/solutions but no automation' },
        { symptom: 'Campaign results not captured', severity: 'high', impact: 'Innovation campaigns run but outcomes (ideas, challenges, partnerships) not systematically captured' }
      ],

      integrationGaps: [
        { from: 'Event', to: 'Program', status: 'missing', coverage: 0, gap: 'Program events (demo days, pitch competitions) not linked to Program entity' },
        { from: 'Event', to: 'Challenge/Solution Discovery', status: 'missing', coverage: 0, gap: 'Hackathons/workshops should generate challenges/solutions automatically' },
        { from: 'Event', to: 'Citizen Engagement', status: 'missing', coverage: 0, gap: 'Events not used to drive citizen idea submissions or voting' },
        { from: 'Campaign', to: 'Entity Creation', status: 'manual_only', coverage: 0, gap: 'Innovation campaigns run but entity creation is manual' },
        { from: 'Event', to: 'Analytics', status: 'missing', coverage: 0, gap: 'No event ROI, attendance analysis, or effectiveness tracking' }
      ],

      requiredWorkflows: [
        '❌ Event→Program Integration (link program milestones to events: demo days, graduation)',
        '❌ Event→Entity Conversion (hackathons generate challenges/solutions automatically)',
        '❌ Innovation Campaign Orchestrator (plan campaign → execute → capture outcomes)',
        '❌ Event Attendance & Engagement Analytics (track participation, satisfaction, conversion)',
        '❌ Event→Citizen Engagement Driver (events trigger idea submissions, voting campaigns)',
        '❌ Event→Knowledge Capture (capture presentations, recordings, insights as knowledge)',
        '❌ Campaign Results Dashboard (measure challenges sourced, partnerships formed, ideas generated)'
      ],

      metrics: {
        eventsLinkedToPrograms: 0,
        eventsGeneratingEntities: 0,
        campaignsWithOutcomeTracking: 0,
        eventROIMeasured: 0,
        eventsIntegrationScore: 15
      }
    },

    {
      id: 'financial',
      name: 'Financial & Contract Management Universe',
      icon: FileText,
      color: 'emerald',
      internalHealth: 55,
      ecosystemIntegration: 20,
      status: 'OPERATIONAL_ISOLATED',
      description: 'Budget, Contract, Invoice, Vendor entities exist with basic tracking BUT disconnected from pilot/program gates, no financial intelligence, weak budget-to-outcome linkage',
      
      assets: [
        '✅ Budget entity',
        '✅ Contract entity',
        '✅ Invoice entity', 
        '✅ Vendor entity',
        '✅ Milestone entity',
        `📊 ${budgets.length} budgets, ${contracts.length} contracts tracked`,
        '✅ Basic management pages exist'
      ],

      isolationSymptoms: [
        { symptom: 'Budgets exist but not linked to pilot/program approval gates', severity: 'critical', impact: 'Budget approvals happen separately from project approvals - disconnect' },
        { symptom: 'Contracts exist but not linked to partnerships or solutions', severity: 'critical', impact: 'Partnership MOUs and solution deployment contracts separate systems' },
        { symptom: 'No budget vs outcome tracking', severity: 'critical', impact: 'Cannot measure ROI - spending tracked but impact not linked' },
        { symptom: 'Invoice/vendor tracking operational but no intelligence', severity: 'high', impact: 'Cannot identify high-performing vendors or optimize procurement' },
        { symptom: 'Financial data siloed from strategic dashboards', severity: 'high', impact: 'Executive/Municipality dashboards lack financial insights' }
      ],

      integrationGaps: [
        { from: 'Budget', to: 'Pilot/Program Gates', status: 'missing', coverage: 0, gap: 'Budget approval not integrated with project kickoff gates' },
        { from: 'Contract', to: 'Partnership/Solution', status: 'missing', coverage: 0, gap: 'Partnership agreements and solution contracts not linked to entities' },
        { from: 'Budget', to: 'Outcome Tracking', status: 'missing', coverage: 0, gap: 'No linkage between spending and KPI achievement' },
        { from: 'Vendor', to: 'Performance Intelligence', status: 'missing', coverage: 0, gap: 'No vendor scorecards or procurement optimization' },
        { from: 'Financial', to: 'Executive Dashboards', status: 'missing', coverage: 0, gap: 'Financial metrics not visible in strategic dashboards' }
      ],

      requiredWorkflows: [
        '❌ Budget→Gate Integration (budget approvals as approval gates for pilots/programs)',
        '❌ Contract Lifecycle Management (contracts linked to partnerships/solutions with e-signature)',
        '❌ Budget-to-Outcome Linkage (track spending vs KPI achievement)',
        '❌ Vendor Performance Scorecards (rate vendors, optimize procurement)',
        '❌ Financial Intelligence Dashboard (financial metrics in executive/municipality views)',
        '❌ Budget Variance Analysis & Alerts (detect overspending, predict budget needs)',
        '❌ ROI Calculator Integration (calculate financial return on pilots/programs)'
      ],

      metrics: {
        budgetsLinkedToGates: 0,
        contractsLinkedToEntities: 0,
        budgetOutcomeTracking: 0,
        vendorsWithPerformance: 0,
        financialIntegrationScore: 20
      }
    }
  ];

  const overallMetrics = {
    totalUniverses: universes.length,
    averageInternalHealth: Math.round(universes.reduce((sum, u) => sum + u.internalHealth, 0) / universes.length),
    averageEcosystemIntegration: Math.round(universes.reduce((sum, u) => sum + u.ecosystemIntegration, 0) / universes.length),
    isolatedUniverses: universes.filter(u => u.ecosystemIntegration < 40).length,
    wellIntegrated: universes.filter(u => u.ecosystemIntegration >= 50).length,
    criticalIntegrations: universes.reduce((sum, u) => sum + u.integrationGaps.filter(g => g.status === 'missing').length, 0),
    requiredWorkflows: universes.reduce((sum, u) => sum + u.requiredWorkflows.length, 0)
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-pink-700 bg-clip-text text-transparent">
          {t({ en: '🌌 Parallel Universe Syndrome Tracker', ar: '🌌 متتبع متلازمة العوالم المتوازية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: '✅ VALIDATED Dec 4: 11 P0 gaps remaining (10 verified complete)', ar: 'موثق 4 ديسمبر: 11 فجوة P0 متبقية' })}
        </p>
      </div>

      {/* Overall Health */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Activity className="h-6 w-6" />
            {t({ en: 'System Integration Health', ar: 'صحة تكامل النظام' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-purple-600">{universes.length}</p>
              <p className="text-xs text-slate-600">Platform Subsystems</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-green-600">{overallMetrics.averageInternalHealth}%</p>
              <p className="text-xs text-slate-600">Avg Internal Health</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-red-600">{overallMetrics.averageEcosystemIntegration}%</p>
              <p className="text-xs text-slate-600">Ecosystem Integration</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-red-300">
              <p className="text-3xl font-bold text-red-600">{overallMetrics.isolatedUniverses}</p>
              <p className="text-xs text-slate-600">Isolated (&lt;40%)</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-green-300">
              <p className="text-3xl font-bold text-green-600">{overallMetrics.wellIntegrated}</p>
              <p className="text-xs text-slate-600">Well Integrated (≥50%)</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-orange-300">
              <p className="text-3xl font-bold text-orange-600">{overallMetrics.criticalIntegrations}</p>
              <p className="text-xs text-slate-600">Missing Links</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-amber-600">{overallMetrics.requiredWorkflows}</p>
              <p className="text-xs text-slate-600">Workflows Needed</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-100 rounded-lg border-2 border-red-400">
              <p className="font-bold text-red-900 mb-2">🚨 Critical Pattern Detected</p>
              <p className="text-sm text-red-800">
                <strong>Strong foundations ({overallMetrics.averageInternalHealth}% internal health)</strong> but <strong>weak integration ({overallMetrics.averageEcosystemIntegration}% ecosystem connection)</strong>.
                <br/><br/>
                {overallMetrics.isolatedUniverses} out of {universes.length} subsystems are ISOLATED (integration &lt; 40%).
              </p>
            </div>

            <div className="p-4 bg-green-100 rounded-lg border-2 border-green-400">
              <p className="font-bold text-green-900 mb-2">✅ Positive Indicators</p>
              <p className="text-sm text-green-800">
                {overallMetrics.wellIntegrated} subsystems at <strong>≥50% integration</strong> (Innovation Pipeline, Programs, R&D).
                <br/><br/>
                Core value chain STRONG. Need to extend integration to supporting systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Universe Tracking */}
      {universes.map((universe, idx) => {
        const UniverseIcon = universe.icon;
        const isExpanded = expanded[universe.id];

        return (
          <Card key={universe.id} className={`border-2 border-${universe.color}-300`}>
            <CardHeader>
              <button
                onClick={() => toggle(universe.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <UniverseIcon className={`h-6 w-6 text-${universe.color}-600`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className={`text-${universe.color}-900`}>{universe.name}</CardTitle>
                      <Badge className={
                        universe.status === 'ISOLATED' ? 'bg-red-600' :
                        universe.status === 'PASSIVE' ? 'bg-orange-600' :
                        universe.status === 'LABELS_ONLY' ? 'bg-yellow-600' :
                        universe.status === 'UNDERUTILIZED' ? 'bg-amber-600' :
                        universe.status === 'NODES_WITHOUT_NETWORK' ? 'bg-blue-600' :
                        universe.status === 'INTERNAL_ONLY' ? 'bg-amber-600' :
                        universe.status === 'SCATTERED' ? 'bg-teal-600' :
                        universe.status === 'ENTITY_SILOS' ? 'bg-rose-600' :
                        universe.status === 'STRONG_BUT_INCOMPLETE' ? 'bg-emerald-600' :
                        universe.status === 'INPUT_ONLY' ? 'bg-sky-600' :
                        universe.status === 'WELL_INTEGRATED' ? 'bg-violet-600' :
                        universe.status === 'WELL_DEVELOPED' ? 'bg-indigo-600' :
                        universe.status === 'ENDPOINT_ONLY' ? 'bg-slate-600' :
                        universe.status === 'NOTIFICATION_ONLY' ? 'bg-fuchsia-600' :
                        universe.status === 'FRAGMENTED' ? 'bg-cyan-600' :
                        universe.status === 'IMPLEMENTED_NOT_VALIDATED' ? 'bg-red-600' :
                        'bg-purple-600'
                      }>{universe.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{universe.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Internal:</span>
                      <Badge className="bg-green-100 text-green-700">{universe.internalHealth}%</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">Integration:</span>
                      <Badge className="bg-red-100 text-red-700">{universe.ecosystemIntegration}%</Badge>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </button>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-6">
                {/* Assets */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Existing Assets
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {universe.assets.map((asset, i) => (
                      <div key={i} className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                        {asset}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Isolation Symptoms */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Isolation Symptoms
                  </h4>
                  <div className="space-y-2">
                    {universe.isolationSymptoms.map((symptom, i) => (
                      <div key={i} className={`p-3 rounded-lg border-2 ${
                        symptom.severity === 'critical' ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'
                      }`}>
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm text-red-900">{symptom.symptom}</p>
                          <Badge className={symptom.severity === 'critical' ? 'bg-red-600' : 'bg-orange-600'}>
                            {symptom.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-red-700">💥 Impact: {symptom.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integration Gaps */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Network className="h-5 w-5 text-blue-600" />
                    Integration Gaps ({universe.integrationGaps.length})
                  </h4>
                  <div className="space-y-2">
                    {universe.integrationGaps.map((gap, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900">{gap.from}</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-sm font-medium text-slate-900">{gap.to}</span>
                          </div>
                          <p className="text-xs text-slate-600">{gap.gap}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={gap.coverage} className="w-20" />
                          <Badge className={
                            gap.status === 'missing' ? 'bg-red-100 text-red-700' :
                            gap.status === 'exists_not_integrated' ? 'bg-orange-100 text-orange-700' :
                            gap.status === 'weak' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }>{gap.coverage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Workflows */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-purple-600" />
                    Required Workflows ({universe.requiredWorkflows.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {universe.requiredWorkflows.map((workflow, i) => (
                      <div key={i} className="p-2 bg-purple-50 border border-purple-200 rounded text-sm text-purple-900">
                        {workflow}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                {universe.metrics && (
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-semibold text-slate-900 mb-2">📊 Current Metrics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(universe.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-600">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="font-semibold">{typeof value === 'number' && key.includes('Score') ? `${value}%` : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Solution Roadmap */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Zap className="h-6 w-6" />
            {t({ en: 'Integration Solution Roadmap', ar: 'خارطة طريق الحل' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-100 rounded-lg border border-green-300">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">Phase 1: Cross-Linkage Fields ✅ COMPLETE</p>
                <p className="text-sm text-green-800">Added taxonomy, strategic, geographic IDs to all entities (4/4 entities upgraded)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-100 rounded-lg border-2 border-orange-400">
              <Target className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">Phase 2: Definition Workflows ← CURRENT PRIORITY</p>
                <p className="text-sm text-orange-800 mb-2">Build workflows that USE the linkages to DEFINE entities from strategy/taxonomy</p>
                <div className="space-y-1 text-xs">
                  <p className="text-orange-700">• Strategy→Program theme definition (5 workflows needed)</p>
                  <p className="text-orange-700">• Sector-based routing and matching (3 workflows)</p>
                  <p className="text-orange-700">• Geographic coordination workflows (4 workflows)</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-300">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Phase 3: Dimensional Analytics</p>
                <p className="text-sm text-blue-800">Build analytics that AGGREGATE across dimensions (Regional MII, Sector performance, Service quality)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-300">
              <Brain className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-purple-900">Phase 4: AI Orchestration</p>
                <p className="text-sm text-purple-800">Build AI that ORCHESTRATES across subsystems (Network intelligence, Collaboration suggester, Gap analyzer)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg border border-pink-300">
              <Zap className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-pink-900">Phase 5: Component Integration Blitz</p>
                <p className="text-sm text-pink-800">INTEGRATE 50+ existing AI components (currently 14% integrated → target 80%)</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-400">
            <p className="font-bold text-purple-900 mb-2">🎯 Success Criteria</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-purple-800 font-medium">Ecosystem Integration Target:</p>
                <p className="text-purple-900 text-2xl font-bold">24% → 75%</p>
              </div>
              <div>
                <p className="text-purple-800 font-medium">AI Component Integration:</p>
                <p className="text-purple-900 text-2xl font-bold">14% → 80%</p>
              </div>
              <div>
                <p className="text-purple-800 font-medium">Critical Workflows:</p>
                <p className="text-purple-900 text-2xl font-bold">0 → {overallMetrics.requiredWorkflows} built</p>
              </div>
              <div>
                <p className="text-purple-800 font-medium">Cross-System Intelligence:</p>
                <p className="text-purple-900 text-2xl font-bold">Passive → Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Target className="h-6 w-6" />
            {t({ en: 'Priority Actions to Break Isolation', ar: 'إجراءات ذات أولوية لكسر العزلة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border-2 border-red-400 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-600">P0 #1</Badge>
                <h4 className="font-semibold text-red-900">Strategy→Entity Definition Workflows (5 workflows)</h4>
              </div>
              <p className="text-sm text-red-800 mb-2">Make strategy DRIVE the innovation pipeline by building definition workflows</p>
              <div className="space-y-1 text-xs text-red-700">
                <p>• Strategy→Program theme generator</p>
                <p>• Strategy→Sandbox infrastructure planner</p>
                <p>• Strategy→LivingLab research priorities</p>
                <p>• Strategy→RDCall focus areas</p>
                <p>• Strategic priority scoring automation</p>
              </div>
            </div>

            <div className="p-4 border-2 border-orange-400 rounded-lg bg-orange-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-600">P0 #2</Badge>
                <h4 className="font-semibold text-orange-900">Dimensional Analytics Dashboards (5 dashboards)</h4>
              </div>
              <p className="text-sm text-orange-800 mb-2">Build analytics that aggregate across taxonomy/geography dimensions</p>
              <div className="space-y-1 text-xs text-orange-700">
                <p>• Regional Dashboard (aggregate municipality metrics, regional MII)</p>
                <p>• City Dashboard (city-level metrics, economic indicators)</p>
                <p>• Service Performance Dashboard (SLA compliance, quality tracking)</p>
                <p>• Organization Portfolio Dashboard (aggregated org activities)</p>
                <p>• Organization Reputation Dashboard (reputation scores, rankings)</p>
              </div>
            </div>

            <div className="p-4 border-2 border-yellow-400 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-600">P0 #3</Badge>
                <h4 className="font-semibold text-yellow-900">AI Component Integration Blitz (50+ components)</h4>
              </div>
              <p className="text-sm text-yellow-800 mb-2">INTEGRATE existing AI components into workflows (currently 14% → target 80%)</p>
              <div className="space-y-1 text-xs text-yellow-700">
                <p>• Organizations: 17 AI components (0% integrated)</p>
                <p>• Sandboxes: 11 AI components (18% integrated)</p>
                <p>• LivingLabs: 10 AI components (0% integrated)</p>
                <p>• Municipalities: 7 AI components (0% integrated)</p>
                <p>• Taxonomy: 7 AI features (14% integrated)</p>
              </div>
            </div>

            <div className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600">P0 #4</Badge>
                <h4 className="font-semibold text-blue-900">Ecosystem Output Workflows (8 workflows)</h4>
              </div>
              <p className="text-sm text-blue-800 mb-2">Build critical output workflows that close ecosystem loops</p>
              <div className="space-y-1 text-xs text-blue-700">
                <p>• Sandbox→Policy feedback (regulatory learnings)</p>
                <p>• LivingLab→Policy evidence (citizen findings)</p>
                <p>• Academia→Publications tracking</p>
                <p>• Academia→Policy impact</p>
                <p>• Multi-City collaboration workflow</p>
                <p>• Matchmaker engagement facilitation</p>
                <p>• Scaling→Policy institutionalization</p>
                <p>• Municipal capacity impact tracking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            {t({ en: 'Integration Progress', ar: 'تقدم التكامل' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {universes.map((universe) => (
              <div key={universe.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{universe.name}</span>
                  <span className="text-sm text-slate-600">{universe.ecosystemIntegration}%</span>
                </div>
                <Progress value={universe.ecosystemIntegration} className="h-2" />
              </div>
            ))}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-300">
              <p className="text-sm text-blue-900 font-semibold mb-2">🎯 Target State</p>
              <p className="text-sm text-blue-800">
                All universes at <strong>75%+ ecosystem integration</strong> by implementing definition workflows, dimensional analytics, and AI orchestration.
                <br/><br/>
                Transform platform from <strong>FEATURE COLLECTION</strong> to <strong>INTEGRATED SYSTEM</strong> where subsystems drive and inform each other.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ParallelUniverseTrackerPage, {
  requireAdmin: true
});