import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useAutomatedCompliance } from '@/hooks/useAutomatedCompliance';

export default function AutomatedComplianceChecker({ application, sandbox }) {
  const { language, isRTL, t } = useLanguage();
  const { checkMutation, complianceStatus } = useAutomatedCompliance(application, sandbox);

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
            <div className={`p-4 rounded-lg border-2 ${complianceStatus.complianceScore >= 80 ? 'bg-green-50 border-green-300' :
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