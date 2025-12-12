import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Calendar, DollarSign, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';

function ContractDetail() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('id');

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      const contracts = await base44.entities.Contract.filter({ id: contractId });
      return contracts[0];
    },
    enabled: !!contractId
  });

  if (isLoading || !contract) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-200 text-gray-800',
    under_review: 'bg-blue-200 text-blue-800',
    approved: 'bg-green-200 text-green-800',
    active: 'bg-green-600 text-white',
    completed: 'bg-purple-200 text-purple-800',
    terminated: 'bg-red-200 text-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {contract.title_en || contract.title_ar}
            </h1>
            <Badge className={statusColors[contract.status] || 'bg-gray-200'}>
              {contract.status}
            </Badge>
          </div>
          <p className="text-slate-600">
            {t({ en: 'Contract Code:', ar: 'رمز العقد:' })} {contract.code}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          {t({ en: 'Download', ar: 'تحميل' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {contract.value?.toLocaleString()} {contract.currency || 'SAR'}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Contract Value', ar: 'قيمة العقد' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Calendar className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-900">
              {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Contract Period', ar: 'فترة العقد' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-slate-900">{contract.contract_type || 'N/A'}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Contract Type', ar: 'نوع العقد' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Contract Parties', ar: 'أطراف العقد' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-1">{t({ en: 'Party A', ar: 'الطرف أ' })}</p>
              <p className="font-medium text-slate-900">{contract.party_a_id}</p>
              <Badge variant="outline" className="mt-1 text-xs">{contract.party_a_type}</Badge>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-1">{t({ en: 'Party B', ar: 'الطرف ب' })}</p>
              <p className="font-medium text-slate-900">{contract.party_b_id}</p>
              <Badge variant="outline" className="mt-1 text-xs">{contract.party_b_type}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {contract.deliverables && contract.deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Deliverables', ar: 'المخرجات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contract.deliverables.map((deliverable, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{deliverable.name || deliverable}</p>
                    {deliverable.due_date && (
                      <p className="text-xs text-slate-600 mt-1">
                        {t({ en: 'Due:', ar: 'موعد التسليم:' })} {new Date(deliverable.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {deliverable.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {contract.terms_conditions && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Terms & Conditions', ar: 'الشروط والأحكام' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{contract.terms_conditions}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(ContractDetail, { requiredPermissions: ['contract_view'] });