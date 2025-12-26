import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useContractsWithVisibility } from '@/hooks/useContractsWithVisibility';
import { useUpdateContract } from '@/hooks/useContracts';

function ContractApproval() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedContract, setSelectedContract] = React.useState(null);
  const [reviewComments, setReviewComments] = React.useState('');

  const { data: contracts = [], isLoading } = useContractsWithVisibility({
    status: 'under_review'
  });

  const updateContract = useUpdateContract();

  const handleApprove = (contractId, approved) => {
    updateContract.mutate({
      id: contractId,
      updates: {
        status: approved ? 'approved' : 'draft',
        review_comments: reviewComments,
        reviewed_by: user?.email,
        reviewed_date: new Date().toISOString()
      }
    }, {
      onSuccess: () => {
        setSelectedContract(null);
        setReviewComments('');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Contract Approval Queue', ar: 'قائمة الموافقات على العقود' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Review and approve pending contracts', ar: 'مراجعة والموافقة على العقود المعلقة' })}
        </p>
      </div>

      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <p className="text-4xl font-bold text-blue-600">{contracts.length}</p>
          <p className="text-sm text-slate-600">{t({ en: 'Pending Approval', ar: 'في انتظار الموافقة' })}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {contracts.map(contract => (
          <Card key={contract.id} className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{contract.title_en || contract.title_ar}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{contract.code}</p>
                </div>
                <Badge className="bg-blue-200 text-blue-800">{contract.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Contract Type', ar: 'نوع العقد' })}</p>
                  <p className="text-sm text-slate-900">{contract.contract_type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Value', ar: 'القيمة' })}</p>
                  <p className="text-sm text-slate-900 font-bold">
                    {contract.value?.toLocaleString()} {contract.currency || 'SAR'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Period', ar: 'الفترة' })}</p>
                  <p className="text-sm text-slate-900">
                    {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedContract === contract.id ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder={t({ en: 'Review comments...', ar: 'تعليقات المراجعة...' })}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    className="h-24"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(contract.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Approve', ar: 'موافقة' })}
                    </Button>
                    <Button
                      onClick={() => handleApprove(contract.id, false)}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t({ en: 'Reject', ar: 'رفض' })}
                    </Button>
                    <Button
                      onClick={() => setSelectedContract(null)}
                      variant="outline"
                    >
                      {t({ en: 'Cancel', ar: 'إلغاء' })}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setSelectedContract(contract.id)}>
                  {t({ en: 'Review', ar: 'مراجعة' })}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(ContractApproval, { requiredPermissions: ['contract_approve'] });