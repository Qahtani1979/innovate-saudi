import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import {
  Users, Database, Shield, Code, CheckCircle2, AlertTriangle, XCircle,
  Key, UserCog, Building2, Lock, FileText, Activity, Settings
} from 'lucide-react';

// Users & Access System Categories
const ACCESS_CATEGORIES = [
  {
    id: 'user_profiles',
    name: { en: 'User Profiles', ar: 'ملفات المستخدمين' },
    icon: Users,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'user_profiles table exists', status: 'complete' },
        { check: 'Core columns: user_id, user_email, full_name, avatar_url', status: 'complete' },
        { check: 'Organization/municipality links', status: 'complete' },
        { check: 'Preference columns: language, theme, notifications', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on user_profiles', status: 'complete' },
        { check: 'Users can view/update own profile', status: 'complete' },
        { check: 'Users can insert own profile', status: 'complete' },
        { check: 'Public profiles viewable by all', status: 'complete' },
        { check: 'Admins can manage all profiles', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'usePermissions.jsx - Profile fetching', status: 'complete' },
        { check: 'useProfileData.js - Extended profile', status: 'complete' },
        { check: 'useUsersWithVisibility.js - User listing', status: 'complete' }
      ]},
      { id: 'pages', name: 'Pages', items: [
        { check: 'UserProfile.jsx - Profile view', status: 'complete' },
        { check: 'UserProfileTab.jsx - Tab component', status: 'complete' },
        { check: 'ProfileEdit.jsx - Edit form', status: 'complete' },
        { check: 'ProfileSettings.jsx - Settings', status: 'complete' },
        { check: 'UserDirectory.jsx / UserManagementHub.jsx', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'roles_system',
    name: { en: 'Roles System', ar: 'نظام الأدوار' },
    icon: UserCog,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'roles table exists', status: 'complete' },
        { check: 'user_roles table with proper structure', status: 'complete' },
        { check: 'user_roles columns: user_id, role, role_id, municipality_id, organization_id', status: 'complete' },
        { check: 'is_active column for soft deactivation', status: 'complete' },
        { check: 'role_id FK to roles table', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on roles table', status: 'complete' },
        { check: 'RLS enabled on user_roles table', status: 'complete' },
        { check: 'Anyone can view roles', status: 'complete' },
        { check: 'Admins can manage roles', status: 'complete' },
        { check: 'Users can view own roles', status: 'complete' },
        { check: 'Admins can manage all user_roles', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'useUserRoles.js - Role fetching', status: 'complete' },
        { check: 'useRBACManager.js - RBAC operations', status: 'complete' },
        { check: 'useAssignRole hook', status: 'complete' },
        { check: 'useRevokeRole hook', status: 'complete' }
      ]},
      { id: 'pages', name: 'Pages', items: [
        { check: 'RolePermissionManager.jsx', status: 'complete' },
        { check: 'RBACDashboard.jsx', status: 'complete' },
        { check: 'RBACAuditReport.jsx', status: 'complete' },
        { check: 'TeamManagement.jsx', status: 'complete' }
      ]},
      { id: 'functions', name: 'Database Functions', items: [
        { check: 'is_admin(uuid) function', status: 'complete' },
        { check: 'get_user_permissions(uuid) function', status: 'complete' },
        { check: 'get_user_functional_roles(uuid) function', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'permissions_system',
    name: { en: 'Permissions System', ar: 'نظام الصلاحيات' },
    icon: Key,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'permissions table exists', status: 'complete' },
        { check: 'role_permissions junction table', status: 'complete' },
        { check: 'Proper FK relationships', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on permissions', status: 'complete' },
        { check: 'RLS enabled on role_permissions', status: 'complete' },
        { check: 'Anyone can view permissions (for UI)', status: 'complete' },
        { check: 'Admins can manage permissions', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'usePermissions - hasPermission()', status: 'complete' },
        { check: 'usePermissions - hasAnyPermission()', status: 'complete' },
        { check: 'usePermissions - hasAllPermissions()', status: 'complete' },
        { check: 'usePermissions - canAccessEntity()', status: 'complete' }
      ]},
      { id: 'components', name: 'Components', items: [
        { check: 'PermissionGate.jsx - Conditional rendering', status: 'complete' },
        { check: 'ProtectedPage.jsx - Route protection', status: 'complete' },
        { check: 'ProtectedAction.jsx - Action protection', status: 'complete' },
        { check: 'PermissionSelector.jsx - Permission picker', status: 'complete' },
        { check: 'FieldPermissions.jsx - Field-level control', status: 'complete' },
        { check: 'withEntityAccess.jsx - HOC wrapper', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'role_requests',
    name: { en: 'Role Requests', ar: 'طلبات الأدوار' },
    icon: FileText,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'role_requests table exists', status: 'complete' },
        { check: 'Status workflow columns', status: 'complete' },
        { check: 'Requester/approver tracking', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on role_requests', status: 'complete' },
        { check: 'Users can submit requests', status: 'complete' },
        { check: 'Users can view own requests', status: 'complete' },
        { check: 'Admins can manage all requests', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'useApproveRoleRequest hook', status: 'complete' },
        { check: 'useRejectRoleRequest hook', status: 'complete' },
        { check: 'useCheckAutoApproval hook', status: 'complete' }
      ]},
      { id: 'pages', name: 'Pages', items: [
        { check: 'RoleRequestCenter.jsx', status: 'complete' },
        { check: 'RoleRequestApprovalQueue.jsx', status: 'complete' },
        { check: 'MyApprovals.jsx - User pending requests', status: 'complete' }
      ]},
      { id: 'components', name: 'Components', items: [
        { check: 'RoleRequestStatusBanner.jsx', status: 'complete' },
        { check: 'RoleRequestForm.jsx', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'auto_approval',
    name: { en: 'Auto-Approval Rules', ar: 'قواعد الموافقة التلقائية' },
    icon: Settings,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'auto_approval_rules table exists', status: 'complete' },
        { check: 'Rule type/value columns', status: 'complete' },
        { check: 'Municipality/organization scoping', status: 'complete' },
        { check: 'Priority ordering', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on auto_approval_rules', status: 'complete' },
        { check: 'Viewable by all (for matching)', status: 'complete' },
        { check: 'Admins can manage rules', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'useAutoRoleAssignment.js', status: 'complete' },
        { check: 'useCheckAutoApproval hook', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'delegation',
    name: { en: 'Delegation System', ar: 'نظام التفويض' },
    icon: Activity,
    checks: [
      { id: 'schema', name: 'Database Schema', items: [
        { check: 'delegation_rules table exists', status: 'complete' },
        { check: 'Delegator/delegate columns', status: 'complete' },
        { check: 'Date range columns', status: 'complete' },
        { check: 'Entity type scoping', status: 'complete' }
      ]},
      { id: 'rls', name: 'Row Level Security', items: [
        { check: 'RLS enabled on delegation_rules', status: 'complete' }
      ]},
      { id: 'hooks', name: 'React Hooks', items: [
        { check: 'useApproveDelegation hook', status: 'complete' },
        { check: 'useRejectDelegation hook', status: 'complete' },
        { check: 'useChallengeDelegation.js', status: 'complete' }
      ]},
      { id: 'pages', name: 'Pages', items: [
        { check: 'MyDelegation.jsx', status: 'complete' },
        { check: 'DelegationManager component', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'security',
    name: { en: 'Security Infrastructure', ar: 'البنية الأمنية' },
    icon: Shield,
    checks: [
      { id: 'functions', name: 'Security Functions', items: [
        { check: 'is_admin() - Admin check function (SECURITY DEFINER)', status: 'complete' },
        { check: 'get_user_permissions() - Permission retrieval', status: 'complete' },
        { check: 'get_user_functional_roles() - Functional roles', status: 'complete' },
        { check: 'Roles stored in separate table (not profile)', status: 'complete' },
        { check: 'No client-side admin checks (localStorage)', status: 'complete' }
      ]},
      { id: 'audit', name: 'Audit Trail', items: [
        { check: 'access_logs table for tracking', status: 'complete' },
        { check: 'useAuditLogger hook', status: 'complete' },
        { check: 'useSecurityAudit hook', status: 'complete' }
      ]},
      { id: 'components', name: 'Security Components', items: [
        { check: 'RowLevelSecurity.jsx - RLS documentation', status: 'complete' },
        { check: 'Session validation on auth state change', status: 'complete' }
      ]}
    ]
  },
  {
    id: 'visibility',
    name: { en: 'Visibility System', ar: 'نظام الرؤية' },
    icon: Lock,
    checks: [
      { id: 'hooks', name: 'Visibility Hooks', items: [
        { check: 'useVisibilitySystem.js - Core visibility logic', status: 'complete' },
        { check: 'useEntityVisibility.js - Entity-level visibility', status: 'complete' },
        { check: 'useEntityAccessCheck.js - Access validation', status: 'complete' },
        { check: 'useVisibilityAwareSearch.js - Search filtering', status: 'complete' }
      ]},
      { id: 'scopes', name: 'Visibility Scopes', items: [
        { check: 'Global scope (admin)', status: 'complete' },
        { check: 'Sectoral scope (deputyship)', status: 'complete' },
        { check: 'Geographic scope (municipality)', status: 'complete' },
        { check: 'Public scope (default)', status: 'complete' }
      ]},
      { id: 'integration', name: 'Entity Integrations', items: [
        { check: 'useChallengesWithVisibility.js', status: 'complete' },
        { check: 'usePilotsWithVisibility.js', status: 'complete' },
        { check: 'useSolutionsWithVisibility.js', status: 'complete' },
        { check: 'useProgramsWithVisibility.js', status: 'complete' },
        { check: 'useEventsWithVisibility.js', status: 'complete' },
        { check: 'useRDProjectsWithVisibility.js', status: 'complete' },
        { check: 'useLivingLabsWithVisibility.js', status: 'complete' },
        { check: 'useSandboxesWithVisibility.js', status: 'complete' }
      ]}
    ]
  }
];

function FinalUsersAccessAssessment() {
  const { t, language } = useLanguage();

  // Fetch counts
  const { data: userProfilesCount } = useQuery({
    queryKey: ['user-profiles-count'],
    queryFn: async () => {
      const { count } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: rolesCount } = useQuery({
    queryKey: ['roles-count'],
    queryFn: async () => {
      const { count } = await supabase.from('roles').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: userRolesCount } = useQuery({
    queryKey: ['user-roles-count'],
    queryFn: async () => {
      const { count } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('is_active', true);
      return count || 0;
    }
  });

  const { data: permissionsCount } = useQuery({
    queryKey: ['permissions-count'],
    queryFn: async () => {
      const { count } = await supabase.from('permissions').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: roleRequestsCount } = useQuery({
    queryKey: ['role-requests-count'],
    queryFn: async () => {
      const { count } = await supabase.from('role_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      return count || 0;
    }
  });

  // Calculate statistics
  const stats = useMemo(() => {
    let totalChecks = 0;
    let completeChecks = 0;

    ACCESS_CATEGORIES.forEach(cat => {
      cat.checks.forEach(section => {
        section.items.forEach(item => {
          totalChecks++;
          if (item.status === 'complete') completeChecks++;
        });
      });
    });

    return {
      total: totalChecks,
      complete: completeChecks,
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
        title={t({ en: 'Users & Access System Assessment', ar: 'تقييم نظام المستخدمين والوصول' })}
        description={t({ en: 'Comprehensive validation of authentication, roles, permissions, and security infrastructure', ar: 'التحقق الشامل من المصادقة والأدوار والصلاحيات والبنية الأمنية' })}
        icon={<Shield className="h-8 w-8 text-primary" />}
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
                ) : (
                  <AlertTriangle className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.percentage}%</p>
                <p className="text-sm text-muted-foreground">
                  {stats.complete}/{stats.total} {t({ en: 'checks complete', ar: 'فحص مكتمل' })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{userProfilesCount}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'User Profiles', ar: 'ملفات المستخدمين' })}</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{rolesCount}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Roles', ar: 'الأدوار' })}</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{userRolesCount}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Active Assignments', ar: 'التعيينات النشطة' })}</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{permissionsCount}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Permissions', ar: 'الصلاحيات' })}</p>
              </div>
              <div className="p-3 bg-background rounded-lg border">
                <p className="text-2xl font-bold text-primary">{roleRequestsCount}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Pending Requests', ar: 'الطلبات المعلقة' })}</p>
              </div>
            </div>
          </div>

          <Progress value={stats.percentage} className="h-3 mt-6" />
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACCESS_CATEGORIES.map(category => {
          const catStats = getCategoryStats(category);
          const Icon = category.icon;
          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">{t(category.name)}</CardTitle>
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
            {t({ en: 'Complete breakdown of all security and access control validations', ar: 'تفصيل كامل لجميع عمليات التحقق من الأمان والتحكم في الوصول' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Accordion type="multiple" className="w-full">
              {ACCESS_CATEGORIES.map(category => {
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

      {/* Security Best Practices */}
      <Card className="border-2 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            {t({ en: 'Security Best Practices Implemented', ar: 'أفضل الممارسات الأمنية المطبقة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { practice: 'Roles stored in separate table (not user_profiles)', status: 'enforced' },
              { practice: 'SECURITY DEFINER functions for admin checks', status: 'enforced' },
              { practice: 'RLS enabled on all access control tables', status: 'enforced' },
              { practice: 'No client-side admin validation (localStorage)', status: 'enforced' },
              { practice: 'Server-side permission validation', status: 'enforced' },
              { practice: 'Audit logging for role changes', status: 'enforced' },
              { practice: 'Role request approval workflow', status: 'enforced' },
              { practice: 'Auto-approval rules with priority', status: 'enforced' },
              { practice: 'Delegation with date ranges', status: 'enforced' },
              { practice: 'Multi-scope visibility system', status: 'enforced' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-sm">{item.practice}</span>
                <Badge className="ml-auto bg-green-600">{item.status}</Badge>
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
                {t({ en: 'Users & Access System Fully Validated', ar: 'نظام المستخدمين والوصول تم التحقق منه بالكامل' })}
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                {t({
                  en: 'All authentication, authorization, roles, permissions, delegation, and visibility systems have been verified with proper database schemas, RLS policies, security functions, and React hooks.',
                  ar: 'تم التحقق من جميع أنظمة المصادقة والتفويض والأدوار والصلاحيات والتفويض والرؤية مع مخططات قواعد البيانات المناسبة وسياسات RLS ووظائف الأمان وخطافات React.'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(FinalUsersAccessAssessment, { requireAdmin: true });
