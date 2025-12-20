import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { 
  FileText, CheckCircle2, AlertCircle, Circle, ChevronDown, ChevronRight, 
  Sparkles, Database, Zap, Target
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function ContentAudit() {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // CONTENT AUDIT - Static vs Dynamic
  const contentAudit = [
    {
      section: 'Core Entity Pages',
      priority: 'CRITICAL',
      pages: [
        { name: 'Challenges', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Empty state needs illustration', 'is_published/is_confidential visibility UI missing'] },
        { name: 'ChallengeDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Help tooltips missing on technical fields', 'Publishing workflow content missing', 'Domain expert evaluation content missing'] },
        { name: 'Solutions', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['is_published field UI missing', 'No content for Idea→Solution/R&D→Solution/Program→Solution input workflows'] },
        { name: 'SolutionDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Case studies content sometimes sparse', 'Publishing workflow content missing', 'Technical verification rubric content missing', 'No "what startup provides" clarification'] },
        { name: 'Pilots', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Public visibility workflow content missing', 'No Sandbox/Lab allocation guidance'] },
        { name: 'PilotDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Timeline visualization lacks explanatory text', 'No content for Pilot→R&D/Policy/Procurement closure workflows', 'Evaluation rubric content weak', 'No "WHERE solutions get tested" clarification'] },
        { name: 'RDProjects', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['is_published visibility field UI missing'] },
        { name: 'RDProjectDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Publications section needs formatting guidance', 'No R&D→Solution commercialization workflow content', 'No R&D→Knowledge/Policy workflow content', 'Publishing workflow content missing'] },
        { name: 'Programs', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['program_type classification selector missing', 'is_public field UI missing', 'No taxonomy linkage UI', 'No "innovation campaigns NOT education" clarification'] },
        { name: 'ProgramDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Curriculum content editor basic', 'No program type display/selector', 'No taxonomy context shown', 'No strategic alignment shown', 'No Program→Solution graduation workflow content'] },
        { name: 'RDCalls', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'RDCallDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Eligibility criteria needs clearer formatting'] },
      ]
    },
    {
      section: 'Portals & Dashboards',
      priority: 'CRITICAL',
      pages: [
        { name: 'Home', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['First-time user guidance minimal'] },
        { name: 'ExecutiveDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'AdminPortal', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI strategic insights panel', 'No contextual help'] },
        { name: 'MunicipalityDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Onboarding checklist needs expansion'] },
        { name: 'StartupDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['No opportunity pipeline content (challenges pursued→proposals→pilots won→municipal clients)', 'No "opportunity discovery NOT VC/funding" clarification', 'StartupProfile visibility controls missing'] },
        { name: 'AcademiaDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProgramOperatorPortal', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PublicPortal', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Static content lacks engaging copy', 'No AI chatbot for public'] },
      ]
    },
    {
      section: 'Analytics & Intelligence',
      priority: 'HIGH',
      pages: [
        { name: 'PipelineHealthDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete' },
        { name: 'MII', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete' },
        { name: 'Trends', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial' },
        { name: 'SectorDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial' },
        { name: 'PredictiveAnalytics', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete' },
        { name: 'PredictiveInsights', hasStaticContent: true, hasDynamicContent: false, hasAIContent: true, status: 'complete' },
      ]
    },
    {
      section: 'My Work Pages',
      priority: 'HIGH',
      pages: [
        { name: 'MyWorkloadDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'MyApprovals', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Approval rationale could be clearer'] },
        { name: 'MyDeadlines', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI priority scoring', 'No contextual tips'] },
        { name: 'MyPerformance', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI coaching', 'Generic KPI descriptions'] },
        { name: 'MyLearning', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Learning content library limited'] },
        { name: 'TaskManagement', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI task prioritization'] },
        { name: 'MyChallenges', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI next steps suggestions'] },
        { name: 'MyPilots', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI performance alerts'] },
      ]
    },
    {
      section: 'Approval Workflows',
      priority: 'HIGH',
      pages: [
        { name: 'ApprovalCenter', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ChallengeReviewQueue', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI approval suggestions', 'No decision brief generator'] },
        { name: 'MatchingQueue', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI match quality scoring', 'No match reasoning display'] },
        { name: 'SolutionVerification', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI credential validator', 'No risk flagging'] },
        { name: 'PilotEvaluations', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI evaluation assistant', 'Generic rubrics'] },
        { name: 'EvaluationPanel', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Knowledge & Resources',
      priority: 'MEDIUM',
      pages: [
        { name: 'Knowledge', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Search could be more contextual'] },
        { name: 'KnowledgeGraph', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PlatformDocs', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Documentation incomplete', 'No interactive tutorials', 'Missing video walkthroughs'] },
        { name: 'Trends', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI trend predictions', 'Static analysis only'] },
      ]
    },
    {
      section: 'Public Pages',
      priority: 'MEDIUM',
      pages: [
        { name: 'PublicPortal', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Landing copy generic', 'No AI public assistant', 'CTA weak'] },
        { name: 'About', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Content placeholder-like', 'Missing team section', 'No success stories'] },
        { name: 'News', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No news content yet', 'Missing CMS workflow'] },
        { name: 'Contact', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Basic contact form', 'No AI chatbot fallback'] },
      ]
    },
    {
      section: 'System & Admin',
      priority: 'LOW',
      pages: [
        { name: 'UserManagementHub', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI user insights'] },
        { name: 'DataManagementHub', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI data quality insights'] },
        { name: 'TaxonomyBuilder', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'BrandingSettings', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'RolePermissionManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI role suggester'] },
        { name: 'RegionManagement', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Basic CRUD, no enrichment'] },
        { name: 'CityManagement', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI city profiler'] },
      ]
    },
    {
      section: 'Pipeline & Flow Management',
      priority: 'HIGH',
      pages: [
        { name: 'PipelineHealthDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'FlowVisualizer', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'VelocityAnalytics', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'CommandCenter', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'FailureAnalysisDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PilotSuccessPatterns', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'CrossCityLearningHub', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'MultiCityOrchestration', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'CapacityPlanning', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'RealTimeIntelligence', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ScalingWorkflow', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['No Scaling→BAU transition content', 'No Scaling→Policy institutionalization content', 'Multi-stakeholder evaluation content weak'] },
      ]
    },
    {
      section: 'Strategy & Planning (20+ pages)',
      priority: 'HIGH',
      pages: [
        { name: 'StrategyCockpit', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'Portfolio', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'StrategicPlanBuilder', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'OKRManagementSystem', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'StrategicInitiativeTracker', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI initiative recommender'] },
        { name: 'BudgetAllocationTool', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI budget optimizer'] },
        { name: 'GapAnalysisTool', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'StrategicKPITracker', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI KPI forecasting'] },
        { name: 'PortfolioRebalancing', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'GovernanceCommitteeManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI meeting summarizer'] },
        { name: 'PartnershipMOUTracker', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI partnership health scorer'] },
        { name: 'StrategicExecutionDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'InitiativePortfolio', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProgressToGoalsTracker', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI progress predictions'] },
        { name: 'CollaborationHub', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI collaborator matching'] },
        { name: 'StakeholderAlignmentDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI sentiment analysis'] },
        { name: 'DecisionSimulator', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PredictiveForecastingDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'NetworkIntelligence', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'StrategicAdvisorChat', hasStaticContent: true, hasDynamicContent: false, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PatternRecognition', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'TechnologyRoadmap', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI tech trend predictions'] },
        { name: 'RiskPortfolio', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI risk forecasting'] },
        { name: 'CompetitiveIntelligenceDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI competitive analyzer'] },
        { name: 'InternationalBenchmarkingSuite', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI benchmark suggester'] },
        { name: 'MidYearReviewDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI review summarizer'] },
        { name: 'AnnualPlanningWizard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI planning assistant'] },
      ]
    },
    {
      section: 'AI Matching Tools (9 pages)',
      priority: 'MEDIUM',
      pages: [
        { name: 'ChallengeSolutionMatching', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ChallengeRDCallMatcher', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PilotScalingMatcher', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'RDProjectPilotMatcher', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'SolutionChallengeMatcher', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProgramChallengeMatcher', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'MunicipalityPeerMatcher', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'LivingLabProjectMatcher', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'SandboxPilotMatcher', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Pilot Management Suite',
      priority: 'HIGH',
      pages: [
        { name: 'PilotManagementPanel', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PilotMonitoringDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PilotWorkflowGuide', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Static guide, needs AI contextual help'] },
        { name: 'PilotGatesOverview', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Gate descriptions generic'] },
        { name: 'IterationWorkflow', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI iteration suggester'] },
        { name: 'PilotLaunchWizard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Program Management',
      priority: 'HIGH',
      pages: [
        { name: 'ProgramsControlDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProgramOutcomesAnalytics', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ApplicationReviewHub', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProgramApplicationWizard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProgramApplicationDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProgramApplicationEvaluationHub', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProgramPortfolioPlanner', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI cohort optimizer'] },
      ]
    },
    {
      section: 'R&D Portfolio',
      priority: 'HIGH',
      pages: [
        { name: 'RDPortfolioControlDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'RDProgressTracker', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI milestone predictor'] },
        { name: 'ResearchOutputsHub', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI publication impact scorer'] },
        { name: 'ProposalWizard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'RDProposalDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProposalReviewPortal', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'RDPortfolioPlanner', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI portfolio optimizer'] },
      ]
    },
    {
      section: 'Matchmaker System',
      priority: 'MEDIUM',
      pages: [
        { name: 'MatchmakerApplications', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['No "PRIMARY startup entry - 90% discovery" messaging', 'No opportunity focus content'] },
        { name: 'MatchmakerApplicationCreate', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['No "connecting to OPPORTUNITIES not funding" clarification'] },
        { name: 'MatchmakerApplicationDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Multi-stakeholder consensus content weak'] },
        { name: 'MatchmakerJourney', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['No opportunity pipeline visualization content'] },
        { name: 'MatchmakerSuccessAnalytics', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI success predictor'] },
        { name: 'MatchmakerEvaluationHub', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Sandbox & Living Labs',
      priority: 'MEDIUM',
      pages: [
        { name: 'Sandboxes', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Taxonomy linkage UI missing (sector_focus, municipality)', 'Strategic alignment content missing'] },
        { name: 'SandboxDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['No taxonomy context displayed', 'No Sandbox→Policy workflow content', 'Automatic pilot routing content missing'] },
        { name: 'SandboxApproval', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI regulatory gap analyzer'] },
        { name: 'SandboxReporting', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI compliance monitor'] },
        { name: 'SandboxApplicationDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI risk assessment'] },
        { name: 'LivingLabs', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['Taxonomy linkage UI missing (sector_specialization, municipality)', 'Strategic alignment content missing'] },
        { name: 'LivingLabDetail', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['No taxonomy context shown', 'No Lab→Knowledge workflow content', 'Automatic R&D/pilot routing content missing'] },
      ]
    },
    {
      section: 'User & Profile Pages',
      priority: 'MEDIUM',
      pages: [
        { name: 'UserProfile', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'Settings', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Settings help text minimal'] },
        { name: 'UserDirectory', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI expert finder'] },
        { name: 'StartupProfile', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ResearcherProfile', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'MunicipalityProfile', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'UserGamification', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Achievement descriptions generic'] },
        { name: 'DelegationManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI delegation suggester'] },
      ]
    },
    {
      section: 'Notifications & Communication',
      priority: 'MEDIUM',
      pages: [
        { name: 'NotificationCenter', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Notification copy generic', 'No AI summary'] },
        { name: 'NotificationPreferences', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Help text minimal'] },
        { name: 'Messaging', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI message suggestions'] },
        { name: 'CalendarView', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Event descriptions plain'] },
        { name: 'AnnouncementSystem', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI announcement composer'] },
      ]
    },
    {
      section: 'Reports & Analytics',
      priority: 'MEDIUM',
      pages: [
        { name: 'ReportsBuilder', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI report generator'] },
        { name: 'ProgressReport', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Generic report template'] },
        { name: 'CustomReportBuilder', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI insights injection'] },
        { name: 'ExecutiveBriefGenerator', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'QuarterlyReviewWizard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PresentationMode', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Slide content basic'] },
      ]
    },
    {
      section: 'Validation & Audit Tools',
      priority: 'LOW',
      pages: [
        { name: 'ValidationDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Static checklist'] },
        { name: 'EntitiesWorkflowTracker', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Hardcoded data'] },
        { name: 'EntityRecordsLifecycleTracker', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI anomaly detection'] },
        { name: 'UserJourneyValidation', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Hardcoded journey data'] },
        { name: 'DataModelDocumentation', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Static schema docs'] },
        { name: 'AIFeaturesDocumentation', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Manual feature list'] },
        { name: 'PlatformCoverageAudit', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Hardcoded audit data'] },
        { name: 'BilingualRTLAudit', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Hardcoded page list'] },
        { name: 'ContentAudit', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Hardcoded audit data'] },
        { name: 'MobileResponsivenessAudit', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Hardcoded audit data'] },
        { name: 'RBACImplementationTracker', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Hardcoded task list'] },
        { name: 'RBACComprehensiveAudit', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Hardcoded page audit'] },
        { name: 'EnhancementRoadmapMaster', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Static roadmap'] },
        { name: 'RemainingTasksDetail', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Hardcoded tasks'] },
      ]
    },
    {
      section: 'Advanced Analytics',
      priority: 'HIGH',
      pages: [
        { name: 'MII', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'MIIDrillDown', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'SectorDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI sector insights'] },
        { name: 'UserActivityDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI behavior patterns'] },
        { name: 'SessionDeviceManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI security alerts'] },
        { name: 'FeatureUsageHeatmap', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Missing AI usage insights'] },
      ]
    },
    {
      section: 'Approval Gates',
      priority: 'HIGH',
      pages: [
        { name: 'ExecutiveApprovals', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'ProgramRDApprovalGates', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'StrategicPlanApprovalGate', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'BudgetAllocationApprovalGate', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'InitiativeLaunchGate', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'PortfolioReviewGate', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'System Configuration',
      priority: 'LOW',
      pages: [
        { name: 'SystemDefaultsConfig', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Config help text missing'] },
        { name: 'FeatureFlagsDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No usage analytics per flag'] },
        { name: 'WorkflowDesigner', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI workflow suggester'] },
        { name: 'IntegrationManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Integration setup docs minimal'] },
        { name: 'SecurityPolicyManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Policy templates generic'] },
        { name: 'DataRetentionConfig', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No compliance guidance'] },
        { name: 'EmailTemplateEditor', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI email composer'] },
        { name: 'TemplateLibraryManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Template content sparse'] },
        { name: 'DocumentVersionControl', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No diff viewer'] },
      ]
    },
    {
      section: 'Public & Citizen',
      priority: 'MEDIUM',
      pages: [
        { name: 'PublicPortal', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Landing copy weak', 'No AI chatbot'] },
        { name: 'About', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Placeholder content', 'No team bios'] },
        { name: 'News', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No news content', 'CMS missing'] },
        { name: 'Contact', hasStaticContent: true, hasDynamicContent: false, hasAIContent: false, status: 'partial', issues: ['Basic form', 'No chatbot'] },
        { name: 'PublicIdeaSubmission', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: ['No distinction content: "generic idea" vs "structured program/challenge submission"', 'Missing InnovationProposal form content'] },
        { name: 'PublicSolutionsMarketplace', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI recommender'] },
      ]
    },
    {
      section: 'Advanced Tools & Search',
      priority: 'MEDIUM',
      pages: [
        { name: 'AdvancedSearch', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'BulkImport', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
        { name: 'WhatsNewHub', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Change log content manual'] },
        { name: 'CrossEntityActivityStream', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Activity descriptions plain'] },
        { name: 'OpportunityFeed', hasStaticContent: true, hasDynamicContent: true, hasAIContent: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'System Health & Operations',
      priority: 'LOW',
      pages: [
        { name: 'SystemHealthDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI performance insights'] },
        { name: 'PlatformAudit', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Manual audit'] },
        { name: 'APIManagementConsole', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Technical, minimal help'] },
        { name: 'ErrorLogsConsole', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Raw logs, no AI error analyzer'] },
        { name: 'PerformanceMonitor', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI bottleneck detector'] },
        { name: 'ComplianceDashboard', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Compliance status static'] },
        { name: 'BackupRecoveryManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI backup recommender'] },
        { name: 'ScheduledJobsManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Job descriptions technical'] },
      ]
    },
    {
      section: 'Media & Content Management',
      priority: 'LOW',
      pages: [
        { name: 'MediaLibrary', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI image tagger', 'No content optimizer'] },
        { name: 'EmailTemplateEditor', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI email composer'] },
        { name: 'AnnouncementSystem', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI announcement suggester'] },
        { name: 'TemplateLibraryManager', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['Template content sparse', 'No AI template generator'] },
        { name: 'DocumentVersionControl', hasStaticContent: true, hasDynamicContent: true, hasAIContent: false, status: 'partial', issues: ['No AI change summarizer'] },
      ]
    },
    {
      section: 'Components (170+ files)',
      priority: 'MEDIUM',
      summary: 'Reusable components across platform',
      components: [
        { category: 'Workflow Components', count: 45, hasContent: true, hasAI: true, issues: ['Some workflow help text generic', '10+ workflows missing AI suggestions'] },
        { category: 'Form Components', count: 35, hasContent: true, hasAI: false, issues: ['Form validation messages English-only', 'No AI form assistants in 25+ forms'] },
        { category: 'Data Display Components', count: 30, hasContent: true, hasAI: false, issues: ['Empty states use generic messages', 'No AI tooltips'] },
        { category: 'AI-Powered Components', count: 25, hasContent: true, hasAI: true, issues: ['AI responses not cached', 'No confidence scores shown'] },
        { category: 'Access & Security Components', count: 15, hasContent: true, hasAI: false, issues: ['Security messages technical', 'No plain language explanations'] },
        { category: 'Utility Components', count: 20, hasContent: true, hasAI: false, issues: ['Loading states generic', 'Error messages not contextual'] },
      ]
    },
    {
      section: 'Backend Functions (40+ files)',
      priority: 'LOW',
      summary: 'Backend API functions',
      functions: [
        { category: 'Gate Approval Functions', count: 6, hasContent: true, hasAI: true, issues: ['Response messages technical'] },
        { category: 'Search & Matching Functions', count: 5, hasContent: true, hasAI: true, issues: [] },
        { category: 'Data Processing Functions', count: 10, hasContent: true, hasAI: false, issues: ['Error messages not user-friendly'] },
        { category: 'Integration Functions', count: 8, hasContent: true, hasAI: false, issues: ['No usage documentation'] },
        { category: 'Validation Functions', count: 6, hasContent: true, hasAI: false, issues: ['Validation error messages cryptic'] },
        { category: 'Utility Functions', count: 8, hasContent: true, hasAI: false, issues: ['Generic responses'] },
      ]
    }
  ];

  // Calculate statistics
  const totalPages = contentAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.length;
    if (section.components) return sum + section.components.reduce((s, c) => s + c.count, 0);
    if (section.functions) return sum + section.functions.reduce((s, f) => s + f.count, 0);
    return sum;
  }, 0);
  const completePages = contentAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.filter(p => p.status === 'complete').length;
    if (section.components) return sum + section.components.filter(c => c.hasContent && c.hasAI).length;
    if (section.functions) return sum + section.functions.filter(f => f.hasContent && f.hasAI).length;
    return sum;
  }, 0);
  
  const partialPages = contentAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.filter(p => p.status === 'partial').length;
    if (section.components) return sum + section.components.filter(c => c.hasContent && !c.hasAI).length;
    if (section.functions) return sum + section.functions.filter(f => f.hasContent && !f.hasAI).length;
    return sum;
  }, 0);
  
  const pagesWithAI = contentAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.filter(p => p.hasAIContent).length;
    if (section.components) return sum + section.components.filter(c => c.hasAI).length;
    if (section.functions) return sum + section.functions.filter(f => f.hasAI).length;
    return sum;
  }, 0);
  
  const pagesWithIssues = contentAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.filter(p => p.issues && p.issues.length > 0).length;
    if (section.components) return sum + section.components.filter(c => c.issues && c.issues.length > 0).length;
    if (section.functions) return sum + section.functions.filter(f => f.issues && f.issues.length > 0).length;
    return sum;
  }, 0);
  
  const coveragePercentage = Math.round((completePages / totalPages) * 100);
  
  const allIssues = contentAudit.flatMap(s => {
    if (s.pages) return s.pages.filter(p => p.issues && p.issues.length > 0);
    return [];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'Content Audit Dashboard', ar: 'لوحة تدقيق المحتوى' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Static vs Dynamic content & AI integration across 181 pages • Aligned with 17 Coverage Reports', ar: 'المحتوى الثابت مقابل الديناميكي وتكامل الذكاء عبر 181 صفحة • متوافق مع 17 تقرير تغطية' })}
        </p>
        <div className="mt-4 p-3 bg-white/20 backdrop-blur rounded-lg">
          <p className="text-sm text-white/90">
            <strong>ℹ️ Platform Purpose:</strong> Opportunity discovery & solution deployment (NOT VC/funding) • Startup→Matchmaker→Solution→Challenge→Pilot→Sandbox/Lab→Scaling→Deployment
          </p>
        </div>
      </div>

      {/* Identified Issues */}
      {allIssues.length > 0 && (
        <Card className="border-2 border-orange-400 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-6 w-6" />
              {t({ en: '⚠️ Content Issues Across Platform', ar: '⚠️ مشاكل المحتوى عبر المنصة' })}
              <Badge className="bg-orange-600">{pagesWithIssues} pages</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allIssues.map((page, idx) => (
                <div key={idx} className="p-3 bg-white rounded border border-orange-300">
                  <p className="font-medium text-orange-900 mb-2">{page.name}</p>
                  <ul className="space-y-1">
                    {page.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-slate-700">• {issue}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-2 border-purple-300">
          <CardContent className="pt-6 text-center">
            <p className="text-6xl font-bold text-purple-600">{coveragePercentage}%</p>
            <p className="text-sm text-slate-600 mt-2">
              {t({ en: 'Complete Coverage', ar: 'تغطية كاملة' })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-600">{completePages}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Complete', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Circle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-amber-600">{partialPages}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Partial', ar: 'جزئي' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-purple-600">{pagesWithAI}</p>
            <p className="text-sm text-slate-600">{t({ en: 'AI Enhanced', ar: 'محسن بالذكاء' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-orange-600">{pagesWithIssues}</p>
            <p className="text-sm text-slate-600">{t({ en: 'With Issues', ar: 'بها مشاكل' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Types Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <FileText className="h-5 w-5" />
              {t({ en: 'Static Content', ar: 'محتوى ثابت' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 mb-3">
              {t({ en: 'Hardcoded UI text, labels, descriptions', ar: 'نصوص واجهة مبرمجة، تسميات، أوصاف' })}
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{t({ en: 'Page titles & headers', ar: 'عناوين ورؤوس الصفحات' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{t({ en: 'Button labels', ar: 'تسميات الأزرار' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{t({ en: 'Form field labels', ar: 'تسميات حقول النماذج' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-teal-300 bg-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-900">
              <Database className="h-5 w-5" />
              {t({ en: 'Dynamic Content', ar: 'محتوى ديناميكي' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 mb-3">
              {t({ en: 'Database-driven content from entities', ar: 'محتوى من قاعدة البيانات' })}
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{t({ en: 'Entity records (challenges, pilots, etc)', ar: 'سجلات الكيانات' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{t({ en: 'User-generated content', ar: 'محتوى من المستخدمين' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{t({ en: 'Comments & discussions', ar: 'تعليقات ونقاشات' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI-Generated Content', ar: 'محتوى ذكي مولّد' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 mb-3">
              {t({ en: 'LLM-powered insights and suggestions', ar: 'رؤى واقتراحات بالذكاء الاصطناعي' })}
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{t({ en: 'Strategic insights', ar: 'رؤى استراتيجية' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{t({ en: 'Recommendations', ar: 'توصيات' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>{t({ en: 'Predictions & forecasts', ar: 'توقعات وتنبؤات' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Section Audit */}
      <Card className="border-2 border-indigo-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            {t({ en: 'Detailed Content Audit by Section', ar: 'تدقيق المحتوى التفصيلي حسب القسم' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contentAudit.map((section, idx) => {
            let sectionComplete = 0;
            let sectionTotal = 0;
            let sectionProgress = 0;

            if (section.pages) {
              sectionComplete = section.pages.filter(p => p.status === 'complete').length;
              sectionTotal = section.pages.length;
              sectionProgress = Math.round((sectionComplete / sectionTotal) * 100);
            } else if (section.components) {
              sectionComplete = section.components.filter(c => c.hasContent && c.hasAI).length;
              sectionTotal = section.components.length;
              sectionProgress = Math.round((sectionComplete / sectionTotal) * 100);
            } else if (section.functions) {
              sectionComplete = section.functions.filter(f => f.hasContent && f.hasAI).length;
              sectionTotal = section.functions.length;
              sectionProgress = Math.round((sectionComplete / sectionTotal) * 100);
            }

            const isExpanded = expandedSections[`section-${idx}`];

            return (
              <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection(`section-${idx}`)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{section.section}</h3>
                    <Badge className={
                      section.priority === 'CRITICAL' ? 'bg-red-600' :
                      section.priority === 'HIGH' ? 'bg-orange-600' :
                      section.priority === 'MEDIUM' ? 'bg-amber-600' :
                      'bg-slate-600'
                    }>
                      {section.priority}
                    </Badge>
                    <Badge variant="outline">{sectionComplete} / {sectionTotal}</Badge>
                    <Progress value={sectionProgress} className="w-32" />
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-1">
                    {section.pages && section.pages.map((page, pi) => (
                      <div key={pi} className="flex flex-col gap-2 p-3 bg-white rounded text-sm border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {page.status === 'complete' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : page.status === 'partial' ? (
                              <Circle className="h-4 w-4 text-amber-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium">{page.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {page.hasStaticContent && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Static
                              </Badge>
                            )}
                            {page.hasDynamicContent && (
                              <Badge className="bg-teal-100 text-teal-700 text-xs">
                                <Database className="h-3 w-3 mr-1" />
                                Dynamic
                              </Badge>
                            )}
                            {page.hasAIContent && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>
                        {page.issues && page.issues.length > 0 && (
                          <div className="ml-6 mt-1">
                            {page.issues.map((issue, ii) => (
                              <p key={ii} className="text-xs text-orange-700">⚠️ {issue}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {section.components && section.components.map((comp, ci) => (
                      <div key={ci} className="p-3 bg-white rounded text-sm border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {comp.hasContent && comp.hasAI ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="font-medium">{comp.category}</span>
                            <Badge variant="outline" className="text-xs">{comp.count} files</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {comp.hasAI && <Badge className="bg-purple-100 text-purple-700 text-xs">AI</Badge>}
                          </div>
                        </div>
                        {comp.issues && comp.issues.length > 0 && (
                          <div className="ml-6">
                            {comp.issues.map((issue, ii) => (
                              <p key={ii} className="text-xs text-orange-700">⚠️ {issue}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {section.functions && section.functions.map((func, fi) => (
                      <div key={fi} className="p-3 bg-white rounded text-sm border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {func.hasContent && func.hasAI ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="font-medium">{func.category}</span>
                            <Badge variant="outline" className="text-xs">{func.count} files</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {func.hasAI && <Badge className="bg-purple-100 text-purple-700 text-xs">AI</Badge>}
                          </div>
                        </div>
                        {func.issues && func.issues.length > 0 && (
                          <div className="ml-6">
                            {func.issues.map((issue, ii) => (
                              <p key={ii} className="text-xs text-orange-700">⚠️ {issue}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Content Enhancement Opportunities */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Zap className="h-6 w-6" />
            {t({ en: 'AI Enhancement Opportunities', ar: 'فرص التحسين بالذكاء' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium text-slate-900">🎯 Add AI insights to Trends page</p>
              <p className="text-xs text-slate-600">Predict emerging challenge patterns</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium text-slate-900">🎯 Add AI insights to SectorDashboard</p>
              <p className="text-xs text-slate-600">Sector-specific recommendations</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium text-slate-900">🎯 Enhance MyDeadlines with AI prioritization</p>
              <p className="text-xs text-slate-600">Smart deadline ordering</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium text-slate-900">🎯 Add AI recommendations to ChallengeReviewQueue</p>
              <p className="text-xs text-slate-600">Auto-approve/reject suggestions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alignment with Coverage Reports */}
      <Card className="border-4 border-blue-400 bg-gradient-to-br from-blue-50 to-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 text-xl">
            <CheckCircle2 className="h-6 w-6" />
            {t({ en: '✅ Alignment with 17 Coverage Reports', ar: '✅ التوافق مع 17 تقرير تغطية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300">
            <p className="font-bold text-green-900 mb-2">✅ Content Aligned on Key Concepts:</p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>Platform Purpose:</strong> Opportunity discovery & solution deployment (NOT VC/funding platform)</li>
              <li>• <strong>Matchmaker PRIMARY:</strong> 90% of startup entry for municipal opportunity exploration</li>
              <li>• <strong>Solutions:</strong> What startups PROVIDE via Matchmaker to address challenges</li>
              <li>• <strong>Pilots:</strong> WHERE solutions GET TESTED in municipal environments</li>
              <li>• <strong>Sandbox/Labs:</strong> Testing infrastructure when regulatory/research needs exist</li>
              <li>• <strong>Programs:</strong> Innovation campaigns/cohorts (NOT educational programs)</li>
              <li>• <strong>Ideas:</strong> CitizenIdea = generic engagement, InnovationProposal = structured submissions (MISSING entity)</li>
            </ul>
          </div>

          <div className="p-4 bg-red-100 rounded-lg border-2 border-red-300">
            <p className="font-bold text-red-900 mb-2">🚨 Critical Content Gaps from Coverage Reports:</p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• <strong>P0: Visibility Controls:</strong> is_published/is_confidential publishing workflows MISSING for Challenge, Solution, Pilot, R&D, StartupProfile</li>
              <li>• <strong>P0: Program Classification:</strong> program_type field MISSING (internal/academia/ventures/public/G2G/G2B/G2C) - content should differentiate</li>
              <li>• <strong>P0: Taxonomy Linkage:</strong> Program/Sandbox/Lab pages missing sector/municipality/strategic context in UI</li>
              <li>• <strong>P0: Entity Distinction:</strong> CitizenIdea (generic) vs InnovationProposal (structured) - content conflates these concepts</li>
              <li>• <strong>P0: Startup Focus:</strong> Opportunity pipeline content MISSING (challenges pursued→proposals→pilots won→municipal clients)</li>
              <li>• <strong>P1: Evaluator Content:</strong> No structured evaluation rubric content across all review workflows</li>
              <li>• <strong>P1: Closure Workflows:</strong> No content for Scaling→BAU/Policy, R&D→Solution/Knowledge, Pilot→Procurement workflows</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-100 rounded-lg border-2 border-amber-300">
            <p className="font-bold text-amber-900 mb-2">⚠️ AI Integration Pattern (ALL Reports):</p>
            <p className="text-sm text-amber-800">
              <strong>50-100+ AI components built</strong> but only <strong>0-30% INTEGRATED</strong> into actual user flows.
              <br/>Many pages marked "hasAIContent: false" have AI components that exist but aren't activated.
              <br/><strong>Gap:</strong> Content exists in components but not surfaced in page UX.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Target className="h-6 w-6" />
            {t({ en: 'Summary & Next Steps', ar: 'الملخص والخطوات التالية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-slate-700">
              <strong>Total Files Audited:</strong> {totalPages} (150+ pages + 170+ components + 40+ functions = 360+ total files)
            </p>
            <p className="text-green-700">
              <strong>✓ Complete (Static + Dynamic + AI):</strong> {completePages} pages ({coveragePercentage}%)
            </p>
            <p className="text-amber-700">
              <strong>⚠ Partial (Missing AI):</strong> {partialPages} pages
            </p>
            <p className="text-purple-700">
              <strong>✨ AI-Enhanced Pages:</strong> {pagesWithAI} pages
            </p>

            <div className="mt-4 p-4 bg-indigo-100 rounded-lg">
              <p className="font-bold text-indigo-900 mb-2">
                {t({ en: 'Content Strategy & Action Items (Aligned with Coverage Reports):', ar: 'استراتيجية المحتوى والإجراءات (متوافقة مع تقارير التغطية):' })}
              </p>
              <ul className="list-disc list-inside space-y-1 text-indigo-900">
                <li className="line-through text-green-700">✓ All core pages have static + dynamic content</li>
                <li className="line-through text-green-700">✓ Main workflows have AI insights</li>
                <li><strong>P0:</strong> Add visibility control content (is_published/is_confidential) to Challenge, Solution, Pilot, R&D, StartupProfile pages</li>
                <li><strong>P0:</strong> Add program_type classification content (internal/academia/ventures/public/G2G/G2B/G2C) to Program pages</li>
                <li><strong>P0:</strong> Add taxonomy context (sector/municipality/strategic) to Program/Sandbox/Lab pages</li>
                <li><strong>P0:</strong> Clarify CitizenIdea (generic) vs InnovationProposal (structured) across citizen engagement content</li>
                <li><strong>P0:</strong> Add startup opportunity pipeline content (challenges→proposals→pilots→clients) to Startup pages</li>
                <li><strong>P1:</strong> Integrate 50-100+ existing AI components into page UX (currently built but not activated)</li>
                <li><strong>P1:</strong> Add structured evaluation rubric content to ALL review workflows (Challenge/Solution/Pilot/Proposal/Matchmaker/Scaling)</li>
                <li><strong>P1:</strong> Add closure workflow content (Scaling→BAU/Policy, R&D→Solution/Knowledge, Pilot→Procurement)</li>
                <li><strong>P2:</strong> Enhance analytics pages with predictive AI (Trends, SectorDashboard, MyDeadlines, MyPerformance)</li>
                <li><strong>P2:</strong> Add AI content suggestions to CRUD forms (auto-fill descriptions, suggest tags)</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-amber-100 rounded-lg border-2 border-amber-300">
              <p className="font-bold text-amber-900 mb-2">Detailed Content Gaps (Coverage Reports Alignment)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-semibold text-red-800 mb-1">P0: Visibility Content Missing</p>
                  <ul className="text-xs text-slate-700 space-y-0.5">
                    <li>• Challenge publishing workflow UI/content</li>
                    <li>• Solution is_published field + UI</li>
                    <li>• Pilot public showcase content</li>
                    <li>• R&D is_published field + UI</li>
                    <li>• StartupProfile visibility controls</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-800 mb-1">P0: Classification Content</p>
                  <ul className="text-xs text-slate-700 space-y-0.5">
                    <li>• Program type selector UI (internal/academia/ventures/public/G2G/G2B/G2C)</li>
                    <li>• Taxonomy linkage UI for Programs</li>
                    <li>• Sandbox/Lab sector focus selectors</li>
                    <li>• Strategic alignment selectors</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-1">P1: AI Activation Content</p>
                  <ul className="text-xs text-slate-700 space-y-0.5">
                    <li>• 50-100+ built AI components need UX integration</li>
                    <li>• Evaluator rubric content across all workflows</li>
                    <li>• Closure workflow content (8+ missing flows)</li>
                    <li>• Startup opportunity pipeline dashboards</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-1">P2: Missing AI in Existing Pages</p>
                  <ul className="text-xs text-slate-700 space-y-0.5">
                    <li>• AdminPortal lacks AI strategic dashboard</li>
                    <li>• Trends page needs AI prediction</li>
                    <li>• SectorDashboard needs AI insights</li>
                    <li>• MyDeadlines needs AI prioritization</li>
                    <li>• MyPerformance needs AI coaching</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-1">P2: General Content Enhancement</p>
                  <ul className="text-xs text-slate-700 space-y-0.5">
                    <li>• Help text and tooltips for complex forms</li>
                    <li>• Empty state illustrations and messaging</li>
                    <li>• Success/error state copy improvements</li>
                    <li>• Onboarding content per portal</li>
                    <li>• Contextual tips based on user actions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-purple-100 rounded-lg border-2 border-purple-300">
              <p className="font-bold text-purple-900 mb-2">🤖 AI Content Integration Pattern:</p>
              <p className="text-sm text-purple-800">
                Content audit shows pattern matching all coverage reports:
                <br/><strong>• 70+ pages with AI components built (hasAIContent: true)</strong>
                <br/><strong>• 40+ pages marked partial missing AI despite components existing</strong>
                <br/><strong>• Gap: Content/UX integration not activation - components exist but not in user flows</strong>
                <br/>Action: Surface existing AI components in page UX, add AI panel/widgets to partial pages
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ContentAudit, { requiredPermissions: [] });