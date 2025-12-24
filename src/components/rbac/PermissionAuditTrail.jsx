import { useAccessLogs } from '@/hooks/useRBACStatistics';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, User } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function PermissionAuditTrail({ roleId, userId }) {
  const { t, language } = useLanguage();

  const { data: accessLogs = [] } = useAccessLogs(30);

  const permissionChanges = accessLogs.filter(log => {
    const isRelated =
      log.action?.toLowerCase().includes('permission') ||
      log.action?.toLowerCase().includes('role') ||
      log.details?.toLowerCase().includes('permission') ||
      log.details?.toLowerCase().includes('role');

    if (!isRelated) return false;

    // If filtered by roleId or userId
    if (roleId && !log.details?.includes(roleId)) return false;
    if (userId && log.user_email !== userId) return false;

    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-600" />
          {t({ en: 'Permission Changes', ar: 'تغييرات الصلاحيات' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {permissionChanges.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              {t({ en: 'No permission changes recorded', ar: 'لا توجد تغييرات' })}
            </p>
          ) : (
            permissionChanges.map((log, idx) => (
              <div key={idx} className="p-2 bg-slate-50 rounded border text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3 w-3 text-slate-500" />
                  <span className="font-medium">{log.user_email}</span>
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-500">
                    {new Date(log.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                <p className="text-slate-700">{log.details || log.action}</p>
                {log.entity_type && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {log.entity_type}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}