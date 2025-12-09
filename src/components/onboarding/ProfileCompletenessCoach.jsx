import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Target, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function ProfileCompletenessCoach({ profile, role }) {
  const { language, t } = useLanguage();
  const [suggestions, setSuggestions] = useState([]);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const requiredFields = {
    municipality_admin: ['bio_en', 'title_en', 'organization_id', 'expertise_areas'],
    startup_user: ['bio_en', 'title_en', 'organization_id', 'social_links'],
    researcher: ['bio_en', 'title_en', 'organization_id', 'expertise_areas'],
    user: ['bio_en', 'title_en']
  };

  const fields = requiredFields[role] || requiredFields.user;
  const filledFields = fields.filter(f => profile?.[f] && profile[f].length > 0);
  const completeness = Math.round((filledFields.length / fields.length) * 100);

  const getSuggestions = async () => {
    const result = await invokeAI({
      prompt: `Provide profile completion suggestions:

ROLE: ${role}
CURRENT PROFILE: ${JSON.stringify(profile || {})}
COMPLETENESS: ${completeness}%

Suggest:
1. Top 3 most impactful fields to complete
2. Why each field matters
3. Example content for each field
4. Priority ranking`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                importance: { type: "string" },
                impact_description: { type: "string" },
                example: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setSuggestions(result.data.suggestions || []);
      toast.success(t({ en: 'Suggestions generated', ar: 'الاقتراحات أُنشئت' }));
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            {t({ en: 'Profile Coach', ar: 'مدرب الملف' })}
          </div>
          <Badge className={
            completeness >= 80 ? 'bg-green-100 text-green-700' :
            completeness >= 50 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }>
            {completeness}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">
                {t({ en: 'Profile Strength', ar: 'قوة الملف' })}
              </span>
              <span className="text-sm font-semibold">{filledFields.length}/{fields.length} {t({ en: 'fields', ar: 'حقول' })}</span>
            </div>
            <Progress value={completeness} className="h-3" />
          </div>

          {completeness < 100 && !suggestions.length && (
            <Button onClick={getSuggestions} disabled={isLoading || !isAvailable} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Get AI Suggestions', ar: 'احصل على اقتراحات الذكاء' })}
            </Button>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-900">
                {t({ en: 'AI Recommendations:', ar: 'توصيات الذكاء الاصطناعي:' })}
              </h4>
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600 text-white">#{idx + 1}</Badge>
                    <p className="font-medium text-sm text-slate-900 capitalize">{suggestion.field.replace(/_/g, ' ')}</p>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{suggestion.impact_description}</p>
                  <p className="text-xs text-slate-600 bg-white p-2 rounded border italic">
                    {t({ en: 'Example:', ar: 'مثال:' })} {suggestion.example}
                  </p>
                </div>
              ))}
            </div>
          )}

          {completeness === 100 && (
            <div className="text-center py-6 bg-green-50 rounded-lg border-2 border-green-300">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900">
                {t({ en: '✨ Profile Complete!', ar: '✨ الملف مكتمل!' })}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {t({ en: 'Your profile stands out!', ar: 'ملفك مميز!' })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
