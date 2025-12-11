import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Calendar, Users, CheckCircle2, Clock, Award, Rocket } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function MyPrograms() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { data: myApplications = [] } = useQuery({
    queryKey: ['my-program-apps', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('program_applications').select('*')
        .or(`applicant_email.eq.${user?.email},created_by.eq.${user?.email}`);
      return data || [];
    },
    enabled: !!user
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-detail'],
    queryFn: async () => {
      const { data } = await supabase.from('programs').select('*');
      return data || [];
    }
  });

  const enrolledApps = myApplications.filter(a => ['accepted', 'enrolled'].includes(a.status));
  const programsMap = programs.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

  const upcomingMilestones = enrolledApps.flatMap(app => {
    const program = programsMap[app.program_id];
    if (!program?.curriculum) return [];
    return program.curriculum
      .filter(c => c.week && !c.completed)
      .map(c => ({ ...c, programName: program.name_en }));
  }).slice(0, 5);

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'My Programs', ar: 'برامجي' }}
        subtitle={{ en: 'Programs you\'re enrolled in', ar: 'البرامج المسجل فيها' }}
        icon={<Rocket className="h-6 w-6 text-white" />}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{enrolledApps.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Enrolled Programs', ar: 'برامج مسجل' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {myApplications.filter(a => a.status === 'submitted' || a.status === 'under_review').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {myApplications.filter(a => a.status === 'graduated').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Graduated', ar: 'متخرج' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Programs */}
      {enrolledApps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Active Programs', ar: 'البرامج النشطة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrolledApps.map((app) => {
              const program = programsMap[app.program_id];
              if (!program) return null;

              const progress = app.progress_percentage || 0;
              const sessionsAttended = app.attendance_rate ? Math.round(app.attendance_rate) : 0;

              return (
                <div key={app.id} className="p-4 border-2 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{program.program_type?.replace(/_/g, ' ')}</Badge>
                        <Badge variant="outline">{app.status}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {language === 'ar' && program.description_ar ? program.description_ar : program.description_en}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
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

                  <Link to={createPageUrl(`ProgramApplicationDetail?id=${app.id}`)}>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      {t({ en: 'View Program Details', ar: 'عرض تفاصيل البرنامج' })}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Upcoming Milestones', ar: 'المعالم القادمة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMilestones.slice(0, 5).map((milestone, i) => (
              <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{milestone.name}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {format(new Date(milestone.due_date), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <Badge variant="outline">{milestone.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {myApplications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {t({ en: 'No Program Applications', ar: 'لا توجد طلبات برامج' })}
            </h3>
            <p className="text-slate-600 mb-4">
              {t({ en: 'Apply to programs to grow your impact', ar: 'تقدم للبرامج لزيادة تأثيرك' })}
            </p>
            <Link to={createPageUrl('Programs')}>
              <Button className="bg-purple-600">
                {t({ en: 'Browse Programs', ar: 'تصفح البرامج' })}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(MyPrograms, { requiredPermissions: [] });