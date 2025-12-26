import { useRDActivityLog } from '@/hooks/useRDData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, User, FileText, CheckCircle2, XCircle, Send } from 'lucide-react';

export default function RDProposalActivityLog({ proposalId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: activities = [] } = useRDActivityLog('RDProposal', proposalId);

  const activityIcons = {
    created: FileText,
    status_changed: Activity,
    submitted: Send,
    evaluated: CheckCircle2,
    rejected: XCircle,
    approved: CheckCircle2,
    comment_added: Activity,
    updated: FileText
  };

  const activityColors = {
    created: 'bg-blue-100 text-blue-700',
    status_changed: 'bg-purple-100 text-purple-700',
    submitted: 'bg-teal-100 text-teal-700',
    evaluated: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    approved: 'bg-green-100 text-green-700',
    comment_added: 'bg-amber-100 text-amber-700',
    updated: 'bg-slate-100 text-slate-700'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-slate-600" />
          {t({ en: 'Activity Log', ar: 'سجل النشاط' })} ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.activity_type] || Activity;
            const colorClass = activityColors[activity.activity_type] || 'bg-slate-100 text-slate-700';

            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
                <div className={`h-10 w-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${colorClass} text-xs`}>
                      {activity.activity_type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 font-medium">{activity.description}</p>
                  {activity.performed_by && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-600">
                      <User className="h-3 w-3" />
                      <span>{activity.performed_by}</span>
                    </div>
                  )}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                      <pre className="text-slate-700 whitespace-pre-wrap">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">{t({ en: 'No activity yet', ar: 'لا يوجد نشاط بعد' })}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
