import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { BarChart3, FileText } from 'lucide-react';

export default function ChallengeFinancialTab({ challenge, pilots = [], contracts = [] }) {
  const { t } = useLanguage();

  const pilotSpending = pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0);
  const contractValue = contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Budget Estimate', ar: 'تقدير الميزانية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {challenge.budget_estimate ? (
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {(challenge.budget_estimate / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-muted-foreground">SAR</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t({ en: 'Not estimated', ar: 'غير مقدر' })}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Actual Spent', ar: 'المصروف الفعلي' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {(pilotSpending / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-muted-foreground">SAR (from pilots)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Contracts', ar: 'العقود' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{contracts.length}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Linked', ar: 'مرتبط' })}</p>
          </CardContent>
        </Card>
      </div>

      {contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {t({ en: 'Linked Contracts', ar: 'العقود المرتبطة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div key={contract.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{contract.title || contract.contract_number}</p>
                      <p className="text-sm text-muted-foreground mt-1">{contract.vendor_name}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {contract.contract_value && <span>💰 {(contract.contract_value / 1000).toFixed(0)}K SAR</span>}
                        {contract.start_date && <span>📅 {new Date(contract.start_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <Badge className={
                      contract.status === 'active' ? 'bg-green-100 text-green-700' :
                      contract.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {contract.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            {t({ en: 'Budget Breakdown', ar: 'تفصيل الميزانية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span className="text-sm text-muted-foreground">{t({ en: 'Estimated Budget', ar: 'الميزانية المقدرة' })}</span>
              <span className="font-bold">
                {challenge.budget_estimate ? `${(challenge.budget_estimate / 1000).toFixed(0)}K SAR` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span className="text-sm text-muted-foreground">{t({ en: 'Pilot Spending', ar: 'إنفاق التجارب' })}</span>
              <span className="font-bold text-blue-600">
                {(pilotSpending / 1000).toFixed(0)}K SAR
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <span className="text-sm text-muted-foreground">{t({ en: 'Contract Value', ar: 'قيمة العقود' })}</span>
              <span className="font-bold text-purple-600">
                {(contractValue / 1000).toFixed(0)}K SAR
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
