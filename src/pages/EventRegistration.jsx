import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, Users, MapPin, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useEvent, useEventMutations } from '@/hooks/useEvents';

function EventRegistration() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  const { data: event, isLoading } = useEvent(eventId);
  const { registerForEvent } = useEventMutations();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    if (!user || !event) return;

    setIsRegistering(true);
    try {
      await registerForEvent.mutateAsync({
        eventId,
        currentRegistrationCount: event.registration_count
      });
      // Success handled by mutation onSuccess (toast + invalidation)
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(t({ en: 'Registration failed', ar: 'فشل التسجيل' }));
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const title = language === 'ar' ? event.title_ar : event.title_en;
  const description = language === 'ar' ? event.description_ar : event.description_en;

  const isRegistrationOpen = event.status === 'registration_open';
  const isFull = event.capacity && event.registration_count >= event.capacity;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                {t({ en: 'Event Code:', ar: 'رمز الفعالية:' })} {event.code}
              </p>
            </div>
            <Badge className={isRegistrationOpen ? 'bg-green-600' : 'bg-gray-400'}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Date', ar: 'التاريخ' })}</p>
                  <p className="text-sm text-slate-900">
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Location', ar: 'الموقع' })}</p>
                  <p className="text-sm text-slate-900">{event.location || 'TBD'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Mode', ar: 'الطريقة' })}</p>
                  <p className="text-sm text-slate-900">{event.mode || 'In-person'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-600">{t({ en: 'Capacity', ar: 'السعة' })}</p>
                  <p className="text-sm text-slate-900">
                    {event.registration_count || 0} / {event.capacity || '∞'} {t({ en: 'registered', ar: 'مسجل' })}
                  </p>
                </div>
              </div>
            </div>

            <div>
              {description && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">{description}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isRegistrationOpen && !isFull ? (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle>{t({ en: 'Register for Event', ar: 'التسجيل في الفعالية' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-lg">
              <p className="text-sm text-slate-700 mb-2">
                {t({ en: 'Registering as:', ar: 'التسجيل باسم:' })}
              </p>
              <p className="font-semibold text-slate-900">{user?.full_name}</p>
              <p className="text-sm text-slate-600">{user?.email}</p>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleRegister}
              disabled={isRegistering}
            >
              {isRegistering ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Confirm Registration', ar: 'تأكيد التسجيل' })}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <p className="font-semibold text-red-900">
              {isFull
                ? t({ en: 'Event is full', ar: 'الفعالية ممتلئة' })
                : t({ en: 'Registration is closed', ar: 'التسجيل مغلق' })
              }
            </p>
          </CardContent>
        </Card>
      )}

      {event.agenda && event.agenda.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Event Agenda', ar: 'جدول الفعالية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {event.agenda.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.title || item}</p>
                    {item.time && (
                      <p className="text-xs text-slate-600 mt-1">{item.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(EventRegistration, { requiredPermissions: [] });