import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../LanguageContext';
import { useChallenge } from '@/hooks/useChallengesWithVisibility';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';
import { useUpdateChallengeTracks } from '@/hooks/useChallengeMutations';

/**
 * Route challenges to appropriate tracks based on strategic alignment
 * ✅ GOLD STANDARD COMPLIANT
 */
export default function StrategyChallengeRouter({ challengeId }) {
  const { t } = useLanguage();

  // Custom Hooks
  const { data: challenge } = useChallenge(challengeId);

  const { data: strategicPlans = [] } = useStrategicPlans({
    status: 'active'
  });

  const updateTracksMutation = useUpdateChallengeTracks();

  if (!challenge) return null;

  // Filter plans (logic remains same)
  const alignedPlans = strategicPlans.filter(plan =>
    plan.sector_id === challenge.sector_id ||
    plan.focus_sectors?.includes(challenge.sector)
  );

  const routeToTrack = (track) => {
    if (challenge.tracks?.includes(track)) {
      toast.info(t({ en: 'Already routed to this track', ar: 'تم التوجيه مسبقاً لهذا المسار' }));
      return;
    }

    const newTracks = [...(challenge?.tracks || []), track];

    updateTracksMutation.mutate({ id: challengeId, tracks: newTracks }, {
      onSuccess: () => {
        toast.success(t({
          en: `Routed to ${track} track`,
          ar: `تم التوجيه إلى مسار ${track}`
        }));
      }
    });
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-600" />
          {t({ en: 'Strategic Routing', ar: 'التوجيه الاستراتيجي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenge.tracks?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs text-muted-foreground">{t({ en: 'Current tracks:', ar: 'المسارات الحالية:' })}</span>
            {challenge.tracks.map(track => (
              <Badge key={track} variant="secondary">{track}</Badge>
            ))}
          </div>
        )}

        {alignedPlans.length > 0 && (
          <div className="p-3 bg-purple-50 rounded border">
            <p className="text-xs text-purple-900 font-medium mb-2">
              {t({ en: `Aligned with ${alignedPlans.length} strategic plan(s)`, ar: `متوافق مع ${alignedPlans.length} خطة استراتيجية` })}
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={() => routeToTrack('pilot')}
                variant="outline"
                disabled={updateTracksMutation.isPending}
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                {t({ en: 'Route to Pilot', ar: 'توجيه للتجربة' })}
              </Button>
              <Button
                size="sm"
                onClick={() => routeToTrack('r_and_d')}
                variant="outline"
                disabled={updateTracksMutation.isPending}
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                {t({ en: 'Route to R&D', ar: 'توجيه للبحث' })}
              </Button>
              <Button
                size="sm"
                onClick={() => routeToTrack('program')}
                variant="outline"
                disabled={updateTracksMutation.isPending}
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                {t({ en: 'Route to Program', ar: 'توجيه للبرنامج' })}
              </Button>
            </div>
          </div>
        )}

        {alignedPlans.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            {t({ en: 'No strategic alignment found', ar: 'لا يوجد توافق استراتيجي' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
