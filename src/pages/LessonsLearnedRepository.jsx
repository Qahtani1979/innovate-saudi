import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { 
  Lightbulb, Search, Plus, Filter, BookOpen, Target, 
  TrendingUp, AlertTriangle, CheckCircle, Sparkles, Loader2,
  Eye, Star, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function LessonsLearnedRepository() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const { isAdmin } = usePermissions();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading: aiLoading, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [aiInsights, setAiInsights] = useState(null);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons-learned'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons_learned')
        .select(`
          *,
          sector:sectors(id, name_en, name_ar),
          municipality:municipalities(id, name_en, name_ar)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = 
      lesson.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.title_ar?.includes(searchTerm) ||
      lesson.key_insight_en?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || lesson.category === categoryFilter;
    const matchesEntityType = entityTypeFilter === 'all' || lesson.entity_type === entityTypeFilter;
    return matchesSearch && matchesCategory && matchesEntityType;
  });

  const stats = {
    total: lessons.length,
    byCategory: {
      success: lessons.filter(l => l.category === 'success').length,
      failure: lessons.filter(l => l.category === 'failure').length,
      process: lessons.filter(l => l.category === 'process').length,
      technical: lessons.filter(l => l.category === 'technical').length,
    },
    byEntityType: {
      pilot: lessons.filter(l => l.entity_type === 'pilot').length,
      challenge: lessons.filter(l => l.entity_type === 'challenge').length,
      program: lessons.filter(l => l.entity_type === 'program').length,
      rd_project: lessons.filter(l => l.entity_type === 'rd_project').length,
    },
    featured: lessons.filter(l => l.is_featured).length,
  };

  const handleAIInsights = async () => {
    const result = await invokeAI({
      prompt: `Analyze lessons learned repository:

Stats: ${JSON.stringify(stats)}
Sample Lessons: ${lessons.slice(0, 10).map(l => `${l.title_en} (${l.category}): ${l.key_insight_en?.substring(0, 100)}`).join('\n')}

Provide bilingual insights (EN + AR):
1. Top patterns across lessons
2. Knowledge gaps - what lessons are missing?
3. Recommendations for capturing more lessons
4. Cross-sector learning opportunities`,
      response_json_schema: {
        type: 'object',
        properties: {
          patterns: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          gaps: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          cross_sector_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      }
    });

    if (result.success) {
      setAiInsights(result.data);
    }
  };

  const categoryColors = {
    success: 'bg-green-100 text-green-700 border-green-300',
    failure: 'bg-red-100 text-red-700 border-red-300',
    process: 'bg-blue-100 text-blue-700 border-blue-300',
    technical: 'bg-purple-100 text-purple-700 border-purple-300',
    organizational: 'bg-amber-100 text-amber-700 border-amber-300',
  };

  const entityTypeIcons = {
    pilot: Target,
    challenge: AlertTriangle,
    program: BookOpen,
    rd_project: Lightbulb,
  };

  const headerActions = (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={handleAIInsights} disabled={aiLoading || !isAvailable}>
        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        <span className={isRTL ? 'mr-2' : 'ml-2'}>{t({ en: 'AI Insights', ar: 'رؤى ذكية' })}</span>
      </Button>
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        icon={Lightbulb}
        title={{ en: 'Lessons Learned Repository', ar: 'مستودع الدروس المستفادة' }}
        description={{ en: 'Capture, share, and apply learnings across the platform', ar: 'التقط وشارك وطبق الدروس عبر المنصة' }}
        actions={headerActions}
        stats={[
          { icon: Lightbulb, value: stats.total, label: t({ en: 'Total Lessons', ar: 'إجمالي الدروس' }) },
          { icon: CheckCircle, value: stats.byCategory.success, label: t({ en: 'Successes', ar: 'نجاحات' }) },
          { icon: AlertTriangle, value: stats.byCategory.failure, label: t({ en: 'Failures', ar: 'إخفاقات' }) },
          { icon: Star, value: stats.featured, label: t({ en: 'Featured', ar: 'مميز' }) },
        ]}
      />

      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* AI Insights */}
        {aiInsights && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Sparkles className="h-5 w-5" />
                {t({ en: 'AI Analysis', ar: 'تحليل ذكي' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiInsights.patterns?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Patterns', ar: 'أنماط' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.patterns.map((item, i) => (
                        <li key={i} className="text-slate-700">• {language === 'ar' ? item.ar : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.gaps?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Gaps', ar: 'فجوات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.gaps.map((item, i) => (
                        <li key={i} className="text-slate-700">• {language === 'ar' ? item.ar : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.recommendations?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Recommendations', ar: 'توصيات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.recommendations.map((item, i) => (
                        <li key={i} className="text-slate-700">• {language === 'ar' ? item.ar : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.cross_sector_opportunities?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Cross-Sector', ar: 'عبر القطاعات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.cross_sector_opportunities.map((item, i) => (
                        <li key={i} className="text-slate-700">• {language === 'ar' ? item.ar : item.en}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t({ en: 'Search lessons...', ar: 'البحث في الدروس...' })}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {['all', 'success', 'failure', 'process', 'technical'].map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {t({ en: cat.charAt(0).toUpperCase() + cat.slice(1), ar: cat === 'all' ? 'الكل' : cat === 'success' ? 'نجاح' : cat === 'failure' ? 'إخفاق' : cat === 'process' ? 'عملية' : 'تقني' })}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => {
            const EntityIcon = entityTypeIcons[lesson.entity_type] || Lightbulb;
            return (
              <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Badge className={categoryColors[lesson.category] || 'bg-slate-100'}>
                      {lesson.category}
                    </Badge>
                    {lesson.is_featured && (
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">
                    {language === 'ar' && lesson.title_ar ? lesson.title_ar : lesson.title_en}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <EntityIcon className="h-4 w-4" />
                    <span className="capitalize">{lesson.entity_type?.replace('_', ' ')}</span>
                    {lesson.sector && (
                      <>
                        <span>•</span>
                        <span>{language === 'ar' ? lesson.sector.name_ar : lesson.sector.name_en}</span>
                      </>
                    )}
                  </div>

                  {lesson.key_insight_en && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-amber-900">
                        💡 {language === 'ar' && lesson.key_insight_ar ? lesson.key_insight_ar : lesson.key_insight_en}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {language === 'ar' && lesson.description_ar ? lesson.description_ar : lesson.description_en}
                  </p>

                  {lesson.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {lesson.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{lesson.view_count || 0}</span>
                    </div>
                    <Badge className={`${lesson.impact_level === 'high' ? 'bg-red-100 text-red-700' : lesson.impact_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {lesson.impact_level} impact
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredLessons.length === 0 && !isLoading && (
          <Card className="p-12 text-center">
            <Lightbulb className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {t({ en: 'No Lessons Found', ar: 'لا توجد دروس' })}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t({ en: 'Lessons are captured automatically from resolved challenges and completed pilots.', ar: 'تُلتقط الدروس تلقائياً من التحديات المحلولة والتجارب المكتملة.' })}
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(LessonsLearnedRepository, { requiredPermissions: ['knowledge_view'] });
