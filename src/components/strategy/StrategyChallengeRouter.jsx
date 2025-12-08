import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Route challenges to appropriate tracks based on strategic alignment
 */
export default function StrategyChallengeRouter({ challengeId }) {
  const { data: challenge } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: () => base44.entities.Challenge.filter({ id: challengeId }).then(r => r[0]),
    enabled: !!challengeId
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: () => base44.entities.StrategicPlan.filter({ is_active: true })
  });

  if (!challenge) return null;

  const alignedPlans = strategicPlans.filter(plan => 
    plan.sector_id === challenge.sector_id ||
    plan.focus_sectors?.includes(challenge.sector)
  );

  const routeToTrack = async (track) => {
    try {
      await base44.entities.Challenge.update(challengeId, {
        tracks: [...(challenge.tracks || []), track]
      });
      toast.success(`Routed to ${track} track`);
    } catch (error) {
      toast.error('Failed to route challenge');
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-600" />
          Strategic Routing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alignedPlans.length > 0 && (
          <div className="p-3 bg-purple-50 rounded border">
            <p className="text-xs text-purple-900 font-medium mb-2">
              Aligned with {alignedPlans.length} strategic plan(s)
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => routeToTrack('pilot')} variant="outline">
                <ArrowRight className="h-3 w-3 mr-1" />
                Route to Pilot
              </Button>
              <Button size="sm" onClick={() => routeToTrack('r_and_d')} variant="outline">
                <ArrowRight className="h-3 w-3 mr-1" />
                Route to R&D
              </Button>
              <Button size="sm" onClick={() => routeToTrack('program')} variant="outline">
                <ArrowRight className="h-3 w-3 mr-1" />
                Route to Program
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}