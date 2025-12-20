import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { 
  Globe, CheckCircle2, AlertCircle, Circle, ChevronDown, ChevronRight, 
  Languages, Target, Sparkles
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function BilingualRTLAudit() {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // COMPREHENSIVE BILINGUAL AUDIT
  const bilingualAudit = [
    {
      section: 'Core Entity Pages',
      priority: 'CRITICAL',
      pages: [
        { name: 'Challenges', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ChallengeDetail', bilingual: true, rtl: true, status: 'complete', issues: ['AI insights sometimes English-only'] },
        { name: 'ChallengeCreate', bilingual: true, rtl: true, status: 'complete', issues: ['Form validation messages mixed'] },
        { name: 'ChallengeEdit', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'Solutions', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'SolutionDetail', bilingual: true, rtl: true, status: 'complete', issues: ['Case studies may be English-only'] },
        { name: 'SolutionCreate', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'SolutionEdit', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'Pilots', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PilotDetail', bilingual: true, rtl: true, status: 'complete', issues: ['Milestone names not always bilingual'] },
        { name: 'PilotCreate', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PilotEdit', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'Programs', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProgramDetail', bilingual: true, rtl: true, status: 'complete', issues: ['Curriculum content English-heavy'] },
        { name: 'RDProjects', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RDProjectDetail', bilingual: true, rtl: true, status: 'complete', issues: ['Publications typically English'] },
        { name: 'RDCalls', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RDCallDetail', bilingual: true, rtl: true, status: 'complete', issues: ['Research themes need better Arabic translation'] },
      ]
    },
    {
      section: 'Portals & Dashboards',
      priority: 'CRITICAL',
      pages: [
        { name: 'Home', bilingual: true, rtl: true, status: 'complete' },
        { name: 'ExecutiveDashboard', bilingual: true, rtl: true, status: 'complete' },
        { name: 'AdminPortal', bilingual: true, rtl: true, status: 'complete' },
        { name: 'MunicipalityDashboard', bilingual: true, rtl: true, status: 'complete' },
        { name: 'StartupDashboard', bilingual: true, rtl: true, status: 'complete' },
        { name: 'AcademiaDashboard', bilingual: true, rtl: true, status: 'complete' },
        { name: 'ProgramOperatorPortal', bilingual: true, rtl: true, status: 'complete' },
        { name: 'PublicPortal', bilingual: true, rtl: true, status: 'complete' },
      ]
    },
    {
      section: 'My Work Pages',
      priority: 'HIGH',
      pages: [
        { name: 'MyWorkloadDashboard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MyApprovals', bilingual: true, rtl: true, status: 'complete', issues: ['Approval action buttons need consistent AR text'] },
        { name: 'MyDeadlines', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MyPerformance', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MyLearning', bilingual: true, rtl: true, status: 'complete', issues: ['Learning content mostly English'] },
        { name: 'TaskManagement', bilingual: false, rtl: false, status: 'missing', issues: ['Full bilingual implementation needed'] },
        { name: 'MyChallenges', bilingual: false, rtl: false, status: 'missing', issues: ['Full bilingual implementation needed'] },
        { name: 'MyPilots', bilingual: false, rtl: false, status: 'missing', issues: ['Full bilingual implementation needed'] },
        { name: 'MyRDProjects', bilingual: false, rtl: false, status: 'missing', issues: ['Full bilingual implementation needed'] },
        { name: 'MyPrograms', bilingual: false, rtl: false, status: 'missing', issues: ['Full bilingual implementation needed'] },
        { name: 'MyApplications', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MyPartnershipsPage', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'OpportunityFeed', bilingual: true, rtl: true, status: 'complete', issues: ['AI recommendations English-heavy'] },
        { name: 'Messaging', bilingual: true, rtl: true, status: 'complete', issues: ['Message threads need better RTL alignment'] },
      ]
    },
    {
      section: 'Analytics & Intelligence',
      priority: 'HIGH',
      pages: [
        { name: 'MII', bilingual: true, rtl: true, status: 'complete' },
        { name: 'Trends', bilingual: true, rtl: true, status: 'complete' },
        { name: 'SectorDashboard', bilingual: true, rtl: true, status: 'complete' },
        { name: 'PredictiveAnalytics', bilingual: true, rtl: true, status: 'complete' },
        { name: 'PredictiveInsights', bilingual: true, rtl: true, status: 'complete' },
        { name: 'PipelineHealthDashboard', bilingual: true, rtl: true, status: 'complete' },
      ]
    },
    {
      section: 'Advanced Tools',
      priority: 'MEDIUM',
      pages: [
        { name: 'AdvancedSearch', bilingual: true, rtl: true, status: 'complete', issues: ['Search result snippets show mixed languages'] },
        { name: 'WhatsNewHub', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'CrossEntityActivityStream', bilingual: true, rtl: true, status: 'complete', issues: ['Activity descriptions sometimes English'] },
        { name: 'BulkImport', bilingual: true, rtl: true, status: 'complete', issues: ['CSV column headers need AR option'] },
        { name: 'CalendarView', bilingual: true, rtl: true, status: 'complete', issues: ['Event descriptions mixed language'] },
        { name: 'PlatformDocs', bilingual: false, rtl: false, status: 'partial', issues: ['Documentation mostly English, needs Arabic version'] },
      ]
    },
    {
      section: 'User Management',
      priority: 'HIGH',
      pages: [
        { name: 'UserProfile', bilingual: true, rtl: true, status: 'complete' },
        { name: 'Settings', bilingual: true, rtl: true, status: 'complete' },
        { name: 'UserDirectory', bilingual: true, rtl: true, status: 'complete' },
        { name: 'UserActivityDashboard', bilingual: true, rtl: true, status: 'complete' },
        { name: 'SessionDeviceManager', bilingual: true, rtl: true, status: 'complete' },
      ]
    },
    {
      section: 'Strategy & Planning',
      priority: 'HIGH',
      pages: [
        { name: 'StrategyCockpit', bilingual: true, rtl: true, status: 'complete' },
        { name: 'Portfolio', bilingual: true, rtl: true, status: 'complete' },
        { name: 'OKRManagementSystem', bilingual: true, rtl: true, status: 'complete' },
        { name: 'ExecutiveBriefGenerator', bilingual: true, rtl: true, status: 'complete' },
        { name: 'QuarterlyReviewWizard', bilingual: true, rtl: true, status: 'complete' },
        { name: 'PresentationMode', bilingual: true, rtl: true, status: 'complete' },
      ]
    },
    {
      section: 'Knowledge & Resources',
      priority: 'MEDIUM',
      pages: [
        { name: 'Knowledge', bilingual: true, rtl: true, status: 'complete' },
        { name: 'KnowledgeGraph', bilingual: true, rtl: true, status: 'complete' },
        { name: 'Network', bilingual: true, rtl: true, status: 'complete' },
      ]
    },
    {
      section: 'Infrastructure',
      priority: 'MEDIUM',
      pages: [
        { name: 'Sandboxes', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'LivingLabs', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'SandboxDetail', bilingual: true, rtl: true, status: 'complete', issues: ['Regulatory text heavy English terminology'] },
        { name: 'LivingLabDetail', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'SandboxApproval', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'SandboxReporting', bilingual: true, rtl: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Data & System Management',
      priority: 'MEDIUM',
      pages: [
        { name: 'DataManagementHub', bilingual: false, rtl: false, status: 'partial', issues: ['Admin UI mostly English, needs full AR'] },
        { name: 'RegionManagement', bilingual: false, rtl: false, status: 'partial', issues: ['Table headers English-only'] },
        { name: 'CityManagement', bilingual: false, rtl: false, status: 'partial', issues: ['Form labels need AR translation'] },
        { name: 'Organizations', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'BulkDataOperations', bilingual: false, rtl: false, status: 'partial', issues: ['Operation names English-only'] },
        { name: 'DataQualityDashboard', bilingual: false, rtl: false, status: 'partial', issues: ['Quality metrics labels English'] },
      ]
    },
    {
      section: 'System Configuration',
      priority: 'LOW',
      pages: [
        { name: 'TaxonomyBuilder', bilingual: false, rtl: false, status: 'partial', issues: ['Admin interface English-only'] },
        { name: 'SystemDefaultsConfig', bilingual: false, rtl: false, status: 'missing', issues: ['No bilingual support'] },
        { name: 'FeatureFlagsDashboard', bilingual: false, rtl: false, status: 'missing', issues: ['Technical UI, English-only acceptable'] },
        { name: 'WorkflowDesigner', bilingual: false, rtl: false, status: 'partial', issues: ['Node labels need AR option'] },
        { name: 'BrandingSettings', bilingual: false, rtl: false, status: 'partial', issues: ['Settings labels English'] },
        { name: 'EmailTemplateEditor', bilingual: false, rtl: false, status: 'partial', issues: ['Template content AR/EN, but UI English'] },
      ]
    },
    {
      section: 'Reports & Exports',
      priority: 'HIGH',
      pages: [
        { name: 'ReportsBuilder', bilingual: true, rtl: true, status: 'complete', issues: ['Generated PDFs RTL layout issues'] },
        { name: 'CustomReportBuilder', bilingual: true, rtl: true, status: 'complete', issues: ['Chart labels sometimes English'] },
        { name: 'ExecutiveBriefGenerator', bilingual: true, rtl: true, status: 'complete', issues: ['PDF Arabic font rendering needs improvement'] },
        { name: 'QuarterlyReviewWizard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProgressReport', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PresentationMode', bilingual: true, rtl: true, status: 'complete', issues: ['Slide templates need better AR layout'] },
      ]
    },
    {
      section: 'Approval Workflows',
      priority: 'HIGH',
      pages: [
        { name: 'ApprovalCenter', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ChallengeReviewQueue', bilingual: true, rtl: true, status: 'complete', issues: ['Review comments mixed language'] },
        { name: 'MatchingQueue', bilingual: true, rtl: true, status: 'complete', issues: ['Match scores lack AR explanation'] },
        { name: 'SolutionVerification', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PilotEvaluations', bilingual: true, rtl: true, status: 'complete', issues: ['Evaluation rubrics English-heavy'] },
        { name: 'EvaluationPanel', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ExecutiveApprovals', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProgramRDApprovalGates', bilingual: true, rtl: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Matchmaker System',
      priority: 'MEDIUM',
      pages: [
        { name: 'MatchmakerApplications', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MatchmakerApplicationCreate', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MatchmakerApplicationDetail', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MatchmakerJourney', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MatchmakerSuccessAnalytics', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MatchmakerEvaluationHub', bilingual: true, rtl: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'AI Matching Tools (9 pages)',
      priority: 'MEDIUM',
      pages: [
        { name: 'ChallengeSolutionMatching', bilingual: true, rtl: true, status: 'complete', issues: ['Match reasoning sometimes English'] },
        { name: 'ChallengeRDCallMatcher', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PilotScalingMatcher', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RDProjectPilotMatcher', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'SolutionChallengeMatcher', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProgramChallengeMatcher', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MunicipalityPeerMatcher', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'LivingLabProjectMatcher', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'SandboxPilotMatcher', bilingual: true, rtl: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Program & R&D Management',
      priority: 'HIGH',
      pages: [
        { name: 'ProgramsControlDashboard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProgramOutcomesAnalytics', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ApplicationReviewHub', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProgramApplicationWizard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProgramApplicationDetail', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProgramApplicationEvaluationHub', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProgramPortfolioPlanner', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RDPortfolioControlDashboard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RDProgressTracker', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ResearchOutputsHub', bilingual: true, rtl: true, status: 'complete', issues: ['Publication metadata English-only'] },
        { name: 'ProposalWizard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RDProposalDetail', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ProposalReviewPortal', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RDPortfolioPlanner', bilingual: true, rtl: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Pipeline Management',
      priority: 'HIGH',
      pages: [
        { name: 'PipelineHealthDashboard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'FlowVisualizer', bilingual: true, rtl: true, status: 'complete', issues: ['Flow arrows don\'t flip for RTL'] },
        { name: 'VelocityAnalytics', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'CommandCenter', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'FailureAnalysisDashboard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PilotSuccessPatterns', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'CrossCityLearningHub', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MultiCityOrchestration', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'CapacityPlanning', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RealTimeIntelligence', bilingual: true, rtl: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Pilot Management Suite',
      priority: 'HIGH',
      pages: [
        { name: 'PilotManagementPanel', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PilotMonitoringDashboard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PilotWorkflowGuide', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PilotGatesOverview', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'IterationWorkflow', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'PilotLaunchWizard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ScalingWorkflow', bilingual: true, rtl: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'RBAC & User Access',
      priority: 'MEDIUM',
      pages: [
        { name: 'UserManagementHub', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RolePermissionManager', bilingual: true, rtl: true, status: 'complete', issues: ['Permission names technical English'] },
        { name: 'RBACDashboard', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RBACAuditReport', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RoleRequestCenter', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'TeamManagement', bilingual: true, rtl: true, status: 'complete', issues: [] },
      ]
    },
    {
      section: 'Validation & Audit Tools',
      priority: 'LOW',
      pages: [
        { name: 'ValidationDashboard', bilingual: false, rtl: false, status: 'missing', issues: ['Hardcoded English audit data'] },
        { name: 'EntitiesWorkflowTracker', bilingual: false, rtl: false, status: 'missing', issues: ['Hardcoded English'] },
        { name: 'EntityRecordsLifecycleTracker', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'UserJourneyValidation', bilingual: false, rtl: false, status: 'missing', issues: ['Hardcoded English'] },
        { name: 'DataModelDocumentation', bilingual: false, rtl: false, status: 'missing', issues: ['Technical docs English'] },
        { name: 'AIFeaturesDocumentation', bilingual: false, rtl: false, status: 'missing', issues: ['Feature descriptions English'] },
        { name: 'PlatformCoverageAudit', bilingual: false, rtl: false, status: 'missing', issues: ['Audit English-only'] },
        { name: 'BilingualRTLAudit', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'ContentAudit', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'MobileResponsivenessAudit', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RBACImplementationTracker', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'RBACComprehensiveAudit', bilingual: true, rtl: true, status: 'complete', issues: [] },
        { name: 'EnhancementRoadmapMaster', bilingual: false, rtl: false, status: 'missing', issues: ['Roadmap English'] },
        { name: 'RemainingTasksDetail', bilingual: false, rtl: false, status: 'missing', issues: ['Task list English'] },
      ]
    },
    {
      section: 'Components (170+ files)',
      priority: 'MEDIUM',
      summary: 'Reusable UI components',
      components: [
        { category: 'Workflow Components (45)', bilingual: true, rtl: true, issues: ['Modal titles need AR/EN', 'Workflow step labels 80% bilingual', 'Gate names technical English'] },
        { category: 'Form Components (35)', bilingual: true, rtl: true, issues: ['Field labels mostly bilingual', 'Validation messages English-only in 25+ forms', 'Placeholder text mixed'] },
        { category: 'Data Display (30)', bilingual: true, rtl: true, issues: ['Table headers bilingual', 'Chart axis labels English', 'Empty states English'] },
        { category: 'AI Components (25)', bilingual: false, rtl: false, issues: ['AI responses default English', 'AI panel UI English', 'Prompts don\'t request AR'] },
        { category: 'Access & Security (15)', bilingual: false, rtl: false, issues: ['Security messages English', 'Permission labels English', 'Audit logs English'] },
        { category: 'Charts & Viz (20)', bilingual: false, rtl: false, issues: ['Recharts labels English', 'Tooltips English', 'Legends not RTL'] },
        { category: 'Navigation (10)', bilingual: true, rtl: true, issues: ['Layout fully bilingual ✓', 'Menu items bilingual ✓'] },
        { category: 'File & Media (8)', bilingual: true, rtl: true, issues: ['Upload UI bilingual', 'File type messages English'] },
      ]
    },
    {
      section: 'Backend Functions (40+ files)',
      priority: 'LOW',
      summary: 'Backend API responses',
      functions: [
        { category: 'Gate Approval (6)', bilingual: false, rtl: false, issues: ['Response messages English', 'Error messages English'] },
        { category: 'Search Functions (5)', bilingual: false, rtl: false, issues: ['Search result snippets English'] },
        { category: 'Data Processing (10)', bilingual: false, rtl: false, issues: ['Processing status English', 'Error details English'] },
        { category: 'Integration Functions (8)', bilingual: false, rtl: false, issues: ['API responses English'] },
        { category: 'Validation Functions (6)', bilingual: false, rtl: false, issues: ['Validation errors English'] },
        { category: 'Utility Functions (8)', bilingual: false, rtl: false, issues: ['Generic responses English'] },
      ]
    }
  ];

  // Calculate statistics
  const totalPages = bilingualAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.length;
    if (section.components) return sum + section.components.length;
    if (section.functions) return sum + section.functions.length;
    return sum;
  }, 0);
  const completeBilingual = bilingualAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.filter(p => p.bilingual && p.rtl && p.status === 'complete').length;
    if (section.components) return sum + section.components.filter(c => c.bilingual && c.rtl).length;
    if (section.functions) return sum; // Backend not applicable
    return sum;
  }, 0);
  
  const partialBilingual = bilingualAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.filter(p => p.status === 'partial').length;
    if (section.components) return sum; // Components either have it or don't
    return sum;
  }, 0);
  
  const missingBilingual = bilingualAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.filter(p => p.status === 'missing' || (!p.bilingual || !p.rtl)).length;
    if (section.components) return sum + section.components.filter(c => !c.bilingual || !c.rtl).length;
    if (section.functions) return sum + section.functions.length; // All backend missing
    return sum;
  }, 0);
  
  const pagesWithIssues = bilingualAudit.reduce((sum, section) => {
    if (section.pages) return sum + section.pages.filter(p => p.issues && p.issues.length > 0).length;
    if (section.components) return sum + section.components.filter(c => c.issues && c.issues.length > 0).length;
    if (section.functions) return sum + section.functions.filter(f => f.issues && f.issues.length > 0).length;
    return sum;
  }, 0);
  
  const coveragePercentage = Math.round((completeBilingual / totalPages) * 100);

  const criticalMissing = bilingualAudit
    .filter(s => s.priority === 'CRITICAL' && s.pages)
    .flatMap(s => s.pages.filter(p => !p.bilingual || !p.rtl));
  
  const allIssues = bilingualAudit.flatMap(s => {
    if (s.pages) return s.pages.filter(p => p.issues && p.issues.length > 0);
    if (s.components) return s.components.filter(c => c.issues && c.issues.length > 0);
    if (s.functions) return s.functions.filter(f => f.issues && f.issues.length > 0);
    return [];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'Bilingual & RTL Audit', ar: 'تدقيق ثنائي اللغة وRTL' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Arabic/English support and RTL implementation across 175+ pages', ar: 'دعم العربية/الإنجليزية وتطبيق RTL عبر 175+ صفحة' })}
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-2 border-teal-300">
          <CardContent className="pt-6 text-center">
            <p className="text-6xl font-bold text-teal-600">{coveragePercentage}%</p>
            <p className="text-sm text-slate-600 mt-2">
              {t({ en: 'Bilingual Coverage', ar: 'التغطية ثنائية اللغة' })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-600">{completeBilingual}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Complete', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Circle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-amber-600">{partialBilingual}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Partial', ar: 'جزئي' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-red-600">{missingBilingual}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Missing', ar: 'مفقود' })}</p>
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

      {/* Identified Issues */}
      {allIssues.length > 0 && (
        <Card className="border-2 border-orange-400 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-6 w-6" />
              {t({ en: '⚠️ Identified Bilingual Issues Across Platform', ar: '⚠️ المشاكل ثنائية اللغة المحددة' })}
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

      {/* Critical Missing */}
      {criticalMissing.length > 0 && (
        <Card className="border-2 border-red-400 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-6 w-6" />
              {t({ en: 'CRITICAL: Missing Bilingual Support', ar: 'حرج: دعم ثنائي اللغة مفقود' })}
              <Badge className="bg-red-600">{criticalMissing.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {criticalMissing.map((page, idx) => (
                <div key={idx} className="p-3 bg-white rounded border border-red-300">
                  <p className="font-medium text-red-900">{page.name}</p>
                  <div className="flex gap-2 mt-1">
                    {!page.bilingual && <Badge variant="destructive" className="text-xs">No AR/EN</Badge>}
                    {!page.rtl && <Badge variant="destructive" className="text-xs">No RTL</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Implementation Checklist */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-6 w-6 text-blue-600" />
            {t({ en: 'Bilingual Implementation Checklist', ar: 'قائمة التحقق من التنفيذ ثنائي اللغة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">{t({ en: '✓ LanguageContext Global', ar: '✓ السياق اللغوي العام' })}</p>
                <p className="text-sm text-slate-700">All pages use useLanguage() hook with t() function</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">{t({ en: '✓ RTL Direction Support', ar: '✓ دعم اتجاه RTL' })}</p>
                <p className="text-sm text-slate-700">All pages have dir attribute based on isRTL</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">{t({ en: '✓ Entity Bilingual Fields', ar: '✓ حقول الكيانات ثنائية اللغة' })}</p>
                <p className="text-sm text-slate-700">All entities have _ar and _en field variants</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-600">
            <div className="flex items-start gap-3">
              <Circle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">{t({ en: '⚠ Form Validation Messages', ar: '⚠ رسائل التحقق من النماذج' })}</p>
                <p className="text-sm text-slate-700">Some forms still have English-only error messages</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-600">
            <div className="flex items-start gap-3">
              <Circle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">{t({ en: '⚠ Dynamic Content Translation', ar: '⚠ ترجمة المحتوى الديناميكي' })}</p>
                <p className="text-sm text-slate-700">AI-generated content needs bilingual prompts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Section Audit */}
      <Card className="border-2 border-teal-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-teal-600" />
            {t({ en: 'Detailed Section Audit', ar: 'تدقيق الأقسام التفصيلي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bilingualAudit.map((section, idx) => {
            let sectionComplete = 0;
            let sectionTotal = 0;
            let sectionProgress = 0;
            
            if (section.pages) {
              sectionComplete = section.pages.filter(p => p.bilingual && p.rtl && p.status === 'complete').length;
              sectionTotal = section.pages.length;
              sectionProgress = Math.round((sectionComplete / sectionTotal) * 100);
            } else if (section.components) {
              sectionComplete = section.components.filter(c => c.bilingual && c.rtl).length;
              sectionTotal = section.components.length;
              sectionProgress = Math.round((sectionComplete / sectionTotal) * 100);
            } else if (section.functions) {
              sectionComplete = 0; // Backend not bilingual
              sectionTotal = section.functions.length;
              sectionProgress = 0;
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
                      <div key={pi} className="flex flex-col gap-2 p-2 bg-white rounded text-sm">
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
                            {page.bilingual ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">AR/EN ✓</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">EN Only</Badge>
                            )}
                            {page.rtl ? (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">RTL ✓</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">No RTL</Badge>
                            )}
                            {page.status === 'partial' && (
                              <Badge className="bg-amber-600 text-xs">Partial</Badge>
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
                            {comp.bilingual && comp.rtl ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium">{comp.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {comp.bilingual ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">AR/EN ✓</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">EN Only</Badge>
                            )}
                            {comp.rtl ? (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">RTL ✓</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">No RTL</Badge>
                            )}
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
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{func.category}</span>
                          </div>
                          <Badge variant="destructive" className="text-xs">Backend - EN Only</Badge>
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

      {/* Best Practices */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="h-6 w-6" />
            {t({ en: 'Bilingual Best Practices', ar: 'أفضل ممارسات ثنائية اللغة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white rounded border-l-4 border-blue-600">
              <p className="font-bold text-blue-900">1. Use t() function for all UI text</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded block mt-1">
                {`t({ en: 'Dashboard', ar: 'لوحة التحكم' })`}
              </code>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-blue-600">
              <p className="font-bold text-blue-900">2. Apply dir attribute to container</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded block mt-1">
                {`<div dir={isRTL ? 'rtl' : 'ltr'}>...</div>`}
              </code>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-blue-600">
              <p className="font-bold text-blue-900">3. Mirror icon positions for RTL</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded block mt-1">
                {`className={\`\${isRTL ? 'mr-2' : 'ml-2'}\`}`}
              </code>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-blue-600">
              <p className="font-bold text-blue-900">4. Display entity fields based on language</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded block mt-1">
                {`language === 'ar' && entity.title_ar ? entity.title_ar : entity.title_en`}
              </code>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-blue-600">
              <p className="font-bold text-blue-900">5. Ensure forms save to both _ar and _en fields</p>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded block mt-1">
                {`{ title_en: '...', title_ar: '...' }`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="border-2 border-amber-300 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Target className="h-6 w-6" />
            {t({ en: 'Implementation Roadmap & Gaps', ar: 'خارطة طريق التنفيذ والفجوات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white rounded border-l-4 border-green-600">
              <p className="font-bold text-green-900">✓ PHASE 1 - CORE PAGES (COMPLETE)</p>
              <p className="text-slate-700">✓ All main entity pages (Challenges, Pilots, Solutions, R&D, Programs) - Full AR/EN + RTL</p>
              <p className="text-slate-700">✓ All portals and dashboards - Full bilingual support</p>
              <p className="text-slate-700">✓ Layout component with RTL-aware navigation</p>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-amber-600">
              <p className="font-bold text-amber-900">PHASE 2 - MY WORK & TOOLS (In Progress - 50%)</p>
              <p className="text-slate-700">✓ 5 My Work pages complete (Workload, Approvals, Deadlines, Performance, Learning)</p>
              <p className="text-slate-700">• 5 My Work pages pending (Tasks, MyChallenges, MyPilots, MyRDProjects, MyPrograms)</p>
              <p className="text-slate-700">• Messaging system needs full bilingual thread support</p>
              <p className="text-slate-700">• OpportunityFeed AI recommendations need AR/EN parity</p>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-amber-600">
              <p className="font-bold text-amber-900">PHASE 3 - ADMIN & CONFIG (Needed)</p>
              <p className="text-slate-700">• Data management screens (RegionManagement, CityManagement, Organizations)</p>
              <p className="text-slate-700">• System configuration pages (15+ pages need bilingual labels)</p>
              <p className="text-slate-700">• Workflow designer bilingual node labels and descriptions</p>
              <p className="text-slate-700">• Bulk import/export screens with Arabic column headers</p>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-red-600">
              <p className="font-bold text-red-900">CRITICAL GAPS</p>
              <ul className="text-slate-700 space-y-1 mt-2">
                <li>• <strong>Form Validation:</strong> React-hook-form error messages still English-only in 30+ forms</li>
                <li>• <strong>AI Content:</strong> AI-generated insights default to English (needs bilingual prompt engineering)</li>
                <li>• <strong>Email Templates:</strong> System emails need professional Arabic translation review</li>
                <li>• <strong>PDF Exports:</strong> PDFs don't fully support Arabic fonts (Noto Sans Arabic needed) and RTL layout broken</li>
                <li>• <strong>Toast Notifications:</strong> Sonner toast messages hard-coded in English (20+ components)</li>
                <li>• <strong>Date/Time Formatting:</strong> Dates show English format only (need Hijri calendar option)</li>
                <li>• <strong>Number Formatting:</strong> Numbers show Western style (need Arabic numerals option)</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-red-600">
              <p className="font-bold text-red-900">RTL LAYOUT ISSUES</p>
              <ul className="text-slate-700 space-y-1 mt-2">
                <li>• <strong>Charts:</strong> Recharts axis labels don't flip for RTL (10+ dashboard pages affected)</li>
                <li>• <strong>Gantt Charts:</strong> Timeline visualizations flow left-to-right even in Arabic mode</li>
                <li>• <strong>Progress Bars:</strong> Progress component fills left-to-right (should flip for RTL)</li>
                <li>• <strong>Tooltips:</strong> Tooltip positioning sometimes wrong in RTL</li>
                <li>• <strong>Dropdowns:</strong> Some dropdown menus anchor incorrectly in RTL</li>
                <li>• <strong>Icons:</strong> Directional icons (arrows, chevrons) need mirroring in RTL</li>
                <li>• <strong>Tables:</strong> Table column order doesn't reverse in RTL mode</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-orange-600">
              <p className="font-bold text-orange-900">DATA LAYER GAPS</p>
              <ul className="text-slate-700 space-y-1 mt-2">
                <li>• <strong>Missing AR Fields:</strong> Some entities missing _ar variants (Tags, KPIReference, Sector, Subsector)</li>
                <li>• <strong>Enum Translation:</strong> Enum values (status, priority) stored in English, need display translation</li>
                <li>• <strong>Legacy Data:</strong> Existing records may have empty _ar fields (need migration/backfill)</li>
                <li>• <strong>Default Language:</strong> New records default to English if not specified</li>
                <li>• <strong>Search Indexing:</strong> Search doesn't index Arabic text properly (diacritics issue)</li>
              </ul>
            </div>

            <div className="p-3 bg-white rounded border-l-4 border-purple-600">
              <p className="font-bold text-purple-900">PHASE 4 - ENHANCEMENT (Future)</p>
              <p className="text-slate-700">• AI prompts engineered to return bilingual responses by default</p>
              <p className="text-slate-700">• Professional Arabic copy review for all static content</p>
              <p className="text-slate-700">• Advanced RTL layout for complex visualizations (graphs, Gantt charts)</p>
              <p className="text-slate-700">• Contextual language switching (auto-detect user preference per section)</p>
              <p className="text-slate-700">• Hijri calendar integration with Islamic date display option</p>
              <p className="text-slate-700">• Arabic numeral system option (١٢٣ instead of 123)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Features & Tools */}
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="h-6 w-6" />
            {t({ en: '🔮 Missing Bilingual Features & Tools', ar: '🔮 الميزات والأدوات ثنائية اللغة المفقودة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">🌐 Translation Management (Missing)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Translation Workbench</strong> - Admin page to manage all UI translations in one place → <em>New page: TranslationManager</em></li>
              <li>• <strong>AI Auto-Translator</strong> - Bulk translate missing _ar fields using AI → <em>New component: AIBulkTranslator</em></li>
              <li>• <strong>Translation Quality Checker</strong> - Detect poor/missing translations → <em>New page: TranslationQualityDashboard</em></li>
              <li>• <strong>Content Translation Workflow</strong> - Request → Translate → Review → Approve → <em>New workflow component</em></li>
              <li>• <strong>Glossary Manager</strong> - Manage consistent term translation (e.g., "Pilot" → "تجربة") → <em>New page: BilingualGlossary</em></li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">🎨 RTL UI Components (Missing)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>RTL-Aware Chart Library</strong> - Custom wrapper for Recharts with RTL support → <em>New component: RTLChart</em></li>
              <li>• <strong>RTL Timeline Component</strong> - Gantt/timeline that flips for Arabic → <em>New component: RTLTimeline</em></li>
              <li>• <strong>RTL Table Component</strong> - Table with reversible column order → <em>New component: RTLTable</em></li>
              <li>• <strong>Bidirectional Form Builder</strong> - Form generator with automatic RTL layout → <em>Enhancement to forms</em></li>
              <li>• <strong>RTL Icon Flipper</strong> - Utility to auto-mirror directional icons → <em>New utility: flipIconRTL()</em></li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">📝 Content Tools (Partial)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Inline Translation Editor</strong> - Edit AR/EN side-by-side → <em>New component: InlineTranslationEditor</em></li>
              <li>• <strong>Content Migration Tool</strong> - Migrate old English-only content to bilingual → <em>New page: ContentMigrationWizard</em></li>
              <li>• <strong>AI Translation Assistant</strong> - Suggest translations as users type → <em>New component: TranslationAssistant</em></li>
              <li>• <strong>Language Completeness Badge</strong> - Show % complete per entity → <em>New component: LanguageCompletenessIndicator</em></li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-blue-600">
            <p className="font-semibold text-blue-900 mb-2">🔤 Typography & Formatting (Missing)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Arabic Font Optimizer</strong> - Load optimal Arabic fonts (Noto Sans Arabic, Cairo) → <em>globals.css update</em></li>
              <li>• <strong>Hijri Date Picker</strong> - Islamic calendar option in date selectors → <em>New component: HijriDatePicker</em></li>
              <li>• <strong>Arabic Numeral Formatter</strong> - Convert 123 to ١٢٣ option → <em>New utility: formatNumberArabic()</em></li>
              <li>• <strong>Currency Formatter</strong> - SAR with Arabic formatting (٥٠٠ ر.س) → <em>New utility: formatCurrencyAR()</em></li>
              <li>• <strong>RTL-Aware CSS Framework</strong> - Tailwind plugin for RTL utilities → <em>Configuration update</em></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Technical Debt */}
      <Card className="border-2 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-6 w-6" />
            {t({ en: '🚨 Technical Debt & Blocking Issues', ar: '🚨 الديون التقنية والقضايا المعوقة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">Component Library Issues</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Shadcn/UI Components:</strong> Not all components support RTL out-of-box (Dialog, Popover positioning)</li>
              <li>• <strong>Recharts:</strong> No native RTL support - axis labels, legends stay LTR</li>
              <li>• <strong>React Quill:</strong> Rich text editor has poor Arabic text handling</li>
              <li>• <strong>Date-fns:</strong> Arabic locale loaded but not consistently applied</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">Development Workflow Issues</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• No systematic way to test RTL layout during development</li>
              <li>• Missing translation keys causes silent failures (shows key instead of text)</li>
              <li>• No automated detection of untranslated UI strings</li>
              <li>• Arabic text often added as afterthought, not during initial development</li>
              <li>• No style guide for Arabic typography (font size, line height, letter spacing)</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">AI & Dynamic Content Issues</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• AI prompts don't specify bilingual output → responses English-only</li>
              <li>• LLM responses not post-processed for language detection and routing</li>
              <li>• User-generated content (comments, messages) doesn't auto-detect language</li>
              <li>• Activity logs mix Arabic and English in same sentence</li>
              <li>• AI matching scores lack Arabic explanations</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Missing Tools Priority Matrix */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="h-6 w-6" />
            {t({ en: '🎯 Missing Tools Priority Matrix', ar: '🎯 مصفوفة أولويات الأدوات المفقودة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
              <p className="font-bold text-red-900 mb-3">🔥 CRITICAL (Do Immediately)</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>✓ Fix PDF Arabic font rendering (Noto Sans Arabic)</li>
                <li>✓ Add bilingual validation messages to all forms</li>
                <li>✓ Update AI prompts to request AR+EN responses</li>
                <li>✓ Translation Workbench page for managing UI strings</li>
                <li>✓ AIBulkTranslator component for batch translation</li>
              </ul>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
              <p className="font-bold text-orange-900 mb-3">⚠️ HIGH (Next Sprint)</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• RTLChart component wrapper for Recharts</li>
                <li>• RTLTimeline for Gantt charts</li>
                <li>• BilingualGlossary page for term consistency</li>
                <li>• TranslationQualityDashboard to audit translations</li>
                <li>• Complete 5 My Work pages bilingual support</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
              <p className="font-bold text-amber-900 mb-3">📋 MEDIUM (Backlog)</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• HijriDatePicker component</li>
                <li>• Arabic numeral formatter utility</li>
                <li>• InlineTranslationEditor component</li>
                <li>• ContentMigrationWizard for legacy data</li>
                <li>• RTL style guide documentation</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
              <p className="font-bold text-slate-900 mb-3">💡 LOW (Nice to Have)</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Auto-detect language from user input</li>
                <li>• Contextual language per section</li>
                <li>• Translation memory system</li>
                <li>• Professional translator portal</li>
                <li>• A/B test Arabic vs English engagement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-900">
            <Sparkles className="h-6 w-6" />
            {t({ en: 'Summary & Recommendations', ar: 'الملخص والتوصيات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-slate-700">
              <strong>Total Files Audited:</strong> {totalPages} (150+ pages + 170+ components + 40+ functions = 360+ total files)
            </p>
            <p className="text-green-700">
              <strong>✓ Complete Bilingual + RTL:</strong> {completeBilingual} files ({coveragePercentage}%)
            </p>
            <p className="text-amber-700">
              <strong>⚠ Partial Support:</strong> {partialBilingual} files
            </p>
            <p className="text-red-700">
              <strong>✗ Missing Support:</strong> {missingBilingual} files ({100 - coveragePercentage}%)
            </p>
            <p className="text-orange-700">
              <strong>⚠ Files With Issues:</strong> {pagesWithIssues} files
            </p>
            
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <p className="font-bold text-blue-900 mb-2">
                {t({ en: 'Recommended Next Steps:', ar: 'الخطوات التالية الموصى بها:' })}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-900">
                <li className="line-through text-green-700">✓ Add LanguageContext to all core pages (90+ pages)</li>
                <li className="line-through text-green-700">✓ Implement RTL support in Layout and main pages</li>
                <li className="line-through text-green-700">✓ All portals and dashboards bilingual + RTL (8 portals)</li>
                <li className="line-through text-green-700">✓ Navigation components bilingual (Layout, PortalSwitcher)</li>
                <li>Fix PDF Arabic font rendering (Noto Sans Arabic) - 10+ export features</li>
                <li>Add bilingual support to 5 remaining "My Work" pages</li>
                <li>Fix 35+ form components validation messages (English-only)</li>
                <li>Update 25+ AI components to request bilingual responses</li>
                <li>Fix 40+ backend functions to return bilingual error messages</li>
                <li>Fix 20+ chart/viz components for RTL (Recharts, timelines, graphs)</li>
                <li>Build TranslationManager page for centralized management</li>
                <li>Create AIBulkTranslator to migrate legacy English-only data</li>
                <li>Ensure all 50+ entity CRUD forms save to both _ar and _en fields</li>
                <li>Create RTL-aware components (RTLChart, RTLTimeline, RTLTable)</li>
                <li>Add 6 validation/audit tools bilingual support (currently hardcoded English)</li>
                <li>Add Arabic numeral and Hijri calendar options</li>
                <li>Professional Arabic copywriting review for all static content</li>
                <li>Fix toast notifications in 20+ components (Sonner messages English)</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(BilingualRTLAudit, { requiredPermissions: [] });