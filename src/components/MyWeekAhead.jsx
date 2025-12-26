import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Calendar, AlertTriangle, Clock } from 'lucide-react';
import { format, addDays, isWithinInterval } from 'date-fns';
import { useTasks } from '@/hooks/useTasks';
import { usePilotsList } from '@/hooks/usePilots';

export default function MyWeekAhead() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { useUserTasks } = useTasks({ user });
  const { data: myTasks = [] } = useUserTasks();

  const { data: myPilots = [] } = usePilotsList({
    createdBy: user?.email
  });

  const today = new Date();
  const nextWeek = addDays(today, 7);

  // @ts-ignore
  const thisWeekTasks = myTasks.filter(t =>
    isWithinInterval(new Date(t.due_date), { start: today, end: nextWeek })
  );

  const thisWeekMilestones = myPilots.flatMap(p =>
    (p.milestones || [])
      .filter(m => m.status !== 'completed' && m.due_date)
      .filter(m => isWithinInterval(new Date(m.due_date), { start: today, end: nextWeek }))
      .map(m => ({ ...m, pilot: p }))
  );

  const critical = thisWeekTasks.filter(t => t.priority === 'high').length +
    thisWeekMilestones.filter(m => new Date(m.due_date) < addDays(today, 3)).length;

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          {t({ en: 'My Week Ahead', ar: 'أسبوعي القادم' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{critical}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Critical', ar: 'حرج' })}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{thisWeekTasks.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Tasks', ar: 'مهام' })}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{thisWeekMilestones.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Milestones', ar: 'معالم' })}</p>
          </div>
        </div>

        {critical > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-900">
                {t({ en: `${critical} critical items need attention`, ar: `${critical} عناصر حرجة تحتاج انتباه` })}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {thisWeekTasks.slice(0, 3).map((task, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{task.title}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {format(new Date(task.due_date), 'EEE')}
              </Badge>
            </div>
          ))}
          {thisWeekMilestones.slice(0, 2).map((milestone, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{milestone.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {format(new Date(milestone.due_date), 'EEE')}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}