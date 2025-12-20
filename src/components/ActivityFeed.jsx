import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Activity, AlertCircle, TestTube, Lightbulb, Calendar, CheckCircle2, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function ActivityFeed({ limit = 10 }) {
  const { language, isRTL, t } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['system-activities', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      return data || [];
    }
  });

  const activityConfig = {
    challenge_created: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    challenge_approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    pilot_launched: { icon: TestTube, color: 'text-blue-600', bg: 'bg-blue-50' },
    pilot_completed: { icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
    solution_verified: { icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
    program_started: { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    partnership_formed: { icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t({ en: 'Platform Activity Stream', ar: 'تدفق نشاط المنصة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No recent activity', ar: 'لا يوجد نشاط حديث' })}
            </p>
          ) : (
            activities.map((activity) => {
              const config = activityConfig[activity.activity_type] || { icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' };
              const Icon = config.icon;

              return (
                <div key={activity.id} className={`p-3 ${config.bg} rounded-lg border border-slate-200`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 bg-white rounded-lg`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {language === 'ar' && activity.description_ar ? activity.description_ar : activity.description_en}
                      </p>
                      {activity.entity_code && (
                        <Badge variant="outline" className="mt-1 text-xs">{activity.entity_code}</Badge>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(activity.created_date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}