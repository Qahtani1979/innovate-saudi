import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Plus, Edit, Trash2, Video, Headphones, Image as ImageIcon, Eye, Star, Bookmark, Play, TrendingUp, Sparkles, Grid, List, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import PolicyLibraryWidget from '../components/knowledge/PolicyLibraryWidget';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';
import { useKnowledgeWithVisibility } from '@/hooks/useKnowledgeWithVisibility';
import { useCaseStudiesWithVisibility } from '@/hooks/useCaseStudiesWithVisibility';
import { usePermissions } from '@/components/permissions/usePermissions';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function KnowledgePage() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const { invokeAI, status, isLoading: aiLoading, rateLimitInfo, isAvailable } = useAIWithFallback();
  const queryClient = useQueryClient();

  // Use visibility-aware hooks
  const { data: knowledgeDocs = [] } = useKnowledgeWithVisibility();
  const { data: caseStudies = [] } = useCaseStudiesWithVisibility();

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('knowledge_documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-with-visibility'] });
      toast.success(t({ en: 'Document deleted', ar: 'تم حذف المستند' }));
    }
  });

  const deleteCaseMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('case_studies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-studies-with-visibility'] });
      toast.success(t({ en: 'Case study deleted', ar: 'تم حذف دراسة الحالة' }));
    }
  });

  const knowledgeItems = [
    ...knowledgeDocs.map(doc => ({
      type: doc.doc_type,
      title: { en: doc.title_en, ar: doc.title_ar || doc.title_en },
      description: { en: doc.description_en || '', ar: doc.description_ar || doc.description_en || '' },
      category: doc.doc_type === 'toolkit' ? 'Guide' : doc.doc_type === 'guideline' ? 'Template' : 'Research',
      url: doc.file_url,
      id: doc.id,
      contentType: doc.content_type || 'document',
      thumbnail: doc.thumbnail_url,
      duration: doc.duration,
      views: doc.view_count || Math.floor(Math.random() * 500),
      rating: doc.rating || (Math.random() * 2 + 3).toFixed(1),
      created_date: doc.created_date,
      tags: doc.tags || [],
      featured: doc.is_featured
    })),
    ...caseStudies.map(cs => ({
      type: 'case_study',
      title: { en: cs.title_en, ar: cs.title_ar || cs.title_en },
      description: { en: cs.description_en || cs.impact_statement, ar: cs.description_ar || cs.impact_statement },
      category: 'Case Study',
      id: cs.id,
      contentType: 'document',
      thumbnail: cs.image_url,
      views: cs.view_count || Math.floor(Math.random() * 300),
      rating: (Math.random() * 2 + 3).toFixed(1),
      created_date: cs.created_date,
      tags: cs.tags || [],
      featured: cs.is_featured
    }))
  ];

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.ar.includes(searchTerm);
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesContentType = contentTypeFilter === 'all' || item.contentType === contentTypeFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'featured' && item.featured) ||
      (activeTab === 'trending' && item.views > 200) ||
      (activeTab === 'recent' && new Date(item.created_date) > new Date(Date.now() - 30*24*60*60*1000));
    return matchesSearch && matchesType && matchesCategory && matchesContentType && matchesTab;
  });

  const featuredItems = knowledgeItems.filter(item => item.featured).slice(0, 3);
  const trendingItems = knowledgeItems.sort((a, b) => b.views - a.views).slice(0, 5);

  const categoryColors = {
    'Guide': 'bg-blue-100 text-blue-700',
    'Case Study': 'bg-green-100 text-green-700',
    'Template': 'bg-purple-100 text-purple-700',
    'Research': 'bg-amber-100 text-amber-700'
  };

  const contentTypeIcons = {
    document: FileText,
    video: Video,
    audio: Headphones,
    infographic: ImageIcon,
    interactive: Sparkles
  };

  const getContentTypeIcon = (type) => {
    const Icon = contentTypeIcons[type] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    const contentSummary = {
      total: knowledgeItems.length,
      by_type: {
        documents: knowledgeDocs.length,
        case_studies: caseStudies.length
      },
      by_content_type: {
        video: knowledgeItems.filter(i => i.contentType === 'video').length,
        audio: knowledgeItems.filter(i => i.contentType === 'audio').length,
        document: knowledgeItems.filter(i => i.contentType === 'document').length
      },
      trending: trendingItems.slice(0, 5).map(i => i.title.en)
    };

    const result = await invokeAI({
      prompt: `Analyze this knowledge base for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Knowledge Resources: ${JSON.stringify(contentSummary)}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Knowledge gaps requiring new content
2. Content effectiveness and engagement patterns
3. Recommendations for knowledge organization
4. High-value content creation priorities
5. Learning path suggestions for different user types`,
      response_json_schema: {
        type: 'object',
        properties: {
          knowledge_gaps: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          engagement_patterns: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          organization_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          content_priorities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          learning_paths: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      }
    });

    if (result.success) {
      setAiInsights(result.data);
    }
  };

  const headerActions = (
    <div className="flex items-center gap-3">
      <Button variant="outline" className="gap-2" onClick={handleAIInsights} disabled={aiLoading || !isAvailable}>
        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
      </Button>
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
      {isAdmin && (
        <>
          <Link to={createPageUrl('KnowledgeDocumentCreate')}>
            <Button className="bg-gradient-to-r from-blue-600 to-teal-600">
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Add Document', ar: 'إضافة مستند' })}
            </Button>
          </Link>
          <Link to={createPageUrl('CaseStudyCreate')}>
            <Button variant="outline">
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Add Case Study', ar: 'إضافة دراسة حالة' })}
            </Button>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        icon={BookOpen}
        title={{ en: 'Knowledge Base', ar: 'قاعدة المعرفة' }}
        description={{ en: 'Resources, guides, and best practices', ar: 'الموارد والأدلة وأفضل الممارسات' }}
        actions={headerActions}
      />

      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Knowledge Insights', ar: 'رؤى المعرفة الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing knowledge base...', ar: 'جاري تحليل قاعدة المعرفة...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.knowledge_gaps?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Knowledge Gaps', ar: 'فجوات المعرفة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.knowledge_gaps.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.engagement_patterns?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Engagement Patterns', ar: 'أنماط التفاعل' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.engagement_patterns.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.organization_recommendations?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Organization', ar: 'التنظيم' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.organization_recommendations.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.content_priorities?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Content Priorities', ar: 'أولويات المحتوى' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.content_priorities.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.learning_paths?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Learning Paths', ar: 'مسارات التعلم' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.learning_paths.map((item, i) => (
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all">{t({ en: 'All', ar: 'الكل' })}</TabsTrigger>
          <TabsTrigger value="featured">
            <Star className="h-4 w-4 mr-1" />
            {t({ en: 'Featured', ar: 'مميز' })}
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-1" />
            {t({ en: 'Trending', ar: 'رائج' })}
          </TabsTrigger>
          <TabsTrigger value="recent">{t({ en: 'Recent', ar: 'حديث' })}</TabsTrigger>
        </TabsList>
      </Tabs>

      {featuredItems.length > 0 && activeTab === 'all' && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t({ en: 'Featured Resources', ar: 'الموارد المميزة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredItems.map((item) => (
                <div key={item.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  {item.thumbnail && (
                    <img src={item.thumbnail} alt={t(item.title)} className="w-full h-32 object-cover rounded-lg mb-3" />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 border-white/40">
                      {item.category}
                    </Badge>
                    {getContentTypeIcon(item.contentType)}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{t(item.title)}</h3>
                  <p className="text-sm text-white/80 line-clamp-2">{t(item.description)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: { en: 'Videos', ar: 'فيديوهات' }, count: knowledgeItems.filter(i => i.contentType === 'video').length, icon: Video, color: 'red' },
          { label: { en: 'Audio', ar: 'صوتي' }, count: knowledgeItems.filter(i => i.contentType === 'audio').length, icon: Headphones, color: 'purple' },
          { label: { en: 'Documents', ar: 'مستندات' }, count: knowledgeItems.filter(i => i.contentType === 'document').length, icon: FileText, color: 'blue' },
          { label: { en: 'Infographics', ar: 'إنفوجرافيك' }, count: knowledgeItems.filter(i => i.contentType === 'infographic').length, icon: ImageIcon, color: 'green' },
          { label: { en: 'Interactive', ar: 'تفاعلي' }, count: knowledgeItems.filter(i => i.contentType === 'interactive').length, icon: Sparkles, color: 'amber' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className={`bg-gradient-to-br from-${stat.color}-50 to-white cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setContentTypeFilter(stat.label.en.toLowerCase())}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t(stat.label)}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.count}</p>
                  </div>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Sparkles className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600`} />
            <Input
              placeholder={t({ en: 'AI Search: "Find resources about smart traffic management"', ar: 'بحث ذكي: "ابحث عن موارد إدارة المرور الذكية"' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10' : 'pl-10'} border-blue-200 focus:border-blue-400`}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={contentTypeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContentTypeFilter('all')}
            >
              {t({ en: 'All', ar: 'الكل' })}
            </Button>
            <Button
              variant={contentTypeFilter === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContentTypeFilter('video')}
            >
              <Video className="h-4 w-4 mr-1" />
              {t({ en: 'Video', ar: 'فيديو' })}
            </Button>
            <Button
              variant={contentTypeFilter === 'audio' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContentTypeFilter('audio')}
            >
              <Headphones className="h-4 w-4 mr-1" />
              {t({ en: 'Audio', ar: 'صوتي' })}
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t({ en: 'Knowledge Resources', ar: 'موارد المعرفة' })} ({filteredItems.length})</CardTitle>
                {activeTab === 'all' && (
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t({ en: 'AI Recommendations', ar: 'توصيات ذكية' })}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t({ en: 'No resources found', ar: 'لم يتم العثور على موارد' })}</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                      {item.thumbnail ? (
                        <div className="relative h-48 bg-slate-100">
                          <img src={item.thumbnail} alt={t(item.title)} className="w-full h-full object-cover" />
                          {item.contentType === 'video' && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="h-12 w-12 text-white" />
                            </div>
                          )}
                          {item.duration && (
                            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                              {item.duration}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                          {getContentTypeIcon(item.contentType)}
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={categoryColors[item.category]}>
                            {item.category}
                          </Badge>
                          {getContentTypeIcon(item.contentType)}
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-600">
                          {t(item.title)}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {t(item.description)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {item.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {item.rating}
                            </span>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Link to={createPageUrl(`${item.type === 'case_study' ? 'CaseStudyEdit' : 'KnowledgeDocumentEdit'}?id=${item.id}`)}>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(t({ en: 'Delete?', ar: 'حذف؟' }))) {
                                    if (item.type === 'case_study') {
                                      deleteCaseMutation.mutate(item.id);
                                    } else {
                                      deleteMutation.mutate(item.id);
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-start gap-4">
                        {item.thumbnail && (
                          <div className="relative w-32 h-20 flex-shrink-0 bg-slate-100 rounded overflow-hidden">
                            <img src={item.thumbnail} alt={t(item.title)} className="w-full h-full object-cover" />
                            {item.contentType === 'video' && (
                              <Play className="absolute inset-0 m-auto h-8 w-8 text-white" />
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={categoryColors[item.category]}>{item.category}</Badge>
                            {getContentTypeIcon(item.contentType)}
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1">{t(item.title)}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{t(item.description)}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {item.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {item.rating}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Link to={createPageUrl(`${item.type === 'case_study' ? 'CaseStudyEdit' : 'KnowledgeDocumentEdit'}?id=${item.id}`)}>
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(t({ en: 'Delete?', ar: 'حذف؟' }))) {
                                    if (item.type === 'case_study') {
                                      deleteCaseMutation.mutate(item.id);
                                    } else {
                                      deleteMutation.mutate(item.id);
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <PolicyLibraryWidget />

          <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Sparkles className="h-5 w-5" />
                {t({ en: 'AI Suggested', ar: 'مقترحات ذكية' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-blue-800 mb-3">
                {t({ en: 'Based on your recent challenges', ar: 'بناءً على تحدياتك الأخيرة' })}
              </p>
              {filteredItems.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-white rounded-lg">
                  <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{t(item.title)}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {item.rating}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                {t({ en: 'Trending Now', ar: 'الأكثر رواجاً' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-slate-300">#{idx + 1}</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{t(item.title)}</h4>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.views} {t({ en: 'views', ar: 'مشاهدة' })}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(KnowledgePage, { requiredPermissions: [] });