import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function ProfileCompletionAI({ profile, onSuggestion }) {
  const { language, isRTL, t } = useLanguage();
  const [suggestions, setSuggestions] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const completionScore = () => {
    let score = 0;
    if (profile?.bio_en) score += 20;
    if (profile?.bio_ar) score += 20;
    if (profile?.avatar_url) score += 15;
    if (profile?.expertise_areas?.length > 0) score += 25;
    if (profile?.social_links?.linkedin) score += 10;
    if (profile?.organization_id) score += 10;
    return score;
  };

  const handleAISuggestions = async () => {
    try {
      const result = await invokeAI({
        prompt: `Analyze this user profile and suggest improvements:
Bio (EN): ${profile?.bio_en || 'Missing'}
Bio (AR): ${profile?.bio_ar || 'Missing'}
Expertise: ${profile?.expertise_areas?.join(', ') || 'Missing'}
Title: ${profile?.title_en || 'Missing'}

Provide bilingual suggestions for:
1. Missing profile sections
2. How to improve existing sections
3. Recommended expertise tags
4. Networking opportunities`,
        response_json_schema: {
          type: 'object',
          properties: {
            missing_sections: { type: 'array', items: { type: 'string' } },
            improvements: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, suggestion_en: { type: 'string' }, suggestion_ar: { type: 'string' } } } },
            recommended_tags: { type: 'array', items: { type: 'string' } },
            networking_opportunities: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      if (result.success) {
        setSuggestions(result.data);
        toast.success(t({ en: 'AI analysis complete', ar: 'اكتمل التحليل' }));
      } else {
        toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل' }));
      }
    } catch (error) {
      toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل' }));
    }
  };

  const score = completionScore();

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          {t({ en: 'Profile Completion Assistant', ar: 'مساعد إكمال الملف' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t({ en: 'Profile Strength', ar: 'قوة الملف' })}</span>
            <span className="text-2xl font-bold" style={{ color: score >= 80 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626' }}>
              {score}%
            </span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <Button onClick={handleAISuggestions} disabled={loading} className="w-full bg-blue-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'Get AI Suggestions', ar: 'احصل على اقتراحات ذكية' })}
        </Button>

        {suggestions && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-900 mb-2">{t({ en: 'Missing Sections', ar: 'أقسام مفقودة' })}</p>
              <div className="space-y-1">
                {suggestions.missing_sections?.map((section, i) => (
                  <p key={i} className="text-xs text-amber-700">• {section}</p>
                ))}
              </div>
            </div>

            {suggestions.recommended_tags?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">{t({ en: 'Recommended Tags', ar: 'علامات موصى بها' })}</p>
                <div className="flex flex-wrap gap-1">
                  {suggestions.recommended_tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer hover:bg-blue-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}