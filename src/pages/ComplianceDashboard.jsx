import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useSandboxesWithVisibility } from '@/hooks/useSandboxesWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Shield, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';

function ComplianceDashboard() {
  const { language, isRTL, t } = useLanguage();
  const { data: pilots = [] } = usePilotsWithVisibility();
  const { data: sandboxes = [] } = useSandboxesWithVisibility();

  const compliancePassed = pilots.filter(p => p.compliance_passed).length;
  const complianceRate = pilots.length > 0 ? Math.round((compliancePassed / pilots.length) * 100) : 0;

  const complianceIssues = [
    ...pilots.filter(p => !p.compliance_passed && ['active', 'preparation'].includes(p.stage))
      .map(p => ({ type: 'Pilot', id: p.code, issue: 'Compliance not verified' })),
    ...sandboxes.filter(s => s.status === 'pending_compliance')
      .map(s => ({ type: 'Sandbox', id: s.name, issue: 'Awaiting compliance review' }))
  ].slice(0, 10);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Compliance Dashboard', ar: 'لوحة الامتثال' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Monitor regulatory and safety compliance', ar: 'مراقبة الامتثال التنظيمي والسلامة' })}
        </p>
      </div>

      {/* Summary */}
      <Card className="border-2 border-blue-300">
        <CardContent className="pt-6 text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <p className="text-5xl font-bold text-blue-600">{complianceRate}%</p>
          <p className="text-sm text-slate-600 mt-2">{t({ en: 'Overall Compliance Rate', ar: 'معدل الامتثال الإجمالي' })}</p>
          <Progress value={complianceRate} className="mt-3 h-3" />
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{compliancePassed}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Compliant', ar: 'ملتزم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{complianceIssues.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Issues', ar: 'قضايا' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">
              {pilots.filter(p => !p.compliance_passed && p.stage === 'preparation').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {t({ en: 'Compliance Issues', ar: 'قضايا الامتثال' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {complianceIssues.map((issue, i) => (
            <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <Badge variant="outline" className="mb-1">{issue.type}</Badge>
                <p className="text-sm font-medium text-slate-900">{issue.id}</p>
                <p className="text-xs text-slate-600">{issue.issue}</p>
              </div>
              <Badge className="bg-amber-600">{t({ en: 'Review', ar: 'مراجعة' })}</Badge>
            </div>
          ))}
          {complianceIssues.length === 0 && (
            <p className="text-center text-green-600 py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
              {t({ en: 'No compliance issues', ar: 'لا توجد قضايا امتثال' })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ComplianceDashboard, { requireAdmin: true });