import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { usePermissions } from '@/components/permissions/usePermissions';
import { Calendar, Plus, Users, MapPin, Clock, Video, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { 
  CitizenPageLayout, 
  CitizenPageHeader, 
  CitizenEmptyState 
} from '@/components/citizen/CitizenPageLayout';

function EventCalendar() {
  const { t, isRTL, language } = useLanguage();
  const { roles, hasAnyPermission } = usePermissions();
  const [viewMode, setViewMode] = useState('list');

  const canCreateEvents = hasAnyPermission(['event_create', 'admin']) || 
    roles?.some(r => ['admin', 'super_admin', 'municipality_admin', 'gdibs_internal', 'event_manager'].includes(r));

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const upcomingEvents = events.filter(e => 
    e.start_date && new Date(e.start_date) >= new Date()
  ).slice(0, 10);

  const stats = {
    total: events.length,
    upcoming: upcomingEvents.length,
    this_month: events.filter(e => {
      if (!e.start_date) return false;
      const eventDate = new Date(e.start_date);
      const now = new Date();
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }).length,
    registered: events.reduce((sum, e) => sum + (e.registered_count || 0), 0)
  };

  const eventTypeColors = {
    workshop: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    conference: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    hackathon: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    webinar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    training: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    networking: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
  };

  const eventModeIcons = {
    in_person: <MapPin className="h-4 w-4" />,
    virtual: <Video className="h-4 w-4" />,
    hybrid: <Calendar className="h-4 w-4" />
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={Calendar}
        title={t({ en: 'Events', ar: 'الفعاليات' })}
        description={t({ en: 'Workshops, conferences, and innovation events', ar: 'ورش العمل والمؤتمرات وفعاليات الابتكار' })}
        accentColor="blue"
        stats={[
          { value: stats.total, label: t({ en: 'Total', ar: 'الإجمالي' }), icon: Calendar, color: 'blue' },
          { value: stats.upcoming, label: t({ en: 'Upcoming', ar: 'قادم' }), icon: Clock, color: 'teal' },
          { value: stats.this_month, label: t({ en: 'This Month', ar: 'هذا الشهر' }), color: 'green' },
          { value: stats.registered, label: t({ en: 'Registrations', ar: 'التسجيلات' }), icon: Users, color: 'purple' },
        ]}
        action={canCreateEvents && (
          <Link to={createPageUrl('EventDetail') + '?mode=create'}>
            <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg">
              <Plus className="h-4 w-4" />
              {t({ en: 'Create Event', ar: 'إنشاء فعالية' })}
            </Button>
          </Link>
        )}
      />

      {/* Upcoming Events */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t({ en: 'Upcoming Events', ar: 'الفعاليات القادمة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <CitizenEmptyState
              icon={Calendar}
              title={t({ en: 'No upcoming events', ar: 'لا توجد فعاليات قادمة' })}
              description={t({ en: 'Check back later for new events', ar: 'تحقق لاحقاً للفعاليات الجديدة' })}
            />
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <Link key={event.id} to={createPageUrl('EventDetail') + `?id=${event.id}`}>
                  <div className="group p-4 border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-md transition-all cursor-pointer bg-card">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-center p-3 bg-primary/10 rounded-lg min-w-[70px]">
                        <p className="text-2xl font-bold text-primary">
                          {event.start_date ? new Date(event.start_date).getDate() : '?'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.start_date ? new Date(event.start_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' }) : ''}
                        </p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {language === 'ar' ? (event.title_ar || event.title_en) : (event.title_en || event.title_ar)}
                          </h3>
                          {event.event_type && (
                            <Badge className={eventTypeColors[event.event_type] || 'bg-gray-100 text-gray-700'}>
                              {event.event_type?.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          {event.is_virtual !== undefined && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              {event.is_virtual ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                              {event.is_virtual ? t({ en: 'Virtual', ar: 'افتراضي' }) : t({ en: 'In-Person', ar: 'حضوري' })}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {language === 'ar' ? (event.description_ar || event.description_en) : (event.description_en || event.description_ar)}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          {event.start_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          )}
                          {event.max_participants && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {event.registered_count || 0}/{event.max_participants}
                            </div>
                          )}
                        </div>
                      </div>

                      <ArrowRight className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </CitizenPageLayout>
  );
}

export default ProtectedPage(EventCalendar, { requiredPermissions: [] });
