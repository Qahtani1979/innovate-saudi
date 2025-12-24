import { useChallengeActivities } from '@/hooks/useChallengeActivities';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, FileText, TrendingUp, MessageSquare, Lightbulb,
  TestTube, CheckCircle2, Archive, Users, Target, Clock
} from 'lucide-react';

export default function ChallengeActivityLog({ challengeId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: activities = [] } = useChallengeActivities({
    challengeId,
    limit: 50
  });

  const activityIcons = {
    created: FileText,
    updated: Activity,
    status_changed: TrendingUp,
    comment_added: MessageSquare,
    solution_matched: Lightbulb,
    pilot_created: TestTube,
    approved: CheckCircle2,
    archived: Archive,
    shared: Users,
    viewed: Target
  };

  const activityColors = {
    created: 'border-blue-500',
    updated: 'border-purple-500',
    status_changed: 'border-green-500',
    comment_added: 'border-yellow-500',
    solution_matched: 'border-orange-500',
    pilot_created: 'border-teal-500',
    approved: 'border-green-600',
    archived: 'border-slate-500',
    shared: 'border-pink-500',
    viewed: 'border-gray-400'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          {t({ en: 'Activity Timeline', ar: 'الجدول الزمني للنشاط' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="relative">
            <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-0 bottom-0 w-0.5 bg-slate-200`} />
            <div className="space-y-6">
              {activities.map((activity) => {
                const ActivityIcon = activityIcons[activity.activity_type] || Activity;
                const borderColor = activityColors[activity.activity_type] || 'border-slate-500';

                return (
                  <div key={activity.id} className={`relative flex gap-4 ${isRTL ? 'pr-10' : 'pl-10'}`}>
                    <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} w-8 h-8 rounded-full bg-white border-2 ${borderColor} flex items-center justify-center`}>
                      <ActivityIcon className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 capitalize">
                            {activity.activity_type?.replace(/_/g, ' ')}
                          </p>
                          {activity.activity_category && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.activity_category}
                            </Badge>
                          )}
                          {activity.is_system_generated && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(activity.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-slate-700 mb-2">{activity.description}</p>
                      )}

                      {activity.performed_by && !activity.is_system_generated && (
                        <p className="text-xs text-slate-500">
                          {t({ en: 'by', ar: 'بواسطة' })} {activity.performed_by}
                        </p>
                      )}

                      {(activity.old_value || activity.new_value) && (
                        <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                          {activity.old_value && (
                            <div className="mb-1">
                              <span className="text-red-600 font-medium">{t({ en: 'From:', ar: 'من:' })}</span>{' '}
                              <span className="text-slate-700">{activity.old_value}</span>
                            </div>
                          )}
                          {activity.new_value && (
                            <div>
                              <span className="text-green-600 font-medium">{t({ en: 'To:', ar: 'إلى:' })}</span>{' '}
                              <span className="text-slate-700">{activity.new_value}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs font-medium text-blue-900 mb-1">
                            {t({ en: 'Details:', ar: 'التفاصيل:' })}
                          </p>
                          <div className="text-xs text-slate-700 space-y-1">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {t({ en: 'No activity recorded yet', ar: 'لا يوجد نشاط مسجل' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}