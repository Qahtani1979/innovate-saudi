import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Database, Download } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function BackupRecoveryManager() {
  const { t } = useLanguage();

  const backups = [
    { id: 1, date: '2025-01-26', size: '2.3 GB', status: 'completed' },
    { id: 2, date: '2025-01-25', size: '2.2 GB', status: 'completed' },
    { id: 3, date: '2025-01-24', size: '2.1 GB', status: 'completed' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Database className="h-8 w-8 text-cyan-600" />
        {t({ en: 'Backup & Recovery Manager', ar: 'مدير النسخ الاحتياطي والاستعادة' })}
      </h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t({ en: 'Recent Backups', ar: 'النسخ الاحتياطية الأخيرة' })}</CardTitle>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t({ en: 'Create Backup', ar: 'إنشاء نسخة' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {backups.map(backup => (
            <div key={backup.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{backup.date}</p>
                <p className="text-sm text-slate-600">{backup.size}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">{backup.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(BackupRecoveryManager, { requireAdmin: true });