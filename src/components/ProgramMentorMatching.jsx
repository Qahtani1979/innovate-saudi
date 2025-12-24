import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, Users, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

import { useProgramApplications } from '@/hooks/useProgramDetails';
import { useProgramMutations } from '@/hooks/useProgramMutations';

export default function ProgramMentorMatching({ program, onClose }) {
  const { t, isRTL } = useLanguage();
  const [matches, setMatches] = useState(null);

  const { invokeAI, status, isLoading: matching, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: allApplications = [] } = useProgramApplications(program?.id);
  const participants = allApplications.filter(a => a.status === 'accepted');

  const { updateApplicationBatch, isBatchUpdating } = useProgramMutations();

  const handleAIMatching = async () => {
    const prompt = `Match mentors with participants for this innovation program:

Program: ${program.name_en}
Type: ${program.program_type}
Focus: ${program.focus_areas?.join(', ') || 'N/A'}

Mentors (${program.mentors?.length || 0}):
${program.mentors?.map((m, i) =>
      `${i + 1}. ${m.name} - Expertise: ${m.expertise?.join(', ')}, Organization: ${m.organization}`
    ).join('\n') || 'No mentors listed'}

Participants (${participants.length}):
${participants.map((p, i) =>
      `${i + 1}. ${p.applicant_name} (${p.organization_type})
   Focus: ${p.focus_area || 'N/A'}
   Needs: ${p.mentorship_needs || 'General guidance'}
`).join('\n')}

MATCHING RULES:
1. Match mentor expertise with participant needs
2. Balance mentorship load (2-4 mentees per mentor)
3. Consider organization type compatibility
4. Prioritize sector/domain alignment

Return matched pairs with reasoning.`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          matches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                participant_name: { type: 'string' },
                mentor_name: { type: 'string' },
                match_score: { type: 'number' },
                reasoning: { type: 'string' }
              }
            }
          }
        }
      }
    });

    if (result.success && result.data?.matches) {
      // Map to IDs
      const mappedMatches = result.data.matches.map(m => {
        const participant = participants.find(p => p.applicant_name === m.participant_name);
        return {
          participantId: participant?.id,
          participantName: m.participant_name,
          mentorName: m.mentor_name,
          matchScore: m.match_score,
          reasoning: m.reasoning
        };
      }).filter(m => m.participantId);

      setMatches(mappedMatches);
      toast.success(t({ en: 'AI matching completed', ar: 'المطابقة الذكية مكتملة' }));
    }
  };

  const handleConfirmMatches = async () => {
    if (!matches) return;

    const updates = matches.map(match => ({
      id: match.participantId,
      data: {
        assigned_mentor: match.mentorName,
        mentor_match_score: match.matchScore
      }
    }));

    try {
      await updateApplicationBatch(updates);
      onClose();
    } catch (error) {
      // toast is handled by hook
    }
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Mentor Matching', ar: 'مطابقة الموجهين بالذكاء' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm font-medium text-purple-900">{program?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">
            {program?.mentors?.length || 0} mentors • {participants.length} participants
          </p>
        </div>

        {!matches ? (
          <Button
            onClick={handleAIMatching}
            disabled={matching || !program?.mentors?.length || participants.length === 0 || !isAvailable}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {matching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Matching...', ar: 'جاري المطابقة...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Generate AI Matches', ar: 'إنشاء مطابقات ذكية' })}
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Proposed Matches', ar: 'المطابقات المقترحة' })}
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {matches.map((match, i) => (
                <div key={i} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{match.participantName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-3 w-3 text-purple-600" />
                        <p className="text-sm text-purple-700 font-medium">{match.mentorName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700">{match.matchScore}%</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">{match.reasoning}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleConfirmMatches}
                disabled={isBatchUpdating}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isBatchUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Confirm Matches', ar: 'تأكيد المطابقات' })}
              </Button>
              <Button variant="outline" onClick={() => setMatches(null)}>
                {t({ en: 'Reset', ar: 'إعادة' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}