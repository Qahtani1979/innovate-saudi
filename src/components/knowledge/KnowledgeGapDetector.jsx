import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Sparkles, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function KnowledgeGapDetector() {
  const { language, t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [gaps, setGaps] = useState([]);

  const { data: documents = [] } = useQuery({
    queryKey: ['knowledge-documents'],
    queryFn: () => base44.entities.KnowledgeDocument.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const detectGaps = async () => {
    setAnalyzing(true);
    try {
      const sectorCoverage = {};
      documents.forEach(doc => {
        const sector = doc.sector || 'general';
        sectorCoverage[sector] = (sectorCoverage[sector] || 0) + 1;
      });

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Identify knowledge documentation gaps:

CURRENT DOCUMENTATION:
${Object.entries(sectorCoverage).map(([sector, count]) => `- ${sector}: ${count} docs`).join('\n')}

PLATFORM ACTIVITY:
- Challenges: ${challenges.length} (sectors: ${challenges.map(c => c.sector).filter(Boolean).slice(0, 5).join(', ')})
- Pilots: ${pilots.length}
- Completed pilots: ${pilots.filter(p => p.stage === 'completed').length} (many lack case studies)

Identify:
1. Sectors with insufficient documentation
2. Missing content types (no case studies for sector X, no playbooks for Y)
3. High-priority gaps (active pilots without lessons learned)
4. Content creation priorities`,
        response_json_schema: {
          type: "object",
          properties: {
            gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap_type: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  suggested_content: { type: "string" },
                  impact: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGaps(response.gaps || []);
      toast.success(t({ en: `${response.gaps?.length || 0} gaps identified`, ar: `${response.gaps?.length || 0} فجوة محددة` }));
    } catch (error) {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 border-yellow-300">
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            {t({ en: 'Knowledge Gap Detector', ar: 'كاشف فجوات المعرفة' })}
          </CardTitle>
          <Button onClick={detectGaps} disabled={analyzing} size="sm" className="bg-yellow-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Detect Gaps', ar: 'كشف الفجوات' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!gaps.length && !analyzing && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI identifies missing documentation and content priorities', ar: 'الذكاء يحدد التوثيق المفقود وأولويات المحتوى' })}
            </p>
          </div>
        )}

        {gaps.length > 0 && (
          <div className="space-y-3">
            {gaps.map((gap, idx) => {
              const priorityColors = {
                high: 'bg-red-100 text-red-700',
                medium: 'bg-yellow-100 text-yellow-700',
                low: 'bg-blue-100 text-blue-700'
              };

              return (
                <div key={idx} className={`p-4 rounded-lg border-2 ${
                  gap.priority === 'high' ? 'border-red-300 bg-red-50' :
                  gap.priority === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                  'border-blue-300 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={priorityColors[gap.priority]}>
                          {gap.priority?.toUpperCase()}
                        </Badge>
                        <p className="font-medium text-sm text-slate-900">{gap.gap_type}</p>
                      </div>
                      <p className="text-sm text-slate-700">{gap.description}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border mt-2">
                    <p className="text-xs font-semibold text-slate-900 mb-1">
                      {t({ en: 'Suggested Content:', ar: 'المحتوى المقترح:' })}
                    </p>
                    <p className="text-sm text-slate-700">{gap.suggested_content}</p>
                  </div>

                  <div className="p-2 bg-green-50 rounded border border-green-300 mt-2">
                    <p className="text-xs text-green-900">
                      <strong>{t({ en: 'Impact:', ar: 'التأثير:' })}</strong> {gap.impact}
                    </p>
                  </div>

                  <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Plus className="h-3 w-3 mr-1" />
                    {t({ en: 'Create Content', ar: 'إنشاء المحتوى' })}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}