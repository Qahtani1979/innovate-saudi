import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { History } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function DocumentVersionControl() {
  const { t } = useLanguage();

  const versions = [
    { version: 'v3.0', date: '2025-01-26', author: 'Admin', changes: 'Updated MII calculation' },
    { version: 'v2.5', date: '2025-01-20', author: 'Admin', changes: 'Added new sectors' },
    { version: 'v2.0', date: '2025-01-15', author: 'Admin', changes: 'Initial configuration' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <History className="h-8 w-8 text-blue-600" />
        {t({ en: 'Document Version Control', ar: 'التحكم في إصدارات المستندات' })}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Version History', ar: 'سجل الإصدارات' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {versions.map((ver, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">{ver.version}</Badge>
                  <p className="text-sm font-medium">{ver.changes}</p>
                  <p className="text-xs text-slate-500 mt-1">by {ver.author} on {ver.date}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(DocumentVersionControl, { requireAdmin: true });
