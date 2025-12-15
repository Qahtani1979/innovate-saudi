import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyTemplates } from '@/hooks/strategy/useStrategyTemplates';
import { STRATEGY_TEMPLATE_TYPES } from '@/constants/strategyTemplateTypes';

export default function SaveAsTemplateDialog({ 
  planData, 
  trigger, 
  onSuccess 
}) {
  const { t, language, isRTL } = useLanguage();
  const { createTemplate, isCreating } = useStrategyTemplates();
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState({
    name_en: planData?.name_en ? `${planData.name_en} Template` : '',
    name_ar: planData?.name_ar ? `قالب ${planData.name_ar}` : '',
    description_en: planData?.description_en || '',
    description_ar: planData?.description_ar || '',
    template_type: 'innovation',
    is_public: false,
    tags: []
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name_en) return;

    try {
      await createTemplate({
        planData,
        templateMeta: formData
      });
      
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t({ en: 'Save as Template', ar: 'حفظ كقالب' })}
          </DialogTitle>
          <DialogDescription>
            {t({ 
              en: 'Create a reusable template from this strategic plan', 
              ar: 'إنشاء قالب قابل لإعادة الاستخدام من هذه الخطة الاستراتيجية' 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name EN */}
          <div className="space-y-2">
            <Label htmlFor="name_en">
              {t({ en: 'Template Name (English)', ar: 'اسم القالب (الإنجليزية)' })} *
            </Label>
            <Input
              id="name_en"
              value={formData.name_en}
              onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
              placeholder={t({ en: 'Enter template name...', ar: 'أدخل اسم القالب...' })}
            />
          </div>

          {/* Name AR */}
          <div className="space-y-2">
            <Label htmlFor="name_ar">
              {t({ en: 'Template Name (Arabic)', ar: 'اسم القالب (العربية)' })}
            </Label>
            <Input
              id="name_ar"
              value={formData.name_ar}
              onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
              placeholder={t({ en: 'Enter Arabic name...', ar: 'أدخل الاسم بالعربية...' })}
              dir="rtl"
            />
          </div>

          {/* Template Type */}
          <div className="space-y-2">
            <Label>{t({ en: 'Template Type', ar: 'نوع القالب' })} *</Label>
            <Select 
              value={formData.template_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t({ en: 'Description', ar: 'الوصف' })}
            </Label>
            <Textarea
              id="description"
              value={formData.description_en}
              onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
              placeholder={t({ 
                en: 'Describe what this template is best used for...', 
                ar: 'صف الاستخدام الأفضل لهذا القالب...' 
              })}
              rows={3}
            />
          </div>

          {/* Tags */}
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
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <Label className="text-base">
                {t({ en: 'Make Public', ar: 'جعله عاماً' })}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t({ 
                  en: 'Allow others to discover and use this template', 
                  ar: 'السماح للآخرين باكتشاف واستخدام هذا القالب' 
                })}
              </p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name_en || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {t({ en: 'Save Template', ar: 'حفظ القالب' })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
