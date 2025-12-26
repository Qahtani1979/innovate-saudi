import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { Sparkles, Users, Loader2, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useLivingLabConsultations } from '@/hooks/useLivingLabConsultations';

export default function LivingLabExpertMatching({ lab, projectNeeds, onClose }) {
  const { t, isRTL } = useLanguage();
  const { invokeAI, status, isLoading: matching, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [matches, setMatches] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    consultation_date: '',
    consultation_time: '',
    duration_hours: 2,
    meeting_type: 'virtual',
    topic: '',
    notes: ''
  });

  const { createConsultation, inviteExpert } = useLivingLabConsultations();

  const handleAIMatching = async () => {
    const prompt = `Match research experts with a project need at this Living Lab:

Lab: ${lab.name_en}
Type: ${lab.type}
Research Themes: ${lab.research_themes?.join(', ') || 'N/A'}
Technical Capabilities: ${lab.technical_capabilities?.join(', ') || 'N/A'}

Expert Network (${lab.expert_network?.length || 0}):
${lab.expert_network?.map((e, i) =>
      `${i + 1}. ${e.name} - ${e.title}
   Expertise: ${e.expertise?.join(', ')}
   Organization: ${e.organization}
   Availability: ${e.availability || 'N/A'}
`).join('\n') || 'No experts listed'}

Project Need:
${projectNeeds || 'General consultation for research facility usage'}

MATCHING RULES:
1. Match expert expertise with project domain
2. Consider expert availability
3. Rank by depth of relevant experience
4. Suggest consultation focus areas

Return top 3 expert matches with scores and consultation recommendations.`;

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
                expert_name: { type: 'string' },
                match_score: { type: 'number' },
                reasoning: { type: 'string' },
                suggested_topics: { type: 'array', items: { type: 'string' } },
                recommended_duration: { type: 'string' }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      // Map to expert objects
      const mappedMatches = result.data.matches.map(m => {
        const expert = lab.expert_network?.find(e => e.name === m.expert_name);
        return {
          ...m,
          expertData: expert
        };
      }).filter(m => m.expertData);

      setMatches(mappedMatches);
      toast.success(t({ en: 'Expert matches found', ar: 'تم العثور على خبراء مناسبين' }));
    }
  };

  const handleBooking = () => {
    createConsultation.mutate({
      living_lab_id: lab.id,
      booking_type: 'expert_consultation',
      expert_name: selectedExpert.expertData.name,
      expert_email: selectedExpert.expertData.email,
      consultation_date: bookingDetails.consultation_date,
      consultation_time: bookingDetails.consultation_time,
      duration_hours: bookingDetails.duration_hours,
      meeting_type: bookingDetails.meeting_type,
      topic: bookingDetails.topic,
      notes: bookingDetails.notes
    }, {
      onSuccess: () => {
        // Send email to expert
        if (selectedExpert.expertData.email) {
          inviteExpert.mutate({
            email: selectedExpert.expertData.email,
            name: selectedExpert.expertData.name,
            labName: lab.name_en,
            details: {
              consultationDate: bookingDetails.consultation_date,
              consultationTime: bookingDetails.consultation_time,
              durationHours: bookingDetails.duration_hours,
              meetingType: bookingDetails.meeting_type,
              topic: bookingDetails.topic,
              notes: bookingDetails.notes
            }
          });
        }
        onClose();
      }
    });
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          {t({ en: 'Expert Consultation', ar: 'استشارة خبير' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">{lab?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">
            {lab?.expert_network?.length || 0} experts available
          </p>
        </div>

        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

        {!matches && !selectedExpert && (
          <Button
            onClick={handleAIMatching}
            disabled={matching || !isAvailable}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {matching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Finding experts...', ar: 'جاري البحث عن خبراء...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Find Expert Match', ar: 'إيجاد خبير مناسب' })}
              </>
            )}
          </Button>
        )}

        {matches && !selectedExpert && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Recommended Experts', ar: 'الخبراء الموصى بهم' })}
            </p>
            {matches.map((match, i) => (
              <div key={i} className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedExpert(match)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{match.expertData.name}</p>
                    <p className="text-xs text-slate-600">{match.expertData.title} • {match.expertData.organization}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.expertData.expertise?.map((exp, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{exp}</Badge>
                      ))}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{match.match_score}%</Badge>
                </div>
                <p className="text-xs text-slate-600 italic">{match.reasoning}</p>
                {match.suggested_topics?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-blue-700 font-medium">Suggested Topics:</p>
                    <p className="text-xs text-slate-600">{match.suggested_topics.join(', ')}</p>
                  </div>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={() => setMatches(null)} className="w-full">
              {t({ en: 'Search Again', ar: 'بحث مرة أخرى' })}
            </Button>
          </div>
        )}

        {selectedExpert && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <p className="font-medium text-green-900">{selectedExpert.expertData.name}</p>
              <p className="text-xs text-slate-600">{selectedExpert.expertData.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  {t({ en: 'Date', ar: 'التاريخ' })}
                </label>
                <Input
                  type="date"
                  value={bookingDetails.consultation_date}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, consultation_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  {t({ en: 'Time', ar: 'الوقت' })}
                </label>
                <Input
                  type="time"
                  value={bookingDetails.consultation_time}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, consultation_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Consultation Topic', ar: 'موضوع الاستشارة' })}
              </label>
              <Input
                value={bookingDetails.topic}
                onChange={(e) => setBookingDetails({ ...bookingDetails, topic: e.target.value })}
                placeholder={selectedExpert.suggested_topics?.[0] || 'Topic...'}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Additional Notes', ar: 'ملاحظات إضافية' })}
              </label>
              <Textarea
                value={bookingDetails.notes}
                onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleBooking}
                disabled={!bookingDetails.consultation_date || !bookingDetails.topic || createConsultation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createConsultation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Book Consultation', ar: 'حجز الاستشارة' })}
              </Button>
              <Button variant="outline" onClick={() => setSelectedExpert(null)}>
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
