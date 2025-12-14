import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useStrategyTemplates } from '@/hooks/strategy';
import {
  FileText,
  Plus,
  Search,
  Star,
  Copy,
  Eye,
  Trash2,
  Save,
  Download,
  Upload,
  Loader2,
  Lightbulb,
  Building2,
  Leaf,
  Globe,
  Zap,
  Users,
  CheckCircle2
} from 'lucide-react';

const TEMPLATE_TYPES = [
  { id: 'innovation', name_en: 'Innovation Strategy', name_ar: 'استراتيجية الابتكار', icon: Lightbulb, color: 'bg-amber-500' },
  { id: 'digital_transformation', name_en: 'Digital Transformation', name_ar: 'التحول الرقمي', icon: Zap, color: 'bg-blue-500' },
  { id: 'sustainability', name_en: 'Sustainability', name_ar: 'الاستدامة', icon: Leaf, color: 'bg-green-500' },
  { id: 'sector_specific', name_en: 'Sector Specific', name_ar: 'خاص بالقطاع', icon: Building2, color: 'bg-purple-500' },
  { id: 'municipality', name_en: 'Municipality Scale', name_ar: 'نطاق البلدية', icon: Globe, color: 'bg-cyan-500' }
];

const SAMPLE_TEMPLATES = [
  {
    id: 't1',
    name_en: 'Digital Government Transformation',
    name_ar: 'التحول الرقمي الحكومي',
    description_en: 'Comprehensive template for government digital transformation initiatives',
    description_ar: 'قالب شامل لمبادرات التحول الرقمي الحكومي',
    template_type: 'digital_transformation',
    is_public: true,
    usage_count: 45,
    rating: 4.8,
    objectives_count: 5,
    kpis_count: 12,
    created_by: 'Innovation Department'
  },
  {
    id: 't2',
    name_en: 'Municipal Innovation Framework',
    name_ar: 'إطار الابتكار البلدي',
    description_en: 'Standard innovation strategy template for municipalities',
    description_ar: 'قالب استراتيجية الابتكار القياسي للبلديات',
    template_type: 'innovation',
    is_public: true,
    usage_count: 32,
    rating: 4.6,
    objectives_count: 4,
    kpis_count: 8,
    created_by: 'Strategy Team'
  },
  {
    id: 't3',
    name_en: 'Smart City Sustainability Plan',
    name_ar: 'خطة استدامة المدينة الذكية',
    description_en: 'Template for sustainable smart city development strategies',
    description_ar: 'قالب لاستراتيجيات تطوير المدن الذكية المستدامة',
    template_type: 'sustainability',
    is_public: true,
    usage_count: 28,
    rating: 4.5,
    objectives_count: 6,
    kpis_count: 15,
    created_by: 'Environment Division'
  },
  {
    id: 't4',
    name_en: 'Transportation Sector Strategy',
    name_ar: 'استراتيجية قطاع النقل',
    description_en: 'Specialized template for transportation innovation',
    description_ar: 'قالب متخصص لابتكار النقل',
    template_type: 'sector_specific',
    is_public: true,
    usage_count: 18,
    rating: 4.3,
    objectives_count: 4,
    kpis_count: 10,
    created_by: 'Transport Authority'
  }
];

const StrategyTemplateLibrary = ({ onApplyTemplate, currentPlan }) => {
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const strategicPlanId = currentPlan?.id;
  
  const {
    templates: dbTemplates,
    myTemplates: dbMyTemplates,
    isLoading,
    saveTemplate,
    deleteTemplate
  } = useStrategyTemplates(strategicPlanId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [templates, setTemplates] = useState(SAMPLE_TEMPLATES);
  const [myTemplates, setMyTemplates] = useState([]);
  
  useEffect(() => {
    if (dbTemplates && dbTemplates.length > 0) {
      setTemplates(dbTemplates);
    }
    if (dbMyTemplates && dbMyTemplates.length > 0) {
      setMyTemplates(dbMyTemplates);
    }
  }, [dbTemplates, dbMyTemplates]);

  const [newTemplate, setNewTemplate] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    template_type: 'innovation',
    is_public: false
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.name_ar.includes(searchQuery) ||
      template.description_en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.template_type === selectedType;
    return matchesSearch && matchesType;
  });

  const [applyingTemplate, setApplyingTemplate] = useState(false);
  
  const applyTemplate = async (template) => {
    setApplyingTemplate(true);
    try {
      // Update usage count in local state
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, usage_count: t.usage_count + 1 } : t
      ));

      if (onApplyTemplate) {
        onApplyTemplate(template);
      }

      toast({
        title: t({ en: 'Template Applied', ar: 'تم تطبيق القالب' }),
        description: t({ 
          en: `"${template.name_en}" has been applied to your strategy`, 
          ar: `تم تطبيق "${template.name_ar}" على استراتيجيتك` 
        })
      });
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setApplyingTemplate(false);
    }
  };

  const createTemplateFromCurrent = async () => {
    if (!newTemplate.name_en) {
      toast({
        title: t({ en: 'Name Required', ar: 'الاسم مطلوب' }),
        description: t({ en: 'Please enter a template name', ar: 'الرجاء إدخال اسم القالب' }),
        variant: 'destructive'
      });
      return;
    }

    try {
      const template = {
        id: `t-${Date.now()}`,
        ...newTemplate,
        usage_count: 0,
        rating: 0,
        objectives_count: currentPlan?.objectives?.length || 3,
        kpis_count: 6,
        created_by: 'You'
      };

      const savedTemplate = await saveTemplate(template);
      if (savedTemplate) {
        setMyTemplates(prev => [...prev, savedTemplate]);
      }
      
      setNewTemplate({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        template_type: 'innovation',
        is_public: false
      });
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getTypeInfo = (typeId) => TEMPLATE_TYPES.find(t => t.id === typeId);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <FileText className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-cyan-900">
                  {t({ en: 'Strategy Template Library', ar: 'مكتبة قوالب الاستراتيجية' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Browse, create, and apply strategy templates', ar: 'تصفح وإنشاء وتطبيق قوالب الاستراتيجية' })}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-white">
              {templates.length + myTemplates.length} {t({ en: 'templates', ar: 'قوالب' })}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t({ en: 'Browse Templates', ar: 'تصفح القوالب' })}
          </TabsTrigger>
          <TabsTrigger value="my-templates" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {t({ en: 'My Templates', ar: 'قوالبي' })}
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t({ en: 'Create Template', ar: 'إنشاء قالب' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4 space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t({ en: 'Search templates...', ar: 'البحث في القوالب...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t({ en: 'Filter by type', ar: 'تصفية حسب النوع' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Types', ar: 'جميع الأنواع' })}</SelectItem>
                {TEMPLATE_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {language === 'ar' ? type.name_ar : type.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(template => {
              const typeInfo = getTypeInfo(template.template_type);
              const TypeIcon = typeInfo?.icon || FileText;

              return (
                <Card key={template.id} className="hover:shadow-md transition-all">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${typeInfo?.color || 'bg-slate-500'}`}>
                        <TypeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">
                            {language === 'ar' ? template.name_ar : template.name_en}
                          </h3>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm">{template.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                          {language === 'ar' ? template.description_ar : template.description_en}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {template.objectives_count} {t({ en: 'objectives', ar: 'أهداف' })}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.kpis_count} {t({ en: 'KPIs', ar: 'مؤشرات' })}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {template.usage_count} {t({ en: 'uses', ar: 'استخدامات' })}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            {t({ en: 'By', ar: 'بواسطة' })} {template.created_by}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelectedTemplate(template); setShowPreview(true); }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t({ en: 'Preview', ar: 'معاينة' })}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => applyTemplate(template)}
                              disabled={applyingTemplate}
                            >
                              {applyingTemplate ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Copy className="h-4 w-4 mr-1" />
                              )}
                              {t({ en: 'Apply', ar: 'تطبيق' })}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="font-medium text-slate-700 mb-2">
                  {t({ en: 'No Templates Found', ar: 'لم يتم العثور على قوالب' })}
                </h3>
                <p className="text-sm text-slate-500">
                  {t({ en: 'Try adjusting your search or filters', ar: 'حاول تعديل البحث أو الفلاتر' })}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-templates" className="mt-4">
          {myTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <Star className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="font-medium text-slate-700 mb-2">
                  {t({ en: 'No Custom Templates', ar: 'لا توجد قوالب مخصصة' })}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {t({ en: 'Create templates from your existing strategies', ar: 'أنشئ قوالب من استراتيجياتك الحالية' })}
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Create Template', ar: 'إنشاء قالب' })}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTemplates.map(template => {
                const typeInfo = getTypeInfo(template.template_type);
                const TypeIcon = typeInfo?.icon || FileText;

                return (
                  <Card key={template.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${typeInfo?.color || 'bg-slate-500'}`}>
                          <TypeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">
                            {language === 'ar' ? template.name_ar : template.name_en}
                          </h3>
                          <p className="text-sm text-slate-500 mb-3">
                            {language === 'ar' ? template.description_ar : template.description_en}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant={template.is_public ? 'default' : 'secondary'}>
                              {template.is_public ? t({ en: 'Public', ar: 'عام' }) : t({ en: 'Private', ar: 'خاص' })}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t({ en: 'Create New Template', ar: 'إنشاء قالب جديد' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Save your current strategy as a reusable template', ar: 'احفظ استراتيجيتك الحالية كقالب قابل لإعادة الاستخدام' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Template Name (English)', ar: 'اسم القالب (إنجليزي)' })} *</Label>
                  <Input
                    value={newTemplate.name_en}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder={t({ en: 'Enter template name', ar: 'أدخل اسم القالب' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Template Name (Arabic)', ar: 'اسم القالب (عربي)' })}</Label>
                  <Input
                    value={newTemplate.name_ar}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder={t({ en: 'Enter Arabic name', ar: 'أدخل الاسم بالعربية' })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                  <Textarea
                    value={newTemplate.description_en}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description_en: e.target.value }))}
                    placeholder={t({ en: 'Describe this template...', ar: 'صف هذا القالب...' })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                  <Textarea
                    value={newTemplate.description_ar}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description_ar: e.target.value }))}
                    placeholder={t({ en: 'Enter Arabic description', ar: 'أدخل الوصف بالعربية' })}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Template Type', ar: 'نوع القالب' })}</Label>
                  <Select
                    value={newTemplate.template_type}
                    onValueChange={(val) => setNewTemplate(prev => ({ ...prev, template_type: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {language === 'ar' ? type.name_ar : type.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Visibility', ar: 'الرؤية' })}</Label>
                  <Select
                    value={newTemplate.is_public ? 'public' : 'private'}
                    onValueChange={(val) => setNewTemplate(prev => ({ ...prev, is_public: val === 'public' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">{t({ en: 'Private (only you)', ar: 'خاص (أنت فقط)' })}</SelectItem>
                      <SelectItem value="public">{t({ en: 'Public (share with others)', ar: 'عام (مشاركة مع الآخرين)' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={createTemplateFromCurrent} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {t({ en: 'Create Template', ar: 'إنشاء القالب' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate && (language === 'ar' ? selectedTemplate.name_ar : selectedTemplate.name_en)}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate && (language === 'ar' ? selectedTemplate.description_ar : selectedTemplate.description_en)}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-800">{selectedTemplate.objectives_count}</p>
                      <p className="text-sm text-slate-500">{t({ en: 'Objectives', ar: 'أهداف' })}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-800">{selectedTemplate.kpis_count}</p>
                      <p className="text-sm text-slate-500">{t({ en: 'KPIs', ar: 'مؤشرات' })}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  {t({ en: 'Close', ar: 'إغلاق' })}
                </Button>
                <Button onClick={() => { applyTemplate(selectedTemplate); setShowPreview(false); }}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t({ en: 'Apply Template', ar: 'تطبيق القالب' })}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrategyTemplateLibrary;
