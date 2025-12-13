import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from '@/components/LanguageContext';
import { Mail, Search, RefreshCw, Eye, AlertCircle, CheckCircle2, Clock, XCircle, Send, Loader2, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  sent: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: { en: 'Sent', ar: 'مُرسل' } },
  delivered: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: { en: 'Delivered', ar: 'تم التسليم' } },
  opened: { icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100', label: { en: 'Opened', ar: 'مفتوح' } },
  clicked: { icon: Send, color: 'text-purple-600', bg: 'bg-purple-100', label: { en: 'Clicked', ar: 'تم النقر' } },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: { en: 'Failed', ar: 'فشل' } },
  bounced: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', label: { en: 'Bounced', ar: 'مرتد' } },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: { en: 'Pending', ar: 'قيد الانتظار' } },
};

export default function EmailLogsViewer() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const pageSize = 20;

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['email-logs', statusFilter, searchTerm, page],
    queryFn: async () => {
      let query = supabase
        .from('email_logs')
        .select('*, email_templates(name_en, name_ar)')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (searchTerm) {
        query = query.or(`recipient_email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,template_key.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['email-logs-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('status');
      
      if (error) throw error;
      
      const counts = { total: 0, sent: 0, delivered: 0, failed: 0, opened: 0 };
      data?.forEach(log => {
        counts.total++;
        if (log.status) counts[log.status] = (counts[log.status] || 0) + 1;
      });
      return counts;
    }
  });

  const handleRetry = async (log) => {
    setRetrying(true);
    try {
      // Call email-trigger-hub with the original data
      const { error: invokeError } = await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: log.template_key,
          recipient_email: log.recipient_email,
          variables: log.variables_used || {},
          language: log.language || 'en',
          triggered_by: 'manual_retry'
        }
      });

      if (invokeError) throw invokeError;

      // Update retry count
      await supabase
        .from('email_logs')
        .update({ 
          retry_count: (log.retry_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', log.id);

      toast.success(t({ en: 'Email retry queued successfully', ar: 'تمت إضافة إعادة الإرسال للقائمة' }));
      refetch();
      setSelectedLog(null);
    } catch (error) {
      console.error('Retry error:', error);
      toast.error(t({ en: 'Failed to retry email', ar: 'فشل في إعادة إرسال البريد' }));
    } finally {
      setRetrying(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <Badge variant="secondary" className={`${config.bg} ${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {t(config.label)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { key: 'total', label: { en: 'Total Sent', ar: 'الإجمالي' }, color: 'bg-slate-100' },
          { key: 'sent', label: { en: 'Sent', ar: 'مُرسل' }, color: 'bg-green-100' },
          { key: 'delivered', label: { en: 'Delivered', ar: 'تم التسليم' }, color: 'bg-emerald-100' },
          { key: 'opened', label: { en: 'Opened', ar: 'مفتوح' }, color: 'bg-blue-100' },
          { key: 'failed', label: { en: 'Failed', ar: 'فشل' }, color: 'bg-red-100' },
        ].map(stat => (
          <Card key={stat.key} className={stat.color}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats?.[stat.key] || 0}</p>
              <p className="text-sm text-muted-foreground">{t(stat.label)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t({ en: 'Search by email, subject, or template...', ar: 'بحث بالبريد أو العنوان أو القالب...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Statuses', ar: 'جميع الحالات' })}</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{t(config.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t({ en: 'Refresh', ar: 'تحديث' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t({ en: 'Email Logs', ar: 'سجلات البريد' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>{t({ en: 'No email logs found', ar: 'لا توجد سجلات بريد' })}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <StatusBadge status={log.status} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{log.subject}</p>
                        <p className="text-sm text-muted-foreground truncate">{log.recipient_email}</p>
                      </div>
                      {log.template_key && (
                        <Badge variant="outline" className="text-xs">
                          {log.template_key}
                        </Badge>
                      )}
                      {log.retry_count > 0 && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                          {t({ en: `Retried ${log.retry_count}x`, ar: `أعيد ${log.retry_count}x` })}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                      {log.created_at && format(new Date(log.created_at), 'MMM d, HH:mm')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  {t({ en: 'Previous', ar: 'السابق' })}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t({ en: `Page ${page + 1}`, ar: `صفحة ${page + 1}` })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={logs.length < pageSize}
                >
                  {t({ en: 'Next', ar: 'التالي' })}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t({ en: 'Email Details', ar: 'تفاصيل البريد' })}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Status', ar: 'الحالة' })}</p>
                    <StatusBadge status={selectedLog.status} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Sent At', ar: 'وقت الإرسال' })}</p>
                    <p className="font-medium">
                      {selectedLog.sent_at ? format(new Date(selectedLog.sent_at), 'PPpp') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Recipient', ar: 'المستلم' })}</p>
                    <p className="font-medium">{selectedLog.recipient_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Template', ar: 'القالب' })}</p>
                    <p className="font-medium">{selectedLog.template_key || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Language', ar: 'اللغة' })}</p>
                    <p className="font-medium">{selectedLog.language === 'ar' ? 'العربية' : 'English'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Triggered By', ar: 'تم التشغيل بواسطة' })}</p>
                    <p className="font-medium">{selectedLog.triggered_by || 'system'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Subject', ar: 'العنوان' })}</p>
                  <p className="font-medium p-2 bg-muted rounded">{selectedLog.subject}</p>
                </div>
                
                {selectedLog.body_preview && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Body Preview', ar: 'معاينة المحتوى' })}</p>
                    <div 
                      className="p-3 bg-muted rounded text-sm max-h-48 overflow-auto"
                      dangerouslySetInnerHTML={{ __html: selectedLog.body_preview }}
                    />
                  </div>
                )}
                
                {selectedLog.error_message && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800">{t({ en: 'Error', ar: 'خطأ' })}</p>
                    <p className="text-sm text-red-600">{selectedLog.error_message}</p>
                  </div>
                )}
                
                {selectedLog.variables_used && Object.keys(selectedLog.variables_used).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t({ en: 'Variables Used', ar: 'المتغيرات المستخدمة' })}</p>
                    <pre className="p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(selectedLog.variables_used, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Retry Button for failed emails */}
                {(selectedLog.status === 'failed' || selectedLog.status === 'bounced') && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => handleRetry(selectedLog)}
                      disabled={retrying}
                      className="w-full"
                    >
                      {retrying ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4 mr-2" />
                      )}
                      {t({ en: 'Retry Sending', ar: 'إعادة الإرسال' })}
                    </Button>
                    {selectedLog.retry_count > 0 && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        {t({ en: `Previously retried ${selectedLog.retry_count} time(s)`, ar: `تم إعادة المحاولة ${selectedLog.retry_count} مرة(مرات)` })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
