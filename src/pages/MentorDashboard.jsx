import { useState } from 'react';
import { useMentorDashboardData } from '@/hooks/useMentorDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Users, Calendar, Clock, CheckCircle2
} from 'lucide-react';
import MentorScheduler from '../components/programs/MentorScheduler';

export default function MentorDashboard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState(null);

  const { assignments, programs, mentorships, evaluations } = useMentorDashboardData(user?.email);

  const totalHours = mentorships.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) / 60;
  const upcomingSessions = mentorships.filter(m => m.status === 'scheduled').length;
  const completedSessions = mentorships.filter(m => m.status === 'completed').length;

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: '🎓 Mentor Dashboard', ar: '🎓 لوحة الموجه' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Manage your mentorship activities and track mentee progress', ar: 'إدارة أنشطة الإرشاد وتتبع تقدم المتدربين' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Programs', ar: 'البرامج النشطة' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{programs.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Hours', ar: 'إجمالي الساعات' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completed Sessions', ar: 'الجلسات المكتملة' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{completedSessions}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Upcoming', ar: 'القادمة' })}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{upcomingSessions}</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'نظرة' })}</TabsTrigger>
          <TabsTrigger value="programs">{t({ en: 'Programs', ar: 'البرامج' })}</TabsTrigger>
          <TabsTrigger value="sessions">{t({ en: 'Sessions', ar: 'الجلسات' })}</TabsTrigger>
          <TabsTrigger value="mentees">{t({ en: 'Mentees', ar: 'المتدربون' })}</TabsTrigger>
          <TabsTrigger value="evaluations">{t({ en: 'Evaluations', ar: 'التقييمات' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Your Mentorship Impact', ar: 'تأثير إرشادك' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{assignments.length}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Mentees', ar: 'متدربون' })}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{evaluations.length}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Evaluations', ar: 'تقييمات' })}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{totalHours.toFixed(0)}h</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Hours Logged', ar: 'ساعات مسجلة' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Upcoming Sessions', ar: 'الجلسات القادمة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mentorships.filter(m => m.status === 'scheduled').slice(0, 5).map(m => (
                  <div key={m.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{m.mentee_name}</p>
                      <p className="text-xs text-slate-600">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {m.session_date} • {m.session_time}
                      </p>
                    </div>
                    <Badge>{m.location}</Badge>
                  </div>
                ))}
                {upcomingSessions === 0 && (
                  <p className="text-center text-slate-500 py-4 text-sm">
                    {t({ en: 'No upcoming sessions', ar: 'لا توجد جلسات قادمة' })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <div className="grid grid-cols-1 gap-4">
            {programs.map(program => {
              const myAssignment = assignments.find(a => a.entity_id === program.id);
              return (
                <Card key={program.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{language === 'ar' ? program.name_ar : program.name_en}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge>{program.program_type}</Badge>
                          <Badge variant="outline">{program.status}</Badge>
                          {myAssignment && (
                            <Badge className="bg-purple-100 text-purple-700">
                              {myAssignment.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-2">
                          {program.duration_weeks} {t({ en: 'weeks', ar: 'أسبوع' })} •
                          {program.accepted_count || 0} {t({ en: 'participants', ar: 'مشارك' })}
                        </p>
                      </div>
                      <Link to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                        <Button size="sm" variant="outline">
                          {t({ en: 'View Program', ar: 'عرض البرنامج' })}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          {programs.length > 0 && (
            <div className="space-y-4">
              <select
                className="px-3 py-2 border rounded-lg"
                onChange={(e) => setSelectedProgram(e.target.value)}
                value={selectedProgram || ''}
              >
                <option value="">{t({ en: 'Select program', ar: 'اختر برنامج' })}</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name_en}</option>
                ))}
              </select>

              {selectedProgram && (
                <MentorScheduler programId={selectedProgram} mentorEmail={user?.email} />
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentees">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Your Mentees', ar: 'متدربوك' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{assignment.entity_id}</p>
                        <Badge className="mt-2">{assignment.status}</Badge>
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        <p>{t({ en: 'Sessions:', ar: 'الجلسات:' })} {mentorships.filter(m => m.mentee_email === assignment.entity_id).length}</p>
                        <p className="text-xs mt-1">{assignment.hours_estimated}h {t({ en: 'estimated', ar: 'مقدر' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Evaluations Completed', ar: 'التقييمات المكتملة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {evaluations.map(evaluation => (
                  <div key={evaluation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{evaluation.entity_id}</p>
                      <Badge className={
                        evaluation.recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                          evaluation.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                      }>
                        {evaluation.recommendation}
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-xs text-slate-600">
                      <span>{t({ en: 'Score:', ar: 'النقاط:' })} {evaluation.overall_score}/100</span>
                      <span>• {new Date(evaluation.evaluation_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {evaluations.length === 0 && (
                  <p className="text-center text-slate-500 py-8 text-sm">
                    {t({ en: 'No evaluations yet', ar: 'لا توجد تقييمات بعد' })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
