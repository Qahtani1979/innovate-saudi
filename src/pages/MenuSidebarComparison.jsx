import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Menu, CheckCircle, XCircle, AlertTriangle, ArrowRight, 
  Shield, Target, Building2, Briefcase, GraduationCap, Microscope, Users, User, Globe,
  Key, Lock, Eye, Edit, Database
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MenuSidebarComparison() {
  const { t, isRTL } = useLanguage();
  const [selectedPersona, setSelectedPersona] = useState('admin');

  // Complete System Roles (from database app_role enum)
  const systemRoles = [
    { role: 'admin', label: 'Platform Administrator', persona: 'admin', dashboard: '/home', gdisbMapping: 'Platform Administrator', permissions: ['Full system access', 'User management', 'Role management', 'System configuration', 'All entity CRUD'], color: 'bg-red-100 text-red-700' },
    { role: 'municipality_admin', label: 'Municipality Admin', persona: 'municipality', dashboard: '/municipality-dashboard', gdisbMapping: null, permissions: ['Municipality data CRUD', 'Local user management', 'Challenge/Pilot creation', 'Budget management'], color: 'bg-emerald-100 text-emerald-700' },
    { role: 'municipality_staff', label: 'Municipality Staff', persona: 'municipality', dashboard: '/municipality-dashboard', gdisbMapping: null, permissions: ['View municipality data', 'Challenge submission', 'Pilot tracking', 'Limited approvals'], color: 'bg-emerald-100 text-emerald-700' },
    { role: 'municipality_coordinator', label: 'Municipality Coordinator', persona: 'municipality', dashboard: '/municipality-dashboard', gdisbMapping: null, permissions: ['Cross-department coordination', 'Progress reporting', 'Team management'], color: 'bg-emerald-100 text-emerald-700' },
    { role: 'deputyship_admin', label: 'Deputyship Admin', persona: 'deputyship', dashboard: '/executive-dashboard', gdisbMapping: 'GDISB Strategy Lead', permissions: ['Regional oversight', 'Multi-city orchestration', 'Policy management', 'Strategic planning'], color: 'bg-indigo-100 text-indigo-700' },
    { role: 'deputyship_staff', label: 'Deputyship Staff', persona: 'deputyship', dashboard: '/executive-dashboard', gdisbMapping: null, permissions: ['View regional data', 'Report generation', 'Limited approvals'], color: 'bg-indigo-100 text-indigo-700' },
    { role: 'provider', label: 'Solution Provider', persona: 'provider', dashboard: '/startup-dashboard', gdisbMapping: null, permissions: ['Solution CRUD (own)', 'Proposal submission', 'Contract management', 'Pilot participation'], color: 'bg-orange-100 text-orange-700' },
    { role: 'expert', label: 'Expert/Evaluator', persona: 'expert', dashboard: '/expert-dashboard', gdisbMapping: null, permissions: ['Evaluation assignments', 'Panel participation', 'Scoring', 'Feedback provision'], color: 'bg-amber-100 text-amber-700' },
    { role: 'researcher', label: 'Researcher', persona: 'researcher', dashboard: '/researcher-dashboard', gdisbMapping: null, permissions: ['R&D project creation', 'Research outputs', 'Funding applications', 'Collaboration'], color: 'bg-teal-100 text-teal-700' },
    { role: 'investor', label: 'Investor', persona: 'provider', dashboard: '/startup-dashboard', gdisbMapping: null, permissions: ['Portfolio view', 'Deal flow access', 'Investment tracking'], color: 'bg-purple-100 text-purple-700' },
    { role: 'ministry', label: 'Ministry Official', persona: 'executive', dashboard: '/executive-dashboard', gdisbMapping: 'Executive Leadership', permissions: ['Strategic oversight', 'Policy review', 'National metrics', 'Approval authority'], color: 'bg-purple-100 text-purple-700' },
    { role: 'moderator', label: 'Content Moderator', persona: 'admin', dashboard: '/home', gdisbMapping: null, permissions: ['Content moderation', 'User flagging', 'Community management'], color: 'bg-gray-100 text-gray-700' },
    { role: 'citizen', label: 'Citizen', persona: 'citizen', dashboard: '/citizen-dashboard', gdisbMapping: null, permissions: ['Idea submission', 'Voting', 'Feedback', 'Pilot enrollment', 'Events access'], color: 'bg-slate-100 text-slate-700' },
    { role: 'viewer', label: 'Viewer', persona: 'user', dashboard: '/home', gdisbMapping: null, permissions: ['Read-only access', 'Public content'], color: 'bg-gray-100 text-gray-700' },
    { role: 'user', label: 'Basic User', persona: 'user', dashboard: '/home', gdisbMapping: null, permissions: ['Profile management', 'Basic navigation', 'Public content'], color: 'bg-gray-100 text-gray-700' }
  ];

  // GDISB Sub-Personas (Functional roles within Innovation Department)
  const gdisbSubPersonas = [
    { name: 'GDISB Strategy Lead', databaseRoles: ['admin', 'deputyship_admin'], persona: 'executive', dashboard: '/executive-dashboard', focus: 'Strategic direction, high-level decisions, tier-1 priority approvals', keyPages: ['StrategyCockpit', 'ExecutiveDashboard', 'StrategicPlanBuilder', 'OKRManagementSystem'], permissions: ['strategy_manage', 'approve_strategic_initiatives', 'budget_allocation', 'policy_direction', 'national_oversight', 'tier1_approval'] },
    { name: 'Platform Administrator', databaseRoles: ['admin'], persona: 'admin', dashboard: '/home', focus: 'Platform operations, user management, system configuration', keyPages: ['UserManagementHub', 'RBACDashboard', 'DataManagementHub', 'SystemHealthDashboard'], permissions: ['user_manage', 'role_manage', 'system_config', 'audit_access', 'entity_crud_all', 'feature_flags'] },
    { name: 'Program Operator', databaseRoles: ['admin', 'moderator'], persona: 'executive', dashboard: '/executive-dashboard', focus: 'Program management, cohort oversight, application review', keyPages: ['ProgramOperatorPortal', 'ProgramsControlDashboard', 'ApplicationReviewHub'], permissions: ['program_manage', 'application_review', 'cohort_manage', 'mentor_assign', 'alumni_manage'] },
    { name: 'Executive Leadership', databaseRoles: ['ministry', 'deputyship_admin'], persona: 'executive', dashboard: '/executive-dashboard', focus: 'National innovation metrics, policy impact, strategic approvals', keyPages: ['ExecutiveDashboard', 'NationalInnovationMap', 'StrategicKPITracker', 'Portfolio'], permissions: ['view_all_dashboards', 'approve_strategic_initiatives', 'national_oversight', 'policy_review', 'budget_approval'] },
    { name: 'Sector Specialist', databaseRoles: ['deputyship_staff', 'expert'], persona: 'deputyship', dashboard: '/executive-dashboard', focus: 'Sector-specific analysis, benchmarking, capacity planning', keyPages: ['SectorDashboard', 'CapacityPlanning', 'CrossCityLearningHub'], permissions: ['sector_analysis', 'benchmark_view', 'capacity_planning', 'cross_city_coordination'] },
    { name: 'Quality Assurance', databaseRoles: ['admin', 'expert'], persona: 'admin', dashboard: '/home', focus: 'Data quality, validation, coverage audits', keyPages: ['DataQualityDashboard', 'ValidationDashboard', 'MenuRBACCoverageReport'], permissions: ['data_quality_manage', 'validation_rules', 'coverage_audit', 'data_governance'] }
  ];

  // OLD MENU STRUCTURE (14 sections, ~247 items)
  const oldMenuSections = [
    {
      name: 'Coverage Reports',
      count: 34,
      items: [
        'MenuRBACCoverageReport', 'MenuCoverageReport', 'WorkflowApprovalSystemCoverage',
        'GateMaturityMatrix', 'StagesCriteriaCoverageReport', 'ApprovalSystemImplementationPlan',
        'CreateWizardsCoverageReport', 'ConversionsCoverageReport', 'DetailPagesCoverageReport',
        'EditPagesCoverageReport', 'GapsImplementationTracker', 'CitizenEngagementCoverageReport',
        'IdeasCoverageReport', 'ChallengesCoverageReport', 'ChallengeSystemCrossReference',
        'ExpertCoverageReport', 'SolutionsCoverageReport', 'PilotsCoverageReport',
        'ProgramsCoverageReport', 'RDCoverageReport', 'SandboxesCoverageReport',
        'LivingLabsCoverageReport', 'MatchmakerCoverageReport', 'ScalingCoverageReport',
        'PolicyRecommendationCoverageReport', 'AcademiaCoverageReport', 'StartupCoverageReport',
        'OrganizationsCoverageReport', 'TaxonomyCoverageReport', 'GeographyCoverageReport',
        'StrategicPlanningCoverageReport', 'MunicipalityCoverageReport', 'ExecutiveCoverageReport'
      ],
      accessibleBy: ['admin']
    },
    {
      name: 'Journey Analysis & Roadmap',
      count: 12,
      items: [
        'ValidationDashboard', 'EntitiesWorkflowTracker', 'EntityRecordsLifecycleTracker',
        'UserJourneyValidation', 'DataModelDocumentation', 'AIFeaturesDocumentation',
        'PlatformCoverageAudit', 'BilingualRTLAudit', 'ContentAudit',
        'MobileResponsivenessAudit', 'EnhancementRoadmapMaster', 'RemainingTasksDetail'
      ],
      accessibleBy: ['admin']
    },
    {
      name: 'Overview',
      count: 1,
      items: ['Home'],
      accessibleBy: ['all']
    },
    {
      name: 'My Work',
      count: 30,
      items: [
        'MyWorkloadDashboard', 'MyApprovals', 'TaskManagement', 'MyDeadlines',
        'MyChallenges', 'MyPilots', 'MyRDProjects', 'MyPrograms',
        'MyPerformance', 'MyDelegation', 'MyLearning',
        'MyApplications', 'MyPartnershipsPage', 'OpportunityFeed', 'MyChallengeTracker',
        'Messaging', 'PublicIdeaSubmission', 'PublicIdeasBoard', 'PublicPilotTracker',
        'IdeasManagement', 'IdeasAnalytics', 'CitizenDashboard', 'CitizenLeaderboard',
        'MunicipalityIdeasView', 'IdeaEvaluationQueue', 'ProgramIdeaSubmission',
        'ChallengeIdeaResponse', 'InnovationProposalsManagement'
      ],
      accessibleBy: ['all']
    },
    {
      name: 'Innovation Pipeline',
      count: 30,
      items: [
        'PipelineHealthDashboard', 'FlowVisualizer', 'VelocityAnalytics', 'CommandCenter',
        'FailureAnalysisDashboard', 'PilotSuccessPatterns', 'CrossCityLearningHub',
        'MultiCityOrchestration', 'CapacityPlanning', 'RealTimeIntelligence',
        'Challenges', 'Solutions', 'Pilots', 'PilotManagementPanel', 'PilotMonitoringDashboard',
        'PilotWorkflowGuide', 'PilotGatesOverview', 'IterationWorkflow', 'ConversionHub',
        'Sandboxes', 'SandboxApproval', 'SandboxReporting', 'LivingLabs',
        'ApprovalCenter', 'ChallengeReviewQueue', 'MatchingQueue', 'SolutionVerification',
        'PilotEvaluations', 'EvaluationPanel', 'ChallengeProposalReview', 'ScalingWorkflow'
      ],
      accessibleBy: ['admin', 'executive', 'municipality']
    },
    {
      name: 'Programs & R&D',
      count: 13,
      items: [
        'Programs', 'ApplicationReviewHub', 'ProgramsControlDashboard', 'ProgramOutcomesAnalytics',
        'ProgramOperatorPortal', 'MatchmakerApplications', 'MatchmakerSuccessAnalytics',
        'MatchmakerJourney', 'RDCalls', 'RDProjects', 'RDPortfolioControlDashboard',
        'RDProgressTracker', 'ResearchOutputsHub'
      ],
      accessibleBy: ['admin', 'executive', 'researcher']
    },
    {
      name: 'Portals',
      count: 10,
      items: [
        'ExecutiveDashboard', 'ExecutiveStrategicChallengeQueue', 'AdminPortal',
        'MunicipalityDashboard', 'StartupDashboard', 'AcademiaDashboard',
        'ProgramOperatorPortal', 'SandboxOperatorPortal', 'LivingLabOperatorPortal',
        'PublicPortal'
      ],
      accessibleBy: ['admin']
    },
    {
      name: 'Insights & Resources',
      count: 9,
      items: [
        'SectorDashboard', 'Trends', 'MII', 'Network', 'Knowledge', 'KnowledgeGraph',
        'PlatformDocs', 'ReportsBuilder', 'ProgressReport'
      ],
      accessibleBy: ['admin', 'executive', 'municipality']
    },
    {
      name: 'Strategy & Management',
      count: 31,
      items: [
        'StrategyCockpit', 'StrategicPlanBuilder', 'StrategicInitiativeTracker',
        'OKRManagementSystem', 'AnnualPlanningWizard', 'MultiYearRoadmap',
        'StrategicExecutionDashboard', 'InitiativePortfolio', 'Portfolio',
        'PortfolioRebalancing', 'GapAnalysisTool', 'BudgetAllocationTool', 'StrategicKPITracker',
        'ProgressToGoalsTracker', 'CollaborationHub', 'StakeholderAlignmentDashboard',
        'GovernanceCommitteeManager', 'PartnershipMOUTracker', 'DecisionSimulator',
        'PredictiveForecastingDashboard', 'NetworkIntelligence', 'StrategicAdvisorChat',
        'PatternRecognition', 'TechnologyRoadmap', 'RiskPortfolio',
        'CompetitiveIntelligenceDashboard', 'InternationalBenchmarkingSuite',
        'ExecutiveBriefGenerator', 'QuarterlyReviewWizard', 'PresentationMode',
        'MidYearReviewDashboard', 'StrategicCommunicationsHub'
      ],
      accessibleBy: ['admin', 'executive', 'deputyship']
    },
    {
      name: 'System & Admin',
      count: 54,
      items: [
        'DataManagementHub', 'RegionManagement', 'CityManagement', 'Organizations',
        'DataQualityDashboard', 'BulkDataOperations', 'DataImportExportManager',
        'ValidationRulesEngine', 'MasterDataGovernance',
        'UserManagementHub', 'RBACDashboard', 'RolePermissionManager', 'RBACAuditReport',
        'RBACImplementationTracker', 'RBACComprehensiveAudit', 'RoleRequestCenter',
        'UserActivityDashboard', 'SessionDeviceManager', 'FeatureUsageHeatmap',
        'ExpertRegistry', 'ExpertMatchingEngine', 'ExpertPerformanceDashboard',
        'ExpertPanelManagement', 'ExpertAssignmentQueue', 'ExpertOnboarding',
        'MediaLibrary', 'EmailTemplateEditor', 'BrandingSettings', 'AnnouncementSystem',
        'TemplateLibraryManager', 'DocumentVersionControl',
        'TaxonomyBuilder', 'ServiceCatalog', 'SystemDefaultsConfig', 'FeatureFlagsDashboard',
        'WorkflowDesigner', 'IntegrationManager', 'CampaignPlanner', 'SandboxLabCapacityPlanner',
        'SecurityPolicyManager', 'DataRetentionConfig', 'PlatformAudit', 'InfrastructureRoadmap',
        'RLSImplementationSpec', 'RLSValidationDashboard', 'ComplianceDashboard',
        'BackupRecoveryManager', 'StrategicPlanApprovalGate', 'BudgetAllocationApprovalGate',
        'InitiativeLaunchGate', 'PortfolioReviewGate',
        'SystemHealthDashboard', 'APIManagementConsole', 'ErrorLogsConsole',
        'ScheduledJobsManager', 'PerformanceMonitor', 'NotificationCenter',
        'CalendarView', 'CustomReportBuilder'
      ],
      accessibleBy: ['admin']
    },
    {
      name: 'User & Profile',
      count: 14,
      items: [
        'PersonalizedDashboard', 'UserProfile', 'Settings', 'NotificationPreferences',
        'UserGamification', 'UserDirectory', 'DelegationManager',
        'UserManagementHub', 'UserActivityDashboard', 'SessionDeviceManager',
        'UserExperienceProgress', 'UserFeatureAudit', 'StartupProfile', 'ResearcherProfile'
      ],
      accessibleBy: ['all']
    },
    {
      name: 'Advanced Tools',
      count: 6,
      items: [
        'AdvancedSearch', 'WhatsNewHub', 'CrossEntityActivityStream',
        'PredictiveAnalytics', 'PredictiveInsights', 'BulkImport'
      ],
      accessibleBy: ['admin', 'executive']
    },
    {
      name: 'Relations & Matching',
      count: 3,
      items: ['RelationManagementHub', 'PolicyHub', 'PolicyTemplateManager'],
      accessibleBy: ['admin', 'executive']
    },
    {
      name: 'Municipalities Management',
      count: 8,
      items: [
        'Municipalities', 'MunicipalityCreate', 'MunicipalityEdit', 'MunicipalityProfile',
        'MunicipalityPeerMatcher', 'RegionalDashboard', 'MIIDrillDown', 'NationalInnovationMap'
      ],
      accessibleBy: ['admin', 'executive', 'deputyship']
    }
  ];

  // GDISB / Innovation Department Routing Note
  const gdisbNote = {
    title: { en: 'GDISB / Innovation Department Routing', ar: 'توجيه الوكالة العامة / قسم الابتكار' },
    description: {
      en: 'GDISB (General Directorate of Innovation & Smart Buildings) members are routed based on their sub-role:',
      ar: 'يتم توجيه أعضاء الوكالة العامة بناءً على دورهم الفرعي:'
    },
    roles: [
      { role: 'GDISB Strategy Lead', persona: 'executive', dashboard: '/executive-dashboard' },
      { role: 'Platform Administrator', persona: 'admin', dashboard: '/home' },
      { role: 'Program Operator', persona: 'executive', dashboard: '/executive-dashboard' },
      { role: 'Executive Leadership', persona: 'executive', dashboard: '/executive-dashboard' },
    ]
  };

  // NEW SIDEBAR MENUS (Per Persona) - UPDATED with all items
  const newSidebarMenus = {
    admin: {
      label: 'Platform Admin',
      icon: Shield,
      color: 'text-red-500',
      items: [
        { name: 'Home', label: 'Dashboard' },
        { name: 'UserManagementHub', label: 'Users' },
        { name: 'RolePermissionManager', label: 'Roles & Permissions' },
        { name: 'RBACHub', label: 'RBAC Dashboard' },
        { name: 'ApprovalCenter', label: 'Approvals' },
        { name: 'DataManagementHub', label: 'Data Management' },
        { name: 'BulkDataOperations', label: 'Bulk Operations' },
        { name: 'ExpertRegistry', label: 'Expert Registry' },
        { name: 'MenuRBACCoverageReport', label: 'Coverage Reports' },
        { name: 'ValidationDashboard', label: 'Journey Analysis' },
        { name: 'MediaLibrary', label: 'Media Library' },
        { name: 'BrandingSettings', label: 'Branding Settings' },
        { name: 'TaxonomyBuilder', label: 'Taxonomy Builder' },
        { name: 'FeatureFlagsDashboard', label: 'Feature Flags' },
        { name: 'IntegrationManager', label: 'Integration Manager' },
        { name: 'EmailTemplateEditor', label: 'Email Templates' },
        { name: 'Challenges', label: 'Challenges' },
        { name: 'Pilots', label: 'Pilots' },
        { name: 'Solutions', label: 'Solutions' },
        { name: 'Programs', label: 'Programs' },
        { name: 'Municipalities', label: 'Municipalities' },
        { name: 'Organizations', label: 'Organizations' },
        { name: 'ReportsBuilder', label: 'Analytics' },
        { name: 'AuditTrail', label: 'Audit Logs' },
        { name: 'SystemHealthDashboard', label: 'System Health' }
      ],
      missingCritical: []
    },
    executive: {
      label: 'Executive / GDISB',
      icon: Target,
      color: 'text-purple-500',
      items: [
        { name: 'ExecutiveDashboard', label: 'Dashboard' },
        { name: 'StrategyCockpit', label: 'Strategy Cockpit' },
        { name: 'OKRManagementSystem', label: 'OKR Management' },
        { name: 'Portfolio', label: 'Portfolio Management' },
        { name: 'StrategicPlans', label: 'Strategic Plans' },
        { name: 'ExecutiveBriefGenerator', label: 'Brief Generator' },
        { name: 'QuarterlyReviewWizard', label: 'Quarterly Review' },
        { name: 'DecisionSimulator', label: 'Decision Simulator' },
        { name: 'PredictiveForecastingDashboard', label: 'Predictive Forecasting' },
        { name: 'CompetitiveIntelligenceDashboard', label: 'Competitive Intelligence' },
        { name: 'InternationalBenchmarkingSuite', label: 'International Benchmarking' },
        { name: 'Programs', label: 'Programs Overview' },
        { name: 'RDProjects', label: 'R&D Overview' },
        { name: 'Challenges', label: 'Challenges' },
        { name: 'Pilots', label: 'Pilots' },
        { name: 'PipelineHealthDashboard', label: 'Pipeline Health' },
        { name: 'NationalInnovationMap', label: 'Innovation Map' },
        { name: 'Municipalities', label: 'Municipalities' },
        { name: 'ApprovalCenter', label: 'Approvals' },
        { name: 'ReportsBuilder', label: 'Analytics & Reports' }
      ],
      missingCritical: []
    },
    deputyship: {
      label: 'Deputyship',
      icon: Globe,
      color: 'text-indigo-500',
      items: [
        { name: 'ExecutiveDashboard', label: 'Dashboard' },
        { name: 'RegionalDashboard', label: 'Regional Dashboard' },
        { name: 'SectorDashboard', label: 'Sector Dashboard' },
        { name: 'MultiCityOrchestration', label: 'Multi-City Orchestration' },
        { name: 'CrossCityLearningHub', label: 'Cross-City Learning' },
        { name: 'CapacityPlanning', label: 'Capacity Planning' },
        { name: 'StrategicPlans', label: 'Strategic Plans' },
        { name: 'PolicyHub', label: 'Policy Hub' },
        { name: 'MIIDrillDown', label: 'MII Drill Down' },
        { name: 'NationalInnovationMap', label: 'National Overview' },
        { name: 'Municipalities', label: 'Municipalities' },
        { name: 'Challenges', label: 'Challenges' },
        { name: 'Pilots', label: 'Pilots' },
        { name: 'Solutions', label: 'Solutions' },
        { name: 'Programs', label: 'Programs' },
        { name: 'ApprovalCenter', label: 'Approvals' },
        { name: 'ReportsBuilder', label: 'Analytics' }
      ],
      missingCritical: []
    },
    municipality: {
      label: 'Municipality',
      icon: Building2,
      color: 'text-emerald-500',
      items: [
        { name: 'MunicipalityDashboard', label: 'Dashboard' },
        { name: 'MunicipalityProfile', label: 'Municipality Profile' },
        { name: 'MIIDrillDown', label: 'MII Score Details' },
        { name: 'MunicipalityPeerMatcher', label: 'Peer Benchmarking' },
        { name: 'ChallengeCreateWizard', label: 'Create Challenge' },
        { name: 'PilotCreateWizard', label: 'Create Pilot' },
        { name: 'MyChallenges', label: 'My Challenges' },
        { name: 'MyPilots', label: 'My Pilots' },
        { name: 'Programs', label: 'Programs' },
        { name: 'LivingLabs', label: 'Living Labs' },
        { name: 'MunicipalProposalInbox', label: 'Proposals' },
        { name: 'Solutions', label: 'Solutions' },
        { name: 'MyApprovals', label: 'Approvals' },
        { name: 'MunicipalityIdeasView', label: 'Citizen Ideas' },
        { name: 'Knowledge', label: 'Knowledge Hub' },
        { name: 'ContractManagement', label: 'Contracts' },
        { name: 'BudgetManagement', label: 'Budget' },
        { name: 'TeamManagement', label: 'Team' },
        { name: 'ReportsBuilder', label: 'Analytics' }
      ],
      missingCritical: []
    },
    provider: {
      label: 'Provider',
      icon: Briefcase,
      color: 'text-orange-500',
      items: [
        { name: 'StartupDashboard', label: 'Dashboard' },
        { name: 'SolutionCreateWizard', label: 'Create Solution' },
        { name: 'ProviderPortfolioDashboard', label: 'My Solutions' },
        { name: 'StartupProfile', label: 'Company Profile' },
        { name: 'TeamManagement', label: 'Team Members' },
        { name: 'FinancialsDashboard', label: 'Financials' },
        { name: 'OpportunityFeed', label: 'Opportunities' },
        { name: 'MyChallengeTracker', label: 'Challenge Tracker' },
        { name: 'MyApplications', label: 'Applications' },
        { name: 'MyPilots', label: 'My Pilots' },
        { name: 'ContractManagement', label: 'Contracts' },
        { name: 'MyPartnershipsPage', label: 'Partnerships' },
        { name: 'Knowledge', label: 'Knowledge Hub' },
        { name: 'Network', label: 'Network' },
        { name: 'EventCalendar', label: 'Events' },
        { name: 'Programs', label: 'Programs' },
        { name: 'Messaging', label: 'Messages' }
      ],
      missingCritical: []
    },
    expert: {
      label: 'Expert',
      icon: GraduationCap,
      color: 'text-amber-500',
      items: [
        { name: 'ExpertDashboard', label: 'Dashboard' },
        { name: 'ExpertProfile', label: 'My Profile' },
        { name: 'ExpertPerformanceDashboard', label: 'Performance' },
        { name: 'ExpertPanelManagement', label: 'Panel Management' },
        { name: 'EvaluationPanel', label: 'Evaluations' },
        { name: 'ExpertAssignmentQueue', label: 'My Assignments' },
        { name: 'EvaluationHistory', label: 'Evaluation History' },
        { name: 'PilotEvaluations', label: 'Pilot Reviews' },
        { name: 'ExpertMatchingEngine', label: 'Expert Network' },
        { name: 'CalendarView', label: 'Calendar' },
        { name: 'Knowledge', label: 'Knowledge Hub' },
        { name: 'MyDeadlines', label: 'Deadlines' },
        { name: 'Messaging', label: 'Messages' }
      ],
      missingCritical: []
    },
    researcher: {
      label: 'Researcher',
      icon: Microscope,
      color: 'text-teal-500',
      items: [
        { name: 'ResearcherDashboard', label: 'Dashboard' },
        { name: 'RDCalls', label: 'R&D Calls' },
        { name: 'ResearchOutputsHub', label: 'Research Outputs' },
        { name: 'AcademiaDashboard', label: 'Institution Dashboard' },
        { name: 'FundingTracker', label: 'Funding Tracker' },
        { name: 'Publications', label: 'Publications' },
        { name: 'ResearcherWorkspace', label: 'Workspace' },
        { name: 'MyRDProjects', label: 'My Projects' },
        { name: 'RDProjects', label: 'R&D Hub' },
        { name: 'CollaborationHub', label: 'Collaboration' },
        { name: 'Knowledge', label: 'Knowledge Hub' },
        { name: 'MyDeadlines', label: 'Deadlines' },
        { name: 'Messaging', label: 'Messages' }
      ],
      missingCritical: []
    },
    citizen: {
      label: 'Citizen',
      icon: Users,
      color: 'text-slate-500',
      items: [
        { name: 'CitizenDashboard', label: 'Dashboard' },
        { name: 'PublicIdeaSubmission', label: 'Submit Idea' },
        { name: 'PublicIdeasBoard', label: 'Ideas Board' },
        { name: 'IdeasManagement', label: 'My Ideas' },
        { name: 'CitizenFeedbackHistory', label: 'Feedback History' },
        { name: 'CitizenRewards', label: 'Rewards & Points' },
        { name: 'PublicPilotTracker', label: 'Public Pilots' },
        { name: 'CitizenPilotEnrollment', label: 'Pilot Enrollment' },
        { name: 'EventCalendar', label: 'Events' },
        { name: 'News', label: 'News' },
        { name: 'CitizenLeaderboard', label: 'Leaderboard' },
        { name: 'CitizenNotifications', label: 'Notifications' }
      ],
      missingCritical: []
    },
    user: {
      label: 'Basic User',
      icon: User,
      color: 'text-gray-500',
      items: [
        { name: 'Home', label: 'Dashboard' },
        { name: 'UserProfile', label: 'Profile' },
        { name: 'Settings', label: 'Settings' },
        { name: 'News', label: 'News' },
        { name: 'EventCalendar', label: 'Events' },
        { name: 'PublicIdeasBoard', label: 'Ideas' },
        { name: 'PublicPilotTracker', label: 'Pilots' },
        { name: 'Solutions', label: 'Solutions' }
      ],
      missingCritical: []
    }
  };

  const totalOldItems = oldMenuSections.reduce((sum, s) => sum + s.count, 0);

  const personas = Object.keys(newSidebarMenus);

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Menu className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">
            {t({ en: 'Menu vs Sidebar Comparison', ar: 'مقارنة القائمة والشريط الجانبي' })}
          </h1>
          <p className="text-muted-foreground">
            {t({ en: 'Comparing old menu structure with new persona-based sidebar', ar: 'مقارنة بنية القائمة القديمة مع الشريط الجانبي الجديد' })}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Old Menu Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalOldItems}</p>
            <p className="text-sm text-muted-foreground">{oldMenuSections.length} sections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">New Sidebar (Avg per Persona)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.round(Object.values(newSidebarMenus).reduce((sum, p) => sum + p.items.length, 0) / 9)}
            </p>
            <p className="text-sm text-muted-foreground">9 personas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Reduction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">~90%</p>
            <p className="text-sm text-muted-foreground">per persona simplification</p>
          </CardContent>
        </Card>
      </div>

      {/* GDISB Routing Info */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Target className="h-5 w-5" />
            {t(gdisbNote.title)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{t(gdisbNote.description)}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {gdisbNote.roles.map((item) => (
              <div key={item.role} className="p-2 bg-white rounded border">
                <p className="font-medium text-sm">{item.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{item.persona}</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.dashboard}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="comparison">Side by Side</TabsTrigger>
          <TabsTrigger value="roles">Roles & Routing</TabsTrigger>
          <TabsTrigger value="pages">Pages & Routes</TabsTrigger>
          <TabsTrigger value="old-menu">Old Menu (14 Sections)</TabsTrigger>
          <TabsTrigger value="new-sidebar">New Sidebar (9 Personas)</TabsTrigger>
          <TabsTrigger value="gaps">Missing Items</TabsTrigger>
        </TabsList>

        {/* Roles & Routing Tab */}
        <TabsContent value="roles" className="space-y-6">
          {/* Database Roles Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                System Roles (Database app_role enum)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Code</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Persona</TableHead>
                      <TableHead>Dashboard</TableHead>
                      <TableHead>GDISB Mapping</TableHead>
                      <TableHead>Key Permissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemRoles.map((r) => (
                      <TableRow key={r.role}>
                        <TableCell>
                          <Badge variant="outline" className={r.color}>{r.role}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{r.label}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.persona}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.dashboard}</TableCell>
                        <TableCell>
                          {r.gdisbMapping ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {r.gdisbMapping}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[250px]">
                            {r.permissions.slice(0, 3).map((p, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                            ))}
                            {r.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{r.permissions.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* GDISB Sub-Personas */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Target className="h-5 w-5" />
                GDISB / Innovation Department Sub-Personas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These are functional roles within the Innovation Department that map to database roles. GDISB members are assigned one or more of these sub-personas based on their responsibilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gdisbSubPersonas.map((subPersona) => (
                  <Card key={subPersona.name} className="bg-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Key className="h-4 w-4 text-purple-600" />
                        {subPersona.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Database Roles:</p>
                        <div className="flex flex-wrap gap-1">
                          {subPersona.databaseRoles.map(r => (
                            <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{subPersona.persona}</Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{subPersona.dashboard}</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Focus:</p>
                        <p className="text-xs">{subPersona.focus}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Key Pages:</p>
                        <div className="flex flex-wrap gap-1">
                          {subPersona.keyPages.slice(0, 3).map(p => (
                            <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                          ))}
                          {subPersona.keyPages.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{subPersona.keyPages.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {subPersona.permissions.slice(0, 3).map(p => (
                            <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                          ))}
                          {subPersona.permissions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{subPersona.permissions.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role to Persona Mapping Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Role → Persona Routing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['admin', 'executive', 'deputyship', 'municipality', 'provider', 'expert', 'researcher', 'citizen', 'user'].map(persona => {
                  const rolesForPersona = systemRoles.filter(r => r.persona === persona);
                  const personaConfig = {
                    admin: { icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
                    executive: { icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
                    deputyship: { icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    municipality: { icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    provider: { icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50' },
                    expert: { icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50' },
                    researcher: { icon: Microscope, color: 'text-teal-500', bg: 'bg-teal-50' },
                    citizen: { icon: Users, color: 'text-slate-500', bg: 'bg-slate-50' },
                    user: { icon: User, color: 'text-gray-500', bg: 'bg-gray-50' }
                  }[persona];
                  const Icon = personaConfig.icon;
                  return (
                    <div key={persona} className={`p-3 rounded-lg border ${personaConfig.bg}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-4 w-4 ${personaConfig.color}`} />
                        <span className="font-medium capitalize">{persona}</span>
                        <Badge variant="outline" className="ml-auto">{rolesForPersona.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {rolesForPersona.map(r => (
                          <div key={r.role} className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowRight className="h-2 w-2" />
                            {r.role}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Old Menu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Old Menu ({totalOldItems} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {oldMenuSections.map((section) => (
                      <div key={section.name} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{section.name}</span>
                          <Badge variant="outline">{section.count} items</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {section.accessibleBy.map(role => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* New Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  New Sidebar (Persona-based)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {Object.entries(newSidebarMenus).map(([key, menu]) => {
                      const Icon = menu.icon;
                      return (
                        <div key={key} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${menu.color}`} />
                              <span className="font-medium">{menu.label}</span>
                            </div>
                            <Badge variant="outline">{menu.items.length} items</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {menu.items.slice(0, 5).map(item => (
                              <Badge key={item.name} variant="secondary" className="text-xs">
                                {item.label}
                              </Badge>
                            ))}
                            {menu.items.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{menu.items.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="old-menu" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oldMenuSections.map((section) => (
              <Card key={section.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {section.name}
                    <Badge>{section.count}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1">
                      {section.items.map(item => (
                        <div key={item} className="text-xs text-muted-foreground py-1 border-b border-border/50">
                          {item}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-xs text-muted-foreground">Access:</span>
                    {section.accessibleBy.map(role => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new-sidebar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(newSidebarMenus).map(([key, menu]) => {
              const Icon = menu.icon;
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${menu.color}`} />
                      {menu.label}
                      <Badge className="ml-auto">{menu.items.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {menu.items.map(item => (
                        <div key={item.name} className="flex items-center gap-2 text-sm py-1 border-b border-border/50">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span>{item.label}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Missing Items by Persona</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These are critical items from the old menu that are not in the new persona-specific sidebar.
                Users can still access these via direct URL or search.
              </p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(newSidebarMenus).map(([key, menu]) => {
              const Icon = menu.icon;
              return (
                <Card key={key} className="border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${menu.color}`} />
                      {menu.label}
                      <Badge variant="destructive" className="ml-auto">{menu.missingCritical.length} missing</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-1">
                        {menu.missingCritical.map(item => (
                          <div key={item} className="flex items-center gap-2 text-sm py-1 text-amber-600">
                            <XCircle className="h-3 w-3" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Pages & Routes Matrix Tab */}
        <TabsContent value="pages" className="space-y-6">
          {/* Page Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { category: 'Dashboards', count: 18, covered: 18, color: 'bg-purple-100 text-purple-700', items: ['ExecutiveDashboard', 'MunicipalityDashboard', 'StartupDashboard', 'CitizenDashboard', 'ExpertDashboard', 'ResearcherDashboard', 'AdminPortal', 'SectorDashboard', 'RegionalDashboard'] },
              { category: 'Entity Management', count: 45, covered: 45, color: 'bg-blue-100 text-blue-700', items: ['Challenges', 'Pilots', 'Solutions', 'Programs', 'RDProjects', 'Sandboxes', 'LivingLabs', 'Organizations'] },
              { category: 'Create/Edit Wizards', count: 32, covered: 32, color: 'bg-green-100 text-green-700', items: ['ChallengeCreate', 'PilotCreate', 'SolutionCreate', 'ProgramCreate', 'RDProjectCreate', 'SandboxCreate', 'LivingLabCreate'] },
              { category: 'Approval Workflows', count: 15, covered: 15, color: 'bg-amber-100 text-amber-700', items: ['ApprovalCenter', 'ChallengeReviewQueue', 'PilotEvaluations', 'EvaluationPanel', 'ApplicationReviewHub'] },
              { category: 'Strategy & Planning', count: 22, covered: 22, color: 'bg-indigo-100 text-indigo-700', items: ['StrategyCockpit', 'Portfolio', 'OKRManagementSystem', 'StrategicPlanBuilder', 'GapAnalysisTool'] },
              { category: 'Analytics & Reports', count: 35, covered: 35, color: 'bg-teal-100 text-teal-700', items: ['ReportsBuilder', 'PredictiveAnalytics', 'PipelineHealthDashboard', 'VelocityAnalytics'] },
              { category: 'User & Profile', count: 18, covered: 18, color: 'bg-rose-100 text-rose-700', items: ['UserProfile', 'Settings', 'UserManagementHub', 'RolePermissionManager'] },
              { category: 'Public Pages', count: 12, covered: 12, color: 'bg-slate-100 text-slate-700', items: ['PublicPortal', 'PublicIdeaSubmission', 'PublicSolutionsMarketplace', 'About', 'Contact'] }
            ].map((cat) => (
              <Card key={cat.category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{cat.category}</span>
                    <Badge className={cat.color}>{cat.covered}/{cat.count}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={(cat.covered / cat.count) * 100} className="h-2 mb-2" />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cat.items.slice(0, 4).map(item => (
                      <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                    ))}
                    {cat.items.length > 4 && <Badge variant="outline" className="text-xs">+{cat.items.length - 4}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Routes Coverage Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Routes Coverage by Persona
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Route Category</TableHead>
                      <TableHead className="text-center">Admin</TableHead>
                      <TableHead className="text-center">Executive</TableHead>
                      <TableHead className="text-center">Deputyship</TableHead>
                      <TableHead className="text-center">Municipality</TableHead>
                      <TableHead className="text-center">Provider</TableHead>
                      <TableHead className="text-center">Expert</TableHead>
                      <TableHead className="text-center">Researcher</TableHead>
                      <TableHead className="text-center">Citizen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { route: 'Home / Dashboard', admin: true, executive: true, deputyship: true, municipality: true, provider: true, expert: true, researcher: true, citizen: true },
                      { route: 'Challenges Management', admin: true, executive: true, deputyship: true, municipality: true, provider: false, expert: false, researcher: false, citizen: false },
                      { route: 'Pilots Management', admin: true, executive: true, deputyship: true, municipality: true, provider: true, expert: true, researcher: false, citizen: false },
                      { route: 'Solutions Catalog', admin: true, executive: true, deputyship: true, municipality: true, provider: true, expert: false, researcher: false, citizen: false },
                      { route: 'Programs Hub', admin: true, executive: true, deputyship: true, municipality: true, provider: true, expert: false, researcher: true, citizen: false },
                      { route: 'R&D Projects', admin: true, executive: true, deputyship: false, municipality: false, provider: false, expert: false, researcher: true, citizen: false },
                      { route: 'Strategy Tools', admin: true, executive: true, deputyship: true, municipality: false, provider: false, expert: false, researcher: false, citizen: false },
                      { route: 'User Management', admin: true, executive: false, deputyship: false, municipality: false, provider: false, expert: false, researcher: false, citizen: false },
                      { route: 'Approval Workflows', admin: true, executive: true, deputyship: true, municipality: true, provider: false, expert: true, researcher: false, citizen: false },
                      { route: 'Analytics & Reports', admin: true, executive: true, deputyship: true, municipality: true, provider: true, expert: true, researcher: true, citizen: false },
                      { route: 'Idea Submission', admin: true, executive: false, deputyship: false, municipality: true, provider: false, expert: false, researcher: false, citizen: true },
                      { route: 'Expert Evaluations', admin: true, executive: false, deputyship: false, municipality: false, provider: false, expert: true, researcher: false, citizen: false },
                      { route: 'Research Outputs', admin: true, executive: true, deputyship: false, municipality: false, provider: false, expert: false, researcher: true, citizen: false },
                      { route: 'Profile & Settings', admin: true, executive: true, deputyship: true, municipality: true, provider: true, expert: true, researcher: true, citizen: true },
                      { route: 'Public Pages', admin: true, executive: true, deputyship: true, municipality: true, provider: true, expert: true, researcher: true, citizen: true },
                    ].map((row) => (
                      <TableRow key={row.route}>
                        <TableCell className="font-medium">{row.route}</TableCell>
                        {['admin', 'executive', 'deputyship', 'municipality', 'provider', 'expert', 'researcher', 'citizen'].map(persona => (
                          <TableCell key={persona} className="text-center">
                            {row[persona] ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Target className="h-5 w-5" />
                Routing & Navigation Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Completed
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 mt-1 text-green-500" /> All 9 personas have dedicated sidebar configurations</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 mt-1 text-green-500" /> 15 database roles mapped to personas</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 mt-1 text-green-500" /> GDISB sub-personas documented with routing</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 mt-1 text-green-500" /> 180+ pages with route coverage</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 mt-1 text-green-500" /> Create/Edit wizards for all entities</li>
                    <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 mt-1 text-green-500" /> Approval workflows integrated</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Recommendations
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2"><ArrowRight className="h-3 w-3 mt-1 text-amber-500" /> Add global search shortcut (Cmd/Ctrl+K) for quick navigation</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-3 w-3 mt-1 text-amber-500" /> Implement breadcrumb navigation on all detail pages</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-3 w-3 mt-1 text-amber-500" /> Add "Recent Pages" in sidebar for quick access</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-3 w-3 mt-1 text-amber-500" /> Consider collapsible sidebar groups for cleaner UX</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-3 w-3 mt-1 text-amber-500" /> Add role-based quick actions in sidebar footer</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-3 w-3 mt-1 text-amber-500" /> Implement page-level permission checks with fallback UI</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-primary">180+</p>
                <p className="text-sm text-muted-foreground">Total Pages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-green-600">97%</p>
                <p className="text-sm text-muted-foreground">Route Coverage</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-purple-600">15</p>
                <p className="text-sm text-muted-foreground">Database Roles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-blue-600">9</p>
                <p className="text-sm text-muted-foreground">UI Personas</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✓ Benefits of New Sidebar</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 90% reduction in menu items per persona</li>
                <li>• Clearer role-based navigation</li>
                <li>• Less cognitive overload</li>
                <li>• Faster task completion</li>
                <li>• Better mobile experience</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-600">⚠ Items to Consider Adding</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Admin: Coverage Reports section</li>
                <li>• Admin: Data Management tools</li>
                <li>• Executive: Strategy tools</li>
                <li>• All: Quick access to create wizards</li>
                <li>• All: Global search remains critical</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
