import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Star,
  TestTube, Target, Activity, Award, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SolutionHealthDashboard() {
  const { language, isRTL, t } = useLanguage();

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-health'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-health'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['solution-reviews'],
    queryFn: () => base44.entities.SolutionReview.list()
  });

  // Calculate health metrics per solution
  const solutionMetrics = solutions.map(solution => {
    const solutionPilots = pilots.filter(p => p.solution_id === solution.id);
    const solutionReviews = reviews.filter(r => r.solution_id === solution.id);
    
    const activePilots = solutionPilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length;
    const completedPilots = solutionPilots.filter(p => p.stage === 'completed').length;
    const successfulPilots = solutionPilots.filter(p => p.recommendation === 'scale').length;
    
    const successRate = completedPilots > 0 
      ? (successfulPilots / completedPilots) * 100 
      : 0;
    
    const avgRating = solutionReviews.length > 0
      ? solutionReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / solutionReviews.length
      : 0;

    const deploymentHealth = solution.deployment_count > 0 ? 100 : 
                             completedPilots > 0 ? 70 :
                             activePilots > 0 ? 50 : 20;

    const verificationHealth = solution.is_verified ? 100 : 50;
    const performanceHealth = successRate;
    const feedbackHealth = avgRating * 20; // Convert 5-star to 100 scale

    const overallHealth = Math.round(
      (deploymentHealth * 0.3) +
      (verificationHealth * 0.2) +
      (performanceHealth * 0.3) +
      (feedbackHealth * 0.2)
    );

    return {
      ...solution,
      totalPilots: solutionPilots.length,
      activePilots,
      completedPilots,
      successfulPilots,
      successRate,
      avgRating,
      reviewCount: solutionReviews.length,
      overallHealth,
      healthTrend: solution.deployment_count > 0 ? 'up' : activePilots > 0 ? 'stable' : 'new'
    };
  });

  const healthyCount = solutionMetrics.filter(s => s.overallHealth >= 70).length;
  const atRiskCount = solutionMetrics.filter(s => s.overallHealth < 50).length;
  const avgHealth = Math.round(solutionMetrics.reduce((sum, s) => sum + s.overallHealth, 0) / Math.max(solutionMetrics.length, 1));

  const healthDistribution = [
    { range: '90-100%', count: solutionMetrics.filter(s => s.overallHealth >= 90).length, color: '#10b981' },
    { range: '70-89%', count: solutionMetrics.filter(s => s.overallHealth >= 70 && s.overallHealth < 90).length, color: '#3b82f6' },
    { range: '50-69%', count: solutionMetrics.filter(s => s.overallHealth >= 50 && s.overallHealth < 70).length, color: '#f59e0b' },
    { range: '0-49%', count: solutionMetrics.filter(s => s.overallHealth < 50).length, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t({ en: '📊 Solution Performance & Health Dashboard', ar: '📊 لوحة أداء وصحة الحلول' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track solution success rates, deployment health, and pilot performance', ar: 'تتبع معدلات نجاح الحلول وصحة النشر وأداء التجارب' })}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{solutions.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Solutions', ar: 'إجمالي الحلول' })}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-300">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{healthyCount}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Healthy (70%+)', ar: 'صحية (70%+)' })}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-300">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{atRiskCount}</p>
            <p className="text-xs text-slate-600">{t({ en: 'At Risk (<50%)', ar: 'معرضة للخطر (<50%)' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TestTube className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{pilots.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Pilots', ar: 'إجمالي التجارب' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{avgHealth}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Health', ar: 'متوسط الصحة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Health Distribution', ar: 'توزيع الصحة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={healthDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Solutions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            {t({ en: 'Solution Performance Tracking', ar: 'تتبع أداء الحلول' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {solutionMetrics.sort((a, b) => b.overallHealth - a.overallHealth).map((solution) => (
              <div key={solution.id} className="p-4 border-2 rounded-lg hover:border-purple-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link to={createPageUrl('SolutionDetail') + `?id=${solution.id}`} className="hover:underline">
                      <h3 className="font-bold text-slate-900">{solution.name_en || solution.name_ar}</h3>
                    </Link>
                    <p className="text-xs text-slate-600 mt-1">{solution.provider_name}</p>
                  </div>
                  <Badge className={
                    solution.overallHealth >= 70 ? 'bg-green-600' :
                    solution.overallHealth >= 50 ? 'bg-blue-600' :
                    solution.overallHealth >= 30 ? 'bg-amber-600' : 'bg-red-600'
                  }>
                    {solution.overallHealth}% Health
                  </Badge>
                </div>

                <div className="grid grid-cols-6 gap-3 mb-3">
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-lg font-bold text-purple-600">{solution.totalPilots}</p>
                    <p className="text-xs text-slate-600">Total Pilots</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-lg font-bold text-blue-600">{solution.activePilots}</p>
                    <p className="text-xs text-slate-600">Active</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-600">{solution.completedPilots}</p>
                    <p className="text-xs text-slate-600">Completed</p>
                  </div>
                  <div className="text-center p-2 bg-teal-50 rounded">
                    <p className="text-lg font-bold text-teal-600">{Math.round(solution.successRate)}%</p>
                    <p className="text-xs text-slate-600">Success</p>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded">
                    <p className="text-lg font-bold text-amber-600">{solution.avgRating.toFixed(1)}</p>
                    <p className="text-xs text-slate-600">Rating</p>
                  </div>
                  <div className="text-center p-2 bg-rose-50 rounded">
                    <p className="text-lg font-bold text-rose-600">{solution.deployment_count || 0}</p>
                    <p className="text-xs text-slate-600">Deployed</p>
                  </div>
                </div>

                <Progress value={solution.overallHealth} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(SolutionHealthDashboard, { requiredPermissions: ['solution_view_all'] });