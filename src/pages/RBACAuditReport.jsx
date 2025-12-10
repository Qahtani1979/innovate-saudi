import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import AutomatedAuditScheduler from '../components/access/AutomatedAuditScheduler';
import {
  Shield, AlertTriangle, TrendingUp, Users, Lock, CheckCircle2,
  XCircle, RefreshCw, Download, Activity, Eye, Trash2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function RBACAuditReport() {
  const { t, language } = useLanguage();
  const [runningAudit, setRunningAudit] = useState(false);

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['audit-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user profiles
  const { data: users = [] } = useQuery({
    queryKey: ['audit-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user functional roles
  const { data: userFunctionalRoles = [] } = useQuery({
    queryKey: ['audit-user-functional-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_functional_roles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch role permissions with permission details
  const { data: rolePermissions = [] } = useQuery({
    queryKey: ['audit-role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*, permissions(code, name)');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch delegations
  const { data: delegations = [] } = useQuery({
    queryKey: ['audit-delegations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('delegation_rules').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch access logs
  const { data: accessLogs = [] } = useQuery({
    queryKey: ['audit-access-logs'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Generate audit report from live data
  const report = useMemo(() => {
    if (!roles.length && !users.length) return null;

    const risks = [];
    const recommendations = [];
    const excessivePermissions = [];
    const staleEntities = [];
    const delegationIssues = [];
    const unusedPermissions = [];

    // Check for stale roles (no users assigned)
    const staleRoles = roles.filter(role => {
      const assignedUsers = userFunctionalRoles.filter(ufr => ufr.role_id === role.id && ufr.is_active);
      return assignedUsers.length === 0;
    });

    staleRoles.forEach(role => {
      staleEntities.push({
        type: 'role',
        name: role.name,
        reason: 'No users assigned to this role'
      });
    });

    if (staleRoles.length > 0) {
      recommendations.push({
        priority: 'low',
        message: `${staleRoles.length} roles have no users assigned. Consider removing unused roles.`,
        category: 'cleanup'
      });
    }

    // Check for users with excessive permissions (more than 20)
    const userPermissionCounts = {};
    userFunctionalRoles.filter(ufr => ufr.is_active).forEach(ufr => {
      const permCount = rolePermissions.filter(rp => rp.role_id === ufr.role_id).length;
      userPermissionCounts[ufr.user_id] = (userPermissionCounts[ufr.user_id] || 0) + permCount;
    });

    const avgPermissions = Object.values(userPermissionCounts).length > 0 
      ? Object.values(userPermissionCounts).reduce((a, b) => a + b, 0) / Object.values(userPermissionCounts).length
      : 0;

    Object.entries(userPermissionCounts).forEach(([userId, count]) => {
      if (count > avgPermissions * 2 && count > 10) {
        const user = users.find(u => u.user_id === userId);
        excessivePermissions.push({
          user_email: user?.user_email || userId,
          permission_count: count,
          average: Math.round(avgPermissions)
        });

        risks.push({
          severity: 'medium',
          type: 'excessive_permissions',
          user_email: user?.user_email,
          description: `User has ${count} permissions, which is significantly above average (${Math.round(avgPermissions)})`,
          recommendation: 'Review and potentially reduce permissions based on least-privilege principle'
        });
      }
    });

    // Check for expired or soon-to-expire delegations
    const now = new Date();
    delegations.forEach(delegation => {
      const endDate = new Date(delegation.end_date);
      if (delegation.is_active && endDate < now) {
        delegationIssues.push({
          type: 'expired',
          severity: 'medium',
          delegator: delegation.delegator_email,
          delegate: delegation.delegate_email,
          end_date: delegation.end_date,
          recommendation: 'Deactivate or extend this delegation'
        });
      }
    });

    if (delegationIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        message: `${delegationIssues.length} delegations have expired but are still active`,
        category: 'delegation'
      });
    }

    // Check for denied access attempts
    const deniedAttempts = accessLogs.filter(log => log.action?.includes('denied') || log.action?.includes('unauthorized'));
    const denialRate = accessLogs.length > 0 ? (deniedAttempts.length / accessLogs.length * 100).toFixed(1) : 0;

    if (parseFloat(denialRate) > 10) {
      risks.push({
        severity: 'high',
        type: 'high_denial_rate',
        description: `High access denial rate of ${denialRate}%`,
        recommendation: 'Review permission configurations and user role assignments'
      });
    }

    // Check for roles with too many permissions
    roles.forEach(role => {
      const permCount = rolePermissions.filter(rp => rp.role_id === role.id).length;
      if (permCount > 30) {
        risks.push({
          severity: 'medium',
          type: 'overprivileged_role',
          description: `Role "${role.name}" has ${permCount} permissions`,
          recommendation: 'Consider splitting into more granular roles'
        });
      }
    });

    // Calculate high and medium risk counts
    const highRisks = risks.filter(r => r.severity === 'high').length;
    const mediumRisks = risks.filter(r => r.severity === 'medium').length;

    return {
      generated_at: new Date().toISOString(),
      summary: {
        total_users: users.length,
        total_roles: roles.length,
        active_delegations: delegations.filter(d => d.is_active).length,
        total_access_attempts: accessLogs.length,
        denied_attempts: deniedAttempts.length,
        denial_rate: denialRate,
        high_risks: highRisks,
        medium_risks: mediumRisks,
        stale_roles: staleRoles.length
      },
      risks,
      recommendations,
      excessive_permissions: excessivePermissions,
      stale_entities: staleEntities,
      delegation_issues: delegationIssues,
      unused_permissions: unusedPermissions
    };
  }, [roles, users, userFunctionalRoles, rolePermissions, delegations, accessLogs]);

  const handleRunAudit = () => {
    setRunningAudit(true);
    // Simulated audit run - data is always live
    setTimeout(() => setRunningAudit(false), 1500);
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rbac-audit-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="bg-white/20 text-white border-white/40 mb-3">
              {t({ en: 'Security Audit', ar: 'تدقيق الأمان' })}
            </Badge>
            <h1 className="text-5xl font-bold mb-2">
              {t({ en: 'RBAC Audit Report', ar: 'تقرير تدقيق RBAC' })}
            </h1>
            <p className="text-xl text-white/90">
              {t({ en: 'Live security analysis and risk detection', ar: 'تحليل أمني مباشر واكتشاف المخاطر' })}
            </p>
            {report && (
              <p className="text-sm text-white/80 mt-2">
                {t({ en: 'Generated:', ar: 'تم الإنشاء:' })} {new Date(report.generated_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRunAudit}
              disabled={runningAudit}
              className="bg-white text-orange-600 hover:bg-white/90"
            >
              {runningAudit ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Refresh Audit', ar: 'تحديث التدقيق' })}
            </Button>
            {report && (
              <Button
                onClick={exportReport}
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Export', ar: 'تصدير' })}
              </Button>
            )}
          </div>
        </div>
      </div>

      <AutomatedAuditScheduler />

      {!report ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {t({ en: 'Loading Audit Data...', ar: 'جاري تحميل بيانات التدقيق...' })}
            </h3>
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mt-4" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={report.summary.high_risks > 0 ? 'border-2 border-red-300 bg-red-50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'High Risks', ar: 'مخاطر عالية' })}
                    </p>
                    <p className="text-4xl font-bold text-red-600">
                      {report.summary.high_risks}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className={report.summary.medium_risks > 0 ? 'border-2 border-amber-300 bg-amber-50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'Medium Risks', ar: 'مخاطر متوسطة' })}
                    </p>
                    <p className="text-4xl font-bold text-amber-600">
                      {report.summary.medium_risks}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'Denial Rate', ar: 'معدل الرفض' })}
                    </p>
                    <p className="text-4xl font-bold text-blue-600">
                      {report.summary.denial_rate}%
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'Stale Roles', ar: 'أدوار قديمة' })}
                    </p>
                    <p className="text-4xl font-bold text-purple-600">
                      {report.summary.stale_roles}
                    </p>
                  </div>
                  <Trash2 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <Card className="border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CheckCircle2 className="h-5 w-5" />
                  {t({ en: 'Actionable Recommendations', ar: 'توصيات قابلة للتنفيذ' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <div key={i} className={`p-3 rounded-lg border-2 ${
                      rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                      rec.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <Badge className={
                          rec.priority === 'high' ? 'bg-red-600' :
                          rec.priority === 'medium' ? 'bg-amber-600' :
                          'bg-blue-600'
                        }>
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{rec.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t({ en: 'Category:', ar: 'الفئة:' })} {rec.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Risks */}
          {report.risks.length > 0 && (
            <Card className="border-2 border-red-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertTriangle className="h-5 w-5" />
                  {t({ en: 'Security Risks Detected', ar: 'مخاطر أمنية مكتشفة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.risks.map((risk, i) => (
                    <div key={i} className={`p-4 rounded-lg border-2 ${
                      risk.severity === 'high' ? 'bg-red-50 border-red-300' :
                      'bg-amber-50 border-amber-300'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={risk.severity === 'high' ? 'bg-red-600' : 'bg-amber-600'}>
                              {risk.severity}
                            </Badge>
                            <span className="font-medium text-sm">{risk.type}</span>
                          </div>
                          {risk.user_email && (
                            <p className="text-sm text-foreground/70 mb-1">
                              {t({ en: 'User:', ar: 'المستخدم:' })} {risk.user_email}
                            </p>
                          )}
                          <p className="text-sm text-foreground/70">{risk.description}</p>
                          {risk.recommendation && (
                            <p className="text-xs text-muted-foreground mt-2">
                              💡 {risk.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Excessive Permissions */}
          {report.excessive_permissions.length > 0 && (
            <Card className="border-2 border-orange-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Eye className="h-5 w-5" />
                  {t({ en: 'Users with Excessive Permissions', ar: 'مستخدمون بصلاحيات زائدة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.excessive_permissions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-medium text-sm">{item.user_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.permission_count} {t({ en: 'permissions', ar: 'صلاحية' })} 
                          ({t({ en: 'avg:', ar: 'متوسط:' })} {item.average})
                        </p>
                      </div>
                      <Badge variant="outline" className="text-amber-700">
                        {((item.permission_count / item.average - 1) * 100).toFixed(0)}% above avg
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stale Entities */}
          {report.stale_entities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Stale Roles & Resources', ar: 'أدوار وموارد قديمة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.stale_entities.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.reason}</p>
                      </div>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delegation Issues */}
          {report.delegation_issues.length > 0 && (
            <Card className="border-2 border-amber-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Users className="h-5 w-5" />
                  {t({ en: 'Delegation Issues', ar: 'مشاكل التفويض' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.delegation_issues.map((issue, i) => (
                    <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-amber-600">{issue.type}</Badge>
                        <Badge variant="outline">{issue.severity}</Badge>
                      </div>
                      <p className="text-sm text-foreground/70">
                        {issue.delegator} → {issue.delegate}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t({ en: 'Ended:', ar: 'انتهى:' })} {new Date(issue.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">💡 {issue.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t({ en: 'System Overview', ar: 'نظرة عامة على النظام' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t({ en: 'Total Users:', ar: 'إجمالي المستخدمين:' })}
                  </span>
                  <span className="font-medium">{report.summary.total_users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t({ en: 'Total Roles:', ar: 'إجمالي الأدوار:' })}
                  </span>
                  <span className="font-medium">{report.summary.total_roles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t({ en: 'Active Delegations:', ar: 'التفويضات النشطة:' })}
                  </span>
                  <span className="font-medium">{report.summary.active_delegations}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t({ en: 'Access Activity', ar: 'نشاط الوصول' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t({ en: 'Total Access Attempts:', ar: 'محاولات الوصول الإجمالية:' })}
                  </span>
                  <span className="font-medium">{report.summary.total_access_attempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t({ en: 'Denied Attempts:', ar: 'المحاولات المرفوضة:' })}
                  </span>
                  <span className="font-medium text-red-600">{report.summary.denied_attempts}</span>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      {t({ en: 'Success Rate:', ar: 'معدل النجاح:' })}
                    </span>
                    <span className="font-medium">{(100 - parseFloat(report.summary.denial_rate)).toFixed(1)}%</span>
                  </div>
                  <Progress value={100 - parseFloat(report.summary.denial_rate)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Score */}
          <Card className="bg-gradient-to-br from-green-50 to-background border-2 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Shield className="h-5 w-5" />
                {t({ en: 'Overall Security Health', ar: 'الصحة الأمنية العامة' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">
                      {t({ en: 'Security Score', ar: 'درجة الأمان' })}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {Math.max(0, 100 - (report.summary.high_risks * 20) - (report.summary.medium_risks * 5))}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - (report.summary.high_risks * 20) - (report.summary.medium_risks * 5))} 
                    className="h-3"
                  />
                </div>
                <p className="text-sm text-foreground/70">
                  {report.summary.high_risks === 0 && report.summary.medium_risks === 0 ? 
                    t({ en: 'No critical security issues detected', ar: 'لم يتم اكتشاف مشاكل أمنية حرجة' }) :
                    t({ en: 'Review and address identified risks', ar: 'راجع وعالج المخاطر المحددة' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
