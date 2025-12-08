import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Award, Lightbulb, TestTube, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAlumniSuggester({ program, applications }) {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    const graduates = applications?.filter(a => a.status === 'accepted') || [];
    
    if (graduates.length === 0) {
      toast.error(t({ en: 'No graduates available', ar: 'لا يوجد خريجون' }));
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze program graduates and suggest next steps:

Program: ${program.name_en}
Type: ${program.program_type}
Focus: ${program.focus_areas?.join(', ') || 'N/A'}
Graduates: ${graduates.length}

Based on program focus and graduate profiles, suggest:
1. Which graduates should launch solutions in marketplace
2. Which graduates should pilot their innovations
3. Potential partnerships between graduates and municipalities
4. Alumni who could mentor next cohort`,
        response_json_schema: {
          type: 'object',
          properties: {
            solution_candidates: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, reason: { type: 'string' }, solution_potential: { type: 'string' } } } },
            pilot_candidates: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, reason: { type: 'string' }, pilot_idea: { type: 'string' } } } },
            partnership_opportunities: { type: 'array', items: { type: 'object', properties: { graduate: { type: 'string' }, municipality: { type: 'string' }, opportunity: { type: 'string' } } } },
            mentor_candidates: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setSuggestions(result);
      toast.success(t({ en: 'Suggestions generated', ar: 'تم توليد الاقتراحات' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate suggestions', ar: 'فشل توليد الاقتراحات' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-teal-900">
            <Award className="h-5 w-5" />
            {t({ en: 'AI Alumni Suggester', ar: 'مقترح الخريجين الذكي' })}
          </CardTitle>
          <Button onClick={generateSuggestions} disabled={loading} size="sm">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Suggest Paths', ar: 'اقتراح المسارات' })}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {suggestions && (
        <CardContent className="space-y-4">
          {suggestions.solution_candidates?.length > 0 && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-1">
                <Lightbulb className="h-4 w-4" />
                {t({ en: 'Solution Marketplace Candidates', ar: 'مرشحو سوق الحلول' })}
              </p>
              <div className="space-y-2">
                {suggestions.solution_candidates.slice(0, 3).map((candidate, i) => (
                  <div key={i} className="p-2 bg-white rounded text-xs">
                    <p className="font-medium text-slate-900">{candidate.name}</p>
                    <p className="text-slate-600">{candidate.solution_potential}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.pilot_candidates?.length > 0 && (
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <p className="font-semibold text-purple-900 mb-2 text-sm flex items-center gap-1">
                <TestTube className="h-4 w-4" />
                {t({ en: 'Pilot Project Candidates', ar: 'مرشحو مشاريع التجريب' })}
              </p>
              <div className="space-y-2">
                {suggestions.pilot_candidates.slice(0, 3).map((candidate, i) => (
                  <div key={i} className="p-2 bg-white rounded text-xs">
                    <p className="font-medium text-slate-900">{candidate.name}</p>
                    <p className="text-slate-600">{candidate.pilot_idea}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.mentor_candidates?.length > 0 && (
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <p className="font-semibold text-amber-900 mb-2 text-sm">
                {t({ en: '🎓 Future Mentor Candidates', ar: '🎓 مرشحو الموجهين المستقبليين' })}
              </p>
              <div className="flex flex-wrap gap-1">
                {suggestions.mentor_candidates.map((name, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}