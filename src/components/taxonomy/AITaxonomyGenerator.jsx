import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AITaxonomyGenerator({ onGenerate }) {
  const { t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateTaxonomy = async () => {
    setGenerating(true);
    try {
      const [challenges, solutions, sectors] = await Promise.all([
        base44.entities.Challenge.list(),
        base44.entities.Solution.list(),
        base44.entities.Sector.list()
      ]);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the platform data and suggest taxonomy improvements:

Current Sectors (${sectors.length}): ${sectors.map(s => s.name_en).join(', ')}
Total Challenges: ${challenges.length}
Total Solutions: ${solutions.length}

Challenge themes: ${[...new Set(challenges.flatMap(c => c.keywords || []))].slice(0, 20).join(', ')}
Solution categories: ${[...new Set(solutions.flatMap(s => s.categories || []))].slice(0, 20).join(', ')}

Provide:
1. Missing sectors (sectors that should exist based on challenge/solution patterns)
2. Suggested subsectors for each existing sector
3. Missing services (municipal services not in catalog)
4. Taxonomy gaps (areas with many challenges but no clear sector)
5. Consolidation opportunities (overlapping sectors/services)`,
        response_json_schema: {
          type: 'object',
          properties: {
            missing_sectors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name_en: { type: 'string' },
                  name_ar: { type: 'string' },
                  code: { type: 'string' },
                  rationale: { type: 'string' }
                }
              }
            },
            suggested_subsectors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sector_name: { type: 'string' },
                  subsector_name_en: { type: 'string' },
                  subsector_name_ar: { type: 'string' },
                  rationale: { type: 'string' }
                }
              }
            },
            missing_services: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name_en: { type: 'string' },
                  name_ar: { type: 'string' },
                  sector: { type: 'string' },
                  rationale: { type: 'string' }
                }
              }
            },
            taxonomy_gaps: { type: 'array', items: { type: 'string' } },
            consolidation_opportunities: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setSuggestions(result);
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل التوليد' }));
    }
    setGenerating(false);
  };

  const applySuggestion = async (type, item) => {
    try {
      if (type === 'sector') {
        await base44.entities.Sector.create({
          name_en: item.name_en,
          name_ar: item.name_ar,
          code: item.code,
          description_en: item.rationale,
          is_active: true
        });
      } else if (type === 'subsector') {
        const sector = await base44.entities.Sector.filter({ name_en: item.sector_name });
        if (sector[0]) {
          await base44.entities.Subsector.create({
            sector_id: sector[0].id,
            name_en: item.subsector_name_en,
            name_ar: item.subsector_name_ar,
            code: `${sector[0].code}-${item.subsector_name_en.substring(0, 3).toUpperCase()}`,
            description_en: item.rationale,
            is_active: true
          });
        }
      } else if (type === 'service') {
        const sector = await base44.entities.Sector.filter({ name_en: item.sector });
        await base44.entities.Service.create({
          name_en: item.name_en,
          name_ar: item.name_ar,
          sector_id: sector[0]?.id,
          description_en: item.rationale,
          code: `SRV-${item.name_en.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`
        });
      }

      toast.success(t({ en: 'Taxonomy updated', ar: 'تم تحديث التصنيف' }));
      if (onGenerate) onGenerate();
    } catch (error) {
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
        {!suggestions && (
          <div className="text-center py-8">
            <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'AI will analyze your data and suggest taxonomy improvements', ar: 'سيقوم الذكاء بتحليل بياناتك واقتراح تحسينات التصنيف' })}
            </p>
            <Button onClick={generateTaxonomy} disabled={generating} className="gap-2">
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