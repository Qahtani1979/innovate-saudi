import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, User } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function PermissionAuditTrail({ roleId, userId }) {
  const { t, language } = useLanguage();

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['permission-audit', roleId, userId],
    queryFn: async () => {
      const filters = {};
      if (roleId) {
        filters.entity_type = 'Role';
        filters.entity_id = roleId;
      }
      if (userId) {
        filters.activity_description = { $regex: userId };
      }

      return await base44.entities.SystemActivity.filter(
        filters,
        '-created_date',
        50
      );
    }
  });

  const permissionChanges = auditLogs.filter(log => 
    log.activity_type?.includes('permission') || 
    log.activity_type?.includes('role') ||
    log.activity_description?.toLowerCase().includes('permission') ||
    log.activity_description?.toLowerCase().includes('role')
  );

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
                  <span className="font-medium">{log.created_by}</span>
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-500">
                    {new Date(log.created_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                <p className="text-slate-700">{log.activity_description}</p>
                {log.activity_type && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {log.activity_type}
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