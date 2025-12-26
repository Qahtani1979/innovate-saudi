import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Calendar, Users, CheckCircle2, Clock, Sparkles,
  FileText, Plus, Bell, TestTube, CalendarDays
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';

import { useMyManagedOrganization } from '@/hooks/useOrganizationsWithVisibility';
import { usePrograms, useMyProgramApplications, useMyProgramEvents, useApplicationsForPrograms } from '@/hooks/usePrograms';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { usePilotsForPrograms, useMatchmakerApplicationsForPrograms } from '@/hooks/useProgramIntegrations';

function ProgramOperatorPortal() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  // Find programs I operate
  const { data: myOrganization } = useMyManagedOrganization();

  // RLS: See only programs my organization operates
  const { programs } = usePrograms();
  const myPrograms = (programs || []).filter(p =>
    p.operator_organization_id === myOrganization?.id ||
    p.created_by === user?.email
  ).filter(p => !p.is_deleted);

  const myProgramIds = myPrograms.map(p => p.id);

  // Applications to my programs
  const { data: applications = [] } = useApplicationsForPrograms(myProgramIds);

  // Pilots from my programs
  const { data: pilotConversions = [] } = usePilotsForPrograms(myProgramIds);

  // Matchmaker applications (if operating matchmaker)
  // Only fetch if we have matchmaker programs
  const hasMatchmaker = myPrograms.some(p => p.program_type === 'matchmaker');
  const { data: matchmakerApps = [] } = useMatchmakerApplicationsForPrograms(
    hasMatchmaker ? myProgramIds : []
  );

  // Fetch events for operated programs
  const { data: programEvents = [] } = useMyProgramEvents(myProgramIds);

  const activePrograms = myPrograms.filter(p => ['active', 'applications_open'].includes(p.status));
  const pendingApplications = applications.filter(a => a.status === 'submitted');
  const acceptedApplications = applications.filter(a => a.status === 'accepted');
  const matchmakerInEngagement = matchmakerApps.filter(m => m.stage === 'engagement');
  const upcomingEvents = programEvents.filter(e => new Date(e.start_date) >= new Date());

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
            {t({ en: 'Program Operator Portal', ar: 'بوابة مشغل البرامج' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Manage innovation programs, accelerators, matchmakers, and events', ar: 'إدارة برامج الابتكار، المسرعات، التوفيق، والفعاليات' })}
          </p>
        </div>
        <Link to={createPageUrl('ProgramCreate')}>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Create Program', ar: 'إنشاء برنامج' })}
          </Button>
        </Link>
      </div>

      {/* Pending Actions Alert */}
      {pendingApplications.length > 0 && (
        <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-900">
                  {pendingApplications.length} {t({ en: 'Application(s) Awaiting Review', ar: 'طلبات تنتظر المراجعة' })}
                </p>
                <p className="text-sm text-amber-700">
                  {t({ en: 'Review and approve participants', ar: 'راجع واعتمد المشاركين' })}
                </p>
              </div>
              <Link to={createPageUrl('ApplicationReviewHub')}>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  {t({ en: 'Review Now', ar: 'مراجعة الآن' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{activePrograms.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Active Programs', ar: 'برامج نشطة' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{applications.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Applications', ar: 'الطلبات' })}</p>
              <p className="text-xs text-slate-500 mt-1">
                {pendingApplications.length} {t({ en: 'pending', ar: 'معلقة' })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{acceptedApplications.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Participants', ar: 'مشاركون' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <TestTube className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-teal-600">{pilotConversions.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Pilots Created', ar: 'تجارب أنشئت' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-pink-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-pink-600">{matchmakerInEngagement.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Matchmaker Active', ar: 'توفيق نشط' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Programs Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {t({ en: 'My Programs', ar: 'برامجي' })}
            </CardTitle>
            <Link to={createPageUrl('Programs')}>
              <Button size="sm" variant="outline">
                {t({ en: 'View All', ar: 'عرض الكل' })}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {myPrograms.slice(0, 5).map((program) => {
            const programApps = applications.filter(a => a.program_id === program.id);
            const acceptedCount = programApps.filter(a => a.status === 'accepted').length;
            const conversionRate = programApps.length > 0 ? ((acceptedCount / programApps.length) * 100).toFixed(0) : 0;

            return (
              <Link key={program.id} to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                <div className="p-4 border-2 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                        </h3>
                        <Badge className={
                          program.status === 'active' ? 'bg-green-100 text-green-700 text-xs' :
                            program.status === 'applications_open' ? 'bg-blue-100 text-blue-700 text-xs' :
                              'bg-slate-100 text-slate-700 text-xs'
                        }>{program.status}</Badge>
                        <Badge variant="outline" className="text-xs">{program.program_type}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-bold text-blue-600">{programApps.length}</div>
                          <div className="text-slate-600">{t({ en: 'Apps', ar: 'طلبات' })}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-600">{acceptedCount}</div>
                          <div className="text-slate-600">{t({ en: 'Accepted', ar: 'مقبول' })}</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-bold text-purple-600">{conversionRate}%</div>
                          <div className="text-slate-600">{t({ en: 'Rate', ar: 'معدل' })}</div>
                        </div>
                        <div className="text-center p-2 bg-teal-50 rounded">
                          <div className="font-bold text-teal-600">{pilotConversions.filter(p => p.program_ids?.includes(program.id)).length}</div>
                          <div className="text-slate-600">{t({ en: 'Pilots', ar: 'تجارب' })}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {program.timeline?.application_close && (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Clock className="h-3 w-3" />
                      <span>{t({ en: 'Closes:', ar: 'يغلق:' })} {new Date(program.timeline.application_close).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
          {myPrograms.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No programs yet', ar: 'لا توجد برامج بعد' })}</p>
              <Link to={createPageUrl('ProgramCreate')}>
                <Button className="mt-3 bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Create First Program', ar: 'إنشاء أول برنامج' })}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matchmaker Pipeline (if operating matchmaker) */}
      {myPrograms.some(p => p.program_type === 'matchmaker') && (
        <Card className="border-2 border-purple-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                {t({ en: 'Matchmaker Pipeline', ar: 'خط التوفيق' })}
              </CardTitle>
              <Link to={createPageUrl('MatchmakerApplications')}>
                <Button size="sm" variant="outline">
                  {t({ en: 'Manage All', ar: 'إدارة الكل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {matchmakerApps.filter(m => ['screening', 'intake'].includes(m.stage)).length}
                </div>
                <div className="text-xs text-slate-600">{t({ en: 'Screening', ar: 'فحص' })}</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {matchmakerApps.filter(m => m.stage === 'detailed_evaluation').length}
                </div>
                <div className="text-xs text-slate-600">{t({ en: 'Evaluating', ar: 'تقييم' })}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {matchmakerApps.filter(m => m.stage === 'strategic_challenge_mapping').length}
                </div>
                <div className="text-xs text-slate-600">{t({ en: 'Mapping', ar: 'ربط' })}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {matchmakerInEngagement.length}
                </div>
                <div className="text-xs text-slate-600">{t({ en: 'Engaging', ar: 'تفاعل' })}</div>
              </div>
            </div>

            <div className="space-y-2">
              {matchmakerInEngagement.slice(0, 4).map((app) => (
                <Link key={app.id} to={createPageUrl(`MatchmakerApplicationDetail?id=${app.id}`)}>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:border-purple-400 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-slate-900">{app.organization_name_en}</p>
                        <p className="text-xs text-slate-600">
                          {app.matched_challenges?.length || 0} {t({ en: 'challenges matched', ar: 'تحديات مطابقة' })}
                        </p>
                      </div>
                      <Badge className={
                        app.classification === 'fast_pass' ? 'bg-purple-600 text-white text-xs' :
                          app.classification === 'strong_qualified' ? 'bg-green-600 text-white text-xs' :
                            'bg-blue-100 text-blue-700 text-xs'
                      }>{app.classification?.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Program Events Management */}
      <Card className="border-2 border-teal-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-teal-600" />
              {t({ en: 'Program Events', ar: 'فعاليات البرامج' })} ({programEvents.length})
            </CardTitle>
            <div className="flex gap-2">
              <Link to={createPageUrl('EventCalendar')}>
                <Button size="sm" variant="outline">
                  {t({ en: 'Calendar', ar: 'التقويم' })}
                </Button>
              </Link>
              <Link to={createPageUrl('EventCreate')}>
                <Button size="sm" className="bg-teal-600">
                  <Plus className="h-4 w-4 mr-1" />
                  {t({ en: 'New Event', ar: 'فعالية جديدة' })}
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.slice(0, 5).map((event) => {
            const program = myPrograms.find(p => p.id === event.program_id);
            return (
              <Link key={event.id} to={createPageUrl(`EventDetail?id=${event.id}`)}>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg hover:border-teal-400 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-slate-900">
                          {language === 'ar' && event.title_ar ? event.title_ar : event.title_en}
                        </p>
                        <Badge className={
                          event.event_type === 'workshop' ? 'bg-purple-100 text-purple-700 text-xs' :
                            event.event_type === 'webinar' ? 'bg-blue-100 text-blue-700 text-xs' :
                              'bg-teal-100 text-teal-700 text-xs'
                        }>{event.event_type}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        {format(new Date(event.start_date), 'MMM d, yyyy')} • {program?.name_en || 'General'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {event.registered_count || 0}/{event.max_participants || '∞'}
                      </Badge>
                      <Badge className={
                        event.status === 'published' ? 'bg-green-100 text-green-700 text-xs' :
                          event.status === 'draft' ? 'bg-slate-100 text-slate-700 text-xs' :
                            'bg-amber-100 text-amber-700 text-xs'
                      }>{event.status}</Badge>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          {programEvents.length === 0 && (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-3">{t({ en: 'No events yet', ar: 'لا توجد فعاليات بعد' })}</p>
              <Link to={createPageUrl('EventCreate')}>
                <Button size="sm" className="bg-teal-600">
                  <Plus className="h-4 w-4 mr-1" />
                  {t({ en: 'Create First Event', ar: 'إنشاء أول فعالية' })}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Applications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
              {t({ en: 'Applications Awaiting Review', ar: 'الطلبات قيد المراجعة' })} ({pendingApplications.length})
            </CardTitle>
            <Link to={createPageUrl('ApplicationReviewHub')}>
              <Button size="sm" className="bg-amber-600">
                {t({ en: 'Review Center', ar: 'مركز المراجعة' })}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingApplications.slice(0, 8).map((app) => {
            const program = myPrograms.find(p => p.id === app.program_id);
            return (
              <Link key={app.id} to={createPageUrl(`ProgramApplicationDetail?id=${app.id}`)}>
                <div className="p-3 border rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-slate-900">{app.applicant_name || app.created_by}</p>
                        <Badge variant="outline" className="text-xs">
                          {program?.name_en || 'Program'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        {t({ en: 'Submitted:', ar: 'مقدم:' })} {new Date(app.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700">
                      {t({ en: 'Review', ar: 'مراجعة' })}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
          {pendingApplications.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'All applications reviewed', ar: 'تمت مراجعة جميع الطلبات' })}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ProgramOperatorPortal, {
  requiredPermissions: ['program_manage']
});
