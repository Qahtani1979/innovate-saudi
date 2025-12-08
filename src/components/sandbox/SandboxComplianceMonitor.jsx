import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function SandboxComplianceMonitor({ applicationId }) {
  const { language, t } = useLanguage();

  const { data: application } = useQuery({
    queryKey: ['sandbox-app', applicationId],
    queryFn: async () => {
      const apps = await base44.entities.SandboxApplication.list();
      return apps.find(a => a.id === applicationId);
    }
  });

  const { data: exemptions = [] } = useQuery({
    queryKey: ['exemptions', applicationId],
    queryFn: async () => {
      const all = await base44.entities.RegulatoryExemption.list();
      return all.filter(e => e.sandbox_application_id === applicationId);
    }
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs', applicationId],
    queryFn: async () => {
      const all = await base44.entities.ExemptionAuditLog.list('-created_date');
      return all.filter(log => 
        exemptions.some(e => e.id === log.exemption_id)
      ).slice(0, 10);
    },
    enabled: exemptions.length > 0
  });

  const activeExemptions = exemptions.filter(e => e.status === 'active').length;
  const expiringExemptions = exemptions.filter(e => {
    if (!e.expiry_date) return false;
    const daysUntilExpiry = Math.floor((new Date(e.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;
  const violations = auditLogs.filter(log => log.action_type === 'violation').length;

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
          <div className={`p-3 rounded-lg border-2 text-center ${
            complianceScore >= 90 ? 'bg-green-50 border-green-300' :
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
              const daysUntilExpiry = exemption.expiry_date 
                ? Math.floor((new Date(exemption.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
                : null;
              const isExpiring = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

              return (
                <div key={exemption.id} className={`p-3 border rounded-lg ${
                  isExpiring ? 'bg-yellow-50 border-yellow-300' : 'bg-white'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{exemption.regulation_name}</p>
                      <p className="text-xs text-slate-600 mt-1">{exemption.exemption_details}</p>
                      {exemption.expiry_date && (
                        <p className="text-xs text-slate-500 mt-1">
                          {t({ en: 'Expires:', ar: 'ينتهي:' })} {exemption.expiry_date}
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
                  <span className={log.action_type === 'violation' ? 'text-red-600' : 'text-slate-600'}>
                    {log.action_type === 'violation' ? '⚠️' : '📋'}
                  </span>
                  <span className="flex-1">{log.action_description}</span>
                  <span>{new Date(log.created_date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}