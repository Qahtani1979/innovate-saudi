import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { Mail, FileText, History, Settings, Users, Megaphone, BarChart3 } from 'lucide-react';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import EmailTemplateEditorContent from '@/components/communications/EmailTemplateEditorContent';
import EmailLogsViewer from '@/components/communications/EmailLogsViewer';
import EmailSettingsEditor from '@/components/communications/EmailSettingsEditor';
import UserPreferencesOverview from '@/components/communications/UserPreferencesOverview';
import CampaignManager from '@/components/communications/CampaignManager';
import EmailAnalyticsDashboard from '@/components/communications/EmailAnalyticsDashboard';

function CommunicationsHub() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <PageLayout>
      <PageHeader
        icon={Mail}
        title={{ en: 'Communications Hub', ar: 'مركز الاتصالات' }}
        description={{ en: 'Manage email templates, campaigns, analytics, and user preferences', ar: 'إدارة قوالب البريد والحملات والتحليلات وتفضيلات المستخدمين' }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full max-w-4xl">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            {t({ en: 'Templates', ar: 'القوالب' })}
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Megaphone className="h-4 w-4" />
            {t({ en: 'Campaigns', ar: 'الحملات' })}
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="h-4 w-4" />
            {t({ en: 'Logs', ar: 'السجلات' })}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t({ en: 'Analytics', ar: 'التحليلات' })}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            {t({ en: 'Settings', ar: 'الإعدادات' })}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Users className="h-4 w-4" />
            {t({ en: 'User Prefs', ar: 'تفضيلات' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <EmailTemplateEditorContent />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignManager />
        </TabsContent>

        <TabsContent value="logs">
          <EmailLogsViewer />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="settings">
          <EmailSettingsEditor />
        </TabsContent>

        <TabsContent value="preferences">
          <UserPreferencesOverview />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(CommunicationsHub, { 
  requiredPermissions: ['manage:email_templates'] 
});
