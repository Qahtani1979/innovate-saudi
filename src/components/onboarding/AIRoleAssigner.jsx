import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIRoleAssigner({ userEmail, userName, organization }) {
  const { language, t } = useLanguage();
  const [suggestions, setSuggestions] = useState([]);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  useEffect(() => {
    if (userEmail && isAvailable) {
      predictRole();
    }
  }, [userEmail, isAvailable]);

  const predictRole = async () => {
    const emailDomain = userEmail.split('@')[1];
    
    const response = await invokeAI({
      prompt: `Determine optimal platform role based on user profile:

EMAIL: ${userEmail}
DOMAIN: ${emailDomain}
NAME: ${userName}
ORGANIZATION: ${organization || 'Not specified'}

Role options:
- admin: GDISB platform administrators
- municipality_admin: Municipality innovation directors/managers
- startup_user: Startup founders, solution providers
- researcher: University professors, R&D professionals
- program_operator: Accelerator/program managers
- user: General users

Analyze:
1. Email domain patterns (gov.sa → municipality, .edu.sa → academia)
2. Organization type
3. Likely responsibilities

Return top 3 role suggestions with confidence scores and reasoning.`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string" },
                confidence: { type: "number" },
                reasoning: { type: "string" }
              }
            }
          }
        }
      }
    });

    if (response.success && response.data?.suggestions) {
      setSuggestions(response.data.suggestions);
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
          {t({ en: 'AI Role Assignment', ar: 'تعيين الدور بالذكاء الاصطناعي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
        
        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-slate-600">{t({ en: 'Analyzing profile...', ar: 'تحليل الملف...' })}</p>
          </div>
        )}

        {!isLoading && suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 ${
                idx === 0 ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900 capitalize">
                        {suggestion.role.replace(/_/g, ' ')}
                      </p>
                      {idx === 0 && <Badge className="bg-green-100 text-green-700">Recommended</Badge>}
                    </div>
                    <p className="text-sm text-slate-600">{suggestion.reasoning}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-2xl font-bold text-blue-600">{suggestion.confidence}%</p>
                    <p className="text-xs text-slate-500">{t({ en: 'Confidence', ar: 'ثقة' })}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-3 bg-blue-50 rounded border border-blue-300">
              <p className="text-xs text-blue-900">
                💡 {t({ en: 'Admin can review and adjust role assignment if needed', ar: 'المسؤول يمكنه مراجعة وتعديل تعيين الدور إذا لزم الأمر' })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
