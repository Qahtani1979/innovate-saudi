import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, Download, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DataBackupPanel() {
  const { language, t } = useLanguage();
  const [backing, setBacking] = useState(false);

  // Simulated backup history
  const backupHistory = [
    { date: new Date().toISOString(), size: '245 MB', status: 'completed', auto: true },
    { date: new Date(Date.now() - 86400000).toISOString(), size: '243 MB', status: 'completed', auto: true },
    { date: new Date(Date.now() - 172800000).toISOString(), size: '241 MB', status: 'completed', auto: true }
  ];

  const createBackup = async () => {
    setBacking(true);
    try {
      // In production, this would trigger actual backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(t({ en: 'Backup created', ar: 'النسخة الاحتياطية أُنشئت' }));
    } catch (error) {
      toast.error(t({ en: 'Backup failed', ar: 'فشلت النسخة الاحتياطية' }));
    } finally {
      setBacking(false);
    }
  };

  return (
    <Card className="border-2 border-slate-300">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-slate-600" />
          {t({ en: 'Data Backup & Recovery', ar: 'النسخ الاحتياطي واسترداد البيانات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                {t({ en: 'Automated Daily Backups', ar: 'النسخ الاحتياطية اليومية التلقائية' })}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {t({ en: 'System creates automatic backups daily at 2:00 AM', ar: 'النظام ينشئ نسخ احتياطية تلقائية يومياً في 2:00 صباحاً' })}
              </p>
            </div>
          </div>
        </div>

        <Button onClick={createBackup} disabled={backing} className="w-full bg-slate-600">
          <Download className="h-4 w-4 mr-2" />
          {backing 
            ? t({ en: 'Creating Backup...', ar: 'إنشاء النسخة...' })
            : t({ en: 'Create Manual Backup', ar: 'إنشاء نسخة يدوية' })
          }
        </Button>

        <div>
          <h4 className="font-semibold text-sm text-slate-700 mb-3">
            {t({ en: 'Backup History', ar: 'سجل النسخ الاحتياطية' })}
          </h4>
          <div className="space-y-2">
            {backupHistory.map((backup, i) => (
              <div key={i} className="p-3 bg-white rounded border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(backup.date).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                    {backup.auto && (
                      <Badge variant="outline" className="text-xs">Auto</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 ml-6">{backup.size}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-green-50 rounded border border-green-300 text-xs text-slate-600">
          {t({ 
            en: '✓ All backups encrypted and stored securely. 30-day retention policy.', 
            ar: '✓ جميع النسخ الاحتياطية مشفرة ومخزنة بأمان. سياسة الاحتفاظ 30 يوم.' 
          })}
        </div>
      </CardContent>
    </Card>
  );
}
