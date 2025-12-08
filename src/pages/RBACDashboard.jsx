import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Shield, Users, Eye, Lock, Activity, TrendingUp, Network, BarChart3, AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import PermissionInheritanceVisualizer from '../components/access/PermissionInheritanceVisualizer';
import RolePermissionMatrix from '../components/access/RolePermissionMatrix';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RBACDashboardPage() {
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list()
  });

  const { data: delegations = [] } = useQuery({
    queryKey: ['delegations'],
    queryFn: () => base44.entities.DelegationRule.list()
  });

  const { data: accessLogs = [] } = useQuery({
    queryKey: ['recent-access-logs'],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return base44.entities.AccessLog.filter({
        timestamp: { $gte: sevenDaysAgo.toISOString() }
      });
    }
  });

  // Analytics
  const analytics = React.useMemo(() => {
    const roleUsage = {};
    const permissionUsage = {};
    const entityAccess = {};

    roles.forEach(role => {
      const userCount = users.filter(u => u.assigned_roles?.includes(role.id)).length;
      roleUsage[role.name] = {
        users: userCount,
        permissions: role.permissions?.length || 0,
        active: userCount > 0
      };

      role.permissions?.forEach(perm => {
        permissionUsage[perm] = (permissionUsage[perm] || 0) + userCount;
      });
    });

    accessLogs.forEach(log => {
      if (log.entity_type) {
        entityAccess[log.entity_type] = (entityAccess[log.entity_type] || 0) + 1;
      }
    });

    return {
      roleUsage,
      permissionUsage,
      entityAccess,
      activeDelegations: delegations.filter(d => d.is_active).length,
      avgPermissionsPerRole: roles.reduce((sum, r) => sum + (r.permissions?.length || 0), 0) / roles.length
    };
  }, [users, roles, teams, delegations, accessLogs]);

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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-8 text-white">
        <Badge className="bg-white/20 text-white border-white/40 mb-3">
          {t({ en: 'Access Control', ar: 'التحكم بالوصول' })}
        </Badge>
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'RBAC Dashboard', ar: 'لوحة تحكم RBAC' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Comprehensive access control analytics and management', ar: 'تحليلات وإدارة شاملة للتحكم بالوصول' })}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Shield className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold">{roles.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Roles', ar: 'الأدوار' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Users', ar: 'المستخدمين' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Network className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold">{teams.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Teams', ar: 'الفرق' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Activity className="h-8 w-8 text-orange-600 mb-2" />
            <p className="text-3xl font-bold">{analytics.activeDelegations}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Delegations', ar: 'التفويضات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Eye className="h-8 w-8 text-teal-600 mb-2" />
            <p className="text-3xl font-bold">{accessLogs.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Access Events', ar: 'أحداث الوصول' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Permission Inheritance Visualizer */}
      <PermissionInheritanceVisualizer users={users} roles={roles} teams={teams} delegations={delegations} />

      {/* Role Permission Matrix */}
      <RolePermissionMatrix roles={roles} users={users} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {t({ en: 'Role Usage Distribution', ar: 'توزيع استخدام الأدوار' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleUsageData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              {t({ en: 'Top 10 Permissions Used', ar: 'أكثر 10 صلاحيات استخداماً' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPermissions}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              {t({ en: 'Entity Access Distribution', ar: 'توزيع الوصول للكيانات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={entityAccessData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {entityAccessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              {t({ en: 'Role Complexity', ar: 'تعقيد الأدوار' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roleUsageData.slice(0, 8).map((role, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{role.name}</span>
                    <span className="text-slate-600">{role.permissions} perms</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${Math.min(100, (role.permissions / 50) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inactive Roles Alert */}
      {roleUsageData.filter(r => r.users === 0).length > 0 && (
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'Inactive Roles Detected', ar: 'أدوار غير نشطة مكتشفة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 mb-3">
              {t({ en: 'The following roles have no users assigned:', ar: 'الأدوار التالية ليس لديها مستخدمين معينين:' })}
            </p>
            <div className="flex flex-wrap gap-2">
              {roleUsageData.filter(r => r.users === 0).map((role, i) => (
                <Badge key={i} variant="outline" className="text-amber-700">
                  {role.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

        <Link to={createPageUrl('RBACAuditReport')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-red-400">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="font-medium">{t({ en: 'Security Audit', ar: 'تدقيق الأمان' })}</p>
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

        <Link to={createPageUrl('TeamManagement')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-400">
            <CardContent className="pt-6 text-center">
              <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">{t({ en: 'Teams', ar: 'الفرق' })}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default ProtectedPage(RBACDashboardPage, {
  requireAdmin: true
});