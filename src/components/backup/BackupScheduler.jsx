import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Database, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BackupScheduler() {
  const { t } = useLanguage();
  const [schedule, setSchedule] = useState({
    frequency: 'daily',
    time: '02:00',
    retention_days: 30,
    include_files: true
  });

  const backupHistory = [
    { date: '2025-01-20 02:00', size: '2.3 GB', status: 'success', type: 'scheduled' },
    { date: '2025-01-19 02:00', size: '2.2 GB', status: 'success', type: 'scheduled' },
    { date: '2025-01-18 14:30', size: '2.1 GB', status: 'success', type: 'manual' }
  ];

  const handleBackupNow = () => {
    toast.success(t({ en: 'Backup started', ar: 'بدأ النسخ الاحتياطي' }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          {t({ en: 'Backup & Recovery', ar: 'النسخ الاحتياطي والاستعادة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Frequency', ar: 'التكرار' })}
            </label>
            <Select value={schedule.frequency} onValueChange={(v) => setSchedule({...schedule, frequency: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">{t({ en: 'Hourly', ar: 'كل ساعة' })}</SelectItem>
                <SelectItem value="daily">{t({ en: 'Daily', ar: 'يومي' })}</SelectItem>
                <SelectItem value="weekly">{t({ en: 'Weekly', ar: 'أسبوعي' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Retention (Days)', ar: 'الاحتفاظ (أيام)' })}
            </label>
            <Select value={schedule.retention_days.toString()} onValueChange={(v) => setSchedule({...schedule, retention_days: parseInt(v)})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleBackupNow} className="w-full bg-blue-600">
          <Download className="h-4 w-4 mr-2" />
          {t({ en: 'Backup Now', ar: 'نسخ احتياطي الآن' })}
        </Button>

        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium">{t({ en: 'Recent Backups', ar: 'النسخ الأخيرة' })}</p>
          {backupHistory.map((backup, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-slate-600">{backup.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{backup.size}</Badge>
                <Button size="sm" variant="ghost">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
