import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp } from 'lucide-react';

/**
 * AI-powered sector gap analysis from strategic plans
 */
export default function SectorGapAnalysisWidget({ strategicPlanId }) {
  const { data: analysis } = useQuery({
    queryKey: ['sector-gap-analysis', strategicPlanId],
    queryFn: async () => {
      const plan = await base44.entities.StrategicPlan.filter({ id: strategicPlanId }).then(r => r[0]);
      if (!plan) return null;

      const [challenges, pilots, solutions] = await Promise.all([
        base44.entities.Challenge.list(),
        base44.entities.Pilot.list(),
        base44.entities.Solution.list()
      ]);

      const sectorCounts = {};
      const targetSectors = plan.focus_sectors || [];

      targetSectors.forEach(sector => {
        sectorCounts[sector] = {
          challenges: challenges.filter(c => c.sector === sector).length,
          pilots: pilots.filter(p => p.sector === sector).length,
          solutions: solutions.filter(s => s.sectors?.includes(sector)).length
        };
      });

      return { targetSectors, sectorCounts };
    },
    enabled: !!strategicPlanId
  });

  if (!analysis) return null;

  return (
    <Card className="border-2 border-orange-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          Sector Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {analysis.targetSectors.map(sector => {
          const counts = analysis.sectorCounts[sector];
          const total = counts.challenges + counts.pilots + counts.solutions;
          const coverage = Math.min(100, total * 10);

          return (
            <div key={sector} className="p-3 bg-orange-50 rounded border">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{sector}</p>
                <Badge className={coverage > 50 ? 'bg-green-600' : 'bg-red-600'}>
                  {coverage}%
                </Badge>
              </div>
              <Progress value={coverage} className="h-2 mb-2" />
              <div className="flex gap-3 text-xs text-slate-600">
                <span>{counts.challenges} challenges</span>
                <span>{counts.pilots} pilots</span>
                <span>{counts.solutions} solutions</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}