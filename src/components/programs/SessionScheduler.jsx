import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Calendar as CalendarIcon, Plus, MapPin, User, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function SessionScheduler({ programId }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newSession, setNewSession] = useState({
    title: '',
    date: '',
    time: '',
    speaker: '',
    location: 'virtual',
    description: ''
  });

  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data } = await supabase.from('programs').select('*').eq('id', programId).eq('is_deleted', false).maybeSingle();
      return data;
    },
    enabled: !!programId
  });

  const sessions = program?.events || [];

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      const { error } = await supabase.from('programs').update({
        events: [...sessions, {
          ...sessionData,
          status: 'scheduled',
          created_date: new Date().toISOString()
        }]
      }).eq('id', programId);
      if (error) throw error;

      await supabase.from('system_activities').insert({
        entity_type: 'program',
        entity_id: programId,
        activity_type: 'session_scheduled',
        performed_by: user?.email,
        timestamp: new Date().toISOString(),
        metadata: { session_title: sessionData.title, session_date: sessionData.date }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['program', programId]);
      setShowForm(false);
      setNewSession({ title: '', date: '', time: '', speaker: '', location: 'virtual', description: '' });
      toast.success(t({ en: 'Session scheduled', ar: 'تم جدولة الجلسة' }));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            {t({ en: 'Session Scheduler', ar: 'جدولة الجلسات' })}
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Add Session', ar: 'إضافة جلسة' })}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
            <Input 
              placeholder={t({ en: 'Session title', ar: 'عنوان الجلسة' })} 
              value={newSession.title}
              onChange={(e) => setNewSession({...newSession, title: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input 
                type="date" 
                value={newSession.date}
                onChange={(e) => setNewSession({...newSession, date: e.target.value})}
              />
              <Input 
                type="time" 
                value={newSession.time}
                onChange={(e) => setNewSession({...newSession, time: e.target.value})}
              />
            </div>
            <Input 
              placeholder={t({ en: 'Speaker name', ar: 'اسم المتحدث' })} 
              value={newSession.speaker}
              onChange={(e) => setNewSession({...newSession, speaker: e.target.value})}
            />
            <Select value={newSession.location} onValueChange={(v) => setNewSession({...newSession, location: v})}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Location', ar: 'الموقع' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="hub">Innovation Hub</SelectItem>
                <SelectItem value="gdisb">GDISB HQ</SelectItem>
              </SelectContent>
            </Select>
            <Textarea 
              placeholder={t({ en: 'Session description', ar: 'وصف الجلسة' })} 
              rows={2} 
              value={newSession.description}
              onChange={(e) => setNewSession({...newSession, description: e.target.value})}
            />
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => createSessionMutation.mutate(newSession)}
                disabled={!newSession.title || !newSession.date || createSessionMutation.isPending}
              >
                {t({ en: 'Save', ar: 'حفظ' })}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>{t({ en: 'Cancel', ar: 'إلغاء' })}</Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="p-3 border rounded-lg hover:bg-slate-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{session.title}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <CalendarIcon className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {session.date}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {session.time}
                    </Badge>
                    {session.speaker && (
                      <Badge variant="outline" className="text-xs">
                        <User className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {session.speaker}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      <MapPin className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {session.location}
                    </Badge>
                  </div>
                </div>
                <Badge className={session.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {session.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}