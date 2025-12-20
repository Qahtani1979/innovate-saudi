import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, Loader2, TestTube, Microscope, Calendar, ShoppingCart, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';
import useAIWithFallback, { AI_STATUS } from '@/hooks/useAIWithFallback';
import AIStatusIndicator, { AIOptionalBadge } from '@/components/ai/AIStatusIndicator';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import {
  TRACK_ASSIGNMENT_SYSTEM_PROMPT,
  buildTrackAssignmentPrompt,
  TRACK_ASSIGNMENT_SCHEMA
} from '@/lib/ai/prompts/challenges/trackAssignment';

export default function TrackAssignment({ challenge }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [suggestion, setSuggestion] = useState(null);
  const { triggerEmail } = useEmailTrigger();

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const trackIcons = {
    pilot: TestTube,
    r_and_d: Microscope,
    program: Calendar,
    procurement: ShoppingCart,
    policy: FileText,
    none: null
  };

  const trackColors = {
    pilot: 'bg-purple-100 text-purple-700',
    r_and_d: 'bg-blue-100 text-blue-700',
    program: 'bg-green-100 text-green-700',
    procurement: 'bg-amber-100 text-amber-700',
    policy: 'bg-red-100 text-red-700',
    none: 'bg-slate-100 text-slate-700'
  };

  const assignTrackMutation = useMutation({
    mutationFn: (track) => base44.entities.Challenge.update(challenge.id, { track }),
    onSuccess: (_, track) => {
      queryClient.invalidateQueries(['challenge']);
      // Trigger email for challenge assigned to track
      triggerEmail('challenge.assigned', {
        entity_type: 'challenge',
        entity_id: challenge.id,
        variables: {
          challenge_title: challenge.title_en || challenge.title_ar,
          assigned_track: track
        }
      }).catch(err => console.error('Email trigger failed:', err));
      toast.success(t({ en: 'Track assigned', ar: 'تم تعيين المسار' }));
    }
  });

  const analyzeTrack = async () => {
    const { success, data } = await invokeAI({
      prompt: buildTrackAssignmentPrompt({ challenge }),
      system_prompt: TRACK_ASSIGNMENT_SYSTEM_PROMPT,
      response_json_schema: TRACK_ASSIGNMENT_SCHEMA
    });

    if (success && data) {
      setSuggestion(data);
    }
  };

  const Icon = trackIcons[challenge.track] || Calendar;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-blue-600" />
            {t({ en: 'Treatment Track', ar: 'مسار المعالجة' })}
          </CardTitle>
          <AIOptionalBadge />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails={true} />
        
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-600">{t({ en: 'Current Track:', ar: 'المسار الحالي:' })}</p>
          <Badge className={trackColors[challenge.track || 'none']}>
            {challenge.track || 'none'}
          </Badge>
        </div>

        <Button
          onClick={analyzeTrack}
          disabled={isLoading || !isAvailable}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {isLoading ? t({ en: 'Analyzing...', ar: 'جاري التحليل...' }) : t({ en: 'AI Recommend Track', ar: 'توصية ذكية بالمسار' })}
        </Button>

        {status === AI_STATUS.RATE_LIMITED && (
          <div className="p-3 bg-muted rounded-lg border">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {t({ en: 'You can still assign a track manually using the buttons below.', ar: 'لا يزال بإمكانك تعيين مسار يدويًا باستخدام الأزرار أدناه.' })}
              </p>
            </div>
          </div>
        )}

        {suggestion && (
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-blue-900">
                {t({ en: 'AI Recommendation:', ar: 'التوصية الذكية:' })}
              </p>
              <Badge className={trackColors[suggestion.recommended_track]}>
                {suggestion.recommended_track}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              {t({ en: 'Confidence:', ar: 'الثقة:' })} {suggestion.confidence}%
            </p>
            <ul className="space-y-1 mb-3">
              {suggestion.reasoning?.map((reason, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => assignTrackMutation.mutate(suggestion.recommended_track)}
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={assignTrackMutation.isPending}
            >
              {t({ en: 'Assign This Track', ar: 'تعيين هذا المسار' })}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {Object.keys(trackColors).filter(t => t !== 'none').map((track) => {
            const TrackIcon = trackIcons[track];
            return (
              <Button
                key={track}
                variant={challenge.track === track ? 'default' : 'outline'}
                size="sm"
                onClick={() => assignTrackMutation.mutate(track)}
                disabled={assignTrackMutation.isPending}
                className="justify-start"
              >
                {TrackIcon && <TrackIcon className="h-4 w-4 mr-2" />}
                {track.replace(/_/g, ' ')}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
