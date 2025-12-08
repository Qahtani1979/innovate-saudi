import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  Building2,
  Users,
  Network as NetworkIcon,
  Search,
  Mail,
  Globe,
  Award,
  Sparkles,
  TrendingUp,
  Target,
  LayoutGrid,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Edit, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NetworkGraph from '../components/NetworkGraph';
import ProtectedPage from '../components/permissions/ProtectedPage';

function NetworkPage() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const queryClient = useQueryClient();

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Organization.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
    }
  });

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = !searchTerm || 
      org.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.name_ar?.includes(searchTerm);
    const matchesType = filterType === 'all' || org.org_type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: organizations.length,
    startups: organizations.filter(o => o.org_type === 'startup').length,
    universities: organizations.filter(o => o.org_type === 'university').length,
    partners: organizations.filter(o => o.is_partner).length
  };

  const typeColors = {
    startup: 'bg-orange-100 text-orange-700',
    sme: 'bg-blue-100 text-blue-700',
    corporate: 'bg-purple-100 text-purple-700',
    university: 'bg-green-100 text-green-700',
    research_center: 'bg-teal-100 text-teal-700',
    government: 'bg-indigo-100 text-indigo-700',
    ngo: 'bg-pink-100 text-pink-700'
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    setAiLoading(true);
    try {
      const orgSummary = organizations.slice(0, 20).map(o => ({
        name: o.name_en,
        type: o.org_type,
        sectors: o.sectors,
        is_partner: o.is_partner
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this innovation ecosystem network for Saudi municipalities and provide strategic insights in BOTH English AND Arabic:

Organizations: ${JSON.stringify(orgSummary)}

Statistics:
- Total: ${stats.total}
- Startups: ${stats.startups}
- Universities: ${stats.universities}
- Active Partners: ${stats.partners}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Ecosystem gaps and missing stakeholder types
2. Strategic partnership opportunities
3. Network strengthening recommendations
4. Cross-sector collaboration potential
5. Capacity building priorities for the network`,
        response_json_schema: {
          type: 'object',
          properties: {
            ecosystem_gaps: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            partnership_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            network_strengthening: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            collaboration_potential: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            capacity_priorities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
          }
        }
      });
      setAiInsights(result);
    } catch (error) {
      toast.error(t({ en: 'Failed to generate AI insights', ar: 'فشل توليد الرؤى الذكية' }));
    } finally {
      setAiLoading(false);
    }
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
            {t({ en: 'Network & Partners', ar: 'الشبكة والشركاء' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Innovation ecosystem and partnership network', ar: 'منظومة الابتكار وشبكة الشراكات' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleAIInsights}>
            <Sparkles className="h-4 w-4" />
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
              variant={viewMode === 'graph' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('graph')}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Link to={createPageUrl('OrganizationCreate')}>
            <Button className="bg-gradient-to-r from-blue-600 to-teal-600 gap-2">
              <Building2 className="h-4 w-4" />
              {t({ en: 'Add Organization', ar: 'إضافة جهة' })}
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Network Insights', ar: 'رؤى الشبكة الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing network...', ar: 'جاري تحليل الشبكة...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.ecosystem_gaps?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Ecosystem Gaps', ar: 'فجوات المنظومة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.ecosystem_gaps.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.partnership_opportunities?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Partnership Opportunities', ar: 'فرص الشراكة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.partnership_opportunities.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.network_strengthening?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Network Strengthening', ar: 'تقوية الشبكة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.network_strengthening.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.collaboration_potential?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Collaboration Potential', ar: 'إمكانات التعاون' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.collaboration_potential.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.capacity_priorities?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Capacity Priorities', ar: 'أولويات القدرات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.capacity_priorities.map((item, i) => (
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
                <p className="text-sm text-slate-600">Total Organizations</p>
                <p className="text-sm text-slate-600" dir="rtl">إجمالي الجهات</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Startups & SMEs</p>
                <p className="text-sm text-slate-600" dir="rtl">الشركات الناشئة</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.startups}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Universities</p>
                <p className="text-sm text-slate-600" dir="rtl">الجامعات</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.universities}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Partners</p>
                <p className="text-sm text-slate-600" dir="rtl">الشركاء النشطون</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.partners}</p>
              </div>
              <NetworkIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search organizations...', ar: 'ابحث عن الجهات...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Organization Type', ar: 'نوع الجهة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Types', ar: 'جميع الأنواع' })}</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="sme">SME</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="university">University</SelectItem>
                <SelectItem value="research_center">Research Center</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="ngo">NGO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="directory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="directory">{t({ en: 'Directory', ar: 'الدليل' })}</TabsTrigger>
          <TabsTrigger value="partnerships">{t({ en: 'Partnerships', ar: 'الشراكات' })}</TabsTrigger>
          <TabsTrigger value="map">{t({ en: 'Network Map', ar: 'خريطة الشبكة' })}</TabsTrigger>
        </TabsList>

        {/* Directory */}
        <TabsContent value="directory">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrgs.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={typeColors[org.org_type]}>
                      {org.org_type?.replace(/_/g, ' ')}
                    </Badge>
                    {org.is_partner && (
                      <Badge variant="outline" className="border-green-300 text-green-700">
                        Partner
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">
                    {language === 'ar' && org.name_ar ? org.name_ar : org.name_en}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {language === 'ar' && org.description_ar ? org.description_ar : org.description_en}
                  </p>

                  {org.sectors && org.sectors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {org.sectors.slice(0, 3).map((sector, i) => (
                        <Badge key={i} variant="outline" className="text-xs capitalize">
                          {sector.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Link to={createPageUrl(`OrganizationDetail?id=${org.id}`)} className="flex-1">
                      <Button variant="outline" className="w-full text-sm">
                        {t({ en: 'View', ar: 'عرض' })}
                      </Button>
                    </Link>
                    <Link to={createPageUrl(`OrganizationEdit?id=${org.id}`)}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
            <NetworkGraph organizations={filteredOrgs} />
          )}
        </TabsContent>

        {/* Partnerships */}
        <TabsContent value="partnerships">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Active Partnerships', ar: 'الشراكات النشطة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizations.filter(o => o.is_partner).map((org) => (
                  <div key={org.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {language === 'ar' && org.name_ar ? org.name_ar : org.name_en}
                          </p>
                          <p className="text-sm text-slate-600">
                            {org.org_type?.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Map */}
        <TabsContent value="map">
          <NetworkGraph organizations={organizations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(NetworkPage, { requiredPermissions: ['org_view_all'] });