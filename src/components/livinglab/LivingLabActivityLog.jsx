import { useLivingLabActivities, useRecentLivingLabBookings } from '@/hooks/useLivingLabActivity';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, Calendar, Clock, User } from 'lucide-react';

export default function LivingLabActivityLog({ livingLabId }) {
  const { t, language } = useLanguage();

  const { data: activities = [] } = useLivingLabActivities(livingLabId);
  const { data: bookings = [] } = useRecentLivingLabBookings(livingLabId);

  const allEvents = [
    ...activities.map(a => ({ ...a, type: 'activity' })),
    ...bookings.map(b => ({
      ...b,
      type: 'booking',
      activity_description: `Booking: ${b.booking_purpose} (${b.booking_status})`,
      created_by: b.requester_email
    }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t({ en: 'Activity & Bookings Log', ar: 'سجل النشاط والحجوزات' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allEvents.map((event, idx) => {
            const Icon = event.type === 'booking' ? Calendar : Activity;
            return (
              <div key={idx} className={`flex gap-3 p-3 rounded-lg border ${event.type === 'booking' ? 'bg-teal-50 border-teal-200' : 'bg-slate-50'
                }`}>
                <div className={`h-8 w-8 rounded-full ${event.type === 'booking' ? 'bg-teal-100' : 'bg-blue-100'
                  } flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${event.type === 'booking' ? 'text-teal-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="text-sm font-medium">{event.created_by}</span>
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {new Date(event.created_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{event.activity_description}</p>
                  {event.activity_type && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {event.activity_type}
                    </Badge>
                  )}
                  {event.booking_status && (
                    <Badge className={`mt-2 text-xs ${event.booking_status === 'approved' ? 'bg-green-600' :
                      event.booking_status === 'pending' ? 'bg-yellow-600' :
                        'bg-slate-600'
                      }`}>
                      {event.booking_status}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          {allEvents.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">
              {t({ en: 'No activity recorded', ar: 'لا يوجد نشاط مسجل' })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
