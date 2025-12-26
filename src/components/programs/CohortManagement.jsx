import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Users, FileText } from 'lucide-react';
import { useProgramApplications } from '@/hooks/useProgramDetails';

export default function CohortManagement({ program, cohort }) {
  const { language, isRTL, t } = useLanguage();

  const { data: applications = [] } = useProgramApplications(program?.id);
  const acceptedApplications = applications.filter(app => app.status === 'accepted');

  const participants = acceptedApplications.map(app => ({
    id: app.id,
    name: app.applicant_org_name || app.applicant_name,
    email: app.applicant_email,
    progress: app.progress_percentage || 0,
    attendance: app.attendance_percentage || 0,
    deliverables: app.deliverables_submitted || 0,
    status: app.participant_status || 'on_track'
  }));

  const cohortStats = {
    totalParticipants: participants.length,
    avgProgress: Math.round(participants.reduce((sum, p) => sum + p.progress, 0) / participants.length),
    avgAttendance: Math.round(participants.reduce((sum, p) => sum + p.attendance, 0) / participants.length),
    onTrack: participants.filter(p => p.status === 'on_track' || p.status === 'excellent').length
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          {t({ en: 'Cohort Management', ar: 'إدارة المجموعة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{cohortStats.totalParticipants}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Participants', ar: 'المشاركون' })}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{cohortStats.avgProgress}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Progress', ar: 'متوسط التقدم' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{cohortStats.avgAttendance}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Attendance', ar: 'الحضور' })}</p>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-teal-600">{cohortStats.onTrack}</p>
            <p className="text-xs text-slate-600">{t({ en: 'On Track', ar: 'على المسار' })}</p>
          </div>
        </div>

        {/* Participants List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{t({ en: 'Participants', ar: 'المشاركون' })}</h4>
          {participants.map(participant => (
            <div key={participant.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">{participant.name}</p>
                  <Badge className={
                    participant.status === 'excellent' ? 'bg-green-100 text-green-700' :
                      participant.status === 'on_track' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                  }>
                    {participant.status.replace('_', ' ')}
                  </Badge>
                </div>
                <Button size="sm" variant="outline">{t({ en: 'View Details', ar: 'عرض التفاصيل' })}</Button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 mb-1">{t({ en: 'Progress', ar: 'التقدم' })}</p>
                  <Progress value={participant.progress} className="h-2" />
                  <p className="text-slate-700 font-medium mt-1">{participant.progress}%</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">{t({ en: 'Attendance', ar: 'الحضور' })}</p>
                  <Progress value={participant.attendance} className="h-2" />
                  <p className="text-slate-700 font-medium mt-1">{participant.attendance}%</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">{t({ en: 'Deliverables', ar: 'المخرجات' })}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-slate-700 font-medium">{participant.deliverables}/10</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}