import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { Target, Network, AlertCircle, CheckCircle2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';

function StrategyAlignment() {
  const { t } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges-alignment', activePlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title_en, title_ar, strategic_plan_ids, status')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  // Filter challenges by active plan
  const linkedChallenges = activePlanId 
    ? challenges.filter(c => c.strategic_plan_ids?.includes(activePlanId))
    : challenges.filter(c => c.strategic_plan_ids?.length > 0);
  
  const alignedChallenges = linkedChallenges.filter(c => c.status === 'approved' || c.status === 'active' || c.status === 'in_progress');
  const misalignedChallenges = linkedChallenges.filter(c => c.status === 'rejected' || c.status === 'archived');

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
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-3xl font-bold">
          {t({ en: 'Strategy Alignment', ar: 'التوافق الاستراتيجي' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Strategic plan ↔ Challenge alignment tracking', ar: 'تتبع توافق الخطة الاستراتيجية مع التحديات' })}
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

      {activePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t({ en: 'Linked Challenges', ar: 'التحديات المرتبطة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {linkedChallenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'No challenges linked to this strategic plan yet', ar: 'لا توجد تحديات مرتبطة بهذه الخطة الاستراتيجية بعد' })}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {linkedChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <span className="font-medium">{challenge.title_en}</span>
                    <Badge className={
                      challenge.status === 'approved' || challenge.status === 'active' ? 'bg-green-600' :
                      challenge.status === 'rejected' ? 'bg-red-600' : 'bg-slate-500'
                    }>
                      {challenge.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(StrategyAlignment, { requiredPermissions: ['strategy_view'] });
