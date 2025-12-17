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
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildProfileCompletionPrompt, 
  getProfileCompletionSchema,
  PROFILE_COMPLETION_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/profiles';

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
        prompt: buildProfileCompletionPrompt(profile),
        response_json_schema: getProfileCompletionSchema(),
        system_prompt: getSystemPrompt(PROFILE_COMPLETION_SYSTEM_PROMPT)
      });
      
      if (result.success && result.data) {
        setSuggestions(result.data);
        toast.success(t({ en: 'AI analysis complete', ar: 'اكتمل التحليل' }));
      } else {
        toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل' }));
      }
    } catch (error) {
      toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل' }));
    }
  };

  const getLocalizedArray = (data, field) => {
    if (!data) return [];
    if (language === 'ar' && data[`${field}_ar`]) {
      return data[`${field}_ar`];
    }
    return data[field] || [];
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
        <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t({ en: 'Profile Strength', ar: 'قوة الملف' })}</span>
            <span className="text-2xl font-bold" style={{ color: score >= 80 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626' }}>
              {score}%
            </span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <Button onClick={handleAISuggestions} disabled={loading || !isAvailable} className="w-full bg-blue-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'Get AI Suggestions', ar: 'احصل على اقتراحات ذكية' })}
        </Button>

        {suggestions && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-900 mb-2">{t({ en: 'Missing Sections', ar: 'أقسام مفقودة' })}</p>
              <div className="space-y-1">
                {getLocalizedArray(suggestions, 'missing_sections').map((section, i) => (
                  <p key={i} className="text-xs text-amber-700">• {section}</p>
                ))}
              </div>
            </div>

            {suggestions.improvements?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">{t({ en: 'Improvement Suggestions', ar: 'اقتراحات التحسين' })}</p>
                <div className="space-y-2">
                  {suggestions.improvements.map((imp, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium text-blue-800">
                        {language === 'ar' && imp.field_ar ? imp.field_ar : imp.field}:
                      </span>
                      <p className="text-slate-700 mt-1">
                        {language === 'ar' ? imp.suggestion_ar : imp.suggestion_en}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.recommended_tags?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">{t({ en: 'Recommended Tags', ar: 'علامات موصى بها' })}</p>
                <div className="flex flex-wrap gap-1">
                  {getLocalizedArray(suggestions, 'recommended_tags').map((tag, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer hover:bg-blue-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {suggestions.networking_opportunities?.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900 mb-2">{t({ en: 'Networking Opportunities', ar: 'فرص التواصل' })}</p>
                <div className="space-y-1">
                  {getLocalizedArray(suggestions, 'networking_opportunities').map((opp, i) => (
                    <p key={i} className="text-xs text-green-700">• {opp}</p>
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
