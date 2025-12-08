import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Calendar, Users, Award, CheckCircle2, Clock, FileText,
  TrendingUp, Target, BookOpen, MessageSquare, Upload
} from 'lucide-react';

export default function ParticipantDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: myApplications = [] } = useQuery({
    queryKey: ['my-program-applications', user?.email],
    queryFn: async () => {
      const all = await base44.entities.ProgramApplication.list();
      return all.filter(app => app.applicant_email === user.email);
    },
    enabled: !!user
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  const activeProgram = myApplications.find(app => app.status === 'accepted');
  const program = activeProgram ? programs.find(p => p.id === activeProgram.program_id) : null;

  const mockData = {
    sessionsCompleted: 8,
    totalSessions: 12,
    assignmentsSubmitted: 6,
    totalAssignments: 8,
    mentorMeetings: 3,
    peerCollaborations: 5,
    overallProgress: 67
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
                  <p className="text-2xl font-bold text-blue-600">{mockData.overallProgress}%</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-600">{t({ en: 'Sessions', ar: 'الجلسات' })}</p>
                  <p className="text-2xl font-bold text-purple-600">{mockData.sessionsCompleted}/{mockData.totalSessions}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-600">{t({ en: 'Assignments', ar: 'المهام' })}</p>
                  <p className="text-2xl font-bold text-green-600">{mockData.assignmentsSubmitted}/{mockData.totalAssignments}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-600">{t({ en: 'Collaborations', ar: 'التعاون' })}</p>
                  <p className="text-2xl font-bold text-amber-600">{mockData.peerCollaborations}</p>
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
              <Progress value={mockData.overallProgress} className="h-3 mb-2" />
              <p className="text-sm text-slate-600">
                {t({ en: `You're ${mockData.overallProgress}% through the program`, ar: `أنت في ${mockData.overallProgress}% من البرنامج` })}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <FileText className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-1">{t({ en: 'Submit Assignment', ar: 'تقديم مهمة' })}</h3>
                <p className="text-xs text-slate-600">{t({ en: '2 assignments pending', ar: 'مهمتان معلقتان' })}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <MessageSquare className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold mb-1">{t({ en: 'Cohort Forum', ar: 'منتدى المجموعة' })}</h3>
                <p className="text-xs text-slate-600">{t({ en: '12 new messages', ar: '12 رسالة جديدة' })}</p>
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
                    <p className="font-medium text-slate-900">{t({ en: 'Session 9: Innovation Frameworks', ar: 'الجلسة 9: أطر الابتكار' })}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Tomorrow, 10:00 AM', ar: 'غداً، 10:00 ص' })}</p>
                  </div>
                  <Badge className="bg-purple-600 text-white">{t({ en: 'Required', ar: 'مطلوب' })}</Badge>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{t({ en: 'Assignment: Market Analysis', ar: 'مهمة: تحليل السوق' })}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Due: 3 days', ar: 'الموعد: 3 أيام' })}</p>
                  </div>
                  <Button size="sm" className="bg-blue-600">
                    <Upload className="h-3 w-3 mr-1" />
                    {t({ en: 'Submit', ar: 'تقديم' })}
                  </Button>
                </div>
              </div>
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