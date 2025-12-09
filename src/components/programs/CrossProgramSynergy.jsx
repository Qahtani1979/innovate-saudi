import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function CrossProgramSynergy() {
  const { language, t } = useLanguage();
  const [synergies, setSynergies] = useState(null);
  const { invokeAI, status, isLoading: finding, isAvailable, rateLimitInfo } = useAIWithFallback();

  const findSynergies = async () => {
    const result = await invokeAI({
      prompt: `Identify synergies across programs:

Programs:
- AI Accelerator (15 startups, focus: smart city AI)
- GovTech Fellowship (12 participants, focus: digital services)
- Civic Innovation Hackathon (8 teams, focus: community solutions)

Find:
1. Potential cross-program collaborations
2. Shared resource opportunities
3. Joint events or showcases`,
      response_json_schema: {
        type: "object",
        properties: {
          collaborations: { type: "array", items: { type: "string" } },
          shared_resources: { type: "array", items: { type: "string" } },
          joint_events: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (result.success) {
      setSynergies(result.data);
      toast.success(t({ en: 'Synergies found', ar: 'التآزر مُحدد' }));
    }
  };

  return (
    <Card className="border-2 border-pink-300">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-pink-600" />
            {t({ en: 'Cross-Program Synergy', ar: 'التآزر عبر البرامج' })}
          </CardTitle>
          <Button onClick={findSynergies} disabled={finding || !isAvailable} size="sm" className="bg-pink-600">
            {finding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Find', ar: 'إيجاد' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
        {synergies && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded border">
              <p className="text-xs font-semibold text-blue-900 mb-2">{t({ en: 'Collaborations:', ar: 'التعاون:' })}</p>
              <ul className="space-y-1">
                {synergies.collaborations?.map((c, i) => (
                  <li key={i} className="text-xs text-blue-700">• {c}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-green-50 rounded border">
              <p className="text-xs font-semibold text-green-900 mb-2">{t({ en: 'Shared Resources:', ar: 'الموارد المشتركة:' })}</p>
              <ul className="space-y-1">
                {synergies.shared_resources?.map((r, i) => (
                  <li key={i} className="text-xs text-green-700">• {r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}