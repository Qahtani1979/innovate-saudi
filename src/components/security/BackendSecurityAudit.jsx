import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function BackendSecurityAudit() {
  const { t } = useLanguage();

  const securityChecks = [
    { name: 'Input Validation', status: 'partial', coverage: 60, priority: 'high' },
    { name: 'SQL Injection Protection', status: 'complete', coverage: 95, priority: 'high' },
    { name: 'XSS Protection', status: 'partial', coverage: 70, priority: 'high' },
    { name: 'CSRF Tokens', status: 'missing', coverage: 0, priority: 'high' },
    { name: 'Authentication Security', status: 'partial', coverage: 65, priority: 'high' },
    { name: 'Authorization Checks', status: 'partial', coverage: 75, priority: 'high' },
    { name: 'Data Encryption (at rest)', status: 'missing', coverage: 0, priority: 'high' },
    { name: 'API Rate Limiting', status: 'partial', coverage: 40, priority: 'high' },
    { name: 'Security Headers', status: 'partial', coverage: 50, priority: 'high' },
    { name: 'Audit Logging', status: 'partial', coverage: 55, priority: 'medium' }
  ];

  const getStatusIcon = (status) => {
    if (status === 'complete') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'partial') return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const avgCoverage = securityChecks.reduce((sum, check) => sum + check.coverage, 0) / securityChecks.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          {t({ en: 'Backend Security Audit', ar: 'تدقيق أمان الخلفية' })}
          <Badge className={avgCoverage >= 80 ? 'bg-green-600' : avgCoverage >= 60 ? 'bg-amber-600' : 'bg-red-600'}>
            {Math.round(avgCoverage)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {securityChecks.map((check, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(check.status)}
                <span className="text-sm font-medium">{check.name}</span>
                {check.priority === 'high' && (
                  <Badge className="bg-red-600 text-xs">High Priority</Badge>
                )}
              </div>
              <span className="text-xs font-medium">{check.coverage}%</span>
            </div>
            <Progress value={check.coverage} className="h-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
