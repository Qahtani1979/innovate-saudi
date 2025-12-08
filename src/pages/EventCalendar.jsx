import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, Plus, Users, MapPin, Clock, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function EventCalendar() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState('list');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_datetime')
  });

  const upcomingEvents = events.filter(e => 
    e.start_datetime && new Date(e.start_datetime) >= new Date()
  ).slice(0, 10);

  const stats = {
    total: events.length,
    upcoming: upcomingEvents.length,
    this_month: events.filter(e => {
      if (!e.start_datetime) return false;
      const eventDate = new Date(e.start_datetime);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Event Calendar', ar: 'تقويم الفعاليات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Workshops, conferences, and innovation events', ar: 'ورش العمل والمؤتمرات وفعاليات الابتكار' })}
          </p>
        </div>
        <Link to={createPageUrl('EventDetail') + '?mode=create'}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Create Event', ar: 'إنشاء فعالية' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Events', ar: 'إجمالي الفعاليات' })}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Upcoming', ar: 'قادم' })}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'This Month', ar: 'هذا الشهر' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.this_month}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Registrations', ar: 'التسجيلات' })}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.registered}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
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
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No upcoming events', ar: 'لا توجد فعاليات قادمة' })}</p>
              </div>
            ) : (
              upcomingEvents.map(event => (
                <Link key={event.id} to={createPageUrl('EventDetail') + `?id=${event.id}`}>
                  <div className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {event.start_datetime ? new Date(event.start_datetime).getDate() : '?'}
                        </p>
                        <p className="text-xs text-slate-600">
                          {event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('en-US', { month: 'short' }) : ''}
                        </p>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {event.title_en || event.title_ar}
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
                        
                        <p className="text-sm text-slate-600 mb-2">
                          {event.description_en || event.description_ar}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {event.start_datetime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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