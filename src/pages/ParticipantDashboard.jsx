import { useAuth } from '@/lib/AuthContext';
import { useParticipantDashboardData } from '@/hooks/useParticipantDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import {
  Calendar, Clock, FileText,
  TrendingUp, BookOpen, MessageSquare, Upload, CalendarDays
} from 'lucide-react';

export default function ParticipantDashboard() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { myApplications, programs, activeProgram, program, progressData, programEvents } = useParticipantDashboardData(user?.email);

  // Fallback data if queries return nothing
  const displayData = progressData || {
    sessionsCompleted: 0,
    totalSessions: 12,
    assignmentsSubmitted: 0,
    totalAssignments: 8,
    mentorMeetings: 0,
    peerCollaborations: 0,
    overallProgress: 0
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'My Program Dashboard', ar: 'لوحة برنامجي' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Track your progress and engage with your cohort', ar: 'تتبع تقدمك وتفاعل مع مجموعتك' })}
        </p>
      </div>

      {activeProgram && program ? (
        <>
          {/* Program Info */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{language === 'ar' && program.name_ar ? program.name_ar : program.name_en}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{program.program_type?.replace(/_/g, ' ')}</p>
                </div>
                <Badge className="text-lg px-4 py-2 bg-green-600 text-white">
                  {t({ en: 'Active', ar: 'نشط' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-600">{t({ en: 'Progress', ar: 'التقدم' })}</p>
                  <p className="text-2xl font-bold text-blue-600">{displayData.overallProgress}%</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-600">{t({ en: 'Sessions', ar: 'الجلسات' })}</p>
                  <p className="text-2xl font-bold text-purple-600">{displayData.sessionsCompleted}/{displayData.totalSessions}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-600">{t({ en: 'Assignments', ar: 'المهام' })}</p>
                  <p className="text-2xl font-bold text-green-600">{displayData.assignmentsSubmitted}/{displayData.totalAssignments}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-600">{t({ en: 'Collaborations', ar: 'التعاون' })}</p>
                  <p className="text-2xl font-bold text-amber-600">{displayData.peerCollaborations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                {t({ en: 'Overall Progress', ar: 'التقدم الإجمالي' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={displayData.overallProgress} className="h-3 mb-2" />
              <p className="text-sm text-slate-600">
                {t({ en: `You're ${displayData.overallProgress}% through the program`, ar: `أنت في ${displayData.overallProgress}% من البرنامج` })}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <FileText className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-1">{t({ en: 'Submit Assignment', ar: 'تقديم مهمة' })}</h3>
                <p className="text-xs text-slate-600">
                  {t({
                    en: `${displayData.totalAssignments - displayData.assignmentsSubmitted} assignments pending`,
                    ar: `${displayData.totalAssignments - displayData.assignmentsSubmitted} مهام معلقة`
                  })}
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <MessageSquare className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-1">{t({ en: 'Cohort Forum', ar: 'منتدى المجموعة' })}</h3>
                <p className="text-xs text-slate-600">{t({ en: 'Connect with peers', ar: 'تواصل مع الزملاء' })}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <BookOpen className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold mb-1">{t({ en: 'Resources', ar: 'الموارد' })}</h3>
                <p className="text-xs text-slate-600">{t({ en: 'Session materials', ar: 'مواد الجلسات' })}</p>
              </CardContent>
            </Card>
          </div>

          {/* Program Events */}
          {programEvents.length > 0 && (
            <Card className="border-2 border-teal-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-teal-600" />
                    {t({ en: 'Program Events', ar: 'فعاليات البرنامج' })}
                  </CardTitle>
                  <Link to={createPageUrl('EventCalendar')}>
                    <Button size="sm" variant="outline">
                      {t({ en: 'View All', ar: 'عرض الكل' })}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {programEvents.map((event) => (
                  <Link key={event.id} to={createPageUrl(`EventDetail?id=${event.id}`)}>
                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 hover:border-teal-400 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {language === 'ar' && event.title_ar ? event.title_ar : event.title_en}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {format(new Date(event.start_date), 'MMM d, yyyy')} • {event.event_mode}
                          </p>
                        </div>
                        <Badge className={
                          event.event_type === 'workshop' ? 'bg-purple-100 text-purple-700' :
                            event.event_type === 'webinar' ? 'bg-blue-100 text-blue-700' :
                              'bg-teal-100 text-teal-700'
                        }>{event.event_type}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                {t({ en: 'Upcoming', ar: 'القادم' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {t({ en: `Session ${displayData.sessionsCompleted + 1}: Next Module`, ar: `الجلسة ${displayData.sessionsCompleted + 1}: الوحدة التالية` })}
                    </p>
                    <p className="text-xs text-slate-600">{t({ en: 'Check program calendar', ar: 'راجع تقويم البرنامج' })}</p>
                  </div>
                  <Badge className="bg-purple-600 text-white">{t({ en: 'Required', ar: 'مطلوب' })}</Badge>
                </div>
              </div>
              {displayData.totalAssignments > displayData.assignmentsSubmitted && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{t({ en: 'Pending Assignment', ar: 'مهمة معلقة' })}</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Review and submit', ar: 'راجع وقدم' })}</p>
                    </div>
                    <Button size="sm" className="bg-blue-600">
                      <Upload className="h-3 w-3 mr-1" />
                      {t({ en: 'Submit', ar: 'تقديم' })}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {t({ en: 'No Active Program', ar: 'لا يوجد برنامج نشط' })}
            </h2>
            <p className="text-slate-600 mb-4">
              {t({ en: 'Apply to innovation programs to get started', ar: 'تقدم للبرامج للبدء' })}
            </p>
            <Link to={createPageUrl('Programs')}>
              <Button className="bg-blue-600">
                {t({ en: 'Browse Programs', ar: 'تصفح البرامج' })}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}