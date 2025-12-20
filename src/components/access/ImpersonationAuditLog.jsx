import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from '../LanguageContext';
import { UserCog } from 'lucide-react';

export default function ImpersonationAuditLog() {
  const { language, isRTL, t } = useLanguage();

  const { data: impersonationLogs = [] } = useQuery({
    queryKey: ['impersonation-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      return (data || []).filter(log => log.action === 'impersonate' || log.metadata?.impersonation);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-purple-600" />
          {t({ en: 'Impersonation Audit Log', ar: 'سجل تدقيق الانتحال' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>{t({ en: 'Admin User', ar: 'المسؤول' })}</TableHead>
              <TableHead>{t({ en: 'Impersonated User', ar: 'المستخدم المنتحل' })}</TableHead>
              <TableHead>{t({ en: 'Duration', ar: 'المدة' })}</TableHead>
              <TableHead>{t({ en: 'Actions Taken', ar: 'الإجراءات' })}</TableHead>
              <TableHead>{t({ en: 'Timestamp', ar: 'الوقت' })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {impersonationLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  {t({ en: 'No impersonation activity recorded', ar: 'لا توجد سجلات انتحال' })}
                </TableCell>
              </TableRow>
            ) : (
              impersonationLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user_email}</TableCell>
                  <TableCell>{log.metadata?.impersonated_user || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {log.metadata?.duration || '30 min'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.metadata?.actions_count || 0} actions</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
