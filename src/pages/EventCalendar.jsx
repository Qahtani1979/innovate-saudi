import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { usePermissions } from '@/components/permissions/usePermissions';
import { Calendar, Plus, Users, MapPin, Clock, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function EventCalendar() {
  const { t, isRTL, language } = useLanguage();
  const { roles, hasAnyPermission } = usePermissions();
  const [viewMode, setViewMode] = useState('list');

  // Check if user can create events (admin, municipality_admin, or internal staff)
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
    workshop: 'bg-blue-100 text-blue-700',
    conference: 'bg-purple-100 text-purple-700',
    hackathon: 'bg-green-100 text-green-700',
    webinar: 'bg-amber-100 text-amber-700',
    training: 'bg-indigo-100 text-indigo-700',
    networking: 'bg-pink-100 text-pink-700'
  };

  const eventModeIcons = {
    in_person: <MapPin className="h-4 w-4" />,
    virtual: <Video className="h-4 w-4" />,
    hybrid: <Calendar className="h-4 w-4" />
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t({ en: 'Event Calendar', ar: 'تقويم الفعاليات' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Workshops, conferences, and innovation events', ar: 'ورش العمل والمؤتمرات وفعاليات الابتكار' })}
          </p>
        </div>
        {canCreateEvents && (
          <Link to={createPageUrl('EventDetail') + '?mode=create'}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Create Event', ar: 'إنشاء فعالية' })}
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Total Events', ar: 'إجمالي الفعاليات' })}</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Upcoming', ar: 'قادم' })}</p>
                <p className="text-2xl font-bold text-primary">{stats.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'This Month', ar: 'هذا الشهر' })}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.this_month}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Registrations', ar: 'التسجيلات' })}</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.registered}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Upcoming Events', ar: 'الفعاليات القادمة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">{t({ en: 'No upcoming events', ar: 'لا توجد فعاليات قادمة' })}</p>
              </div>
            ) : (
              upcomingEvents.map(event => (
                <Link key={event.id} to={createPageUrl('EventDetail') + `?id=${event.id}`}>
                  <div className="p-4 border rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-center p-3 bg-primary/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {event.start_date ? new Date(event.start_date).getDate() : '?'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' }) : ''}
                        </p>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">
                            {language === 'ar' ? (event.title_ar || event.title_en) : (event.title_en || event.title_ar)}
                          </h3>
                          <Badge className={eventTypeColors[event.event_type]}>
                            {event.event_type?.replace(/_/g, ' ')}
                          </Badge>
                          {event.event_mode && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              {eventModeIcons[event.event_mode]}
                              {event.event_mode}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {language === 'ar' ? (event.description_ar || event.description_en) : (event.description_en || event.description_ar)}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          {event.start_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          {event.location?.venue_name && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location.venue_name}
                            </div>
                          )}
                          {event.registered_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {event.registered_count} {t({ en: 'registered', ar: 'مسجل' })}
                            </div>
                          )}
                        </div>
                      </div>

                      {event.registration_required && (
                        <Button size="sm">
                          {t({ en: 'Register', ar: 'التسجيل' })}
                        </Button>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(EventCalendar, { requiredPermissions: [] });