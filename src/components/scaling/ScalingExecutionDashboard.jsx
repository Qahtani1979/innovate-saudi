import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Circle, AlertCircle, TrendingUp, MapPin, Calendar, DollarSign, Users, Activity } from 'lucide-react';

export default function ScalingExecutionDashboard({ scalingPlanId }) {
  const { t, isRTL } = useLanguage();
  const [plan, setPlan] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [scalingPlanId]);

  const loadData = async () => {
    try {
      const planData = await base44.entities.ScalingPlan.filter({ id: scalingPlanId });
      setPlan(planData[0]);
      
      // Mock deployment tracking data
      const muniIds = planData[0]?.target_municipalities || [];
      const municipalities = await base44.entities.Municipality.list();
      const deploys = muniIds.map(id => {
        const muni = municipalities.find(m => m.id === id);
        return {
          municipality_id: id,
          municipality_name: muni?.name_en,
          municipality_name_ar: muni?.name_ar,
          status: ['planning', 'in_progress', 'completed', 'on_hold'][Math.floor(Math.random() * 4)],
          progress: Math.floor(Math.random() * 100),
          kpi_status: ['on_track', 'at_risk', 'off_track'][Math.floor(Math.random() * 3)],
          issues_count: Math.floor(Math.random() * 5),
          last_updated: new Date().toISOString()
        };
      });
      setDeployments(deploys);
    } catch (error) {
      console.error('Failed to load scaling data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div>;
  }

  const overallProgress = deployments.length > 0
    ? deployments.reduce((sum, d) => sum + d.progress, 0) / deployments.length
    : 0;

  const statusCounts = {
    planning: deployments.filter(d => d.status === 'planning').length,
    in_progress: deployments.filter(d => d.status === 'in_progress').length,
    completed: deployments.filter(d => d.status === 'completed').length,
    on_hold: deployments.filter(d => d.status === 'on_hold').length
  };

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <Activity className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-blue-900">{overallProgress.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Overall Progress', ar: 'التقدم الإجمالي' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-green-900">{statusCounts.completed}/{deployments.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-amber-600 mb-2" />
            <p className="text-3xl font-bold text-amber-900">{statusCounts.in_progress}</p>
            <p className="text-xs text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-xl font-bold text-purple-900">{plan?.estimated_budget?.toLocaleString()}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Budget', ar: 'الميزانية الكلية' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Municipality Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Municipality Deployment Status', ar: 'حالة النشر حسب البلدية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deployments.map((deploy, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-semibold text-sm">
                        {isRTL ? deploy.municipality_name_ar : deploy.municipality_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={
                          deploy.status === 'completed' ? 'bg-green-100 text-green-700' :
                          deploy.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          deploy.status === 'on_hold' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {deploy.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={
                          deploy.kpi_status === 'on_track' ? 'bg-green-100 text-green-700' :
                          deploy.kpi_status === 'at_risk' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          KPI: {deploy.kpi_status.replace('_', ' ')}
                        </Badge>
                        {deploy.issues_count > 0 && (
                          <Badge variant="outline" className="text-red-600">
                            {deploy.issues_count} issues
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{deploy.progress}%</p>
                  </div>
                </div>
                <Progress value={deploy.progress} className="h-2" />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline">{t({ en: 'View Details', ar: 'عرض التفاصيل' })}</Button>
                  <Button size="sm" variant="outline">{t({ en: 'Report Issue', ar: 'إبلاغ عن مشكلة' })}</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Phase Timeline', ar: 'الجدول الزمني للمراحل' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plan?.phases?.map((phase, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    i === 0 ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {i === 0 ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </div>
                  {i < plan.phases.length - 1 && <div className="h-16 w-0.5 bg-slate-200" />}
                </div>
                <div className="flex-1 pb-8">
                  <p className="font-semibold">{phase.name_en}</p>
                  <p className="text-sm text-slate-600">{phase.duration_months} months • {phase.target_municipalities?.length || 0} municipalities</p>
                  <Badge className="mt-2">{phase.status || 'planned'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}