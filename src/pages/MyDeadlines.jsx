import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, isBefore, isAfter, addDays } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useUserSchedule } from '@/hooks/useUserSchedule';
import { Skeleton } from "@/components/ui/skeleton";

function MyDeadlines() {
  const { language, isRTL, t } = useLanguage();
  const [viewMode, setViewMode] = useState('list');

  // Use the new hook
  const { deadlines, counts, buckets, isLoading } = useUserSchedule();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const getDeadlineColor = (deadline) => {
    if (isBefore(new Date(deadline.due_date), new Date()) && format(new Date(deadline.due_date), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd')) return 'border-red-300 bg-red-50';
    if (format(new Date(deadline.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) return 'border-orange-300 bg-orange-50';
    return 'border-blue-300 bg-blue-50';
  };

  const getDeadlineIcon = (deadline) => {
    const date = new Date(deadline.due_date);
    const today = new Date();
    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

    if (isBefore(date, today) && !isToday) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (isToday) return <Clock className="h-5 w-5 text-orange-600" />;
    return <Calendar className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'My Deadlines & Calendar', ar: 'مواعيدي والتقويم' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'All your deadlines in one place', ar: 'جميع مواعيدك في مكان واحد' })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{counts.overdue}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Overdue', ar: 'متأخر' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{counts.dueToday}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Due Today', ar: 'مستحق اليوم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{counts.upcoming}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Next 7 Days', ar: 'الـ7 أيام القادمة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-600">{counts.total}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Active', ar: 'إجمالي النشطة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Deadline List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Upcoming Deadlines', ar: 'المواعيد النهائية القادمة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {deadlines.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No upcoming deadlines', ar: 'لا توجد مواعيد نهائية قادمة' })}
            </p>
          ) : (
            deadlines.slice(0, 20).map((deadline) => (
              <div key={deadline.id} className={`p-4 border-2 rounded-lg ${getDeadlineColor(deadline)}`}>
                <div className="flex items-start gap-3">
                  {getDeadlineIcon(deadline)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {t({
                          en: deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1),
                          ar: deadline.type === 'task' ? 'مهمة' : deadline.type === 'milestone' ? 'معلم' : 'تقديم'
                        })}
                      </Badge>
                      <span className="text-sm text-slate-600">
                        {format(new Date(deadline.due_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm">{deadline.title}</h3>
                    {deadline.priority && (
                      <Badge className="mt-2">{deadline.priority}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MyDeadlines, { requiredPermissions: [] });
