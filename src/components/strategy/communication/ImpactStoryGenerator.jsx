import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/components/LanguageContext';
import { useImpactStories } from '@/hooks/strategy/useImpactStories';
import { useCommunicationAI } from '@/hooks/strategy/useCommunicationAI';
import { useAvailableEntities } from '@/hooks/useEntitySelection';
import {
  BookOpen, Sparkles, Save, Eye, EyeOff, Star, Loader2,
  Image, Video, TrendingUp, Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

const ENTITY_TYPES = [
  { value: 'pilot', label_en: 'Pilot Project', label_ar: 'مشروع تجريبي', table: 'pilots' },
  { value: 'challenge', label_en: 'Challenge', label_ar: 'تحدي', table: 'challenges' },
  { value: 'solution', label_en: 'Solution', label_ar: 'حل', table: 'solutions' },
  { value: 'partnership', label_en: 'Partnership', label_ar: 'شراكة', table: 'partnerships' },
  { value: 'program', label_en: 'Program', label_ar: 'برنامج', table: 'programs' },
  { value: 'living_lab', label_en: 'Living Lab', label_ar: 'مختبر حي', table: 'living_labs' }
];

export default function ImpactStoryGenerator({ strategicPlanId, onSave }) {
  const { t, language } = useLanguage();
  const { stories, createStory, isCreating } = useImpactStories({ strategicPlanId });
  const { generateImpactStory, isLoading: isAILoading } = useCommunicationAI();

  const [storyData, setStoryData] = useState({
    entity_type: '',
    entity_id: '',
    title_en: '',
    title_ar: '',
    summary_en: '',
    summary_ar: '',
    full_story_en: '',
    full_story_ar: '',
    key_metrics: [],
    testimonials: [],
    before_situation: '',
    after_situation: '',
    lessons_learned: [],
    tags: [],
    image_url: '',
    video_url: '',
    is_featured: false,
    is_published: false
  });

  const [entityDetails, setEntityDetails] = useState('');
  const [newTag, setNewTag] = useState('');

  // Fetch entities based on selected type
  const { data: availableEntities = [], isLoading: entitiesLoading } = useAvailableEntities(storyData.entity_type);

  // When entity is selected, auto-populate details
  const handleEntitySelect = (entityId) => {
    setStoryData(prev => ({ ...prev, entity_id: entityId }));
    const entity = availableEntities.find(e => e.id === entityId);
    if (entity) {
      const details = `
Title: ${entity.title_en || 'N/A'}
Description: ${entity.description_en || 'N/A'}
Status: ${entity.status || 'N/A'}
      `.trim();
      setEntityDetails(details);
    }
  };

  const handleGenerateStory = async () => {
    if (!entityDetails) {
      toast.error(t({ en: 'Please provide entity details', ar: 'يرجى تقديم تفاصيل الكيان' }));
      return;
    }

    try {
      const result = await generateImpactStory({
        entity_type: storyData.entity_type,
        details: entityDetails
      });

      setStoryData(prev => ({
        ...prev,
        title_en: result.title_en || prev.title_en,
        title_ar: result.title_ar || prev.title_ar,
        summary_en: result.summary_en || prev.summary_en,
        summary_ar: result.summary_ar || prev.summary_ar,
        full_story_en: result.full_story_en || prev.full_story_en,
        full_story_ar: result.full_story_ar || prev.full_story_ar,
        key_metrics: result.key_metrics || prev.key_metrics,
        before_situation: result.before_situation || prev.before_situation,
        after_situation: result.after_situation || prev.after_situation,
        lessons_learned: result.lessons_learned || prev.lessons_learned,
        tags: result.suggested_tags || prev.tags
      }));

      toast.success(t({ en: 'Story generated successfully', ar: 'تم إنشاء القصة بنجاح' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate story', ar: 'فشل في إنشاء القصة' }));
    }
  };

  const handleAddTag = () => {
    if (newTag && !storyData.tags.includes(newTag)) {
      setStoryData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setStoryData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSaveStory = async () => {
    if (!storyData.title_en || !storyData.entity_type) {
      toast.error(t({ en: 'Title and entity type are required', ar: 'العنوان ونوع الكيان مطلوبان' }));
      return;
    }

    try {
      await createStory({
        ...storyData,
        strategic_plan_id: strategicPlanId
      });
      toast.success(t({ en: 'Impact story saved', ar: 'تم حفظ قصة التأثير' }));
      if (onSave) onSave();
    } catch (error) {
      toast.error(t({ en: 'Failed to save story', ar: 'فشل في حفظ القصة' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {t({ en: 'Impact Story Generator', ar: 'مولد قصص التأثير' })}
        </CardTitle>
        <CardDescription>
          {t({ en: 'Create compelling success stories from your innovation portfolio', ar: 'إنشاء قصص نجاح مقنعة من محفظة الابتكار' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Entity Selection */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t({ en: 'Entity Type', ar: 'نوع الكيان' })}</label>
            <Select
              value={storyData.entity_type}
              onValueChange={(value) => setStoryData(prev => ({ ...prev, entity_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select entity type', ar: 'اختر نوع الكيان' })} />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {language === 'ar' ? type.label_ar : type.label_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t({ en: 'Select Entity', ar: 'اختر الكيان' })}</label>
            <Select
              value={storyData.entity_id}
              onValueChange={handleEntitySelect}
              disabled={!storyData.entity_type || entitiesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  entitiesLoading
                    ? t({ en: 'Loading...', ar: 'جاري التحميل...' })
                    : t({ en: 'Select an entity', ar: 'اختر كيان' })
                } />
              </SelectTrigger>
              <SelectContent>
                {availableEntities.map(entity => (
                  <SelectItem key={entity.id} value={entity.id}>
                    <div className="flex items-center gap-2">
                      <span>{language === 'ar' ? (entity.title_ar || entity.title_en) : entity.title_en}</span>
                      <Badge variant="outline" className="text-xs">{entity.status}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableEntities.length === 0 && storyData.entity_type && !entitiesLoading && (
              <p className="text-xs text-muted-foreground">
                {t({ en: 'No entities found for this type', ar: 'لم يتم العثور على كيانات لهذا النوع' })}
              </p>
            )}
          </div>
        </div>

        {/* Entity Details for AI */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">{t({ en: 'Entity Details (for AI generation)', ar: 'تفاصيل الكيان (للتوليد الذكي)' })}</label>
            <Button onClick={handleGenerateStory} disabled={isAILoading} size="sm">
              {isAILoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Story', ar: 'توليد القصة' })}
            </Button>
          </div>
          <Textarea
            value={entityDetails}
            onChange={(e) => setEntityDetails(e.target.value)}
            placeholder={t({
              en: 'Describe the project, its goals, implementation, and outcomes...',
              ar: 'صف المشروع وأهدافه وتنفيذه ونتائجه...'
            })}
            rows={4}
          />
        </div>

        {/* Generated/Edited Content */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</label>
            <Input
              value={storyData.title_en}
              onChange={(e) => setStoryData(prev => ({ ...prev, title_en: e.target.value }))}
              placeholder="Transforming Municipal Services..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</label>
            <Input
              value={storyData.title_ar}
              onChange={(e) => setStoryData(prev => ({ ...prev, title_ar: e.target.value }))}
              placeholder="تحويل الخدمات البلدية..."
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t({ en: 'Summary (English)', ar: 'الملخص (إنجليزي)' })}</label>
            <Textarea
              value={storyData.summary_en}
              onChange={(e) => setStoryData(prev => ({ ...prev, summary_en: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t({ en: 'Summary (Arabic)', ar: 'الملخص (عربي)' })}</label>
            <Textarea
              value={storyData.summary_ar}
              onChange={(e) => setStoryData(prev => ({ ...prev, summary_ar: e.target.value }))}
              rows={3}
              dir="rtl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t({ en: 'Full Story (English)', ar: 'القصة الكاملة (إنجليزي)' })}</label>
          <Textarea
            value={storyData.full_story_en}
            onChange={(e) => setStoryData(prev => ({ ...prev, full_story_en: e.target.value }))}
            rows={8}
          />
        </div>

        {/* Key Metrics */}
        {storyData.key_metrics.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t({ en: 'Key Metrics', ar: 'المقاييس الرئيسية' })}
            </label>
            <div className="grid gap-2 md:grid-cols-3">
              {storyData.key_metrics.map((metric, idx) => (
                <Card key={idx} className="p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  {metric.improvement && (
                    <Badge variant="secondary" className="mt-1">{metric.improvement}</Badge>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Before/After */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t({ en: 'Before Situation', ar: 'الوضع السابق' })}</label>
            <Textarea
              value={storyData.before_situation}
              onChange={(e) => setStoryData(prev => ({ ...prev, before_situation: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t({ en: 'After Situation', ar: 'الوضع الحالي' })}</label>
            <Textarea
              value={storyData.after_situation}
              onChange={(e) => setStoryData(prev => ({ ...prev, after_situation: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        {/* Lessons Learned */}
        {storyData.lessons_learned.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}
            </label>
            <div className="space-y-1">
              {storyData.lessons_learned.map((lesson, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{lesson}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t({ en: 'Tags', ar: 'الوسوم' })}</label>
          <div className="flex gap-2 flex-wrap">
            {storyData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                {tag} ×
              </Badge>
            ))}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={t({ en: 'Add tag', ar: 'إضافة وسم' })}
                className="w-32"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button variant="outline" size="sm" onClick={handleAddTag}>+</Button>
            </div>
          </div>
        </div>

        {/* Media URLs */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              {t({ en: 'Image URL', ar: 'رابط الصورة' })}
            </label>
            <Input
              value={storyData.image_url}
              onChange={(e) => setStoryData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Video className="h-4 w-4" />
              {t({ en: 'Video URL', ar: 'رابط الفيديو' })}
            </label>
            <Input
              value={storyData.video_url}
              onChange={(e) => setStoryData(prev => ({ ...prev, video_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Publishing Options */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={storyData.is_featured}
                onCheckedChange={(checked) => setStoryData(prev => ({ ...prev, is_featured: checked }))}
              />
              <label className="text-sm flex items-center gap-1">
                <Star className="h-4 w-4" />
                {t({ en: 'Featured', ar: 'مميز' })}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={storyData.is_published}
                onCheckedChange={(checked) => setStoryData(prev => ({ ...prev, is_published: checked }))}
              />
              <label className="text-sm flex items-center gap-1">
                {storyData.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {t({ en: 'Published', ar: 'منشور' })}
              </label>
            </div>
          </div>

          <Button onClick={handleSaveStory} disabled={isCreating}>
            {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {t({ en: 'Save Story', ar: 'حفظ القصة' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
