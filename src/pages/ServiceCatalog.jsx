import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Plus, Search, Filter, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ServiceCatalog() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubsector, setFilterSubsector] = useState('all');
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list()
  });

  const { data: subsectors = [] } = useQuery({
    queryKey: ['subsectors'],
    queryFn: () => base44.entities.Subsector.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = !searchQuery || 
      (s.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       s.name_ar?.includes(searchQuery));
    const matchesSubsector = filterSubsector === 'all' || s.subsector_id === filterSubsector;
    return matchesSearch && matchesSubsector;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '📋 Municipal Services Catalog', ar: '📋 كتالوج الخدمات البلدية' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Comprehensive registry of all municipal services with quality benchmarks', ar: 'سجل شامل لجميع الخدمات البلدية مع معايير الجودة' })}
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="bg-white/20 text-white border-white/40">
            {services.length} {t({ en: 'services', ar: 'خدمة' })}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <FileText className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{services.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Services', ar: 'إجمالي الخدمات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {services.filter(s => s.is_digital).length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Digital Services', ar: 'خدمات رقمية' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">
              {services.filter(s => s.linked_challenge_ids?.length > 0).length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'With Challenges', ar: 'مع تحديات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {(services.reduce((sum, s) => sum + (s.quality_benchmark || 0), 0) / (services.length || 1)).toFixed(0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Quality', ar: 'متوسط الجودة' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Services Registry', ar: 'سجل الخدمات' })}</CardTitle>
            <Button className="bg-blue-600">
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Add Service', ar: 'إضافة خدمة' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t({ en: 'Search services...', ar: 'ابحث عن الخدمات...' })}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <select
              value={filterSubsector}
              onChange={(e) => setFilterSubsector(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="all">{t({ en: 'All Subsectors', ar: 'جميع القطاعات' })}</option>
              {subsectors.map(ss => (
                <option key={ss.id} value={ss.id}>
                  {language === 'ar' ? ss.name_ar : ss.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map(service => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Badge className="mb-2">{service.service_code}</Badge>
                  <p className="font-semibold text-slate-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    {service.is_digital && <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Digital</Badge>}
                    {service.quality_benchmark && (
                      <Badge variant="outline" className="text-xs">
                        Quality: {service.quality_benchmark}/100
                      </Badge>
                    )}
                  </div>
                  {service.linked_challenge_ids?.length > 0 && (
                    <p className="text-xs text-slate-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {service.linked_challenge_ids.length} challenges
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ServiceCatalog, { requiredPermissions: [] });