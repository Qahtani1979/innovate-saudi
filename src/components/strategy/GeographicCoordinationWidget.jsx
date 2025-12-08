import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

/**
 * Geographic coordination widget from strategic plans
 */
export default function GeographicCoordinationWidget({ strategicPlanId }) {
  const { data: coordination } = useQuery({
    queryKey: ['geo-coordination', strategicPlanId],
    queryFn: async () => {
      const plan = await base44.entities.StrategicPlan.filter({ id: strategicPlanId }).then(r => r[0]);
      if (!plan) return null;

      const targetMunicipalities = plan.target_municipalities || [];
      
      const municipalities = await base44.entities.Municipality.filter({
        id: { $in: targetMunicipalities }
      });

      return { plan, municipalities };
    },
    enabled: !!strategicPlanId
  });

  if (!coordination) return null;

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-600" />
          Geographic Coordination
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-slate-600 mb-3">
          {coordination.municipalities.length} municipalities aligned
        </p>
        {coordination.municipalities.slice(0, 5).map(muni => (
          <div key={muni.id} className="flex items-center justify-between p-2 bg-teal-50 rounded border">
            <div className="flex-1">
              <p className="text-sm font-medium">{muni.name_en}</p>
              <p className="text-xs text-slate-600">{muni.region}</p>
            </div>
            <Link to={createPageUrl('MunicipalityDashboard') + `?id=${muni.id}`}>
              <Button size="sm" variant="outline">
                <Users className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}