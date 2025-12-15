import React, { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Target, CheckCircle2, AlertTriangle, TrendingUp, Users, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function StrategicInitiativeTracker() {
  const { language, isRTL, t } = useLanguage();

  // Fetch strategic plans as initiatives
  const { data: strategicPlans = [], isLoading } = useQuery({
    queryKey: ['strategic-plans-initiatives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .or('is_template.is.null,is_template.eq.false')
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones-initiatives'],
    queryFn: async () => {
      const { data } = await supabase
        .from('milestones')
        .select('id, title_en, status, entity_id, entity_type');
      return data || [];
    }
  });

  // Fetch KPI references
  const { data: kpiRefs = [] } = useQuery({
    queryKey: ['kpi-refs-initiatives'],
    queryFn: async () => {
      const { data } = await supabase
        .from('kpi_references')
        .select('id, name_en, current_value, target_value, entity_id');
      return data || [];
    }
  });

  // Transform strategic plans into initiatives format
  const initiatives = useMemo(() => {
    return strategicPlans.map(plan => {
      const planMilestones = milestones.filter(m => m.entity_id === plan.id);
      const planKpis = kpiRefs.filter(k => k.entity_id === plan.id);
      const completedMilestones = planMilestones.filter(m => m.status === 'completed').length;
      const kpisOnTrack = planKpis.filter(k => 
        k.current_value && k.target_value && (k.current_value / k.target_value) >= 0.7
      ).length;
      
      // Calculate health score
      const milestoneProgress = planMilestones.length > 0 
        ? (completedMilestones / planMilestones.length) * 100 
        : 50;
      const kpiProgress = planKpis.length > 0 
        ? (kpisOnTrack / planKpis.length) * 100 
        : 50;
      const healthScore = Math.round((milestoneProgress + kpiProgress) / 2);
      
      return {
        id: plan.id,
        code: plan.code || `SP-${plan.id.slice(0, 8)}`,
        title: { 
          en: plan.title_en || plan.name_en || 'Untitled Initiative', 
          ar: plan.title_ar || plan.name_ar || 'مبادرة بدون عنوان' 
        },
        owner: plan.owner || plan.created_by || 'Not assigned',
        status: plan.status || 'active',
        progress: plan.progress_percentage || Math.round((completedMilestones / Math.max(planMilestones.length, 1)) * 100),
        milestones_completed: completedMilestones,
        milestones_total: planMilestones.length || 1,
        kpis_on_track: kpisOnTrack,
        kpis_total: planKpis.length || 1,
        budget_spent: plan.budget_spent_percentage || 50,
        health_score: healthScore
      };
    });
  }, [strategicPlans, milestones, kpiRefs]);

  const healthColor = (score) => {
    if (score >= 75) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Strategic Initiative Tracker', ar: 'متتبع المبادرات الاستراتيجية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track strategic initiatives with milestones and KPIs', ar: 'تتبع المبادرات الاستراتيجية مع المعالم والمؤشرات' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{initiatives.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Initiatives', ar: 'مبادرات نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {initiatives.length > 0 
                ? Math.round(initiatives.reduce((sum, i) => sum + i.progress, 0) / initiatives.length)
                : 0}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Progress', ar: 'متوسط التقدم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {initiatives.reduce((sum, i) => sum + i.milestones_completed, 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Milestones Done', ar: 'معالم منجزة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">
              {initiatives.filter(i => i.health_score < 60).length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Initiatives List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Strategic Initiatives', ar: 'المبادرات الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {initiatives.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>{t({ en: 'No strategic initiatives found', ar: 'لم يتم العثور على مبادرات استراتيجية' })}</p>
              <p className="text-sm mt-2">
                {t({ en: 'Create strategic plans to see them here', ar: 'أنشئ خططًا استراتيجية لرؤيتها هنا' })}
              </p>
            </div>
          ) : (
            initiatives.map(initiative => (
              <div key={initiative.id} className="p-4 border-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{initiative.code}</Badge>
                      <Badge className={healthColor(initiative.health_score)}>
                        {t({ en: 'Health', ar: 'الصحة' })}: {initiative.health_score}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900">{initiative.title[language]}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {t({ en: 'Owner', ar: 'المالك' })}: {initiative.owner}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-500">{t({ en: 'Progress', ar: 'التقدم' })}</p>
                    <Progress value={initiative.progress} className="h-2 mt-1" />
                    <p className="text-xs text-slate-600 mt-1">{initiative.progress}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t({ en: 'Milestones', ar: 'المعالم' })}</p>
                    <p className="text-sm font-medium text-slate-900">
                      {initiative.milestones_completed}/{initiative.milestones_total}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t({ en: 'KPIs', ar: 'المؤشرات' })}</p>
                    <p className="text-sm font-medium text-slate-900">
                      {initiative.kpis_on_track}/{initiative.kpis_total} {t({ en: 'on track', ar: 'على المسار' })}
                    </p>
                  </div>
                </div>

                <Link to={createPageUrl(`StrategicPlanDetail?id=${initiative.id}`)}>
                  <Button variant="outline" size="sm">
                    {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                  </Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategicInitiativeTracker, { requiredPermissions: [] });
