import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MyDeadlines() {
  const { language, isRTL, t } = useLanguage();
  const [viewMode, setViewMode] = useState('list');
  const { user } = useAuth();

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks-deadlines', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('tasks').select('*');
      return data?.filter(t => 
        (t.assigned_to === user?.email || t.created_by === user?.email) && 
        t.due_date && 
        t.status !== 'completed'
      ) || [];
    },
    enabled: !!user
  });

  const { data: myPilots = [] } = useQuery({
    queryKey: ['my-pilots-milestones', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*').eq('is_deleted', false);
      return data?.filter(p => 
        (p.created_by === user?.email || p.team?.some(t => t.email === user?.email)) &&
        p.milestones?.some(m => m.status !== 'completed')
      ) || [];
    },
    enabled: !!user
  });

  const { data: myChallenges = [] } = useQuery({
    queryKey: ['my-challenges-deadlines', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('is_deleted', false);
      return (data || []).filter(c => 
        c.created_by === user?.email && 
        c.submission_date && 
        c.status === 'draft'
      );
    },
    enabled: !!user
  });

  const allDeadlines = [];

  // Tasks
  myTasks.forEach(task => {
    allDeadlines.push({
      type: 'task',
      id: task.id,
      title: task.title,
      due_date: task.due_date,
      priority: task.priority,
      entity: task
    });
  });

  // Pilot milestones
  myPilots.forEach(pilot => {
    pilot.milestones?.forEach(milestone => {
      if (milestone.status !== 'completed' && milestone.due_date) {
        allDeadlines.push({
          type: 'milestone',
          id: pilot.id + '-' + milestone.name,
          title: `${pilot.code}: ${milestone.name_ar || milestone.name}`,
          due_date: milestone.due_date,
          entity: pilot,
          milestone
        });
      }
    });
  });

  // Challenge submissions
  myChallenges.forEach(challenge => {
    if (challenge.submission_date) {
      allDeadlines.push({
        type: 'submission',
        id: challenge.id,
        title: challenge.title_en,
        due_date: challenge.submission_date,
        entity: challenge
      });
    }
  });

  const sortedDeadlines = allDeadlines.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  const overdue = sortedDeadlines.filter(d => isBefore(new Date(d.due_date), new Date()));
  const dueToday = sortedDeadlines.filter(d => format(new Date(d.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
  const upcoming = sortedDeadlines.filter(d => isAfter(new Date(d.due_date), new Date()) && isBefore(new Date(d.due_date), addDays(new Date(), 7)));

  const getDeadlineColor = (deadline) => {
    if (isBefore(new Date(deadline.due_date), new Date())) return 'border-red-300 bg-red-50';
    if (format(new Date(deadline.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) return 'border-orange-300 bg-orange-50';
    return 'border-blue-300 bg-blue-50';
  };

  const getDeadlineIcon = (deadline) => {
    if (isBefore(new Date(deadline.due_date), new Date())) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (format(new Date(deadline.due_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) return <Clock className="h-5 w-5 text-orange-600" />;
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
            <p className="text-3xl font-bold text-red-600">{overdue.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Overdue', ar: 'متأخر' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{dueToday.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Due Today', ar: 'مستحق اليوم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{upcoming.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Next 7 Days', ar: 'الـ7 أيام القادمة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-600">{sortedDeadlines.length}</p>
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
          {sortedDeadlines.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No upcoming deadlines', ar: 'لا توجد مواعيد نهائية قادمة' })}
            </p>
          ) : (
            sortedDeadlines.slice(0, 20).map((deadline) => (
              <div key={deadline.id} className={`p-4 border-2 rounded-lg ${getDeadlineColor(deadline)}`}>
                <div className="flex items-start gap-3">
                  {getDeadlineIcon(deadline)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{deadline.type}</Badge>
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