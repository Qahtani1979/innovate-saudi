import { useRDActivityLog } from '@/hooks/useRDData';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, FileText, CheckCircle2, User, TestTube, Shield, Lightbulb, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function RDProjectActivityLog({ rdProjectId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: activities = [] } = useRDActivityLog('rd_project', rdProjectId);

  const activityIcons = {
    created: FileText,
    updated: Activity,
    status_changed: CheckCircle2,
    milestone_completed: CheckCircle2,
    publication_added: FileText,
    pilot_created: TestTube,
    policy_generated: Shield,
    solution_commercialized: Lightbulb,
    trl_advanced: TrendingUp
  };

  const activityColors = {
    created: 'bg-blue-100 text-blue-700',
    updated: 'bg-slate-100 text-slate-700',
    status_changed: 'bg-green-100 text-green-700',
    milestone_completed: 'bg-purple-100 text-purple-700',
    publication_added: 'bg-indigo-100 text-indigo-700',
    pilot_created: 'bg-teal-100 text-teal-700',
    policy_generated: 'bg-pink-100 text-pink-700',
    solution_commercialized: 'bg-amber-100 text-amber-700',
    trl_advanced: 'bg-green-100 text-green-700'
  };

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {activities.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {t({ en: 'No activity yet', ar: 'لا يوجد نشاط بعد' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        activities.map((activity, idx) => {
          const Icon = activityIcons[activity.activity_type] || Activity;
          const colorClass = activityColors[activity.activity_type] || 'bg-slate-100 text-slate-700';

          return (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={colorClass}>
                        {activity.activity_type?.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-900">
                      {language === 'ar' && activity.description_ar ? activity.description_ar : activity.description_en}
                    </p>
                    {activity.performed_by && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                        <User className="h-3 w-3" />
                        <span>{activity.performed_by}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
