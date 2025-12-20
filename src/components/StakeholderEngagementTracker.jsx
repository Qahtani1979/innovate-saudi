import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from './LanguageContext';
import { Users, Calendar, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function StakeholderEngagementTracker({ pilot }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    stakeholder_name: '',
    event_type: 'meeting',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    attendees: 1
  });

  const stakeholders = pilot.stakeholders || [];

  // Calculate engagement scores
  const calculateEngagementScore = (stakeholder) => {
    // Simple scoring based on number of interactions
    const events = stakeholder.engagement_events || [];
    if (events.length === 0) return 0;
    if (events.length >= 5) return 10;
    return events.length * 2;
  };

  const stakeholdersWithScores = stakeholders.map(s => ({
    ...s,
    engagement_score: s.engagement_score || calculateEngagementScore(s),
    engagement_events: s.engagement_events || []
  }));

  const avgEngagement = stakeholdersWithScores.length > 0
    ? Math.round(stakeholdersWithScores.reduce((acc, s) => acc + s.engagement_score, 0) / stakeholdersWithScores.length)
    : 0;

  const addEventMutation = useMutation({
    mutationFn: async () => {
      // Update pilot with new engagement event
      const updatedStakeholders = pilot.stakeholders.map(s => {
        if (s.name === newEvent.stakeholder_name) {
          return {
            ...s,
            engagement_events: [
              ...(s.engagement_events || []),
              {
                type: newEvent.event_type,
                date: newEvent.date,
                notes: newEvent.notes,
                attendees: newEvent.attendees
              }
            ]
          };
        }
        return s;
      });

      await base44.entities.Pilot.update(pilot.id, {
        stakeholders: updatedStakeholders
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pilot']);
      setShowAddEvent(false);
      setNewEvent({
        stakeholder_name: '',
        event_type: 'meeting',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        attendees: 1
      });
      toast.success(t({ en: 'Engagement event logged', ar: 'تم تسجيل حدث المشاركة' }));
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t({ en: 'Stakeholder Engagement Tracker', ar: 'متتبع إشراك الأطراف' })}
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-slate-600">{t({ en: 'Avg Engagement', ar: 'متوسط الإشراك' })}</p>
              <p className="text-2xl font-bold text-purple-600">{avgEngagement}/10</p>
            </div>
            <Button onClick={() => setShowAddEvent(!showAddEvent)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Log Event', ar: 'تسجيل حدث' })}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Event Form */}
        {showAddEvent && (
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 space-y-3">
            <Select value={newEvent.stakeholder_name} onValueChange={(v) => setNewEvent({...newEvent, stakeholder_name: v})}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select Stakeholder', ar: 'اختر الطرف' })} />
              </SelectTrigger>
              <SelectContent>
                {stakeholders.map((s, i) => (
                  <SelectItem key={i} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={newEvent.event_type} onValueChange={(v) => setNewEvent({...newEvent, event_type: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">{t({ en: 'Meeting', ar: 'اجتماع' })}</SelectItem>
                <SelectItem value="survey">{t({ en: 'Survey', ar: 'استطلاع' })}</SelectItem>
                <SelectItem value="workshop">{t({ en: 'Workshop', ar: 'ورشة عمل' })}</SelectItem>
                <SelectItem value="feedback_session">{t({ en: 'Feedback Session', ar: 'جلسة ملاحظات' })}</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
            />

            <Textarea
              placeholder={t({ en: 'Notes...', ar: 'ملاحظات...' })}
              value={newEvent.notes}
              onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
              rows={2}
            />

            <div className="flex gap-2">
              <Button onClick={() => addEventMutation.mutate()} disabled={!newEvent.stakeholder_name} className="bg-purple-600">
                {t({ en: 'Save Event', ar: 'حفظ الحدث' })}
              </Button>
              <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </div>
        )}

        {/* Stakeholder List */}
        <div className="space-y-3">
          {stakeholdersWithScores.map((stakeholder, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg border">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{stakeholder.name}</h4>
                  <p className="text-sm text-slate-600">{stakeholder.role}</p>
                </div>
                <Badge className={
                  stakeholder.engagement_score >= 7 ? 'bg-green-600' :
                  stakeholder.engagement_score >= 4 ? 'bg-yellow-600' :
                  'bg-red-600'
                }>
                  {stakeholder.engagement_score}/10
                </Badge>
              </div>

              {stakeholder.involvement && (
                <p className="text-sm text-slate-700 mb-2">{stakeholder.involvement}</p>
              )}

              {/* Engagement Events */}
              {stakeholder.engagement_events && stakeholder.engagement_events.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-600">
                    {t({ en: 'Engagement History:', ar: 'سجل المشاركة:' })}
                  </p>
                  {stakeholder.engagement_events.slice(0, 3).map((event, ei) => (
                    <div key={ei} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                      {event.type === 'meeting' && <Calendar className="h-3 w-3" />}
                      {event.type === 'survey' && <FileText className="h-3 w-3" />}
                      <span className="capitalize">{event.type}</span>
                      <span>•</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      {event.notes && <span>• {event.notes.substring(0, 50)}</span>}
                    </div>
                  ))}
                  {stakeholder.engagement_events.length > 3 && (
                    <p className="text-xs text-blue-600">
                      +{stakeholder.engagement_events.length - 3} {t({ en: 'more events', ar: 'حدث آخر' })}
                    </p>
                  )}
                </div>
              )}

              {/* Low Engagement Alert */}
              {stakeholder.engagement_score < 4 && (
                <div className="mt-3 p-2 bg-red-50 rounded border border-red-200 text-xs text-red-700">
                  ⚠️ {t({ en: 'Low engagement - recommend outreach', ar: 'إشراك منخفض - يوصى بالتواصل' })}
                </div>
              )}
            </div>
          ))}
        </div>

        {stakeholders.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {t({ en: 'No stakeholders defined yet', ar: 'لم يتم تعريف أطراف بعد' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}