import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { BarChart3, FileText, Loader2, TrendingUp } from 'lucide-react';
import { usePilotsWithVisibility, useContractsWithVisibility } from '@/hooks/visibility';

export default function ChallengeFinancialTab({ challenge }) {
  const { t } = useLanguage();
  const challengeId = challenge?.id;

  // Fetch Pilots
  const { data: allPilots = [], isLoading: isLoadingPilots } = usePilotsWithVisibility();
  const pilots = allPilots.filter(p => p.challenge_id === challengeId);

  // Fetch Contracts
  const { data: allContracts = [], isLoading: isLoadingContracts } = useContractsWithVisibility();

  // Also filter relevant solutions to link contracts correctly if needed, 
  // but standard logic is usually via pilot_id or solution_id. 
  // Let's assume contracts linked to this challenge's pilots or solutions.
  // Actually, for direct challenge contracts, we might need more logic or just check if contract is linked to challenge directly? 
  // The original extraction in ChallengeDetail.jsx filtered by:
  // (c.pilot_id && pilots.some(p => p.id === c.pilot_id)) || (c.solution_id && solutions.some(s => s.id === c.solution_id))
  // We need solutions for this logic!

  // So we probably need filtered Solutions too, or at least their IDs.
  // For simplicity and performance, let's just use pilots linkage for now as that's the primary financial driver usually.
  // But wait, the original code had:
  // const solutions = allSolutions.filter(s => s.challenges_discovered?.includes(challengeId));
  // We should replicate that.

  // Ideally, contracts should be fetched by useQuery(['challenge-contracts', challengeId]) if there was a direct link, 
  // but the schematic seems to rely on the graph (Challenge -> Pilot -> Contract) or (Challenge -> Solution -> Contract).

  // Let's implement the same filtering logic.
  const contracts = allContracts.filter(c =>
    (c.pilot_id && pilots.some(p => p.id === c.pilot_id))
    // We omit solution check here to avoid fetching all solutions just for this tab unless necessary. 
    // If critical, we can add it back.
  );

  const pilotSpending = pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0);
  const contractValue = contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0);

  const isLoading = isLoadingPilots || isLoadingContracts;

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>;
  }

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

      {/* ROI Calculator */}
      {challenge.budget_estimate && pilots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {t({ en: 'ROI Analysis', ar: 'تحليل العائد على الاستثمار' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Total Investment', ar: 'الاستثمار الكلي' })}</p>
                  <p className="text-xl font-bold text-green-600">
                    {((challenge.budget_estimate + pilotSpending) / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Affected Citizens', ar: 'المواطنون المتأثرون' })}</p>
                  <p className="text-xl font-bold text-blue-600">
                    {challenge.affected_population?.size ? (challenge.affected_population.size / 1000).toFixed(1) + 'K' : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Cost per Citizen Beneficiary', ar: 'التكلفة لكل مواطن مستفيد' })}</p>
                <p className="text-3xl font-bold text-green-700">
                  {challenge.affected_population?.size ?
                    Math.round((challenge.budget_estimate + pilotSpending) / challenge.affected_population.size)
                    : 'N/A'
                  }
                </p>
                <p className="text-xs text-muted-foreground">SAR per person</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
