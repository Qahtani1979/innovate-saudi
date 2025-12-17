import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  buildCrossProgramSynergyPrompt, 
  crossProgramSynergySchema,
  CROSS_PROGRAM_SYNERGY_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/programs';

export default function CrossProgramSynergy({ programs }) {
  const { language, t } = useLanguage();
  const [synergies, setSynergies] = useState(null);
  const { invokeAI, status, isLoading: finding, isAvailable, rateLimitInfo } = useAIWithFallback();

  const findSynergies = async () => {
    const result = await invokeAI({
      prompt: buildCrossProgramSynergyPrompt(programs),
      response_json_schema: crossProgramSynergySchema,
      system_prompt: CROSS_PROGRAM_SYNERGY_SYSTEM_PROMPT
    });

    if (result.success && result.data) {
      const data = result.data;
      // Map bilingual fields based on language
      setSynergies({
        collaborations: language === 'ar' ? data.collaborations_ar : data.collaborations_en,
        shared_resources: language === 'ar' ? data.shared_resources_ar : data.shared_resources_en,
        joint_events: language === 'ar' ? data.joint_events_ar : data.joint_events_en,
        knowledge_transfer: language === 'ar' ? data.knowledge_transfer_ar : data.knowledge_transfer_en,
        combined_impact: language === 'ar' ? data.combined_impact_ar : data.combined_impact_en
      });
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
            {synergies.joint_events?.length > 0 && (
              <div className="p-3 bg-purple-50 rounded border">
                <p className="text-xs font-semibold text-purple-900 mb-2">{t({ en: 'Joint Events:', ar: 'الفعاليات المشتركة:' })}</p>
                <ul className="space-y-1">
                  {synergies.joint_events?.map((e, i) => (
                    <li key={i} className="text-xs text-purple-700">• {e}</li>
                  ))}
                </ul>
              </div>
            )}
            {synergies.combined_impact && (
              <div className="p-3 bg-amber-50 rounded border">
                <p className="text-xs font-semibold text-amber-900 mb-1">{t({ en: 'Combined Impact:', ar: 'التأثير المشترك:' })}</p>
                <p className="text-xs text-amber-700">{synergies.combined_impact}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}