import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Calendar, Plus, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LivingLabEventManager({ lab, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const [events, setEvents] = useState(lab?.events || []);
  const [newEvent, setNewEvent] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    event_type: 'workshop',
    date: '',
    time: '',
    duration_hours: 3,
    location: lab?.location || '',
    capacity: 30,
    registration_url: '',
    speaker: '',
    topics: []
  });

  const addEventMutation = useMutation({
    mutationFn: async () => {
      const updatedEvents = [...events, {
        ...newEvent,
        created_date: new Date().toISOString()
      }];
      await base44.entities.LivingLab.update(lab.id, {
        events: updatedEvents
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['living-lab']);
      toast.success(t({ en: 'Event added', ar: 'تمت إضافة الفعالية' }));
      setEvents([...events, newEvent]);
      setNewEvent({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        event_type: 'workshop',
        date: '',
        time: '',
        duration_hours: 3,
        location: lab?.location || '',
        capacity: 30,
        registration_url: '',
        speaker: '',
        topics: []
      });
    }
  });

  const deleteEvent = async (index) => {
    const updated = events.filter((_, i) => i !== index);
    await base44.entities.LivingLab.update(lab.id, { events: updated });
    setEvents(updated);
    queryClient.invalidateQueries(['living-lab']);
    toast.success(t({ en: 'Event removed', ar: 'تم إزالة الفعالية' }));
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-600" />
          {t({ en: 'Event Manager', ar: 'مدير الفعاليات' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <p className="text-sm font-medium text-teal-900">{lab?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">{events.length} events scheduled</p>
        </div>

        {/* Existing Events */}
        {events.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Scheduled Events', ar: 'الفعاليات المجدولة' })}
            </p>
            {events.map((event, i) => (
              <div key={i} className="p-3 border rounded-lg bg-white flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs capitalize">{event.event_type}</Badge>
                    {event.date && <Badge className="bg-teal-100 text-teal-700 text-xs">{event.date}</Badge>}
                  </div>
                  <p className="font-medium text-sm text-slate-900">{event.name_en}</p>
                  {event.speaker && (
                    <p className="text-xs text-slate-600 mt-1">Speaker: {event.speaker}</p>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteEvent(i)}>
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Event */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900">
            {t({ en: 'Add New Event', ar: 'إضافة فعالية جديدة' })}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Event Name (EN)', ar: 'اسم الفعالية (EN)' })}
              </label>
              <Input
                value={newEvent.name_en}
                onChange={(e) => setNewEvent({ ...newEvent, name_en: e.target.value })}
                placeholder="e.g., IoT Workshop"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Event Name (AR)', ar: 'اسم الفعالية (AR)' })}
              </label>
              <Input
                value={newEvent.name_ar}
                onChange={(e) => setNewEvent({ ...newEvent, name_ar: e.target.value })}
                placeholder="ورشة إنترنت الأشياء"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Event Type', ar: 'نوع الفعالية' })}
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={newEvent.event_type}
              onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
            >
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="training">Training</option>
              <option value="demo">Demo Day</option>
              <option value="networking">Networking</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Date', ar: 'التاريخ' })}
              </label>
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Time', ar: 'الوقت' })}
              </label>
              <Input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Duration (hrs)', ar: 'المدة (ساعات)' })}
              </label>
              <Input
                type="number"
                value={newEvent.duration_hours}
                onChange={(e) => setNewEvent({ ...newEvent, duration_hours: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Speaker/Facilitator', ar: 'المتحدث/الميسر' })}
            </label>
            <Input
              value={newEvent.speaker}
              onChange={(e) => setNewEvent({ ...newEvent, speaker: e.target.value })}
            />
          </div>

          <Button
            onClick={() => addEventMutation.mutate()}
            disabled={!newEvent.name_en || !newEvent.date || addEventMutation.isPending}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Event', ar: 'إضافة فعالية' })}
          </Button>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onClose} className="flex-1">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Done', ar: 'تم' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}