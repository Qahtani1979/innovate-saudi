import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import {
  Activity, MessageSquare, CheckCircle2, XCircle, Clock, Rocket,
  Users, Calendar, Award, Target, Sparkles, FileText
} from 'lucide-react';
import { useProgramSystemActivities } from '@/hooks/useProgramActivity';
import { useComments } from '@/hooks/useComments';
import { useApprovalRequests } from '@/hooks/useApprovalWorkflow';

export default function ProgramActivityLog({ programId }) {
  const { language, isRTL, t } = useLanguage();

  // Fetch all activity sources
  const { data: systemActivity = [] } = useProgramSystemActivities(programId);
  const { data: comments = [] } = useComments('program', programId);
  const { data: approvals = [] } = useApprovalRequests('program', programId);

  // Merge and sort all activities
  const mergedActivities = [
    ...systemActivity.map(a => ({ ...a, _type: 'system', _date: new Date(a.created_at) })),
    ...comments.map(c => ({ ...c, _type: 'comment', _date: new Date(c.created_at) })),
    ...approvals.map(a => ({ ...a, _type: 'approval', _date: new Date(a.created_at) }))
  ].sort((a, b) => b._date.getTime() - a._date.getTime());

  // Group by date
  const groupedActivities = mergedActivities.reduce((groups, activity) => {
    const dateKey = activity._date.toLocaleDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(activity);
    return groups;
  }, {});

  const getActivityIcon = (activity) => {
    if (activity._type === 'comment') return MessageSquare;
    if (activity._type === 'approval') {
      if (activity.status === 'approved') return CheckCircle2;
      if (activity.status === 'rejected') return XCircle;
      return Clock;
    }

    // System activity icons
    const actionMap = {
      program_created: Rocket,
      program_updated: Activity,
      program_launched: Rocket,
      status_changed: Target,
      application_received: FileText,
      cohort_selected: Users,
      session_scheduled: Calendar,
      program_completed: Award,
      mentor_assigned: Users,
      ai_analysis: Sparkles
    };

    return actionMap[activity.activity_type] || Activity;
  };

  const getActivityColor = (activity) => {
    if (activity._type === 'comment') return 'text-blue-600';
    if (activity._type === 'approval') {
      if (activity.status === 'approved') return 'text-green-600';
      if (activity.status === 'rejected') return 'text-red-600';
      return 'text-yellow-600';
    }
    return 'text-slate-600';
  };

  const getActivityTitle = (activity) => {
    if (activity._type === 'comment') {
      return activity.is_internal
        ? t({ en: 'Internal Note', ar: 'ملاحظة داخلية' })
        : t({ en: 'Comment', ar: 'تعليق' });
    }

    if (activity._type === 'approval') {
      return `${activity.gate_name?.replace(/_/g, ' ')} ${activity.status}`;
    }

    const actionMap = {
      program_created: t({ en: 'Program Created', ar: 'البرنامج تم إنشاؤه' }),
      program_updated: t({ en: 'Program Updated', ar: 'البرنامج محدّث' }),
      program_launched: t({ en: 'Program Launched', ar: 'البرنامج أطلق' }),
      status_changed: t({ en: 'Status Changed', ar: 'الحالة تغيرت' }),
      application_received: t({ en: 'Application Received', ar: 'طلب مستلم' }),
      cohort_selected: t({ en: 'Cohort Selected', ar: 'الدفعة مختارة' }),
      session_scheduled: t({ en: 'Session Scheduled', ar: 'جلسة مجدولة' }),
      program_completed: t({ en: 'Program Completed', ar: 'البرنامج مكتمل' }),
      mentor_assigned: t({ en: 'Mentor Assigned', ar: 'موجه معين' }),
      ai_analysis: t({ en: 'AI Analysis Generated', ar: 'تحليل ذكي مولّد' })
    };

    return actionMap[activity.activity_type] || activity.activity_type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t({ en: 'Activity Timeline', ar: 'المخطط الزمني للنشاط' })}
          <Badge variant="outline">{mergedActivities.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mergedActivities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t({ en: 'No activity yet', ar: 'لا نشاط بعد' })}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, activities]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium text-slate-500">{date}</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="space-y-3">
                  {activities.map((activity, idx) => {
                    const Icon = getActivityIcon(activity);
                    const color = getActivityColor(activity);

                    return (
                      <div key={idx} className="flex gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 p-3 bg-slate-50 rounded-lg border">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-slate-900">
                                {getActivityTitle(activity)}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {activity.performed_by || activity.created_by || activity.reviewer_email || t({ en: 'System', ar: 'النظام' })}
                                {' • '}
                                {activity.timestamp
                                  ? new Date(activity.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })
                                  : new Date(activity.created_date).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })
                                }
                              </p>
                            </div>
                            {activity._type === 'approval' && (
                              <Badge className={
                                activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  activity.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                              }>
                                {activity.status}
                              </Badge>
                            )}
                          </div>

                          {activity._type === 'comment' && (
                            <p className="text-sm text-slate-700 mt-2">{activity.comment_text}</p>
                          )}

                          {activity._type === 'system' && activity.metadata && (
                            <div className="mt-2 space-y-1">
                              {activity.metadata.old_value && (
                                <p className="text-xs text-slate-600">
                                  {activity.metadata.field}: {activity.metadata.old_value} → {activity.metadata.new_value}
                                </p>
                              )}
                              {activity.description && (
                                <p className="text-xs text-slate-600">{activity.description}</p>
                              )}
                            </div>
                          )}

                          {activity._type === 'approval' && (
                            <div className="mt-2 space-y-1">
                              {activity.reviewer_notes && (
                                <p className="text-sm text-slate-700">{activity.reviewer_notes}</p>
                              )}
                              {activity.conditions && activity.conditions.length > 0 && (
                                <div className="p-2 bg-amber-50 rounded border border-amber-200">
                                  <p className="text-xs font-semibold text-amber-900 mb-1">
                                    {t({ en: 'Conditions:', ar: 'الشروط:' })}
                                  </p>
                                  {activity.conditions.map((cond, i) => (
                                    <p key={i} className="text-xs text-amber-800">• {cond}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}