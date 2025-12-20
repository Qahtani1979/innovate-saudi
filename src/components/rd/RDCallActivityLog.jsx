import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, MessageSquare, Clock, User } from 'lucide-react';

export default function RDCallActivityLog({ rdCallId }) {
  const { t, language, isRTL } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['rd-call-activities', rdCallId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_activities')
        .select('*')
        .eq('entity_id', rdCallId)
        .eq('entity_type', 'RDCall')
        .order('created_date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['rd-call-comments', rdCallId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_call_comments')
        .select('*')
        .eq('rd_call_id', rdCallId)
        .order('created_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const allEvents = [
    ...activities.map(a => ({ ...a, type: 'activity' })),
    ...comments.map(c => ({ ...c, type: 'comment' }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t({ en: 'Activity Log', ar: 'سجل النشاط' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allEvents.map((event, idx) => (
            <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg border">
              <div className={`h-8 w-8 rounded-full ${event.type === 'comment' ? 'bg-purple-100' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0`}>
                {event.type === 'comment' ? (
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                ) : (
                  <Activity className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3 w-3 text-slate-500" />
                  <span className="text-sm font-medium">{event.created_by}</span>
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    {new Date(event.created_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {event.type === 'comment' ? event.comment_text : event.activity_description}
                </p>
                {event.activity_type && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {event.activity_type}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {allEvents.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">
              {t({ en: 'No activity yet', ar: 'لا يوجد نشاط بعد' })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}