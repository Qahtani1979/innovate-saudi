import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Sparkles, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function SuccessPatternAnalyzer({ sector }) {
  const { language, t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState(null);

  const { data: pilots = [] } = useQuery({
    queryKey: ['successful-pilots', sector],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => 
        p.sector === sector && 
        ['completed', 'scaled'].includes(p.stage) &&
        p.recommendation === 'scale'
      );
    },
    initialData: []
  });

  const analyzePatterns = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze success patterns from ${pilots.length} successful pilots in ${sector} sector:

${pilots.slice(0, 10).map(p => `
PILOT: ${p.title_en}
Team Size: ${p.team?.length || 'N/A'}
Budget: ${p.budget || 'N/A'} SAR
Duration: ${p.duration_weeks || 'N/A'} weeks
KPIs Achieved: ${p.kpis?.filter(k => k.status === 'achieved').length}/${p.kpis?.length}
TRL: ${p.trl_start} → ${p.trl_current}
`).join('\n')}

Identify:
1. Common success factors (team structure, budget ranges, methodologies)
2. Optimal team size and composition
3. Typical duration for success
4. Budget efficiency patterns
5. Key methodologies used
6. Critical success criteria`,
        response_json_schema: {
          type: "object",
          properties: {
            optimal_team_size: { type: "string" },
            avg_duration_weeks: { type: "number" },
            avg_budget_range: { type: "string" },
            common_methodologies: { type: "array", items: { type: "string" } },
            success_factors: { type: "array", items: { type: "string" } },
            critical_criteria: { type: "array", items: { type: "string" } },
            replication_template: { type: "string" }
          }
        }
      });

      setPatterns(response);
      toast.success(t({ en: 'Patterns identified', ar: 'الأنماط محددة' }));
    } catch (error) {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            {t({ en: 'Success Pattern Analyzer', ar: 'محلل أنماط النجاح' })}
          </CardTitle>
          <Button onClick={analyzePatterns} disabled={analyzing || pilots.length === 0} size="sm" className="bg-purple-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!patterns && !analyzing && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: `Analyzing ${pilots.length} successful pilots to identify winning patterns`, ar: `تحليل ${pilots.length} تجربة ناجحة لتحديد الأنماط الفائزة` })}
            </p>
          </div>
        )}

        {patterns && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 text-center">
                <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{patterns.optimal_team_size}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Team Size', ar: 'حجم الفريق' })}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 text-center">
                <p className="text-2xl font-bold text-green-600">{patterns.avg_duration_weeks}w</p>
                <p className="text-xs text-slate-600">{t({ en: 'Duration', ar: 'المدة' })}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300 text-center">
                <p className="text-lg font-bold text-amber-600">{patterns.avg_budget_range}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
              </div>
            </div>

            {patterns.success_factors?.length > 0 && (
              <div className="p-4 bg-green-50 rounded border-2 border-green-300">
                <h4 className="font-semibold text-sm text-green-900 mb-2">
                  {t({ en: '🎯 Success Factors', ar: '🎯 عوامل النجاح' })}
                </h4>
                <ul className="space-y-1">
                  {patterns.success_factors.map((factor, i) => (
                    <li key={i} className="text-sm text-slate-700">✓ {factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {patterns.common_methodologies?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded border-2 border-blue-300">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  {t({ en: '⚙️ Common Methodologies', ar: '⚙️ المنهجيات الشائعة' })}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patterns.common_methodologies.map((method, i) => (
                    <Badge key={i} className="bg-blue-600">{method}</Badge>
                  ))}
                </div>
              </div>
            )}

            {patterns.replication_template && (
              <div className="p-4 bg-purple-50 rounded border-2 border-purple-300">
                <h4 className="font-semibold text-sm text-purple-900 mb-2">
                  {t({ en: '📋 Replication Template', ar: '📋 قالب التكرار' })}
                </h4>
                <p className="text-sm text-slate-700">{patterns.replication_template}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}