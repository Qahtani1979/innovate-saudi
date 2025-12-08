import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Clock, CheckCircle2, Circle, Activity } from 'lucide-react';

export default function ChallengeTimelineView({ challenge, activities = [] }) {
  const { language, isRTL, t } = useLanguage();

  const timelineEvents = [
    { date: challenge.created_date, label: 'Created', status: 'complete', icon: Circle },
    { date: challenge.submission_date, label: 'Submitted', status: challenge.submission_date ? 'complete' : 'pending', icon: Circle },
    { date: challenge.review_date, label: 'Reviewed', status: challenge.review_date ? 'complete' : 'pending', icon: Activity },
    { date: challenge.approval_date, label: 'Approved', status: challenge.approval_date ? 'complete' : 'pending', icon: CheckCircle2 },
    { date: challenge.resolution_date, label: 'Resolved', status: challenge.resolution_date ? 'complete' : 'pending', icon: CheckCircle2 },
    { date: challenge.archive_date, label: 'Archived', status: challenge.archive_date ? 'complete' : 'pending', icon: Circle }
  ].filter(e => e.date || e.status === 'pending');

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          {t({ en: 'Challenge Timeline', ar: 'المخطط الزمني للتحدي' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineEvents.map((event, i) => {
            const Icon = event.icon;
            const isLast = i === timelineEvents.length - 1;
            
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    event.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-12 ${
                      event.status === 'complete' ? 'bg-green-300' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-900">{event.label}</p>
                    {event.status === 'complete' && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(event.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </Badge>
                    )}
                  </div>
                  {event.date && (
                    <p className="text-xs text-slate-500">
                      {new Date(event.date).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Activities Log */}
        {activities.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">
              {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
            </h4>
            <div className="space-y-2">
              {activities.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span className="text-slate-700">{activity.description}</span>
                  <span className="text-slate-400 ml-auto">
                    {new Date(activity.created_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}