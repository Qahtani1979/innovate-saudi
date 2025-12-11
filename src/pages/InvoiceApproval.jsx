import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { FileText, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';

function InvoiceApproval() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = React.useState(null);
  const [approvalNotes, setApprovalNotes] = React.useState('');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices-pending'],
    queryFn: async () => {
      const { data } = await supabase.from('invoices').select('*').eq('status', 'submitted');
      return data || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ invoiceId, approved }) => {
      const { error } = await supabase.from('invoices').update({
        status: approved ? 'approved' : 'draft',
        approved_by: approved ? user?.email : null,
        approval_date: approved ? new Date().toISOString() : null,
        approval_notes: approvalNotes
      }).eq('id', invoiceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices-pending'] });
      setSelectedInvoice(null);
      setApprovalNotes('');
    }
  });

  const totalValue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

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
                      onClick={() => approveMutation.mutate({ invoiceId: invoice.id, approved: true })}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Approve', ar: 'موافقة' })}
                    </Button>
                    <Button
                      onClick={() => approveMutation.mutate({ invoiceId: invoice.id, approved: false })}
                      variant="destructive"
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
      </div>
    </div>
  );
}

export default ProtectedPage(InvoiceApproval, { requiredPermissions: ['invoice_approve'] });