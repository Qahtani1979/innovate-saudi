import { useState, useMemo } from 'react';
import { useRBACRefresh } from '@/hooks/useRBACRefresh';
import { useAllUserProfiles } from '@/hooks/useUserProfile';
import { useRoles } from '@/hooks/useRoles';
import { useSystemPermissions } from '@/hooks/useSystemPermissions';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useRBACStatistics, useAccessLogs } from '@/hooks/useRBACStatistics';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import AutomatedAuditScheduler from '@/components/access/AutomatedAuditScheduler';
import PermissionGate from '@/components/permissions/PermissionGate';
import {
  RefreshCw, Users, Key, AlertTriangle, CheckCircle, CheckCircle2,
  XCircle, Clock, Activity, FileWarning, UserX, KeyRound,
  Loader2, Download, Shield, Eye, Trash2
} from 'lucide-react';

export default function RBACAuditContent() {
  const { t, language } = useLanguage();

  // Wrap entire component in admin permission gate - all queries are admin-only
  return (
    <PermissionGate requireAdmin fallback={
      <Card className="border-2 border-red-300 bg-red-50">
        <CardContent className="pt-6 text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-red-900">
            {t({ en: 'Access Denied', ar: 'الوصول مرفوض' })}
          </p>
          <p className="text-sm text-red-700">
            {t({ en: 'You need administrator privileges to view RBAC audit data.', ar: 'تحتاج صلاحيات المسؤول لعرض بيانات تدقيق النظام.' })}
          </p>
        </CardContent>
      </Card>
    }>
      <RBACAuditContentInner />
    </PermissionGate>
  );
}

function RBACAuditContentInner() {
  const { t, language } = useLanguage();
  const { isRefreshing, lastRefresh, refreshRBACData: handleRefresh } = useRBACRefresh();

  const { data: allUsers = [], isLoading: loadingUsers } = useAllUserProfiles();
  const { userRoleAssignments: userRoles, delegations } = useRBACStatistics();
  const { data: roles = [], isLoading: loadingRoles } = useRoles();
  const { data: permissions = [], isLoading: loadingPermissions } = useSystemPermissions();
  const { data: rolePermissions = [], isLoading: loadingRP } = useRolePermissions();
  const { data: accessLogs = [], isLoading: loadingLogs } = useAccessLogs(30);

  // Derive loading state from available hooks
  const loadingUserRoles = false; // useRBACStatistics doesn't export loading yet, assume ready or check later if critical
  const loadingDelegations = false;

  const isLoading = loadingUsers || loadingRoles || loadingPermissions || loadingRP || loadingLogs;

  // Generate comprehensive audit report
  const auditResults = useMemo(() => {
    const userIdsWithRoles = new Set(userRoles.map(ur => ur.user_id));

    const usersWithoutRoles = allUsers.filter(u => !userIdsWithRoles.has(u.user_id));
    const roleIdsWithUsers = new Set(userRoles.map(ur => ur.role_id));
    const rolesWithoutUsers = roles.filter(r => !roleIdsWithUsers.has(r.id));
    const permissionIdsInRoles = new Set(rolePermissions.map(rp => rp.permission_id));
    const orphanedPermissions = permissions.filter(p => !permissionIdsInRoles.has(p.id));

    const now = new Date();
    const expiredAssignments = userRoles.filter(ur => ur.expires_at && new Date(ur.expires_at) < now);
    const inactiveAssignments = userRoles.filter(ur => !ur.is_active);
    const expiredDelegations = delegations.filter(d => d.end_date && new Date(d.end_date) < now && d.is_active);
    const activeDelegations = delegations.filter(d => d.is_active && (!d.end_date || new Date(d.end_date) >= now));

    // Duplicate assignments check
    const roleAssignmentMap = new Map();
    userRoles.forEach(ur => {
      const key = `${ur.user_id}-${ur.role_id}`;
      if (roleAssignmentMap.has(key)) roleAssignmentMap.get(key).push(ur);
      else roleAssignmentMap.set(key, [ur]);
    });
    const duplicateAssignments = [...roleAssignmentMap.entries()].filter(([, a]) => a.length > 1);

    // Excessive permissions per role
    const rolePermissionCount = new Map();
    rolePermissions.forEach(rp => rolePermissionCount.set(rp.role_id, (rolePermissionCount.get(rp.role_id) || 0) + 1));
    const excessivePermissionRoles = roles.filter(r => (rolePermissionCount.get(r.id) || 0) > 20);

    // Users with excessive permissions
    const userPermissionCounts = {};
    userRoles.filter(ur => ur.is_active).forEach(ur => {
      const permCount = rolePermissions.filter(rp => rp.role_id === ur.role_id).length;
      userPermissionCounts[ur.user_id] = (userPermissionCounts[ur.user_id] || 0) + permCount;
    });
    const avgPermissions = Object.values(userPermissionCounts).length > 0
      ? Object.values(userPermissionCounts).reduce((a, b) => a + b, 0) / Object.values(userPermissionCounts).length
      : 0;
    const excessivePermissionUsers = Object.entries(userPermissionCounts)
      .filter(([, count]) => count > avgPermissions * 2 && count > 10)
      .map(([userId, count]) => {
        const user = allUsers.find(u => u.user_id === userId);
        return { user_email: user?.user_email || userId, permission_count: count, average: Math.round(avgPermissions) };
      });

    // Risks and recommendations
    const risks = [];
    const recommendations = [];

    if (usersWithoutRoles.length > 5) {
      risks.push({ severity: 'high', type: 'users_without_roles', description: `${usersWithoutRoles.length} users have no roles assigned`, recommendation: 'Review and assign appropriate roles' });
    }
    if (excessivePermissionRoles.length > 0) {
      risks.push({ severity: 'medium', type: 'overprivileged_roles', description: `${excessivePermissionRoles.length} roles have >20 permissions`, recommendation: 'Consider splitting into granular roles' });
    }
    if (expiredDelegations.length > 0) {
      risks.push({ severity: 'medium', type: 'expired_delegations', description: `${expiredDelegations.length} expired delegations still active`, recommendation: 'Deactivate or extend these delegations' });
      recommendations.push({ priority: 'medium', message: `${expiredDelegations.length} delegations have expired but are still active`, category: 'delegation' });
    }
    if (rolesWithoutUsers.length > 3) {
      recommendations.push({ priority: 'low', message: `${rolesWithoutUsers.length} roles have no users assigned. Consider removing unused roles.`, category: 'cleanup' });
    }

    // Access denial rate
    const deniedAttempts = accessLogs.filter(log => log.action?.includes('denied') || log.action?.includes('unauthorized'));
    const denialRate = accessLogs.length > 0 ? (deniedAttempts.length / accessLogs.length * 100).toFixed(1) : 0;
    if (parseFloat(denialRate) > 10) {
      risks.push({ severity: 'high', type: 'high_denial_rate', description: `High access denial rate of ${denialRate}%`, recommendation: 'Review permission configurations' });
    }

    const issues = [usersWithoutRoles.length > 0, rolesWithoutUsers.length > 0, orphanedPermissions.length > 0, expiredAssignments.length > 0, inactiveAssignments.length > 0, expiredDelegations.length > 0, duplicateAssignments.length > 0, excessivePermissionRoles.length > 0];
    const healthScore = Math.max(0, 100 - (issues.filter(Boolean).length * 12.5));
    const highRisks = risks.filter(r => r.severity === 'high').length;
    const mediumRisks = risks.filter(r => r.severity === 'medium').length;

    return {
      usersWithoutRoles, rolesWithoutUsers, orphanedPermissions, expiredAssignments,
      inactiveAssignments, expiredDelegations, activeDelegations, duplicateAssignments,
      excessivePermissionRoles, excessivePermissionUsers, risks, recommendations,
      healthScore, highRisks, mediumRisks, denialRate, deniedAttempts: deniedAttempts.length,
      totalUsers: allUsers.length, totalRoles: roles.length, totalPermissions: permissions.length,
      totalAssignments: userRoles.length, totalAccessAttempts: accessLogs.length
    };
  }, [allUsers, userRoles, roles, permissions, rolePermissions, delegations, accessLogs]);


  const exportReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_users: auditResults.totalUsers,
        total_roles: auditResults.totalRoles,
        total_permissions: auditResults.totalPermissions,
        health_score: auditResults.healthScore,
        high_risks: auditResults.highRisks,
        medium_risks: auditResults.mediumRisks,
        denial_rate: auditResults.denialRate
      },
      risks: auditResults.risks,
      recommendations: auditResults.recommendations,
      issues: {
        users_without_roles: auditResults.usersWithoutRoles.length,
        roles_without_users: auditResults.rolesWithoutUsers.length,
        orphaned_permissions: auditResults.orphanedPermissions.length,
        expired_assignments: auditResults.expiredAssignments.length,
        excessive_permission_users: auditResults.excessivePermissionUsers.length
      }
    };
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rbac-audit-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
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
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t({ en: 'Refresh', ar: 'تحديث' })}
          </Button>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t({ en: 'Export', ar: 'تصدير' })}
          </Button>
        </div>
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

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={auditResults.highRisks > 0 ? 'border-2 border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'High Risks', ar: 'مخاطر عالية' })}</p>
                <p className="text-3xl font-bold text-red-600">{auditResults.highRisks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className={auditResults.mediumRisks > 0 ? 'border-2 border-amber-300 bg-amber-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Medium Risks', ar: 'مخاطر متوسطة' })}</p>
                <p className="text-3xl font-bold text-amber-600">{auditResults.mediumRisks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Denial Rate', ar: 'معدل الرفض' })}</p>
                <p className="text-3xl font-bold text-blue-600">{auditResults.denialRate}%</p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Stale Roles', ar: 'أدوار قديمة' })}</p>
                <p className="text-3xl font-bold text-purple-600">{auditResults.rolesWithoutUsers.length}</p>
              </div>
              <Trash2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automated Audit Scheduler */}
      <AutomatedAuditScheduler />

      {/* Recommendations */}
      {auditResults.recommendations.length > 0 && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <CheckCircle2 className="h-5 w-5" />
              {t({ en: 'Actionable Recommendations', ar: 'توصيات قابلة للتنفيذ' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditResults.recommendations.map((rec, i) => (
                <div key={i} className={`p-3 rounded-lg border-2 ${rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                  rec.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                  <div className="flex items-start gap-2">
                    <Badge className={rec.priority === 'high' ? 'bg-red-600' : rec.priority === 'medium' ? 'bg-amber-600' : 'bg-blue-600'}>
                      {rec.priority.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{rec.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t({ en: 'Category:', ar: 'الفئة:' })} {rec.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Risks */}
      {auditResults.risks.length > 0 && (
        <Card className="border-2 border-red-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'Security Risks Detected', ar: 'مخاطر أمنية مكتشفة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditResults.risks.map((risk, i) => (
                <div key={i} className={`p-4 rounded-lg border-2 ${risk.severity === 'high' ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={risk.severity === 'high' ? 'bg-red-600' : 'bg-amber-600'}>{risk.severity}</Badge>
                        <span className="font-medium text-sm">{risk.type}</span>
                      </div>
                      <p className="text-sm text-foreground/70">{risk.description}</p>
                      {risk.recommendation && <p className="text-xs text-muted-foreground mt-2">💡 {risk.recommendation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users with Excessive Permissions */}
      {auditResults.excessivePermissionUsers.length > 0 && (
        <Card className="border-2 border-orange-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Eye className="h-5 w-5" />
              {t({ en: 'Users with Excessive Permissions', ar: 'مستخدمون بصلاحيات زائدة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditResults.excessivePermissionUsers.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-sm">{item.user_email}</p>
                    <p className="text-xs text-muted-foreground">{item.permission_count} {t({ en: 'permissions', ar: 'صلاحية' })} ({t({ en: 'avg:', ar: 'متوسط:' })} {item.average})</p>
                  </div>
                  <Badge variant="outline" className="text-amber-700">{((item.permission_count / item.average - 1) * 100).toFixed(0)}% above avg</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AuditCard title={t({ en: 'Users Without Roles', ar: 'مستخدمون بدون أدوار' })} icon={UserX} count={auditResults.usersWithoutRoles.length} severity={auditResults.usersWithoutRoles.length > 5 ? 'critical' : auditResults.usersWithoutRoles.length > 0 ? 'warning' : 'ok'} items={auditResults.usersWithoutRoles.map(u => u.user_email || u.full_name || 'Unknown')} emptyMessage={t({ en: 'All users have roles assigned', ar: 'جميع المستخدمين لديهم أدوار' })} />
        <AuditCard title={t({ en: 'Roles Without Users', ar: 'أدوار بدون مستخدمين' })} icon={KeyRound} count={auditResults.rolesWithoutUsers.length} severity={auditResults.rolesWithoutUsers.length > 3 ? 'warning' : 'ok'} items={auditResults.rolesWithoutUsers.map(r => r.name)} emptyMessage={t({ en: 'All roles have users assigned', ar: 'جميع الأدوار لديها مستخدمون' })} />
        <AuditCard title={t({ en: 'Orphaned Permissions', ar: 'صلاحيات يتيمة' })} icon={FileWarning} count={auditResults.orphanedPermissions.length} severity={auditResults.orphanedPermissions.length > 5 ? 'warning' : 'ok'} items={auditResults.orphanedPermissions.map(p => p.code || p.name)} emptyMessage={t({ en: 'All permissions are assigned', ar: 'جميع الصلاحيات مُعينة' })} />
        <AuditCard title={t({ en: 'Expired Assignments', ar: 'تعيينات منتهية' })} icon={Clock} count={auditResults.expiredAssignments.length} severity={auditResults.expiredAssignments.length > 0 ? 'critical' : 'ok'} items={auditResults.expiredAssignments.map(a => `Role ${a.role_id?.slice(0, 8)}...`)} emptyMessage={t({ en: 'No expired assignments', ar: 'لا توجد تعيينات منتهية' })} />
        <AuditCard title={t({ en: 'Inactive Assignments', ar: 'تعيينات غير نشطة' })} icon={XCircle} count={auditResults.inactiveAssignments.length} severity={auditResults.inactiveAssignments.length > 10 ? 'warning' : 'ok'} items={auditResults.inactiveAssignments.map(a => `Role ${a.role_id?.slice(0, 8)}...`)} emptyMessage={t({ en: 'All assignments are active', ar: 'جميع التعيينات نشطة' })} />
        <AuditCard title={t({ en: 'Excessive Role Permissions', ar: 'أدوار بصلاحيات مفرطة' })} icon={AlertTriangle} count={auditResults.excessivePermissionRoles.length} severity={auditResults.excessivePermissionRoles.length > 0 ? 'warning' : 'ok'} items={auditResults.excessivePermissionRoles.map(r => r.name)} emptyMessage={t({ en: 'No excessive permissions', ar: 'لا توجد صلاحيات مفرطة' })} />
      </div>

      {/* Detailed Views Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t({ en: 'Detailed Analysis', ar: 'التحليل التفصيلي' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="issues" className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="issues" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">{t({ en: 'Issues', ar: 'المشاكل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">{t({ en: 'Users', ar: 'المستخدمون' })}</span>
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">{t({ en: 'Roles', ar: 'الأدوار' })}</span>
              </TabsTrigger>
              <TabsTrigger value="delegations" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">{t({ en: 'Delegations', ar: 'التفويضات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">{t({ en: 'Activity', ar: 'النشاط' })}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AuditCard title={t({ en: 'Users Without Roles', ar: 'مستخدمون بدون أدوار' })} icon={UserX} count={auditResults.usersWithoutRoles.length} severity={auditResults.usersWithoutRoles.length > 5 ? 'critical' : auditResults.usersWithoutRoles.length > 0 ? 'warning' : 'ok'} items={auditResults.usersWithoutRoles.map(u => u.user_email || u.full_name || 'Unknown')} emptyMessage={t({ en: 'All users have roles assigned', ar: 'جميع المستخدمين لديهم أدوار' })} />
                <AuditCard title={t({ en: 'Roles Without Users', ar: 'أدوار بدون مستخدمين' })} icon={KeyRound} count={auditResults.rolesWithoutUsers.length} severity={auditResults.rolesWithoutUsers.length > 3 ? 'warning' : 'ok'} items={auditResults.rolesWithoutUsers.map(r => r.name)} emptyMessage={t({ en: 'All roles have users assigned', ar: 'جميع الأدوار لديها مستخدمون' })} />
                <AuditCard title={t({ en: 'Orphaned Permissions', ar: 'صلاحيات يتيمة' })} icon={FileWarning} count={auditResults.orphanedPermissions.length} severity={auditResults.orphanedPermissions.length > 5 ? 'warning' : 'ok'} items={auditResults.orphanedPermissions.map(p => p.code || p.name)} emptyMessage={t({ en: 'All permissions are assigned', ar: 'جميع الصلاحيات مُعينة' })} />
                <AuditCard title={t({ en: 'Expired Assignments', ar: 'تعيينات منتهية' })} icon={Clock} count={auditResults.expiredAssignments.length} severity={auditResults.expiredAssignments.length > 0 ? 'critical' : 'ok'} items={auditResults.expiredAssignments.map(a => `Role ${a.role_id?.slice(0, 8)}...`)} emptyMessage={t({ en: 'No expired assignments', ar: 'لا توجد تعيينات منتهية' })} />
                <AuditCard title={t({ en: 'Inactive Assignments', ar: 'تعيينات غير نشطة' })} icon={XCircle} count={auditResults.inactiveAssignments.length} severity={auditResults.inactiveAssignments.length > 10 ? 'warning' : 'ok'} items={auditResults.inactiveAssignments.map(a => `Role ${a.role_id?.slice(0, 8)}...`)} emptyMessage={t({ en: 'All assignments are active', ar: 'جميع التعيينات نشطة' })} />
                <AuditCard title={t({ en: 'Excessive Role Permissions', ar: 'أدوار بصلاحيات مفرطة' })} icon={AlertTriangle} count={auditResults.excessivePermissionRoles.length} severity={auditResults.excessivePermissionRoles.length > 0 ? 'warning' : 'ok'} items={auditResults.excessivePermissionRoles.map(r => r.name)} emptyMessage={t({ en: 'No excessive permissions', ar: 'لا توجد صلاحيات مفرطة' })} />
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allUsers.map(user => {
                  const userActiveRoles = userRoles.filter(ur => ur.user_id === user.user_id && ur.is_active);
                  const hasAnyRole = userActiveRoles.length > 0;

                  return (
                    <div key={user.user_id} className={`p-3 rounded border ${!hasAnyRole ? 'border-red-200 bg-red-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{user.full_name || user.user_email}</p>
                          <p className="text-xs text-muted-foreground">{user.user_email}</p>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {userActiveRoles.map(ur => {
                            const roleName = ur.roles?.name || roles.find(r => r.id === ur.role_id)?.name || 'Unknown';
                            return <Badge key={ur.id} variant="outline" className="text-xs">{roleName}</Badge>;
                          })}
                          {!hasAnyRole && <Badge variant="destructive" className="text-xs">{t({ en: 'No Roles', ar: 'بدون أدوار' })}</Badge>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="roles">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {roles.map(role => {
                  const permCount = rolePermissions.filter(rp => rp.role_id === role.id).length;
                  const userCount = userRoles.filter(ur => ur.role_id === role.id && ur.is_active).length;

                  return (
                    <div key={role.id} className={`p-3 rounded border ${userCount === 0 ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{role.name}</p>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{permCount} {t({ en: 'permissions', ar: 'صلاحيات' })}</Badge>
                          <Badge variant={userCount === 0 ? 'secondary' : 'default'} className="text-xs">{userCount} {t({ en: 'users', ar: 'مستخدمين' })}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="delegations">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t({ en: 'Active Delegations', ar: 'التفويضات النشطة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {auditResults.activeDelegations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t({ en: 'No active delegations', ar: 'لا توجد تفويضات نشطة' })}</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {auditResults.activeDelegations.map(d => (
                          <div key={d.id} className="p-2 rounded border text-xs">
                            <p><strong>{d.delegator_email}</strong> → {d.delegate_email}</p>
                            <p className="text-muted-foreground">{t({ en: 'Until:', ar: 'حتى:' })} {new Date(d.end_date).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      {t({ en: 'Expired Delegations', ar: 'التفويضات المنتهية' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {auditResults.expiredDelegations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t({ en: 'No expired delegations', ar: 'لا توجد تفويضات منتهية' })}</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {auditResults.expiredDelegations.map(d => (
                          <div key={d.id} className="p-2 rounded border border-red-200 bg-red-50 text-xs">
                            <p><strong>{d.delegator_email}</strong> → {d.delegate_email}</p>
                            <p className="text-red-600">{t({ en: 'Expired:', ar: 'انتهى:' })} {new Date(d.end_date).toLocaleDateString()}</p>
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
                <CardContent className="pt-4">
                  {accessLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t({ en: 'No recent access logs', ar: 'لا توجد سجلات وصول حديثة' })}</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {accessLogs.slice(0, 30).map(log => (
                        <div key={log.id} className="p-2 rounded border text-xs flex items-center justify-between">
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-muted-foreground">{log.user_email || 'Anonymous'}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

