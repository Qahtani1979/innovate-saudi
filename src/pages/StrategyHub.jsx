import { useState, useMemo } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { usePermissions } from '@/components/permissions/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import {
  Target,
  Workflow,
  Sparkles,
  Shield,
  BarChart3,
  Zap,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Brain,
  Settings,
  Megaphone,
  Search
} from 'lucide-react';

// Import New Tab Components
import StrategyWorkflowTab from '@/components/strategy/tabs/StrategyWorkflowTab';
import StrategyTemplatesTab from '@/components/strategy/tabs/StrategyTemplatesTab';
import StrategyMonitoringTab from '@/components/strategy/tabs/StrategyMonitoringTab';
import StrategyCascadeTab from '@/components/strategy/tabs/StrategyCascadeTab';
import StrategyGovernanceTab from '@/components/strategy/tabs/StrategyGovernanceTab';
import StrategyCommunicationTab from '@/components/strategy/tabs/StrategyCommunicationTab';
import StrategyPrePlanningTab from '@/components/strategy/tabs/StrategyPrePlanningTab';
import StrategyEvaluationTab from '@/components/strategy/tabs/StrategyEvaluationTab';
import StrategyRecalibrationTab from '@/components/strategy/tabs/StrategyRecalibrationTab';
import StrategyAIToolsTab from '@/components/strategy/tabs/StrategyAIToolsTab';

// Import Tool Configurations
import {
  cascadeGenerators,
  governanceTools,
  communicationTools,
  preplanningTools,
  templateTools,
  monitoringTools,
  evaluationTools,
  recalibrationTools,
  demandTools
} from '@/config/strategyHubTools';

function StrategyHub() {
  const { t, isRTL } = useLanguage();
  const { activePlanId, strategicPlans: plans, isLoading: plansLoading } = useActivePlan();
  const { hasPermission, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState('workflow');
  const [activeAITool, setActiveAITool] = useState(null);

  // Use activePlanId from context
  const selectedPlanId = activePlanId || 'all';

  // Filter tools based on permissions
  const filterByPermission = (items) => {
    return items.filter(item => {
      if (!item.permission) return true; // No permission required
      if (isAdmin) return true; // Admin sees all
      return hasPermission(item.permission);
    });
  };

  const filteredCascadeGenerators = useMemo(() => filterByPermission(cascadeGenerators), [isAdmin, hasPermission]);
  const filteredGovernanceTools = useMemo(() => filterByPermission(governanceTools), [isAdmin, hasPermission]);
  const filteredCommunicationTools = useMemo(() => filterByPermission(communicationTools), [isAdmin, hasPermission]);
  const filteredPreplanningTools = useMemo(() => filterByPermission(preplanningTools), [isAdmin, hasPermission]);
  const filteredMonitoringTools = useMemo(() => filterByPermission(monitoringTools), [isAdmin, hasPermission]);
  const filteredDemandTools = useMemo(() => filterByPermission(demandTools), [isAdmin, hasPermission]);
  const filteredTemplateTools = useMemo(() => filterByPermission(templateTools), [isAdmin, hasPermission]);
  const filteredEvaluationTools = useMemo(() => filterByPermission(evaluationTools), [isAdmin, hasPermission]);
  const filteredRecalibrationTools = useMemo(() => filterByPermission(recalibrationTools), [isAdmin, hasPermission]);

  // Fetch approval requests for pending actions
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ['pending-strategy-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('entity_type', 'strategic_plan')
        .eq('approval_status', 'pending')
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  // Filter plans based on selection
  const filteredPlans = selectedPlanId === 'all'
    ? plans
    : plans.filter(p => p.id === selectedPlanId);

  // Calculate metrics (based on all plans for overall stats)
  const activePlans = plans.filter(p => p.status === 'active').length;
  const draftPlans = plans.filter(p => p.status === 'draft').length;
  const avgProgress = filteredPlans.length > 0
    ? Math.round(filteredPlans.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / filteredPlans.length)
    : 0;

  // Determine current phase based on selected plan
  const getCurrentPhase = () => {
    if (filteredPlans.length === 0) return 0;
    const activePlan = selectedPlanId !== 'all'
      ? filteredPlans[0]
      : filteredPlans.find(p => p.status === 'active');
    if (!activePlan) return 1;
    // Simple heuristic based on progress
    if (activePlan.progress_percentage < 15) return 2;
    if (activePlan.progress_percentage < 40) return 3;
    if (activePlan.progress_percentage < 60) return 4;
    if (activePlan.progress_percentage < 75) return 5;
    if (activePlan.progress_percentage < 90) return 6;
    return 7;
  };

  const currentPhaseIndex = getCurrentPhase();

  const queryClient = useQueryClient();
  const handleProgramCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['strategic-plans'] });
    queryClient.invalidateQueries({ queryKey: ['programs-gap'] });
  };

  return (
    <div className={`container mx-auto py-6 px-4 space-y-6 ${isRTL ? 'rtl' : ''}`}>
      <ActivePlanBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            {t({ en: 'Strategy Hub', ar: 'مركز الاستراتيجية' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Central command for strategic planning and execution', ar: 'مركز القيادة للتخطيط والتنفيذ الاستراتيجي' })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/strategy-cockpit">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t({ en: 'Cockpit', ar: 'لوحة القيادة' })}
            </Link>
          </Button>
          <Button asChild>
            <Link to="/strategic-plan-builder">
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'New Strategy', ar: 'استراتيجية جديدة' })}
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Active Plans', ar: 'الخطط النشطة' })}</p>
                <p className="text-2xl font-bold">{activePlans}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Drafts', ar: 'المسودات' })}</p>
                <p className="text-2xl font-bold">{draftPlans}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Avg Progress', ar: 'متوسط التقدم' })}</p>
                <p className="text-2xl font-bold">{avgProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Pending Actions', ar: 'الإجراءات المعلقة' })}</p>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="workflow" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Workflow className="h-4 w-4" />
            <span>{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" />
            <span>{t({ en: 'Templates', ar: 'القوالب' })}</span>
          </TabsTrigger>
          <TabsTrigger value="cascade" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Zap className="h-4 w-4" />
            <span>{t({ en: 'Cascade', ar: 'التدرج' })}</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            <span>{t({ en: 'Monitoring', ar: 'المراقبة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" />
            <span>{t({ en: 'Governance', ar: 'الحوكمة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Megaphone className="h-4 w-4" />
            <span>{t({ en: 'Comms', ar: 'التواصل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="preplanning" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Search className="h-4 w-4" />
            <span>{t({ en: 'Pre-Plan', ar: 'التخطيط' })}</span>
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Target className="h-4 w-4" />
            <span>{t({ en: 'Evaluation', ar: 'التقييم' })}</span>
          </TabsTrigger>
          <TabsTrigger value="recalibration" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4" />
            <span>{t({ en: 'Recalibrate', ar: 'إعادة المعايرة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Brain className="h-4 w-4" />
            <span>{t({ en: 'AI', ar: 'الذكاء' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <StrategyWorkflowTab
            currentPhaseIndex={currentPhaseIndex}
            plansLoading={plansLoading}
            plans={plans}
            activePlans={activePlans}
            draftPlans={draftPlans}
            avgProgress={avgProgress}
            pendingApprovals={pendingApprovals}
            isRTL={isRTL}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <StrategyTemplatesTab filteredTemplateTools={filteredTemplateTools} />
        </TabsContent>

        <TabsContent value="cascade" className="space-y-6">
          <StrategyCascadeTab filteredCascadeGenerators={filteredCascadeGenerators} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <StrategyMonitoringTab
            filteredMonitoringTools={filteredMonitoringTools}
            filteredDemandTools={filteredDemandTools}
          />
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          <StrategyGovernanceTab filteredGovernanceTools={filteredGovernanceTools} />
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <StrategyCommunicationTab filteredCommunicationTools={filteredCommunicationTools} />
        </TabsContent>

        <TabsContent value="preplanning" className="space-y-6">
          <StrategyPrePlanningTab filteredPreplanningTools={filteredPreplanningTools} />
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          <StrategyEvaluationTab filteredEvaluationTools={filteredEvaluationTools} />
        </TabsContent>

        <TabsContent value="recalibration" className="space-y-6">
          <StrategyRecalibrationTab filteredRecalibrationTools={filteredRecalibrationTools} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <StrategyAIToolsTab
            activeAITool={activeAITool}
            setActiveAITool={setActiveAITool}
            activePlanId={activePlanId}
            onProgramCreated={handleProgramCreated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategyHub, { requiredPermissions: ['strategy_view'] });