import {
  LayoutDashboard,
  AlertCircle,
  Lightbulb,
  TestTube,
  Microscope,
  TrendingUp,
  BarChart3,
  Users,
  CheckCircle,
  FileText,
  Building2,
  Activity,
  Rocket,
  Award,
  Shield,
  Target,
  Sparkles,
  BookOpen,
  Globe,
  User,
  Handshake,
  Calendar,
  Bell,
  MessageSquare,
  Map,
  Briefcase,
  GraduationCap,
  Clock,
  FileBarChart,
  ScrollText,
  Wallet,
  History,
  DollarSign,
  UserCheck,
  Inbox
} from 'lucide-react';

// Flat menu configurations per persona
// Note: Profile and Settings are in the header dropdown, not sidebar
export const SIDEBAR_MENUS = {
  admin: {
    label: { en: 'Platform Admin', ar: 'مدير المنصة' },
    icon: Shield,
    color: 'from-red-600 to-rose-500',
    items: [
      { name: 'Home', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { name: 'UserManagementHub', icon: Users, label: { en: 'Users', ar: 'المستخدمين' } },
      { name: 'RolePermissionManager', icon: UserCheck, label: { en: 'Roles & Permissions', ar: 'الأدوار والصلاحيات' } },
      { name: 'ApprovalCenter', icon: CheckCircle, label: { en: 'Approvals', ar: 'الموافقات' } },
      { name: 'Challenges', icon: AlertCircle, label: { en: 'Challenges', ar: 'التحديات' } },
      { name: 'Pilots', icon: TestTube, label: { en: 'Pilots', ar: 'التجارب' } },
      { name: 'Solutions', icon: Lightbulb, label: { en: 'Solutions', ar: 'الحلول' } },
      { name: 'Programs', icon: Calendar, label: { en: 'Programs', ar: 'البرامج' } },
      { name: 'Municipalities', icon: Building2, label: { en: 'Municipalities', ar: 'البلديات' } },
      { name: 'Organizations', icon: Briefcase, label: { en: 'Organizations', ar: 'المنظمات' } },
      { name: 'ReportsBuilder', icon: BarChart3, label: { en: 'Analytics', ar: 'التحليلات' } },
      { name: 'AuditTrail', icon: History, label: { en: 'Audit Logs', ar: 'سجلات التدقيق' } },
      { name: 'SystemHealthDashboard', icon: Activity, label: { en: 'System Health', ar: 'صحة النظام' } },
    ]
  },

  executive: {
    label: { en: 'Executive', ar: 'تنفيذي' },
    icon: Target,
    color: 'from-purple-600 to-violet-500',
    items: [
      { name: 'ExecutiveDashboard', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { name: 'StrategicPlans', icon: Target, label: { en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' } },
      { name: 'Challenges', icon: AlertCircle, label: { en: 'Challenges', ar: 'التحديات' } },
      { name: 'Pilots', icon: TestTube, label: { en: 'Pilots', ar: 'التجارب' } },
      { name: 'PipelineHealthDashboard', icon: Activity, label: { en: 'Pipeline Health', ar: 'صحة الخط' } },
      { name: 'NationalInnovationMap', icon: Map, label: { en: 'Innovation Map', ar: 'خريطة الابتكار' } },
      { name: 'Municipalities', icon: Building2, label: { en: 'Municipalities', ar: 'البلديات' } },
      { name: 'ApprovalCenter', icon: CheckCircle, label: { en: 'Approvals', ar: 'الموافقات' } },
      { name: 'ReportsBuilder', icon: BarChart3, label: { en: 'Analytics & Reports', ar: 'التحليلات والتقارير' } },
    ]
  },

  deputyship: {
    label: { en: 'Deputyship', ar: 'الوكالة' },
    icon: Globe,
    color: 'from-indigo-600 to-blue-500',
    items: [
      { name: 'ExecutiveDashboard', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { name: 'NationalInnovationMap', icon: Map, label: { en: 'National Overview', ar: 'النظرة الوطنية' } },
      { name: 'Municipalities', icon: Building2, label: { en: 'Municipalities', ar: 'البلديات' } },
      { name: 'Challenges', icon: AlertCircle, label: { en: 'Challenges', ar: 'التحديات' } },
      { name: 'Pilots', icon: TestTube, label: { en: 'Pilots', ar: 'التجارب' } },
      { name: 'Solutions', icon: Lightbulb, label: { en: 'Solutions', ar: 'الحلول' } },
      { name: 'Programs', icon: Calendar, label: { en: 'Programs', ar: 'البرامج' } },
      { name: 'ApprovalCenter', icon: CheckCircle, label: { en: 'Approvals', ar: 'الموافقات' } },
      { name: 'ReportsBuilder', icon: BarChart3, label: { en: 'Analytics', ar: 'التحليلات' } },
    ]
  },

  municipality: {
    label: { en: 'Municipality', ar: 'البلدية' },
    icon: Building2,
    color: 'from-emerald-600 to-green-500',
    items: [
      { name: 'MunicipalityDashboard', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { name: 'MyChallenges', icon: AlertCircle, label: { en: 'My Challenges', ar: 'تحدياتي' } },
      { name: 'MyPilots', icon: TestTube, label: { en: 'My Pilots', ar: 'تجاربي' } },
      { name: 'MunicipalProposalInbox', icon: Inbox, label: { en: 'Proposals', ar: 'المقترحات' } },
      { name: 'Solutions', icon: Lightbulb, label: { en: 'Solutions', ar: 'الحلول' } },
      { name: 'MyApprovals', icon: CheckCircle, label: { en: 'Approvals', ar: 'الموافقات' } },
      { name: 'MunicipalityIdeasView', icon: Sparkles, label: { en: 'Citizen Ideas', ar: 'أفكار المواطنين' } },
      { name: 'ContractManagement', icon: ScrollText, label: { en: 'Contracts', ar: 'العقود' } },
      { name: 'BudgetManagement', icon: Wallet, label: { en: 'Budget', ar: 'الميزانية' } },
      { name: 'TeamManagement', icon: Users, label: { en: 'Team', ar: 'الفريق' } },
      { name: 'ReportsBuilder', icon: BarChart3, label: { en: 'Analytics', ar: 'التحليلات' } },
    ]
  },

  provider: {
    label: { en: 'Provider', ar: 'المزود' },
    icon: Briefcase,
    color: 'from-orange-600 to-amber-500',
    items: [
      { name: 'StartupDashboard', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { name: 'ProviderPortfolioDashboard', icon: Lightbulb, label: { en: 'My Solutions', ar: 'حلولي' } },
      { name: 'OpportunityFeed', icon: Sparkles, label: { en: 'Opportunities', ar: 'الفرص' } },
      { name: 'MyChallengeTracker', icon: Target, label: { en: 'Challenge Tracker', ar: 'متتبع التحديات' } },
      { name: 'MyApplications', icon: FileText, label: { en: 'Applications', ar: 'الطلبات' } },
      { name: 'MyPilots', icon: TestTube, label: { en: 'My Pilots', ar: 'تجاربي' } },
      { name: 'ContractManagement', icon: ScrollText, label: { en: 'Contracts', ar: 'العقود' } },
      { name: 'MyPartnershipsPage', icon: Handshake, label: { en: 'Partnerships', ar: 'الشراكات' } },
      { name: 'Programs', icon: Calendar, label: { en: 'Programs', ar: 'البرامج' } },
      { name: 'Messaging', icon: MessageSquare, label: { en: 'Messages', ar: 'الرسائل' } },
    ]
  },

  expert: {
    label: { en: 'Expert', ar: 'خبير' },
    icon: GraduationCap,
    color: 'from-amber-600 to-yellow-500',
    items: [
      { name: 'ExpertDashboard', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { name: 'EvaluationPanel', icon: CheckCircle, label: { en: 'Evaluations', ar: 'التقييمات' } },
      { name: 'ExpertAssignmentQueue', icon: Inbox, label: { en: 'My Assignments', ar: 'مهامي' } },
      { name: 'PilotEvaluations', icon: TestTube, label: { en: 'Pilot Reviews', ar: 'مراجعات التجارب' } },
      { name: 'ExpertMatchingEngine', icon: Users, label: { en: 'Expert Network', ar: 'شبكة الخبراء' } },
      { name: 'Knowledge', icon: BookOpen, label: { en: 'Knowledge Hub', ar: 'مركز المعرفة' } },
      { name: 'MyDeadlines', icon: Clock, label: { en: 'Deadlines', ar: 'المواعيد' } },
      { name: 'Messaging', icon: MessageSquare, label: { en: 'Messages', ar: 'الرسائل' } },
    ]
  },

  researcher: {
    label: { en: 'Researcher', ar: 'باحث' },
    icon: Microscope,
    color: 'from-teal-600 to-cyan-500',
    items: [
      { name: 'ResearcherDashboard', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { name: 'ResearcherWorkspace', icon: Microscope, label: { en: 'Workspace', ar: 'مساحة العمل' } },
      { name: 'MyRDProjects', icon: TestTube, label: { en: 'My Projects', ar: 'مشاريعي' } },
      { name: 'RDProjects', icon: Rocket, label: { en: 'R&D Hub', ar: 'مركز البحث' } },
      { name: 'CollaborationHub', icon: Users, label: { en: 'Collaboration', ar: 'التعاون' } },
      { name: 'Knowledge', icon: BookOpen, label: { en: 'Knowledge Hub', ar: 'مركز المعرفة' } },
      { name: 'MyDeadlines', icon: Clock, label: { en: 'Deadlines', ar: 'المواعيد' } },
      { name: 'Messaging', icon: MessageSquare, label: { en: 'Messages', ar: 'الرسائل' } },
    ]
  },

  citizen: {
    label: { en: 'Citizen', ar: 'مواطن' },
    icon: Users,
    color: 'from-slate-600 to-gray-500',
    items: [
      { name: 'CitizenDashboard', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { name: 'PublicIdeaSubmission', icon: Lightbulb, label: { en: 'Submit Idea', ar: 'إرسال فكرة' } },
      { name: 'PublicIdeasBoard', icon: Sparkles, label: { en: 'Ideas Board', ar: 'لوحة الأفكار' } },
      { name: 'IdeasManagement', icon: FileText, label: { en: 'My Ideas', ar: 'أفكاري' } },
      { name: 'PublicPilotTracker', icon: TestTube, label: { en: 'Public Pilots', ar: 'التجارب العامة' } },
      { name: 'CitizenPilotEnrollment', icon: UserCheck, label: { en: 'Pilot Enrollment', ar: 'التسجيل في التجارب' } },
      { name: 'CitizenLeaderboard', icon: Award, label: { en: 'Leaderboard', ar: 'المتصدرين' } },
      { name: 'CitizenNotifications', icon: Bell, label: { en: 'Notifications', ar: 'الإشعارات' } },
    ]
  },

  user: {
    label: { en: 'User', ar: 'مستخدم' },
    icon: User,
    color: 'from-gray-600 to-slate-500',
    items: [
      { name: 'Home', icon: LayoutDashboard, label: { en: 'Dashboard', ar: 'لوحة التحكم' } },
      { name: 'PublicIdeasBoard', icon: Lightbulb, label: { en: 'Ideas', ar: 'الأفكار' } },
      { name: 'PublicPilotTracker', icon: TestTube, label: { en: 'Pilots', ar: 'التجارب' } },
      { name: 'Solutions', icon: Sparkles, label: { en: 'Solutions', ar: 'الحلول' } },
    ]
  }
};

export default SIDEBAR_MENUS;
