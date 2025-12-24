import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export default function AutomatedComplianceChecker({ application, sandbox }) {
  const { language, isRTL, t } = useLanguage();
  const [complianceStatus, setComplianceStatus] = useState(null);

  const { data: exemptions = [] } = useQuery({
    queryKey: ['regulatory-exemptions'],
    queryFn: () => base44.entities.RegulatoryExemption.list()
  });

  const checkMutation = useMutation({
    mutationFn: async () => {
      const results = [];
      
      // Check each requested exemption
      for (const requestedExemption of application.requested_exemptions || []) {
        const exemption = exemptions.find(e => 
          e.title_en === requestedExemption && e.status === 'active'
        );

        if (!exemption) {
          results.push({
            exemption: requestedExemption,
            status: 'not_found',
            message: 'Exemption not found in active regulatory library',
            severity: 'error'
          });
          continue;
        }

        // Check domain compatibility
        if (exemption.domain !== sandbox.domain && exemption.domain !== 'general') {
          results.push({
            exemption: requestedExemption,
            exemption_code: exemption.exemption_code,
            status: 'domain_mismatch',
            message: `Exemption is for ${exemption.domain} domain, but sandbox is ${sandbox.domain}`,
            severity: 'error'
          });
          continue;
        }

        // Check expiration
        if (exemption.expiration_date) {
          const expiryDate = new Date(exemption.expiration_date);
          const today = new Date();
          if (expiryDate < today) {
            results.push({
              exemption: requestedExemption,
              exemption_code: exemption.exemption_code,
              status: 'expired',
              message: `Exemption expired on ${exemption.expiration_date}`,
              severity: 'error'
            });
            continue;
          }

          const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry < 30) {
            results.push({
              exemption: requestedExemption,
              exemption_code: exemption.exemption_code,
              status: 'expiring_soon',
              message: `Exemption expires in ${daysUntilExpiry} days`,
              severity: 'warning'
            });
          }
        }

        // Check project duration compatibility
        if (application.duration_months > exemption.duration_months) {
          results.push({
            exemption: requestedExemption,
            exemption_code: exemption.exemption_code,
            status: 'duration_exceeded',
            message: `Project duration (${application.duration_months}mo) exceeds exemption maximum (${exemption.duration_months}mo)`,
            severity: 'warning'
          });
        }

        // Check conditions
        const unmetConditions = [];
        if (exemption.conditions) {
          // In real scenario, this would check against application data
          // For now, we'll do basic checks
          if (exemption.risk_level === 'high' && !application.risk_assessment) {
            unmetConditions.push('Risk assessment required for high-risk exemptions');
          }
          if (exemption.conditions.some(c => c.includes('insurance')) && 
              !application.public_safety_plan?.toLowerCase().includes('insurance')) {
            unmetConditions.push('Insurance coverage requirement not addressed');
          }
        }

        if (unmetConditions.length > 0) {
          results.push({
            exemption: requestedExemption,
            exemption_code: exemption.exemption_code,
            status: 'conditions_unmet',
            message: 'Some conditions may not be met',
            details: unmetConditions,
            severity: 'warning'
          });
        }

        // If no issues, mark as compliant
        if (!results.find(r => r.exemption === requestedExemption)) {
          results.push({
            exemption: requestedExemption,
            exemption_code: exemption.exemption_code,
            status: 'compliant',
            message: 'All compliance checks passed',
            severity: 'success'
          });
        }
      }

      // Calculate overall compliance score
      const totalChecks = results.length;
      const passedChecks = results.filter(r => r.severity === 'success').length;
      const complianceScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

      return {
        results,
        complianceScore,
        hasErrors: results.some(r => r.severity === 'error'),
        hasWarnings: results.some(r => r.severity === 'warning'),
        timestamp: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      setComplianceStatus(data);
    }
  });

  const severityConfig = {
    success: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    error: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {t({ en: 'Automated Compliance Check', ar: 'فحص الامتثال الآلي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!complianceStatus ? (
          <div className="text-center py-6">
            <Button
              onClick={() => checkMutation.mutate()}
              disabled={checkMutation.isPending || !application.requested_exemptions?.length}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {checkMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Checking...', ar: 'جاري الفحص...' })}
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {t({ en: 'Run Compliance Check', ar: 'تشغيل فحص الامتثال' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compliance Score */}
            <div className={`p-4 rounded-lg border-2 ${
              complianceStatus.complianceScore >= 80 ? 'bg-green-50 border-green-300' :
              complianceStatus.complianceScore >= 50 ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">
                  {t({ en: 'Overall Compliance Score', ar: 'نقاط الامتثال الإجمالية' })}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => checkMutation.mutate()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-bold">
                  {complianceStatus.complianceScore}
                </p>
                <p className="text-slate-500 mb-2">/100</p>
              </div>
              <p className="text-sm mt-2 text-slate-600">
                {complianceStatus.results.filter(r => r.severity === 'success').length} of{' '}
                {complianceStatus.results.length} checks passed
              </p>
            </div>

            {/* Status Summary */}
            {(complianceStatus.hasErrors || complianceStatus.hasWarnings) && (
              <div className="flex gap-2">
                {complianceStatus.hasErrors && (
                  <Badge className="bg-red-100 text-red-700">
                    {complianceStatus.results.filter(r => r.severity === 'error').length} Errors
                  </Badge>
                )}
                {complianceStatus.hasWarnings && (
                  <Badge className="bg-yellow-100 text-yellow-700">
                    {complianceStatus.results.filter(r => r.severity === 'warning').length} Warnings
                  </Badge>
                )}
              </div>
            )}

            {/* Detailed Results */}
            <div className="space-y-3">
              {complianceStatus.results.map((result, idx) => {
                const config = severityConfig[result.severity];
                const Icon = config.icon;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {result.exemption_code && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {result.exemption_code}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {result.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="font-medium text-slate-900 text-sm mb-1">
                          {result.exemption}
                        </p>
                        <p className="text-sm text-slate-700">
                          {result.message}
                        </p>
                        {result.details && result.details.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {result.details.map((detail, i) => (
                              <li key={i} className="text-xs text-slate-600">
                                • {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timestamp */}
            <p className="text-xs text-slate-500 text-center">
              Last checked: {new Date(complianceStatus.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}