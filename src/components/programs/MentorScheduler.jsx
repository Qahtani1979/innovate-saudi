import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Calendar, Users, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorScheduler({ programId, mentorEmail }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [meeting, setMeeting] = useState({
    mentee_id: '',
    date: '',
    time: '',
    duration_minutes: 60,
    agenda: '',
    location: 'virtual'
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['mentor-mentees', programId, mentorEmail],
    queryFn: async () => {
      const assignments = await base44.entities.ExpertAssignment.list();
      const mentorAssignments = assignments.filter(a => 
        a.entity_type === 'program' && 
        a.entity_id === programId && 
        a.expert_email === mentorEmail &&
        a.assignment_type === 'mentor'
      );

      if (mentorAssignments.length === 0) return [];

      const all = await base44.entities.ProgramApplication.list();
      return all.filter(app => app.program_id === programId && app.status === 'accepted');
    },
    enabled: !!programId && !!mentorEmail
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['mentor-meetings', programId, mentorEmail],
    queryFn: async () => {
      const mentorships = await base44.entities.ProgramMentorship.list();
      return mentorships.filter(m => 
        m.program_id === programId && 
        m.mentor_email === mentorEmail
      );
    },
    enabled: !!programId && !!mentorEmail
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data) => {
      const mentee = applications.find(a => a.id === data.mentee_id);
      
      await base44.entities.ProgramMentorship.create({
        program_id: programId,
        mentor_email: mentorEmail,
        mentee_email: mentee.applicant_email,
        mentee_name: mentee.applicant_name,
        session_date: data.date,
        session_time: data.time,
        duration_minutes: data.duration_minutes,
        agenda: data.agenda,
        location: data.location,
        status: 'scheduled'
      });

      await base44.integrations.Core.SendEmail({
        to: mentee.applicant_email,
        subject: `Mentorship Session Scheduled`,
        body: `Your mentorship session has been scheduled:

Date: ${data.date}
Time: ${data.time}
Duration: ${data.duration_minutes} minutes
Location: ${data.location}

Agenda: ${data.agenda}

Looking forward to meeting you!`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentor-meetings']);
      setShowForm(false);
      setMeeting({ mentee_id: '', date: '', time: '', duration_minutes: 60, agenda: '', location: 'virtual' });
      toast.success(t({ en: 'Meeting scheduled', ar: 'تم جدولة الاجتماع' }));
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            {t({ en: 'Mentorship Sessions', ar: 'جلسات الإرشاد' })}
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Schedule', ar: 'جدولة' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
            <Select value={meeting.mentee_id} onValueChange={(v) => setMeeting({...meeting, mentee_id: v})}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select mentee', ar: 'اختر متدرب' })} />
              </SelectTrigger>
              <SelectContent>
                {applications.map(app => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.applicant_org_name || app.applicant_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={meeting.date}
                onChange={(e) => setMeeting({...meeting, date: e.target.value})}
              />
              <Input
                type="time"
                value={meeting.time}
                onChange={(e) => setMeeting({...meeting, time: e.target.value})}
              />
            </div>

            <Textarea
              placeholder={t({ en: 'Meeting agenda', ar: 'جدول أعمال الاجتماع' })}
              value={meeting.agenda}
              onChange={(e) => setMeeting({...meeting, agenda: e.target.value})}
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => scheduleMutation.mutate(meeting)}
                disabled={!meeting.mentee_id || !meeting.date || scheduleMutation.isPending}
              >
                {t({ en: 'Schedule', ar: 'جدولة' })}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {meetings.map((m) => (
            <div key={m.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{m.mentee_name}</p>
                <Badge className={
                  m.status === 'completed' ? 'bg-green-100 text-green-700' :
                  m.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }>
                  {m.status}
                </Badge>
              </div>
              <div className="flex gap-3 text-xs text-slate-600">
                <span><Calendar className="h-3 w-3 inline mr-1" />{m.session_date}</span>
                <span><Clock className="h-3 w-3 inline mr-1" />{m.session_time}</span>
              </div>
              {m.agenda && <p className="text-xs text-slate-600 mt-2">{m.agenda}</p>}
            </div>
          ))}

          {meetings.length === 0 && !showForm && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">{t({ en: 'No sessions scheduled', ar: 'لا جلسات مجدولة' })}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}