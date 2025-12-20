import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, Clock, AlertCircle } from 'lucide-react';

export default function AutomatedBackupSystem() {
  const { t } = useLanguage();

  const backupJobs = [
    { name: 'Daily Full Backup', schedule: '2:00 AM', status: 'not_configured', retention: '30 days' },
    { name: 'Hourly Incremental', schedule: 'Every hour', status: 'not_configured', retention: '7 days' },
    { name: 'Weekly Archive', schedule: 'Sunday 1:00 AM', status: 'not_configured', retention: '1 year' },
    { name: 'Pre-deployment Snapshot', schedule: 'On deploy', status: 'not_configured', retention: '14 days' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          {t({ en: 'Automated Backups', ar: 'النسخ الاحتياطي' })}
          <Badge className="ml-auto bg-red-600">Not Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">No Automated Backup System</p>
              <p>Data loss risk - need automated backup and recovery</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {backupJobs.map((job, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium">{job.name}</span>
                </div>
                <Badge variant="outline">{job.status}</Badge>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Schedule: {job.schedule}</p>
                <p>Retention: {job.retention}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Required features:</p>
          <ul className="space-y-1 ml-4">
            <li>• Automated scheduling</li>
            <li>• Point-in-time recovery</li>
            <li>• Backup encryption</li>
            <li>• Offsite storage</li>
            <li>• Recovery testing</li>
            <li>• Backup alerts & monitoring</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}