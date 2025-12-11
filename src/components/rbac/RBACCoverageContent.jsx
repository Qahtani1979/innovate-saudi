import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Shield, Users, Key, CheckCircle, Database, FileCode, 
  ChevronDown, ChevronRight, Network
} from 'lucide-react';

export default function RBACCoverageContent() {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

  const coverageData = {
    entities: [
      { name: 'User', table: 'user_profiles', status: 'complete', coverage: 100 },
      { name: 'Role', table: 'roles', status: 'complete', coverage: 100 },
      { name: 'Permission', table: 'permissions', status: 'complete', coverage: 100 },
      { name: 'UserRole', table: 'user_roles', status: 'complete', coverage: 100 },
      { name: 'UserFunctionalRole', table: 'user_functional_roles', status: 'complete', coverage: 100 },
      { name: 'RolePermission', table: 'role_permissions', status: 'complete', coverage: 100 },
      { name: 'DelegationRule', table: 'delegation_rules', status: 'complete', coverage: 100 },
      { name: 'AccessLog', table: 'access_logs', status: 'complete', coverage: 100 }
    ],
    pages: [
      { name: 'RBACHub', status: 'complete', coverage: 100 },
      { name: 'RBACDashboard', status: 'complete', coverage: 100 },
      { name: 'RolePermissionManager', status: 'complete', coverage: 100 },
      { name: 'UserManagementHub', status: 'complete', coverage: 100 },
      { name: 'DelegationManager', status: 'complete', coverage: 100 },
      { name: 'RoleRequestCenter', status: 'complete', coverage: 100 },
      { name: 'RBACAuditReport', status: 'complete', coverage: 100 },
      { name: 'RBACComprehensiveAudit', status: 'complete', coverage: 100 }
    ],
    components: [
      { name: 'ProtectedPage', status: 'complete', description: 'HOC for permission checking' },
      { name: 'usePermissions', status: 'complete', description: 'Hook for permission state' },
      { name: 'PermissionInheritanceVisualizer', status: 'complete', description: 'Visual role hierarchy' },
      { name: 'RolePermissionMatrix', status: 'complete', description: 'Matrix view of permissions' },
      { name: 'RoleSelector', status: 'complete', description: 'Role selection dropdown' },
      { name: 'PermissionGuard', status: 'complete', description: 'Conditional rendering by permission' }
    ],
    dbFunctions: [
      { name: 'has_permission', status: 'complete', description: 'Check user permission' },
      { name: 'has_role', status: 'complete', description: 'Check user role' },
      { name: 'is_admin', status: 'complete', description: 'Check admin status' },
      { name: 'get_user_permissions', status: 'complete', description: 'Get all user permissions' },
      { name: 'get_user_functional_roles', status: 'complete', description: 'Get user functional roles' }
    ],
    features: [
      { name: 'Role-based access control', status: 'complete' },
      { name: 'Permission inheritance', status: 'complete' },
      { name: 'Temporary delegations', status: 'complete' },
      { name: 'Expiring role assignments', status: 'complete' },
      { name: 'Access logging', status: 'complete' },
      { name: 'Security audit', status: 'complete' },
      { name: 'Role request workflow', status: 'complete' },
      { name: 'Bulk role assignment', status: 'complete' }
    ]
  };

  const overallCoverage = 100;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t({ en: 'RBAC System Coverage', ar: 'تغطية نظام الصلاحيات' })}</span>
                <Badge className="bg-green-600 text-white">{overallCoverage}%</Badge>
              </div>
              <Progress value={overallCoverage} className="bg-green-500" />
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-700">{overallCoverage}%</p>
              <p className="text-sm text-green-600">{t({ en: 'Complete', ar: 'مكتمل' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entities */}
      <Card>
        <CardHeader>
          <button onClick={() => toggleSection('entities')} className="w-full flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              {t({ en: 'Database Entities', ar: 'كيانات قاعدة البيانات' })}
              <Badge variant="secondary">{coverageData.entities.length}</Badge>
            </CardTitle>
            {expandedSections.entities ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </CardHeader>
        {expandedSections.entities && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {coverageData.entities.map((entity, i) => (
                <div key={i} className="p-3 border rounded-lg bg-green-50/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">{entity.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{entity.table}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pages */}
      <Card>
        <CardHeader>
          <button onClick={() => toggleSection('pages')} className="w-full flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-purple-600" />
              {t({ en: 'Pages', ar: 'الصفحات' })}
              <Badge variant="secondary">{coverageData.pages.length}</Badge>
            </CardTitle>
            {expandedSections.pages ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </CardHeader>
        {expandedSections.pages && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {coverageData.pages.map((page, i) => (
                <div key={i} className="p-3 border rounded-lg bg-green-50/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">{page.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Components */}
      <Card>
        <CardHeader>
          <button onClick={() => toggleSection('components')} className="w-full flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-orange-600" />
              {t({ en: 'Components', ar: 'المكونات' })}
              <Badge variant="secondary">{coverageData.components.length}</Badge>
            </CardTitle>
            {expandedSections.components ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </CardHeader>
        {expandedSections.components && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coverageData.components.map((comp, i) => (
                <div key={i} className="p-3 border rounded-lg bg-green-50/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">{comp.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* DB Functions */}
      <Card>
        <CardHeader>
          <button onClick={() => toggleSection('dbFunctions')} className="w-full flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-teal-600" />
              {t({ en: 'Database Functions', ar: 'دوال قاعدة البيانات' })}
              <Badge variant="secondary">{coverageData.dbFunctions.length}</Badge>
            </CardTitle>
            {expandedSections.dbFunctions ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </CardHeader>
        {expandedSections.dbFunctions && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coverageData.dbFunctions.map((fn, i) => (
                <div key={i} className="p-3 border rounded-lg bg-green-50/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm font-mono">{fn.name}()</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{fn.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <button onClick={() => toggleSection('features')} className="w-full flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              {t({ en: 'Features', ar: 'المميزات' })}
              <Badge variant="secondary">{coverageData.features.length}</Badge>
            </CardTitle>
            {expandedSections.features ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </CardHeader>
        {expandedSections.features && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {coverageData.features.map((feature, i) => (
                <div key={i} className="p-3 border rounded-lg bg-green-50/50 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{feature.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
