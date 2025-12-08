import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, Loader2, TestTube, Microscope, Calendar, ShoppingCart, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function TrackAssignment({ challenge }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

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
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge']);
      toast.success(t({ en: 'Track assigned', ar: 'تم تعيين المسار' }));
    }
  });

  const analyzeTrack = async () => {
    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this municipal challenge and recommend the best treatment track:
Title: ${challenge.title_en}
Description: ${challenge.description_en}
Severity Score: ${challenge.severity_score}
Impact Score: ${challenge.impact_score}

Tracks available:
- pilot: Test solution through controlled pilot project
- r_and_d: Requires research & development
- program: Suitable for program/event format (hackathon, accelerator)
- procurement: Standard procurement solution
- policy: Requires policy/regulatory change
- none: No specific track

Return JSON with: recommended_track, confidence (0-100), reasoning (array of strings)`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommended_track: { type: 'string' },
            confidence: { type: 'number' },
            reasoning: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setSuggestion(result);
    } catch (error) {
      toast.error('AI analysis failed');
    }
    setAnalyzing(false);
  };

  const Icon = trackIcons[challenge.track] || Calendar;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          {t({ en: 'Treatment Track', ar: 'مسار المعالجة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-600">{t({ en: 'Current Track:', ar: 'المسار الحالي:' })}</p>
          <Badge className={trackColors[challenge.track || 'none']}>
            {challenge.track || 'none'}
          </Badge>
        </div>

        <Button
          onClick={analyzeTrack}
          disabled={analyzing}
          variant="outline"
          className="w-full"
        >
          {analyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {analyzing ? t({ en: 'Analyzing...', ar: 'جاري التحليل...' }) : t({ en: 'AI Recommend Track', ar: 'توصية ذكية بالمسار' })}
        </Button>

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