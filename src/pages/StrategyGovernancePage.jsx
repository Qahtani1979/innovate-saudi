import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import StakeholderSignoffTracker from '@/components/strategy/governance/StakeholderSignoffTracker';
import StrategyVersionControl from '@/components/strategy/governance/StrategyVersionControl';
import { FileSignature, GitBranch } from 'lucide-react';

function StrategyGovernancePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('signoff');

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'Strategy Governance', ar: 'حوكمة الاستراتيجية' })}</h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Manage approvals, sign-offs, and version control for strategic plans', ar: 'إدارة الموافقات والتوقيعات والتحكم في الإصدارات للخطط الاستراتيجية' })}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="signoff" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            {t({ en: 'Stakeholder Sign-off', ar: 'توقيعات أصحاب المصلحة' })}
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {t({ en: 'Version Control', ar: 'التحكم في الإصدارات' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signoff">
          <StakeholderSignoffTracker />
        </TabsContent>

        <TabsContent value="versions">
          <StrategyVersionControl />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategyGovernancePage, { requiredPermissions: ['strategy.manage'] });
