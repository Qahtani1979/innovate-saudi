import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/components/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useStrategyTemplates } from '@/hooks/strategy/useStrategyTemplates';
import { STRATEGY_TEMPLATE_TYPES, TEMPLATE_CATEGORIES, getTemplateTypeInfo } from '@/constants/strategyTemplateTypes';
import TemplatePreviewDialog from '../templates/TemplatePreviewDialog';
import TemplateRatingDialog from '../templates/TemplateRatingDialog';
import TemplateCoverageAnalysis from '../templates/TemplateCoverageAnalysis';
import {
  FileText, Plus, Search, Star, Copy, Eye, Trash2, Save,
  Loader2, Lightbulb, Building2, Leaf, Globe, Zap, Users, Share2, Lock, Tag, X, BarChart3
} from 'lucide-react';

const StrategyTemplateLibrary = ({ onApplyTemplate, currentPlan }) => {
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    templates,
    myTemplates,
    featuredTemplates,
    isLoading,
    createTemplate,
    deleteTemplate,
    togglePublic,
    isCreating,
    isDeleting,
    rateTemplate,
    cloneTemplate,
    refetchTemplates
  } = useStrategyTemplates();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState('coverage');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [applyingTemplateId, setApplyingTemplateId] = useState(null);
  const [cloningTemplateId, setCloningTemplateId] = useState(null);

  const [newTemplate, setNewTemplate] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    template_type: 'innovation',
    is_public: false,
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Combine all templates for browsing
  const allTemplates = [...templates, ...featuredTemplates.filter(f => !templates.find(t => t.id === f.id))];

  // Extract all unique tags from templates
  const allTags = useMemo(() => {
    const tags = new Set();
    allTemplates.forEach(t => {
      t.template_tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allTemplates]);

  // Filter templates by search, type, category, and tags
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(template => {
      const matchesSearch = !searchQuery || 
        template.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.name_ar?.includes(searchQuery) ||
        template.description_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.template_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || template.template_type === selectedType;
      const matchesCategory = selectedCategory === 'all' || template.template_category === selectedCategory;
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => template.template_tags?.includes(tag));
      return matchesSearch && matchesType && matchesCategory && matchesTags;
    });
  }, [allTemplates, searchQuery, selectedType, selectedCategory, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleApplyTemplate = async (template) => {
    setApplyingTemplateId(template.id);
    try {
      // Navigate to wizard with template parameter
      navigate(`/strategic-plan-builder?template=${template.id}`);
      
      toast({
        title: t({ en: 'Template Applied', ar: 'تم تطبيق القالب' }),
        description: t({ 
          en: `Starting new plan from "${template.name_en}"`, 
          ar: `بدء خطة جديدة من "${template.name_ar}"` 
        })
      });
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setApplyingTemplateId(null);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name_en) {
      toast({
        title: t({ en: 'Name Required', ar: 'الاسم مطلوب' }),
        description: t({ en: 'Please enter a template name', ar: 'الرجاء إدخال اسم القالب' }),
        variant: 'destructive'
      });
      return;
    }

    if (!currentPlan) {
      toast({
        title: t({ en: 'No Active Plan', ar: 'لا توجد خطة نشطة' }),
        description: t({ en: 'Please select an active plan to create a template from', ar: 'الرجاء تحديد خطة نشطة لإنشاء قالب منها' }),
        variant: 'destructive'
      });
      return;
    }

    try {
      await createTemplate({
        planData: currentPlan,
        templateMeta: newTemplate
      });
      
      setNewTemplate({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        template_type: 'innovation',
        is_public: false,
        tags: []
      });
      setActiveTab('my-templates');
    } catch (error) {
      toast({
        title: t({ en: 'Error', ar: 'خطأ' }),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm(t({ en: 'Delete this template?', ar: 'حذف هذا القالب؟' }))) return;
    await deleteTemplate(templateId);
  };

  const handleTogglePublic = async (template) => {
    await togglePublic({ id: template.id, isPublic: !template.is_public });
  };

  const handleCloneTemplate = async (template) => {
    setCloningTemplateId(template.id);
    try {
      const cloned = await cloneTemplate(template.id);
      if (cloned) {
        setActiveTab('my-templates');
      }
    } catch (error) {
      // Error handled in hook
    } finally {
      setCloningTemplateId(null);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newTemplate.tags.includes(tagInput.trim())) {
      setNewTemplate(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const getTypeInfo = (typeId) => getTemplateTypeInfo(typeId);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950 dark:to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <FileText className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {t({ en: 'Strategy Template Library', ar: 'مكتبة قوالب الاستراتيجية' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Browse, create, and apply strategy templates', ar: 'تصفح وإنشاء وتطبيق قوالب الاستراتيجية' })}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-background">
              {allTemplates.length + myTemplates.length} {t({ en: 'templates', ar: 'قوالب' })}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="coverage" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            <span>{t({ en: 'Coverage Analysis', ar: 'تحليل التغطية' })}</span>
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Search className="h-4 w-4" />
            <span>{t({ en: 'Browse Templates', ar: 'تصفح القوالب' })}</span>
          </TabsTrigger>
          <TabsTrigger value="my-templates" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Star className="h-4 w-4" />
            <span>{t({ en: 'My Templates', ar: 'قوالبي' })}</span>
            {myTemplates.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">{myTemplates.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Plus className="h-4 w-4" />
            <span>{t({ en: 'Create Template', ar: 'إنشاء قالب' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coverage" className="mt-4">
          <TemplateCoverageAnalysis templates={allTemplates} onRefresh={refetchTemplates} />
        </TabsContent>

        {/* Browse Tab */}
        <TabsContent value="browse" className="mt-4 space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t({ en: 'Search templates...', ar: 'البحث في القوالب...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder={t({ en: 'Type', ar: 'النوع' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Types', ar: 'جميع الأنواع' })}</SelectItem>
                {STRATEGY_TEMPLATE_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {language === 'ar' ? type.name_ar : type.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder={t({ en: 'Category', ar: 'الفئة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Categories', ar: 'جميع الفئات' })}</SelectItem>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {language === 'ar' ? cat.name_ar : cat.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                {t({ en: 'Filter by tags:', ar: 'تصفية حسب العلامات:' })}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 15).map(tag => (
                  <Badge 
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
                {selectedTags.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])}>
                    {t({ en: 'Clear', ar: 'مسح' })}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Template Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => {
                const typeInfo = getTypeInfo(template.template_type);
                const TypeIcon = typeInfo?.icon || FileText;
                const isApplying = applyingTemplateId === template.id;

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
                            {template.template_rating && (
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm">{template.template_rating}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {language === 'ar' ? template.description_ar : template.description_en}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {template.objectives?.length || 0} {t({ en: 'objectives', ar: 'أهداف' })}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.kpis?.length || 0} {t({ en: 'KPIs', ar: 'مؤشرات' })}
                            </Badge>
                            {template.usage_count > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {template.usage_count} {t({ en: 'uses', ar: 'استخدامات' })}
                              </Badge>
                            )}
                            {template.is_featured && (
                              <Badge className="bg-amber-100 text-amber-700 text-xs">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                {t({ en: 'Featured', ar: 'مميز' })}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {t({ en: 'By', ar: 'بواسطة' })} {template.owner_email?.split('@')[0] || 'System'}
                              </span>
                              {template.template_category === 'system' && (
                                <Badge variant="secondary" className="text-xs">
                                  {t({ en: 'Official', ar: 'رسمي' })}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <TemplateRatingDialog
                                template={template}
                                trigger={
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Star className="h-4 w-4" />
                                  </Button>
                                }
                              />
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
                                onClick={() => handleApplyTemplate(template)}
                                disabled={isApplying}
                              >
                                {isApplying ? (
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

              {filteredTemplates.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">
                    {t({ en: 'No Templates Found', ar: 'لم يتم العثور على قوالب' })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t({ en: 'Try adjusting your search or filters', ar: 'حاول تعديل البحث أو الفلاتر' })}
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* My Templates Tab */}
        <TabsContent value="my-templates" className="mt-4">
          {myTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">
                  {t({ en: 'No Custom Templates', ar: 'لا توجد قوالب مخصصة' })}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t({ en: 'Create templates from your strategic plans', ar: 'أنشئ قوالب من خططك الاستراتيجية' })}
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
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {language === 'ar' ? template.description_ar : template.description_en}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant={template.is_public ? 'default' : 'secondary'}>
                              {template.is_public ? (
                                <><Share2 className="h-3 w-3 mr-1" /> {t({ en: 'Public', ar: 'عام' })}</>
                              ) : (
                                <><Lock className="h-3 w-3 mr-1" /> {t({ en: 'Private', ar: 'خاص' })}</>
                              )}
                            </Badge>
                            {template.usage_count > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {template.usage_count} {t({ en: 'uses', ar: 'استخدامات' })}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePublic(template)}
                            >
                              {template.is_public ? (
                                <><Lock className="h-4 w-4 mr-1" />{t({ en: 'Make Private', ar: 'جعله خاصاً' })}</>
                              ) : (
                                <><Share2 className="h-4 w-4 mr-1" />{t({ en: 'Make Public', ar: 'جعله عاماً' })}</>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        {/* Create Tab */}
        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Create New Template', ar: 'إنشاء قالب جديد' })}</CardTitle>
              <CardDescription>
                {currentPlan 
                  ? t({ en: 'Create a reusable template from your current plan', ar: 'إنشاء قالب قابل لإعادة الاستخدام من خطتك الحالية' })
                  : t({ en: 'Select an active plan first to create a template', ar: 'حدد خطة نشطة أولاً لإنشاء قالب' })
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Template Name (English)', ar: 'اسم القالب (الإنجليزية)' })} *</Label>
                  <Input
                    value={newTemplate.name_en}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name_en: e.target.value }))}
                    placeholder={t({ en: 'Enter template name...', ar: 'أدخل اسم القالب...' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Template Name (Arabic)', ar: 'اسم القالب (العربية)' })}</Label>
                  <Input
                    value={newTemplate.name_ar}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name_ar: e.target.value }))}
                    placeholder={t({ en: 'Enter Arabic name...', ar: 'أدخل الاسم بالعربية...' })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Template Type', ar: 'نوع القالب' })} *</Label>
                <Select 
                  value={newTemplate.template_type} 
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, template_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STRATEGY_TEMPLATE_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {language === 'ar' ? type.name_ar : type.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
                <Textarea
                  value={newTemplate.description_en}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description_en: e.target.value }))}
                  placeholder={t({ en: 'Describe what this template is best used for...', ar: 'صف الاستخدام الأفضل لهذا القالب...' })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Tags', ar: 'العلامات' })}</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder={t({ en: 'Add tag...', ar: 'إضافة علامة...' })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                {newTemplate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTemplate.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button 
                          onClick={() => setNewTemplate(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label className="text-base">{t({ en: 'Make Public', ar: 'جعله عاماً' })}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t({ en: 'Allow others to discover and use this template', ar: 'السماح للآخرين باكتشاف واستخدام هذا القالب' })}
                  </p>
                </div>
                <Switch
                  checked={newTemplate.is_public}
                  onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, is_public: checked }))}
                />
              </div>

              <Button 
                onClick={handleCreateTemplate} 
                disabled={!newTemplate.name_en || !currentPlan || isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />{t({ en: 'Create Template', ar: 'إنشاء القالب' })}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        template={selectedTemplate}
        open={showPreview}
        onOpenChange={setShowPreview}
        onApply={() => {
          setShowPreview(false);
          if (selectedTemplate) handleApplyTemplate(selectedTemplate);
        }}
        isApplying={applyingTemplateId === selectedTemplate?.id}
      />
    </div>
  );
};

export default StrategyTemplateLibrary;
