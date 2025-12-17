import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { FileText, Sparkles, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildNarrativeGeneratorPrompt, 
  narrativeGeneratorSchema,
  NARRATIVE_GENERATOR_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/strategy';

export default function StrategicNarrativeGenerator({ planId }) {
  const { language, t } = useLanguage();
  const [narrative, setNarrative] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const { data: plan } = useQuery({
    queryKey: ['strategic-plan-narrative', planId],
    queryFn: async () => {
      if (!planId) return null;
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', planId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!planId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-narrative'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('id, status')
        .eq('is_deleted', false);
      if (error) return [];
      return data || [];
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-narrative'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, status')
        .eq('is_deleted', false);
      if (error) return [];
      return data || [];
    }
  });

  const generateNarrative = async () => {
    try {
      const response = await invokeAI({
        system_prompt: getSystemPrompt(NARRATIVE_GENERATOR_SYSTEM_PROMPT),
        prompt: buildNarrativeGeneratorPrompt(plan, pilots, challenges),
        response_json_schema: narrativeGeneratorSchema
      });

      if (response.success) {
        setNarrative(response.data);
      }
    } catch (err) {
      toast.error(t({ en: 'Failed to generate narrative', ar: 'فشل في إنشاء السرد' }));
    }
  };

  const downloadNarrative = () => {
    if (!narrative) return;
    
    const content = `# ${narrative.title_en}\n\n${narrative.vision_section}\n\n${narrative.context_section}\n\n${narrative.journey_section}\n\n${narrative.impact_section}\n\n${narrative.future_section}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'strategic-narrative.md';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    toast.success(t({ en: 'Downloaded', ar: 'تم التنزيل' }));
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Strategic Narrative', ar: 'السرد الاستراتيجي' })}
          </CardTitle>
          {!narrative && (
            <Button onClick={generateNarrative} disabled={isLoading || !isAvailable} size="sm" className="bg-indigo-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate', ar: 'توليد' })}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!narrative && !isLoading && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {t({ en: 'AI writes a compelling strategic story from your data', ar: 'الذكاء يكتب قصة استراتيجية مقنعة من بياناتك' })}
            </p>
          </div>
        )}

        {narrative && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
              <div>
                <h3 className="font-bold text-indigo-900 text-lg">{narrative.title_en}</h3>
                <p className="text-sm text-indigo-700 mt-1">{narrative.title_ar}</p>
              </div>
              <Button onClick={downloadNarrative} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Download', ar: 'تنزيل' })}
              </Button>
            </div>

            <div className="prose prose-sm max-w-none">
              <div className="space-y-4">
                <div className="p-4 bg-background rounded border">
                  <h4 className="font-bold mb-2">
                    {t({ en: '🎯 Vision', ar: '🎯 الرؤية' })}
                  </h4>
                  <ReactMarkdown>{narrative.vision_section}</ReactMarkdown>
                </div>

                <div className="p-4 bg-background rounded border">
                  <h4 className="font-bold mb-2">
                    {t({ en: '📍 Current State', ar: '📍 الحالة الحالية' })}
                  </h4>
                  <ReactMarkdown>{narrative.context_section}</ReactMarkdown>
                </div>

                <div className="p-4 bg-background rounded border">
                  <h4 className="font-bold mb-2">
                    {t({ en: '🚀 The Journey', ar: '🚀 الرحلة' })}
                  </h4>
                  <ReactMarkdown>{narrative.journey_section}</ReactMarkdown>
                </div>

                <div className="p-4 bg-background rounded border">
                  <h4 className="font-bold mb-2">
                    {t({ en: '⭐ Impact & Achievements', ar: '⭐ التأثير والإنجازات' })}
                  </h4>
                  <ReactMarkdown>{narrative.impact_section}</ReactMarkdown>
                </div>

                <div className="p-4 bg-background rounded border">
                  <h4 className="font-bold mb-2">
                    {t({ en: '🔮 The Road Ahead', ar: '🔮 الطريق القادم' })}
                  </h4>
                  <ReactMarkdown>{narrative.future_section}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}