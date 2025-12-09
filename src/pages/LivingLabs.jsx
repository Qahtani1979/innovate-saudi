import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { 
  Microscope, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Users,
  Activity,
  Package,
  DollarSign,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Map,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '../components/permissions/usePermissions';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function LivingLabsPage() {
  const { hasPermission } = usePermissions();
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: labs = [] } = useQuery({
    queryKey: ['living-labs'],
    queryFn: () => base44.entities.LivingLab.list()
  });

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    const typeDist = Object.entries(labs.reduce((acc, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {}))
      .map(([type, count]) => `- ${type}: ${count}`).join('\n');
    
    const result = await invokeAI({
      prompt: `Analyze the Living Labs ecosystem and provide strategic insights:

Total Labs: ${labs.length}
Active Labs: ${labs.filter(l => l.status === 'active').length}

Lab Types Distribution:
${typeDist}

Provide:
1. Coverage gaps (geographic or domain)
2. Utilization optimization recommendations
3. New lab type suggestions
4. Partnership opportunities between labs
5. Resource sharing strategies`,
      response_json_schema: {
        type: 'object',
        properties: {
          coverage_gaps: { type: 'array', items: { type: 'string' } },
          utilization_tips: { type: 'array', items: { type: 'string' } },
          new_lab_suggestions: { type: 'array', items: { type: 'string' } },
          partnership_opportunities: { type: 'array', items: { type: 'string' } },
          resource_sharing: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    
    if (result.success) {
      setAiInsights(result.data);
    } else {
      toast.error(t({ en: 'Failed to generate insights', ar: 'فشل توليد الرؤى' }));
    }
  };

  const { data: labs = [] } = useQuery({
    queryKey: ['living-labs'],
    queryFn: () => base44.entities.LivingLab.list()
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['lab-bookings'],
    queryFn: () => base44.entities.LivingLabBooking.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const filteredLabs = labs.filter(lab => {
    const matchesSearch = !searchTerm || 
      lab.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.name_ar?.includes(searchTerm) ||
      lab.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || lab.lab_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || lab.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const totalCapacity = labs.reduce((acc, lab) => acc + (lab.capacity || 0), 0);
  const usedCapacity = labs.reduce((acc, lab) => acc + (lab.current_projects || 0), 0);
  const avgUtilization = labs.length > 0 ? Math.round(labs.reduce((acc, lab) => acc + (lab.utilization_rate || 0), 0) / labs.length) : 0;

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-slate-100 text-slate-700',
    maintenance: 'bg-amber-100 text-amber-700',
    full: 'bg-red-100 text-red-700'
  };

  const typeColors = {
    smart_city: 'bg-purple-100 text-purple-700',
    iot_testbed: 'bg-blue-100 text-blue-700',
    mobility: 'bg-teal-100 text-teal-700',
    sustainability: 'bg-green-100 text-green-700',
    digital_services: 'bg-indigo-100 text-indigo-700',
    multi_purpose: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Living Labs Network', ar: 'شبكة المختبرات الحية' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Innovation testbeds and experimentation facilities', ar: 'منصات الاختبار والتجريب للابتكار' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button onClick={handleAIInsights} variant="outline" className="gap-2" disabled={aiLoading || !isAvailable}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
          </Button>
          {hasPermission('livinglab_manage') && (
            <Link to={createPageUrl('LivingLabCreate')}>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Create Lab', ar: 'إنشاء مختبر' })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Labs', ar: 'المختبرات النشطة' })}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {labs.filter(l => l.status === 'active').length}
                </p>
              </div>
              <Microscope className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'المشاريع النشطة' })}</p>
                <p className="text-3xl font-bold text-blue-600">{activeBookings}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Capacity Used', ar: 'السعة المستخدمة' })}</p>
                <p className="text-3xl font-bold text-teal-600">{usedCapacity}/{totalCapacity}</p>
              </div>
              <Package className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Utilization', ar: 'متوسط الاستخدام' })}</p>
                <p className="text-3xl font-bold text-green-600">{avgUtilization}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
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
                {aiInsights.utilization_tips?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Utilization Tips', ar: 'نصائح الاستخدام' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.utilization_tips.map((tip, i) => (
                        <li key={i} className="text-slate-700">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.new_lab_suggestions?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'New Lab Ideas', ar: 'أفكار مختبرات جديدة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.new_lab_suggestions.map((sug, i) => (
                        <li key={i} className="text-slate-700">• {sug}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.partnership_opportunities?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Partnerships', ar: 'الشراكات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.partnership_opportunities.map((opp, i) => (
                        <li key={i} className="text-slate-700">• {opp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.resource_sharing?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Resource Sharing', ar: 'مشاركة الموارد' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.resource_sharing.map((strategy, i) => (
                        <li key={i} className="text-slate-700">• {strategy}</li>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t({ en: 'Search labs...', ar: 'بحث المختبرات...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Lab Type', ar: 'نوع المختبر' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Types', ar: 'جميع الأنواع' })}</SelectItem>
                <SelectItem value="smart_city">Smart City</SelectItem>
                <SelectItem value="iot_testbed">IoT Testbed</SelectItem>
                <SelectItem value="mobility">Mobility</SelectItem>
                <SelectItem value="sustainability">Sustainability</SelectItem>
                <SelectItem value="digital_services">Digital Services</SelectItem>
                <SelectItem value="multi_purpose">Multi-Purpose</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Status', ar: 'جميع الحالات' })}</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              {t({ en: 'More Filters', ar: 'مزيد من الفلاتر' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Labs Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => {
            const labBookings = bookings.filter(b => b.living_lab_id === lab.id && b.status === 'active');
            const labPilots = pilots.filter(p => p.living_lab_id === lab.id);
            
            return (
              <Link key={lab.id} to={createPageUrl(`LivingLabDetail?id=${lab.id}`)}>
                <Card className="hover:shadow-lg transition-all border-t-4 border-t-purple-500 h-full overflow-hidden">
                  {lab.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img src={lab.image_url} alt={lab.name_en} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {lab.code}
                          </Badge>
                          <Badge className={statusColors[lab.status]}>
                            {lab.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">
                          {language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en}
                        </CardTitle>
                      </div>
                      <Microscope className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Badge className={typeColors[lab.lab_type]}>
                      {lab.lab_type?.replace(/_/g, ' ')}
                    </Badge>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{lab.city_id?.substring(0, 20)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <Activity className="h-4 w-4" />
                        <span>
                          {lab.current_projects || 0} / {lab.capacity || 0} {t({ en: 'projects', ar: 'مشاريع' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{labBookings.length} {t({ en: 'active bookings', ar: 'حجوزات نشطة' })}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</span>
                        <span className="font-medium">{lab.utilization_rate || 0}%</span>
                      </div>
                      <Progress value={lab.utilization_rate || 0} className="h-2" />
                    </div>

                    {lab.facilities && lab.facilities.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-slate-500 mb-2">
                          {t({ en: 'Key Facilities:', ar: 'المرافق الرئيسية:' })}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {lab.facilities.slice(0, 3).map((facility, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                          {lab.facilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{lab.facilities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
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
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Lab', ar: 'المختبر' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Type', ar: 'النوع' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Status', ar: 'الحالة' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Location', ar: 'الموقع' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Projects', ar: 'المشاريع' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Utilization', ar: 'الاستخدام' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLabs.map((lab) => (
                    <tr key={lab.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = createPageUrl(`LivingLabDetail?id=${lab.id}`)}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {lab.image_url && (
                            <img src={lab.image_url} alt={lab.name_en} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium">{lab.name_en}</p>
                            <p className="text-xs text-slate-500">{lab.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={typeColors[lab.lab_type]}>{lab.lab_type?.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[lab.status]}>{lab.status}</Badge>
                      </td>
                      <td className="p-4 text-sm">{lab.city_id?.substring(0, 20)}</td>
                      <td className="p-4 text-sm">{lab.current_projects || 0} / {lab.capacity || 0}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={lab.utilization_rate || 0} className="h-2 w-20" />
                          <span className="text-xs text-slate-500">{lab.utilization_rate || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {filteredLabs.length === 0 && (
        <div className="text-center py-12">
          <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            {t({ en: 'No living labs found', ar: 'لم يتم العثور على مختبرات' })}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(LivingLabsPage, { requiredPermissions: [] });