
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSolutions } from '@/hooks/useSolutions';
import { useAllContracts } from '@/hooks/useContracts';
import { usePilotsList } from '@/hooks/usePilots';

export default function ContractPipelineTracker({ providerId }) {
  const { language, isRTL, t } = useLanguage();

  /* 
   * Refactored to use Gold Standard Hooks
   */
  const { solutions = [] } = useSolutions({ publishedOnly: false }); // Fetch all solutions for provider logic
  const providerSolutions = solutions.filter(s => s.provider_id === providerId);
  const providerSolutionIds = providerSolutions.map(s => s.id);

  const { data: allContracts = [] } = useAllContracts(); // Or useContracts(providerId) if backend supports robust filtering
  // Legacy logic filtered by solution_id inclusion or direct provider_id
  const contracts = allContracts.filter(c =>
    (c.solution_id && providerSolutionIds.includes(c.solution_id)) ||
    c.provider_id === providerId
  );

  const { data: allPilots = [] } = usePilotsList();
  const pilots = allPilots.filter(p => providerSolutionIds.includes(p.solution_id));

  const pipeline = {
    pending: contracts.filter(c => c.status === 'draft' || c.status === 'pending').length,
    negotiation: contracts.filter(c => c.status === 'negotiation').length,
    signed: contracts.filter(c => c.status === 'signed').length,
    active: contracts.filter(c => c.status === 'active').length,
    completed: contracts.filter(c => c.status === 'completed').length,
    total: contracts.length
  };

  const totalValue = contracts
    .filter(c => c.status === 'active' || c.status === 'signed')
    .reduce((sum, c) => sum + (c.total_value || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t({ en: 'Contract Pipeline', ar: 'خط العقود' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-2xl font-bold text-blue-600">{pipeline.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Contracts', ar: 'إجمالي العقود' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-2xl font-bold text-green-600">{pipeline.active}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <p className="text-xl font-bold text-purple-600">{(totalValue / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Value (SAR)', ar: 'القيمة الإجمالية (ريال)' })}</p>
          </div>
        </div>

        <div className="space-y-2">
          <PipelineStage
            icon={Clock}
            label={t({ en: 'Pending', ar: 'معلق' })}
            count={pipeline.pending}
            color="bg-slate-100 text-slate-700"
          />
          <PipelineStage
            icon={AlertCircle}
            label={t({ en: 'In Negotiation', ar: 'قيد التفاوض' })}
            count={pipeline.negotiation}
            color="bg-amber-100 text-amber-700"
          />
          <PipelineStage
            icon={CheckCircle2}
            label={t({ en: 'Signed', ar: 'موقع' })}
            count={pipeline.signed}
            color="bg-blue-100 text-blue-700"
          />
          <PipelineStage
            icon={CheckCircle2}
            label={t({ en: 'Active', ar: 'نشط' })}
            count={pipeline.active}
            color="bg-green-100 text-green-700"
          />
          <PipelineStage
            icon={CheckCircle2}
            label={t({ en: 'Completed', ar: 'مكتمل' })}
            count={pipeline.completed}
            color="bg-purple-100 text-purple-700"
          />
        </div>

        {contracts.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-slate-700">
              {t({ en: 'Recent Contracts', ar: 'العقود الأخيرة' })}
            </p>
            {contracts.slice(0, 5).map((contract) => (
              <div key={contract.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">{contract.title || 'Untitled Contract'}</p>
                    <p className="text-xs text-slate-600">{contract.municipality_id}</p>
                  </div>
                  <Badge className={
                    contract.status === 'active' ? 'bg-green-100 text-green-700' :
                      contract.status === 'signed' ? 'bg-blue-100 text-blue-700' :
                        contract.status === 'negotiation' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                  }>
                    {contract.status}
                  </Badge>
                </div>
                {contract.total_value && (
                  <p className="text-xs text-slate-600 mt-1">
                    {(contract.total_value / 1000).toFixed(0)}K SAR
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {contracts.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {t({ en: 'No contracts yet', ar: 'لا توجد عقود بعد' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PipelineStage({ icon: Icon, label, count, color }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${color}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
}
