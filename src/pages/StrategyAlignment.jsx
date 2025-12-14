import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Target, Network, AlertCircle, CheckCircle2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StrategyAlignment() {
  const { t } = useLanguage();

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['strategic-plans-alignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges-alignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title_en, title_ar, strategic_plan_ids, status')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const isLoading = plansLoading || challengesLoading;

  // Calculate alignment from strategic_plan_ids on challenges
  const linkedChallenges = challenges.filter(c => c.strategic_plan_ids?.length > 0);
  const alignedChallenges = linkedChallenges.filter(c => c.status === 'approved' || c.status === 'active' || c.status === 'in_progress');
  const misalignedChallenges = linkedChallenges.filter(c => c.status === 'rejected' || c.status === 'archived');

  const byPlan = plans.map(plan => ({
    id: plan.id,
    name: plan.name_en || plan.title_en,
    linked: challenges.filter(c => c.strategic_plan_ids?.includes(plan.id)).length,
    aligned: challenges.filter(c => 
      c.strategic_plan_ids?.includes(plan.id) && 
      (c.status === 'approved' || c.status === 'active' || c.status === 'in_progress')
    ).length
  })).filter(p => p.linked > 0);

  const stats = {
    total_links: linkedChallenges.length,
    aligned: alignedChallenges.length,
    misaligned: misalignedChallenges.length,
    coverage: challenges.length > 0 ? (linkedChallenges.length / challenges.length) * 100 : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto py-6 px-4">
      <div>
        <h1 className="text-3xl font-bold">
          {t({ en: 'Strategy Alignment', ar: 'التوافق الاستراتيجي' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Strategic plans ↔ Challenge alignment tracking', ar: 'تتبع توافق الخطط الاستراتيجية مع التحديات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Network className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total_links}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Total Links', ar: 'إجمالي الروابط' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.aligned}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Aligned', ar: 'متوافق' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.misaligned}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Misaligned', ar: 'غير متوافق' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-background">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.coverage.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Coverage', ar: 'التغطية' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Alignment by Strategic Plan', ar: 'التوافق حسب الخطة الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {byPlan.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t({ en: 'No challenges linked to strategic plans yet', ar: 'لا توجد تحديات مرتبطة بالخطط الاستراتيجية بعد' })}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {byPlan.map((plan) => (
                <div key={plan.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <Badge className="bg-green-600">
                      {plan.aligned} / {plan.linked} {t({ en: 'aligned', ar: 'متوافق' })}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t({ en: 'Linked challenges:', ar: 'التحديات المربوطة:' })}</span>
                    <span className="font-medium">{plan.linked}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategyAlignment, { requiredPermissions: ['strategy_view'] });