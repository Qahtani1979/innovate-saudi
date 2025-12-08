import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Search, Plus, Calendar, DollarSign, AlertCircle, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ContractManagement() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.Contract.list('-created_date')
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = !search || 
      c.contract_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.party_a_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.party_b_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    draft: 'bg-slate-200 text-slate-700',
    pending_signature: 'bg-amber-200 text-amber-700',
    active: 'bg-green-200 text-green-700',
    expired: 'bg-red-200 text-red-700',
    terminated: 'bg-red-300 text-red-800',
    completed: 'bg-blue-200 text-blue-700'
  };

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    pending: contracts.filter(c => c.status === 'pending_signature').length,
    expiring_soon: contracts.filter(c => {
      if (!c.end_date) return false;
      const daysUntilExpiry = Math.floor((new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length,
    total_value: contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.contract_value || 0), 0)
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
            {t({ en: 'Contract Management', ar: 'إدارة العقود' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Manage agreements, MOUs, and formal contracts', ar: 'إدارة الاتفاقيات والعقود الرسمية' })}
          </p>
        </div>
        <Link to={createPageUrl('ContractDetail') + '?mode=create'}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'New Contract', ar: 'عقد جديد' })}
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

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200">
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

        <Card className="border-2 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Expiring Soon', ar: 'ينتهي قريباً' })}</p>
                <p className="text-2xl font-bold text-red-600">{stats.expiring_soon}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Value', ar: 'القيمة الإجمالية' })}</p>
                <p className="text-2xl font-bold text-blue-600">{(stats.total_value / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
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
                  placeholder={t({ en: 'Search contracts...', ar: 'البحث عن العقود...' })}
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
              <option value="draft">{t({ en: 'Draft', ar: 'مسودة' })}</option>
              <option value="pending_signature">{t({ en: 'Pending', ar: 'معلق' })}</option>
              <option value="active">{t({ en: 'Active', ar: 'نشط' })}</option>
              <option value="expired">{t({ en: 'Expired', ar: 'منتهي' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Contracts', ar: 'العقود' })} ({filteredContracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredContracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No contracts found', ar: 'لا توجد عقود' })}</p>
              </div>
            ) : (
              filteredContracts.map(contract => (
                <Link key={contract.id} to={createPageUrl('ContractDetail') + `?id=${contract.id}`}>
                  <div className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{contract.contract_number}</h3>
                          <Badge className={statusColors[contract.status] || 'bg-slate-200'}>
                            {contract.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{contract.title_en || contract.title_ar}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {contract.contract_value ? `${(contract.contract_value / 1000000).toFixed(2)}M SAR` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{contract.party_a_name} ↔ {contract.party_b_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'N/A'}
                          {' → '}
                          {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {contract.contract_type && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {contract.contract_type}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ContractManagement, { 
  requiredPermissions: ['contract_view_all'] 
});