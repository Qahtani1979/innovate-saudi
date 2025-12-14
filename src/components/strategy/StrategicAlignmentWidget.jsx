import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, ExternalLink, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

/**
 * Generic Strategic Alignment Widget for any entity type
 * Displays linked strategic plans and objectives
 */
export default function StrategicAlignmentWidget({ 
  entityType,
  entityId,
  title,
  className = ""
}) {
  const { language, t } = useLanguage();

  // Fetch the entity to get its strategic plan IDs
  const { data: entity, isLoading: entityLoading } = useQuery({
    queryKey: [entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(entityType === 'scaling_plan' ? 'scaling_plans' : `${entityType}s`)
        .select('*')
        .eq('id', entityId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!entityId
  });

  // Fetch all strategic plans
  const { data: strategicPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['strategic-plans-for-widget'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const isLoading = entityLoading || plansLoading;

  // Get linked strategic plans
  const linkedPlanIds = entity?.strategic_plan_ids || [];
  const linkedPlans = strategicPlans.filter(p => linkedPlanIds.includes(p.id));
  
  // Check if entity is strategy-derived
  const isStrategyDerived = entity?.is_strategy_derived || false;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="animate-pulse flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-indigo-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Target className="h-5 w-5 text-indigo-600" />
          {title || t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
          {isStrategyDerived && (
            <Badge className="ml-2 bg-indigo-100 text-indigo-700 border-indigo-200">
              <Sparkles className="h-3 w-3 mr-1" />
              {t({ en: 'Strategy-Derived', ar: 'مشتق استراتيجياً' })}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkedPlans.length > 0 ? (
          <div className="space-y-3">
            {linkedPlans.map(plan => (
              <div key={plan.id} className="p-4 bg-gradient-to-br from-indigo-50 to-white rounded-lg border border-indigo-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold text-slate-900">
                        {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
                      </h4>
                    </div>
                    {plan.vision_statement && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {plan.vision_statement}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {plan.timeframe_start && plan.timeframe_end && (
                        <span>
                          {new Date(plan.timeframe_start).getFullYear()} - {new Date(plan.timeframe_end).getFullYear()}
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {plan.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                  <Link to={createPageUrl(`StrategicPlanDetail?id=${plan.id}`)}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Show linked objectives if any */}
                {plan.objectives && plan.objectives.length > 0 && entity?.strategic_objective_ids?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-indigo-100">
                    <p className="text-xs font-medium text-slate-600 mb-2">
                      {t({ en: 'Linked Objectives:', ar: 'الأهداف المرتبطة:' })}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {plan.objectives
                        .filter(obj => entity.strategic_objective_ids?.includes(obj.id))
                        .map((obj, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-indigo-100 text-indigo-800">
                            {obj.name || obj.title || `Objective ${idx + 1}`}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Alignment Score Summary */}
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-700">
                  {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
                </span>
              </div>
              <Badge className="bg-green-100 text-green-700">
                {linkedPlans.length} {t({ en: 'plan(s) linked', ar: 'خطة مرتبطة' })}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-2">
              {t({ en: 'No strategic plans linked', ar: 'لا توجد خطط استراتيجية مرتبطة' })}
            </p>
            <p className="text-xs text-slate-400">
              {t({ 
                en: 'Link this entity to strategic plans for alignment tracking',
                ar: 'اربط هذا الكيان بالخطط الاستراتيجية لتتبع التوافق'
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}