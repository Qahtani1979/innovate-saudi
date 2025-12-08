import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Search, Plus, DollarSign, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function InvoiceManagement() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date')
  });

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = !search || 
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.vendor_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'submitted').length,
    approved: invoices.filter(i => i.status === 'approved').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    total_amount: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
    paid_amount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0)
  };

  const statusColors = {
    draft: 'bg-slate-200 text-slate-700',
    submitted: 'bg-amber-200 text-amber-700',
    under_review: 'bg-blue-200 text-blue-700',
    approved: 'bg-green-200 text-green-700',
    paid: 'bg-green-300 text-green-800',
    rejected: 'bg-red-200 text-red-700',
    disputed: 'bg-orange-200 text-orange-700',
    cancelled: 'bg-slate-300 text-slate-700'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Invoice Management', ar: 'إدارة الفواتير' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Track and process vendor invoices', ar: 'تتبع ومعالجة فواتير الموردين' })}
          </p>
        </div>
        <Link to={createPageUrl('InvoiceApproval')}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'New Invoice', ar: 'فاتورة جديدة' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'معتمد' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Paid', ar: 'مدفوع' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">{t({ en: 'Total Amount', ar: 'المبلغ الإجمالي' })}</p>
              <p className="text-xl font-bold text-blue-600">{(stats.total_amount / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-slate-500 mt-1">
                {t({ en: 'Paid:', ar: 'مدفوع:' })} {(stats.paid_amount / 1000000).toFixed(2)}M
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t({ en: 'Search invoices...', ar: 'البحث عن الفواتير...' })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Status', ar: 'كل الحالات' })}</option>
              <option value="submitted">{t({ en: 'Submitted', ar: 'مقدم' })}</option>
              <option value="approved">{t({ en: 'Approved', ar: 'معتمد' })}</option>
              <option value="paid">{t({ en: 'Paid', ar: 'مدفوع' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Invoice #', ar: 'رقم الفاتورة' })}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Vendor', ar: 'المورد' })}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Amount', ar: 'المبلغ' })}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                    {t({ en: 'Status', ar: 'الحالة' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => {
                  const isOverdue = invoice.due_date && invoice.status !== 'paid' && 
                    new Date(invoice.due_date) < new Date();
                  
                  return (
                    <tr key={invoice.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link to={createPageUrl('PaymentTracking') + `?id=${invoice.id}`}>
                          <span className="font-medium text-blue-600 hover:underline">
                            {invoice.invoice_number}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {invoice.vendor_name}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {invoice.total_amount?.toLocaleString()} SAR
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                          </span>
                          {isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={statusColors[invoice.status]}>
                          {invoice.status?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(InvoiceManagement, { 
  requiredPermissions: ['invoice_view_all'] 
});