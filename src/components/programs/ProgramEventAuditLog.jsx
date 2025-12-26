import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  History,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Send,
  Play,
  Calendar,
  User,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const actionIcons = {
  program_created: Plus,
  program_updated: Pencil,
  program_deleted: Trash2,
  program_submitted_for_approval: Send,
  program_approved: CheckCircle,
  program_rejected: XCircle,
  program_status_changed: Play,
  program_launched: Play,
  program_completed: CheckCircle,
  program_cancelled: XCircle,
  program_enrollment_opened: Calendar,
  program_participant_enrolled: User,
  event_created: Plus,
  event_updated: Pencil,
  event_deleted: Trash2,
  event_submitted_for_approval: Send,
  event_approved: CheckCircle,
  event_rejected: XCircle,
  event_cancelled: XCircle,
  event_rescheduled: Calendar,
  event_user_registered: User,
  approval_submitted: Send,
  approval_granted: CheckCircle,
  approval_rejected: XCircle
};

const actionColors = {
  program_created: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  program_updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  program_deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  program_submitted_for_approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  program_approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  program_rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  program_status_changed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  program_launched: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  program_completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  program_cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  event_created: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  event_updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  event_deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  event_submitted_for_approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  event_approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  event_rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  event_cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  approval_submitted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approval_granted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  approval_rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

function formatActionName(action) {
  return action
    .replace(/_/g, ' ')
    .replace(/^(program|event)\s/, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ProgramEventAuditLog({ entityType, entityId, limit = 50 }) {
  const { t } = useLanguage();

  const { data: logs = [], isLoading } = useAuditLogs({ entityType, entityId, limit });

  const programLogs = logs.filter(l => l.entity_type === 'program' || l.action?.startsWith('program_'));
  const eventLogs = logs.filter(l => l.entity_type === 'event' || l.action?.startsWith('event_'));
  const approvalLogs = logs.filter(l => l.entity_type?.includes('approval') || l.action?.startsWith('approval_'));

  const renderLogEntry = (log) => {
    const Icon = actionIcons[log.action] || FileText;
    const colorClass = actionColors[log.action] || 'bg-muted text-muted-foreground';
    const metadata = log.metadata || {};

    return (
      <div key={log.id} className="flex items-start gap-3 p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={colorClass}>
              {formatActionName(log.action || 'Unknown Action')}
            </Badge>
            {metadata.program_name && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {metadata.program_name}
              </span>
            )}
            {metadata.event_title && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {metadata.event_title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{log.user_email || 'System'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span title={format(new Date(log.created_at), 'PPpp')}>
                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          {metadata.updated_fields && metadata.updated_fields.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Updated: {metadata.updated_fields.join(', ')}
            </div>
          )}
          {metadata.reason && (
            <div className="mt-2 text-xs text-muted-foreground">
              Reason: {metadata.reason}
            </div>
          )}
          {metadata.new_status && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Status → {metadata.new_status}
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t({ en: 'Loading audit logs...', ar: 'جاري تحميل سجلات المراجعة...' })}
        </CardContent>
      </Card>
    );
  }

  // If viewing specific entity, show simple list
  if (entityId) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            {t({ en: 'Activity History', ar: 'سجل النشاط' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t({ en: 'No activity recorded yet', ar: 'لم يتم تسجيل أي نشاط بعد' })}</p>
              </div>
            ) : (
              logs.map(renderLogEntry)
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // Full audit log view with tabs
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          {t({ en: 'Programs & Events Audit Log', ar: 'سجل مراجعة البرامج والفعاليات' })}
          <Badge variant="secondary" className="ml-2">{logs.length} entries</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-4 rounded-none border-b">
            <TabsTrigger value="all">
              {t({ en: 'All', ar: 'الكل' })} ({logs.length})
            </TabsTrigger>
            <TabsTrigger value="programs">
              {t({ en: 'Programs', ar: 'البرامج' })} ({programLogs.length})
            </TabsTrigger>
            <TabsTrigger value="events">
              {t({ en: 'Events', ar: 'الفعاليات' })} ({eventLogs.length})
            </TabsTrigger>
            <TabsTrigger value="approvals">
              {t({ en: 'Approvals', ar: 'الموافقات' })} ({approvalLogs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[500px]">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t({ en: 'No audit logs found', ar: 'لم يتم العثور على سجلات مراجعة' })}</p>
                </div>
              ) : (
                logs.map(renderLogEntry)
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="programs" className="mt-0">
            <ScrollArea className="h-[500px]">
              {programLogs.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <p>{t({ en: 'No program activity logs', ar: 'لا توجد سجلات نشاط للبرامج' })}</p>
                </div>
              ) : (
                programLogs.map(renderLogEntry)
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <ScrollArea className="h-[500px]">
              {eventLogs.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <p>{t({ en: 'No event activity logs', ar: 'لا توجد سجلات نشاط للفعاليات' })}</p>
                </div>
              ) : (
                eventLogs.map(renderLogEntry)
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="approvals" className="mt-0">
            <ScrollArea className="h-[500px]">
              {approvalLogs.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <p>{t({ en: 'No approval logs', ar: 'لا توجد سجلات موافقات' })}</p>
                </div>
              ) : (
                approvalLogs.map(renderLogEntry)
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ProgramEventAuditLog;
