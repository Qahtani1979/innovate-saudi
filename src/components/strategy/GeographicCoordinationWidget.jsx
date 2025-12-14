import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';

/**
 * Geographic coordination widget from strategic plans
 */
export default function GeographicCoordinationWidget({ strategicPlanId }) {
  const { t } = useLanguage();
  
  const { data: coordination } = useQuery({
    queryKey: ['geo-coordination', strategicPlanId],
    queryFn: async () => {
      // Fetch strategic plan
      const { data: plan, error: planError } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', strategicPlanId)
        .maybeSingle();
      
      if (planError || !plan) return null;

      const targetMunicipalities = plan.target_municipalities || [];
      
      if (targetMunicipalities.length === 0) {
        return { plan, municipalities: [] };
      }

      // Fetch municipalities
      const { data: municipalities, error: muniError } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar, region_id')
        .in('id', targetMunicipalities);

      if (muniError) return { plan, municipalities: [] };

      return { plan, municipalities: municipalities || [] };
    },
    enabled: !!strategicPlanId
  });

  if (!coordination) return null;

  if (coordination.municipalities.length === 0) {
    return (
      <Card className="border-2 border-teal-300">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600" />
            {t({ en: 'Geographic Coordination', ar: 'التنسيق الجغرافي' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t({ en: 'No target municipalities defined', ar: 'لم يتم تحديد بلديات مستهدفة' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-600" />
          {t({ en: 'Geographic Coordination', ar: 'التنسيق الجغرافي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          {coordination.municipalities.length} {t({ en: 'municipalities aligned', ar: 'بلدية متوافقة' })}
        </p>
        {coordination.municipalities.slice(0, 5).map(muni => (
          <div key={muni.id} className="flex items-center justify-between p-2 bg-teal-50 rounded border">
            <div className="flex-1">
              <p className="text-sm font-medium">{muni.name_en}</p>
              {muni.name_ar && <p className="text-xs text-muted-foreground">{muni.name_ar}</p>}
            </div>
            <Link to={`/municipality-dashboard?id=${muni.id}`}>
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