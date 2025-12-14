import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import StakeholderSignoffTracker from '@/components/strategy/governance/StakeholderSignoffTracker';
import StrategyVersionControl from '@/components/strategy/governance/StrategyVersionControl';
import StrategyCommitteeReview from '@/components/strategy/governance/StrategyCommitteeReview';
import GovernanceMetricsDashboard from '@/components/strategy/governance/GovernanceMetricsDashboard';
import { FileSignature, GitBranch, Users, BarChart3 } from 'lucide-react';

function StrategyGovernancePage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlanId, setSelectedPlanId] = useState('all');

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-governance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, name_en, name_ar')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const planId = selectedPlanId === 'all' ? null : selectedPlanId;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t({ en: 'Strategy Governance', ar: 'حوكمة الاستراتيجية' })}</h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Manage approvals, sign-offs, version control, and committee decisions for strategic plans', ar: 'إدارة الموافقات والتوقيعات والتحكم في الإصدارات وقرارات اللجان للخطط الاستراتيجية' })}
          </p>
        </div>
        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t({ en: 'All Strategic Plans', ar: 'جميع الخطط الاستراتيجية' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t({ en: 'All Strategic Plans', ar: 'جميع الخطط الاستراتيجية' })}</SelectItem>
            {strategicPlans.map(plan => (
              <SelectItem key={plan.id} value={plan.id}>
                {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <GovernanceMetricsDashboard planId={planId} />
        </TabsContent>

        <TabsContent value="signoff">
          <StakeholderSignoffTracker planId={planId} />
        </TabsContent>

        <TabsContent value="versions">
          <StrategyVersionControl planId={planId} />
        </TabsContent>

        <TabsContent value="committee">
          <StrategyCommitteeReview planId={planId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategyGovernancePage, { requiredPermissions: ['strategy_manage'] });
