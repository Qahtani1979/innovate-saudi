import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Shield, AlertCircle, CheckCircle2, FileText, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout } from '@/components/layout/PersonaPageLayout';

function AuditDetail() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const auditId = urlParams.get('id');

  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit-detail', auditId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!auditId
  });

  if (isLoading || !audit) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusColors = {
    scheduled: 'bg-blue-200 text-blue-800',
    in_progress: 'bg-amber-600 text-white',
    completed: 'bg-green-600 text-white',
    follow_up_pending: 'bg-purple-200 text-purple-800'
  };

  const riskColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-red-600 text-white'
  };

  return (
    <PageLayout className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {t({ en: 'Audit Details', ar: 'تفاصيل التدقيق' })}
            </h1>
            <Badge className={statusColors[audit.status] || 'bg-gray-200'}>
              {audit.status}
            </Badge>
          </div>
          <p className="text-slate-600">
            {audit.audit_code} • {audit.audit_type}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">{audit.audit_type}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Audit Type', ar: 'نوع التدقيق' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">{audit.audit_scope || 'N/A'}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Scope', ar: 'النطاق' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{audit.compliance_score || 'N/A'}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Compliance Score', ar: 'درجة الامتثال' })}</p>
          </CardContent>
        </Card>

        <Card className={audit.risk_level && (audit.risk_level === 'high' || audit.risk_level === 'critical') ? 'border-2 border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6 text-center">
            <AlertCircle className={`h-10 w-10 mx-auto mb-2 ${audit.risk_level === 'critical' ? 'text-red-600' : audit.risk_level === 'high' ? 'text-orange-600' : 'text-slate-600'}`} />
            <Badge className={riskColors[audit.risk_level] || 'bg-gray-200'}>
              {audit.risk_level || 'N/A'}
            </Badge>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Risk Level', ar: 'مستوى المخاطر' })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Audit Information', ar: 'معلومات التدقيق' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600">{t({ en: 'Auditor', ar: 'المدقق' })}</p>
              <p className="text-sm text-slate-900">{audit.auditor_name || audit.auditor_email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">{t({ en: 'Organization', ar: 'المنظمة' })}</p>
              <p className="text-sm text-slate-900">{audit.auditor_organization || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">{t({ en: 'Audit Date', ar: 'تاريخ التدقيق' })}</p>
              <p className="text-sm text-slate-900">{new Date(audit.audit_start_date).toLocaleDateString()}</p>
            </div>
            {audit.follow_up_required && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-300">
                <p className="text-xs font-semibold text-amber-900">{t({ en: 'Follow-up Required', ar: 'مطلوب متابعة' })}</p>
                {audit.follow_up_date && (
                  <p className="text-sm text-slate-700 mt-1">
                    {t({ en: 'Due:', ar: 'الموعد:' })} {new Date(audit.follow_up_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">{t({ en: 'Compliance Score', ar: 'درجة الامتثال' })}</p>
              <div className="relative inline-block">
                <svg className="w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={audit.compliance_score >= 80 ? '#10b981' : audit.compliance_score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${(audit.compliance_score || 0) * 3.51} 351`}
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">{audit.compliance_score || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {audit.findings && audit.findings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t({ en: 'Findings', ar: 'النتائج' })} ({audit.findings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {audit.findings.map((finding, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{finding.description || finding}</p>
                      {finding.severity && (
                        <Badge className={`mt-2 ${riskColors[finding.severity]}`}>
                          {finding.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {audit.recommendations && audit.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {t({ en: 'Recommendations', ar: 'التوصيات' })} ({audit.recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {audit.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-slate-900">{rec.description || rec}</p>
                  {rec.priority && (
                    <Badge className="mt-2" variant="outline">{rec.priority}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(AuditDetail, { requiredPermissions: ['audit_view'] });