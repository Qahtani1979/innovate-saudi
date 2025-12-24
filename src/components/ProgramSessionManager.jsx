import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Calendar, Plus, Users, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { useProgramMutations } from '@/hooks/useProgramMutations';

export default function ProgramSessionManager({ program, onClose }) {
  const { t, isRTL } = useLanguage();

  const [sessions, setSessions] = useState(program?.curriculum || []);
  const [newSession, setNewSession] = useState({
    week: sessions.length + 1,
    topic: '',
    date: '',
    time: '',
    duration_minutes: 120,
    location: 'Virtual',
    meeting_link: '',
    facilitator: '',
    activities: [],
    resources: []
  });

  const { updateProgram, isUpdating } = useProgramMutations();

  const handleAddSession = async () => {
    const updatedCurriculum = [...sessions, newSession];
    try {
      await updateProgram({
        id: program.id,
        data: { curriculum: updatedCurriculum }
      });
      setSessions(updatedCurriculum);
      setNewSession({
        week: sessions.length + 2,
        topic: '',
        date: '',
        time: '',
        duration_minutes: 120,
        location: 'Virtual',
        meeting_link: '',
        facilitator: '',
        activities: [],
        resources: []
      });
    } catch (error) { }
  };

  const handleDeleteSession = async (index) => {
    const updated = sessions.filter((_, i) => i !== index);
    try {
      await updateProgram({
        id: program.id,
        data: { curriculum: updated }
      });
      setSessions(updated);
    } catch (error) { }
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          {t({ en: 'Session & Event Manager', ar: 'مدير الجلسات والفعاليات' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">{program?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">{sessions.length} sessions scheduled</p>
        </div>

        {/* Existing Sessions */}
        {sessions.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Scheduled Sessions', ar: 'الجلسات المجدولة' })}
            </p>
            {sessions.map((session, i) => (
              <div key={i} className="p-3 border rounded-lg bg-white flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">Week {session.week}</Badge>
                    {session.date && <Badge className="bg-blue-100 text-blue-700 text-xs">{session.date}</Badge>}
                  </div>
                  <p className="font-medium text-sm text-slate-900">{session.topic}</p>
                  {session.facilitator && (
                    <p className="text-xs text-slate-600 mt-1">
                      <Users className="h-3 w-3 inline mr-1" />
                      {session.facilitator}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteSession(i)}>
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Session */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900">
            {t({ en: 'Add New Session', ar: 'إضافة جلسة جديدة' })}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Week #', ar: 'الأسبوع #' })}
              </label>
              <Input
                type="number"
                value={newSession.week}
                onChange={(e) => setNewSession({ ...newSession, week: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Date', ar: 'التاريخ' })}
              </label>
              <Input
                type="date"
                value={newSession.date}
                onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Session Topic', ar: 'موضوع الجلسة' })}
            </label>
            <Input
              placeholder={t({ en: 'e.g., Introduction to Municipal Innovation', ar: 'مثل: مقدمة للابتكار البلدي' })}
              value={newSession.topic}
              onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Time', ar: 'الوقت' })}
              </label>
              <Input
                type="time"
                value={newSession.time}
                onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Duration (min)', ar: 'المدة (دقيقة)' })}
              </label>
              <Input
                type="number"
                value={newSession.duration_minutes}
                onChange={(e) => setNewSession({ ...newSession, duration_minutes: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Facilitator', ar: 'الميسر' })}
            </label>
            <Input
              placeholder={t({ en: 'Facilitator name', ar: 'اسم الميسر' })}
              value={newSession.facilitator}
              onChange={(e) => setNewSession({ ...newSession, facilitator: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Location / Meeting Link', ar: 'الموقع / رابط الاجتماع' })}
            </label>
            <Input
              placeholder="Zoom/Teams link or physical location"
              value={newSession.meeting_link}
              onChange={(e) => setNewSession({ ...newSession, meeting_link: e.target.value })}
            />
          </div>

          <Button
            onClick={handleAddSession}
            disabled={!newSession.topic || isUpdating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Add Session', ar: 'إضافة جلسة' })}
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