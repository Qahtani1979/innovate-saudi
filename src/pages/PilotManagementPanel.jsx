import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  FileText, Clock, CheckCircle2, Activity, BarChart3, TrendingUp,
  AlertTriangle, Target, Users, Zap, Sparkles, ArrowRight, Rocket,
  RefreshCw, XCircle, Pause, Play, Award, TestTube, Shield, Calendar
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PilotManagementPanel() {
  const { language, isRTL, t } = useLanguage();
  const [selectedStage, setSelectedStage] = useState('all');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // RLS: Admins see all, municipalities see their own pilots
  const { data: pilots = [], isLoading } = useQuery({
    queryKey: ['all-pilots', user?.email, user?.role],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      if (user?.role === 'admin') return all;
      // Municipality users see only their city's pilots
      const userOrgs = await base44.entities.Organization.list();
      const userOrg = userOrgs.find(o => 
        o.contact_email === user?.email || 
        o.primary_contact_name === user?.full_name
      );
      if (userOrg?.org_type === 'municipality') {
        return all.filter(p => p.municipality_id === userOrg.id);
      }
      return all;
    },
    enabled: !!user
  });

  // Group pilots by stage
  const pilotsByStage = {
    design: pilots.filter(p => p.stage === 'design'),
    approval_pending: pilots.filter(p => p.stage === 'approval_pending'),
    approved: pilots.filter(p => p.stage === 'approved'),
    preparation: pilots.filter(p => p.stage === 'preparation'),
    active: pilots.filter(p => p.stage === 'active'),
    monitoring: pilots.filter(p => p.stage === 'monitoring'),
    evaluation: pilots.filter(p => p.stage === 'evaluation'),
    completed: pilots.filter(p => p.stage === 'completed'),
    scaled: pilots.filter(p => p.stage === 'scaled'),
    on_hold: pilots.filter(p => p.stage === 'on_hold'),
    terminated: pilots.filter(p => p.stage === 'terminated')
  };

  // Decision gates
  const needIteration = pilots.filter(p => p.recommendation === 'iterate');
  const readyToScale = pilots.filter(p => p.recommendation === 'scale' && p.stage === 'completed');
  const needTermination = pilots.filter(p => p.recommendation === 'terminate');

  const stages = [
    { key: 'design', label: { en: 'Design', ar: 'التصميم' }, icon: FileText, color: 'slate', action: 'PilotCreate' },
    { key: 'approval_pending', label: { en: 'Approval', ar: 'الموافقة' }, icon: Clock, color: 'yellow', action: 'Approvals' },
    { key: 'approved', label: { en: 'Approved', ar: 'موافق عليه' }, icon: CheckCircle2, color: 'blue', action: null },
    { key: 'preparation', label: { en: 'Prep', ar: 'الإعداد' }, icon: Activity, color: 'purple', action: 'PilotLaunchWizard' },
    { key: 'active', label: { en: 'Active', ar: 'نشط' }, icon: Zap, color: 'green', action: 'PilotMonitoringDashboard' },
    { key: 'monitoring', label: { en: 'Monitor', ar: 'المراقبة' }, icon: BarChart3, color: 'teal', action: 'PilotMonitoringDashboard' },
    { key: 'evaluation', label: { en: 'Eval', ar: 'التقييم' }, icon: Target, color: 'amber', action: 'PilotEvaluations' },
    { key: 'completed', label: { en: 'Done', ar: 'مكتمل' }, icon: CheckCircle2, color: 'green', action: null },
    { key: 'scaled', label: { en: 'Scaled', ar: 'موسع' }, icon: TrendingUp, color: 'blue', action: 'ScalingWorkflow' },
    { key: 'on_hold', label: { en: 'Hold', ar: 'متوقف' }, icon: Pause, color: 'gray', action: null },
    { key: 'terminated', label: { en: 'Term', ar: 'منتهي' }, icon: XCircle, color: 'red', action: null }
  ];

  const getStageColor = (stage) => {
    const config = stages.find(s => s.key === stage);
    return config?.color || 'slate';
  };

  const filteredPilots = selectedStage === 'all' ? pilots : pilotsByStage[selectedStage] || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <Badge variant="outline" className="bg-white/20 text-white border-white/40 mb-3">
            <TestTube className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            {t({ en: 'Pilot Command Center', ar: 'مركز قيادة التجارب' })}
          </Badge>
          <h1 className="text-5xl font-bold mb-2">
            {t({ en: 'Pilot Management Panel', ar: 'لوحة إدارة التجارب' })}
          </h1>
          <p className="text-xl text-white/90">
            {t({ en: 'Centralized oversight of all pilot stages, gates & workflows', ar: 'إشراف مركزي على جميع مراحل التجارب والبوابات وسير العمل' })}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm">{pilots.length} {t({ en: 'Total Pilots', ar: 'إجمالي التجارب' })}</span>
            <span className="text-sm">•</span>
            <span className="text-sm">{pilotsByStage.active.length + pilotsByStage.monitoring.length} {t({ en: 'Active', ar: 'نشط' })}</span>
            <span className="text-sm">•</span>
            <span className="text-sm">{pilotsByStage.scaled.length} {t({ en: 'Scaled', ar: 'موسع' })}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Link to={createPageUrl('PilotCreate')}>
              <Button className="w-full" size="sm">
                <Rocket className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'New Pilot', ar: 'تجربة جديدة' })}
              </Button>
            </Link>
            <Link to={createPageUrl('Approvals')}>
              <Button variant="outline" className="w-full" size="sm">
                <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Approvals', ar: 'الموافقات' })} ({pilotsByStage.approval_pending.length})
              </Button>
            </Link>
            <Link to={createPageUrl('PilotMonitoringDashboard')}>
              <Button variant="outline" className="w-full" size="sm">
                <Activity className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Monitor', ar: 'مراقبة' })}
              </Button>
            </Link>
            <Link to={createPageUrl('PilotEvaluations')}>
              <Button variant="outline" className="w-full" size="sm">
                <Target className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Evaluate', ar: 'تقييم' })}
              </Button>
            </Link>
            <Link to={createPageUrl('Pilots')}>
              <Button variant="outline" className="w-full" size="sm">
                <TestTube className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'All Pilots', ar: 'كل التجارب' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stage Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const count = pilotsByStage[stage.key]?.length || 0;
          const Icon = stage.icon;
          return (
            <Card 
              key={stage.key} 
              className={`cursor-pointer transition-all hover:shadow-lg ${selectedStage === stage.key ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedStage(stage.key)}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 text-${stage.color}-600`} />
                  <p className="text-3xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-600 mt-1">{stage.label[language]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Decision Gates - Critical Actions Needed */}
      {(needIteration.length > 0 || readyToScale.length > 0 || needTermination.length > 0 || pilotsByStage.on_hold.length > 0) && (
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'Decision Gates - Action Required', ar: 'بوابات القرار - إجراء مطلوب' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {needIteration.length > 0 && (
                <Link to={createPageUrl('IterationWorkflow')}>
                  <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <RefreshCw className="h-5 w-5 text-orange-600" />
                      <Badge className="bg-orange-600 text-white">{needIteration.length}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-orange-900">{t({ en: 'Need Iteration', ar: 'تحتاج تحسين' })}</p>
                    <p className="text-xs text-orange-700 mt-1">{t({ en: 'Refine & relaunch', ar: 'تحسين وإعادة الإطلاق' })}</p>
                  </div>
                </Link>
              )}

              {readyToScale.length > 0 && (
                <Link to={createPageUrl('ScalingWorkflow')}>
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <Badge className="bg-green-600 text-white">{readyToScale.length}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-green-900">{t({ en: 'Ready to Scale', ar: 'جاهز للتوسع' })}</p>
                    <p className="text-xs text-green-700 mt-1">{t({ en: 'Approve scaling', ar: 'الموافقة على التوسع' })}</p>
                  </div>
                </Link>
              )}

              {needTermination.length > 0 && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <Badge className="bg-red-600 text-white">{needTermination.length}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-red-900">{t({ en: 'Termination Review', ar: 'مراجعة الإنهاء' })}</p>
                  <p className="text-xs text-red-700 mt-1">{t({ en: 'Close failed pilots', ar: 'إغلاق التجارب الفاشلة' })}</p>
                </div>
              )}

              {pilotsByStage.on_hold.length > 0 && (
                <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <Pause className="h-5 w-5 text-gray-600" />
                    <Badge className="bg-gray-600 text-white">{pilotsByStage.on_hold.length}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{t({ en: 'On Hold', ar: 'متوقف' })}</p>
                  <p className="text-xs text-gray-700 mt-1">{t({ en: 'Review & resume', ar: 'مراجعة واستئناف' })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'In Pipeline', ar: 'في المسار' })}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {pilotsByStage.design.length + pilotsByStage.approval_pending.length + pilotsByStage.approved.length}
                </p>
              </div>
              <Rocket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Running', ar: 'جارية' })}</p>
                <p className="text-3xl font-bold text-green-600">
                  {pilotsByStage.active.length + pilotsByStage.monitoring.length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Success', ar: 'متوسط النجاح' })}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {pilots.length > 0 ? Math.round(pilots.reduce((sum, p) => sum + (p.success_probability || 0), 0) / pilots.length) : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Scaled', ar: 'موسعة' })}</p>
                <p className="text-3xl font-bold text-teal-600">{pilotsByStage.scaled.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t({ en: 'Pipeline', ar: 'المسار' })}
          </TabsTrigger>
          <TabsTrigger value="gates" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t({ en: 'Gates', ar: 'البوابات' })}
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t({ en: 'Portfolio', ar: 'المحفظة' })}
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            {t({ en: 'Workflows', ar: 'سير العمل' })}
          </TabsTrigger>
        </TabsList>

        {/* Pipeline View - Kanban Style */}
        <TabsContent value="pipeline" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={selectedStage === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStage('all')}
            >
              {t({ en: 'All', ar: 'الكل' })} ({pilots.length})
            </Button>
            {stages.map(stage => (
              <Button
                key={stage.key}
                variant={selectedStage === stage.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStage(stage.key)}
              >
                {stage.label[language]} ({pilotsByStage[stage.key]?.length || 0})
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredPilots.map((pilot) => {
              const stageInfo = stages.find(s => s.key === pilot.stage);
              const Icon = stageInfo?.icon || TestTube;
              const color = stageInfo?.color || 'slate';
              
              return (
                <Card key={pilot.id} className={`border-${isRTL ? 'r' : 'l'}-4 border-${isRTL ? 'r' : 'l'}-${color}-500 hover:shadow-lg transition-all`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">{pilot.code}</Badge>
                          <Badge className={`bg-${color}-100 text-${color}-700 flex items-center gap-1`}>
                            <Icon className="h-3 w-3" />
                            {stageInfo?.label[language]}
                          </Badge>
                          {pilot.sector && <Badge variant="outline">{pilot.sector.replace(/_/g, ' ')}</Badge>}
                          {pilot.is_flagship && (
                            <Badge className="bg-amber-500 text-white">
                              <Award className="h-3 w-3 mr-1" />
                              {t({ en: 'Flagship', ar: 'رائد' })}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                        </h3>
                        
                        <div className="grid grid-cols-4 gap-3 mt-3 text-xs">
                          <div>
                            <span className="text-slate-500">{t({ en: 'Success:', ar: 'النجاح:' })}</span>
                            <p className="font-medium text-purple-600">{pilot.success_probability || 70}%</p>
                          </div>
                          <div>
                            <span className="text-slate-500">{t({ en: 'Risk:', ar: 'المخاطر:' })}</span>
                            <p className={`font-medium ${
                              pilot.risk_level === 'high' ? 'text-red-600' :
                              pilot.risk_level === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>{pilot.risk_level || 'medium'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">{t({ en: 'KPIs:', ar: 'المؤشرات:' })}</span>
                            <p className="font-medium">{pilot.kpis?.length || 0}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">{t({ en: 'Budget:', ar: 'الميزانية:' })}</span>
                            <p className="font-medium">{pilot.budget ? `${(pilot.budget/1000).toFixed(0)}K` : 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                          <Button size="sm" variant="outline">
                            {t({ en: 'View', ar: 'عرض' })}
                          </Button>
                        </Link>
                        {stageInfo?.action && (
                          <Link to={createPageUrl(stageInfo.action + (stageInfo.action.includes('?') ? `&pilot=${pilot.id}` : `?id=${pilot.id}`))}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredPilots.length === 0 && (
            <div className="text-center py-12">
              <TestTube className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {t({ en: 'No pilots in this stage', ar: 'لا توجد تجارب في هذه المرحلة' })}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Gates & Transitions View */}
        <TabsContent value="gates" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Gate 1: Design → Approval */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Gate 1: Design → Approval', ar: 'البوابة 1: التصميم ← الموافقة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{t({ en: 'Pilots in Design', ar: 'التجارب قيد التصميم' })}</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Ready to submit for approval', ar: 'جاهزة للموافقة' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-slate-600 text-white text-lg">{pilotsByStage.design.length}</Badge>
                      <Link to={createPageUrl('PilotCreate')}>
                        <Button size="sm">{t({ en: 'Create New', ar: 'إنشاء جديد' })}</Button>
                      </Link>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    ✓ {t({ en: 'Criteria: Title, Challenge, Municipality, Sector, KPIs (3+), Timeline, Budget', ar: 'المعايير: العنوان، التحدي، البلدية، القطاع، المؤشرات (3+)، الجدول الزمني، الميزانية' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gate 2: Approval → Preparation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  {t({ en: 'Gate 2: Approval → Preparation', ar: 'البوابة 2: الموافقة ← الإعداد' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{t({ en: 'Pending Approvals', ar: 'الموافقات المعلقة' })}</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Multi-step approval workflow', ar: 'سير عمل متعدد الخطوات' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-yellow-600 text-white text-lg">{pilotsByStage.approval_pending.length}</Badge>
                      <Link to={createPageUrl('Approvals')}>
                        <Button size="sm">{t({ en: 'Review', ar: 'مراجعة' })}</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">{t({ en: 'Approved & Ready', ar: 'موافق عليها وجاهزة' })}</p>
                      <p className="text-xs text-blue-700">{t({ en: 'Can start preparation', ar: 'يمكن البدء بالإعداد' })}</p>
                    </div>
                    <Badge className="bg-blue-600 text-white text-lg">{pilotsByStage.approved.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    ✓ {t({ en: 'Workflow: Tech Lead → Budget Approval → Director → GDISB Final', ar: 'سير العمل: القائد التقني ← الموافقة على الميزانية ← المدير ← الموافقة النهائية' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gate 3: Preparation → Launch */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Gate 3: Preparation → Launch', ar: 'البوابة 3: الإعداد ← الإطلاق' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{t({ en: 'In Preparation', ar: 'قيد الإعداد' })}</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Pre-launch checklist & setup', ar: 'قائمة ما قبل الإطلاق والإعداد' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-600 text-white text-lg">{pilotsByStage.preparation.length}</Badge>
                      <Link to={createPageUrl('PilotLaunchWizard')}>
                        <Button size="sm">{t({ en: 'Launch', ar: 'إطلاق' })}</Button>
                      </Link>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    ✓ {t({ en: 'Checklist: Team assigned, Contracts signed, Tech deployed, Safety verified, Comms ready', ar: 'القائمة: تعيين الفريق، توقيع العقود، نشر التقنية، التحقق من السلامة، جاهزية التواصل' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gate 4: Active → Evaluation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  {t({ en: 'Gate 4: Active → Evaluation', ar: 'البوابة 4: نشط ← التقييم' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</p>
                      <p className="text-xs text-green-700">{t({ en: 'Real-time monitoring', ar: 'المراقبة المباشرة' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-600 text-white text-lg">{pilotsByStage.active.length}</Badge>
                      <Link to={createPageUrl('PilotMonitoringDashboard')}>
                        <Button size="sm">{t({ en: 'Monitor', ar: 'مراقبة' })}</Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium text-amber-900">{t({ en: 'In Evaluation', ar: 'قيد التقييم' })}</p>
                      <p className="text-xs text-amber-700">{t({ en: 'Data analysis & assessment', ar: 'تحليل البيانات والتقييم' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-amber-600 text-white text-lg">{pilotsByStage.evaluation.length}</Badge>
                      <Link to={createPageUrl('PilotEvaluations')}>
                        <Button size="sm">{t({ en: 'Evaluate', ar: 'تقييم' })}</Button>
                      </Link>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    ✓ {t({ en: 'Auto-transition when: Pilot end date reached + All KPI data collected', ar: 'الانتقال التلقائي عند: وصول تاريخ انتهاء التجربة + جمع جميع بيانات المؤشرات' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gate 5: Evaluation → Decision (Scale/Iterate/Terminate) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-teal-600" />
                  {t({ en: 'Gate 5: Evaluation → Decision', ar: 'البوابة 5: التقييم ← القرار' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-green-600">{readyToScale.length}</p>
                      <p className="text-xs text-green-700">{t({ en: 'Scale', ar: 'توسيع' })}</p>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                      <RefreshCw className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-orange-600">{needIteration.length}</p>
                      <p className="text-xs text-orange-700">{t({ en: 'Iterate', ar: 'تحسين' })}</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                      <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-red-600">{needTermination.length}</p>
                      <p className="text-xs text-red-700">{t({ en: 'Terminate', ar: 'إنهاء' })}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    ✓ {t({ en: 'AI evaluates: KPI achievement, budget efficiency, stakeholder feedback → Recommends action', ar: 'يقيّم الذكاء الاصطناعي: تحقيق المؤشرات، كفاءة الميزانية، ملاحظات الأطراف ← يوصي بالإجراء' })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Portfolio Analytics */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'By Sector', ar: 'حسب القطاع' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['urban_design', 'transport', 'environment', 'digital_services', 'health'].map(sector => {
                    const count = pilots.filter(p => p.sector === sector).length;
                    return count > 0 ? (
                      <div key={sector} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{sector.replace(/_/g, ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'By Risk Level', ar: 'حسب مستوى المخاطر' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-600">{t({ en: 'High Risk', ar: 'مخاطر عالية' })}</span>
                    <Badge className="bg-red-600 text-white">{pilots.filter(p => p.risk_level === 'high').length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-600">{t({ en: 'Medium Risk', ar: 'مخاطر متوسطة' })}</span>
                    <Badge className="bg-yellow-600 text-white">{pilots.filter(p => p.risk_level === 'medium').length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">{t({ en: 'Low Risk', ar: 'مخاطر منخفضة' })}</span>
                    <Badge className="bg-green-600 text-white">{pilots.filter(p => p.risk_level === 'low').length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-2xl font-bold text-green-600">
                      {pilotsByStage.completed.length + pilotsByStage.scaled.length}
                    </p>
                    <p className="text-xs text-slate-600">{t({ en: 'Successful', ar: 'ناجحة' })}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <p className="text-2xl font-bold text-blue-600">
                      {pilots.length > 0 ? Math.round((pilotsByStage.scaled.length / pilots.length) * 100) : 0}%
                    </p>
                    <p className="text-xs text-slate-600">{t({ en: 'Scaling Rate', ar: 'معدل التوسع' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflows & Tools */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Existing Workflows */}
            <Link to={createPageUrl('PilotCreate')}>
              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <Rocket className="h-10 w-10 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t({ en: 'Create Pilot', ar: 'إنشاء تجربة' })}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {t({ en: '7-step wizard with AI assistance', ar: 'معالج 7 خطوات مع المساعدة الذكية' })}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl('PilotLaunchWizard')}>
              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <Activity className="h-10 w-10 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t({ en: 'Launch Wizard', ar: 'معالج الإطلاق' })}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {t({ en: 'Pre-launch checklist & go-live', ar: 'قائمة ما قبل الإطلاق والتشغيل' })}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl('PilotMonitoringDashboard')}>
              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <BarChart3 className="h-10 w-10 text-green-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t({ en: 'Live Monitoring', ar: 'المراقبة المباشرة' })}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {t({ en: 'Real-time KPI tracking & alerts', ar: 'تتبع المؤشرات المباشر والتنبيهات' })}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl('PilotEvaluations')}>
              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <Target className="h-10 w-10 text-amber-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t({ en: 'Evaluation Panel', ar: 'لوحة التقييم' })}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {t({ en: 'AI-assisted evaluation & scoring', ar: 'التقييم والتصنيف بمساعدة الذكاء الاصطناعي' })}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl('IterationWorkflow')}>
              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <RefreshCw className="h-10 w-10 text-orange-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t({ en: 'Iteration Workflow', ar: 'سير عمل التحسين' })}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {t({ en: 'Refine & improve pilots', ar: 'تحسين وتطوير التجارب' })}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to={createPageUrl('ScalingWorkflow')}>
              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <TrendingUp className="h-10 w-10 text-teal-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t({ en: 'Scaling Workflow', ar: 'سير عمل التوسع' })}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {t({ en: 'National rollout planning', ar: 'تخطيط الطرح الوطني' })}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Missing Workflows - Placeholders */}
            <Card className="border-2 border-dashed border-amber-300 bg-amber-50 opacity-60">
              <CardContent className="pt-6">
                <AlertTriangle className="h-10 w-10 text-amber-600 mb-3" />
                <h3 className="font-semibold text-amber-900 mb-1">
                  {t({ en: 'Termination Flow', ar: 'سير عمل الإنهاء' })}
                </h3>
                <p className="text-xs text-amber-700">
                  {t({ en: 'Close failed pilots (Coming soon)', ar: 'إغلاق التجارب الفاشلة (قريباً)' })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-blue-300 bg-blue-50 opacity-60">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-900 mb-1">
                  {t({ en: 'Feasibility Gate', ar: 'بوابة الجدوى' })}
                </h3>
                <p className="text-xs text-blue-700">
                  {t({ en: 'Pre-design validation (Coming soon)', ar: 'التحقق قبل التصميم (قريباً)' })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-purple-300 bg-purple-50 opacity-60">
              <CardContent className="pt-6">
                <Calendar className="h-10 w-10 text-purple-600 mb-3" />
                <h3 className="font-semibold text-purple-900 mb-1">
                  {t({ en: 'Mid-Pilot Review', ar: 'المراجعة المتوسطة' })}
                </h3>
                <p className="text-xs text-purple-700">
                  {t({ en: 'Formal checkpoint gate (Coming soon)', ar: 'بوابة نقطة تفتيش رسمية (قريباً)' })}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Insights Panel */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="h-5 w-5" />
            {t({ en: 'AI Platform Insights', ar: 'رؤى المنصة الذكية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-blue-900">
                <Zap className="h-4 w-4 inline mr-2" />
                {t({ 
                  en: `${pilotsByStage.active.length + pilotsByStage.monitoring.length} active pilots are performing with ${Math.round(pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).reduce((sum, p) => sum + (p.success_probability || 0), 0) / (pilotsByStage.active.length + pilotsByStage.monitoring.length || 1))}% avg success probability.`,
                  ar: `${pilotsByStage.active.length + pilotsByStage.monitoring.length} تجربة نشطة بمتوسط نجاح ${Math.round(pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).reduce((sum, p) => sum + (p.success_probability || 0), 0) / (pilotsByStage.active.length + pilotsByStage.monitoring.length || 1))}%.`
                })}
              </p>
            </div>
            
            {pilotsByStage.approval_pending.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-yellow-200">
                <p className="text-amber-900">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  {t({ 
                    en: `${pilotsByStage.approval_pending.length} pilots awaiting approval - average wait time: 12 days`,
                    ar: `${pilotsByStage.approval_pending.length} تجربة في انتظار الموافقة - متوسط وقت الانتظار: 12 يوم`
                  })}
                </p>
              </div>
            )}

            {readyToScale.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <p className="text-green-900">
                  <TrendingUp className="h-4 w-4 inline mr-2" />
                  {t({ 
                    en: `${readyToScale.length} successful pilots ready for national scaling - potential impact: 15M citizens`,
                    ar: `${readyToScale.length} تجربة ناجحة جاهزة للتوسع الوطني - التأثير المحتمل: 15 مليون مواطن`
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(PilotManagementPanel, { 
  requiredPermissions: ['pilot_view_all'] 
});