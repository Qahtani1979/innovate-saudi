import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Calendar, Tag, Loader2, Wand2, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export function AIEventOptimizer({ 
  eventData = {}, 
  onApplySuggestion,
  compact = false 
}) {
  const { t, isRTL, language } = useLanguage();
  const [suggestions, setSuggestions] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateSuggestions = async () => {
    const prompt = `You are an event optimization expert for a government innovation platform.

Analyze this event and provide optimization suggestions:
- Event Title: ${eventData.title_en || eventData.title_ar || 'New Event'}
- Event Type: ${eventData.event_type || 'Not specified'}
- Description: ${eventData.description_en || eventData.description_ar || 'No description'}
- Start Date: ${eventData.start_date || 'Not set'}
- Location: ${eventData.location || 'Not specified'}
- Target Audience: ${eventData.target_audience || 'General'}

Provide your response as a JSON object with this exact structure:
{
  "optimal_timing": {
    "suggested_day": "Tuesday or Wednesday",
    "suggested_time": "10:00 AM - 12:00 PM",
    "reasoning": "Brief explanation"
  },
  "description_enhancement": {
    "en": "Enhanced English description (max 150 words)",
    "ar": "Enhanced Arabic description (max 150 words)"
  },
  "suggested_tags": ["tag1", "tag2", "tag3"],
  "event_type_recommendation": {
    "recommended": "workshop|webinar|conference|meetup|training",
    "reasoning": "Why this type fits"
  },
  "capacity_suggestion": {
    "recommended": 50,
    "reasoning": "Based on event type and topic"
  }
}`;

    const result = await invokeAI(prompt, 'json');
    if (result.success && result.data) {
      setSuggestions(result.data);
    }
  };

  const applySuggestion = (field, value) => {
    if (onApplySuggestion) {
      onApplySuggestion(field, value);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={generateSuggestions}
          disabled={isLoading || !isAvailable}
          className="gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {t({ en: 'AI Optimize', ar: 'تحسين ذكي' })}
        </Button>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
      </div>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Event Optimizer', ar: 'محسن الفعاليات الذكي' })}
          </CardTitle>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestions ? (
          <div className="text-center py-4">
            <Wand2 className="h-12 w-12 text-purple-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {t({ 
                en: 'Get AI-powered suggestions for optimal timing, descriptions, and tags',
                ar: 'احصل على اقتراحات ذكية للتوقيت والوصف والعلامات'
              })}
            </p>
            <Button 
              onClick={generateSuggestions}
              disabled={isLoading || !isAvailable}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate Suggestions', ar: 'توليد الاقتراحات' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Timing Suggestion */}
            {suggestions.optimal_timing && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">{t({ en: 'Optimal Timing', ar: 'التوقيت الأمثل' })}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => applySuggestion('timing', suggestions.optimal_timing)}
                    className="h-7 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t({ en: 'Apply', ar: 'تطبيق' })}
                  </Button>
                </div>
                <p className="text-sm">
                  <strong>{suggestions.optimal_timing.suggested_day}</strong> - {suggestions.optimal_timing.suggested_time}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{suggestions.optimal_timing.reasoning}</p>
              </div>
            )}

            {/* Description Enhancement */}
            {suggestions.description_enhancement && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{t({ en: 'Enhanced Description', ar: 'وصف محسن' })}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => applySuggestion('description', suggestions.description_enhancement)}
                    className="h-7 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t({ en: 'Apply', ar: 'تطبيق' })}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {language === 'ar' ? suggestions.description_enhancement.ar : suggestions.description_enhancement.en}
                </p>
              </div>
            )}

            {/* Tags */}
            {suggestions.suggested_tags && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">{t({ en: 'Suggested Tags', ar: 'علامات مقترحة' })}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => applySuggestion('tags', suggestions.suggested_tags)}
                    className="h-7 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t({ en: 'Apply', ar: 'تطبيق' })}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestions.suggested_tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity */}
            {suggestions.capacity_suggestion && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{t({ en: 'Capacity Recommendation', ar: 'توصية السعة' })}</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => applySuggestion('max_participants', suggestions.capacity_suggestion.recommended)}
                    className="h-7 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t({ en: 'Apply', ar: 'تطبيق' })}
                  </Button>
                </div>
                <p className="text-sm">
                  <strong>{suggestions.capacity_suggestion.recommended}</strong> {t({ en: 'participants', ar: 'مشارك' })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{suggestions.capacity_suggestion.reasoning}</p>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateSuggestions}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Regenerate', ar: 'إعادة التوليد' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIEventOptimizer;
