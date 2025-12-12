import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Activity, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2,
  Clock, Target, Users, MapPin, BarChart3, Zap, AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PilotMonitoringDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedPilot, setSelectedPilot] = useState(null);

  const { data: activePilots = [] } = useQuery({
    queryKey: ['active-monitoring-pilots'],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => ['active', 'monitoring'].includes(p.stage));
    }
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const selectedPilotData = selectedPilot ? activePilots.find(p => p.id === selectedPilot) : activePilots[0];

  // Mock real-time data
  const mockKPITrend = [
    { date: '2025-01-01', value: 125, target: 100 },
    { date: '2025-01-08', value: 118, target: 95 },
    { date: '2025-01-15', value: 105, target: 90 },
    { date: '2025-01-22', value: 92, target: 85 },
    { date: '2025-01-29', value: 78, target: 80 },
  ];

  const getKPIStatus = (kpi) => {
    if (!kpi.current || !kpi.target) return 'unknown';
    const current = parseFloat(kpi.current);
    const target = parseFloat(kpi.target);
    const baseline = parseFloat(kpi.baseline);
    const progress = baseline !== target ? ((baseline - current) / (baseline - target)) * 100 : 50;
    
    if (progress >= 80) return 'on_track';
    if (progress >= 50) return 'at_risk';
    return 'off_track';
  };

  const stats = {
    total: activePilots.length,
    on_track: activePilots.filter(p => !p.risk_level || p.risk_level === 'low').length,
    at_risk: activePilots.filter(p => p.risk_level === 'medium').length,
    off_track: activePilots.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length,
    avg_success: activePilots.length > 0 ? Math.round(activePilots.reduce((acc, p) => acc + (p.success_probability || 0), 0) / activePilots.length) : 0
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Activity}
        title={{ en: 'Pilot Monitoring Command Center', ar: 'مركز قيادة مراقبة التجارب' }}
        subtitle={{ en: 'Track active pilots in real-time', ar: 'تتبع التجارب النشطة في الوقت الفعلي' }}
        stats={[
          { icon: Activity, value: stats.total, label: { en: 'Active', ar: 'نشط' } },
          { icon: CheckCircle2, value: stats.on_track, label: { en: 'On Track', ar: 'على المسار' } },
          { icon: AlertTriangle, value: stats.at_risk, label: { en: 'At Risk', ar: 'في خطر' } },
          { icon: AlertCircle, value: stats.off_track, label: { en: 'Off Track', ar: 'خارج المسار' } },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white/20 text-white border-white/40">
              {t({ en: 'Real-Time Monitoring', ar: 'المراقبة الفورية' })}
            </Badge>
            <Badge className="bg-green-500 text-white animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              {t({ en: 'Live', ar: 'مباشر' })}
            </Badge>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{t({ en: 'On Track', ar: 'على المسار' })}</p>
              <p className="text-3xl font-bold text-green-600">{stats.on_track}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.at_risk}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{t({ en: 'Off Track', ar: 'خارج المسار' })}</p>
              <p className="text-3xl font-bold text-red-600">{stats.off_track}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">{t({ en: 'Avg Success', ar: 'متوسط النجاح' })}</p>
              <p className="text-3xl font-bold text-purple-600">{stats.avg_success}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pilot List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })} ({activePilots.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {activePilots.map((pilot) => {
              const municipality = municipalities.find(m => m.id === pilot.municipality_id);
              const isSelected = selectedPilotData?.id === pilot.id;
              const riskColor = pilot.risk_level === 'low' ? 'bg-green-100 text-green-700' :
                              pilot.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700';
              
              return (
                <div
                  key={pilot.id}
                  onClick={() => setSelectedPilot(pilot.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900 line-clamp-1">{pilot.title_en}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{pilot.code}</Badge>
                        <Badge className={`${riskColor} text-xs`}>{pilot.risk_level || 'low'}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {municipality?.name_en || 'N/A'}
                  </div>
                </div>
              );
            })}
            {activePilots.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm">{t({ en: 'No active pilots', ar: 'لا توجد تجارب نشطة' })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Panel */}
        {selectedPilotData && (
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedPilotData.title_en}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{selectedPilotData.code}</p>
                  </div>
                  <Link to={createPageUrl(`PilotDetail?id=${selectedPilotData.id}`)}>
                    <Button variant="outline" size="sm">{t({ en: 'Full Details', ar: 'التفاصيل الكاملة' })}</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <Clock className="h-5 w-5 text-slate-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Weeks Remaining</p>
                    <p className="text-xl font-bold">{selectedPilotData.duration_weeks - 3 || 5}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <Target className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Success Prob.</p>
                    <p className="text-xl font-bold text-green-600">{selectedPilotData.success_probability || 70}%</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <BarChart3 className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">KPIs On Track</p>
                    <p className="text-xl font-bold text-blue-600">
                      {selectedPilotData.kpis?.filter(k => k.status === 'on_track').length || 0}/{selectedPilotData.kpis?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'KPI Performance', ar: 'أداء المؤشرات' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPilotData.kpis && selectedPilotData.kpis.length > 0 ? (
                  selectedPilotData.kpis.map((kpi, idx) => {
                    const status = kpi.status || getKPIStatus(kpi);
                    const statusConfig = {
                      on_track: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
                      at_risk: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle },
                      off_track: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle }
                    }[status] || { color: 'text-slate-600', bg: 'bg-slate-100', icon: Activity };
                    
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                            <p className="font-medium text-sm">{kpi.name}</p>
                          </div>
                          <Badge className={statusConfig.bg + ' ' + statusConfig.color}>
                            {status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-500">Baseline: {kpi.baseline}</span>
                          <span className="text-slate-500">Current: {kpi.current || 'N/A'}</span>
                          <span className="text-green-600 font-medium">Target: {kpi.target}</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No KPIs defined</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Trend Analysis', ar: 'تحليل الاتجاه' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockKPITrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Milestone Progress', ar: 'تقدم المعالم' })}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPilotData.milestones && selectedPilotData.milestones.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPilotData.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {milestone.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {milestone.status === 'in_progress' && <Activity className="h-5 w-5 text-blue-600 animate-pulse" />}
                        {milestone.status === 'pending' && <Clock className="h-5 w-5 text-slate-400" />}
                        {milestone.status === 'delayed' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        
                        <div className="flex-1">
                          <p className="text-sm font-medium">{milestone.name}</p>
                          <p className="text-xs text-slate-500">{milestone.due_date}</p>
                        </div>
                        <Badge className={
                          milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                          milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          milestone.status === 'delayed' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {milestone.status || 'pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No milestones defined</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Active Alerts', ar: 'التنبيهات النشطة' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPilotData.kpis?.filter(k => k.status === 'off_track' || k.status === 'at_risk').length > 0 ? (
                  selectedPilotData.kpis.filter(k => k.status === 'off_track' || k.status === 'at_risk').map((kpi, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border-2 ${
                      kpi.status === 'off_track' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 ${kpi.status === 'off_track' ? 'text-red-600' : 'text-yellow-600'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{kpi.name} {kpi.status === 'off_track' ? 'critically off track' : 'needs attention'}</p>
                          <p className="text-xs text-slate-600 mt-1">Current: {kpi.current} | Target: {kpi.target}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-green-600">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">{t({ en: 'All metrics on track', ar: 'جميع المقاييس على المسار' })}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(PilotMonitoringDashboard, { requiredPermissions: [] });