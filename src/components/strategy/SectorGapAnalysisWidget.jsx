import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
import { useMemo } from 'react';

/**
 * AI-powered sector gap analysis from strategic plans
 */
export default function SectorGapAnalysisWidget({ strategicPlanId }) {
  const { t, language } = useLanguage();
  const { getSectorName } = useTaxonomy();

  // Use centralized hooks
  const { data: plans = [], isLoading: isLoadingPlans } = useStrategiesWithVisibility({
    id: strategicPlanId,
    includeTemplates: true // In case the plan is a template
  });
  const plan = plans[0];

  const { data: challenges = [], isLoading: isLoadingChallenges } = useChallengesWithVisibility({
    limit: 1000,
    includeDeleted: false
  });

  const { data: pilots = [], isLoading: isLoadingPilots } = usePilotsWithVisibility({
    limit: 1000,
    includeDeleted: false
  });

  const { data: solutions = [], isLoading: isLoadingSolutions } = useSolutionsWithVisibility({
    limit: 1000,
    includeDeleted: false
  });

  const analysis = useMemo(() => {
    if (!plan) return null;

    const sectorCounts = {};
    const targetSectors = plan.focus_sectors || [];

    targetSectors.forEach(sector => {
      sectorCounts[sector] = {
        challenges: challenges.filter(c => c.sector === sector || c.sector_id === sector).length, // Handle both potential formats
        pilots: pilots.filter(p => p.sector === sector || p.sector_id === sector).length,
        solutions: solutions.filter(s => s.sectors?.includes(sector) || s.sector_id === sector).length
      };
    });

    return { targetSectors, sectorCounts };
  }, [plan, challenges, pilots, solutions]);

  if (!analysis || analysis.targetSectors.length === 0) {
    return (
      <Card className="border-2 border-orange-300">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            {t({ en: 'Sector Gap Analysis', ar: 'تحليل فجوة القطاعات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t({ en: 'No focus sectors defined for this plan', ar: 'لم يتم تحديد قطاعات مستهدفة لهذه الخطة' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          {t({ en: 'Sector Gap Analysis', ar: 'تحليل فجوة القطاعات' })}
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
                <p className="font-medium text-sm">{getSectorName(sector, language)}</p>
                <Badge className={coverage > 50 ? 'bg-green-600' : 'bg-red-600'}>
                  {coverage}%
                </Badge>
              </div>
              <Progress value={coverage} className="h-2 mb-2" />
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{counts.challenges} {t({ en: 'challenges', ar: 'تحديات' })}</span>
                <span>{counts.pilots} {t({ en: 'pilots', ar: 'تجارب' })}</span>
                <span>{counts.solutions} {t({ en: 'solutions', ar: 'حلول' })}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
