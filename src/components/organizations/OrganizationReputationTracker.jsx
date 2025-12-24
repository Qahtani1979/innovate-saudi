import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Auto-track and display organization reputation
 */
export default function OrganizationReputationTracker({ organizationId }) {
  const { data: org } = useQuery({
    queryKey: ['org', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('*').eq('id', organizationId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['org-solutions', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from('solutions').select('*').eq('provider_id', organizationId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['org-pilots', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from('pilots').select('*');
      if (error) throw error;
      return (data || []).filter(p => 
        p.team?.some(t => t.organization_id === organizationId) || 
        p.stakeholders?.some(s => s.organization_id === organizationId)
      );
    },
    enabled: !!organizationId
  });

  useEffect(() => {
    if (!org || !organizationId) return;

    const calculateReputation = async () => {
      const avgRating = solutions.reduce((sum, s) => sum + (s.average_rating || 0), 0) / (solutions.length || 1);
      const successRate = pilots.length > 0 
        ? (pilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length / pilots.length * 100)
        : 0;

      const reputationScore = Math.round(
        (avgRating / 5 * 40) + 
        (successRate * 0.4) +
        (Math.min(solutions.length, 10) * 2)
      );

      await supabase.from('organizations').update({
        reputation_score: reputationScore,
        reputation_factors: {
          avg_solution_rating: avgRating,
          pilot_success_rate: successRate,
          solution_count: solutions.length,
          pilot_count: pilots.length
        }
      }).eq('id', organizationId);
    };
  }, [solutions, pilots, organizationId]);

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