import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Calendar, Mail, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function CommitteeMeetingScheduler({ rdCall, proposals, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { triggerEmail } = useEmailTrigger();

  const [meetingData, setMeetingData] = useState({
    title: `${rdCall?.code} - Final Evaluation Committee Meeting`,
    date: '',
    time: '',
    duration_minutes: 120,
    location: 'Virtual Meeting',
    meeting_link: '',
    agenda: `1. Review scoring results for ${proposals?.length || 0} proposals
2. Discuss borderline cases
3. Final award decisions
4. Budget allocation
5. Next steps`,
    attendees: [],
    notes: ''
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data) => {
      // Create calendar event (stored as task for now, can be enhanced with calendar integration)
      await base44.entities.Task.create({
        title: data.title,
        description: `${data.agenda}\n\nLocation: ${data.location}\nLink: ${data.meeting_link || 'N/A'}\n\nAttendees: ${data.attendees.join(', ')}`,
        due_date: data.date,
        status: 'todo',
        priority: 'high',
        tags: ['committee_meeting', 'rd_evaluation', rdCall.code]
      });

      // Update RD Call with meeting details
      await base44.entities.RDCall.update(rdCall.id, {
        evaluation_meeting_scheduled: true,
        evaluation_meeting_date: data.date,
        evaluation_meeting_link: data.meeting_link
      });

      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries(['rd-call']);
      queryClient.invalidateQueries(['tasks']);
      
      // Send email notifications to attendees using triggerEmail
      for (const attendee of data.attendees) {
        try {
          await triggerEmail('event.invitation', {
            entityType: 'rd_call',
            entityId: rdCall.id,
            recipientEmail: attendee,
            variables: {
              meetingTitle: data.title,
              meetingDate: data.date,
              meetingTime: data.time,
              durationMinutes: data.duration_minutes,
              location: data.location,
              meetingLink: data.meeting_link || 'To be provided',
              agenda: data.agenda
            }
          });
        } catch (error) {
          console.error('Failed to send meeting invitation to:', attendee, error);
        }
      }
      
      toast.success(t({ en: 'Meeting scheduled and invitations sent', ar: 'تم جدولة الاجتماع وإرسال الدعوات' }));
      onClose();
    }
  });

  const handleAddAttendee = (email) => {
    if (email && !meetingData.attendees.includes(email)) {
      setMeetingData({ ...meetingData, attendees: [...meetingData.attendees, email] });
    }
  };

  const handleRemoveAttendee = (email) => {
    setMeetingData({
      ...meetingData,
      attendees: meetingData.attendees.filter(a => a !== email)
    });
  };

  const handleSubmit = () => {
    if (!meetingData.date || !meetingData.time) {
      toast.error(t({ en: 'Please set date and time', ar: 'يرجى تحديد التاريخ والوقت' }));
      return;
    }
    if (meetingData.attendees.length === 0) {
      toast.error(t({ en: 'Please add at least one attendee', ar: 'يرجى إضافة حضور واحد على الأقل' }));
      return;
    }
    createMeetingMutation.mutate(meetingData);
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          {t({ en: 'Schedule Committee Meeting', ar: 'جدولة اجتماع اللجنة' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">{rdCall?.title_en}</p>
          <p className="text-xs text-slate-600 mt-1">
            {proposals?.length || 0} {t({ en: 'proposals under review', ar: 'مقترحات تحت المراجعة' })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              {t({ en: 'Date', ar: 'التاريخ' })}
            </label>
            <Input
              type="date"
              value={meetingData.date}
              onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              {t({ en: 'Time', ar: 'الوقت' })}
            </label>
            <Input
              type="time"
              value={meetingData.time}
              onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Duration (minutes)', ar: 'المدة (دقائق)' })}
          </label>
          <Input
            type="number"
            value={meetingData.duration_minutes}
            onChange={(e) => setMeetingData({ ...meetingData, duration_minutes: parseInt(e.target.value) })}
            min={30}
            step={15}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Location / Meeting Link', ar: 'الموقع / رابط الاجتماع' })}
          </label>
          <Input
            placeholder={t({ en: 'Zoom/Teams link or physical location', ar: 'رابط زوم/تيمز أو موقع فعلي' })}
            value={meetingData.meeting_link}
            onChange={(e) => setMeetingData({ ...meetingData, meeting_link: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Agenda', ar: 'جدول الأعمال' })}
          </label>
          <Textarea
            value={meetingData.agenda}
            onChange={(e) => setMeetingData({ ...meetingData, agenda: e.target.value })}
            rows={6}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Committee Members', ar: 'أعضاء اللجنة' })}
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              type="email"
              placeholder={t({ en: 'Enter email address', ar: 'أدخل البريد الإلكتروني' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddAttendee(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <Button
              variant="outline"
              onClick={(e) => {
                const input = e.target.closest('div').querySelector('input');
                handleAddAttendee(input.value);
                input.value = '';
              }}
            >
              {t({ en: 'Add', ar: 'إضافة' })}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {meetingData.attendees.map((email, i) => (
              <Badge key={i} className="bg-blue-100 text-blue-700 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {email}
                <button onClick={() => handleRemoveAttendee(email)} className="ml-1 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={createMeetingMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {createMeetingMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Schedule & Send Invites', ar: 'جدولة وإرسال الدعوات' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}