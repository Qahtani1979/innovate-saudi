import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Menu, Shield, CheckCircle, XCircle, Search, Lock, Unlock,
  Users, Eye, Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PermissionGate from '@/components/permissions/PermissionGate';

// Menu items with their RBAC configuration
const menuItems = [
  // Public pages
  { path: '/', name: 'Home', isPublic: true, requiredPermission: null },
  { path: '/about', name: 'About', isPublic: true, requiredPermission: null },
  { path: '/contact', name: 'Contact', isPublic: true, requiredPermission: null },
  { path: '/news', name: 'News', isPublic: true, requiredPermission: null },
  
  // Auth-required pages
  { path: '/challenges', name: 'Challenges', isPublic: false, requiredPermission: 'challenges_view' },
  { path: '/pilots', name: 'Pilots', isPublic: false, requiredPermission: 'pilots_view' },
  { path: '/solutions', name: 'Solutions', isPublic: false, requiredPermission: 'solutions_view' },
  { path: '/programs', name: 'Programs', isPublic: false, requiredPermission: 'programs_view' },
  { path: '/organizations', name: 'Organizations', isPublic: false, requiredPermission: 'organizations_view' },
  { path: '/rd-projects', name: 'R&D Projects', isPublic: false, requiredPermission: 'rd_view' },
  { path: '/living-labs', name: 'Living Labs', isPublic: false, requiredPermission: 'living_labs_view' },
  
  // Dashboard pages
  { path: '/dashboard', name: 'Dashboard', isPublic: false, requiredPermission: 'dashboard_view' },
  { path: '/my-challenges', name: 'My Challenges', isPublic: false, requiredPermission: 'challenges_view' },
  { path: '/my-pilots', name: 'My Pilots', isPublic: false, requiredPermission: 'pilots_view' },
  
  // Admin pages
  { path: '/admin-portal', name: 'Admin Portal', isPublic: false, requiredPermission: 'admin_access', requireAdmin: true },
  { path: '/user-management', name: 'User Management', isPublic: false, requiredPermission: 'users_manage', requireAdmin: true },
  { path: '/rbac-hub', name: 'RBAC Hub', isPublic: false, requiredPermission: 'rbac_manage', requireAdmin: true },
  { path: '/role-permission-manager', name: 'Role Manager', isPublic: false, requiredPermission: 'roles_manage', requireAdmin: true },
  { path: '/delegation-manager', name: 'Delegation Manager', isPublic: false, requiredPermission: 'delegation_manage', requireAdmin: true },
  
  // Coverage reports
  { path: '/challenge-coverage-report', name: 'Challenge Coverage', isPublic: false, requiredPermission: 'reports_view', requireAdmin: true },
  { path: '/pilot-coverage-report', name: 'Pilot Coverage', isPublic: false, requiredPermission: 'reports_view', requireAdmin: true },
  { path: '/rbac-coverage-report', name: 'RBAC Coverage', isPublic: false, requiredPermission: 'reports_view', requireAdmin: true },
  
  // Data management
  { path: '/bulk-data-operations', name: 'Bulk Operations', isPublic: false, requiredPermission: 'data_import', requireAdmin: true },
  { path: '/data-management-hub', name: 'Data Management', isPublic: false, requiredPermission: 'data_manage', requireAdmin: true },
];

function MenuRBACContentInner() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fetch roles and permissions
  const { data: roles = [] } = useQuery({
    queryKey: ['menu-rbac-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['menu-rbac-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('permissions').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rolePermissions = [] } = useQuery({
    queryKey: ['menu-rbac-role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('role_permissions').select('*, permissions(code)');
      if (error) throw error;
      return data || [];
    }
  });

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.path.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === 'public') return matchesSearch && item.isPublic;
      if (filterType === 'protected') return matchesSearch && !item.isPublic && !item.requireAdmin;
      if (filterType === 'admin') return matchesSearch && item.requireAdmin;
      return matchesSearch;
    });
  }, [searchTerm, filterType]);

  const stats = useMemo(() => {
    const total = menuItems.length;
    const publicPages = menuItems.filter(i => i.isPublic).length;
    const protectedPages = menuItems.filter(i => !i.isPublic && !i.requireAdmin).length;
    const adminPages = menuItems.filter(i => i.requireAdmin).length;
    const withPermissions = menuItems.filter(i => i.requiredPermission).length;
    
    return { total, publicPages, protectedPages, adminPages, withPermissions };
  }, []);

  // Check which roles have access to a permission
  const getRolesWithPermission = (permissionCode) => {
    if (!permissionCode) return [];
    const perm = permissions.find(p => p.code === permissionCode);
    if (!perm) return [];
    
    return rolePermissions
      .filter(rp => rp.permission_id === perm.id)
      .map(rp => roles.find(r => r.id === rp.role_id)?.name)
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Menu className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Total Pages', ar: 'إجمالي الصفحات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Unlock className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.publicPages}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Public', ar: 'عامة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Lock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.protectedPages}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Protected', ar: 'محمية' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.adminPages}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Admin Only', ar: 'للمسؤولين' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Eye className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.withPermissions}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'With Permissions', ar: 'بصلاحيات' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Coverage */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t({ en: 'Menu RBAC Coverage', ar: 'تغطية صلاحيات القائمة' })}</span>
            <Badge className="bg-green-600 text-white">
              {Math.round((stats.withPermissions / stats.total) * 100)}%
            </Badge>
          </div>
          <Progress value={(stats.withPermissions / stats.total) * 100} className="bg-green-500" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.withPermissions} of {stats.total} pages have permission requirements defined
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t({ en: 'Search pages...', ar: 'البحث في الصفحات...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })}</SelectItem>
            <SelectItem value="public">{t({ en: 'Public', ar: 'عامة' })}</SelectItem>
            <SelectItem value="protected">{t({ en: 'Protected', ar: 'محمية' })}</SelectItem>
            <SelectItem value="admin">{t({ en: 'Admin', ar: 'مسؤول' })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Menu Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            {t({ en: 'Menu Items & Permissions', ar: 'عناصر القائمة والصلاحيات' })}
            <Badge variant="secondary">{filteredItems.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredItems.map((item, i) => {
              const rolesWithAccess = getRolesWithPermission(item.requiredPermission);
              
              return (
                <div key={i} className={`p-3 border rounded-lg ${
                  item.isPublic ? 'bg-green-50/50 border-green-200' :
                  item.requireAdmin ? 'bg-red-50/50 border-red-200' :
                  'bg-yellow-50/50 border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.isPublic ? (
                        <Unlock className="h-4 w-4 text-green-600" />
                      ) : item.requireAdmin ? (
                        <Shield className="h-4 w-4 text-red-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-yellow-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.requiredPermission ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.requiredPermission}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {t({ en: 'No permission', ar: 'بدون صلاحية' })}
                        </Badge>
                      )}
                      {item.isPublic && (
                        <Badge className="bg-green-600 text-white text-xs">
                          {t({ en: 'Public', ar: 'عامة' })}
                        </Badge>
                      )}
                      {item.requireAdmin && (
                        <Badge className="bg-red-600 text-white text-xs">
                          {t({ en: 'Admin', ar: 'مسؤول' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {rolesWithAccess.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {rolesWithAccess.map((role, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap with PermissionGate for admin-only access
export default function MenuRBACContent() {
  const { t } = useLanguage();
  
  return (
    <PermissionGate 
      requireAdmin 
      fallback={
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium">
              {t({ en: 'Admin access required', ar: 'يتطلب صلاحيات المسؤول' })}
            </p>
          </CardContent>
        </Card>
      }
    >
      <MenuRBACContentInner />
    </PermissionGate>
  );
}
