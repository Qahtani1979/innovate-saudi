import { useVersionHistory } from '@/hooks/useVersionHistory';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { History, User, FileText } from 'lucide-react';

export default function VersionHistory() {
  const urlParams = new URLSearchParams(window.location.search);
  const entityType = urlParams.get('type') || 'challenge';
  const entityId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();

  const { history: activities, isLoading } = useVersionHistory(null, entityId, { entityType });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const actionColors = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    deleted: 'bg-red-100 text-red-700',
    status_changed: 'bg-purple-100 text-purple-700',
    assigned: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-teal-100 text-teal-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Version History', ar: 'سجل الإصدارات' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Track all changes and updates', ar: 'تتبع جميع التغييرات والتحديثات' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            {t({ en: 'Activity Timeline', ar: 'الجدول الزمني للنشاط' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <div key={activity.id} className="relative">
                {idx !== activities.length - 1 && (
                  <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-12 bottom-0 w-0.5 bg-slate-200`} />
                )}
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={actionColors[activity.action]}>
                          {activity.action.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {activity.entity_type}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(activity.created_date).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>

                    <p className="text-sm text-slate-900 mb-2">
                      {activity.details?.description || `Entity ${activity.action}`}
                    </p>

                    {(activity.old_value || activity.new_value) && (
                      <div className="flex items-center gap-4 text-xs mt-2 pt-2 border-t">
                        {activity.old_value && (
                          <div>
                            <span className="text-slate-500">{t({ en: 'From:', ar: 'من:' })}</span>{' '}
                            <span className="font-medium text-red-600">{activity.old_value}</span>
                          </div>
                        )}
                        {activity.new_value && (
                          <div>
                            <span className="text-slate-500">{t({ en: 'To:', ar: 'إلى:' })}</span>{' '}
                            <span className="font-medium text-green-600">{activity.new_value}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-600">
                      <User className="h-3 w-3" />
                      <span>{activity.actor_name || activity.created_by}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No history available', ar: 'لا يوجد سجل متاح' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
