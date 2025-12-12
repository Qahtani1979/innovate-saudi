import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import ProviderNotificationPreferencesComponent from '../components/challenges/ProviderNotificationPreferences';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { Bell } from 'lucide-react';

function ProviderNotificationPreferences() {
  const { language, isRTL, t } = useLanguage();

  return (
    <PageLayout>
      <PageHeader
        icon={Bell}
        title={t({ en: 'Challenge Notification Preferences', ar: 'تفضيلات إشعارات التحديات' })}
        description={t({ en: 'Configure alerts for new challenges in your sectors', ar: 'اضبط التنبيهات للتحديات الجديدة في قطاعاتك' })}
      />

      <ProviderNotificationPreferencesComponent />
    </PageLayout>
  );
}

export default ProtectedPage(ProviderNotificationPreferences, { requiredPermissions: [] });