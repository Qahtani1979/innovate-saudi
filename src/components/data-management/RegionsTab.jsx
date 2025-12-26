/**
 * Regions Tab Component for Data Management Hub
 * Enhanced with Strategic Priority Management
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Target, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { EntityTable } from './EntityTable';
import { useStrategicPlans } from '@/hooks/useStrategicPlans';
export function RegionsTab({ regions, onEdit, onDelete, onAdd }) {
  const { t, language } = useLanguage();
  const [showStrategicPriorities, setShowStrategicPriorities] = useState(false);

  // Fetch strategic plans to show regional alignment
  const { data: strategicPlans = [] } = useStrategicPlans({
    enabled: showStrategicPriorities
  });

  // Calculate strategic coverage by region
  const getRegionStrategicCoverage = (regionId) => {
    if (!strategicPlans.length) return null;

    // Find plans that target this region
    const targetingPlans = strategicPlans.filter(plan =>
      plan.target_regions?.includes(regionId) ||
      plan.scope === 'national'
    );

    return {
      totalPlans: targetingPlans.length,
      activePlans: targetingPlans.filter(p => p.status === 'approved' || p.status === 'active').length
    };
  };

  const columns = [
    { key: 'code', label: { en: 'Code', ar: 'الرمز' } },
    { key: 'name_en', label: { en: 'Name (EN)', ar: 'الاسم (EN)' } },
    { key: 'name_ar', label: { en: 'Name (AR)', ar: 'الاسم (AR)' } },
    {
      key: 'population',
      label: { en: 'Population', ar: 'السكان' },
      render: (item) => item.population ? `${(item.population / 1000000).toFixed(1)}M` : '-'
    },
    ...(showStrategicPriorities ? [{
      key: 'strategic_coverage',
      label: { en: 'Strategic Coverage', ar: 'التغطية الاستراتيجية' },
      render: (item) => {
        const coverage = getRegionStrategicCoverage(item.id);
        if (!coverage) return <Badge variant="outline">-</Badge>;
        return (
          <div className="flex items-center gap-2">
            <Badge className={coverage.activePlans > 0 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
              {coverage.activePlans}/{coverage.totalPlans} {t({ en: 'plans', ar: 'خطط' })}
            </Badge>
          </div>
        );
      }
    }] : [])
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {t({ en: 'Regions Management', ar: 'إدارة المناطق' })}
          </CardTitle>
          <Button
            variant={showStrategicPriorities ? "default" : "outline"}
            size="sm"
            onClick={() => setShowStrategicPriorities(!showStrategicPriorities)}
            className="gap-2"
          >
            <Target className="h-4 w-4" />
            {t({ en: 'Strategic Priorities', ar: 'الأولويات الاستراتيجية' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showStrategicPriorities && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600 mt-0.5" />
              <div className="text-xs text-indigo-800">
                <p className="font-semibold mb-1">
                  {t({ en: 'Regional Strategic Alignment View', ar: 'عرض التوافق الاستراتيجي الإقليمي' })}
                </p>
                <p>
                  {t({
                    en: 'Shows how many strategic plans target each region. Use this to identify gaps in regional coverage.',
                    ar: 'يوضح عدد الخطط الاستراتيجية التي تستهدف كل منطقة. استخدم هذا لتحديد فجوات التغطية الإقليمية.'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        <EntityTable
          data={regions}
          entity="Region"
          columns={columns}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={() => onAdd('Region')}
          filters={[]}
        />
      </CardContent>
    </Card>
  );
}

export default RegionsTab;
