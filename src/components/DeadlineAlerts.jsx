import { useDeadlines } from '@/hooks/useDeadlines';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';


export default function DeadlineAlerts() {
  const { language, isRTL, t } = useLanguage();

  const { tasks, pilotMilestones: pilots, programs } = useDeadlines();

  const getDaysUntil = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUrgencyColor = (days) => {
    if (days <= 1) return 'bg-red-100 text-red-700 border-red-300';
    if (days <= 3) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  };

  const totalAlerts = tasks.length + pilots.length + programs.length;

  if (totalAlerts === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          {t({ en: 'Upcoming Deadlines', ar: 'المواعيد النهائية القادمة' })} ({totalAlerts})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => {
          const days = getDaysUntil(task.due_date);
          return (
            <div key={task.id} className="p-3 bg-white rounded-lg border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{task.title}</span>
                  </div>
                  <p className="text-xs text-slate-600">{task.description}</p>
                </div>
                <Badge className={getUrgencyColor(days)}>
                  {days === 0 ? t({ en: 'Today', ar: 'اليوم' }) :
                    days === 1 ? t({ en: 'Tomorrow', ar: 'غداً' }) :
                      `${days}d`}
                </Badge>
              </div>
            </div>
          );
        })}

        {programs.map((program) => {
          const days = getDaysUntil(program.application_deadline);
          return (
            <Link key={program.id} to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
              <div className="p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {t({ en: 'Application deadline', ar: 'موعد التقديم' })}
                    </p>
                  </div>
                  <Badge className={getUrgencyColor(days)}>
                    {days}d
                  </Badge>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
