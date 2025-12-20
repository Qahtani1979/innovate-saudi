import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { Database } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function DataRetentionConfig() {
  const { t } = useLanguage();

  const policies = [
    { entity: 'Challenges', retention: '5 years', archive: '2 years' },
    { entity: 'Pilots', retention: '7 years', archive: '3 years' },
    { entity: 'System Logs', retention: '1 year', archive: '6 months' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Database className="h-8 w-8 text-teal-600" />
        {t({ en: 'Data Retention Configuration', ar: 'تكوين الاحتفاظ بالبيانات' })}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Retention Policies', ar: 'سياسات الاحتفاظ' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {policies.map((policy, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <p className="font-medium">{policy.entity}</p>
                <p className="text-sm text-slate-600">
                  {t({ en: 'Retention', ar: 'الاحتفاظ' })}: {policy.retention} | {t({ en: 'Archive', ar: 'الأرشفة' })}: {policy.archive}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(DataRetentionConfig, { requireAdmin: true });