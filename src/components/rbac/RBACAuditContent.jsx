import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { 
  RefreshCw, Users, Key, AlertTriangle, CheckCircle, 
  XCircle, Clock, Activity, FileWarning, UserX, KeyRound,
  Loader2
} from 'lucide-react';

export default function RBACAuditContent() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['audit-all-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('user_id, user_email, full_name, created_at');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userRoles = [], isLoading: loadingUserRoles } = useQuery({
    queryKey: ['audit-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['audit-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: permissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ['audit-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('permissions').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userFunctionalRoles = [], isLoading: loadingUFR } = useQuery({
    queryKey: ['audit-user-functional-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_functional_roles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rolePermissions = [], isLoading: loadingRP } = useQuery({
    queryKey: ['audit-role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('role_permissions').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: delegations = [], isLoading: loadingDelegations } = useQuery({
    queryKey: ['audit-delegations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('delegation_rules').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: accessLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['audit-access-logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const isLoading = loadingUsers || loadingUserRoles || loadingRoles || loadingPermissions || loadingUFR || loadingRP || loadingDelegations || loadingLogs;

  const computeAuditResults = useCallback(() => {
    const userIdsWithRoles = new Set(userRoles.map(ur => ur.user_id));
    const userIdsWithFunctionalRoles = new Set(userFunctionalRoles.map(ufr => ufr.user_id));
    
    const usersWithoutRoles = allUsers.filter(u => !userIdsWithRoles.has(u.user_id) && !userIdsWithFunctionalRoles.has(u.user_id));
    const roleIdsWithUsers = new Set(userFunctionalRoles.map(ufr => ufr.role_id));
    const rolesWithoutUsers = roles.filter(r => !roleIdsWithUsers.has(r.id));
    const permissionIdsInRoles = new Set(rolePermissions.map(rp => rp.permission_id));
    const orphanedPermissions = permissions.filter(p => !permissionIdsInRoles.has(p.id));
    const now = new Date();
    const expiredAssignments = userFunctionalRoles.filter(ufr => ufr.expires_at && new Date(ufr.expires_at) < now);
    const inactiveAssignments = userFunctionalRoles.filter(ufr => !ufr.is_active);
    const expiredDelegations = delegations.filter(d => d.end_date && new Date(d.end_date) < now);
    const activeDelegations = delegations.filter(d => d.is_active && (!d.end_date || new Date(d.end_date) >= now));

    const roleAssignmentMap = new Map();
    userFunctionalRoles.forEach(ufr => {
      const key = `${ufr.user_id}-${ufr.role_id}`;
      if (roleAssignmentMap.has(key)) roleAssignmentMap.get(key).push(ufr);
      else roleAssignmentMap.set(key, [ufr]);
    });
    const duplicateAssignments = [...roleAssignmentMap.entries()].filter(([, a]) => a.length > 1);

    const rolePermissionCount = new Map();
    rolePermissions.forEach(rp => rolePermissionCount.set(rp.role_id, (rolePermissionCount.get(rp.role_id) || 0) + 1));
    const excessivePermissionRoles = roles.filter(r => (rolePermissionCount.get(r.id) || 0) > 20);

    const issues = [usersWithoutRoles.length > 0, rolesWithoutUsers.length > 0, orphanedPermissions.length > 0, expiredAssignments.length > 0, inactiveAssignments.length > 0, expiredDelegations.length > 0, duplicateAssignments.length > 0, excessivePermissionRoles.length > 0];
    const healthScore = Math.max(0, 100 - (issues.filter(Boolean).length * 12.5));

    return { usersWithoutRoles, rolesWithoutUsers, orphanedPermissions, expiredAssignments, inactiveAssignments, expiredDelegations, activeDelegations, duplicateAssignments, excessivePermissionRoles, healthScore, totalUsers: allUsers.length, totalRoles: roles.length, totalPermissions: permissions.length, totalAssignments: userFunctionalRoles.length };
  }, [allUsers, userRoles, roles, permissions, userFunctionalRoles, rolePermissions, delegations]);

  const auditResults = computeAuditResults();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['audit-all-users'] }),
      queryClient.invalidateQueries({ queryKey: ['audit-user-roles'] }),
      queryClient.invalidateQueries({ queryKey: ['audit-roles'] }),
      queryClient.invalidateQueries({ queryKey: ['audit-permissions'] }),
      queryClient.invalidateQueries({ queryKey: ['audit-user-functional-roles'] }),
      queryClient.invalidateQueries({ queryKey: ['audit-role-permissions'] }),
      queryClient.invalidateQueries({ queryKey: ['audit-delegations'] }),
      queryClient.invalidateQueries({ queryKey: ['audit-access-logs'] })
    ]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const getHealthColor = (score) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const getHealthBg = (score) => score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  const AuditCard = ({ title, icon: Icon, count, severity, items, emptyMessage }) => (
    <Card className={severity === 'critical' ? 'border-red-300 bg-red-50/50' : severity === 'warning' ? 'border-yellow-300 bg-yellow-50/50' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${severity === 'critical' ? 'text-red-600' : severity === 'warning' ? 'text-yellow-600' : 'text-slate-600'}`} />
            {title}
          </span>
          <Badge variant={count > 0 ? (severity === 'critical' ? 'destructive' : 'outline') : 'secondary'}>{count}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {items.slice(0, 5).map((item, i) => (
              <div key={i} className="text-xs p-1.5 bg-background rounded border">{item}</div>
            ))}
            {items.length > 5 && <p className="text-xs text-muted-foreground">+{items.length - 5} more...</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {lastRefresh && <span>{t({ en: 'Last refresh:', ar: 'آخر تحديث:' })} {lastRefresh.toLocaleTimeString()}</span>}
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t({ en: 'Refresh Audit', ar: 'تحديث التدقيق' })}
        </Button>
      </div>

      {/* Health Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t({ en: 'RBAC Health Score', ar: 'درجة صحة النظام' })}</span>
                <span className={`text-2xl font-bold ${getHealthColor(auditResults.healthScore)}`}>{auditResults.healthScore.toFixed(0)}%</span>
              </div>
              <Progress value={auditResults.healthScore} className={getHealthBg(auditResults.healthScore)} />
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold">{auditResults.totalUsers}</p><p className="text-xs text-muted-foreground">{t({ en: 'Users', ar: 'المستخدمون' })}</p></div>
              <div><p className="text-2xl font-bold">{auditResults.totalRoles}</p><p className="text-xs text-muted-foreground">{t({ en: 'Roles', ar: 'الأدوار' })}</p></div>
              <div><p className="text-2xl font-bold">{auditResults.totalPermissions}</p><p className="text-xs text-muted-foreground">{t({ en: 'Permissions', ar: 'الصلاحيات' })}</p></div>
              <div><p className="text-2xl font-bold">{auditResults.totalAssignments}</p><p className="text-xs text-muted-foreground">{t({ en: 'Assignments', ar: 'التعيينات' })}</p></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AuditCard title={t({ en: 'Users Without Roles', ar: 'مستخدمون بدون أدوار' })} icon={UserX} count={auditResults.usersWithoutRoles.length} severity={auditResults.usersWithoutRoles.length > 5 ? 'critical' : auditResults.usersWithoutRoles.length > 0 ? 'warning' : 'ok'} items={auditResults.usersWithoutRoles.map(u => u.user_email || u.full_name || 'Unknown')} emptyMessage={t({ en: 'All users have roles assigned', ar: 'جميع المستخدمين لديهم أدوار' })} />
        <AuditCard title={t({ en: 'Roles Without Users', ar: 'أدوار بدون مستخدمين' })} icon={KeyRound} count={auditResults.rolesWithoutUsers.length} severity={auditResults.rolesWithoutUsers.length > 3 ? 'warning' : 'ok'} items={auditResults.rolesWithoutUsers.map(r => r.name)} emptyMessage={t({ en: 'All roles have users assigned', ar: 'جميع الأدوار لديها مستخدمون' })} />
        <AuditCard title={t({ en: 'Orphaned Permissions', ar: 'صلاحيات يتيمة' })} icon={FileWarning} count={auditResults.orphanedPermissions.length} severity={auditResults.orphanedPermissions.length > 5 ? 'warning' : 'ok'} items={auditResults.orphanedPermissions.map(p => p.code || p.name)} emptyMessage={t({ en: 'All permissions are assigned', ar: 'جميع الصلاحيات مُعينة' })} />
        <AuditCard title={t({ en: 'Expired Assignments', ar: 'تعيينات منتهية' })} icon={Clock} count={auditResults.expiredAssignments.length} severity={auditResults.expiredAssignments.length > 0 ? 'critical' : 'ok'} items={auditResults.expiredAssignments.map(a => `Role ${a.role_id?.slice(0, 8)}... - User ${a.user_id?.slice(0, 8)}...`)} emptyMessage={t({ en: 'No expired assignments', ar: 'لا توجد تعيينات منتهية' })} />
        <AuditCard title={t({ en: 'Inactive Assignments', ar: 'تعيينات غير نشطة' })} icon={XCircle} count={auditResults.inactiveAssignments.length} severity={auditResults.inactiveAssignments.length > 10 ? 'warning' : 'ok'} items={auditResults.inactiveAssignments.map(a => `Role ${a.role_id?.slice(0, 8)}...`)} emptyMessage={t({ en: 'All assignments are active', ar: 'جميع التعيينات نشطة' })} />
        <AuditCard title={t({ en: 'Excessive Permissions', ar: 'صلاحيات مفرطة' })} icon={AlertTriangle} count={auditResults.excessivePermissionRoles.length} severity={auditResults.excessivePermissionRoles.length > 0 ? 'warning' : 'ok'} items={auditResults.excessivePermissionRoles.map(r => r.name)} emptyMessage={t({ en: 'No excessive permissions', ar: 'لا توجد صلاحيات مفرطة' })} />
      </div>

      {/* Delegations & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />{t({ en: 'Active Delegations', ar: 'التفويضات النشطة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {auditResults.activeDelegations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t({ en: 'No active delegations', ar: 'لا توجد تفويضات نشطة' })}</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {auditResults.activeDelegations.map((d, i) => (
                  <div key={i} className="p-2 border rounded text-xs">
                    <p className="font-medium">{d.delegator_email} → {d.delegate_email}</p>
                    <p className="text-muted-foreground">Until: {new Date(d.end_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />{t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {accessLogs.slice(0, 10).map((log, i) => (
                <div key={i} className="p-2 border rounded text-xs flex justify-between">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
