import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import {
  CheckCircle2, XCircle, AlertTriangle, Sparkles, Shield, Users,
  Database, FileText, Activity, Settings, BarChart3, Network, Calendar,
  Microscope, Target, TrendingUp, Bell, MessageSquare, BookOpen, Globe,
  MapPin, TestTube
} from 'lucide-react';

export default function PlatformAudit() {
  const { language, isRTL, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const auditData = [
    {
      category: 'Admin & System',
      icon: Shield,
      color: 'purple',
      items: [
        { feature: 'User Management - List & Search', status: 'complete', page: 'UserManagement' },
        { feature: 'User Role Assignment UI', status: 'missing', priority: 'high', note: 'Currently manual via entity edit' },
        { feature: 'Permission Matrix Configuration', status: 'missing', priority: 'high' },
        { feature: 'Audit Trail - View Logs', status: 'placeholder', page: 'AuditTrail', priority: 'medium' },
        { feature: 'System Settings & Config', status: 'placeholder', page: 'Settings' },
        { feature: 'Taxonomy Management (Sectors, Tags)', status: 'missing', priority: 'high' },
        { feature: 'Email Templates Configuration', status: 'missing', priority: 'medium' },
        { feature: 'Notification Rules Engine', status: 'missing', priority: 'medium' },
        { feature: 'Platform Analytics Dashboard', status: 'partial', note: 'Exists in multiple portals, needs consolidation' },
        { feature: 'Data Backup & Export', status: 'partial', note: 'Has ExportData component but not system-wide' },
        { feature: 'Admin Portal Overview', status: 'complete', page: 'AdminPortal' }
      ]
    },
    {
      category: 'Challenge Management',
      icon: AlertTriangle,
      color: 'red',
      items: [
        { feature: 'Challenge List & Filters', status: 'complete', page: 'Challenges' },
        { feature: 'Challenge Create Wizard', status: 'complete', page: 'ChallengeCreate' },
        { feature: 'Challenge Detail View', status: 'complete', page: 'ChallengeDetail' },
        { feature: 'Challenge Edit', status: 'complete', page: 'ChallengeEdit' },
        { feature: 'My Challenges', status: 'complete', page: 'MyChallenges' },
        { feature: 'Challenge Import (Bulk)', status: 'partial', page: 'ChallengeImport' },
        { feature: 'Challenge Approval Workflow', status: 'complete', note: 'Via MultiStepApproval' },
        { feature: 'Challenge-Solution Matching', status: 'complete', page: 'ChallengeSolutionMatching' },
        { feature: 'Challenge Analytics', status: 'partial', note: 'Basic stats in Challenges page' },
        { feature: 'Challenge Status Transitions', status: 'manual', note: 'Need automated workflow' },
        { feature: 'Challenge Duplication Detection', status: 'missing', priority: 'medium' },
        { feature: 'Challenge Comments & Collaboration', status: 'complete', note: 'ChallengeComment entity + UI' },
        { feature: 'Challenge Attachments', status: 'complete', note: 'ChallengeAttachment entity' },
        { feature: 'Track Assignment (Pilot/R&D)', status: 'complete', note: 'TrackAssignment component' }
      ]
    },
    {
      category: 'Solution Management',
      icon: Target,
      color: 'green',
      items: [
        { feature: 'Solution Registry - List', status: 'complete', page: 'Solutions' },
        { feature: 'Solution Create', status: 'complete', page: 'SolutionCreate' },
        { feature: 'Solution Detail View', status: 'complete', page: 'SolutionDetail' },
        { feature: 'Solution Edit', status: 'complete', page: 'SolutionEdit' },
        { feature: 'Solution Verification Workflow', status: 'partial', page: 'SolutionVerification' },
        { feature: 'Solution-Challenge Matching', status: 'complete', page: 'ChallengeSolutionMatching' },
        { feature: 'Provider Profiles', status: 'partial', note: 'Organization entity exists, detail page basic' },
        { feature: 'Solution Case Studies', status: 'complete', note: 'SolutionCase entity + create page' },
        { feature: 'Solution Ratings & Reviews', status: 'schema-only', priority: 'high', note: 'Fields exist but no UI' },
        { feature: 'Solution Comparison Tool', status: 'missing', priority: 'medium' },
        { feature: 'Solution Deployment Tracking', status: 'schema-only', note: 'deployments array in schema' }
      ]
    },
    {
      category: 'Pilot Management',
      icon: TestTube,
      color: 'blue',
      items: [
        { feature: 'Pilot List & Filters', status: 'complete', page: 'Pilots' },
        { feature: 'My Pilots', status: 'complete', page: 'MyPilots' },
        { feature: 'Pilot Create Wizard (7 steps)', status: 'complete', page: 'PilotCreate' },
        { feature: 'Pilot Detail View', status: 'complete', page: 'PilotDetail' },
        { feature: 'Pilot Edit', status: 'complete', page: 'PilotEdit' },
        { feature: 'Pilot Management Panel', status: 'complete', page: 'PilotManagementPanel' },
        { feature: 'Pilot Workflow Guide', status: 'complete', page: 'PilotWorkflowGuide' },
        { feature: 'Pilot Approval Workflow', status: 'complete', note: 'MultiStepApproval component' },
        { feature: 'Pilot Launch Wizard', status: 'complete', page: 'PilotLaunchWizard' },
        { feature: 'Pilot Monitoring Dashboard', status: 'complete', page: 'PilotMonitoringDashboard' },
        { feature: 'Pilot Evaluations', status: 'complete', page: 'PilotEvaluations' },
        { feature: 'Iteration Workflow', status: 'complete', page: 'IterationWorkflow' },
        { feature: 'Scaling Workflow', status: 'complete', page: 'ScalingWorkflow' },
        { feature: 'KPI Data Entry & Tracking', status: 'complete', note: 'EnhancedKPITracker, KPIDataEntry' },
        { feature: 'Milestone Tracker', status: 'complete', note: 'MilestoneTracker component' },
        { feature: 'Financial Tracker', status: 'complete', note: 'FinancialTracker component' },
        { feature: 'AI Success Predictor', status: 'complete', note: 'AISuccessPredictor component' },
        { feature: 'AI Peer Comparison', status: 'complete', note: 'AIPeerComparison component' },
        { feature: 'Anomaly Detection', status: 'complete', note: 'AnomalyDetector component' },
        { feature: 'Regulatory Compliance', status: 'complete', note: 'RegulatoryCompliance component' },
        { feature: 'Pilot Cloning', status: 'complete', note: 'CloneEntity component' },
        { feature: 'Pilot PDF Export', status: 'complete', note: 'PDFExport component' },
        { feature: 'Pilot Permissions', status: 'complete', note: 'EntityPermissions component' },
        { feature: 'Pilot Comments', status: 'complete', note: 'PilotComment entity + UI' },
        { feature: 'Pilot Hold/Resume', status: 'complete', note: 'In PilotDetail' }
      ]
    },
    {
      category: 'R&D & Innovation',
      icon: Microscope,
      color: 'indigo',
      items: [
        { feature: 'R&D Projects List', status: 'complete', page: 'RDProjects' },
        { feature: 'R&D Project Detail', status: 'complete', page: 'RDProjectDetail' },
        { feature: 'R&D Project Create', status: 'complete', page: 'RDProjectCreate' },
        { feature: 'R&D Project Edit', status: 'complete', page: 'RDProjectEdit' },
        { feature: 'R&D Calls List', status: 'complete', page: 'RDCalls' },
        { feature: 'R&D Call Detail', status: 'complete', page: 'RDCallDetail' },
        { feature: 'R&D Call Create', status: 'complete', page: 'RDCallCreate' },
        { feature: 'R&D Call Edit', status: 'complete', page: 'RDCallEdit' },
        { feature: 'R&D Proposal Wizard', status: 'complete', page: 'ProposalWizard' },
        { feature: 'R&D Proposal Detail', status: 'complete', page: 'RDProposalDetail' },
        { feature: 'Living Labs List', status: 'complete', page: 'LivingLabs' },
        { feature: 'Living Lab Detail', status: 'complete', page: 'LivingLabDetail' },
        { feature: 'Living Lab Create', status: 'complete', page: 'LivingLabCreate' },
        { feature: 'Living Lab Edit', status: 'complete', page: 'LivingLabEdit' },
        { feature: 'Living Lab Resource Booking', status: 'complete', note: 'LivingLabResourceBooking component' },
        { feature: 'TRL Progression Tracker', status: 'schema-only', priority: 'medium', note: 'TRL fields exist in entities' },
        { feature: 'Research Output Repository', status: 'missing', priority: 'medium', note: 'Publications, patents in schema but no dedicated UI' }
      ]
    },
    {
      category: 'Programs & Events',
      icon: Calendar,
      color: 'amber',
      items: [
        { feature: 'Programs List', status: 'complete', page: 'Programs' },
        { feature: 'Program Detail', status: 'complete', page: 'ProgramDetail' },
        { feature: 'Program Create', status: 'complete', page: 'ProgramCreate' },
        { feature: 'Program Edit', status: 'complete', page: 'ProgramEdit' },
        { feature: 'Program Application Wizard', status: 'complete', page: 'ProgramApplicationWizard' },
        { feature: 'Program Application Detail', status: 'complete', page: 'ProgramApplicationDetail' },
        { feature: 'Program Operator Portal', status: 'complete', page: 'ProgramOperatorPortal' },
        { feature: 'Cohort Management', status: 'missing', priority: 'high', note: 'No UI for cohort tracking' },
        { feature: 'Event Calendar Integration', status: 'placeholder', page: 'CalendarView' },
        { feature: 'Program Evaluation & Metrics', status: 'schema-only', priority: 'medium' },
        { feature: 'Mentor Assignment & Tracking', status: 'schema-only', note: 'mentors array in Program schema' },
        { feature: 'Program Curriculum Builder', status: 'missing', priority: 'low' }
      ]
    },
    {
      category: 'Sandbox & Regulatory',
      icon: Shield,
      color: 'cyan',
      items: [
        { feature: 'Sandboxes List', status: 'complete', page: 'Sandboxes' },
        { feature: 'Sandbox Detail', status: 'complete', page: 'SandboxDetail' },
        { feature: 'Sandbox Create', status: 'complete', page: 'SandboxCreate' },
        { feature: 'Sandbox Edit', status: 'complete', page: 'SandboxEdit' },
        { feature: 'Sandbox Application Wizard', status: 'complete', note: 'SandboxApplicationWizard component' },
        { feature: 'Sandbox Application Detail', status: 'complete', page: 'SandboxApplicationDetail' },
        { feature: 'Sandbox Approval', status: 'complete', page: 'SandboxApproval' },
        { feature: 'Sandbox Reporting', status: 'complete', page: 'SandboxReporting' },
        { feature: 'Sandbox Monitoring Dashboard', status: 'complete', note: 'SandboxMonitoringDashboard component' },
        { feature: 'Sandbox Capacity Manager', status: 'complete', note: 'SandboxCapacityManager component' },
        { feature: 'Incident Reporting', status: 'complete', note: 'IncidentReportForm component' },
        { feature: 'Regulatory Exemptions Library', status: 'complete', page: 'RegulatoryLibrary' },
        { feature: 'Exemption Detail View', status: 'complete', page: 'RegulatoryExemptionDetail' },
        { feature: 'AI Risk Assessment', status: 'complete', note: 'SandboxAIRiskAssessment component' },
        { feature: 'AI Safety Protocol Generator', status: 'complete', note: 'AISafetyProtocolGenerator component' },
        { feature: 'AI Exemption Suggester', status: 'complete', note: 'AIExemptionSuggester component' },
        { feature: 'Automated Compliance Checker', status: 'complete', note: 'AutomatedComplianceChecker component' },
        { feature: 'Sandbox Zone Map Visualization', status: 'missing', priority: 'medium' }
      ]
    },
    {
      category: 'Analytics & Insights',
      icon: BarChart3,
      color: 'blue',
      items: [
        { feature: 'Executive Dashboard', status: 'complete', page: 'ExecutiveDashboard' },
        { feature: 'Strategy Cockpit', status: 'complete', page: 'StrategyCockpit' },
        { feature: 'Portfolio View', status: 'complete', page: 'Portfolio' },
        { feature: 'Sector Dashboard', status: 'complete', page: 'SectorDashboard' },
        { feature: 'MII (Innovation Index)', status: 'complete', page: 'MII' },
        { feature: 'Trends Dashboard', status: 'complete', page: 'Trends' },
        { feature: 'Predictive Analytics', status: 'complete', page: 'PredictiveAnalytics' },
        { feature: 'Predictive Insights', status: 'complete', page: 'PredictiveInsights' },
        { feature: 'Advanced Search', status: 'complete', page: 'AdvancedSearch' },
        { feature: 'Reports Builder', status: 'complete', page: 'ReportsBuilder' },
        { feature: 'Progress Report', status: 'complete', page: 'ProgressReport' },
        { feature: 'Real-time Alerts Engine', status: 'partial', note: 'DeadlineAlerts component exists' },
        { feature: 'Custom Dashboard Builder', status: 'missing', priority: 'low' },
        { feature: 'Export to BI Tools', status: 'missing', priority: 'low' }
      ]
    },
    {
      category: 'Knowledge & Resources',
      icon: BookOpen,
      color: 'teal',
      items: [
        { feature: 'Knowledge Base', status: 'complete', page: 'Knowledge' },
        { feature: 'Knowledge Document Create', status: 'complete', page: 'KnowledgeDocumentCreate' },
        { feature: 'Knowledge Document Edit', status: 'complete', page: 'KnowledgeDocumentEdit' },
        { feature: 'Knowledge Graph Visualization', status: 'complete', page: 'KnowledgeGraph' },
        { feature: 'Platform Documentation', status: 'complete', page: 'PlatformDocs' },
        { feature: 'Case Studies', status: 'complete', note: 'CaseStudyCreate, CaseStudyEdit pages' },
        { feature: 'Template Library', status: 'complete', note: 'TemplateLibrary component' },
        { feature: 'File Library', status: 'complete', page: 'FileLibrary' },
        { feature: 'Version History', status: 'complete', page: 'VersionHistory' },
        { feature: 'Training Materials Portal', status: 'missing', priority: 'medium' },
        { feature: 'Best Practices Repository', status: 'missing', priority: 'low' }
      ]
    },
    {
      category: 'Collaboration & Network',
      icon: Network,
      color: 'pink',
      items: [
        { feature: 'Network/Partners Directory', status: 'complete', page: 'Network' },
        { feature: 'Organization Detail', status: 'complete', page: 'OrganizationDetail' },
        { feature: 'Organization Create', status: 'complete', page: 'OrganizationCreate' },
        { feature: 'Organization Edit', status: 'complete', page: 'OrganizationEdit' },
        { feature: 'Task Management', status: 'complete', page: 'TaskManagement' },
        { feature: 'Messaging', status: 'complete', page: 'Messaging' },
        { feature: 'Notification Center', status: 'complete', page: 'NotificationCenter' },
        { feature: 'Opportunity Feed', status: 'complete', page: 'OpportunityFeed' },
        { feature: 'Activity Feed', status: 'complete', note: 'ActivityFeed component' },
        { feature: 'Collaborative Editing', status: 'complete', note: 'CollaborativeEditing component' },
        { feature: 'Network Graph Visualization', status: 'complete', note: 'NetworkGraph component' },
        { feature: 'Partnership Agreements Tracking', status: 'missing', priority: 'medium' },
        { feature: 'Video Conferencing Integration', status: 'missing', priority: 'low' },
        { feature: 'Shared Workspace/Documents', status: 'missing', priority: 'low' }
      ]
    },
    {
      category: 'Portals & Dashboards',
      icon: Globe,
      color: 'violet',
      items: [
        { feature: 'Home Dashboard', status: 'complete', page: 'Home' },
        { feature: 'Executive Dashboard', status: 'complete', page: 'ExecutiveDashboard' },
        { feature: 'Admin Portal', status: 'complete', page: 'AdminPortal' },
        { feature: 'Municipality Dashboard', status: 'complete', page: 'MunicipalityDashboard' },
        { feature: 'Startup Dashboard', status: 'complete', page: 'StartupDashboard' },
        { feature: 'Academia Dashboard', status: 'complete', page: 'AcademiaDashboard' },
        { feature: 'Program Operator Portal', status: 'complete', page: 'ProgramOperatorPortal' },
        { feature: 'Public Portal', status: 'basic', page: 'PublicPortal', note: 'Basic structure only' },
        { feature: 'Portal Switcher', status: 'complete', page: 'PortalSwitcher' },
        { feature: 'Municipality Profile Pages', status: 'complete', page: 'MunicipalityProfile' },
        { feature: 'Regional Dashboards', status: 'missing', priority: 'medium', note: 'Region entity exists' },
        { feature: 'Sector-Specific Landing Pages', status: 'missing', priority: 'low' }
      ]
    },
    {
      category: 'Location & Geography',
      icon: MapPin,
      color: 'rose',
      items: [
        { feature: 'Municipality CRUD', status: 'complete', note: 'Create, Edit pages exist' },
        { feature: 'Region Entity', status: 'complete', note: 'Entity exists' },
        { feature: 'City Entity', status: 'complete', note: 'Entity exists' },
        { feature: 'National Map Visualization', status: 'complete', note: 'NationalMap component' },
        { feature: 'Region Management UI', status: 'missing', priority: 'high' },
        { feature: 'City Management UI', status: 'missing', priority: 'high' },
        { feature: 'Geographic Analytics', status: 'partial', note: 'In various dashboards' },
        { feature: 'Location-based Filtering', status: 'partial', note: 'Some pages have it' }
      ]
    },
    {
      category: 'AI Features',
      icon: Sparkles,
      color: 'purple',
      items: [
        { feature: 'Global AI Assistant', status: 'complete', note: 'AIAssistant component' },
        { feature: 'AI Form Assistant', status: 'complete', note: 'AIFormAssistant component' },
        { feature: 'AI Success Predictor', status: 'complete', note: 'For pilots' },
        { feature: 'AI Peer Comparison', status: 'complete', note: 'For pilots' },
        { feature: 'AI Challenge Enhancement', status: 'complete', note: 'In ChallengeCreate, ChallengeEdit' },
        { feature: 'AI Pilot Design Suggestions', status: 'complete', note: 'In PilotCreate' },
        { feature: 'AI Solution Matching', status: 'complete', page: 'ChallengeSolutionMatching' },
        { feature: 'AI Evaluation Generation', status: 'complete', note: 'In PilotEvaluations' },
        { feature: 'AI Risk Assessment', status: 'complete', note: 'Multiple components' },
        { feature: 'AI Content Generation', status: 'complete', note: 'Across create/edit pages' },
        { feature: 'AI Anomaly Detection', status: 'complete', note: 'AnomalyDetector component' },
        { feature: 'AI Strategic Insights', status: 'complete', note: 'In ChallengeDetail, dashboards' },
        { feature: 'AI Capacity Predictor', status: 'complete', note: 'AICapacityPredictor for sandboxes' },
        { feature: 'Semantic Search', status: 'complete', note: 'SemanticSearch component' },
        { feature: 'Natural Language Query', status: 'missing', priority: 'medium' },
        { feature: 'AI Report Writing', status: 'missing', priority: 'low' }
      ]
    },
    {
      category: 'Workflow & Automation',
      icon: Activity,
      color: 'orange',
      items: [
        { feature: 'Multi-Step Approvals', status: 'complete', note: 'MultiStepApproval component' },
        { feature: 'Status Workflow', status: 'complete', note: 'StatusWorkflow, WorkflowStatus components' },
        { feature: 'Progress Tracker', status: 'complete', note: 'ProgressTracker component' },
        { feature: 'Deadline Alerts', status: 'complete', note: 'DeadlineAlerts component' },
        { feature: 'Auto Notifications', status: 'complete', note: 'AutoNotification component' },
        { feature: 'Evaluation Panel', status: 'complete', page: 'EvaluationPanel' },
        { feature: 'Bulk Actions', status: 'complete', note: 'BulkActions component' },
        { feature: 'Bulk Import', status: 'complete', page: 'BulkImport' },
        { feature: 'Automated Stage Transitions', status: 'partial', priority: 'medium', note: 'Some manual triggers needed' },
        { feature: 'Email Automation', status: 'partial', priority: 'medium', note: 'SendEmail integration exists' },
        { feature: 'Scheduled Tasks/Reminders', status: 'missing', priority: 'medium' },
        { feature: 'SLA Monitoring', status: 'missing', priority: 'low' }
      ]
    }
  ];

  const allItems = auditData.flatMap(cat => 
    cat.items.map(item => ({ ...item, category: cat.category, categoryColor: cat.color }))
  );

  const getFilteredItems = () => {
    if (selectedCategory === 'all') return allItems;
    if (selectedCategory === 'missing') return allItems.filter(i => i.status === 'missing');
    if (selectedCategory === 'partial') return allItems.filter(i => ['partial', 'placeholder', 'schema-only'].includes(i.status));
    return allItems.filter(i => i.category === selectedCategory);
  };

  const statusConfig = {
    complete: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: { en: 'Complete', ar: 'مكتمل' } },
    partial: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: { en: 'Partial', ar: 'جزئي' } },
    placeholder: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', label: { en: 'Placeholder', ar: 'مكان احتياطي' } },
    'schema-only': { icon: AlertTriangle, color: 'text-blue-600', bg: 'bg-blue-100', label: { en: 'Schema Only', ar: 'مخطط فقط' } },
    missing: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: { en: 'Missing', ar: 'مفقود' } },
    manual: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', label: { en: 'Manual', ar: 'يدوي' } }
  };

  const stats = {
    total: allItems.length,
    complete: allItems.filter(i => i.status === 'complete').length,
    partial: allItems.filter(i => ['partial', 'placeholder', 'schema-only', 'manual'].includes(i.status)).length,
    missing: allItems.filter(i => i.status === 'missing').length
  };

  const completionRate = Math.round((stats.complete / stats.total) * 100);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'Platform Audit & Gap Analysis', ar: 'تدقيق المنصة وتحليل الفجوات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Comprehensive review of all platform features and components', ar: 'مراجعة شاملة لجميع ميزات ومكونات المنصة' })}
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline" className="bg-white/20 text-white border-white/40 text-lg px-4 py-2">
            {completionRate}% {t({ en: 'Complete', ar: 'مكتمل' })}
          </Badge>
          <Badge variant="outline" className="bg-white/20 text-white border-white/40 text-lg px-4 py-2">
            {stats.total} {t({ en: 'Total Features', ar: 'إجمالي الميزات' })}
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Complete', ar: 'مكتمل' })}</p>
                <p className="text-4xl font-bold text-green-600">{stats.complete}</p>
                <p className="text-xs text-green-600 mt-1">{Math.round((stats.complete / stats.total) * 100)}%</p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Partial/Needs Work', ar: 'جزئي/يحتاج عمل' })}</p>
                <p className="text-4xl font-bold text-yellow-600">{stats.partial}</p>
                <p className="text-xs text-yellow-600 mt-1">{Math.round((stats.partial / stats.total) * 100)}%</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Missing', ar: 'مفقود' })}</p>
                <p className="text-4xl font-bold text-red-600">{stats.missing}</p>
                <p className="text-xs text-red-600 mt-1">{Math.round((stats.missing / stats.total) * 100)}%</p>
              </div>
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Features', ar: 'إجمالي الميزات' })}</p>
                <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-xs text-blue-600 mt-1">Audited</p>
              </div>
              <BarChart3 className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              {t({ en: 'All Features', ar: 'كل الميزات' })} ({allItems.length})
            </Button>
            <Button
              variant={selectedCategory === 'missing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('missing')}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              {t({ en: 'Missing Only', ar: 'المفقود فقط' })} ({stats.missing})
            </Button>
            <Button
              variant={selectedCategory === 'partial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('partial')}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              {t({ en: 'Partial Only', ar: 'الجزئي فقط' })} ({stats.partial})
            </Button>
            {auditData.map(cat => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.category}
                  variant={selectedCategory === cat.category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  <Icon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {cat.category}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCategory === 'all' && t({ en: 'All Platform Features', ar: 'جميع ميزات المنصة' })}
            {selectedCategory === 'missing' && t({ en: 'Missing Features', ar: 'الميزات المفقودة' })}
            {selectedCategory === 'partial' && t({ en: 'Partial/Incomplete Features', ar: 'الميزات الجزئية/غير المكتملة' })}
            {!['all', 'missing', 'partial'].includes(selectedCategory) && selectedCategory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getFilteredItems().map((item, idx) => {
              const config = statusConfig[item.status] || statusConfig.missing;
              const StatusIcon = config.icon;
              
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-${isRTL ? 'r' : 'l'}-4 border-${isRTL ? 'r' : 'l'}-${item.categoryColor}-500 bg-${item.categoryColor}-50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                        <p className="font-semibold text-slate-900">{item.feature}</p>
                        {item.priority && (
                          <Badge className={
                            item.priority === 'high' ? 'bg-red-600 text-white' :
                            item.priority === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-slate-400 text-white'
                          }>
                            {item.priority} priority
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        <Badge className={`${config.bg} ${config.color} text-xs`}>
                          {config.label[language]}
                        </Badge>
                        {item.page && (
                          <Badge variant="outline" className="text-xs font-mono">{item.page}</Badge>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-sm text-slate-600 mt-2 italic">{item.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* High Priority Gaps */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="h-5 w-5" />
            {t({ en: 'High Priority Gaps', ar: 'الفجوات ذات الأولوية العالية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allItems.filter(i => i.priority === 'high').map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border-l-4 border-red-500">
                <p className="font-medium text-slate-900">{item.feature}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  <Badge className="bg-red-100 text-red-700 text-xs">{item.status}</Badge>
                </div>
                {item.note && <p className="text-xs text-slate-600 mt-2">{item.note}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {t({ en: 'Recommendations', ar: 'التوصيات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">
                🎯 {t({ en: 'Immediate Actions', ar: 'إجراءات فورية' })}
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Build User Role Assignment UI (critical for approval workflow)</li>
                <li>• Add Region & City Management pages (entities exist but no UI)</li>
                <li>• Create Taxonomy Management (sectors, subsectors, tags)</li>
                <li>• Implement Solution Ratings & Reviews UI</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <p className="font-semibold text-purple-900 mb-2">
                ⚡ {t({ en: 'Quick Wins', ar: 'انتصارات سريعة' })}
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Enhance PublicPortal with more content</li>
                <li>• Add TRL Progression Tracker visualization</li>
                <li>• Build Cohort Management for Programs</li>
                <li>• Implement automated stage transitions</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <p className="font-semibold text-green-900 mb-2">
                🚀 {t({ en: 'Future Enhancements', ar: 'تحسينات مستقبلية' })}
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Natural Language Query interface</li>
                <li>• Partnership Agreements Tracking</li>
                <li>• Training Materials Portal</li>
                <li>• Custom Dashboard Builder</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}