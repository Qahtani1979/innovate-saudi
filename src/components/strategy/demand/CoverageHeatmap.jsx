import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/components/LanguageContext';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * CoverageHeatmap - Visual representation of entity coverage across objectives
 */
export default function CoverageHeatmap({ analysis, objectives = [] }) {
  const { t, isRTL } = useLanguage();

  if (!analysis?.objective_coverage) {
    return null;
  }

  const entityTypes = ['challenge', 'pilot', 'solution', 'campaign', 'event', 'policy'];
  
  const getCellColor = (coverage) => {
    if (coverage >= 100) return 'bg-green-500';
    if (coverage >= 75) return 'bg-green-400';
    if (coverage >= 50) return 'bg-yellow-400';
    if (coverage >= 25) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getCellOpacity = (coverage) => {
    if (coverage >= 100) return 'opacity-100';
    if (coverage >= 75) return 'opacity-90';
    if (coverage >= 50) return 'opacity-75';
    if (coverage >= 25) return 'opacity-60';
    return 'opacity-50';
  };

  const getTrend = (current, target) => {
    const ratio = current / Math.max(target, 1);
    if (ratio >= 1) return { icon: TrendingUp, color: 'text-green-600' };
    if (ratio >= 0.5) return { icon: Minus, color: 'text-yellow-600' };
    return { icon: TrendingDown, color: 'text-red-600' };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {t({ en: 'Coverage Heatmap', ar: 'خريطة التغطية الحرارية' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">
                    {t({ en: 'Objective', ar: 'الهدف' })}
                  </th>
                  {entityTypes.map(type => (
                    <th key={type} className="p-2 text-center font-medium capitalize">
                      {type.substring(0, 3)}
                    </th>
                  ))}
                  <th className="p-2 text-center font-medium">
                    {t({ en: 'Overall', ar: 'الإجمالي' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.objective_coverage?.map((objCoverage, idx) => {
                  const objective = objectives.find(o => o.id === objCoverage.objective_id) || {};
                  
                  return (
                    <tr key={objCoverage.objective_id || idx} className="border-b hover:bg-muted/50">
                      <td className="p-2 max-w-[200px] truncate">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {isRTL ? objective.title_ar : objective.title_en || `Objective ${idx + 1}`}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[300px]">
                              {isRTL ? objective.description_ar : objective.description_en || ''}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      
                      {entityTypes.map(type => {
                        const coverage = objCoverage.entity_coverage?.[type] || { current: 0, target: 1, coverage_pct: 0 };
                        const Trend = getTrend(coverage.current, coverage.target);
                        
                        return (
                          <td key={type} className="p-2 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className={`
                                    w-8 h-8 mx-auto rounded flex items-center justify-center
                                    ${getCellColor(coverage.coverage_pct)}
                                    ${getCellOpacity(coverage.coverage_pct)}
                                    cursor-help transition-all hover:scale-110
                                  `}
                                >
                                  <span className="text-xs font-bold text-white">
                                    {coverage.current}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium capitalize">{type}</p>
                                  <p>{coverage.current} / {coverage.target} ({coverage.coverage_pct}%)</p>
                                  <div className="flex items-center gap-1">
                                    <Trend.icon className={`h-3 w-3 ${Trend.color}`} />
                                    <span className="text-xs">
                                      {coverage.coverage_pct >= 100 
                                        ? t({ en: 'Target met', ar: 'تم تحقيق الهدف' })
                                        : t({ en: `Need ${coverage.target - coverage.current} more`, ar: `تحتاج ${coverage.target - coverage.current} إضافي` })
                                      }
                                    </span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })}
                      
                      <td className="p-2 text-center">
                        <Badge 
                          variant={objCoverage.overall_coverage >= 80 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {objCoverage.overall_coverage || 0}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-400 opacity-50" />
              <span>0-25%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-orange-400 opacity-60" />
              <span>25-50%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-400 opacity-75" />
              <span>50-75%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-400 opacity-90" />
              <span>75-100%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>100%+</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
