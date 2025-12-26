import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import {
  FileText, MessageSquare, CheckCircle2, Upload, Link as LinkIcon,
  AlertCircle, Star, TestTube, Eye, Edit, Sparkles, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { useComments } from '@/hooks/useComments';
import { useEntityApprovalHistory } from '@/hooks/useApprovalRequests';
import { useSolutionReviews } from '@/hooks/useSolutionReviews';
import { useSolutionSystemActivities, useSolutionInterests, useSolutionDemoRequests } from '@/hooks/useSolutionActivity';

export default function SolutionActivityLog({ solution }) {
  const { language, isRTL, t } = useLanguage();

  const { data: activities = [] } = useSolutionSystemActivities(solution.id);
  const { data: comments = [] } = useComments('solution', solution.id);
  const { data: approvals = [] } = useEntityApprovalHistory(solution.id, 'Solution');
  const { data: interests = [] } = useSolutionInterests(solution.id);
  const { data: reviews = [] } = useSolutionReviews(solution.id);
  const { data: demoRequests = [] } = useSolutionDemoRequests(solution.id);

  // Combine and sort events
  const timelineEvents = [
    ...activities.map(a => ({ ...a, type: 'system_activity', date: new Date(a.created_at) })),
    ...comments.map(c => ({ ...c, type: 'comment', date: new Date(c.created_at) })),
    ...approvals.map(a => ({ ...a, type: 'approval', date: new Date(a.created_at) })),
    ...interests.map(i => ({ ...i, type: 'interest', date: new Date(i.created_at) })),
    ...reviews.map(r => ({ ...r, type: 'review', date: new Date(r.created_at) })),
    ...demoRequests.map(d => ({ ...d, type: 'demo_request', date: new Date(d.created_at) }))
  ].sort((a, b) => b.date - a.date);

  const getEventIcon = (type, activityType) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'approval': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'interest': return <Sparkles className="h-4 w-4 text-amber-500" />;
      case 'review': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'demo_request': return <Eye className="h-4 w-4 text-teal-500" />;
      case 'system_activity':
        switch (activityType) {
          case 'create': return <Upload className="h-4 w-4 text-green-500" />;
          case 'update': return <Edit className="h-4 w-4 text-slate-500" />;
          case 'verify': return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
          case 'pilot_started': return <TestTube className="h-4 w-4 text-indigo-500" />;
          default: return <FileText className="h-4 w-4 text-slate-400" />;
        }
      default: return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  const formatEventContent = (event) => {
    switch (event.type) {
      case 'comment':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{event.user_name || 'User'}</span>
              <span className="text-slate-500 text-xs">{t({ en: 'commented', ar: 'علق' })}</span>
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border">{event.comment_text}</p>
          </div>
        );
      case 'approval':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${event.approval_status === 'approved' ? 'text-green-700' :
                  event.approval_status === 'rejected' ? 'text-red-700' : 'text-amber-700'
                }`}>
                {event.approval_status.toUpperCase()}
              </span>
              <span className="text-slate-500 text-xs">
                {t({ en: 'Request Update', ar: 'تحديث الطلب' })}
              </span>
            </div>
            {event.reviewer_notes && (
              <p className="text-xs text-slate-600 italic">
                "{event.reviewer_notes}"
              </p>
            )}
          </div>
        );
      case 'interest':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{event.interested_by_name}</span>
              <span className="text-amber-600 text-xs font-medium">
                {t({ en: 'Expressed Interest', ar: 'أبدى اهتماماً' })}
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline">{event.interest_type}</Badge>
              {event.municipality_id && <Badge variant="secondary">{event.municipality_id}</Badge>}
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{event.reviewer_name}</span>
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs font-bold">{event.overall_rating}/5</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 font-medium">{event.review_title}</p>
          </div>
        );
      case 'demo_request':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{event.requester_name}</span>
              <span className="text-teal-600 text-xs font-medium">
                {t({ en: 'Requested Demo', ar: 'طلب عرض توضيحي' })}
              </span>
            </div>
            <p className="text-xs text-slate-500">{event.demo_type}</p>
          </div>
        );
      case 'system_activity':
      default:
        return (
          <div className="space-y-1">
            <p className="text-sm text-slate-700">
              {language === 'ar' && event.description_ar ? event.description_ar : event.description}
            </p>
            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(event.metadata).map(([k, v]) => (
                  <Badge key={k} variant="outline" className="text-[10px] text-slate-500">
                    {k}: {typeof v === 'object' ? JSON.stringify(v) : v}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t({ en: 'Activity & Timeline', ar: 'النشاط والجدول الزمني' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
          {timelineEvents.map((event, idx) => (
            <div key={`${event.type}-${event.id}`} className="relative">
              <span className="absolute -left-[33px] bg-white p-1 rounded-full border shadow-sm">
                {getEventIcon(event.type, event.activity_type)}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-medium">
                  {format(event.date, 'MMM d, yyyy h:mm a')}
                </span>
                {formatEventContent(event)}
              </div>
            </div>
          ))}

          {timelineEvents.length === 0 && (
            <div className="text-center py-8 text-slate-500 italic">
              {t({ en: 'No activity recorded yet', ar: 'لم يتم تسجيل أي نشاط بعد' })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}