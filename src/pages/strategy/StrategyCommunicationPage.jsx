import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { Megaphone, BookOpen, Bell, BarChart3, Globe, Eye } from 'lucide-react';
import StrategyCommunicationPlanner from '@/components/strategy/communication/StrategyCommunicationPlanner';
import ImpactStoryGenerator from '@/components/strategy/communication/ImpactStoryGenerator';
import StakeholderNotificationManager from '@/components/strategy/communication/StakeholderNotificationManager';
import CommunicationAnalyticsDashboard from '@/components/strategy/communication/CommunicationAnalyticsDashboard';
import PublicStrategyDashboard from '@/components/strategy/communication/PublicStrategyDashboard';
import StrategyPublicView from '@/components/strategy/communication/StrategyPublicView';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyCommunicationPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('planner');
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Fetch strategic plans for selector
  const { data: plans = [] } = useQuery({
    queryKey: ['strategic-plans-selector'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, title_en, title_ar, status')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <PageLayout>
      <PageHeader
        icon={Megaphone}
        title={{ en: 'Strategy Communication', ar: 'تواصل الاستراتيجية' }}
        description={{ en: 'Plan, execute, and analyze strategy communication campaigns', ar: 'خطط وننفذ وحلل حملات التواصل الاستراتيجي' }}
      />

      {/* Plan Selector */}
      <div className="mb-6">
        <Select value={selectedPlanId || ''} onValueChange={setSelectedPlanId}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder={t({ en: 'Select Strategic Plan', ar: 'اختر الخطة الاستراتيجية' })} />
          </SelectTrigger>
          <SelectContent>
            {plans.map(plan => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.title_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full max-w-4xl">
          <TabsTrigger value="planner" className="gap-2">
            <Megaphone className="h-4 w-4" />
            {t({ en: 'Planner', ar: 'المخطط' })}
          </TabsTrigger>
          <TabsTrigger value="stories" className="gap-2">
            <BookOpen className="h-4 w-4" />
            {t({ en: 'Stories', ar: 'القصص' })}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            {t({ en: 'Notifications', ar: 'الإشعارات' })}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t({ en: 'Analytics', ar: 'التحليلات' })}
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <Globe className="h-4 w-4" />
            {t({ en: 'Dashboard', ar: 'اللوحة' })}
          </TabsTrigger>
          <TabsTrigger value="public" className="gap-2">
            <Eye className="h-4 w-4" />
            {t({ en: 'Public View', ar: 'العرض العام' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planner">
          <StrategyCommunicationPlanner strategicPlanId={selectedPlanId} />
        </TabsContent>

        <TabsContent value="stories">
          <ImpactStoryGenerator strategicPlanId={selectedPlanId} />
        </TabsContent>

        <TabsContent value="notifications">
          <StakeholderNotificationManager strategicPlanId={selectedPlanId} />
        </TabsContent>

        <TabsContent value="analytics">
          <CommunicationAnalyticsDashboard strategicPlanId={selectedPlanId} />
        </TabsContent>

        <TabsContent value="dashboard">
          <PublicStrategyDashboard strategicPlanId={selectedPlanId} />
        </TabsContent>

        <TabsContent value="public">
          <StrategyPublicView strategicPlanId={selectedPlanId} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(StrategyCommunicationPage, {
  requiredPermissions: ['strategy_view']
});
