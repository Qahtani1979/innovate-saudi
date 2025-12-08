import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Users, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceTracker({ programId, sessionId }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: applications = [] } = useQuery({
    queryKey: ['program-participants', programId],
    queryFn: async () => {
      const all = await base44.entities.ProgramApplication.list();
      return all.filter(a => a.program_id === programId && a.status === 'accepted');
    },
    enabled: !!programId
  });

  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const programs = await base44.entities.Program.list();
      return programs.find(p => p.id === programId);
    },
    enabled: !!programId
  });

  const session = program?.events?.find(e => e.id === sessionId);
  const [attendance, setAttendance] = useState(session?.attendance || {});

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updatedEvents = program.events.map(e => 
        e.id === sessionId ? { ...e, attendance, attendance_recorded: true } : e
      );

      await base44.entities.Program.update(programId, {
        events: updatedEvents
      });

      // Update each participant's attendance percentage
      for (const app of applications) {
        const sessions = program.events.filter(e => e.attendance_recorded);
        const attended = sessions.filter(e => e.attendance[app.id]).length;
        const percentage = sessions.length > 0 ? (attended / sessions.length) * 100 : 0;

        await base44.entities.ProgramApplication.update(app.id, {
          attendance_percentage: Math.round(percentage)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['program', programId]);
      queryClient.invalidateQueries(['program-participants']);
      toast.success(t({ en: 'Attendance saved', ar: 'تم حفظ الحضور' }));
    }
  });

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
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
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
                onCheckedChange={(checked) => setAttendance({...attendance, [app.id]: checked})}
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