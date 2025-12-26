import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from 'lucide-react';
import { useOrganizationReputation } from '@/hooks/useOrganizationReputation';

/**
 * Auto-track and display organization reputation
 */
export default function OrganizationReputationTracker({ organizationId }) {
  const { reputationData, updateReputation } = useOrganizationReputation(organizationId);
  const org = reputationData?.org;

  useEffect(() => {
    if (!org || !organizationId) return;

    // Auto-update if data is stale or on mount if needed
    // The hook handles data fetching. The mutation handles the calculation and update.
    // Use an effect to trigger update occasionally or just rely on manual trigger?
    // The original code calculated via effect on [solutions, pilots].
    // We can preserve that behavior by calling mutate when data is ready.

    if (reputationData) {
      updateReputation.mutate();
    }
  }, [reputationData?.solutions?.length, reputationData?.pilots?.length]);

  if (!org?.reputation_score) return null;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm text-slate-600 mb-1">Reputation Score</p>
            <Progress value={org.reputation_score} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">{org.reputation_score}/100</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}