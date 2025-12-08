import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Shield, Search, Plus, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function RegulatoryLibrary() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterRisk, setFilterRisk] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  const { data: exemptions = [] } = useQuery({
    queryKey: ['regulatory-exemptions'],
    queryFn: () => base44.entities.RegulatoryExemption.list()
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['exemption-audits'],
    queryFn: () => base44.entities.ExemptionAuditLog.list()
  });

  const filteredExemptions = exemptions
    .filter(ex => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        ex.title_en?.toLowerCase().includes(searchLower) ||
        ex.title_ar?.includes(searchTerm) ||
        ex.exemption_code?.toLowerCase().includes(searchLower) ||
        ex.description_en?.toLowerCase().includes(searchLower) ||
        ex.legal_basis?.toLowerCase().includes(searchLower) ||
        ex.conditions?.some(c => c.toLowerCase().includes(searchLower));
      
      const matchesCategory = filterCategory === 'all' || ex.category === filterCategory;
      const matchesDomain = filterDomain === 'all' || ex.domain === filterDomain;
      const matchesStatus = filterStatus === 'all' || ex.status === filterStatus;
      const matchesRisk = filterRisk === 'all' || ex.risk_level === filterRisk;
      
      return matchesSearch && matchesCategory && matchesDomain && matchesStatus && matchesRisk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title_en || '').localeCompare(b.title_en || '');
        case 'code':
          return (a.exemption_code || '').localeCompare(b.exemption_code || '');
        case 'domain':
          return (a.domain || '').localeCompare(b.domain || '');
        case 'risk':
          const riskOrder = { low: 1, medium: 2, high: 3 };
          return (riskOrder[a.risk_level] || 0) - (riskOrder[b.risk_level] || 0);
        case 'date':
          return new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date);
        default:
          return 0;
      }
    });

  const categoryColors = {
    licensing: 'bg-blue-100 text-blue-700',
    safety_standards: 'bg-red-100 text-red-700',
    data_privacy: 'bg-purple-100 text-purple-700',
    operational_restrictions: 'bg-amber-100 text-amber-700',
    insurance: 'bg-green-100 text-green-700',
    reporting: 'bg-teal-100 text-teal-700',
    other: 'bg-slate-100 text-slate-700'
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700'
  };

  const riskColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  };

  const stats = {
    total: exemptions.length,
    active: exemptions.filter(e => e.status === 'active').length,
    expiringSoon: exemptions.filter(e => {
      if (!e.expiration_date) return false;
      const daysUntil = (new Date(e.expiration_date) - new Date()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 30 && daysUntil > 0;
    }).length
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Regulatory Exemption Library', ar: 'مكتبة الإعفاءات التنظيمية' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Centralized repository of regulatory exemptions for sandbox operations', ar: 'مستودع مركزي للإعفاءات التنظيمية لعمليات مناطق الاختبار' })}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Add Exemption', ar: 'إضافة إعفاء' })}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Exemptions', ar: 'إجمالي الإعفاءات' })}</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Expiring Soon', ar: 'تنتهي قريباً' })}</p>
                <p className="text-3xl font-bold text-amber-600">{stats.expiringSoon}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search by code, title, description, legal basis, conditions...', ar: 'البحث بالرمز أو العنوان أو الوصف...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Category', ar: 'الفئة' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Categories', ar: 'جميع الفئات' })}</SelectItem>
                  <SelectItem value="licensing">Licensing</SelectItem>
                  <SelectItem value="safety_standards">Safety Standards</SelectItem>
                  <SelectItem value="data_privacy">Data Privacy</SelectItem>
                  <SelectItem value="operational_restrictions">Operations</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDomain} onValueChange={setFilterDomain}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Domain', ar: 'المجال' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Domains', ar: 'جميع المجالات' })}</SelectItem>
                  <SelectItem value="smart_mobility">Smart Mobility</SelectItem>
                  <SelectItem value="digital_services">Digital Services</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Risks', ar: 'كل المخاطر' })}</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Statuses', ar: 'جميع الحالات' })}</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">{t({ en: 'Sort: Title', ar: 'ترتيب: العنوان' })}</SelectItem>
                  <SelectItem value="code">{t({ en: 'Sort: Code', ar: 'ترتيب: الرمز' })}</SelectItem>
                  <SelectItem value="domain">{t({ en: 'Sort: Domain', ar: 'ترتيب: المجال' })}</SelectItem>
                  <SelectItem value="risk">{t({ en: 'Sort: Risk', ar: 'ترتيب: المخاطر' })}</SelectItem>
                  <SelectItem value="date">{t({ en: 'Sort: Recent', ar: 'ترتيب: الأحدث' })}</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                  setFilterDomain('all');
                  setFilterStatus('active');
                  setFilterRisk('all');
                  setSortBy('title');
                }}
              >
                {t({ en: 'Clear', ar: 'مسح' })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemptions List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredExemptions.map((exemption) => {
          const usageCount = auditLogs.filter(log => log.exemption_id === exemption.id && log.action === 'granted').length;
          const daysUntilExpiry = exemption.expiration_date ? 
            Math.floor((new Date(exemption.expiration_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

          return (
            <Card key={exemption.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono">{exemption.exemption_code}</Badge>
                      <Badge className={categoryColors[exemption.category]}>
                        {exemption.category.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className={statusColors[exemption.status]}>
                        {exemption.status}
                      </Badge>
                      {exemption.risk_level && (
                        <Badge variant="outline" className={riskColors[exemption.risk_level]}>
                          {exemption.risk_level} risk
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {exemption.title_en}
                    </h3>
                    {exemption.title_ar && (
                      <p className="text-sm text-slate-600 mb-2" dir="rtl">{exemption.title_ar}</p>
                    )}

                    <p className="text-sm text-slate-600 mb-3">{exemption.description_en}</p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">{t({ en: 'Domain:', ar: 'المجال:' })}</span>
                        <p className="font-medium capitalize">{exemption.domain?.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">{t({ en: 'Duration:', ar: 'المدة:' })}</span>
                        <p className="font-medium">{exemption.duration_months} {t({ en: 'months', ar: 'أشهر' })}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">{t({ en: 'Times Used:', ar: 'مرات الاستخدام:' })}</span>
                        <p className="font-medium">{usageCount}</p>
                      </div>
                    </div>

                    {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                      <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
                        <p className="text-sm text-amber-800">
                          ⚠ {t({ en: 'Expires in', ar: 'ينتهي في' })} {daysUntilExpiry} {t({ en: 'days', ar: 'يوم' })}
                        </p>
                      </div>
                    )}

                    {exemption.conditions && exemption.conditions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-700 mb-1">
                          {t({ en: 'Conditions:', ar: 'الشروط:' })}
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {exemption.conditions.slice(0, 2).map((cond, idx) => (
                            <li key={idx}>• {cond}</li>
                          ))}
                          {exemption.conditions.length > 2 && (
                            <li className="text-blue-600">+ {exemption.conditions.length - 2} more...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Link to={createPageUrl(`RegulatoryExemptionDetail?id=${exemption.id}`)}>
                    <Button variant="outline" size="sm">
                      {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredExemptions.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-slate-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>{t({ en: 'No exemptions found', ar: 'لم يتم العثور على إعفاءات' })}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}