import { useMentorships } from '@/hooks/useMentorships';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Target, Calendar, CheckCircle2, Star, Users } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MenteeProgress() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { data: myMentorships = [], isLoading } = useMentorships({
    menteeEmail: user?.email
  });

  const activeMentorship = myMentorships.find(m => m.status === 'active');

  const stats = {
    total_mentorships: myMentorships.length,
    active: myMentorships.filter(m => m.status === 'active').length,
    completed: myMentorships.filter(m => m.status === 'completed').length,
    total_sessions: myMentorships.reduce((sum, m) => sum + (m.sessions_completed || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'My Mentee Progress', ar: 'تقدمي كمتدرب' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Track my mentorship journey and goals', ar: 'تتبع رحلتي الإرشادية وأهدافي' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.completed}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total_sessions}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Sessions', ar: 'إجمالي الجلسات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total_mentorships}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
          </CardContent>
        </Card>
      </div>

      {activeMentorship && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle>{t({ en: 'Current Mentorship', ar: 'الإرشاد الحالي' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Mentor:', ar: 'المرشد:' })}</p>
                  <p className="font-semibold text-slate-900">{activeMentorship.mentor_email}</p>
                </div>
                <Badge className="bg-green-600">{activeMentorship.status}</Badge>
              </div>

              {activeMentorship.focus_areas && activeMentorship.focus_areas.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">{t({ en: 'Focus Areas:', ar: 'مجالات التركيز:' })}</p>
                  <div className="flex flex-wrap gap-2">
                    {activeMentorship.focus_areas.map((area, i) => (
                      <Badge key={i} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-slate-600">{t({ en: 'Session Progress', ar: 'تقدم الجلسات' })}</span>
                  <span className="font-medium">{activeMentorship.sessions_completed || 0} / {activeMentorship.sessions_planned || 0}</span>
                </div>
                <Progress
                  value={activeMentorship.sessions_planned > 0
                    ? (activeMentorship.sessions_completed / activeMentorship.sessions_planned) * 100
                    : 0
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Mentorship History', ar: 'سجل الإرشاد' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myMentorships.map(mentorship => (
              <div key={mentorship.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{mentorship.mentor_email}</p>
                    <p className="text-xs text-slate-500">{mentorship.program_id}</p>
                  </div>
                  <Badge className={mentorship.status === 'completed' ? 'bg-purple-200 text-purple-700' : 'bg-green-200 text-green-700'}>
                    {mentorship.status}
                  </Badge>
                </div>
                {mentorship.mentee_satisfaction_score && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{mentorship.mentee_satisfaction_score.toFixed(1)}</span>
                    <span className="text-slate-500">{t({ en: 'rating', ar: 'تقييم' })}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MenteeProgress, { requiredPermissions: [] });
