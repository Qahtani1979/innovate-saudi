import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useTaxonomy } from '@/hooks/useTaxonomy';

/**
 * AI-powered sector gap analysis from strategic plans
 */
export default function SectorGapAnalysisWidget({ strategicPlanId }) {
  const { t, language } = useLanguage();
  const { getSectorName } = useTaxonomy();
  
  const { data: analysis } = useQuery({
    queryKey: ['sector-gap-analysis', strategicPlanId],
    queryFn: async () => {
      // Fetch strategic plan
      const { data: plan, error: planError } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', strategicPlanId)
        .maybeSingle();
      
      if (planError || !plan) return null;

      // Fetch all related entities
      const [challengesRes, pilotsRes, solutionsRes] = await Promise.all([
        supabase.from('challenges').select('id, sector').eq('is_deleted', false),
        supabase.from('pilots').select('id, sector').eq('is_deleted', false),
        supabase.from('solutions').select('id, sectors').eq('is_deleted', false)
      ]);

      const challenges = challengesRes.data || [];
      const pilots = pilotsRes.data || [];
      const solutions = solutionsRes.data || [];

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