import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function PilotLearningEngine({ pilot }) {
  const { language, t } = useLanguage();
  const [finding, setFinding] = useState(false);
  const [similarPilots, setSimilarPilots] = useState(null);

  const { data: allPilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
    initialData: []
  });

  const findSimilar = async () => {
    setFinding(true);
    try {
      const completed = allPilots.filter(p => 
        p.stage === 'completed' && 
        p.id !== pilot.id &&
        p.sector === pilot.sector
      );

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Find similar pilots and extract learnings:

CURRENT PILOT: ${pilot.title_en}
SECTOR: ${pilot.sector}
OBJECTIVE: ${pilot.objective_en || 'N/A'}

COMPLETED PILOTS IN SECTOR (${completed.length}):
${completed.slice(0, 5).map(p => `
${p.title_en}
Success: ${p.recommendation}
KPIs: ${p.kpis?.map(k => `${k.name}: ${k.current}`).join(', ')}
Lessons: ${p.lessons_learned?.map(l => l.lesson).slice(0, 2).join('; ')}
`).join('\n')}

Provide:
1. Top 3 most similar pilots
2. Key lessons from each
3. Best practices to adopt
4. Pitfalls to avoid`,
        response_json_schema: {
          type: "object",
          properties: {
            similar_pilots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pilot_name: { type: "string" },
                  similarity_score: { type: "number" },
                  key_lessons: { type: "array", items: { type: "string" } },
                  approach_used: { type: "string" }
                }
              }
            },
            best_practices: { type: "array", items: { type: "string" } },
            pitfalls_to_avoid: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSimilarPilots(response);
      toast.success(t({ en: 'Similar pilots found', ar: 'تجارب مشابهة وُجدت' }));
    } catch (error) {
      toast.error(t({ en: 'Search failed', ar: 'فشل البحث' }));
    } finally {
      setFinding(false);
    }
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-600" />
            {t({ en: 'Learning from Similar Pilots', ar: 'التعلم من التجارب المشابهة' })}
          </CardTitle>
          <Button onClick={findSimilar} disabled={finding} size="sm" className="bg-teal-600">
            {finding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Find', ar: 'ابحث' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!similarPilots && !finding && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-teal-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI finds similar successful pilots and extracts actionable lessons', ar: 'الذكاء يجد تجارب ناجحة مشابهة ويستخرج دروساً قابلة للتنفيذ' })}
            </p>
          </div>
        )}

        {similarPilots && (
          <div className="space-y-4">
            {similarPilots.similar_pilots?.slice(0, 3).map((sim, i) => (
              <div key={i} className="p-4 bg-white rounded border-2 border-teal-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{sim.pilot_name}</h4>
                  <Badge className="bg-teal-600">{sim.similarity_score}% match</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{sim.approach_used}</p>
                {sim.key_lessons?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-slate-700 mb-1">{t({ en: 'Key Lessons:', ar: 'الدروس الرئيسية:' })}</p>
                    <ul className="space-y-1">
                      {sim.key_lessons.map((lesson, j) => (
                        <li key={j} className="text-xs text-slate-600">• {lesson}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {similarPilots.best_practices?.length > 0 && (
              <div className="p-4 bg-green-50 rounded border-2 border-green-300">
                <h4 className="font-semibold text-sm text-green-900 mb-2">
                  {t({ en: '✅ Best Practices to Adopt', ar: '✅ أفضل الممارسات للاعتماد' })}
                </h4>
                <ul className="space-y-1">
                  {similarPilots.best_practices.map((practice, i) => (
                    <li key={i} className="text-sm text-slate-700">✓ {practice}</li>
                  ))}
                </ul>
              </div>
            )}

            {similarPilots.pitfalls_to_avoid?.length > 0 && (
              <div className="p-4 bg-red-50 rounded border-2 border-red-300">
                <h4 className="font-semibold text-sm text-red-900 mb-2">
                  {t({ en: '⚠️ Pitfalls to Avoid', ar: '⚠️ المزالق لتجنبها' })}
                </h4>
                <ul className="space-y-1">
                  {similarPilots.pitfalls_to_avoid.map((pitfall, i) => (
                    <li key={i} className="text-sm text-slate-700">⚠️ {pitfall}</li>
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