import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Shield, Users, Eye, Activity, TrendingUp, Network, BarChart3, AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PermissionInheritanceVisualizer from '@/components/access/PermissionInheritanceVisualizer';
import RolePermissionMatrix from '@/components/access/RolePermissionMatrix';

export default function RBACDashboardContent() {
  const { t } = useLanguage();

  const { data: users = [] } = useQuery({
    queryKey: ['rbac-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['rbac-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userFunctionalRoles = [] } = useQuery({
    queryKey: ['rbac-user-functional-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_functional_roles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rolePermissions = [] } = useQuery({
    queryKey: ['rbac-role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('role_permissions').select('*, permissions(code)');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: delegations = [] } = useQuery({
    queryKey: ['rbac-delegations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('delegation_rules').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: accessLogs = [] } = useQuery({
    queryKey: ['rbac-access-logs'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    }
  });

  const analytics = React.useMemo(() => {
    const roleUsage = {};
    const permissionUsage = {};
    const entityAccess = {};

    roles.forEach(role => {
      const userCount = userFunctionalRoles.filter(ufr => ufr.role_id === role.id && ufr.is_active).length;
      const permCount = rolePermissions.filter(rp => rp.role_id === role.id).length;
      
      roleUsage[role.name] = { users: userCount, permissions: permCount, active: userCount > 0 };

      rolePermissions
        .filter(rp => rp.role_id === role.id)
        .forEach(rp => {
          const permCode = rp.permissions?.code || rp.permission_id;
          permissionUsage[permCode] = (permissionUsage[permCode] || 0) + userCount;
        });
    });

    accessLogs.forEach(log => {
      if (log.entity_type) {
        entityAccess[log.entity_type] = (entityAccess[log.entity_type] || 0) + 1;
      }
    });

    const totalPermissions = Object.values(roleUsage).reduce((sum, r) => sum + r.permissions, 0);
    
    return {
      roleUsage,
      permissionUsage,
      entityAccess,
      activeDelegations: delegations.filter(d => d.is_active).length,
      avgPermissionsPerRole: roles.length > 0 ? totalPermissions / roles.length : 0
    };
  }, [users, roles, userFunctionalRoles, rolePermissions, delegations, accessLogs]);

  const roleUsageData = Object.entries(analytics.roleUsage)
    .map(([name, data]) => ({ name, users: data.users, permissions: data.permissions }))
    .sort((a, b) => b.users - a.users);

  const topPermissions = Object.entries(analytics.permissionUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name: name.split('_').pop(), count }));

  const entityAccessData = Object.entries(analytics.entityAccess)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(217, 91%, 60%)', 'hsl(330, 81%, 60%)', 'hsl(190, 90%, 50%)'];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Shield className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold">{roles.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Roles', ar: 'الأدوار' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Users', ar: 'المستخدمين' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Network className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold">{userFunctionalRoles.filter(ufr => ufr.is_active).length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Assignments', ar: 'التعيينات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Activity className="h-8 w-8 text-orange-600 mb-2" />
            <p className="text-3xl font-bold">{analytics.activeDelegations}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Delegations', ar: 'التفويضات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Eye className="h-8 w-8 text-teal-600 mb-2" />
            <p className="text-3xl font-bold">{accessLogs.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Access Events', ar: 'أحداث الوصول' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Visualizers */}
      <PermissionInheritanceVisualizer users={users} roles={roles} delegations={delegations} />
      <RolePermissionMatrix roles={roles} users={users} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {t({ en: 'Role Usage', ar: 'استخدام الأدوار' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleUsageData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="hsl(var(--primary))" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              {t({ en: 'Top Permissions', ar: 'أهم الصلاحيات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPermissions}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--secondary))" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to={createPageUrl('RolePermissionManager')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-400">
            <CardContent className="pt-6 text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">{t({ en: 'Manage Roles', ar: 'إدارة الأدوار' })}</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl('DelegationManager')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-400">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">{t({ en: 'Delegations', ar: 'التفويضات' })}</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl('RoleRequestCenter')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-400">
            <CardContent className="pt-6 text-center">
              <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">{t({ en: 'Role Requests', ar: 'طلبات الأدوار' })}</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl('UserManagementHub')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-400">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="font-medium">{t({ en: 'User Management', ar: 'إدارة المستخدمين' })}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
