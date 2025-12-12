import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { BookOpen, Search, Plus, FileText, ExternalLink, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';

function PolicyLibrary() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => base44.entities.PolicyDocument.list('-created_date')
  });

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = !search || 
      p.title_en?.toLowerCase().includes(search.toLowerCase()) ||
      p.title_ar?.toLowerCase().includes(search.toLowerCase()) ||
      p.policy_code?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: policies.length,
    active: policies.filter(p => p.status === 'active').length,
    regulatory: policies.filter(p => p.category === 'regulatory').length,
    operational: policies.filter(p => p.category === 'operational').length
  };

  const categoryColors = {
    regulatory: 'bg-red-100 text-red-700',
    operational: 'bg-blue-100 text-blue-700',
    strategic: 'bg-purple-100 text-purple-700',
    safety: 'bg-orange-100 text-orange-700',
    environmental: 'bg-green-100 text-green-700'
  };

  const statusColors = {
    draft: 'bg-slate-200 text-slate-700',
    under_review: 'bg-amber-200 text-amber-700',
    active: 'bg-green-200 text-green-700',
    superseded: 'bg-slate-300 text-slate-700',
    archived: 'bg-slate-300 text-slate-700'
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
        icon={BookOpen}
        title={{ en: 'Policy Library', ar: 'مكتبة السياسات' }}
        description={{ en: 'Regulatory policies, laws, and compliance documents', ar: 'السياسات التنظيمية والقوانين ومستندات الامتثال' }}
        stats={[
          { icon: FileText, value: stats.total, label: { en: 'Total', ar: 'الإجمالي' } },
          { icon: BookOpen, value: stats.active, label: { en: 'Active', ar: 'نشط' } }
        ]}
        action={
          <Link to={createPageUrl('PolicyDetail') + '?mode=create'}>
            <PersonaButton>
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add Policy', ar: 'إضافة سياسة' })}
            </PersonaButton>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Regulatory', ar: 'تنظيمي' })}</p>
                <p className="text-2xl font-bold text-red-600">{stats.regulatory}</p>
              </div>
              <FileText className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Operational', ar: 'تشغيلي' })}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.operational}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
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
                  placeholder={t({ en: 'Search policies...', ar: 'البحث عن السياسات...' })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Categories', ar: 'كل الفئات' })}</option>
              <option value="regulatory">{t({ en: 'Regulatory', ar: 'تنظيمي' })}</option>
              <option value="operational">{t({ en: 'Operational', ar: 'تشغيلي' })}</option>
              <option value="strategic">{t({ en: 'Strategic', ar: 'استراتيجي' })}</option>
              <option value="safety">{t({ en: 'Safety', ar: 'سلامة' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPolicies.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No policies found', ar: 'لا توجد سياسات' })}</p>
            </CardContent>
          </Card>
        ) : (
          filteredPolicies.map(policy => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className={`${categoryColors[policy.category]} mb-2`}>
                        {policy.category}
                      </Badge>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {policy.title_en || policy.title_ar}
                      </h3>
                      <p className="text-xs text-slate-500">{policy.policy_code}</p>
                    </div>
                    <Badge className={statusColors[policy.status]}>
                      {policy.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2">
                    {policy.summary_en || policy.summary_ar}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {policy.effective_date ? new Date(policy.effective_date).toLocaleDateString() : 'N/A'}
                    </div>
                    {policy.document_url && (
                      <Link to={policy.document_url} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(PolicyLibrary, { requiredPermissions: [] });