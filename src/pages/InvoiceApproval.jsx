import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { FileText, CheckCircle2, XCircle, DollarSign, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { usePendingInvoices, useInvoiceMutations } from '../hooks/useInvoices';

function InvoiceApproval() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = React.useState(null);
  const [approvalNotes, setApprovalNotes] = React.useState('');

  const { data: invoices = [], isLoading } = usePendingInvoices();
  const { approveInvoice } = useInvoiceMutations();

  const handleApproval = (approved) => {
    approveInvoice.mutate({
      invoiceId: selectedInvoice,
      approved,
      notes: approvalNotes,
      approvedBy: user?.email
    }, {
      onSuccess: () => {
        setSelectedInvoice(null);
        setApprovalNotes('');
      }
    });
  };

  const totalValue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Invoice Approval Queue', ar: 'قائمة الموافقات على الفواتير' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Review and approve pending invoices', ar: 'مراجعة والموافقة على الفواتير المعلقة' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-blue-600">{invoices.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Invoices', ar: 'فواتير معلقة' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-600">{totalValue.toLocaleString()}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Value (SAR)', ar: 'القيمة الإجمالية (ريال)' })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {invoices.map(invoice => (
          <Card key={invoice.id} className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{invoice.vendor_id}</p>
                </div>
                <Badge className="bg-blue-200 text-blue-800">{invoice.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Amount', ar: 'المبلغ' })}</p>
                  <p className="text-lg font-bold text-slate-900">
                    {invoice.amount?.toLocaleString()} {invoice.currency || 'SAR'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Tax', ar: 'الضريبة' })}</p>
                  <p className="text-sm text-slate-900">{invoice.tax_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Issue Date', ar: 'تاريخ الإصدار' })}</p>
                  <p className="text-sm text-slate-900">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}</p>
                  <p className="text-sm text-slate-900">{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedInvoice === invoice.id ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder={t({ en: 'Approval notes...', ar: 'ملاحظات الموافقة...' })}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="h-24"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproval(true)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={approveInvoice.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Approve', ar: 'موافقة' })}
                    </Button>
                    <Button
                      onClick={() => handleApproval(false)}
                      variant="destructive"
                      disabled={approveInvoice.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t({ en: 'Reject', ar: 'رفض' })}
                    </Button>
                    <Button
                      onClick={() => setSelectedInvoice(null)}
                      variant="outline"
                    >
                      {t({ en: 'Cancel', ar: 'إلغاء' })}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setSelectedInvoice(invoice.id)}>
                  {t({ en: 'Review', ar: 'مراجعة' })}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {invoices.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">{t({ en: 'No pending invoices', ar: 'لا توجد فواتير معلقة' })}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(InvoiceApproval, { requiredPermissions: ['invoice_approve'] });