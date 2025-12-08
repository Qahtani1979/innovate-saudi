import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, MapPin, Users, Clock, Globe, UserPlus } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function EventDetail() {
  const { t, language } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const events = await base44.entities.Event.filter({ id: eventId });
      return events[0];
    },
    enabled: !!eventId
  });

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-200 text-gray-800',
    published: 'bg-blue-200 text-blue-800',
    registration_open: 'bg-green-600 text-white',
    registration_closed: 'bg-amber-200 text-amber-800',
    in_progress: 'bg-purple-600 text-white',
    completed: 'bg-green-200 text-green-800',
    cancelled: 'bg-red-200 text-red-800'
  };

  const title = language === 'ar' ? event.title_ar : event.title_en;
  const description = language === 'ar' ? event.description_ar : event.description_en;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <Badge className={statusColors[event.status] || 'bg-gray-200'}>
              {event.status}
            </Badge>
          </div>
          <p className="text-slate-600 text-sm">
            {t({ en: 'Event Code:', ar: 'رمز الفعالية:' })} {event.code}
          </p>
        </div>
        {event.status === 'registration_open' && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            {t({ en: 'Register', ar: 'التسجيل' })}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">
              {new Date(event.start_date).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Start Date', ar: 'تاريخ البداية' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">
              {new Date(event.end_date).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'End Date', ar: 'تاريخ النهاية' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {event.registration_count || 0} / {event.capacity || '∞'}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Registrations', ar: 'التسجيلات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Globe className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">{event.mode || 'N/A'}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Mode', ar: 'الطريقة' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Event Details', ar: 'تفاصيل الفعالية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.event_type && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">{t({ en: 'Event Type', ar: 'نوع الفعالية' })}</p>
              <Badge>{event.event_type}</Badge>
            </div>
          )}

          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-600">{t({ en: 'Location', ar: 'الموقع' })}</p>
                <p className="text-sm text-slate-900">{event.location}</p>
              </div>
            </div>
          )}

          {description && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">{t({ en: 'Description', ar: 'الوصف' })}</p>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{description}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {event.agenda && event.agenda.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Agenda', ar: 'جدول الأعمال' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {event.agenda.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.title || item}</p>
                      {item.time && (
                        <p className="text-xs text-slate-600 mt-1">{item.time}</p>
                      )}
                    </div>
                    {item.duration && (
                      <Badge variant="outline" className="text-xs">{item.duration}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {event.speakers && event.speakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Speakers', ar: 'المتحدثون' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {event.speakers.map((speaker, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-semibold text-slate-900">{speaker.name || speaker}</p>
                  {speaker.title && (
                    <p className="text-sm text-slate-600">{speaker.title}</p>
                  )}
                  {speaker.organization && (
                    <p className="text-xs text-slate-500 mt-1">{speaker.organization}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(EventDetail, { requiredPermissions: [] });