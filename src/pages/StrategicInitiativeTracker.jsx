import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { Link } from 'react-router-dom';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ArrowLeft,
  ArrowRight,
  Workflow,
  BarChart3,
  Calendar,
  Flag,
  RefreshCw
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '@/components/permissions/ProtectedPage';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';

function StrategicInitiativeTracker() {
  const { language, isRTL, t } = useLanguage();
  const { activePlan, activePlanId, strategicPlans: contextPlans, isLoading: contextLoading } = useActivePlan();

  // Fetch milestones for the active plan or all plans
  const { data: milestones = [], isLoading: milestonesLoading, refetch: refetchMilestones } = useQuery({
    queryKey: ['milestones-initiatives', activePlanId],
    queryFn: async () => {
      let query = supabase
        .from('milestones')
        .select('id, title_en, title_ar, status, entity_id, entity_type, due_date, priority');
      
      if (activePlanId) {
        query = query.eq('entity_id', activePlanId);
      }
      
      const { data } = await query;
      return data || [];
    }
  });

  // Fetch KPI references for the active plan or all plans
  const { data: kpiRefs = [], isLoading: kpisLoading, refetch: refetchKpis } = useQuery({
    queryKey: ['kpi-refs-initiatives', activePlanId],
    queryFn: async () => {
      let query = supabase
        .from('kpi_references')
        .select('id, name_en, name_ar, current_value, target_value, entity_id, unit, status');
      
      if (activePlanId) {
        query = query.eq('entity_id', activePlanId);
      }
      
      const { data } = await query;
      return data || [];
    }
  });

  // Fetch strategic objectives for the active plan
  const { data: objectives = [] } = useQuery({
    queryKey: ['objectives-initiatives', activePlanId],
    queryFn: async () => {
      if (!activePlanId) return [];
      const { data } = await supabase
        .from('strategic_objectives')
        .select('id, title_en, title_ar, status, progress_percentage')
        .eq('strategic_plan_id', activePlanId)
        .or('is_deleted.is.null,is_deleted.eq.false');
      return data || [];
    },
    enabled: !!activePlanId
  });

  const handleRefresh = () => {
    refetchMilestones();
    refetchKpis();
  };

  // Calculate initiative data based on active plan or all plans
  const initiativeData = useMemo(() => {
    const plans = activePlanId && activePlan ? [activePlan] : (contextPlans || []);
    
    return plans.map(plan => {
      const planMilestones = milestones.filter(m => m.entity_id === plan.id);
      const planKpis = kpiRefs.filter(k => k.entity_id === plan.id);
      const completedMilestones = planMilestones.filter(m => m.status === 'completed').length;
      const overdueMilestones = planMilestones.filter(m => 
        m.status !== 'completed' && m.due_date && new Date(m.due_date) < new Date()
      ).length;
      const kpisOnTrack = planKpis.filter(k => 
        k.current_value && k.target_value && (k.current_value / k.target_value) >= 0.7
      ).length;
      
      const milestoneProgress = planMilestones.length > 0 
        ? (completedMilestones / planMilestones.length) * 100 
        : 50;
      const kpiProgress = planKpis.length > 0 
        ? (kpisOnTrack / planKpis.length) * 100 
        : 50;
      const healthScore = Math.round((milestoneProgress + kpiProgress) / 2);
      
      return {
        id: plan.id,
        code: plan.code || `SP-${plan.id?.slice(0, 8)}`,
        title: { 
          en: plan.title_en || plan.name_en || 'Untitled Initiative', 
          ar: plan.title_ar || plan.name_ar || 'مبادرة بدون عنوان' 
        },
        owner: plan.owner || plan.created_by || 'Not assigned',
        status: plan.status || 'active',
        progress: plan.progress_percentage || Math.round((completedMilestones / Math.max(planMilestones.length, 1)) * 100),
        milestones_completed: completedMilestones,
        milestones_total: planMilestones.length,
        milestones_overdue: overdueMilestones,
        kpis_on_track: kpisOnTrack,
        kpis_total: planKpis.length,
        health_score: healthScore,
        timeframe_start: plan.timeframe_start,
        timeframe_end: plan.timeframe_end
      };
    });
  }, [activePlan, activePlanId, contextPlans, milestones, kpiRefs]);

  // Summary stats
  const stats = useMemo(() => {
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const overdueMilestones = milestones.filter(m => 
      m.status !== 'completed' && m.due_date && new Date(m.due_date) < new Date()
    ).length;
    const totalKpis = kpiRefs.length;
    const kpisOnTrack = kpiRefs.filter(k => 
      k.current_value && k.target_value && (k.current_value / k.target_value) >= 0.7
    ).length;
    const avgProgress = initiativeData.length > 0 
      ? Math.round(initiativeData.reduce((sum, i) => sum + i.progress, 0) / initiativeData.length)
      : 0;
    const atRisk = initiativeData.filter(i => i.health_score < 60).length;
    
    return { 
      totalMilestones, 
      completedMilestones, 
      overdueMilestones,
      totalKpis, 
      kpisOnTrack, 
      avgProgress,
      atRisk,
      initiatives: initiativeData.length
    };
  }, [milestones, kpiRefs, initiativeData]);

  const healthColor = (score) => {
    if (score >= 75) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    if (score >= 50) return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
  };

  const statusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'on_hold': return 'bg-amber-100 text-amber-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isLoading = contextLoading || milestonesLoading || kpisLoading;

  return (
    <div className="container mx-auto p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/strategy-hub">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Workflow className="h-6 w-6 text-primary" />
              {t({ en: 'Strategic Initiative Tracker', ar: 'متتبع المبادرات الاستراتيجية' })}
            </h1>
            <p className="text-muted-foreground">
              {t({ en: 'Track strategic initiatives with milestones and KPIs', ar: 'تتبع المبادرات الاستراتيجية مع المعالم والمؤشرات' })}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
          {t({ en: 'Refresh', ar: 'تحديث' })}
        </Button>
      </div>

      {/* Active Plan Banner */}
      <ActivePlanBanner />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.initiatives}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Initiatives', ar: 'المبادرات' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Avg Progress', ar: 'متوسط التقدم' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Flag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedMilestones}/{stats.totalMilestones}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Milestones', ar: 'المعالم' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.atRisk}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Overview */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t({ en: 'KPI Performance', ar: 'أداء المؤشرات' })}
          </CardTitle>
          <CardDescription>
            {t({ en: 'Track key performance indicators against targets', ar: 'تتبع مؤشرات الأداء الرئيسية مقابل الأهداف' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : kpiRefs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{t({ en: 'No KPIs defined yet', ar: 'لم يتم تعريف مؤشرات أداء بعد' })}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpiRefs.slice(0, 6).map(kpi => {
                const progress = kpi.target_value ? Math.round((kpi.current_value || 0) / kpi.target_value * 100) : 0;
                const isOnTrack = progress >= 70;
                return (
                  <div key={kpi.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm truncate">
                        {language === 'ar' ? kpi.name_ar || kpi.name_en : kpi.name_en}
                      </h4>
                      <Badge variant={isOnTrack ? 'default' : 'secondary'} className="text-xs">
                        {isOnTrack ? t({ en: 'On Track', ar: 'على المسار' }) : t({ en: 'Behind', ar: 'متأخر' })}
                      </Badge>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{kpi.current_value || 0} {kpi.unit || ''}</span>
                      <span>{t({ en: 'Target', ar: 'الهدف' })}: {kpi.target_value || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {kpiRefs.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="link" asChild>
                <Link to="/strategic-kpi-tracker">
                  {t({ en: 'View All KPIs', ar: 'عرض جميع المؤشرات' })} →
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-purple-600" />
            {t({ en: 'Milestones', ar: 'المعالم' })}
          </CardTitle>
          <CardDescription>
            {stats.overdueMilestones > 0 && (
              <span className="text-amber-600">
                {stats.overdueMilestones} {t({ en: 'overdue', ar: 'متأخرة' })} • 
              </span>
            )}
            {stats.completedMilestones} {t({ en: 'of', ar: 'من' })} {stats.totalMilestones} {t({ en: 'completed', ar: 'مكتملة' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{t({ en: 'No milestones defined yet', ar: 'لم يتم تعريف معالم بعد' })}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.slice(0, 5).map(milestone => {
                const isOverdue = milestone.status !== 'completed' && milestone.due_date && new Date(milestone.due_date) < new Date();
                return (
                  <div key={milestone.id} className={`p-3 border rounded-lg flex items-center justify-between ${isOverdue ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        isOverdue ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">
                          {language === 'ar' ? milestone.title_ar || milestone.title_en : milestone.title_en}
                        </p>
                        {milestone.due_date && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(milestone.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                      {milestone.status === 'completed' ? t({ en: 'Done', ar: 'مكتمل' }) : 
                       isOverdue ? t({ en: 'Overdue', ar: 'متأخر' }) : t({ en: 'In Progress', ar: 'قيد التنفيذ' })}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
          {milestones.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="link" asChild>
                <Link to="/strategy-timeline-page">
                  {t({ en: 'View All Milestones', ar: 'عرض جميع المعالم' })} →
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Initiatives List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t({ en: 'Strategic Initiatives', ar: 'المبادرات الاستراتيجية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : initiativeData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>{t({ en: 'No strategic initiatives found', ar: 'لم يتم العثور على مبادرات استراتيجية' })}</p>
              <p className="text-sm mt-2">
                {t({ en: 'Create or select a strategic plan to see initiatives', ar: 'أنشئ أو اختر خطة استراتيجية لرؤية المبادرات' })}
              </p>
              <Button className="mt-4" asChild>
                <Link to="/strategy-hub">
                  {t({ en: 'Go to Strategy Hub', ar: 'الذهاب إلى مركز الاستراتيجية' })}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {initiativeData.map(initiative => (
                <div key={initiative.id} className="p-4 border-2 rounded-lg hover:border-primary/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline">{initiative.code}</Badge>
                        <Badge className={healthColor(initiative.health_score)}>
                          {t({ en: 'Health', ar: 'الصحة' })}: {initiative.health_score}%
                        </Badge>
                        <Badge className={statusColor(initiative.status)}>
                          {initiative.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{initiative.title[language]}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t({ en: 'Owner', ar: 'المالك' })}: {initiative.owner}
                      </p>
                      {initiative.timeframe_start && initiative.timeframe_end && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {initiative.timeframe_start} → {initiative.timeframe_end}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/strategy-drill-down?plan=${initiative.id}`}>
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{t({ en: 'Progress', ar: 'التقدم' })}</p>
                      <Progress value={initiative.progress} className="h-2 mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">{initiative.progress}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t({ en: 'Milestones', ar: 'المعالم' })}</p>
                      <p className="text-sm font-medium">
                        {initiative.milestones_completed}/{initiative.milestones_total}
                        {initiative.milestones_overdue > 0 && (
                          <span className="text-amber-600 text-xs ml-1">({initiative.milestones_overdue} {t({ en: 'overdue', ar: 'متأخرة' })})</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t({ en: 'KPIs', ar: 'المؤشرات' })}</p>
                      <p className="text-sm font-medium">
                        {initiative.kpis_on_track}/{initiative.kpis_total} {t({ en: 'on track', ar: 'على المسار' })}
                      </p>
                    </div>
                    <div className="flex items-end">
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to={`/strategy-drill-down?plan=${initiative.id}`}>
                          {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Related Tools', ar: 'أدوات ذات صلة' })}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button variant="outline" asChild>
            <Link to="/strategy-cockpit">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t({ en: 'Strategy Cockpit', ar: 'لوحة القيادة' })}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/strategic-kpi-tracker">
              <Target className="h-4 w-4 mr-2" />
              {t({ en: 'KPI Tracker', ar: 'متتبع المؤشرات' })}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/strategy-timeline-page">
              <Calendar className="h-4 w-4 mr-2" />
              {t({ en: 'Timeline View', ar: 'عرض الجدول الزمني' })}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/gap-analysis-tool">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t({ en: 'Gap Analysis', ar: 'تحليل الفجوات' })}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategicInitiativeTracker, { requiredPermissions: [] });
