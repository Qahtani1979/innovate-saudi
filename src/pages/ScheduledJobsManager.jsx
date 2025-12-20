import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Clock } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ScheduledJobsManager() {
  const { t } = useLanguage();

  const jobs = [
    { name: 'Daily AI Insights Generation', schedule: 'Daily at 2:00 AM', status: 'active', lastRun: '2h ago' },
    { name: 'MII Score Calculation', schedule: 'Weekly on Sunday', status: 'active', lastRun: '2d ago' },
    { name: 'Email Digest Sender', schedule: 'Daily at 8:00 AM', status: 'active', lastRun: '4h ago' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Clock className="h-8 w-8 text-indigo-600" />
        {t({ en: 'Scheduled Jobs Manager', ar: 'مدير المهام المجدولة' })}
      </h1>

      <div className="grid gap-4">
        {jobs.map((job, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{job.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{job.schedule}</p>
                  <p className="text-xs text-slate-500 mt-1">Last run: {job.lastRun}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">{job.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(ScheduledJobsManager, { requireAdmin: true });