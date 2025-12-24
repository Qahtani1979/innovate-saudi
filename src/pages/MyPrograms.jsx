import { useState } from 'react';
import { useMyPrograms } from '@/hooks/useMyPrograms';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, CheckCircle2, Clock, Award, Rocket, CalendarDays, ArrowRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { StandardPagination } from '@/components/ui/StandardPagination';
import { EntityListSkeleton } from '@/components/ui/skeletons/EntityListSkeleton';

function MyPrograms() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  // GOLD STANDARD HOOK
  const {
    applications, // Paginated list of applications (with joined program details)
    stats,        // Lightweight stats counts
    upcomingEvents,
    isLoading,
    isEmpty,
    totalPages
  } = useMyPrograms(user?.email, page);

  const upcomingMilestones = applications
    .filter(app => ['accepted', 'enrolled'].includes(app.status))
    .flatMap(app => {
      const program = app.program; // Joined data
      if (!program?.curriculum) return [];
      return program.curriculum
        .filter(c => c.week && !c.completed)
        .map(c => ({ ...c, programName: language === 'ar' && program.name_ar ? program.name_ar : program.name_en }));
    }).slice(0, 5);

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'My Programs', ar: 'برامجي' }}
        subtitle={{ en: 'Programs you\'re enrolled in', ar: 'البرامج المسجل فيها' }}
        icon={<Rocket className="h-6 w-6 text-white" />}
        description=""
        action={
          <Link to={createPageUrl('Programs')}>
            <Button size="sm" variant="secondary">
              {t({ en: 'Browse Programs', ar: 'تصفح البرامج' })}
            </Button>
          </Link>
        }
      />

      {/* Summary Cards */}
      {isLoading ? (
        <EntityListSkeleton mode="grid" rowCount={3} columnCount={1} /> // Using list skeleton for cards as placeholder
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6 text-center">
              <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{stats.enrolled}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Enrolled Programs', ar: 'برامج مسجل' })}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6 text-center">
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{stats.graduated}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Graduated', ar: 'متخرج' })}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Applications List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t({ en: 'Active Applications & Programs', ar: 'الطلبات والبرامج النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <EntityListSkeleton mode="list" rowCount={4} />
          ) : isEmpty ? (
            <div className="text-center py-12">
              <Rocket className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {t({ en: 'No Program Applications', ar: 'لا توجد طلبات برامج' })}
              </h3>
              <Link to={createPageUrl('Programs')}>
                <Button className="bg-purple-600 mt-4">
                  {t({ en: 'Browse Programs', ar: 'تصفح البرامج' })}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const program = app.program; // Joined via select: '*, program:programs(*)'
                if (!program) return null; // Should not happen with inner join, but safe check

                const progress = app.progress_percentage || 0;
                const sessionsAttended = app.attendance_rate ? Math.round(app.attendance_rate) : 0;
                const isEnrolled = ['accepted', 'enrolled'].includes(app.status);

                return (
                  <div key={app.id} className="p-4 border-2 rounded-lg hover:border-purple-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{program.program_type?.replace(/_/g, ' ')}</Badge>
                          <Badge variant={
                            app.status === 'enrolled' ? 'default' :
                              app.status === 'rejected' ? 'destructive' : 'outline'
                          }>{app.status}</Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {language === 'ar' && program.description_ar ? program.description_ar : program.description_en}
                        </p>
                      </div>
                      <Link to={createPageUrl(`ProgramApplicationDetail?id=${app.id}`)}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>

                    {isEnrolled && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600">{t({ en: 'Progress', ar: 'التقدم' })}</span>
                            <span className="text-sm font-bold text-slate-900">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-600">{t({ en: 'Attendance', ar: 'الحضور' })}: {sessionsAttended}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-600">
                              {app.deliverables_completed || 0}/{app.total_deliverables || 0} {t({ en: 'deliverables', ar: 'مخرجات' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION UI */}
          {!isLoading && !isEmpty && (
            <StandardPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>

      {/* My Program Events */}
      {upcomingEvents.length > 0 && (
        <Card className="border-2 border-teal-200 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-teal-600" />
                {t({ en: 'Upcoming Program Events', ar: 'فعاليات البرامج القادمة' })}
              </CardTitle>
              <Link to={createPageUrl('EventCalendar')}>
                <Button size="sm" variant="outline">
                  {t({ en: 'View All', ar: 'عرض الكل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event) => (
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

      {/* Upcoming Milestones - Derived from visible applications */}
      {!isLoading && upcomingMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Upcoming Milestones', ar: 'المعالم القادمة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMilestones.map((milestone, i) => (
              <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{milestone.name}</p>
                  <p className="text-xs text-indigo-600 font-medium">{milestone.programName}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {milestone.due_date ? format(new Date(milestone.due_date), 'MMMM dd, yyyy') : 'No Date'}
                  </p>
                </div>
                <Badge variant="outline">{milestone.status || 'Pending'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(MyPrograms, { requiredPermissions: [] });