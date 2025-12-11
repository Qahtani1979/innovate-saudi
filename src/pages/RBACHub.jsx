import React, { useState, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Shield, BarChart3, FileCheck, AlertTriangle, Menu, Loader2
} from 'lucide-react';
import ProtectedPage from '@/components/permissions/ProtectedPage';

// Lazy load tab components for performance
const RBACDashboardContent = lazy(() => import('@/components/rbac/RBACDashboardContent'));
const RBACAuditContent = lazy(() => import('@/components/rbac/RBACAuditContent'));
const RBACCoverageContent = lazy(() => import('@/components/rbac/RBACCoverageContent'));
const MenuRBACContent = lazy(() => import('@/components/rbac/MenuRBACContent'));

const TabLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function RBACHub() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, icon: BarChart3, color: 'text-blue-600' },
    { id: 'audit', label: { en: 'Security Audit', ar: 'تدقيق الأمان' }, icon: AlertTriangle, color: 'text-red-600' },
    { id: 'coverage', label: { en: 'Coverage Report', ar: 'تقرير التغطية' }, icon: FileCheck, color: 'text-green-600' },
    { id: 'menu', label: { en: 'Menu RBAC', ar: 'صلاحيات القائمة' }, icon: Menu, color: 'text-purple-600' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl" />
        </div>
        <div className="relative z-10">
          <Badge className="bg-white/20 text-white border-white/40 mb-3">
            <Shield className="h-3 w-3 mr-1" />
            {t({ en: 'Access Control Center', ar: 'مركز التحكم بالوصول' })}
          </Badge>
          <h1 className="text-4xl font-bold mb-2">
            {t({ en: 'RBAC Management Hub', ar: 'مركز إدارة الصلاحيات' })}
          </h1>
          <p className="text-lg text-white/90">
            {t({ 
              en: 'Comprehensive role-based access control management, auditing, and monitoring', 
              ar: 'إدارة شاملة للتحكم بالوصول القائم على الأدوار والتدقيق والمراقبة' 
            })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
              >
                <Icon className={`h-4 w-4 ${tab.color}`} />
                <span className="hidden sm:inline">{t(tab.label)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <Suspense fallback={<TabLoader />}>
          <TabsContent value="dashboard" className="space-y-6">
            <RBACDashboardContent />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <RBACAuditContent />
          </TabsContent>

          <TabsContent value="coverage" className="space-y-6">
            <RBACCoverageContent />
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <MenuRBACContent />
          </TabsContent>
        </Suspense>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(RBACHub, { requireAdmin: true });
