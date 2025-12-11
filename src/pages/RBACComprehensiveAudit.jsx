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
  RefreshCw, Shield, Users, Key, AlertTriangle, CheckCircle, 
  XCircle, Clock, Activity, FileWarning, UserX, KeyRound,
  Loader2, Download
} from 'lucide-react';

export default function RBACComprehensiveAudit() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fetch all users
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['audit-all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, user_email, full_name, created_at');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch all user roles assignments
  const { data: userRoles = [], isLoading: loadingUserRoles } = useQuery({
    queryKey: ['audit-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch all functional roles
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['audit-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch all permissions
  const { data: permissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ['audit-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user functional roles
  const { data: userFunctionalRoles = [], isLoading: loadingUFR } = useQuery({
    queryKey: ['audit-user-functional-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_functional_roles')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch role permissions
  const { data: rolePermissions = [], isLoading: loadingRP } = useQuery({
    queryKey: ['audit-role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch delegation rules
  const { data: delegations = [], isLoading: loadingDelegations } = useQuery({
    queryKey: ['audit-delegations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delegation_rules')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch access logs for recent activity
  const { data: accessLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['audit-access-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const isLoading = loadingUsers || loadingUserRoles || loadingRoles || 
                    loadingPermissions || loadingUFR || loadingRP || 
                    loadingDelegations || loadingLogs;

  // Compute audit results
  const computeAuditResults = useCallback(() => {
    const userIdsWithRoles = new Set(userRoles.map(ur => ur.user_id));
    const userIdsWithFunctionalRoles = new Set(userFunctionalRoles.map(ufr => ufr.user_id));
    
    // Users without any roles
    const usersWithoutRoles = allUsers.filter(u => 
      !userIdsWithRoles.has(u.user_id) && !userIdsWithFunctionalRoles.has(u.user_id)
    );

    // Roles without any users
    const roleIdsWithUsers = new Set(userFunctionalRoles.map(ufr => ufr.role_id));
    const rolesWithoutUsers = roles.filter(r => !roleIdsWithUsers.has(r.id));

    // Orphaned permissions (not assigned to any role)
    const permissionIdsInRoles = new Set(rolePermissions.map(rp => rp.permission_id));
    const orphanedPermissions = permissions.filter(p => !permissionIdsInRoles.has(p.id));

    // Expired functional role assignments
    const now = new Date();
    const expiredAssignments = userFunctionalRoles.filter(ufr => 
      ufr.expires_at && new Date(ufr.expires_at) < now
    );

    // Inactive assignments
    const inactiveAssignments = userFunctionalRoles.filter(ufr => !ufr.is_active);

    // Expired delegations
    const expiredDelegations = delegations.filter(d => 
      d.end_date && new Date(d.end_date) < now
    );

    // Active delegations
    const activeDelegations = delegations.filter(d => 
      d.is_active && (!d.end_date || new Date(d.end_date) >= now)
    );

    // Duplicate role assignments
    const roleAssignmentMap = new Map();
    userFunctionalRoles.forEach(ufr => {
      const key = `${ufr.user_id}-${ufr.role_id}`;
      if (roleAssignmentMap.has(key)) {
        roleAssignmentMap.get(key).push(ufr);
      } else {
        roleAssignmentMap.set(key, [ufr]);
      }
    });
    const duplicateAssignments = [...roleAssignmentMap.entries()]
      .filter(([, assignments]) => assignments.length > 1);

    // Roles with excessive permissions (> 20)
    const rolePermissionCount = new Map();
    rolePermissions.forEach(rp => {
      rolePermissionCount.set(rp.role_id, (rolePermissionCount.get(rp.role_id) || 0) + 1);
    });
    const excessivePermissionRoles = roles.filter(r => 
      (rolePermissionCount.get(r.id) || 0) > 20
    );

    // Calculate health score
    const issues = [
      usersWithoutRoles.length > 0,
      rolesWithoutUsers.length > 0,
      orphanedPermissions.length > 0,
      expiredAssignments.length > 0,
      inactiveAssignments.length > 0,
      expiredDelegations.length > 0,
      duplicateAssignments.length > 0,
      excessivePermissionRoles.length > 0
    ];
    const issueCount = issues.filter(Boolean).length;
    const healthScore = Math.max(0, 100 - (issueCount * 12.5));

    return {
      usersWithoutRoles,
      rolesWithoutUsers,
      orphanedPermissions,
      expiredAssignments,
      inactiveAssignments,
      expiredDelegations,
      activeDelegations,
      duplicateAssignments,
      excessivePermissionRoles,
      healthScore,
      totalUsers: allUsers.length,
      totalRoles: roles.length,
      totalPermissions: permissions.length,
      totalAssignments: userFunctionalRoles.length
    };
  }, [allUsers, userRoles, roles, permissions, userFunctionalRoles, rolePermissions, delegations]);

  const auditResults = computeAuditResults();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['audit-all-users'] });
    await queryClient.invalidateQueries({ queryKey: ['audit-user-roles'] });
    await queryClient.invalidateQueries({ queryKey: ['audit-roles'] });
    await queryClient.invalidateQueries({ queryKey: ['audit-permissions'] });
    await queryClient.invalidateQueries({ queryKey: ['audit-user-functional-roles'] });
    await queryClient.invalidateQueries({ queryKey: ['audit-role-permissions'] });
    await queryClient.invalidateQueries({ queryKey: ['audit-delegations'] });
    await queryClient.invalidateQueries({ queryKey: ['audit-access-logs'] });
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const AuditCard = ({ title, icon: Icon, count, severity, items, emptyMessage }) => (
    <Card className={severity === 'critical' ? 'border-red-300 bg-red-50/50' : 
                     severity === 'warning' ? 'border-yellow-300 bg-yellow-50/50' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${
              severity === 'critical' ? 'text-red-600' : 
              severity === 'warning' ? 'text-yellow-600' : 'text-slate-600'
            }`} />
            {title}
          </span>
          <Badge variant={count > 0 ? (severity === 'critical' ? 'destructive' : 'outline') : 'secondary'}>
            {count}
          </Badge>
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
              <div key={i} className="text-xs p-1.5 bg-background rounded border">
                {item}
              </div>
            ))}
            {items.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{items.length - 5} more...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {t({ en: 'RBAC Comprehensive Audit', ar: 'تدقيق شامل لنظام الصلاحيات' })}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t({ en: 'Real-time security analysis of role-based access control', ar: 'تحليل أمني في الوقت الفعلي للتحكم في الوصول القائم على الأدوار' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              {t({ en: 'Last refresh:', ar: 'آخر تحديث:' })} {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t({ en: 'Refresh Audit', ar: 'تحديث التدقيق' })}
          </Button>
        </div>
      </div>

      {/* Health Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {t({ en: 'RBAC Health Score', ar: 'درجة صحة النظام' })}
                </span>
                <span className={`text-2xl font-bold ${getHealthColor(auditResults.healthScore)}`}>
                  {auditResults.healthScore.toFixed(0)}%
                </span>
              </div>
              <Progress value={auditResults.healthScore} className={getHealthBg(auditResults.healthScore)} />
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{auditResults.totalUsers}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Users', ar: 'المستخدمون' })}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{auditResults.totalRoles}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Roles', ar: 'الأدوار' })}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{auditResults.totalPermissions}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Permissions', ar: 'الصلاحيات' })}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{auditResults.totalAssignments}</p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Assignments', ar: 'التعيينات' })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Tabs */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            {t({ en: 'Issues', ar: 'المشاكل' })}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {t({ en: 'Users', ar: 'المستخدمون' })}
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1">
            <Key className="h-4 w-4" />
            {t({ en: 'Roles', ar: 'الأدوار' })}
          </TabsTrigger>
          <TabsTrigger value="delegations" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {t({ en: 'Delegations', ar: 'التفويضات' })}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            {t({ en: 'Activity', ar: 'النشاط' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AuditCard
              title={t({ en: 'Users Without Roles', ar: 'مستخدمون بدون أدوار' })}
              icon={UserX}
              count={auditResults.usersWithoutRoles.length}
              severity={auditResults.usersWithoutRoles.length > 5 ? 'critical' : auditResults.usersWithoutRoles.length > 0 ? 'warning' : 'ok'}
              items={auditResults.usersWithoutRoles.map(u => u.user_email || u.full_name || 'Unknown')}
              emptyMessage={t({ en: 'All users have roles assigned', ar: 'جميع المستخدمين لديهم أدوار' })}
            />
            
            <AuditCard
              title={t({ en: 'Roles Without Users', ar: 'أدوار بدون مستخدمين' })}
              icon={KeyRound}
              count={auditResults.rolesWithoutUsers.length}
              severity={auditResults.rolesWithoutUsers.length > 3 ? 'warning' : 'ok'}
              items={auditResults.rolesWithoutUsers.map(r => r.name)}
              emptyMessage={t({ en: 'All roles have users assigned', ar: 'جميع الأدوار لديها مستخدمون' })}
            />
            
            <AuditCard
              title={t({ en: 'Orphaned Permissions', ar: 'صلاحيات يتيمة' })}
              icon={FileWarning}
              count={auditResults.orphanedPermissions.length}
              severity={auditResults.orphanedPermissions.length > 5 ? 'warning' : 'ok'}
              items={auditResults.orphanedPermissions.map(p => p.code || p.name)}
              emptyMessage={t({ en: 'All permissions are assigned to roles', ar: 'جميع الصلاحيات مُعينة لأدوار' })}
            />
            
            <AuditCard
              title={t({ en: 'Expired Assignments', ar: 'تعيينات منتهية' })}
              icon={Clock}
              count={auditResults.expiredAssignments.length}
              severity={auditResults.expiredAssignments.length > 0 ? 'critical' : 'ok'}
              items={auditResults.expiredAssignments.map(a => `Role ${a.role_id} - User ${a.user_id}`)}
              emptyMessage={t({ en: 'No expired role assignments', ar: 'لا توجد تعيينات منتهية' })}
            />
            
            <AuditCard
              title={t({ en: 'Inactive Assignments', ar: 'تعيينات غير نشطة' })}
              icon={XCircle}
              count={auditResults.inactiveAssignments.length}
              severity={auditResults.inactiveAssignments.length > 10 ? 'warning' : 'ok'}
              items={auditResults.inactiveAssignments.map(a => `Role ${a.role_id} - User ${a.user_id}`)}
              emptyMessage={t({ en: 'All assignments are active', ar: 'جميع التعيينات نشطة' })}
            />
            
            <AuditCard
              title={t({ en: 'Excessive Permissions', ar: 'صلاحيات مفرطة' })}
              icon={AlertTriangle}
              count={auditResults.excessivePermissionRoles.length}
              severity={auditResults.excessivePermissionRoles.length > 0 ? 'warning' : 'ok'}
              items={auditResults.excessivePermissionRoles.map(r => r.name)}
              emptyMessage={t({ en: 'No roles with excessive permissions', ar: 'لا توجد أدوار بصلاحيات مفرطة' })}
            />
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t({ en: 'User Role Distribution', ar: 'توزيع أدوار المستخدمين' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allUsers.map(user => {
                  const userAppRoles = userRoles.filter(ur => ur.user_id === user.user_id);
                  const userFuncRoles = userFunctionalRoles.filter(ufr => ufr.user_id === user.user_id && ufr.is_active);
                  const hasAnyRole = userAppRoles.length > 0 || userFuncRoles.length > 0;
                  
                  return (
                    <div key={user.user_id} className={`p-3 rounded border ${!hasAnyRole ? 'border-red-200 bg-red-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{user.full_name || user.user_email}</p>
                          <p className="text-xs text-muted-foreground">{user.user_email}</p>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {userAppRoles.map(ur => (
                            <Badge key={ur.id} variant="default" className="text-xs">
                              {ur.role}
                            </Badge>
                          ))}
                          {userFuncRoles.map(ufr => {
                            const role = roles.find(r => r.id === ufr.role_id);
                            return (
                              <Badge key={ufr.id} variant="outline" className="text-xs">
                                {role?.name || 'Unknown'}
                              </Badge>
                            );
                          })}
                          {!hasAnyRole && (
                            <Badge variant="destructive" className="text-xs">
                              {t({ en: 'No Roles', ar: 'بدون أدوار' })}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t({ en: 'Role Permission Analysis', ar: 'تحليل صلاحيات الأدوار' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {roles.map(role => {
                  const permCount = rolePermissions.filter(rp => rp.role_id === role.id).length;
                  const userCount = userFunctionalRoles.filter(ufr => ufr.role_id === role.id && ufr.is_active).length;
                  
                  return (
                    <div key={role.id} className={`p-3 rounded border ${userCount === 0 ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{role.name}</p>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {permCount} {t({ en: 'permissions', ar: 'صلاحيات' })}
                          </Badge>
                          <Badge variant={userCount === 0 ? 'secondary' : 'default'} className="text-xs">
                            {userCount} {t({ en: 'users', ar: 'مستخدمين' })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delegations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t({ en: 'Active Delegations', ar: 'التفويضات النشطة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditResults.activeDelegations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t({ en: 'No active delegations', ar: 'لا توجد تفويضات نشطة' })}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {auditResults.activeDelegations.map(d => (
                      <div key={d.id} className="p-2 rounded border text-xs">
                        <p><strong>{d.delegator_email}</strong> → {d.delegate_email}</p>
                        <p className="text-muted-foreground">
                          {t({ en: 'Until:', ar: 'حتى:' })} {new Date(d.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  {t({ en: 'Expired Delegations', ar: 'التفويضات المنتهية' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditResults.expiredDelegations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t({ en: 'No expired delegations', ar: 'لا توجد تفويضات منتهية' })}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {auditResults.expiredDelegations.map(d => (
                      <div key={d.id} className="p-2 rounded border border-red-200 bg-red-50 text-xs">
                        <p><strong>{d.delegator_email}</strong> → {d.delegate_email}</p>
                        <p className="text-red-600">
                          {t({ en: 'Expired:', ar: 'انتهى:' })} {new Date(d.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t({ en: 'Recent Access Activity', ar: 'نشاط الوصول الأخير' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accessLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'No recent access logs', ar: 'لا توجد سجلات وصول حديثة' })}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {accessLogs.slice(0, 20).map(log => (
                    <div key={log.id} className="p-2 rounded border text-xs flex items-center justify-between">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-muted-foreground">{log.user_email || 'Anonymous'}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {log.entity_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
