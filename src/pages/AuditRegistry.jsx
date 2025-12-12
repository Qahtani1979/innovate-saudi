import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Shield, Search, Plus, AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function AuditRegistry() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list('-created_date')
  });

  const filteredAudits = audits.filter(a => {
    const matchesSearch = !search || 
      a.audit_title?.toLowerCase().includes(search.toLowerCase()) ||
      a.audit_code?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || a.audit_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: audits.length,
    in_progress: audits.filter(a => a.status === 'in_progress').length,
    completed: audits.filter(a => a.status === 'completed').length,
    issues_found: audits.reduce((sum, a) => sum + (a.findings?.filter(f => f.severity === 'high' || f.severity === 'critical').length || 0), 0)
  };

  const typeColors = {
    compliance: 'bg-blue-100 text-blue-700',
    financial: 'bg-green-100 text-green-700',
    operational: 'bg-purple-100 text-purple-700',
    security: 'bg-red-100 text-red-700',
    performance: 'bg-amber-100 text-amber-700'
  };

  const statusColors = {
    planned: 'bg-slate-200 text-slate-700',
    in_progress: 'bg-blue-200 text-blue-700',
    completed: 'bg-green-200 text-green-700',
    follow_up_required: 'bg-amber-200 text-amber-700'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={Shield}
        title={{ en: 'Audit Registry', ar: 'سجل التدقيق' }}
        description={{ en: 'Compliance audits and quality assurance tracking', ar: 'تدقيق الامتثال وتتبع ضمان الجودة' }}
        action={
          <Link to={createPageUrl('AuditDetail') + '?mode=create'}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Schedule Audit', ar: 'جدولة تدقيق' })}
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Audits', ar: 'إجمالي التدقيقات' })}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Shield className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Critical Issues', ar: 'قضايا حرجة' })}</p>
                <p className="text-2xl font-bold text-red-600">{stats.issues_found}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
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
                  placeholder={t({ en: 'Search audits...', ar: 'البحث عن التدقيقات...' })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Types', ar: 'كل الأنواع' })}</option>
              <option value="compliance">{t({ en: 'Compliance', ar: 'امتثال' })}</option>
              <option value="financial">{t({ en: 'Financial', ar: 'مالي' })}</option>
              <option value="security">{t({ en: 'Security', ar: 'أمني' })}</option>
              <option value="operational">{t({ en: 'Operational', ar: 'تشغيلي' })}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Status', ar: 'كل الحالات' })}</option>
              <option value="in_progress">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</option>
              <option value="completed">{t({ en: 'Completed', ar: 'مكتمل' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audits List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Audits', ar: 'التدقيقات' })} ({filteredAudits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAudits.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No audits found', ar: 'لا توجد تدقيقات' })}</p>
              </div>
            ) : (
              filteredAudits.map(audit => (
                <Link key={audit.id} to={createPageUrl('AuditDetail') + `?id=${audit.id}`}>
                  <div className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{audit.audit_title}</h3>
                          <Badge className={typeColors[audit.audit_type]}>
                            {audit.audit_type}
                          </Badge>
                          <Badge className={statusColors[audit.status]}>
                            {audit.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{audit.scope}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-3">
                      <div>
                        <span className="font-medium">{t({ en: 'Auditor:', ar: 'المدقق:' })}</span> {audit.lead_auditor_email}
                      </div>
                      {audit.start_date && (
                        <div>
                          <span className="font-medium">{t({ en: 'Date:', ar: 'التاريخ:' })}</span> {new Date(audit.start_date).toLocaleDateString()}
                        </div>
                      )}
                      {audit.findings && audit.findings.length > 0 && (
                        <Badge variant="outline">
                          {audit.findings.length} {t({ en: 'findings', ar: 'نتيجة' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(AuditRegistry, { 
  requiredPermissions: ['audit_view_all'] 
});