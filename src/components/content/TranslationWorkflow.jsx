import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Languages, CheckCircle, AlertCircle, Sparkles, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TranslationWorkflow({ entity, entityType, onUpdate }) {
  const { t } = useLanguage();
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState({});

  const fields = entityType === 'Challenge' 
    ? ['title_ar', 'description_ar', 'root_cause_ar', 'tagline_ar']
    : entityType === 'Pilot'
    ? ['title_ar', 'description_ar', 'objective_ar', 'tagline_ar']
    : ['name_ar', 'description_ar', 'tagline_ar'];

  const hasTranslations = fields.every(f => entity[f]);

  const generateTranslations = async () => {
    setTranslating(true);
    try {
      const prompt = `Translate the following ${entityType} content to Arabic (formal, professional):

Title (EN): ${entity.title_en || entity.name_en}
Description (EN): ${entity.description_en}
${entity.tagline_en ? `Tagline (EN): ${entity.tagline_en}` : ''}

Provide translations in JSON format with keys: title_ar, description_ar, tagline_ar`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title_ar: { type: 'string' },
            description_ar: { type: 'string' },
            tagline_ar: { type: 'string' }
          }
        }
      });

      setTranslations(result);
      toast.success(t({ en: 'Translations generated', ar: 'تم إنشاء الترجمات' }));
    } catch (error) {
      toast.error(t({ en: 'Translation failed', ar: 'فشلت الترجمة' }));
    } finally {
      setTranslating(false);
    }
  };

  const applyTranslations = async () => {
    try {
      await onUpdate(translations);
      toast.success(t({ en: 'Translations applied', ar: 'تم تطبيق الترجمات' }));
      setTranslations({});
    } catch (error) {
      toast.error(t({ en: 'Failed to apply', ar: 'فشل التطبيق' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-blue-600" />
            {t({ en: 'Translation Workflow', ar: 'سير عمل الترجمة' })}
          </span>
          {hasTranslations ? (
            <Badge className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t({ en: 'Complete', ar: 'مكتمل' })}
            </Badge>
          ) : (
            <Badge className="bg-amber-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              {t({ en: 'Missing', ar: 'مفقود' })}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasTranslations && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            {t({ en: 'Arabic content is missing. Generate AI translations or add manually.', ar: 'المحتوى العربي مفقود. أنشئ ترجمات ذكية أو أضف يدوياً.' })}
          </div>
        )}

        <Button 
          onClick={generateTranslations} 
          disabled={translating}
          className="w-full bg-blue-600"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {translating 
            ? t({ en: 'Generating...', ar: 'جارٍ الإنشاء...' })
            : t({ en: 'Generate AI Translations', ar: 'إنشاء ترجمات ذكية' })
          }
        </Button>

        {Object.keys(translations).length > 0 && (
          <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              {t({ en: 'Generated Translations:', ar: 'الترجمات المنشأة:' })}
            </p>
            {Object.entries(translations).map(([key, value]) => (
              <div key={key}>
                <label className="text-xs text-blue-700 font-medium">{key}</label>
                <Textarea
                  value={value}
                  onChange={(e) => setTranslations({...translations, [key]: e.target.value})}
                  className="mt-1"
                  rows={2}
                  dir="rtl"
                />
              </div>
            ))}
            <Button onClick={applyTranslations} className="w-full bg-green-600">
              <Send className="h-4 w-4 mr-2" />
              {t({ en: 'Apply Translations', ar: 'تطبيق الترجمات' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}