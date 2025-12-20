import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('program_applications')
        .select('*')
        .eq('program_id', programId)
        .eq('status', 'accepted');
      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();
      if (error) throw error;
      return data;
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

      const { error: programError } = await supabase
        .from('programs')
        .update({ events: updatedEvents })
        .eq('id', programId);
      if (programError) throw programError;

      // Update each participant's attendance percentage
      for (const app of applications) {
        const sessions = program.events.filter(e => e.attendance_recorded);
        const attended = sessions.filter(e => e.attendance[app.id]).length;
        const percentage = sessions.length > 0 ? (attended / sessions.length) * 100 : 0;

        await supabase
          .from('program_applications')
          .update({ attendance_percentage: Math.round(percentage) })
          .eq('id', app.id);
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