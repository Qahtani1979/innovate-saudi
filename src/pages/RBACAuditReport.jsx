import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import AutomatedAuditScheduler from '../components/access/AutomatedAuditScheduler';
import {
  Shield, AlertTriangle, TrendingUp, Users, Lock, CheckCircle2,
  XCircle, RefreshCw, Download, Calendar, Activity, Eye, Trash2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function RBACAuditReport() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [runningAudit, setRunningAudit] = useState(false);

  // Fetch latest audit report
  const { data: latestReport, isLoading } = useQuery({
    queryKey: ['rbac-audit-latest'],
    queryFn: async () => {
      const configs = await base44.entities.PlatformConfig.filter({
        key: { $regex: '^rbac_audit_' }
      });
      
      if (configs.length === 0) return null;
      
      // Sort by date and get latest
      configs.sort((a, b) => b.created_date.localeCompare(a.created_date));
      return { id: configs[0].id, ...configs[0].value };
    }
  });

  // Fetch historical audit reports
  const { data: historicalReports = [] } = useQuery({
    queryKey: ['rbac-audit-history'],
    queryFn: async () => {
      const configs = await base44.entities.PlatformConfig.filter({
        key: { $regex: '^rbac_audit_' }
      });
      
      return configs
        .sort((a, b) => b.created_date.localeCompare(a.created_date))
        .slice(0, 10)
        .map(c => ({ date: c.created_date, ...c.value.summary }));
    }
  });

  const runAuditMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('runRBACSecurityAudit', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rbac-audit-latest']);
      queryClient.invalidateQueries(['rbac-audit-history']);
      setRunningAudit(false);
    }
  });

  const handleRunAudit = async () => {
    setRunningAudit(true);
    runAuditMutation.mutate();
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(latestReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rbac-audit-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const report = latestReport;

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
              {t({ en: 'Automated security analysis and risk detection', ar: 'تحليل أمني آلي واكتشاف المخاطر' })}
            </p>
            {report && (
              <p className="text-sm text-white/80 mt-2">
                {t({ en: 'Last Run:', ar: 'آخر تشغيل:' })} {new Date(report.generated_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
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
              {t({ en: 'Run Audit', ar: 'تشغيل التدقيق' })}
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
            <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {t({ en: 'No Audit Report Available', ar: 'لا يوجد تقرير تدقيق' })}
            </h3>
            <p className="text-slate-600 mb-4">
              {t({ en: 'Run your first security audit to analyze RBAC configuration', ar: 'قم بتشغيل أول تدقيق أمني لتحليل تكوين RBAC' })}
            </p>
            <Button onClick={handleRunAudit} disabled={runningAudit}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t({ en: 'Run First Audit', ar: 'تشغيل أول تدقيق' })}
            </Button>
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
                    <p className="text-sm text-slate-600">
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
                    <p className="text-sm text-slate-600">
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
                    <p className="text-sm text-slate-600">
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
                    <p className="text-sm text-slate-600">
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
                  {t({ en: '✅ Actionable Recommendations', ar: '✅ توصيات قابلة للتنفيذ' })}
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
                          <p className="text-xs text-slate-600 mt-1">
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

          {/* High & Medium Risks */}
          {report.risks.length > 0 && (
            <Card className="border-2 border-red-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertTriangle className="h-5 w-5" />
                  {t({ en: '🚨 Security Risks Detected', ar: '🚨 مخاطر أمنية مكتشفة' })}
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
                            <p className="text-sm text-slate-700 mb-1">
                              {t({ en: 'User:', ar: 'المستخدم:' })} {risk.user_email}
                            </p>
                          )}
                          <p className="text-sm text-slate-700">{risk.description}</p>
                          {risk.recommendation && (
                            <p className="text-xs text-slate-600 mt-2">
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
                  {t({ en: '⚠️ Users with Excessive Permissions', ar: '⚠️ مستخدمون بصلاحيات زائدة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.excessive_permissions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-medium text-sm">{item.user_email}</p>
                        <p className="text-xs text-slate-600">
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
                  {t({ en: '🗑️ Stale Roles & Resources', ar: '🗑️ أدوار وموارد قديمة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.stale_entities.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-slate-600">{item.reason}</p>
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
                  {t({ en: '⏰ Delegation Issues', ar: '⏰ مشاكل التفويض' })}
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
                      <p className="text-sm text-slate-700">
                        {issue.delegator} → {issue.delegate}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {t({ en: 'Ended:', ar: 'انتهى:' })} {new Date(issue.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">💡 {issue.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unused Permissions */}
          {report.unused_permissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-slate-600" />
                  {t({ en: '💤 Unused Permissions (30 days)', ar: '💤 صلاحيات غير مستخدمة (30 يوم)' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.unused_permissions.map((item, i) => (
                    <Badge key={i} variant="outline" className="text-slate-600">
                      {item.permission}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-3">
                  💡 {t({ en: 'These permissions exist in roles but have not been used', ar: 'هذه الصلاحيات موجودة في الأدوار لكن لم يتم استخدامها' })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Historical Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                {t({ en: '📈 Audit History Trend', ar: '📈 اتجاه تاريخ التدقيق' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicalReports.reverse()}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="high_risks" stroke="#dc2626" name="High Risks" />
                  <Line type="monotone" dataKey="medium_risks" stroke="#f59e0b" name="Medium Risks" />
                  <Line type="monotone" dataKey="stale_roles" stroke="#8b5cf6" name="Stale Roles" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t({ en: 'System Overview', ar: 'نظرة عامة على النظام' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">
                    {t({ en: 'Total Users:', ar: 'إجمالي المستخدمين:' })}
                  </span>
                  <span className="font-medium">{report.summary.total_users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">
                    {t({ en: 'Total Roles:', ar: 'إجمالي الأدوار:' })}
                  </span>
                  <span className="font-medium">{report.summary.total_roles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">
                    {t({ en: 'Total Teams:', ar: 'إجمالي الفرق:' })}
                  </span>
                  <span className="font-medium">{report.summary.total_teams}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">
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
                  <span className="text-sm text-slate-600">
                    {t({ en: 'Total Access Attempts:', ar: 'محاولات الوصول الإجمالية:' })}
                  </span>
                  <span className="font-medium">{report.summary.total_access_attempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">
                    {t({ en: 'Denied Attempts:', ar: 'المحاولات المرفوضة:' })}
                  </span>
                  <span className="font-medium text-red-600">{report.summary.denied_attempts}</span>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">
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
          <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Shield className="h-5 w-5" />
                {t({ en: '🛡️ Overall Security Health', ar: '🛡️ الصحة الأمنية العامة' })}
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
                <p className="text-sm text-slate-700">
                  {report.summary.high_risks === 0 && report.summary.medium_risks === 0 ? 
                    t({ en: '✅ No critical security issues detected', ar: '✅ لم يتم اكتشاف مشاكل أمنية حرجة' }) :
                    t({ en: '⚠️ Review and address identified risks', ar: '⚠️ راجع وعالج المخاطر المحددة' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}