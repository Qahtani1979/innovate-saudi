import React, { useState, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Shield, BarChart3, FileCheck, AlertTriangle, Menu, Loader2, Users, UserPlus, Calendar, Lock
} from 'lucide-react';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

// Lazy load tab components for performance
const RBACDashboardContent = lazy(() => import('@/components/rbac/RBACDashboardContent'));
const RBACAuditContent = lazy(() => import('@/components/rbac/RBACAuditContent'));
const RBACCoverageContent = lazy(() => import('@/components/rbac/RBACCoverageContent'));
const MenuRBACContent = lazy(() => import('@/components/rbac/MenuRBACContent'));
const RolePermissionContent = lazy(() => import('@/components/rbac/RolePermissionContent'));
const RoleRequestContent = lazy(() => import('@/components/rbac/RoleRequestContent'));
const DelegationContent = lazy(() => import('@/components/rbac/DelegationContent'));
const AccessRulesContent = lazy(() => import('@/components/rbac/AccessRulesContent'));

const TabLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function RBACHub() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, icon: BarChart3 },
    { id: 'roles', label: { en: 'Roles & Permissions', ar: 'الأدوار والصلاحيات' }, icon: Shield },
    { id: 'requests', label: { en: 'Role Requests', ar: 'طلبات الأدوار' }, icon: UserPlus },
    { id: 'delegations', label: { en: 'Delegations', ar: 'التفويضات' }, icon: Calendar },
    { id: 'access-rules', label: { en: 'Access Rules', ar: 'قواعد الوصول' }, icon: Lock },
    { id: 'audit', label: { en: 'Security Audit', ar: 'تدقيق الأمان' }, icon: AlertTriangle },
    { id: 'coverage', label: { en: 'Coverage', ar: 'التغطية' }, icon: FileCheck },
    { id: 'menu', label: { en: 'Menu RBAC', ar: 'صلاحيات القائمة' }, icon: Menu }
  ];

  return (
    <PageLayout>
      <PageHeader
        icon={Shield}
        title={t({ en: 'RBAC Management Hub', ar: 'مركز إدارة الصلاحيات' })}
        description={t({ en: 'Comprehensive role-based access control management, auditing, and monitoring', ar: 'إدارة شاملة للتحكم بالوصول القائم على الأدوار والتدقيق والمراقبة' })}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg bg-muted p-1 text-muted-foreground md:grid md:grid-cols-8 md:overflow-visible">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const label = t(tab.label);

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="w-full min-w-[8.5rem] flex-col justify-center gap-1 px-2 py-2 text-[11px] whitespace-normal md:min-w-0 md:flex-row md:gap-2 md:text-xs"
                title={label}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-center leading-tight">{label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <Suspense fallback={<TabLoader />}>
          <TabsContent value="dashboard"><RBACDashboardContent /></TabsContent>
          <TabsContent value="roles"><RolePermissionContent /></TabsContent>
          <TabsContent value="requests"><RoleRequestContent /></TabsContent>
          <TabsContent value="delegations"><DelegationContent /></TabsContent>
          <TabsContent value="access-rules"><AccessRulesContent /></TabsContent>
          <TabsContent value="audit"><RBACAuditContent /></TabsContent>
          <TabsContent value="coverage"><RBACCoverageContent /></TabsContent>
          <TabsContent value="menu"><MenuRBACContent /></TabsContent>
        </Suspense>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(RBACHub, { requireAdmin: true });
