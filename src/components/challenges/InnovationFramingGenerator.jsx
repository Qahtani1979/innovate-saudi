import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb, Users, Loader2, Plus, Trash2, Edit2, Languages } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  getInnovationFramingPrompt, 
  innovationFramingSchema,
  getTranslationPrompt,
  translationSchema 
} from '@/lib/ai/prompts/challenges';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function InnovationFramingGenerator({ challenge, onFramingGenerated }) {
  const [framing, setFraming] = useState(challenge?.innovation_framing || null);
  const [editingItem, setEditingItem] = useState(null);
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateFraming = async () => {
    const result = await invokeAI({
      prompt: getInnovationFramingPrompt(challenge),
      response_json_schema: innovationFramingSchema,
      system_prompt: getSystemPrompt('innovation')
    });

    if (result.success) {
      setFraming(result.data);
      if (onFramingGenerated) {
        onFramingGenerated(result.data);
      }
      toast.success(t({ en: 'Innovation framing generated!', ar: 'تم توليد التأطير الابتكاري!' }));
    }
  };

  const addItem = (category, subcategory = null) => {
    const updated = { ...framing };
    if (subcategory) {
      updated[category][subcategory] = [...(updated[category][subcategory] || []), { en: '', ar: '' }];
    } else {
      updated[category] = [...(updated[category] || []), { en: '', ar: '' }];
    }
    setFraming(updated);
    if (onFramingGenerated) onFramingGenerated(updated);
  };

  const updateItem = (category, index, field, value, subcategory = null) => {
    const updated = { ...framing };
    if (subcategory) {
      updated[category][subcategory][index][field] = value;
    } else {
      updated[category][index][field] = value;
    }
    setFraming(updated);
    if (onFramingGenerated) onFramingGenerated(updated);
  };

  const deleteItem = (category, index, subcategory = null) => {
    const updated = { ...framing };
    if (subcategory) {
      updated[category][subcategory] = updated[category][subcategory].filter((_, i) => i !== index);
    } else {
      updated[category] = updated[category].filter((_, i) => i !== index);
    }
    setFraming(updated);
    if (onFramingGenerated) onFramingGenerated(updated);
  };

  const translateItem = async (category, index, fromLang, subcategory = null) => {
    const item = subcategory ? framing[category][subcategory][index] : framing[category][index];
    const sourceText = item[fromLang];
    const targetLang = fromLang === 'en' ? 'ar' : 'en';
    
    if (!sourceText) {
      toast.error(t({ en: 'Source text empty', ar: 'النص المصدر فارغ' }));
      return;
    }

    const result = await invokeAI({
      prompt: getTranslationPrompt(sourceText, targetLang),
      response_json_schema: translationSchema,
      system_prompt: getSystemPrompt('general')
    });
    
    if (result.success) {
      updateItem(category, index, targetLang, result.data?.translation, subcategory);
      toast.success(t({ en: 'Translated', ar: 'تمت الترجمة' }));
    }
  };

  if (!framing) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="py-8 text-center">
          <Lightbulb className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t({ en: 'Innovation Framing', ar: 'تأطير الابتكار' })}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {t({ 
              en: 'Transform problem into opportunities with AI-generated questions',
              ar: 'حوّل المشكلة إلى فرص مع أسئلة مولدة بالذكاء'
            })}
          </p>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
          <Button
            onClick={generateFraming}
            disabled={generating || !isAvailable}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Generate', ar: 'توليد' })}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const EditableItem = ({ item, index, category, subcategory = null }) => (
    <div className="p-3 bg-white rounded-lg border space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">#{index + 1}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => translateItem(category, index, 'en', subcategory)}>
            <Languages className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => deleteItem(category, index, subcategory)}>
            <Trash2 className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      </div>
      <Input
        value={item.en || ''}
        onChange={(e) => updateItem(category, index, 'en', e.target.value, subcategory)}
        placeholder="English"
        className="text-sm"
      />
      <Input
        value={item.ar || ''}
        onChange={(e) => updateItem(category, index, 'ar', e.target.value, subcategory)}
        placeholder="عربي"
        dir="rtl"
        className="text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* HMW Questions */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lightbulb className="h-5 w-5" />
              {t({ en: 'How Might We...', ar: 'كيف يمكننا...' })}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => addItem('hmw_questions')}>
              <Plus className="h-3 w-3 mr-1" />
              {t({ en: 'Add', ar: 'إضافة' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {framing.hmw_questions?.map((q, i) => (
            <EditableItem key={i} item={q} index={i} category="hmw_questions" />
          ))}
        </CardContent>
      </Card>

      {/* What If Scenarios */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'What If Scenarios', ar: 'سيناريوهات "ماذا لو"' })}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => addItem('what_if_scenarios')}>
              <Plus className="h-3 w-3 mr-1" />
              {t({ en: 'Add', ar: 'إضافة' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {framing.what_if_scenarios?.map((s, i) => (
            <EditableItem key={i} item={s} index={i} category="what_if_scenarios" />
          ))}
        </CardContent>
      </Card>

      {/* Guiding Questions */}
      <Card className="border-2 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-900">
            <Users className="h-5 w-5" />
            {t({ en: 'Guiding Questions', ar: 'أسئلة توجيهية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* For Startups */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-orange-600">
                {t({ en: 'For Startups', ar: 'للشركات الناشئة' })}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => addItem('guiding_questions', 'for_startups')}>
                <Plus className="h-3 w-3 mr-1" />
                {t({ en: 'Add', ar: 'إضافة' })}
              </Button>
            </div>
            <div className="space-y-2">
              {framing.guiding_questions?.for_startups?.map((q, i) => (
                <EditableItem key={i} item={q} index={i} category="guiding_questions" subcategory="for_startups" />
              ))}
            </div>
          </div>

          {/* For Researchers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-indigo-600">
                {t({ en: 'For Researchers', ar: 'للباحثين' })}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => addItem('guiding_questions', 'for_researchers')}>
                <Plus className="h-3 w-3 mr-1" />
                {t({ en: 'Add', ar: 'إضافة' })}
              </Button>
            </div>
            <div className="space-y-2">
              {framing.guiding_questions?.for_researchers?.map((q, i) => (
                <EditableItem key={i} item={q} index={i} category="guiding_questions" subcategory="for_researchers" />
              ))}
            </div>
          </div>

          {/* Technology Opportunities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-teal-600">
                {t({ en: 'Technology Opportunities', ar: 'فرص التقنية' })}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => addItem('guiding_questions', 'technology_opportunities')}>
                <Plus className="h-3 w-3 mr-1" />
                {t({ en: 'Add', ar: 'إضافة' })}
              </Button>
            </div>
            <div className="space-y-2">
              {framing.guiding_questions?.technology_opportunities?.map((tech, i) => (
                <EditableItem key={i} item={tech} index={i} category="guiding_questions" subcategory="technology_opportunities" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={generateFraming}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {t({ en: 'Regenerate All', ar: 'إعادة توليد الكل' })}
      </Button>
    </div>
  );
}
