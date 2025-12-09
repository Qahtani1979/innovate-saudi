import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Tags, Plus, Edit2, Trash2, Save, X, Sparkles, Loader2, ChevronRight, ChevronDown, BarChart3, TreePine, AlertTriangle, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import TaxonomyVisualization from '../components/taxonomy/TaxonomyVisualization';
import ServiceManager from '../components/taxonomy/ServiceManager';
import TaxonomyGapDetector from '../components/taxonomy/TaxonomyGapDetector';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function TaxonomyBuilder() {
  const { language, isRTL, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('manage');
  const [expandedSector, setExpandedSector] = useState(null);
  const [expandedSubsector, setExpandedSubsector] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newSector, setNewSector] = useState(null);
  const [newSubsector, setNewSubsector] = useState(null);
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [showWizard, setShowWizard] = useState(false);
  const queryClient = useQueryClient();

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => base44.entities.Sector.list()
  });

  const { data: subsectors = [] } = useQuery({
    queryKey: ['subsectors'],
    queryFn: () => base44.entities.Subsector.list()
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list()
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => base44.entities.Tag.list()
  });

  const createSectorMutation = useMutation({
    mutationFn: (data) => base44.entities.Sector.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sectors']);
      setNewSector(null);
      toast.success(t({ en: 'Sector created', ar: 'تم إنشاء القطاع' }));
    }
  });

  const updateSectorMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Sector.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sectors']);
      setEditingItem(null);
      toast.success(t({ en: 'Updated', ar: 'تم التحديث' }));
    }
  });

  const deleteSectorMutation = useMutation({
    mutationFn: (id) => base44.entities.Sector.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sectors']);
      toast.success(t({ en: 'Deleted', ar: 'تم الحذف' }));
    }
  });

  const createSubsectorMutation = useMutation({
    mutationFn: (data) => base44.entities.Subsector.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subsectors']);
      setNewSubsector(null);
      toast.success(t({ en: 'Subsector created', ar: 'تم إنشاء القطاع الفرعي' }));
    }
  });

  const updateSubsectorMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subsector.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subsectors']);
      setEditingItem(null);
      toast.success(t({ en: 'Updated', ar: 'تم التحديث' }));
    }
  });

  const deleteSubsectorMutation = useMutation({
    mutationFn: (id) => base44.entities.Subsector.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['subsectors']);
      toast.success(t({ en: 'Deleted', ar: 'تم الحذف' }));
    }
  });

  const generateAISuggestions = async () => {
    const result = await invokeAI({
      prompt: `Analyze current taxonomy and suggest improvements for Saudi municipal innovation:

Current Sectors: ${sectors.map(s => s.name_en).join(', ')}
Total Subsectors: ${subsectors.length}
Total Services: ${services.length}

Provide bilingual suggestions for:
1. Missing critical sectors
2. Subsectors that should be added to existing sectors
3. Service gaps and missing service types

Focus on Vision 2030, smart cities, and municipal service excellence.`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggested_sectors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                code: { type: 'string' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' },
                rationale_en: { type: 'string' },
                rationale_ar: { type: 'string' }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      toast.success(t({ en: 'AI suggestions generated', ar: 'تم إنشاء اقتراحات ذكية' }));
    }
  };

  const getSectorSubsectors = (sectorId) => {
    return subsectors.filter(ss => ss.sector_id === sectorId);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-600 via-blue-600 to-purple-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🏷️ Domain Taxonomy Builder', ar: '🏷️ بناء تصنيف المجالات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Manage sectors, subsectors, services with AI-powered insights', ar: 'إدارة القطاعات والخدمات مع رؤى ذكية' })}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Badge variant="outline" className="bg-white/20 text-white border-white/40">
            {sectors.length} {t({ en: 'sectors', ar: 'قطاعات' })}
          </Badge>
          <Badge variant="outline" className="bg-white/20 text-white border-white/40">
            {subsectors.length} {t({ en: 'subsectors', ar: 'قطاعات فرعية' })}
          </Badge>
          <Badge variant="outline" className="bg-white/20 text-white border-white/40">
            {services.length} {t({ en: 'services', ar: 'خدمات' })}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={generateAISuggestions} disabled={aiLoading} variant="outline">
          {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'AI Suggestions', ar: 'اقتراحات ذكية' })}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manage">
            <Layers className="h-4 w-4 mr-2" />
            {t({ en: 'Manage', ar: 'إدارة' })}
          </TabsTrigger>
          <TabsTrigger value="visualize">
            <TreePine className="h-4 w-4 mr-2" />
            {t({ en: 'Visualize', ar: 'تصور' })}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t({ en: 'Analytics', ar: 'تحليلات' })}
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t({ en: 'Gaps', ar: 'فجوات' })}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Manage */}
        <TabsContent value="manage">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6 text-center">
                <Tags className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-600">{sectors.length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Sectors', ar: 'قطاعات' })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6 text-center">
                <Tags className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-purple-600">{subsectors.length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Subsectors', ar: 'قطاعات فرعية' })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-6 text-center">
                <Layers className="h-10 w-10 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-600">{services.length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Services', ar: 'خدمات' })}</p>
              </CardContent>
            </Card>
          </div>

          {/* New Sector Form */}
          {newSector && (
            <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
              <CardHeader>
                <CardTitle className="text-lg">{t({ en: 'New Sector', ar: 'قطاع جديد' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    value={newSector.name_en}
                    onChange={(e) => setNewSector({ ...newSector, name_en: e.target.value })}
                    placeholder="Sector name (English)"
                  />
                  <Input
                    value={newSector.name_ar}
                    onChange={(e) => setNewSector({ ...newSector, name_ar: e.target.value })}
                    placeholder="اسم القطاع (عربي)"
                    dir="rtl"
                  />
                  <Input
                    value={newSector.code}
                    onChange={(e) => setNewSector({ ...newSector, code: e.target.value })}
                    placeholder="Code (e.g., ENV)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Textarea
                    value={newSector.description_en}
                    onChange={(e) => setNewSector({ ...newSector, description_en: e.target.value })}
                    placeholder="Description (English)"
                    rows={2}
                  />
                  <Textarea
                    value={newSector.description_ar}
                    onChange={(e) => setNewSector({ ...newSector, description_ar: e.target.value })}
                    placeholder="الوصف (عربي)"
                    rows={2}
                    dir="rtl"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => createSectorMutation.mutate(newSector)} disabled={!newSector.name_en || !newSector.code}>
                    <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Create', ar: 'إنشاء' })}
                  </Button>
                  <Button variant="outline" onClick={() => setNewSector(null)}>
                    <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Cancel', ar: 'إلغاء' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sectors & Subsectors & Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t({ en: 'Taxonomy Hierarchy', ar: 'التسلسل الهرمي للتصنيف' })}</CardTitle>
                <Button onClick={() => setNewSector({ name_en: '', name_ar: '', code: '', description_en: '', description_ar: '' })}>
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Add Sector', ar: 'إضافة قطاع' })}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sectors.map(sector => {
                  const sectorSubsectors = getSectorSubsectors(sector.id);
                  const isExpanded = expandedSector === sector.id;

                  return (
                    <div key={sector.id} className="border-2 rounded-lg">
                      <div className="p-4 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedSector(isExpanded ? null : sector.id)}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                          <Badge className="bg-blue-600">{sector.code}</Badge>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              {language === 'ar' ? sector.name_ar : sector.name_en}
                            </p>
                            {sector.description_en && (
                              <p className="text-xs text-slate-600 mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                {language === 'ar' ? sector.description_ar : sector.description_en}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">{sectorSubsectors.length} subsectors</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setNewSubsector({ sector_id: sector.id, name_en: '', name_ar: '', code: '' })}>
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingItem({ type: 'sector', data: sector })}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteSectorMutation.mutate(sector.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-2 border-t bg-white">
                          {newSubsector?.sector_id === sector.id && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3 mb-3">
                              <div className="grid grid-cols-3 gap-3">
                                <Input
                                  value={newSubsector.name_en}
                                  onChange={(e) => setNewSubsector({ ...newSubsector, name_en: e.target.value })}
                                  placeholder="Subsector (English)"
                                />
                                <Input
                                  value={newSubsector.name_ar}
                                  onChange={(e) => setNewSubsector({ ...newSubsector, name_ar: e.target.value })}
                                  placeholder="قطاع فرعي (عربي)"
                                  dir="rtl"
                                />
                                <Input
                                  value={newSubsector.code}
                                  onChange={(e) => setNewSubsector({ ...newSubsector, code: e.target.value })}
                                  placeholder="Code"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => createSubsectorMutation.mutate(newSubsector)} disabled={!newSubsector.name_en}>
                                  <Save className="h-3 w-3 mr-1" />
                                  {t({ en: 'Create', ar: 'إنشاء' })}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setNewSubsector(null)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {sectorSubsectors.map(subsector => {
                            const subsectorServices = services.filter(s => s.subsector_id === subsector.id);
                            const isSubExpanded = expandedSubsector === subsector.id;

                            return (
                              <div key={subsector.id} className="border rounded-lg bg-purple-50/30">
                                <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                                  <div className="flex items-center gap-3 flex-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setExpandedSubsector(isSubExpanded ? null : subsector.id)}
                                    >
                                      {isSubExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                    </Button>
                                    <Badge variant="outline" className="font-mono text-xs">{subsector.code}</Badge>
                                    <span className="text-sm font-medium text-slate-900">
                                      {language === 'ar' ? subsector.name_ar : subsector.name_en}
                                    </span>
                                    <Badge className="bg-green-100 text-green-700 text-xs">{subsectorServices.length} services</Badge>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingItem({ type: 'subsector', data: subsector })}>
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteSubsectorMutation.mutate(subsector.id)}>
                                      <Trash2 className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </div>
                                </div>

                                {isSubExpanded && (
                                  <div className="border-t p-3">
                                    <ServiceManager subsector={subsector} services={services} onClose={() => setExpandedSubsector(null)} />
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {sectorSubsectors.length === 0 && !newSubsector && (
                            <p className="text-sm text-slate-500 text-center py-4">
                              {t({ en: 'No subsectors yet', ar: 'لا توجد قطاعات فرعية بعد' })}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Visualization */}
        <TabsContent value="visualize">
          <TaxonomyVisualization sectors={sectors} subsectors={subsectors} services={services} />
        </TabsContent>

        {/* Tab 3: Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{sectors.length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Total Sectors', ar: 'إجمالي القطاعات' })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-purple-600">{subsectors.length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Total Subsectors', ar: 'إجمالي القطاعات الفرعية' })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{services.length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Total Services', ar: 'إجمالي الخدمات' })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-teal-600">{services.filter(s => s.is_digital).length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Digital Services', ar: 'خدمات رقمية' })}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t({ en: 'Coverage by Sector', ar: 'التغطية حسب القطاع' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectors.map(sector => {
                  const sectorSubsectors = subsectors.filter(ss => ss.sector_id === sector.id);
                  const sectorServices = sectorSubsectors.reduce((sum, ss) => 
                    sum + services.filter(srv => srv.subsector_id === ss.id).length, 0);
                  
                  return (
                    <div key={sector.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">
                          {language === 'ar' ? sector.name_ar : sector.name_en}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{sectorSubsectors.length} subsectors</Badge>
                          <Badge className="bg-green-600">{sectorServices} services</Badge>
                        </div>
                      </div>
                      {sectorServices === 0 && (
                        <p className="text-xs text-red-600">
                          ⚠️ {t({ en: 'No services mapped', ar: 'لا توجد خدمات مربوطة' })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Gaps */}
        <TabsContent value="gaps">
          <TaxonomyGapDetector sectors={sectors} subsectors={subsectors} services={services} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(TaxonomyBuilder, { requireAdmin: true });