import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Award, Lightbulb, TestTube, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  ALUMNI_SUGGESTER_SYSTEM_PROMPT, 
  buildAlumniSuggesterPrompt, 
  ALUMNI_SUGGESTER_SCHEMA 
} from '@/lib/ai/prompts/programs/alumniSuggester';

export default function AIAlumniSuggester({ program, applications }) {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateSuggestions = async () => {
    const graduates = applications?.filter(a => a.status === 'accepted') || [];
    
    if (graduates.length === 0) {
      toast.error(t({ en: 'No graduates available', ar: 'لا يوجد خريجون' }));
      return;
    }

    const result = await invokeAI({
      system_prompt: ALUMNI_SUGGESTER_SYSTEM_PROMPT,
      prompt: buildAlumniSuggesterPrompt({
        program: {
          name_en: program.name_en,
          program_type: program.program_type,
          focus_area: program.focus_areas?.join(', '),
          duration: program.duration
        },
        graduates: graduates.map(g => ({
          name: g.applicant_name || 'Graduate',
          role: 'Graduate',
          skills: g.skills || []
        })),
        alumni_outcomes: []
      }),
      response_json_schema: ALUMNI_SUGGESTER_SCHEMA
    });

    if (result.success) {
      // Map response to expected format
      setSuggestions({
        solution_candidates: result.data.career_pathways?.slice(0, 3).map(p => ({
          name: 'Graduate',
          reason: p.description,
          solution_potential: p.pathway
        })) || [],
        pilot_candidates: result.data.certifications?.slice(0, 3).map(c => ({
          name: 'Graduate',
          reason: c.relevance,
          pilot_idea: c.name
        })) || [],
        partnership_opportunities: [],
        mentor_candidates: result.data.leadership_tracks || []
      });
      toast.success(t({ en: 'Suggestions generated', ar: 'تم توليد الاقتراحات' }));
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
          <Button onClick={generateSuggestions} disabled={isLoading || !isAvailable} size="sm">
            {isLoading ? (
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
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
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
