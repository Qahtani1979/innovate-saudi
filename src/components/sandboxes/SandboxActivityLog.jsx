
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, Shield, Edit, Clock, User, AlertCircle } from 'lucide-react';

import { supabase } from "@/integrations/supabase/client";

export default function SandboxActivityLog({ sandboxId }) {
  const { t, language } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['sandbox-activities', sandboxId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_activities')
        .select('*')
        .eq('entity_id', sandboxId)
        .eq('entity_type', 'Sandbox')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('System Activities fetch failed', error);
        return [];
      }
      return data;
    },
    enabled: !!sandboxId
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['sandbox-incidents', sandboxId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sandbox_incidents')
        .select('*')
        .eq('sandbox_id', sandboxId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Sandbox Incidents fetch failed', error);
        return [];
      }
      return data;
    },
    enabled: !!sandboxId
  });

  const allEvents = [
    ...activities.map(a => ({ ...a, type: 'activity' })),
    ...incidents.map(i => ({ ...i, type: 'incident', activity_description: `Incident: ${i.incident_type} - ${i.severity}` }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const activityIcons = {
    activity: Activity,
    incident: AlertCircle,
    approval: Shield,
    update: Edit
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t({ en: 'Activity & Incidents Log', ar: 'سجل النشاط والحوادث' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allEvents.map((event, idx) => {
            const Icon = activityIcons[event.type] || Activity;
            return (
              <div key={idx} className={`flex gap-3 p-3 rounded-lg border ${event.type === 'incident' ? 'bg-red-50 border-red-200' : 'bg-slate-50'
                }`}>
                <div className={`h-8 w-8 rounded-full ${event.type === 'incident' ? 'bg-red-100' : 'bg-blue-100'
                  } flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${event.type === 'incident' ? 'text-red-600' : 'text-blue-600'}`} />
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
                  <p className="text-sm text-slate-700">{event.activity_description}</p>
                  {event.activity_type && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {event.activity_type}
                    </Badge>
                  )}
                  {event.severity && (
                    <Badge className={`mt-2 text-xs ${event.severity === 'critical' ? 'bg-red-600' :
                      event.severity === 'high' ? 'bg-orange-600' :
                        'bg-yellow-600'
                      }`}>
                      {event.severity}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          {allEvents.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">
              {t({ en: 'No activity recorded', ar: 'لا يوجد نشاط مسجل' })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}