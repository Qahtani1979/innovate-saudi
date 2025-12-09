import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Network, Loader2, Zap } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
export default function CausalGraphVisualizer({ challenge }) {
  const { language, isRTL, t } = useLanguage();
  const [graph, setGraph] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateCausalGraph = async () => {
    const prompt = `Analyze this municipal challenge and build a causal graph showing root causes, intermediate factors, and the main problem:

Challenge: ${challenge.title_en}
Description: ${challenge.description_en}
Root Causes: ${JSON.stringify(challenge.root_causes || [])}
Sector: ${challenge.sector}

Create a causal graph structure showing:
1. Deep root causes (fundamental issues)
2. Intermediate factors (contributing causes)
3. Direct causes (immediate triggers)
4. The main problem

Return as hierarchical structure for visualization.`;

    const response = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          deep_roots: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                cause: { type: 'string' },
                impact_level: { type: 'string' }
              }
            }
          },
          intermediate: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                factor: { type: 'string' },
                connected_to: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          direct_causes: {
            type: 'array',
            items: { type: 'string' }
          },
          relationships: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                to: { type: 'string' },
                strength: { type: 'string' }
              }
            }
          }
        }
      }
    });

    if (response.success && response.data) {
      setGraph(response.data);
    }
  };

  return (
    <Card className="border-2 border-purple-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            {t({ en: 'Causal Graph', ar: 'الرسم البياني السببي' })}
          </CardTitle>
          {!graph && (
            <Button size="sm" onClick={generateCausalGraph} disabled={isLoading || !isAvailable}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {t({ en: 'Generate', ar: 'توليد' })}
            </Button>
          )}
        </div>
      </CardHeader>
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mx-6 mb-2" />
      {graph && (
        <CardContent className="space-y-4">
          {/* Deep Roots */}
          {graph.deep_roots?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-purple-900 mb-2">
                {t({ en: '🌳 Deep Root Causes', ar: '🌳 الأسباب الجذرية العميقة' })}
              </p>
              <div className="space-y-2">
                {graph.deep_roots.map((root, i) => (
                  <div key={i} className="p-3 bg-purple-50 rounded-lg border-2 border-purple-300">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-slate-900 font-medium">{root.cause}</p>
                      <Badge className="bg-purple-600 text-xs">{root.impact_level}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intermediate Factors */}
          {graph.intermediate?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-2">
                {t({ en: '🔗 Intermediate Factors', ar: '🔗 العوامل الوسيطة' })}
              </p>
              <div className="space-y-2">
                {graph.intermediate.map((factor, i) => (
                  <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-slate-900">{factor.factor}</p>
                    {factor.connected_to?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {factor.connected_to.map((conn, ci) => (
                          <Badge key={ci} variant="outline" className="text-xs">{conn}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Causes */}
          {graph.direct_causes?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-900 mb-2">
                {t({ en: '⚡ Direct Causes', ar: '⚡ الأسباب المباشرة' })}
              </p>
              <div className="space-y-1">
                {graph.direct_causes.map((cause, i) => (
                  <div key={i} className="p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-slate-900">{cause}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relationships */}
          {graph.relationships?.length > 0 && (
            <div className="mt-4 p-3 bg-slate-50 rounded border">
              <p className="text-xs font-semibold text-slate-900 mb-2">
                {t({ en: 'Causal Relationships', ar: 'العلاقات السببية' })}
              </p>
              <div className="space-y-1">
                {graph.relationships.map((rel, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-700">{rel.from}</span>
                    <span className="text-slate-400">→</span>
                    <Badge variant="outline" className="text-xs">{rel.strength}</Badge>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-700">{rel.to}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}