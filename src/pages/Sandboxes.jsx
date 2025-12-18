import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  Shield,
  MapPin,
  Zap,
  Search,
  Plus,
  Sparkles,
  TestTube,
  FileText,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  List,
  Map,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Edit, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '../components/permissions/usePermissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function SandboxesPage() {
  const { hasPermission } = usePermissions();
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const queryClient = useQueryClient();

  const { data: sandboxes = [], isLoading } = useQuery({
    queryKey: ['sandboxes'],
    queryFn: () => base44.entities.Sandbox.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Sandbox.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sandboxes']);
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const filteredSandboxes = sandboxes.filter(sandbox => {
    const matchesSearch = !searchTerm || 
      sandbox.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sandbox.name_ar?.includes(searchTerm);
    const matchesDomain = filterDomain === 'all' || sandbox.domain === filterDomain;
    const matchesStatus = filterStatus === 'all' || sandbox.status === filterStatus;
    return matchesSearch && matchesDomain && matchesStatus;
  });

  const stats = {
    total: sandboxes.length,
    active: sandboxes.filter(s => s.status === 'active').length,
    capacity: sandboxes.reduce((sum, s) => sum + (s.capacity || 0), 0),
    currentPilots: sandboxes.reduce((sum, s) => sum + (s.current_pilots || 0), 0)
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    
    // Import centralized prompt module
    const { 
      SANDBOX_PORTFOLIO_PROMPT_TEMPLATE, 
      SANDBOX_PORTFOLIO_RESPONSE_SCHEMA 
    } = await import('@/lib/ai/prompts/sandbox/portfolioAnalysis');
    
    const sandboxSummary = sandboxes.slice(0, 10).map(s => ({
      name: s.name_en,
      domain: s.domain,
      status: s.status,
      capacity: s.capacity,
      current_pilots: s.current_pilots,
      success_rate: s.success_rate
    }));

    const result = await invokeAI({
      prompt: SANDBOX_PORTFOLIO_PROMPT_TEMPLATE({ sandboxSummary, stats }),
      response_json_schema: SANDBOX_PORTFOLIO_RESPONSE_SCHEMA
    });
    if (result.success) {
      setAiInsights(result.data);
    }
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-700',
    full: 'bg-red-100 text-red-700'
  };

  const domainColors = {
    smart_mobility: 'bg-blue-100 text-blue-700',
    digital_services: 'bg-purple-100 text-purple-700',
    environment: 'bg-green-100 text-green-700',
    energy: 'bg-yellow-100 text-yellow-700',
    health: 'bg-red-100 text-red-700',
    fintech: 'bg-orange-100 text-orange-700',
    general: 'bg-slate-100 text-slate-700'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Sandbox Zones', ar: 'مناطق التجريب' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Regulatory sandboxes for innovation testing', ar: 'مناطق التجريب التنظيمية للابتكار' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleAIInsights} disabled={aiLoading || !isAvailable}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
          </Button>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
          {hasPermission('sandbox_manage') && (
            <Button className="bg-gradient-to-r from-blue-600 to-teal-600 gap-2">
              <Plus className="h-5 w-5" />
              {t({ en: 'New Sandbox', ar: 'منطقة جديدة' })}
            </Button>
          )}
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing sandboxes...', ar: 'جاري تحليل المناطق...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.capacity_optimization?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Capacity Optimization', ar: 'تحسين السعة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.capacity_optimization.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.domain_insights?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Domain Insights', ar: 'رؤى المجالات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.domain_insights.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.risk_management?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Risk Management', ar: 'إدارة المخاطر' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.risk_management.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.expansion_opportunities?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Expansion Opportunities', ar: 'فرص التوسع' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.expansion_opportunities.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.best_practices?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Best Practices', ar: 'أفضل الممارسات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.best_practices.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Sandboxes</p>
                <p className="text-sm text-slate-600" dir="rtl">إجمالي المناطق</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Zones</p>
                <p className="text-sm text-slate-600" dir="rtl">المناطق النشطة</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Capacity</p>
                <p className="text-sm text-slate-600" dir="rtl">السعة الإجمالية</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.capacity}</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Current Pilots</p>
                <p className="text-sm text-slate-600" dir="rtl">التجارب الحالية</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.currentPilots}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      {showAIInsights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Sparkles className="h-5 w-5" />
                {t({ en: 'AI Ecosystem Insights', ar: 'رؤى النظام الذكية' })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing...', ar: 'يحلل...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiInsights.coverage_gaps?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Coverage Gaps', ar: 'فجوات التغطية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.coverage_gaps.map((gap, i) => (
                        <li key={i} className="text-slate-700">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.capacity_tips?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Capacity Optimization', ar: 'تحسين السعة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.capacity_tips.map((tip, i) => (
                        <li key={i} className="text-slate-700">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.exemption_trends?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Exemption Trends', ar: 'اتجاهات الإعفاء' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.exemption_trends.map((trend, i) => (
                        <li key={i} className="text-slate-700">• {trend}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.risk_practices?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Risk Best Practices', ar: 'أفضل ممارسات المخاطر' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.risk_practices.map((practice, i) => (
                        <li key={i} className="text-slate-700">• {practice}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.synergies?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Cross-Sandbox Synergies', ar: 'التآزر بين المناطق' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.synergies.map((syn, i) => (
                        <li key={i} className="text-slate-700">• {syn}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search sandboxes...', ar: 'ابحث عن المناطق...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Domain', ar: 'المجال' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Domains', ar: 'جميع المجالات' })}</SelectItem>
                <SelectItem value="smart_mobility">Smart Mobility</SelectItem>
                <SelectItem value="digital_services">Digital Services</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Statuses', ar: 'جميع الحالات' })}</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sandboxes Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSandboxes.map((sandbox) => {
            const utilizationRate = sandbox.capacity ? ((sandbox.current_pilots || 0) / sandbox.capacity * 100).toFixed(0) : 0;
            
            return (
              <Card key={sandbox.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {sandbox.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img src={sandbox.image_url} alt={sandbox.name_en} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={domainColors[sandbox.domain]}>
                      {sandbox.domain?.replace(/_/g, ' ')}
                    </Badge>
                    <Badge className={statusColors[sandbox.status]}>
                      {sandbox.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {language === 'ar' && sandbox.name_ar ? sandbox.name_ar : sandbox.name_en}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {language === 'ar' && sandbox.description_ar ? sandbox.description_ar : sandbox.description_en}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{t({ en: 'Capacity', ar: 'السعة' })}</span>
                      <span className="font-medium">{sandbox.current_pilots || 0} / {sandbox.capacity || 0}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${utilizationRate >= 90 ? 'bg-red-600' : utilizationRate >= 70 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{utilizationRate}% {t({ en: 'utilized', ar: 'مستخدم' })}</p>
                  </div>

                  {sandbox.available_exemptions && sandbox.available_exemptions.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">{t({ en: 'Regulatory Exemptions', ar: 'الاستثناءات التنظيمية' })}</p>
                      <div className="flex flex-wrap gap-1">
                        {sandbox.available_exemptions.slice(0, 3).map((exemption, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {exemption}
                          </Badge>
                        ))}
                        {sandbox.available_exemptions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{sandbox.available_exemptions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Link to={createPageUrl(`SandboxDetail?id=${sandbox.id}`)} className="flex-1">
                      <Button variant="outline" className="w-full">
                        {t({ en: 'View', ar: 'عرض' })}
                      </Button>
                    </Link>
                    {hasPermission('sandbox_manage') && (
                      <Link to={createPageUrl(`SandboxEdit?id=${sandbox.id}`)}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Sandbox', ar: 'المنطقة' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Domain', ar: 'المجال' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Status', ar: 'الحالة' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Capacity', ar: 'السعة' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Utilization', ar: 'الاستخدام' })}</th>
                    <th className="text-right p-4 text-sm font-semibold">{t({ en: 'Actions', ar: 'إجراءات' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSandboxes.map((sandbox) => {
                    const utilizationRate = sandbox.capacity ? ((sandbox.current_pilots || 0) / sandbox.capacity * 100).toFixed(0) : 0;
                    return (
                      <tr key={sandbox.id} className="border-b hover:bg-slate-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {sandbox.image_url && (
                              <img src={sandbox.image_url} alt={sandbox.name_en} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div>
                              <p className="font-medium">{sandbox.name_en}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {sandbox.city_id?.substring(0, 20)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={domainColors[sandbox.domain]}>{sandbox.domain?.replace(/_/g, ' ')}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={statusColors[sandbox.status]}>{sandbox.status}</Badge>
                        </td>
                        <td className="p-4 text-sm">{sandbox.current_pilots || 0} / {sandbox.capacity || 0}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${utilizationRate >= 90 ? 'bg-red-600' : utilizationRate >= 70 ? 'bg-yellow-600' : 'bg-green-600'}`}
                                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-12">{utilizationRate}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Link to={createPageUrl(`SandboxDetail?id=${sandbox.id}`)}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              {t({ en: 'View', ar: 'عرض' })}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">{t({ en: 'Map view coming soon', ar: 'عرض الخريطة قريباً' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredSandboxes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t({ en: 'No sandboxes found', ar: 'لا توجد مناطق' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(SandboxesPage, { requiredPermissions: ['sandbox_view_all'] });