import { useSandboxApplication } from '@/hooks/useSandboxData';
import { useRegulatoryExemptions, useExemptionAuditLogsList } from '@/hooks/useRegulatoryExemptions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function SandboxComplianceMonitor({ applicationId }) {
  const { language, t } = useLanguage();

  const { data: application } = useSandboxApplication(applicationId);

  const { data: exemptions = [] } = useRegulatoryExemptions({ applicationId });

  const exemptionIds = exemptions.map(e => e.id);
  const { data: auditLogs = [] } = useExemptionAuditLogsList(exemptionIds);

  const activeExemptions = exemptions.filter(e => e.status === 'active').length;
  const expiringExemptions = exemptions.filter(e => {
    if (!e.end_date) return false;
    const daysUntilExpiry = Math.floor((new Date(e.end_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;
  const violations = auditLogs.filter(log => log.action === 'violation').length;

  const complianceScore = exemptions.length > 0
    ? Math.round(((exemptions.length - violations) / exemptions.length) * 100)
    : 100;

  return (
    <Card className="border-2 border-orange-300">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-600" />
          {t({ en: 'Compliance & Regulatory Monitor', ar: 'مراقب الامتثال التنظيمي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className={`p-3 rounded-lg border-2 text-center ${complianceScore >= 90 ? 'bg-green-50 border-green-300' :
            complianceScore >= 70 ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
            <p className="text-xs text-slate-600 mb-1">{t({ en: 'Compliance', ar: 'الامتثال' })}</p>
            <p className="text-2xl font-bold">{complianceScore}%</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
            <CheckCircle className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{activeExemptions}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300 text-center">
            <Clock className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-yellow-600">{expiringExemptions}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Expiring', ar: 'منتهية' })}</p>
          </div>

          <div className="p-3 bg-red-50 rounded-lg border-2 border-red-300 text-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{violations}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Violations', ar: 'انتهاكات' })}</p>
          </div>
        </div>

        {exemptions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-slate-900 mb-2">
              {t({ en: 'Regulatory Exemptions', ar: 'الإعفاءات التنظيمية' })}
            </h4>
            {exemptions.map((exemption) => {
              const daysUntilExpiry = exemption.end_date
                ? Math.floor((new Date(exemption.end_date) - new Date()) / (1000 * 60 * 60 * 24))
                : null;
              const isExpiring = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

              return (
                <div key={exemption.id} className={`p-3 border rounded-lg ${isExpiring ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{exemption.title || exemption.code}</p>
                      <p className="text-xs text-slate-600 mt-1">{exemption.description_en}</p>
                      {exemption.end_date && (
                        <p className="text-xs text-slate-500 mt-1">
                          {t({ en: 'Expires:', ar: 'ينتهي:' })} {exemption.end_date}
                          {isExpiring && ` (${daysUntilExpiry} days)`}
                        </p>
                      )}
                    </div>
                    <Badge className={
                      exemption.status === 'active' ? 'bg-green-100 text-green-700' :
                        exemption.status === 'expired' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                    }>
                      {exemption.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {auditLogs.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm text-slate-900 mb-2">
              {t({ en: 'Recent Audit Activity', ar: 'النشاط التدقيقي الأخير' })}
            </h4>
            <div className="space-y-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-2 text-xs text-slate-600 p-2 bg-slate-50 rounded">
                  <span className={log.action === 'violation' ? 'text-red-600' : 'text-slate-600'}>
                    {log.action === 'violation' ? '⚠️' : '📋'}
                  </span>
                  <span className="flex-1">{log.notes || log.action}</span>
                  <span>{new Date(log.performed_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}