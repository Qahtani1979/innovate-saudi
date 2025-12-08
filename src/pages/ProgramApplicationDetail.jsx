import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  FileText,
  Users,
  Calendar,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Lightbulb
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProgramApplicationDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const applicationId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();

  const { data: application, isLoading } = useQuery({
    queryKey: ['program-application', applicationId],
    queryFn: async () => {
      const applications = await base44.entities.ProgramApplication.list();
      return applications.find(a => a.id === applicationId);
    },
    enabled: !!applicationId
  });

  const { data: program } = useQuery({
    queryKey: ['program', application?.program_id],
    queryFn: async () => {
      const programs = await base44.entities.Program.list();
      return programs.find(p => p.id === application?.program_id);
    },
    enabled: !!application?.program_id
  });

  if (isLoading || !application) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    waitlisted: 'bg-orange-100 text-orange-700'
  };

  const statusConfig = {
    submitted: { color: 'bg-blue-100 text-blue-700', icon: FileText },
    under_review: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    shortlisted: { color: 'bg-purple-100 text-purple-700', icon: Award },
    accepted: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
    waitlisted: { color: 'bg-orange-100 text-orange-700', icon: Clock }
  };

  const statusInfo = statusConfig[application.status] || statusConfig.submitted;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {application.status?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {t({ en: 'Program Application', ar: 'طلب البرنامج' })}
              </h1>
              {program && (
                <p className="text-xl text-white/90">
                  {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{application.team_members?.length || 0} team members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{application.created_date ? new Date(application.created_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                {t({ en: 'Edit', ar: 'تعديل' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Team Size', ar: 'حجم الفريق' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {application.team_members?.length || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'التحديات' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {application.linked_challenges?.length || 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {application.linked_solutions?.length || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Submitted', ar: 'تاريخ التقديم' })}</p>
                <p className="text-sm font-bold text-amber-600 mt-1">
                  {application.created_date ? new Date(application.created_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : 'N/A'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'Quick Info', ar: 'معلومات سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Program', ar: 'البرنامج' })}</p>
              {program ? (
                <Link to={createPageUrl(`ProgramDetail?id=${program.id}`)} className="text-sm text-blue-600 hover:underline">
                  {program.name_en}
                </Link>
              ) : (
                <p className="text-sm">N/A</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Applicant', ar: 'المتقدم' })}</p>
              <p className="text-sm">{application.applicant_name || application.created_by}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Organization', ar: 'الجهة' })}</p>
              <p className="text-sm">{application.organization_name || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="details" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Details', ar: 'تفاصيل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Team', ar: 'فريق' })}</span>
              </TabsTrigger>
              <TabsTrigger value="work" className="flex flex-col gap-1 py-3">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Work', ar: 'عمل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="status" className="flex flex-col gap-1 py-3">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Status', ar: 'حالة' })}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Application Details', ar: 'تفاصيل الطلب' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      {t({ en: 'Motivation', ar: 'الدافع' })}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {application.motivation || 'No motivation statement provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      {t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {application.expected_outcomes || 'Not specified'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {application.team_members && application.team_members.length > 0 ? (
                    <div className="space-y-3">
                      {application.team_members.map((member, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-600">{member.role}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No team members listed</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Linked Work', ar: 'العمل المرتبط' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      {t({ en: 'Challenges', ar: 'التحديات' })} ({application.linked_challenges?.length || 0})
                    </p>
                    {application.linked_challenges && application.linked_challenges.length > 0 ? (
                      <div className="space-y-2">
                        {application.linked_challenges.map((challengeId, idx) => (
                          <Link
                            key={idx}
                            to={createPageUrl(`ChallengeDetail?id=${challengeId}`)}
                            className="block p-2 bg-slate-50 rounded text-sm text-blue-600 hover:bg-blue-50"
                          >
                            Challenge: {challengeId.substring(0, 20)}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No challenges linked</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      {t({ en: 'Solutions', ar: 'الحلول' })} ({application.linked_solutions?.length || 0})
                    </p>
                    {application.linked_solutions && application.linked_solutions.length > 0 ? (
                      <div className="space-y-2">
                        {application.linked_solutions.map((solutionId, idx) => (
                          <Link
                            key={idx}
                            to={createPageUrl(`SolutionDetail?id=${solutionId}`)}
                            className="block p-2 bg-slate-50 rounded text-sm text-blue-600 hover:bg-blue-50"
                          >
                            Solution: {solutionId.substring(0, 20)}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No solutions linked</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Application Status', ar: 'حالة الطلب' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg border-2 ${
                    application.status === 'accepted' ? 'bg-green-50 border-green-300' :
                    application.status === 'rejected' ? 'bg-red-50 border-red-300' :
                    application.status === 'shortlisted' ? 'bg-purple-50 border-purple-300' :
                    'bg-yellow-50 border-yellow-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      {application.status === 'accepted' ? (
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      ) : application.status === 'rejected' ? (
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      ) : (
                        <FileText className="h-8 w-8 text-yellow-600" />
                      )}
                      <div>
                        <p className="font-semibold text-lg capitalize">{application.status?.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {application.status === 'accepted' && 'Congratulations! Your application has been accepted.'}
                          {application.status === 'rejected' && 'Unfortunately, your application was not selected.'}
                          {application.status === 'under_review' && 'Your application is currently under review.'}
                          {application.status === 'shortlisted' && 'Your application has been shortlisted!'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ProtectedPage(ProgramApplicationDetail, { requiredPermissions: [] });