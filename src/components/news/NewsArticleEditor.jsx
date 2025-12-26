import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';
import { Newspaper, Save, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { useNewsArticleMutations, useNewsAI } from '@/hooks/useNewsArticles';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'announcement', label: { en: 'Announcement', ar: 'إعلان' } },
  { value: 'innovation', label: { en: 'Innovation', ar: 'ابتكار' } },
  { value: 'event', label: { en: 'Event', ar: 'فعالية' } },
  { value: 'achievement', label: { en: 'Achievement', ar: 'إنجاز' } },
  { value: 'update', label: { en: 'Platform Update', ar: 'تحديث المنصة' } },
  { value: 'municipality', label: { en: 'Municipality News', ar: 'أخبار البلدية' } },
];

export default function NewsArticleEditor({ article, onClose, onSave }) {
  const { language, t } = useLanguage();
  const { createArticle, updateArticle, publishArticle } = useNewsArticleMutations();
  const { generateContent } = useNewsAI();
  const [isTranslating, setIsTranslating] = useState(false);

  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    summary_en: '',
    summary_ar: '',
    content_en: '',
    content_ar: '',
    author: '',
    category: 'announcement',
    tags: [],
    image_url: '',
    source_url: '',
    is_published: false,
    is_featured: false
  });

  useEffect(() => {
    if (article) {
      setFormData({
        title_en: article.title_en || '',
        title_ar: article.title_ar || '',
        summary_en: article.summary_en || '',
        summary_ar: article.summary_ar || '',
        content_en: article.content_en || '',
        content_ar: article.content_ar || '',
        author: article.author || '',
        category: article.category || 'announcement',
        tags: article.tags || [],
        image_url: article.image_url || '',
        source_url: article.source_url || '',
        is_published: article.is_published || false,
        is_featured: article.is_featured || false
      });
    }
  }, [article]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTranslate = async () => {
    if (!formData.title_en || !formData.content_en) {
      toast.error(t({ en: 'Please fill in English content first', ar: 'يرجى ملء المحتوى الإنجليزي أولاً' }));
      return;
    }

    setIsTranslating(true);
    try {
      const contentToProcess = {
        title: formData.title_en,
        content: formData.content_en,
        summary: formData.summary_en
      };

      const result = await generateContent.mutateAsync({
        task: 'translate',
        content: contentToProcess,
        targetLanguage: 'ar'
      });

      if (result?.translation) {
        setFormData(prev => ({
          ...prev,
          title_ar: result.translation.title || prev.title_ar,
          summary_ar: result.translation.summary || prev.summary_ar,
          content_ar: result.translation.content || prev.content_ar
        }));
        toast.success(t({ en: 'Translation completed', ar: 'تمت الترجمة' }));
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Toast handled by hook
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!formData.title_en) {
      toast.error(t({ en: 'Title is required', ar: 'العنوان مطلوب' }));
      return;
    }

    const payload = {
      ...formData,
      is_published: publish || formData.is_published
    };

    try {
      if (article?.id) {
        await updateArticle.mutateAsync({ id: article.id, updates: payload });
      } else {
        await createArticle.mutateAsync(payload);
      }
      onSave?.();
      onClose?.();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            {article?.id
              ? t({ en: 'Edit Article', ar: 'تعديل المقال' })
              : t({ en: 'Create Article', ar: 'إنشاء مقال' })
            }
          </CardTitle>
          <div className="flex items-center gap-2">
            {formData.is_published && <Badge className="bg-green-600">Published</Badge>}
            {formData.is_featured && <Badge className="bg-amber-600">Featured</Badge>}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* English Content */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            🇬🇧 {t({ en: 'English Content', ar: 'المحتوى الإنجليزي' })}
          </h3>
          <Input
            placeholder={t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}
            value={formData.title_en}
            onChange={(e) => handleChange('title_en', e.target.value)}
          />
          <Textarea
            placeholder={t({ en: 'Summary (English)', ar: 'الملخص (إنجليزي)' })}
            value={formData.summary_en}
            onChange={(e) => handleChange('summary_en', e.target.value)}
            rows={2}
          />
          <Textarea
            placeholder={t({ en: 'Content (English)', ar: 'المحتوى (إنجليزي)' })}
            value={formData.content_en}
            onChange={(e) => handleChange('content_en', e.target.value)}
            rows={6}
          />
        </div>

        {/* AI Translate Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleTranslate}
            disabled={isTranslating || !formData.title_en}
            className="gap-2"
          >
            {isTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {t({ en: 'AI Translate to Arabic', ar: 'ترجمة آلية للعربية' })}
          </Button>
        </div>

        {/* Arabic Content */}
        <div className="space-y-4" dir="rtl">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            🇸🇦 {t({ en: 'Arabic Content', ar: 'المحتوى العربي' })}
          </h3>
          <Input
            placeholder={t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}
            value={formData.title_ar}
            onChange={(e) => handleChange('title_ar', e.target.value)}
          />
          <Textarea
            placeholder={t({ en: 'Summary (Arabic)', ar: 'الملخص (عربي)' })}
            value={formData.summary_ar}
            onChange={(e) => handleChange('summary_ar', e.target.value)}
            rows={2}
          />
          <Textarea
            placeholder={t({ en: 'Content (Arabic)', ar: 'المحتوى (عربي)' })}
            value={formData.content_ar}
            onChange={(e) => handleChange('content_ar', e.target.value)}
            rows={6}
          />
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t({ en: 'Author', ar: 'المؤلف' })}</Label>
            <Input
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              placeholder={t({ en: 'Author name', ar: 'اسم المؤلف' })}
            />
          </div>
          <div>
            <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
            <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t({ en: 'Image URL', ar: 'رابط الصورة' })}</Label>
            <Input
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>{t({ en: 'Source URL', ar: 'رابط المصدر' })}</Label>
            <Input
              value={formData.source_url}
              onChange={(e) => handleChange('source_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(v) => handleChange('is_featured', v)}
            />
            <Label>{t({ en: 'Featured Article', ar: 'مقال مميز' })}</Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} className="gap-2">
            <Save className="h-4 w-4" />
            {t({ en: 'Save Draft', ar: 'حفظ كمسودة' })}
          </Button>
          <Button onClick={() => handleSave(true)} className="gap-2 bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4" />
            {t({ en: 'Publish', ar: 'نشر' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
