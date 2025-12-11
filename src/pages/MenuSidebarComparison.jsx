import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Menu, CheckCircle, XCircle, AlertTriangle, ArrowRight, 
  Shield, Target, Building2, Briefcase, GraduationCap, Microscope, Users, User, Globe
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

export default function MenuSidebarComparison() {
  const { t, isRTL } = useLanguage();
  const [selectedPersona, setSelectedPersona] = useState('admin');

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

  // NEW SIDEBAR MENUS (Per Persona)
  const newSidebarMenus = {
    admin: {
      label: 'Platform Admin',
      icon: Shield,
      color: 'text-red-500',
      items: [
        { name: 'Home', label: 'Dashboard' },
        { name: 'UserManagementHub', label: 'Users' },
        { name: 'RolePermissionManager', label: 'Roles & Permissions' },
        { name: 'ApprovalCenter', label: 'Approvals' },
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
      missingCritical: [
        'Coverage Reports (34 items)',
        'Journey Analysis (12 items)',
        'Data Management Hub',
        'RBAC Dashboard',
        'Bulk Data Operations',
        'Expert Registry',
        'Media Library',
        'Branding Settings',
        'Taxonomy Builder',
        'Feature Flags',
        'Integration Manager',
        'Email Templates',
        'R&D Projects',
        'Living Labs',
        'Strategic Plans'
      ]
    },
    executive: {
      label: 'Executive',
      icon: Target,
      color: 'text-purple-500',
      items: [
        { name: 'ExecutiveDashboard', label: 'Dashboard' },
        { name: 'StrategicPlans', label: 'Strategic Plans' },
        { name: 'Challenges', label: 'Challenges' },
        { name: 'Pilots', label: 'Pilots' },
        { name: 'PipelineHealthDashboard', label: 'Pipeline Health' },
        { name: 'NationalInnovationMap', label: 'Innovation Map' },
        { name: 'Municipalities', label: 'Municipalities' },
        { name: 'ApprovalCenter', label: 'Approvals' },
        { name: 'ReportsBuilder', label: 'Analytics & Reports' }
      ],
      missingCritical: [
        'Strategy Cockpit',
        'OKR Management',
        'Portfolio Management',
        'Executive Brief Generator',
        'Quarterly Review Wizard',
        'Decision Simulator',
        'Predictive Forecasting',
        'Competitive Intelligence',
        'International Benchmarking',
        'Programs Overview',
        'R&D Overview'
      ]
    },
    deputyship: {
      label: 'Deputyship',
      icon: Globe,
      color: 'text-indigo-500',
      items: [
        { name: 'ExecutiveDashboard', label: 'Dashboard' },
        { name: 'NationalInnovationMap', label: 'National Overview' },
        { name: 'Municipalities', label: 'Municipalities' },
        { name: 'Challenges', label: 'Challenges' },
        { name: 'Pilots', label: 'Pilots' },
        { name: 'Solutions', label: 'Solutions' },
        { name: 'Programs', label: 'Programs' },
        { name: 'ApprovalCenter', label: 'Approvals' },
        { name: 'ReportsBuilder', label: 'Analytics' }
      ],
      missingCritical: [
        'Regional Dashboard',
        'Multi-City Orchestration',
        'Cross-City Learning Hub',
        'Strategic Plans',
        'Policy Hub',
        'MII Drill Down',
        'Sector Dashboard'
      ]
    },
    municipality: {
      label: 'Municipality',
      icon: Building2,
      color: 'text-emerald-500',
      items: [
        { name: 'MunicipalityDashboard', label: 'Dashboard' },
        { name: 'MyChallenges', label: 'My Challenges' },
        { name: 'MyPilots', label: 'My Pilots' },
        { name: 'MunicipalProposalInbox', label: 'Proposals' },
        { name: 'Solutions', label: 'Solutions' },
        { name: 'MyApprovals', label: 'Approvals' },
        { name: 'MunicipalityIdeasView', label: 'Citizen Ideas' },
        { name: 'ContractManagement', label: 'Contracts' },
        { name: 'BudgetManagement', label: 'Budget' },
        { name: 'TeamManagement', label: 'Team' },
        { name: 'ReportsBuilder', label: 'Analytics' }
      ],
      missingCritical: [
        'Municipality Profile',
        'MII Score Details',
        'Peer Benchmarking',
        'Challenge Create Wizard',
        'Pilot Create Wizard',
        'Programs',
        'Living Labs',
        'Knowledge Hub'
      ]
    },
    provider: {
      label: 'Provider',
      icon: Briefcase,
      color: 'text-orange-500',
      items: [
        { name: 'StartupDashboard', label: 'Dashboard' },
        { name: 'ProviderPortfolioDashboard', label: 'My Solutions' },
        { name: 'OpportunityFeed', label: 'Opportunities' },
        { name: 'MyChallengeTracker', label: 'Challenge Tracker' },
        { name: 'MyApplications', label: 'Applications' },
        { name: 'MyPilots', label: 'My Pilots' },
        { name: 'ContractManagement', label: 'Contracts' },
        { name: 'MyPartnershipsPage', label: 'Partnerships' },
        { name: 'Programs', label: 'Programs' },
        { name: 'Messaging', label: 'Messages' }
      ],
      missingCritical: [
        'Solution Create Wizard',
        'Company Profile Edit',
        'Team Members',
        'Financials',
        'Knowledge Hub',
        'Network',
        'Events'
      ]
    },
    expert: {
      label: 'Expert',
      icon: GraduationCap,
      color: 'text-amber-500',
      items: [
        { name: 'ExpertDashboard', label: 'Dashboard' },
        { name: 'EvaluationPanel', label: 'Evaluations' },
        { name: 'ExpertAssignmentQueue', label: 'My Assignments' },
        { name: 'PilotEvaluations', label: 'Pilot Reviews' },
        { name: 'ExpertMatchingEngine', label: 'Expert Network' },
        { name: 'Knowledge', label: 'Knowledge Hub' },
        { name: 'MyDeadlines', label: 'Deadlines' },
        { name: 'Messaging', label: 'Messages' }
      ],
      missingCritical: [
        'Expert Profile Edit',
        'Performance Dashboard',
        'Panel Management',
        'Evaluation History',
        'Calendar'
      ]
    },
    researcher: {
      label: 'Researcher',
      icon: Microscope,
      color: 'text-teal-500',
      items: [
        { name: 'ResearcherDashboard', label: 'Dashboard' },
        { name: 'ResearcherWorkspace', label: 'Workspace' },
        { name: 'MyRDProjects', label: 'My Projects' },
        { name: 'RDProjects', label: 'R&D Hub' },
        { name: 'CollaborationHub', label: 'Collaboration' },
        { name: 'Knowledge', label: 'Knowledge Hub' },
        { name: 'MyDeadlines', label: 'Deadlines' },
        { name: 'Messaging', label: 'Messages' }
      ],
      missingCritical: [
        'R&D Calls',
        'Research Outputs Hub',
        'Institution Dashboard',
        'Funding Tracker',
        'Publications'
      ]
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
        { name: 'PublicPilotTracker', label: 'Public Pilots' },
        { name: 'CitizenPilotEnrollment', label: 'Pilot Enrollment' },
        { name: 'CitizenLeaderboard', label: 'Leaderboard' },
        { name: 'CitizenNotifications', label: 'Notifications' }
      ],
      missingCritical: [
        'Feedback History',
        'Rewards/Points',
        'Events',
        'News'
      ]
    },
    user: {
      label: 'Basic User',
      icon: User,
      color: 'text-gray-500',
      items: [
        { name: 'Home', label: 'Dashboard' },
        { name: 'PublicIdeasBoard', label: 'Ideas' },
        { name: 'PublicPilotTracker', label: 'Pilots' },
        { name: 'Solutions', label: 'Solutions' }
      ],
      missingCritical: [
        'Profile',
        'Settings',
        'News',
        'Events'
      ]
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

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">Side by Side</TabsTrigger>
          <TabsTrigger value="old-menu">Old Menu (14 Sections)</TabsTrigger>
          <TabsTrigger value="new-sidebar">New Sidebar (9 Personas)</TabsTrigger>
          <TabsTrigger value="gaps">Missing Items</TabsTrigger>
        </TabsList>

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
