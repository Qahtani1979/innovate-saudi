import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import {
  buildTaxonomyGeneratorPrompt,
  taxonomyGeneratorSchema,
  TAXONOMY_GENERATOR_SYSTEM_PROMPT
} from '@/lib/ai/prompts/taxonomy';

import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useSolutions } from '@/hooks/useSolutions';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import { useTaxonomyMutations } from '@/hooks/useTaxonomyMutations';

export default function AITaxonomyGenerator({ onGenerate }) {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState(null);
  const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();

  // Hooks for data
  const { data: challenges = [] } = useChallengesWithVisibility({ limit: 100 });
  const { solutions = [] } = useSolutions({ limit: 100 });
  const { sectors } = useTaxonomy();

  // Hooks for mutations
  const { createSector, createSubsector, createService } = useTaxonomyMutations();

  const generateTaxonomy = async () => {
    // Data is already fetched by hooks, but we might want to wait if loading?
    // Since we are in an event handler, we use current values. 
    // Ideally we disable button if loading, but for now we assume data is there or partial.

    const result = await invokeAI({
      system_prompt: getSystemPrompt(TAXONOMY_GENERATOR_SYSTEM_PROMPT),
      prompt: buildTaxonomyGeneratorPrompt(sectors, challenges, solutions),
      response_json_schema: taxonomyGeneratorSchema
    });

    if (result.success) {
      setSuggestions(result.data);
    } else {
      toast.error(t({ en: 'Generation failed', ar: 'فشل التوليد' }));
    }
  };

  const applySuggestion = async (type, item) => {
    try {
      if (type === 'sector') {
        await createSector.mutateAsync({
          name_en: item.name_en,
          name_ar: item.name_ar,
          code: item.code,
          description_en: item.rationale,
          is_active: true
        });
      } else if (type === 'subsector') {
        // Find sector by name (case insensitive?)
        const sector = sectors.find(s => s.name_en === item.sector_name);
        if (sector) {
          await createSubsector.mutateAsync({
            sector_id: sector.id,
            name_en: item.subsector_name_en,
            name_ar: item.subsector_name_ar,
            code: `${sector.code}-${item.subsector_name_en.substring(0, 3).toUpperCase()}`,
            description_en: item.rationale,
            is_active: true
          });
        } else {
          toast.error(t({ en: 'Sector not found', ar: 'القطاع غير موجود' }));
          return;
        }
      } else if (type === 'service') {
        const sector = sectors.find(s => s.name_en === item.sector);

        await createService.mutateAsync({
          name_en: item.name_en,
          name_ar: item.name_ar,
          sector_id: sector?.id, // Legacy behavior
          description_en: item.rationale,
          code: `SRV-${item.name_en.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`
        });
      }

      toast.success(t({ en: 'Taxonomy updated', ar: 'تم تحديث التصنيف' }));
      if (onGenerate) onGenerate();
    } catch (error) {
      console.error(error);
      toast.error(t({ en: 'Failed to apply', ar: 'فشل التطبيق' }));
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Taxonomy Intelligence', ar: 'ذكاء التصنيف الآلي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} error={undefined} />
        {!suggestions && (
          <div className="text-center py-8">
            <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'AI will analyze your data and suggest taxonomy improvements', ar: 'سيقوم الذكاء بتحليل بياناتك واقتراح تحسينات التصنيف' })}
            </p>
            <Button onClick={generateTaxonomy} disabled={generating || !isAvailable} className="gap-2">
              {generating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {t({ en: 'Analyzing...', ar: 'يحلل...' })}
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  {t({ en: 'Generate Suggestions', ar: 'إنشاء اقتراحات' })}
                </>
              )}
            </Button>
          </div>
        )}

        {suggestions && (
          <div className="space-y-4">
            {suggestions.missing_sectors?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">{t({ en: 'Missing Sectors', ar: 'قطاعات ناقصة' })}</h4>
                <div className="space-y-2">
                  {suggestions.missing_sectors.map((sector, i) => (
                    <div key={i} className="p-3 bg-blue-50 rounded border border-blue-200 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sector.name_en} / {sector.name_ar}</p>
                        <p className="text-xs text-slate-600 mt-1">{sector.rationale}</p>
                      </div>
                      <Button size="sm" onClick={() => applySuggestion('sector', sector)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {t({ en: 'Add', ar: 'إضافة' })}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.missing_services?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">{t({ en: 'Missing Services', ar: 'خدمات ناقصة' })}</h4>
                <div className="space-y-2">
                  {suggestions.missing_services.slice(0, 5).map((service, i) => (
                    <div key={i} className="p-3 bg-green-50 rounded border border-green-200 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{service.name_en}</p>
                        <p className="text-xs text-slate-600">{service.sector} • {service.rationale}</p>
                      </div>
                      <Button size="sm" onClick={() => applySuggestion('service', service)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {t({ en: 'Add', ar: 'إضافة' })}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {suggestions.taxonomy_gaps?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded border border-amber-200">
                <h4 className="font-semibold text-sm text-amber-900 mb-2">{t({ en: 'Taxonomy Gaps', ar: 'فجوات التصنيف' })}</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  {suggestions.taxonomy_gaps.map((gap, i) => (
                    <li key={i}>• {gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}