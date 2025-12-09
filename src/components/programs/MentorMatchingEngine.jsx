import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Heart, Sparkles, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function MentorMatchingEngine({ participants, mentors }) {
  const { language, t } = useLanguage();
  const { invokeAI, status, isLoading: matching, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [matches, setMatches] = useState([]);

  const generateMatches = async () => {
    const result = await invokeAI({
      prompt: `Match ${participants.length} startups with ${mentors.length} mentors:

STARTUPS (sample):
${participants.slice(0, 10).map(p => `- ${p.startup_name}: ${p.sector}, ${p.startup_stage}, Needs: ${p.mentorship_needs || 'general guidance'}`).join('\n')}

MENTORS (sample):
${mentors.slice(0, 10).map(m => `- ${m.name}: Expertise in ${m.expertise_areas?.join(', ')}, ${m.years_experience} years`).join('\n')}

For each startup, suggest best 2 mentors considering:
1. Sector alignment
2. Stage expertise
3. Specific needs match
4. Mentor availability`,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                startup: { type: "string" },
                mentor_1: { type: "string" },
                mentor_2: { type: "string" },
                rationale_1: { type: "string" },
                rationale_2: { type: "string" },
                match_score: { type: "number" }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setMatches(result.data?.matches || []);
      toast.success(t({ en: `${result.data?.matches?.length || 0} matches created`, ar: `تم إنشاء ${result.data?.matches?.length || 0} مطابقة` }));
    }
  };

  return (
    <Card className="border-2 border-pink-300">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            {t({ en: 'AI Mentor Matching', ar: 'مطابقة المرشدين الذكية' })}
          </CardTitle>
          <Button onClick={generateMatches} disabled={matching} size="sm" className="bg-gradient-to-r from-pink-600 to-rose-600">
            {matching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Match', ar: 'مطابقة' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!matches.length && !matching && (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-pink-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI matches startups with ideal mentors', ar: 'الذكاء الاصطناعي يطابق الشركات مع المرشدين المثاليين' })}
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-3">
            {matches.map((match, idx) => (
              <div key={idx} className="p-4 border-2 border-pink-200 rounded-lg bg-white">
                <div className="mb-3">
                  <h4 className="font-semibold text-slate-900 mb-1">{match.startup}</h4>
                  <Badge className="bg-green-100 text-green-700">
                    {match.match_score}% confidence
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-pink-900">
                        🥇 {match.mentor_1}
                      </p>
                    </div>
                    <p className="text-xs text-slate-700">{match.rationale_1}</p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-blue-900">
                        🥈 {match.mentor_2}
                      </p>
                    </div>
                    <p className="text-xs text-slate-700">{match.rationale_2}</p>
                  </div>
                </div>

                <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-pink-600 to-rose-600">
                  <Mail className="h-3 w-3 mr-1" />
                  {t({ en: 'Send Introduction', ar: 'إرسال تعريف' })}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}