import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import ProviderNotificationPreferencesComponent from '../components/challenges/ProviderNotificationPreferences';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProviderNotificationPreferences() {
  const { language, isRTL, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Challenge Notification Preferences', ar: 'تفضيلات إشعارات التحديات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Configure alerts for new challenges in your sectors', ar: 'اضبط التنبيهات للتحديات الجديدة في قطاعاتك' })}
        </p>
      </div>

      <ProviderNotificationPreferencesComponent />
    </div>
  );
}

export default ProtectedPage(ProviderNotificationPreferences, { requiredPermissions: [] });