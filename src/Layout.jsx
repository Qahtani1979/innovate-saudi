import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from "@/components/ui/button";
import {
  Server,
  LayoutDashboard,
  AlertCircle,
  Lightbulb,
  TestTube,
  Microscope,
  Calendar,
  TrendingUp,
  Network,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Globe,
  User,
  LogOut,
  Sparkles,
  Target,
  Shield,
  Megaphone,
  Users,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  FileText,
  MapPin,
  Building2,
  Activity,
  Upload,
  MessageSquare,
  History,
  Beaker,
  Rocket,
  RefreshCw,
  Award,
  Tags,
  Monitor,
  Palette,
  Plug,
  Database,
  Mail,
  Flag,
  Handshake,
  Presentation,
  Clock,
  Zap,
  Map,
  Brain,
  UserPlus,
  Layers,
  Eye,
  Edit,
  ArrowRight,
  Layout as LayoutIcon
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import ArabicFontOptimizer from './components/ui/ArabicFontOptimizer';
import AIAssistant from './components/AIAssistant';
import PortalSwitcher from './components/layout/PortalSwitcher';
import PersonaHeader from './components/layout/PersonaHeader';
import { Badge } from "@/components/ui/badge";
import { usePermissions } from './components/permissions/usePermissions';
import { usePersonaRouting } from '@/hooks/usePersonaRouting';
import { useAuth } from '@/lib/AuthContext';
import OnboardingWizard from './components/onboarding/OnboardingWizard';

function LayoutContent({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { language, isRTL, toggleLanguage } = useLanguage();
  const { user, hasPermission, hasAnyPermission, isAdmin, isDeputyship, isMunicipality } = usePermissions();
  const { persona, menuVisibility, defaultDashboard } = usePersonaRouting();
  const { isAuthenticated, userProfile, checkAuth, logout } = useAuth();

  // Show onboarding wizard for new users who haven't completed it
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      if (userProfile.onboarding_completed === true) {
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, userProfile]);

  const toggleSection = (idx) => {
    setCollapsedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setSearchOpen(true);
    try {
      const [challenges, pilots, solutions, programs] = await Promise.all([
        base44.entities.Challenge.filter({ title_en: { $regex: query, $options: 'i' } }, '-created_date', 3),
        base44.entities.Pilot.filter({ title_en: { $regex: query, $options: 'i' } }, '-created_date', 3),
        base44.entities.Solution.filter({ name_en: { $regex: query, $options: 'i' } }, '-created_date', 3),
        base44.entities.Program.filter({ name_en: { $regex: query, $options: 'i' } }, '-created_date', 2)
      ]);

      setSearchResults([
        ...challenges.map(c => ({ type: 'Challenge', name: c.title_en || c.title_ar, id: c.id, page: 'ChallengeDetail' })),
        ...pilots.map(p => ({ type: 'Pilot', name: p.title_en || p.title_ar, id: p.id, page: 'PilotDetail' })),
        ...solutions.map(s => ({ type: 'Solution', name: s.name_en || s.name_ar, id: s.id, page: 'SolutionDetail' })),
        ...programs.map(p => ({ type: 'Program', name: p.name_en || p.name_ar, id: p.id, page: 'ProgramDetail' }))
      ]);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const navigationSections = [
    {
      title: { en: '🔧 Development & Coverage Reports', ar: '🔧 تقارير التطوير والتغطية' },
      requireAdmin: true,
      isCollapsible: true,
      subsections: [
        {
          title: { en: '📊 Coverage Reports', ar: '📊 تقارير التغطية' },
          items: [
            { name: 'ModuleCoverageHub', icon: LayoutIcon, label: { en: '📊 All Modules', ar: '📊 جميع الوحدات' } },
            { name: 'ComprehensiveReportAudit', icon: Target, label: { en: '🔍 Coverage Hub', ar: '🔍 مركز التغطية' } },
            { name: 'Priority6MasterAudit', icon: Target, label: { en: '🎯 Priority 6', ar: '🎯 الأولوية 6' } },
          ]
        },
        {
          title: { en: '🔍 Validation & Audit', ar: '🔍 التحقق والتدقيق' },
          items: [
            { name: 'PlatformCoverageAudit', icon: CheckCircle, label: { en: 'Platform Audit', ar: 'تدقيق المنصة' } },
            { name: 'BilingualRTLAudit', icon: Globe, label: { en: 'Bilingual Audit', ar: 'تدقيق ثنائي اللغة' } },
            { name: 'ContentAudit', icon: FileText, label: { en: 'Content Audit', ar: 'تدقيق المحتوى' } },
            { name: 'MobileResponsivenessAudit', icon: Monitor, label: { en: 'Mobile Audit', ar: 'تدقيق الجوال' } },
          ]
        },
        {
          title: { en: '📈 Progress Tracking', ar: '📈 تتبع التقدم' },
          items: [
            { name: 'GapsImplementationTracker', icon: TrendingUp, label: { en: 'Gaps Progress', ar: 'تقدم الفجوات' } },
            { name: 'EntitiesWorkflowTracker', icon: Database, label: { en: 'Entities Workflow', ar: 'سير عمل الكيانات' } },
            { name: 'UserJourneyValidation', icon: Map, label: { en: 'Journey Validation', ar: 'التحقق من الرحلات' } },
          ]
        },
        {
          title: { en: '🎯 Implementation Plans', ar: '🎯 خطط التنفيذ' },
          items: [
            { name: 'MasterGapsList', icon: AlertCircle, label: { en: 'Master Gaps', ar: 'الفجوات الرئيسية' } },
            { name: 'EnhancementRoadmapMaster', icon: Rocket, label: { en: 'Roadmap', ar: 'الخارطة' } },
            { name: 'FinalImplementationSummary', icon: Award, label: { en: 'Summary', ar: 'الملخص' } },
          ]
        }
      ]
    },
    {
      title: { en: 'Overview', ar: 'نظرة عامة' },
      items: [
        { name: 'Home', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      ]
    },
    {
      title: { en: 'My Work', ar: 'عملي' },
      isCollapsible: true,
      subsections: [
        {
          title: { en: '📋 Personal Workspace', ar: '📋 مساحة العمل الشخصية' },
          items: [
            { name: 'MyWorkloadDashboard', icon: LayoutDashboard, label: { en: 'My Workload', ar: 'عبء عملي' } },
            { name: 'MyApprovals', icon: CheckCircle, label: { en: 'My Approvals Queue', ar: 'قائمة موافقاتي' } },
            { name: 'TaskManagement', icon: CheckCircle, label: { en: 'Tasks', ar: 'المهام' } },
            { name: 'MyDeadlines', icon: Clock, label: { en: 'My Deadlines', ar: 'مواعيدي' } },
          ]
        },
        {
          title: { en: '🎯 My Projects', ar: '🎯 مشاريعي' },
          items: [
            { name: 'MyChallenges', icon: AlertCircle, label: { en: 'My Challenges', ar: 'تحدياتي' } },
            { name: 'MunicipalProposalInbox', icon: FileText, label: { en: 'Proposal Inbox', ar: 'صندوق المقترحات' } },
            { name: 'MyPilots', icon: TestTube, label: { en: 'My Pilots', ar: 'تجاربي' } },
            { name: 'MyRDProjects', icon: Microscope, label: { en: 'My R&D Projects', ar: 'مشاريع بحثي' } },
            { name: 'ResearcherWorkspace', icon: Beaker, label: { en: 'Research Workspace', ar: 'مساحة البحث' } },
            { name: 'MyPrograms', icon: Calendar, label: { en: 'My Programs', ar: 'برامجي' } },
          ]
        },
        {
          title: { en: '📊 My Analytics', ar: '📊 تحليلاتي' },
          items: [
            { name: 'MyPerformance', icon: TrendingUp, label: { en: 'My Performance', ar: 'أدائي' } },
            { name: 'MyDelegation', icon: Users, label: { en: 'My Delegation', ar: 'تفويضي' } },
            { name: 'MyLearning', icon: BookOpen, label: { en: 'My Learning', ar: 'تعلمي' } },
          ]
        },
        {
          title: { en: '🤝 My Network', ar: '🤝 شبكتي' },
          items: [
            { name: 'ParticipantDashboard', icon: Users, label: { en: 'My Program', ar: 'برنامجي' } },
            { name: 'MyApplications', icon: FileText, label: { en: 'My Applications', ar: 'طلباتي' } },
            { name: 'MyPartnershipsPage', icon: Handshake, label: { en: 'My Partnerships', ar: 'شراكاتي' } },
            { name: 'OpportunityFeed', icon: Sparkles, label: { en: 'Opportunities', ar: 'الفرص' } },
            { name: 'ProviderPortfolioDashboard', icon: Lightbulb, label: { en: 'My Solutions Portfolio', ar: 'محفظة حلولي' } },
            { name: 'MyChallengeTracker', icon: Activity, label: { en: 'My Challenge Progress', ar: 'تقدم تحدياتي' } },
            { name: 'Messaging', icon: MessageSquare, label: { en: 'Messages', ar: 'الرسائل' } },
            { name: 'ProviderNotificationPreferences', icon: Bell, label: { en: 'Challenge Alerts', ar: 'تنبيهات التحديات' } },
            ]
            },
        {
          title: { en: '💡 Citizen Engagement', ar: '💡 مشاركة المواطنين' },
          items: [
            { name: 'PublicIdeaSubmission', icon: Lightbulb, label: { en: 'Submit Idea', ar: 'إرسال فكرة' } },
            { name: 'PublicIdeasBoard', icon: Lightbulb, label: { en: 'Ideas Board', ar: 'لوحة الأفكار' } },
            { name: 'PublicPilotTracker', icon: TestTube, label: { en: 'Public Pilots', ar: 'التجارب العامة' } },
            { name: 'IdeasManagement', icon: CheckCircle2, label: { en: 'Manage Ideas', ar: 'إدارة الأفكار' }, requireAdmin: true },
            { name: 'IdeasAnalytics', icon: TrendingUp, label: { en: 'Ideas Analytics', ar: 'تحليلات الأفكار' }, requireAdmin: true },
            { name: 'CitizenDashboard', icon: User, label: { en: 'My Dashboard', ar: 'لوحتي' } },
            { name: 'CitizenLeaderboard', icon: Award, label: { en: 'Top Contributors', ar: 'أفضل المساهمين' } },
            { name: 'MunicipalityIdeasView', icon: Building2, label: { en: 'My Municipality Ideas', ar: 'أفكار بلديتي' } },
            { name: 'IdeaEvaluationQueue', icon: CheckCircle2, label: { en: 'Evaluate Ideas', ar: 'تقييم الأفكار' }, requireAdmin: true },
            { name: 'ProgramIdeaSubmission', icon: Lightbulb, label: { en: 'Submit to Program', ar: 'تقديم للبرنامج' } },
            { name: 'ChallengeIdeaResponse', icon: Target, label: { en: 'Respond to Challenge', ar: 'رد على التحدي' } },
            { name: 'InnovationProposalsManagement', icon: FileText, label: { en: 'Manage Proposals', ar: 'إدارة المقترحات' }, requireAdmin: true },
          ]
        }
      ]
    },
    {
      title: { en: 'Innovation Pipeline', ar: 'خط الابتكار' },
      isCollapsible: true,
      subsections: [
        {
          title: { en: '📊 Pipeline Control', ar: '📊 التحكم بالخط' },
          items: [
            { name: 'PipelineHealthDashboard', icon: Activity, label: { en: 'Pipeline Health', ar: 'صحة الخط' }, requiredPermissions: ['challenge_view_all', 'pilot_view_all'] },
            { name: 'FlowVisualizer', icon: TrendingUp, label: { en: 'Flow Visualizer', ar: 'مصور التدفق' }, requiredPermissions: ['challenge_view_all', 'pilot_view_all'] },
            { name: 'VelocityAnalytics', icon: Zap, label: { en: 'Velocity Analytics', ar: 'تحليلات السرعة' }, requireAdmin: true },
            { name: 'CommandCenter', icon: Target, label: { en: 'Command Center', ar: 'مركز القيادة' }, requireAdmin: true },
            { name: 'FailureAnalysisDashboard', icon: AlertCircle, label: { en: 'Failure Analysis', ar: 'تحليل الفشل' }, requireAdmin: true },
            { name: 'PilotSuccessPatterns', icon: Award, label: { en: 'Success Patterns', ar: 'أنماط النجاح' }, requiredPermissions: ['pilot_view_all'] },
            { name: 'CrossCityLearningHub', icon: Users, label: { en: 'Cross-City Learning', ar: 'التعلم بين المدن' }, requiredPermissions: ['pilot_view_all'] },
            { name: 'MultiCityOrchestration', icon: Building2, label: { en: 'Multi-City Coordination', ar: 'التنسيق متعدد المدن' }, requireAdmin: true },
            { name: 'CapacityPlanning', icon: Users, label: { en: 'Capacity Planning', ar: 'تخطيط القدرات' }, requireAdmin: true },
            { name: 'RealTimeIntelligence', icon: Activity, label: { en: 'Real-Time Intelligence', ar: 'الذكاء الفعلي' }, requireAdmin: true },
          ]
        },
        {
          title: { en: '🎯 Discovery & Intake', ar: '🎯 الاكتشاف والإدخال' },
          items: [
            { name: 'Challenges', icon: AlertCircle, label: { en: 'All Challenges', ar: 'جميع التحديات' }, requiredPermissions: ['challenge_view_all'] },
            { name: 'Solutions', icon: Lightbulb, label: { en: 'Solutions', ar: 'الحلول' }, requiredPermissions: ['solution_view_all'] },
            { name: 'SolutionHealthDashboard', icon: Activity, label: { en: 'Solution Analytics', ar: 'تحليلات الحلول' }, requiredPermissions: ['solution_view_all'] },
            { name: 'SolutionComparison', icon: Target, label: { en: 'Compare Solutions', ar: 'مقارنة الحلول' } },
          ]
        },
        {
          title: { en: '🧪 Pilot Execution', ar: '🧪 تنفيذ التجارب' },
          items: [
            { name: 'Pilots', icon: TestTube, label: { en: 'All Pilots', ar: 'جميع التجارب' }, requiredPermissions: ['pilot_view_all'] },
            { name: 'PilotManagementPanel', icon: Target, label: { en: 'Pilot Control Center', ar: 'مركز التحكم بالتجارب' }, requireAdmin: true },
            { name: 'PilotMonitoringDashboard', icon: Activity, label: { en: 'Live Monitoring', ar: 'المراقبة المباشرة' }, requiredPermissions: ['pilot_view_all'] },
            { name: 'PilotWorkflowGuide', icon: BookOpen, label: { en: 'Workflow Guide', ar: 'دليل سير العمل' }, requiredPermissions: ['pilot_view_all'] },
            { name: 'PilotGatesOverview', icon: Shield, label: { en: 'Gates & Workflows', ar: 'البوابات وسير العمل' }, requireAdmin: true },
            { name: 'IterationWorkflow', icon: RefreshCw, label: { en: 'Iterations', ar: 'التحسينات' }, requiredPermissions: ['pilot_update'] },
            { name: 'ConversionHub', icon: ArrowRight, label: { en: 'Conversions', ar: 'التحويلات' }, requireAdmin: true },
          ]
        },
        {
          title: { en: '🔬 Testing Infrastructure', ar: '🔬 بنية الاختبار' },
          items: [
            { name: 'Sandboxes', icon: Shield, label: { en: 'Sandboxes', ar: 'مناطق التجريب' }, requiredPermissions: ['sandbox_view_all'] },
            { name: 'SandboxApproval', icon: Shield, label: { en: 'Sandbox Approval', ar: 'موافقات المناطق' }, requireAdmin: true },
            { name: 'SandboxReporting', icon: BarChart3, label: { en: 'Sandbox Reports', ar: 'تقارير المناطق' }, requireAdmin: true },
            { name: 'LivingLabs', icon: Beaker, label: { en: 'Living Labs', ar: 'المختبرات الحية' }, requiredPermissions: ['livinglab_view_all'] },
          ]
        },
        {
          title: { en: '✅ Approvals & Quality Control', ar: '✅ الموافقات والجودة' },
          items: [
            { name: 'ApprovalCenter', icon: CheckCircle2, label: { en: 'Unified Approval Center', ar: 'مركز الموافقات الموحد' }, requiredPermissions: ['challenge_approve', 'pilot_approve', 'solution_approve'] },
            { name: 'ChallengeReviewQueue', icon: AlertCircle, label: { en: 'Challenge Review Queue', ar: 'قائمة مراجعة التحديات' }, requiredPermissions: ['challenge_approve'] },
            { name: 'MatchingQueue', icon: Sparkles, label: { en: 'AI Matching Queue', ar: 'قائمة المطابقة الذكية' }, requireAdmin: true },
            { name: 'SolutionVerification', icon: Shield, label: { en: 'Solution Verification', ar: 'التحقق من الحلول' }, requiredPermissions: ['solution_approve'] },
            { name: 'PilotEvaluations', icon: CheckCircle, label: { en: 'Pilot Evaluations', ar: 'تقييمات التجارب' }, requiredPermissions: ['pilot_approve', 'expert_evaluate'] },
            { name: 'EvaluationPanel', icon: CheckCircle, label: { en: 'Evaluation Panel', ar: 'لوحة التقييم' }, requiredPermissions: ['expert_evaluate'] },
            { name: 'ChallengeProposalReview', icon: FileText, label: { en: 'Challenge Proposals', ar: 'مقترحات التحديات' }, requiredPermissions: ['challenge_approve'] },
          ]
        },
        {
          title: { en: '📈 Scaling & Deployment', ar: '📈 التوسع والنشر' },
          items: [
            { name: 'ScalingWorkflow', icon: TrendingUp, label: { en: 'Scaling', ar: 'التوسع' }, requiredPermissions: ['pilot_scale'] },
          ]
        }
      ]
    },
    {
      title: { en: 'Programs & R&D', ar: 'البرامج والبحث' },
      isCollapsible: true,
      subsections: [
        {
          title: { en: '🎪 Innovation Programs', ar: '🎪 برامج الابتكار' },
          items: [
            { name: 'Programs', icon: Calendar, label: { en: 'All Programs', ar: 'جميع البرامج' } },
            { name: 'AlumniShowcase', icon: Award, label: { en: 'Alumni Showcase', ar: 'واجهة الخريجين' } },
            { name: 'MentorDashboard', icon: Users, label: { en: 'Mentor Dashboard', ar: 'لوحة الموجه' }, requiredPermissions: ['expert_evaluate'] },
            { name: 'ApplicationReviewHub', icon: CheckCircle, label: { en: 'Application Review Hub', ar: 'مركز مراجعة الطلبات' }, requireAdmin: true },
            { name: 'ProgramROIDashboard', icon: TrendingUp, label: { en: 'ROI Dashboard', ar: 'لوحة عائد الاستثمار' }, requireAdmin: true },
            { name: 'ProgramsControlDashboard', icon: BarChart3, label: { en: 'Portfolio Dashboard', ar: 'لوحة المحفظة' }, requireAdmin: true },
            { name: 'ProgramOutcomesAnalytics', icon: TrendingUp, label: { en: 'Outcomes Analytics', ar: 'تحليلات النتائج' }, requireAdmin: true },
            { name: 'ProgramOperatorPortal', icon: Target, label: { en: 'Operator Console', ar: 'لوحة المشغل' }, requireAdmin: true },
          ]
        },
        {
          title: { en: '🤝 Matchmaker & Partnerships', ar: '🤝 التوفيق والشراكات' },
          items: [
            { name: 'MatchmakerApplications', icon: Users, label: { en: 'Applications', ar: 'الطلبات' } },
            { name: 'MatchmakerSuccessAnalytics', icon: Award, label: { en: 'Success Analytics', ar: 'تحليلات النجاح' }, requireAdmin: true },
            { name: 'MatchmakerJourney', icon: Target, label: { en: 'Journey View', ar: 'عرض الرحلة' } },
          ]
        },
        {
          title: { en: '🔬 Research & Development', ar: '🔬 البحث والتطوير' },
          items: [
            { name: 'RDCalls', icon: Megaphone, label: { en: 'R&D Calls', ar: 'دعوات البحث' } },
            { name: 'RDProjects', icon: Microscope, label: { en: 'R&D Projects', ar: 'مشاريع البحث' } },
            { name: 'RDPortfolioControlDashboard', icon: BarChart3, label: { en: 'R&D Portfolio', ar: 'محفظة البحث' }, requireAdmin: true },
            { name: 'InstitutionRDDashboard', icon: Building2, label: { en: 'Institution Dashboard', ar: 'لوحة المؤسسة' }, requiredPermissions: ['rd_project_view_all'] },
            { name: 'RDProgressTracker', icon: Activity, label: { en: 'Progress Tracker', ar: 'متتبع التقدم' }, requireAdmin: true },
            { name: 'ResearchOutputsHub', icon: BookOpen, label: { en: 'Publications & Outputs', ar: 'المنشورات والمخرجات' }, requireAdmin: true },
            { name: 'IPManagementDashboard', icon: Award, label: { en: 'IP Management', ar: 'إدارة الملكية الفكرية' }, requiredPermissions: ['rd_project_view_all'] },
          ]
        },

      ]
    },
    {
    title: { en: 'Portals', ar: 'البوابات' },
    items: [
      { name: 'ExecutiveDashboard', icon: Target, label: { en: 'Executive Portal', ar: 'بوابة القيادة' }, requireAdmin: true },
      { name: 'ExecutiveStrategicChallengeQueue', icon: Zap, label: { en: 'Strategic Challenges', ar: 'التحديات الاستراتيجية' }, requireAdmin: true },
      { name: 'AdminPortal', icon: Shield, label: { en: 'Admin Portal', ar: 'بوابة الإدارة' }, requireAdmin: true },
      { name: 'StartupVerificationQueue', icon: Shield, label: { en: 'Startup Verification', ar: 'التحقق من الشركات' }, requireAdmin: true },
      { name: 'StartupEcosystemDashboard', icon: Rocket, label: { en: 'Startup Ecosystem', ar: 'نظام الشركات' }, requireAdmin: true },
      { name: 'MunicipalityDashboard', icon: Building2, label: { en: 'Municipality Hub', ar: 'مركز البلدية' } },
      { name: 'StartupDashboard', icon: Lightbulb, label: { en: 'Startup Portal', ar: 'بوابة الشركات' } },
      { name: 'ProviderPortfolioDashboard', icon: Lightbulb, label: { en: 'My Portfolio', ar: 'محفظتي' } },
      { name: 'ProviderLeaderboard', icon: Award, label: { en: 'Provider Leaderboard', ar: 'لوحة المتصدرين' } },
      { name: 'AcademiaDashboard', icon: Microscope, label: { en: 'Academia Portal', ar: 'بوابة الجامعات' } },
      { name: 'ProgramOperatorPortal', icon: Calendar, label: { en: 'Program Operator', ar: 'مشغل البرامج' }, requireAdmin: true },
      { name: 'SandboxOperatorPortal', icon: Shield, label: { en: 'Sandbox Operator', ar: 'مشغل مناطق الاختبار' }, requireAdmin: true },
      { name: 'LivingLabOperatorPortal', icon: Beaker, label: { en: 'Living Lab Operator', ar: 'مشغل المختبرات الحية' }, requireAdmin: true },
      { name: 'PublicPortal', icon: Globe, label: { en: 'Public Portal', ar: 'البوابة العامة' } },
      { name: 'StartupShowcase', icon: Rocket, label: { en: 'Startup Showcase', ar: 'واجهة الشركات' } },
      ]
      },
    {
      title: { en: 'Insights & Resources', ar: 'الرؤى والموارد' },
      items: [
        { name: 'RegionalDashboard', icon: MapPin, label: { en: 'Regional Analytics', ar: 'التحليلات الإقليمية' }, requireAdmin: true },
        { name: 'ServicePerformanceDashboard', icon: Target, label: { en: 'Service Performance', ar: 'أداء الخدمات' }, requiredPermissions: ['challenge_view_all'] },
        { name: 'SectorDashboard', icon: BarChart3, label: { en: 'Sector Analytics', ar: 'تحليلات القطاع' }, requiredPermissions: ['challenge_view_all'] },
        { name: 'Trends', icon: TrendingUp, label: { en: 'Trends', ar: 'الاتجاهات' } },
        { name: 'MII', icon: BarChart3, label: { en: 'Innovation Index', ar: 'مؤشر الابتكار' } },
        { name: 'Network', icon: Users, label: { en: 'Network', ar: 'الشبكة' } },
        { name: 'Knowledge', icon: BookOpen, label: { en: 'Knowledge', ar: 'المعرفة' } },
        { name: 'KnowledgeGraph', icon: Network, label: { en: 'Knowledge Graph', ar: 'مخطط المعرفة' }, requiredPermissions: ['challenge_view_all'] },
        { name: 'PlatformDocs', icon: BookOpen, label: { en: 'Platform Docs', ar: 'توثيق المنصة' } },
        { name: 'ReportsBuilder', icon: FileText, label: { en: 'Reports', ar: 'التقارير' }, requireAdmin: true },
        { name: 'ProgressReport', icon: CheckCircle, label: { en: 'Progress', ar: 'التقدم' }, requireAdmin: true },
      ]
    },
    {
      title: { en: 'Strategy & Management', ar: 'الاستراتيجية والإدارة' },
      isCollapsible: true,
      subsections: [
        {
          title: { en: '🎯 Strategic Planning & OKRs', ar: '🎯 التخطيط الاستراتيجي والأهداف' },
          items: [
            { name: 'StrategyCockpit', icon: Target, label: { en: 'Strategy Cockpit', ar: 'لوحة الاستراتيجية' }, requireAdmin: true },
            { name: 'StrategicPlanBuilder', icon: Target, label: { en: 'Strategic Plan Builder', ar: 'بناء الخطة الاستراتيجية' }, requireAdmin: true },
            { name: 'StrategicInitiativeTracker', icon: CheckCircle, label: { en: 'Initiative Tracker', ar: 'متتبع المبادرات' }, requireAdmin: true },
            { name: 'OKRManagementSystem', icon: Target, label: { en: 'OKR System', ar: 'نظام OKR' }, requireAdmin: true },
            { name: 'AnnualPlanningWizard', icon: Calendar, label: { en: 'Annual Planning', ar: 'التخطيط السنوي' }, requireAdmin: true },
            { name: 'MultiYearRoadmap', icon: Calendar, label: { en: 'Multi-Year Roadmap', ar: 'خارطة متعددة السنوات' }, requireAdmin: true },
          ]
        },
        {
          title: { en: '🚀 Execution & Portfolio', ar: '🚀 التنفيذ والمحفظة' },
          items: [
            { name: 'StrategicExecutionDashboard', icon: Activity, label: { en: 'Execution Dashboard', ar: 'لوحة التنفيذ' }, requireAdmin: true },
            { name: 'InitiativePortfolio', icon: Network, label: { en: 'Initiative Portfolio', ar: 'محفظة المبادرات' }, requireAdmin: true },
            { name: 'Portfolio', icon: Network, label: { en: 'Portfolio View', ar: 'عرض المحفظة' } },
            { name: 'PortfolioRebalancing', icon: TrendingUp, label: { en: 'Portfolio Rebalancing', ar: 'إعادة توازن المحفظة' }, requireAdmin: true },
            { name: 'GapAnalysisTool', icon: Target, label: { en: 'Gap Analysis', ar: 'تحليل الفجوات' }, requireAdmin: true },
            { name: 'BudgetAllocationTool', icon: Target, label: { en: 'Budget Allocation', ar: 'توزيع الميزانية' }, requireAdmin: true },
            { name: 'StrategicKPITracker', icon: BarChart3, label: { en: 'Strategic KPIs', ar: 'المؤشرات الاستراتيجية' }, requireAdmin: true },
          ]
        },
        {
          title: { en: '🤝 Stakeholder & Governance', ar: '🤝 أصحاب المصلحة والحوكمة' },
          items: [
            { name: 'ProgressToGoalsTracker', icon: TrendingUp, label: { en: 'Progress to Goals', ar: 'التقدم نحو الأهداف' }, requireAdmin: true },
            { name: 'CollaborationHub', icon: Users, label: { en: 'Collaboration Hub', ar: 'مركز التعاون' }, requireAdmin: true },
            { name: 'StakeholderAlignmentDashboard', icon: Users, label: { en: 'Stakeholder Alignment', ar: 'توافق أصحاب المصلحة' }, requireAdmin: true },
            { name: 'GovernanceCommitteeManager', icon: Shield, label: { en: 'Governance & Committees', ar: 'الحوكمة واللجان' }, requireAdmin: true },
            { name: 'PartnershipMOUTracker', icon: Handshake, label: { en: 'Partnerships & MOUs', ar: 'الشراكات والاتفاقيات' }, requireAdmin: true },
          ]
        },
        {
          title: { en: '📈 Intelligence & Analytics', ar: '📈 الذكاء والتحليلات' },
          items: [
            { name: 'DecisionSimulator', icon: Sparkles, label: { en: 'Decision Simulator', ar: 'محاكي القرارات' }, requireAdmin: true },
            { name: 'PredictiveForecastingDashboard', icon: TrendingUp, label: { en: 'Forecasting', ar: 'التنبؤ' }, requireAdmin: true },
            { name: 'NetworkIntelligence', icon: Network, label: { en: 'Network Intelligence', ar: 'ذكاء الشبكة' }, requireAdmin: true },
            { name: 'StrategicAdvisorChat', icon: Sparkles, label: { en: 'AI Strategic Advisor', ar: 'المستشار الاستراتيجي' }, requireAdmin: true },
            { name: 'PatternRecognition', icon: TrendingUp, label: { en: 'Pattern Recognition', ar: 'التعرف على الأنماط' }, requireAdmin: true },
            { name: 'TechnologyRoadmap', icon: TrendingUp, label: { en: 'Technology Roadmap', ar: 'خارطة التقنية' }, requireAdmin: true },
            { name: 'RiskPortfolio', icon: AlertCircle, label: { en: 'Risk Portfolio', ar: 'محفظة المخاطر' }, requireAdmin: true },
            { name: 'CompetitiveIntelligenceDashboard', icon: BarChart3, label: { en: 'Competitive Intelligence', ar: 'الذكاء التنافسي' }, requireAdmin: true },
            { name: 'InternationalBenchmarkingSuite', icon: Globe, label: { en: 'International Benchmarking', ar: 'المقارنة الدولية' }, requireAdmin: true },
          ]
        },
        {
          title: { en: '📋 Reporting & Reviews', ar: '📋 التقارير والمراجعات' },
          items: [
            { name: 'ExecutiveBriefGenerator', icon: FileText, label: { en: 'Executive Brief', ar: 'الموجز التنفيذي' }, requireAdmin: true },
            { name: 'QuarterlyReviewWizard', icon: Calendar, label: { en: 'Quarterly Review', ar: 'المراجعة الفصلية' }, requireAdmin: true },
            { name: 'PresentationMode', icon: Presentation, label: { en: 'Presentation Mode', ar: 'وضع العرض' }, requireAdmin: true },
            { name: 'MidYearReviewDashboard', icon: Calendar, label: { en: 'Mid-Year Review', ar: 'المراجعة النصفية' }, requireAdmin: true },
            { name: 'StrategicCommunicationsHub', icon: MessageSquare, label: { en: 'Strategic Communications', ar: 'الاتصالات الاستراتيجية' }, requireAdmin: true },
          ]
        }
      ]
    },
    {
      title: { en: 'System & Admin', ar: 'النظام والإدارة' },
      requireAdmin: true,
      isCollapsible: true,
      subsections: [
        {
          title: { en: '📊 Data Management', ar: '📊 إدارة البيانات' },
          items: [
            { name: 'DataManagementHub', icon: Database, label: { en: 'Data Management Hub', ar: 'مركز إدارة البيانات' } },
            { name: 'RegionManagement', icon: MapPin, label: { en: 'Regions', ar: 'المناطق' } },
            { name: 'CityManagement', icon: Building2, label: { en: 'Cities', ar: 'المدن' } },
            { name: 'Organizations', icon: Building2, label: { en: 'Organizations', ar: 'المنظمات' } },
            { name: 'DataQualityDashboard', icon: Database, label: { en: 'Data Quality', ar: 'جودة البيانات' } },
            { name: 'BulkDataOperations', icon: Database, label: { en: 'Bulk Operations', ar: 'عمليات جماعية' } },
            { name: 'DataImportExportManager', icon: Upload, label: { en: 'Import/Export', ar: 'استيراد/تصدير' } },
            { name: 'ValidationRulesEngine', icon: Shield, label: { en: 'Validation Rules', ar: 'قواعد التحقق' } },
            { name: 'MasterDataGovernance', icon: Database, label: { en: 'Data Governance', ar: 'حوكمة البيانات' } },
            { name: 'EvaluationTemplateManager', icon: Award, label: { en: 'Evaluation Templates', ar: 'قوالب التقييم' } },
          ]
        },
        {
          title: { en: '👥 User & Access', ar: '👥 المستخدمون والوصول' },
          items: [
            { name: 'UserManagementHub', icon: Users, label: { en: 'User Management Hub', ar: 'مركز إدارة المستخدمين' } },
            { name: 'RBACHub', icon: Shield, label: { en: 'RBAC Management Hub', ar: 'مركز إدارة الصلاحيات' } },
            { name: 'RolePermissionManager', icon: Shield, label: { en: 'Roles & Permissions', ar: 'الأدوار والصلاحيات' } },
            { name: 'RoleRequestCenter', icon: UserPlus, label: { en: 'Role Requests', ar: 'طلبات الأدوار' } },
            { name: 'RoleRequestApprovalQueue', icon: CheckCircle, label: { en: 'Approve Roles', ar: 'الموافقة على الأدوار' }, requireAdmin: true },
            { name: 'UserActivityDashboard', icon: Activity, label: { en: 'User Analytics', ar: 'تحليلات المستخدمين' } },
            { name: 'SessionDeviceManager', icon: Monitor, label: { en: 'Sessions & Devices', ar: 'الجلسات والأجهزة' } },
            { name: 'FeatureUsageHeatmap', icon: Activity, label: { en: 'Feature Usage Heatmap', ar: 'خريطة استخدام الميزات' } },
            ]
            },
        {
          title: { en: '🎓 Expert Management', ar: '🎓 إدارة الخبراء' },
          items: [
            { name: 'ExpertRegistry', icon: Award, label: { en: 'Expert Registry', ar: 'سجل الخبراء' } },
            { name: 'ExpertMatchingEngine', icon: Sparkles, label: { en: 'Expert Matching', ar: 'مطابقة الخبراء' }, requireAdmin: true },
            { name: 'ExpertPerformanceDashboard', icon: TrendingUp, label: { en: 'Expert Performance', ar: 'أداء الخبراء' }, requireAdmin: true },
            { name: 'ExpertPanelManagement', icon: Users, label: { en: 'Expert Panels', ar: 'لجان الخبراء' }, requireAdmin: true },
            { name: 'ExpertAssignmentQueue', icon: Target, label: { en: 'My Expert Assignments', ar: 'مهامي كخبير' } },
            { name: 'ExpertOnboarding', icon: UserPlus, label: { en: 'Become an Expert', ar: 'كن خبيراً' } },
            { name: 'EvaluationAnalyticsDashboard', icon: BarChart3, label: { en: 'Evaluation Analytics', ar: 'تحليلات التقييم' }, requireAdmin: true },
          ]
        },
        {
          title: { en: '🎨 Content & Branding', ar: '🎨 المحتوى والعلامة التجارية' },
          items: [
            { name: 'MediaLibrary', icon: FileText, label: { en: 'Media Library', ar: 'مكتبة الوسائط' } },
            { name: 'EmailTemplateEditor', icon: Mail, label: { en: 'Email Templates', ar: 'قوالب البريد' } },
            { name: 'BrandingSettings', icon: Palette, label: { en: 'Branding', ar: 'العلامة التجارية' } },
            { name: 'AnnouncementSystem', icon: Megaphone, label: { en: 'Announcements', ar: 'الإعلانات' } },
            { name: 'TemplateLibraryManager', icon: FileText, label: { en: 'Template Library', ar: 'مكتبة القوالب' } },
            { name: 'DocumentVersionControl', icon: History, label: { en: 'Version Control', ar: 'التحكم بالإصدارات' } },
          ]
        },
        {
          title: { en: '⚙️ Platform Configuration', ar: '⚙️ تكوين المنصة' },
          items: [
            { name: 'TaxonomyBuilder', icon: Tags, label: { en: 'Taxonomy Builder', ar: 'بناء التصنيف' } },
            { name: 'ServiceCatalog', icon: FileText, label: { en: 'Service Catalog', ar: 'كتالوج الخدمات' } },
            { name: 'SystemDefaultsConfig', icon: Settings, label: { en: 'System Defaults', ar: 'الافتراضات' } },
            { name: 'FeatureFlagsDashboard', icon: Flag, label: { en: 'Feature Flags', ar: 'أعلام الميزات' } },
            { name: 'WorkflowDesigner', icon: Settings, label: { en: 'Workflow Designer', ar: 'مصمم سير العمل' } },
            { name: 'IntegrationManager', icon: Plug, label: { en: 'Integrations', ar: 'التكاملات' } },
            { name: 'CampaignPlanner', icon: Megaphone, label: { en: 'Campaign Planner', ar: 'مخطط الحملات' } },
            { name: 'SandboxLabCapacityPlanner', icon: Beaker, label: { en: 'Lab Capacity', ar: 'سعة المختبرات' } },
          ]
        },
        {
          title: { en: '🔒 Security & Compliance', ar: '🔒 الأمان والامتثال' },
          items: [
            { name: 'SecurityPolicyManager', icon: Shield, label: { en: 'Security Policies', ar: 'سياسات الأمان' } },
            { name: 'DataRetentionConfig', icon: Database, label: { en: 'Data Retention', ar: 'الاحتفاظ بالبيانات' } },
            { name: 'PlatformAudit', icon: Shield, label: { en: 'Platform Audit', ar: 'تدقيق المنصة' } },
            { name: 'InfrastructureRoadmap', icon: Server, label: { en: 'Infrastructure Roadmap', ar: 'خارطة البنية التحتية' } },
            { name: 'RLSImplementationSpec', icon: Database, label: { en: 'Data Access Rules', ar: 'قواعد الوصول للبيانات' } },
            { name: 'RLSValidationDashboard', icon: Shield, label: { en: 'Data Access Validation', ar: 'التحقق من الوصول' } },
            { name: 'ComplianceDashboard', icon: CheckCircle, label: { en: 'Compliance', ar: 'الامتثال' } },
            { name: 'BackupRecoveryManager', icon: Database, label: { en: 'Backup & Recovery', ar: 'النسخ الاحتياطي' } },
            { name: 'StrategicPlanApprovalGate', icon: Shield, label: { en: 'Strategic Plan Approval', ar: 'موافقة الخطة' } },
            { name: 'BudgetAllocationApprovalGate', icon: Shield, label: { en: 'Budget Approval', ar: 'موافقة الميزانية' } },
            { name: 'InitiativeLaunchGate', icon: Shield, label: { en: 'Initiative Launch', ar: 'إطلاق المبادرة' } },
            { name: 'PortfolioReviewGate', icon: Shield, label: { en: 'Portfolio Review', ar: 'مراجعة المحفظة' } },
          ]
        },
        {
          title: { en: '🛠️ Operations & Monitoring', ar: '🛠️ العمليات والمراقبة' },
          items: [
            { name: 'SystemHealthDashboard', icon: Activity, label: { en: 'System Health', ar: 'صحة النظام' } },
            { name: 'APIManagementConsole', icon: Plug, label: { en: 'API Management', ar: 'إدارة API' } },
            { name: 'ErrorLogsConsole', icon: AlertCircle, label: { en: 'Error Logs', ar: 'سجلات الأخطاء' } },
            { name: 'ScheduledJobsManager', icon: Calendar, label: { en: 'Scheduled Jobs', ar: 'المهام المجدولة' } },
            { name: 'PerformanceMonitor', icon: Activity, label: { en: 'Performance Monitor', ar: 'مراقبة الأداء' } },
            { name: 'NotificationCenter', icon: Bell, label: { en: 'Notifications', ar: 'الإشعارات' } },
            { name: 'CalendarView', icon: Calendar, label: { en: 'Calendar', ar: 'التقويم' } },
            { name: 'CustomReportBuilder', icon: FileText, label: { en: 'Report Builder', ar: 'بناء التقارير' } },
          ]
        }
      ]
    },
        {
          title: { en: 'User & Profile', ar: 'المستخدم والملف' },
          isCollapsible: true,
          subsections: [
            {
              title: { en: '👤 My Profile & Settings', ar: '👤 ملفي وإعداداتي' },
              items: [
                { name: 'PersonalizedDashboard', icon: LayoutDashboard, label: { en: 'My Dashboard', ar: 'لوحتي' } },
                { name: 'UserProfile', icon: User, label: { en: 'My Profile', ar: 'ملفي' } },
                { name: 'Settings', icon: Settings, label: { en: 'Settings', ar: 'الإعدادات' } },
                { name: 'NotificationPreferences', icon: Bell, label: { en: 'Notifications', ar: 'الإشعارات' } },
              ]
            },
            {
              title: { en: '🏆 Achievements & Network', ar: '🏆 الإنجازات والشبكة' },
              items: [
                { name: 'UserGamification', icon: Award, label: { en: 'Achievements', ar: 'الإنجازات' } },
                { name: 'UserDirectory', icon: Users, label: { en: 'User Directory', ar: 'دليل المستخدمين' } },
                { name: 'DelegationManager', icon: UserPlus, label: { en: 'Delegation', ar: 'التفويض' } },
              ]
            },
            {
              title: { en: '📊 User Analytics (Admin)', ar: '📊 تحليلات المستخدمين (إداري)' },
              items: [
                { name: 'UserManagementHub', icon: Users, label: { en: 'User Management', ar: 'إدارة المستخدمين' }, requireAdmin: true },
                { name: 'UserActivityDashboard', icon: Activity, label: { en: 'User Analytics', ar: 'تحليلات المستخدمين' }, requireAdmin: true },
                { name: 'SessionDeviceManager', icon: Monitor, label: { en: 'Sessions & Devices', ar: 'الجلسات والأجهزة' }, requireAdmin: true },
                { name: 'UserExperienceProgress', icon: TrendingUp, label: { en: 'UX Progress', ar: 'تقدم التجربة' }, requireAdmin: true },
                { name: 'UserFeatureAudit', icon: Search, label: { en: 'Feature Audit', ar: 'تدقيق الميزات' }, requireAdmin: true },
              ]
            },
            {
              title: { en: '🎭 Specialized Profiles', ar: '🎭 الملفات المتخصصة' },
              items: [
                { name: 'StartupProfile', icon: Lightbulb, label: { en: 'Startup Profiles', ar: 'ملفات الشركات' } },
                { name: 'ResearcherProfile', icon: Microscope, label: { en: 'Researcher Profiles', ar: 'ملفات الباحثين' } },
              ]
            }
          ]
        },
      {
        title: { en: 'Advanced Tools', ar: 'الأدوات المتقدمة' },
        items: [
          { name: 'AdvancedSearch', icon: Search, label: { en: 'Advanced Search', ar: 'البحث المتقدم' } },
          { name: 'WhatsNewHub', icon: Megaphone, label: { en: "What's New", ar: 'ما الجديد' } },
          { name: 'CrossEntityActivityStream', icon: Activity, label: { en: 'Activity Stream', ar: 'تدفق النشاط' }, requiredPermissions: ['challenge_view_all', 'pilot_view_all'] },
          { name: 'PredictiveAnalytics', icon: TrendingUp, label: { en: 'AI Analytics', ar: 'التحليلات الذكية' }, requireAdmin: true },
          { name: 'PredictiveInsights', icon: Sparkles, label: { en: 'AI Predictions', ar: 'التنبؤات الذكية' }, requireAdmin: true },
          { name: 'BulkImport', icon: Upload, label: { en: 'Bulk Import', ar: 'الاستيراد الجماعي' }, requireAdmin: true },
        ]
      },
      {
        title: { en: 'Relations & Matching', ar: 'العلاقات والمطابقة' },
        isCollapsible: true,
        subsections: [
          {
            title: { en: '🔗 Relation Management', ar: '🔗 إدارة العلاقات' },
            items: [
              { name: 'RelationManagementHub', icon: Network, label: { en: 'Relation Hub', ar: 'مركز العلاقات' }, requireAdmin: true },
            ]
          },
          {
            title: { en: '🛡️ Policy Management', ar: '🛡️ إدارة السياسات' },
            items: [
              { name: 'PolicyHub', icon: Shield, label: { en: 'Policy Hub', ar: 'مركز السياسات' } },
              { name: 'PolicyTemplateManager', icon: FileText, label: { en: 'Template Manager', ar: 'مدير القوالب' }, requireAdmin: true },
            ]
          }
        ]
      }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        :root {
          --primary: 214 100% 25%;
          --primary-foreground: 0 0% 100%;
          --accent: 174 72% 45%;
          --accent-foreground: 0 0% 100%;
          --success: 142 71% 45%;
          --warning: 38 92% 50%;
          --destructive: 0 84% 60%;
        }
        
        .nav-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-item:hover {
          transform: translateX(${isRTL ? '-4px' : '4px'});
        }
        
        .active-nav {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          background-size: 1000px 100%;
        }
      `}</style>

      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex h-16 items-center gap-2 md:gap-4 px-3 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-slate-100 flex-shrink-0"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm md:text-lg font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
                {language === 'en' ? 'Saudi Innovates' : 'الابتكار السعودي'}
              </h1>
              <p className="text-xs text-slate-500 hidden md:block">
                {language === 'en' ? 'National Municipal Innovation Platform' : 'المنصة الوطنية للابتكار البلدي'}
              </p>
            </div>
          </div>

          <div className="flex-1 flex justify-center max-w-2xl mx-auto relative hidden lg:flex">
            <div className="relative w-full">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setSearchOpen(true)}
                placeholder={language === 'en' ? 'Search challenges, pilots, solutions...' : 'ابحث عن التحديات، التجارب، الحلول...'}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
              />
              
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50">
                  {searchResults.map((result, idx) => (
                    <Link
                      key={idx}
                      to={createPageUrl(result.page) + `?id=${result.id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <Badge className="text-xs">{result.type}</Badge>
                      <span className="text-sm text-slate-900 flex-1">{result.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden md:block">
              <PortalSwitcher user={user} currentPortal="home" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1 md:gap-2 px-2 md:px-4">
                  <Network className="h-4 w-4" />
                  <span className="text-xs md:text-sm hidden sm:inline">{language === 'en' ? 'Portals' : 'البوابات'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
                {isAdmin && (
                  <Link to={createPageUrl('ExecutiveDashboard')}>
                    <DropdownMenuItem>
                      <Target className="mr-2 h-4 w-4 text-purple-600" />
                      {language === 'en' ? 'Executive' : 'القيادة'}
                    </DropdownMenuItem>
                  </Link>
                )}
                {isAdmin && (
                  <Link to={createPageUrl('AdminPortal')}>
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4 text-blue-600" />
                      {language === 'en' ? 'Admin' : 'الإدارة'}
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link to={createPageUrl('MunicipalityDashboard')}>
                  <DropdownMenuItem>
                    <Building2 className="mr-2 h-4 w-4 text-green-600" />
                    {language === 'en' ? 'Municipality' : 'البلدية'}
                  </DropdownMenuItem>
                </Link>
                <Link to={createPageUrl('StartupDashboard')}>
                  <DropdownMenuItem>
                    <Rocket className="mr-2 h-4 w-4 text-orange-600" />
                    {language === 'en' ? 'Startup' : 'الشركات'}
                  </DropdownMenuItem>
                </Link>
                <Link to={createPageUrl('AcademiaDashboard')}>
                  <DropdownMenuItem>
                    <Microscope className="mr-2 h-4 w-4 text-indigo-600" />
                    {language === 'en' ? 'Academia' : 'الأكاديميين'}
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <Link to={createPageUrl('ProgramOperatorPortal')}>
                    <DropdownMenuItem>
                      <Calendar className="mr-2 h-4 w-4 text-pink-600" />
                      {language === 'en' ? 'Program Operator' : 'مشغل البرامج'}
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link to={createPageUrl('PublicPortal')}>
                  <DropdownMenuItem>
                    <Globe className="mr-2 h-4 w-4 text-slate-600" />
                    {language === 'en' ? 'Public' : 'العامة'}
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hover:bg-slate-100 flex-shrink-0 gap-2 px-3"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">{language === 'en' ? 'عربي' : 'EN'}</span>
            </Button>

            <Link to={createPageUrl('NotificationCenter')}>
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 flex-shrink-0">
                <Bell className="h-4 md:h-5 w-4 md:w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </Link>

            {/* Persona Badge */}
            <div className="hidden lg:block">
              <PersonaHeader size="small" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 md:gap-2 hover:bg-slate-100 px-2 md:px-4">
                  <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                    <User className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                  <span className="text-xs md:text-sm font-medium hidden sm:inline truncate max-w-[100px] md:max-w-none">{user?.full_name || 'User'}</span>
                  <ChevronDown className="h-3 md:h-4 w-3 md:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
                <Link to={createPageUrl('UserProfile')}>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    {language === 'en' ? 'Profile' : 'الملف الشخصي'}
                  </DropdownMenuItem>
                </Link>
                <Link to={createPageUrl('Settings')}>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    {language === 'en' ? 'Settings' : 'الإعدادات'}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className={`fixed md:relative top-16 md:top-0 left-0 md:left-auto z-40 w-64 h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] border-${isRTL ? 'l' : 'r'} bg-white md:bg-white/50 backdrop-blur-sm p-4 space-y-3 overflow-y-auto ${isRTL ? 'border-l' : 'border-r'} shadow-xl md:shadow-none`}>
            {navigationSections
              .filter(section => {
                // Filter sections by role or permissions
                if (section.requireAdmin && !isAdmin) return false;
                if (section.requiredPermissions && !hasAnyPermission(section.requiredPermissions)) return false;
                if (section.roles && !section.roles.includes(user?.role)) return false;
                return true;
              })
              .map((section, idx) => {
                const sectionCollapsed = collapsedSections[idx];

                // Handle sections with subsections (Innovation Pipeline)
                if (section.subsections) {
                  return (
                    <div key={idx} className="space-y-1">
                      <button
                        onClick={() => toggleSection(idx)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <span>{section.title[language]}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${sectionCollapsed ? 'rotate-180' : ''}`} />
                      </button>

                      {!sectionCollapsed && (
                        <div className="space-y-3">
                          {section.subsections.map((subsection, subIdx) => (
                            <div key={subIdx} className="space-y-1">
                              <div className="px-3 py-1.5 text-xs font-medium text-slate-500">
                                {subsection.title[language]}
                              </div>
                              <nav className="space-y-1">
                                {subsection.items.filter(item => {
                                  if (item.requireAdmin && !isAdmin) return false;
                                  if (item.requiredPermissions && !hasAnyPermission(item.requiredPermissions)) return false;
                                  if (item.roles && !item.roles.includes(user?.role)) return false;
                                  return true;
                                }).map((item) => {
                                  const Icon = item.icon;
                                  const isActive = currentPageName === item.name;
                                  return (
                                    <Link
                                      key={item.name}
                                      to={createPageUrl(item.name)}
                                      className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        isActive
                                          ? 'active-nav'
                                          : 'text-slate-700 hover:bg-slate-100'
                                      }`}
                                    >
                                      <Icon className="h-5 w-5" />
                                      <span>{item.label[language]}</span>
                                    </Link>
                                  );
                                })}
                              </nav>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Handle regular sections
                const visibleItems = section.items.filter(item => {
                  if (item.requireAdmin && !isAdmin) return false;
                  if (item.requiredPermissions && !hasAnyPermission(item.requiredPermissions)) return false;
                  if (item.roles && !item.roles.includes(user?.role)) return false;
                  return true;
                });

                if (visibleItems.length === 0) return null;

                return (
                  <div key={idx} className="space-y-1">
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span>{section.title[language]}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${sectionCollapsed ? 'rotate-180' : ''}`} />
                    </button>

                    {!sectionCollapsed && (
                      <nav className="space-y-1">
                        {visibleItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentPageName === item.name;
                          return (
                            <Link
                              key={item.name}
                              to={createPageUrl(item.name)}
                              className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                isActive
                                  ? 'active-nav'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                              <span>{item.label[language]}</span>
                            </Link>
                          );
                        })}
                      </nav>
                    )}
                  </div>
                );
              })}
          </aside>
        )}

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        </div>

        {/* Global AI Assistant */}
        <AIAssistant context={{ page: currentPageName }} />

        {/* Onboarding Wizard for new users */}
        {showOnboarding && (
          <OnboardingWizard 
            onComplete={() => {
              setShowOnboarding(false);
              // Refresh auth to get updated profile
              checkAuth?.();
            }}
            onSkip={() => {
              // OnboardingWizard handles DB update and navigation
              // Just hide the wizard in the Layout
              setShowOnboarding(false);
            }}
          />
        )}
        </div>
        );
        }

export default function Layout(props) {
  return <LayoutContent {...props} />;
}