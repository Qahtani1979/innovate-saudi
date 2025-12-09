import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Award, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function IPCommercializationTracker({ project }) {
  const { language, t } = useLanguage();
  const [assessment, setAssessment] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const analyzeCommercial = async () => {
    const result = await invokeAI({
      prompt: `Analyze commercialization potential for this R&D project:

Title: ${project.title_en}
Research Area: ${project.research_area_en}
TRL: ${project.trl_current}
Patents: ${project.patents?.length || 0}
Publications: ${project.publications?.length || 0}
Outputs: ${project.expected_outputs?.map(o => o.output_en).join(', ')}

Assess:
1. Commercial potential (0-100)
2. Recommended pathway (startup formation, licensing, tech transfer)
3. Market size estimate
4. Potential licensees (startup types)
5. Timeline to market`,
      response_json_schema: {
        type: "object",
        properties: {
          commercial_score: { type: "number" },
          pathway: { type: "string" },
          market_size: { type: "string" },
          potential_licensees: { type: "array", items: { type: "string" } },
          timeline: { type: "string" },
          next_steps: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (result.success) {
      setAssessment(result.data);
      toast.success(t({ en: 'Assessment complete', ar: 'التقييم مكتمل' }));
    }
  };

  const patents = project.patents || [];

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            {t({ en: 'IP & Commercialization', ar: 'الملكية الفكرية والتسويق' })}
          </CardTitle>
          <Button onClick={analyzeCommercial} disabled={isLoading || !isAvailable} size="sm" className="bg-purple-600">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Assess Potential', ar: 'تقييم الإمكانية' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {/* Patent Pipeline */}
        <div>
          <h4 className="font-semibold text-sm text-slate-900 mb-3">
            {t({ en: '📋 Patent Pipeline', ar: '📋 خط براءات الاختراع' })}
          </h4>
          {patents.length > 0 ? (
            <div className="space-y-2">
              {patents.map((patent, i) => (
                <div key={i} className="p-3 bg-white rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-slate-900">{patent.title}</p>
                    <Badge className={patent.status === 'granted' ? 'bg-green-600' : 'bg-amber-600'}>
                      {patent.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">Number: {patent.number || 'Pending'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              {t({ en: 'No patents yet', ar: 'لا براءات حتى الآن' })}
            </p>
          )}
        </div>

        {/* Commercial Assessment */}
        {assessment && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-purple-900">{t({ en: 'Commercial Potential', ar: 'الإمكانية التجارية' })}</h4>
                <Badge className="bg-purple-600 text-lg">{assessment.commercial_score}/100</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-purple-700 font-semibold">{t({ en: 'Pathway:', ar: 'المسار:' })}</p>
                  <p className="text-slate-700">{assessment.pathway}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 font-semibold">{t({ en: 'Market Size:', ar: 'حجم السوق:' })}</p>
                  <p className="text-slate-700">{assessment.market_size}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 font-semibold">{t({ en: 'Timeline:', ar: 'الجدول:' })}</p>
                  <p className="text-slate-700">{assessment.timeline}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded border">
              <p className="text-xs text-blue-700 font-semibold mb-2">{t({ en: 'Potential Licensees:', ar: 'المرخص لهم المحتملون:' })}</p>
              <div className="flex flex-wrap gap-1">
                {assessment.potential_licensees?.map((lic, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{lic}</Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded border">
              <p className="text-xs text-green-700 font-semibold mb-2">{t({ en: 'Next Steps:', ar: 'الخطوات التالية:' })}</p>
              <ul className="space-y-1">
                {assessment.next_steps?.map((step, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
