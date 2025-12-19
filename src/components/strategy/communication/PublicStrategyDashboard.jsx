import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, Target, TrendingUp, CheckCircle2, Clock, 
  AlertTriangle, Activity, Calendar, ArrowUpRight, ArrowDownRight,
  Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicStrategyDashboard({ strategicPlanId: propPlanId }) {
  const { t, language } = useLanguage();
  const { id: paramPlanId } = useParams();
  const strategicPlanId = propPlanId || paramPlanId;

  // Fetch strategic plan
  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['strategic-plan-public', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return null;
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', strategicPlanId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!strategicPlanId
  });

  // Fetch objectives
  const { data: objectives = [] } = useQuery({
    queryKey: ['strategic-objectives-public', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      const { data, error } = await supabase
        .from('strategic_objectives')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Fetch KPIs
  const { data: kpis = [] } = useQuery({
    queryKey: ['strategic-kpis-public', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      const { data, error } = await supabase
        .from('strategic_kpis')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Fetch milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ['strategy-milestones-public', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      const { data, error } = await supabase
        .from('strategy_milestones')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('end_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Fetch related entities for activity
  const { data: recentChallenges = [] } = useQuery({
    queryKey: ['recent-challenges-public', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title_en, title_ar, status, created_at')
        .eq('is_deleted', false)
        .contains('strategic_plan_ids', [strategicPlanId])
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Calculate overall progress
  const overallProgress = objectives.length > 0
    ? Math.round(objectives.reduce((sum, obj) => sum + (obj.progress_percentage || 0), 0) / objectives.length)
    : 0;

  // Process KPIs for display
  const displayKpis = kpis.slice(0, 4).map(kpi => ({
    name: language === 'ar' ? (kpi.name_ar || kpi.name_en) : kpi.name_en,
    current: kpi.current_value || 0,
    target: kpi.target_value || 100,
    unit: kpi.unit || '%',
    trend: (kpi.current_value || 0) >= (kpi.baseline_value || 0) ? 'up' : 'down',
    change: kpi.baseline_value ? `${((kpi.current_value - kpi.baseline_value) / kpi.baseline_value * 100).toFixed(1)}%` : 'N/A'
  }));

  // Process objectives for display
  const displayObjectives = objectives.map(obj => ({
    name: language === 'ar' ? (obj.title_ar || obj.title_en) : obj.title_en,
    progress: obj.progress_percentage || 0,
    status: obj.status === 'completed' ? 'on_track' 
      : (obj.progress_percentage || 0) >= 50 ? 'on_track' 
      : (obj.progress_percentage || 0) >= 25 ? 'at_risk' 
      : 'off_track'
  }));

  // Process milestones for display
  const displayMilestones = milestones.slice(0, 5).map(m => ({
    name: language === 'ar' ? (m.title_ar || m.title_en) : m.title_en,
    status: m.status,
    date: m.end_date
  }));

  // Activity feed from challenges
  const activityFeed = recentChallenges.map(ch => ({
    type: 'challenge',
    message: language === 'ar' 
      ? `تم إنشاء تحدي: ${ch.title_ar || ch.title_en}`
      : `Challenge created: ${ch.title_en}`,
    date: new Date(ch.created_at).toLocaleDateString()
  }));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'delayed': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default: return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getObjectiveStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'off_track': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan && strategicPlanId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <p className="text-lg">{t({ en: 'Strategic plan not found', ar: 'الخطة الاستراتيجية غير موجودة' })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {plan 
                  ? (language === 'ar' ? (plan.title_ar || plan.title_en) : plan.title_en)
                  : t({ en: 'Strategy Progress Dashboard', ar: 'لوحة متابعة تقدم الاستراتيجية' })
                }
              </h1>
              <p className="opacity-80">
                {t({ en: 'Real-time tracking of strategic objectives and KPIs', ar: 'متابعة حية للأهداف الاستراتيجية ومؤشرات الأداء' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-70">{t({ en: 'Last Updated', ar: 'آخر تحديث' })}</p>
              <p className="font-semibold">{plan?.updated_at ? new Date(plan.updated_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8">
        {/* Overall Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">{t({ en: 'Overall Strategy Progress', ar: 'تقدم الاستراتيجية الكلي' })}</h2>
              </div>
              <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-4" />
          </CardContent>
        </Card>

        {/* KPIs Grid */}
        {displayKpis.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {displayKpis.map((kpi, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">{kpi.name}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-3xl font-bold">{kpi.current}</span>
                        <span className="text-muted-foreground">{kpi.unit}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {kpi.change}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{t({ en: 'Progress', ar: 'التقدم' })}</span>
                        <span>{t({ en: 'Target:', ar: 'الهدف:' })} {kpi.target}{kpi.unit}</span>
                      </div>
                      <Progress value={Math.min((kpi.current / kpi.target) * 100, 100)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Objectives Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayObjectives.length > 0 ? displayObjectives.map((objective, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{objective.name}</span>
                    <Badge className={getObjectiveStatusColor(objective.status)}>
                      {objective.status === 'on_track' 
                        ? t({ en: 'On Track', ar: 'على المسار' })
                        : objective.status === 'at_risk'
                        ? t({ en: 'At Risk', ar: 'في خطر' })
                        : t({ en: 'Off Track', ar: 'خارج المسار' })
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={objective.progress} className="h-2 flex-1" />
                    <span className="text-sm text-muted-foreground w-10">{objective.progress}%</span>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">
                  {t({ en: 'No objectives defined yet', ar: 'لم يتم تحديد أهداف بعد' })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t({ en: 'Key Milestones', ar: 'المعالم الرئيسية' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayMilestones.length > 0 ? displayMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {getStatusIcon(milestone.status)}
                    <div className="flex-1">
                      <p className={`font-medium ${milestone.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {milestone.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{milestone.date}</p>
                    </div>
                    <Badge variant={milestone.status === 'completed' ? 'secondary' : 'outline'}>
                      {milestone.status === 'completed' 
                        ? t({ en: 'Done', ar: 'مكتمل' })
                        : milestone.status === 'in_progress'
                        ? t({ en: 'Active', ar: 'نشط' })
                        : milestone.status === 'delayed'
                        ? t({ en: 'Delayed', ar: 'متأخر' })
                        : t({ en: 'Upcoming', ar: 'قادم' })
                      }
                    </Badge>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">
                    {t({ en: 'No milestones defined yet', ar: 'لم يتم تحديد معالم بعد' })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        {activityFeed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p>{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
