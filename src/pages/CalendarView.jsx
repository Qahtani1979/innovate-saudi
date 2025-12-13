import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, ChevronLeft, ChevronRight, TestTube, Target, Users, CalendarDays, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/components/permissions/usePermissions';

function CalendarView({ embedded = false }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { hasAnyPermission, roles } = usePermissions();
  const [currentDate, setCurrentDate] = useState(new Date());

  const canCreateEvents = hasAnyPermission(['event_create', 'admin']) || 
    roles?.some(r => ['admin', 'super_admin', 'municipality_admin', 'gdibs_internal', 'event_manager'].includes(r));

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // NEW: Fetch events from events table
  const { data: dbEvents = [] } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('start_date', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: expertAssignments = [] } = useQuery({
    queryKey: ['expert-assignments-calendar', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_assignments')
        .select('*')
        .eq('expert_email', user?.email)
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const calendarItems = [
    // Events from events table (NEW)
    ...dbEvents.map(e => ({
      ...e,
      type: 'event',
      date: e.start_date,
      title: language === 'ar' ? (e.title_ar || e.title_en) : (e.title_en || e.title_ar),
      icon: CalendarDays,
      link: createPageUrl('EventDetail') + `?id=${e.id}`
    })),
    ...pilots.filter(p => p.timeline?.pilot_start).map(p => ({
      ...p,
      type: 'pilot',
      date: p.timeline.pilot_start,
      title: language === 'ar' ? (p.title_ar || p.title_en) : (p.title_en || p.title_ar),
      icon: TestTube,
      link: createPageUrl('PilotDetail') + `?id=${p.id}`
    })),
    ...programs.filter(p => p.timeline?.program_start).map(p => ({
      ...p,
      type: 'program',
      date: p.timeline.program_start,
      title: language === 'ar' ? (p.name_ar || p.name_en) : (p.name_en || p.name_ar),
      icon: Users,
      link: createPageUrl('ProgramDetail') + `?id=${p.id}`
    })),
    ...expertAssignments.map(a => ({
      ...a,
      type: 'expert',
      date: a.due_date,
      title: `${a.assignment_type} - ${a.entity_type}`,
      icon: Target
    }))
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Calendar', ar: 'التقويم' })}
        </h1>
        <div className="flex items-center gap-4">
          {canCreateEvents && (
            <Link to={createPageUrl('EventCreate')}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t({ en: 'Create Event', ar: 'إنشاء فعالية' })}
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium px-4">
              {currentDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayItems = calendarItems.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate.getDate() === day &&
                       eventDate.getMonth() === currentDate.getMonth() &&
                       eventDate.getFullYear() === currentDate.getFullYear();
              });

              return (
                <div key={day} className="aspect-square p-2 border rounded-lg hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-medium text-slate-900 mb-1">{day}</p>
                  <div className="space-y-1">
                    {dayItems.slice(0, 2).map((item, j) => {
                      const Icon = item.icon;
                      const colorClass = item.type === 'event' ? 'bg-green-100 text-green-700' :
                        item.type === 'pilot' ? 'bg-blue-100 text-blue-700' : 
                        item.type === 'program' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700';
                      
                      const content = (
                        <div className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${colorClass}`}>
                          <Icon className="h-3 w-3 inline mr-1" />
                          {item.title?.substring(0, 10)}...
                        </div>
                      );

                      return item.link ? (
                        <Link key={j} to={item.link}>{content}</Link>
                      ) : (
                        <div key={j}>{content}</div>
                      );
                    })}
                    {dayItems.length > 2 && (
                      <p className="text-xs text-slate-500">+{dayItems.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Upcoming Events', ar: 'الأحداث القادمة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calendarItems
                .filter(item => new Date(item.date) >= new Date())
                .slice(0, 5)
                .map((item) => {
                  const Icon = item.icon;
                  const colorClass = item.type === 'event' ? 'text-green-600' :
                    item.type === 'pilot' ? 'text-blue-600' : 
                    item.type === 'program' ? 'text-purple-600' : 'text-amber-600';
                  
                  const content = (
                    <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-slate-600">
                            {new Date(item.date).toLocaleDateString(language, { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    </div>
                  );
                  
                  return item.link ? (
                    <Link key={item.id} to={item.link}>{content}</Link>
                  ) : (
                    <div key={item.id}>{content}</div>
                  );
                })}
              {calendarItems.filter(item => new Date(item.date) >= new Date()).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t({ en: 'No upcoming events', ar: 'لا توجد أحداث قادمة' })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'This Month Summary', ar: 'ملخص هذا الشهر' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{t({ en: 'Pilot Launches', ar: 'إطلاق تجارب' })}</p>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{t({ en: 'Program Events', ar: 'فعاليات برامج' })}</p>
                  <p className="text-2xl font-bold text-purple-600">5</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{t({ en: 'Milestones Due', ar: 'معالم مستحقة' })}</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(CalendarView, { requiredPermissions: [] });
