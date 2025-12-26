import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock, Edit, Eye, MessageSquare, UserPlus,
  CheckCircle, XCircle, Send, Archive, Star,
  FileUp, Link, AlertTriangle, RefreshCw
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useChallengeActivities } from '@/hooks/useChallengeActivities';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useComments } from '@/hooks/useComments';

// Activity type configurations
const ACTIVITY_TYPES = {
  created: { icon: Star, color: 'text-green-500', label: { en: 'Created', ar: 'تم الإنشاء' } },
  updated: { icon: Edit, color: 'text-blue-500', label: { en: 'Updated', ar: 'تم التحديث' } },
  viewed: { icon: Eye, color: 'text-gray-500', label: { en: 'Viewed', ar: 'تمت المشاهدة' } },
  commented: { icon: MessageSquare, color: 'text-purple-500', label: { en: 'Commented', ar: 'تم التعليق' } },
  assigned: { icon: UserPlus, color: 'text-orange-500', label: { en: 'Assigned', ar: 'تم التعيين' } },
  approved: { icon: CheckCircle, color: 'text-green-600', label: { en: 'Approved', ar: 'تمت الموافقة' } },
  rejected: { icon: XCircle, color: 'text-red-500', label: { en: 'Rejected', ar: 'تم الرفض' } },
  submitted: { icon: Send, color: 'text-blue-600', label: { en: 'Submitted', ar: 'تم التقديم' } },
  archived: { icon: Archive, color: 'text-gray-600', label: { en: 'Archived', ar: 'تمت الأرشفة' } },
  published: { icon: Eye, color: 'text-emerald-500', label: { en: 'Published', ar: 'تم النشر' } },
  status_change: { icon: RefreshCw, color: 'text-yellow-500', label: { en: 'Status Changed', ar: 'تغيير الحالة' } },
  file_uploaded: { icon: FileUp, color: 'text-indigo-500', label: { en: 'File Uploaded', ar: 'تم رفع ملف' } },
  linked: { icon: Link, color: 'text-cyan-500', label: { en: 'Linked', ar: 'تم الربط' } },
  escalated: { icon: AlertTriangle, color: 'text-red-600', label: { en: 'Escalated', ar: 'تم التصعيد' } },
  permission_change: { icon: UserPlus, color: 'text-orange-600', label: { en: 'Permission Changed', ar: 'تغيير الصلاحية' } }
};

function ActivityItem({ activity, language }) {
  const config = ACTIVITY_TYPES[activity.activity_type] || ACTIVITY_TYPES.updated;
  const Icon = config.icon;

  const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
    addSuffix: true,
    locale: language === 'ar' ? ar : undefined
  });

  const fullDate = format(new Date(activity.created_at), 'PPpp', {
    locale: language === 'ar' ? ar : undefined
  });

  // Parse metadata for additional context
  const metadata = activity.metadata || {};

  return (
    <div className="flex gap-4 py-4 border-b last:border-0">
      {/* Icon */}
      <div className={`flex-shrink-0 mt-1 ${config.color}`}>
        <div className="p-2 bg-muted rounded-full">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-medium">
              {config.label[language] || config.label.en}
            </span>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {activity.description}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-xs whitespace-nowrap" title={fullDate}>
            {timeAgo}
          </Badge>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <span>{activity.user_email || (language === 'ar' ? 'نظام' : 'System')}</span>
        </div>

        {/* Metadata details */}
        {metadata.old_status && metadata.new_status && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {metadata.old_status}
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary" className="text-xs">
              {metadata.new_status}
            </Badge>
          </div>
        )}

        {metadata.change_type && (
          <div className="text-xs text-muted-foreground mt-1">
            {metadata.change_type === 'ownership_transfer' && (
              <span>
                {language === 'ar' ? 'نقل الملكية إلى' : 'Ownership transferred to'}: {metadata.new_owner}
              </span>
            )}
            {metadata.change_type === 'reviewer_assignment' && (
              <span>
                {language === 'ar' ? 'تم تعيين المراجع' : 'Reviewer assigned'}: {metadata.new_reviewer}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChallengeActivityTimeline({ challengeId }) {
  const { language } = useLanguage();

  // Fetch activities from challenge_activities table
  const { data: activities, isLoading: activitiesLoading } = useChallengeActivities({
    challengeId,
    limit: 50
  });

  // Fetch audit logs for this challenge
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs({
    entityType: 'challenge',
    entityId: challengeId,
    limit: 50
  });

  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useComments('challenge', challengeId);

  const isLoading = activitiesLoading || auditLoading || commentsLoading;

  // Merge and sort all activities
  const allActivities = React.useMemo(() => {
    const merged = [];

    // Add challenge activities
    activities?.forEach(a => {
      merged.push({
        id: a.id,
        activity_type: a.activity_type,
        description: a.description,
        user_email: a.user_email,
        created_at: a.created_at,
        metadata: a.metadata
      });
    });

    // Add audit logs (convert to activity format)
    auditLogs?.forEach(log => {
      const activityType = log.action === 'permission_change' ? 'permission_change' :
        log.action === 'update' ? 'updated' :
          log.action === 'create' ? 'created' :
            log.action === 'delete' ? 'archived' : 'updated';

      merged.push({
        id: `audit-${log.id}`,
        activity_type: activityType,
        description: log.metadata?.changes ?
          Object.keys(log.metadata.changes).join(', ') + ' updated' : null,
        user_email: log.user_email,
        created_at: log.created_at,
        metadata: {
          ...log.metadata,
          old_values: log.old_values,
          new_values: log.new_values
        }
      });
    });

    // Add comments
    comments?.forEach(c => {
      merged.push({
        id: `comment-${c.id}`,
        activity_type: 'commented',
        description: c.comment_text?.substring(0, 100) + (c.comment_text?.length > 100 ? '...' : ''),
        user_email: c.user_email,
        created_at: c.created_at,
        metadata: { comment_id: c.id }
      });
    });

    // Sort by date descending
    return merged.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [activities, auditLogs, comments]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {language === 'ar' ? 'سجل النشاط' : 'Activity Log'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {language === 'ar' ? 'سجل النشاط' : 'Activity Log'}
          <Badge variant="secondary" className="ml-2">
            {allActivities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'ar' ? 'لا يوجد نشاط مسجل بعد' : 'No activity recorded yet'}
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-1">
              {allActivities.map(activity => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  language={language}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default ChallengeActivityTimeline;
