import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Calendar, Clock, Loader2, Shield } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useCheckSchedulingConflicts } from '@/hooks/useCheckSchedulingConflicts';

export function AIConflictDetector({
  proposedDate,
  proposedTime,
  eventId = null, // exclude self when editing
  onConflictsFound
}) {
  const { t, isRTL, language } = useLanguage();
  const [conflicts, setConflicts] = useState([]);
  const [checking, setChecking] = useState(false);

  // Fetch conflict data using custom hook
  const { events: existingEvents, pilots, programs } = useCheckSchedulingConflicts();

  const checkConflicts = () => {
    if (!proposedDate) return;

    setChecking(true);
    const proposedDateObj = new Date(proposedDate);
    const foundConflicts = [];

    // Check events on same day
    existingEvents.forEach(event => {
      if (event.id === eventId) return; // skip self

      const eventDate = new Date(event.start_date);
      if (eventDate.toDateString() === proposedDateObj.toDateString()) {
        foundConflicts.push({
          type: 'event',
          severity: 'high',
          title: language === 'ar' ? (event.title_ar || event.title_en) : (event.title_en || event.title_ar),
          time: eventDate.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }),
          message: t({
            en: 'Another event scheduled at the same time',
            ar: 'فعالية أخرى مجدولة في نفس الوقت'
          })
        });
      }
    });

    // Check pilot milestones
    pilots.forEach(pilot => {
      if (!pilot.timeline) return;

      const milestones = ['pilot_start', 'pilot_end', 'review_date'];
      milestones.forEach(m => {
        if (pilot.timeline[m]) {
          const mDate = new Date(pilot.timeline[m]);
          if (mDate.toDateString() === proposedDateObj.toDateString()) {
            foundConflicts.push({
              type: 'pilot',
              severity: 'medium',
              title: language === 'ar' ? (pilot.title_ar || pilot.title_en) : (pilot.title_en || pilot.title_ar),
              time: m.replace('_', ' '),
              message: t({
                en: 'Pilot milestone on this date',
                ar: 'معلم تجريبي في هذا التاريخ'
              })
            });
          }
        }
      });
    });

    // Check program sessions
    programs.forEach(program => {
      // @ts-ignore
      if (!program.timeline?.program_start) return;

      // @ts-ignore
      const startDate = new Date(program.timeline.program_start);
      if (startDate.toDateString() === proposedDateObj.toDateString()) {
        foundConflicts.push({
          type: 'program',
          severity: 'medium',
          title: language === 'ar' ? (program.name_ar || program.name_en) : (program.name_en || program.name_ar),
          time: startDate.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }),
          message: t({
            en: 'Program session scheduled',
            ar: 'جلسة برنامج مجدولة'
          })
        });
      }
    });

    setConflicts(foundConflicts);
    setChecking(false);

    if (onConflictsFound) {
      onConflictsFound(foundConflicts);
    }
  };

  useEffect(() => {
    if (proposedDate) {
      checkConflicts();
    }
  }, [proposedDate, proposedTime, existingEvents.length, pilots.length, programs.length]);

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[severity] || colors.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      event: Calendar,
      pilot: Shield,
      program: Clock
    };
    return icons[type] || Calendar;
  };

  if (!proposedDate) {
    return null;
  }

  return (
    <Card className={conflicts.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          {checking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : conflicts.length > 0 ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          {t({ en: 'Schedule Check', ar: 'فحص الجدول' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {checking ? (
          <p className="text-sm text-muted-foreground">
            {t({ en: 'Checking for conflicts...', ar: 'جاري البحث عن تعارضات...' })}
          </p>
        ) : conflicts.length === 0 ? (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              {t({ en: 'No scheduling conflicts detected', ar: 'لا توجد تعارضات في الجدول' })}
            </p>
          </div>
        ) : (
          <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
            <p className="text-sm font-medium text-amber-700 mb-2">
              {conflicts.length} {t({ en: 'potential conflict(s) found', ar: 'تعارض محتمل' })}
            </p>
            {conflicts.map((conflict, i) => {
              const Icon = getTypeIcon(conflict.type);
              return (
                <div key={i} className={`p-2 rounded-lg border ${getSeverityColor(conflict.severity)}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium flex-1">{conflict.title}</span>
                    <Badge variant="outline" className="text-xs">{conflict.time}</Badge>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{conflict.message}</p>
                </div>
              );
            })}
            <div className="pt-2 border-t mt-3">
              <p className="text-xs text-muted-foreground">
                {t({
                  en: 'Consider choosing a different time to avoid potential attendance conflicts',
                  ar: 'فكر في اختيار وقت مختلف لتجنب تعارضات الحضور المحتملة'
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIConflictDetector;
