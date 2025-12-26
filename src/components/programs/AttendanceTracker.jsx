import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Users, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { useProgramAttendance } from '@/hooks/useProgramAttendance';

export default function AttendanceTracker({ programId, sessionId }) {
  const { t } = useLanguage();
  const { program, participants: applications, updateAttendance } = useProgramAttendance(programId, sessionId);
  const [attendance, setAttendance] = useState({});

  const session = program?.events?.find(e => e.id === sessionId);

  useEffect(() => {
    if (session?.attendance) {
      setAttendance(session.attendance);
    }
  }, [session]);

  const handleSave = () => {
    updateAttendance.mutate({ attendance });
  };

  const presentCount = Object.values(attendance).filter(v => v).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            {t({ en: 'Session Attendance', ar: 'حضور الجلسة' })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700">
              {presentCount}/{applications.length} {t({ en: 'present', ar: 'حاضر' })}
            </Badge>
            <Button size="sm" onClick={handleSave} disabled={updateAttendance.isPending}>
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {session && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="font-semibold text-sm">{session.title}</p>
            <p className="text-xs text-slate-600">
              <Calendar className="h-3 w-3 inline mr-1" />
              {session.date} • {session.time}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50">
              <Checkbox
                checked={attendance[app.id] || false}
                onCheckedChange={(checked) => setAttendance({ ...attendance, [app.id]: checked })}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{app.applicant_org_name || app.applicant_name}</p>
                <p className="text-xs text-slate-500">{app.applicant_email}</p>
              </div>
              {attendance[app.id] ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-slate-300" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}