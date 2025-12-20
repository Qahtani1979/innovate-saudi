import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import StakeholderSignoffTracker from '@/components/strategy/governance/StakeholderSignoffTracker';
import StrategyVersionControl from '@/components/strategy/governance/StrategyVersionControl';
import StrategyCommitteeReview from '@/components/strategy/governance/StrategyCommitteeReview';
import GovernanceMetricsDashboard from '@/components/strategy/governance/GovernanceMetricsDashboard';
import { FileSignature, GitBranch, Users, BarChart3 } from 'lucide-react';

function StrategyGovernancePage() {
  const { t } = useLanguage();
  const { activePlanId } = useActivePlan();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <ActivePlanBanner />
      
      <div>
        <h1 className="text-2xl font-bold">{t({ en: 'Strategy Governance', ar: 'حوكمة الاستراتيجية' })}</h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Manage approvals, sign-offs, version control, and committee decisions for strategic plans', ar: 'إدارة الموافقات والتوقيعات والتحكم في الإصدارات وقرارات اللجان للخطط الاستراتيجية' })}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t({ en: 'Dashboard', ar: 'لوحة التحكم' })}
          </TabsTrigger>
          <TabsTrigger value="signoff" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            {t({ en: 'Stakeholder Sign-off', ar: 'توقيعات أصحاب المصلحة' })}
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {t({ en: 'Version Control', ar: 'التحكم في الإصدارات' })}
          </TabsTrigger>
          <TabsTrigger value="committee" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t({ en: 'Committee Review', ar: 'مراجعة اللجان' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <GovernanceMetricsDashboard planId={activePlanId} />
        </TabsContent>

        <TabsContent value="signoff">
          <StakeholderSignoffTracker planId={activePlanId} />
        </TabsContent>

        <TabsContent value="versions">
          <StrategyVersionControl planId={activePlanId} />
        </TabsContent>

        <TabsContent value="committee">
          <StrategyCommitteeReview planId={activePlanId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategyGovernancePage, { requiredPermissions: ['strategy_manage'] });
