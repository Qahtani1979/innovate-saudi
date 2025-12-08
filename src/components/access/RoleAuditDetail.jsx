import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, Users, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RoleAuditDetail({ roleId }) {
  const { t } = useLanguage();

  const { data: role } = useQuery({
    queryKey: ['role', roleId],
    queryFn: async () => {
      const roles = await base44.entities.Role.filter({ id: roleId });
      return roles[0];
    },
    enabled: !!roleId
  });

  const { data: users = [] } = useQuery({
    queryKey: ['role-users', roleId],
    queryFn: async () => {
      return base44.entities.User.filter({
        assigned_roles: { $in: [roleId] }
      });
    },
    enabled: !!roleId
  });

  const { data: accessLogs = [] } = useQuery({
    queryKey: ['role-access-logs', roleId],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const allLogs = await base44.entities.AccessLog.filter({
        timestamp: { $gte: sevenDaysAgo.toISOString() }
      });

      // Filter logs where permission matches role permissions
      return allLogs.filter(log => 
        role.permissions?.includes(log.permission)
      );
    },
    enabled: !!role
  });

  if (!role) return null;

  // Analytics
  const permissionUsage = {};
  accessLogs.forEach(log => {
    if (!permissionUsage[log.permission]) {
      permissionUsage[log.permission] = { total: 0, denied: 0 };
    }
    permissionUsage[log.permission].total++;
    if (!log.allowed) permissionUsage[log.permission].denied++;
  });

  const usageData = Object.entries(permissionUsage)
    .map(([perm, data]) => ({
      permission: perm.split('_').pop(),
      total: data.total,
      denied: data.denied
    }))
    .sort((a, b) => b.total - a.total);

  const unusedPermissions = role.permissions?.filter(p => !permissionUsage[p]) || [];

  return (
    <div className="space-y-4">
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {t({ en: 'Role Audit:', ar: 'تدقيق الدور:' })} {role.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{role.permissions?.length || 0}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Permissions', ar: 'الصلاحيات' })}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Users', ar: 'المستخدمين' })}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{accessLogs.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Access Events', ar: 'أحداث الوصول' })}</p>
            </div>
          </div>

          {/* Permission Usage Chart */}
          {usageData.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3">
                {t({ en: 'Permission Usage (Last 7 Days)', ar: 'استخدام الصلاحيات (آخر 7 أيام)' })}
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={usageData}>
                  <XAxis dataKey="permission" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" name="Used" />
                  <Bar dataKey="denied" fill="#ef4444" name="Denied" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Unused Permissions Alert */}
          {unusedPermissions.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900 mb-2">
                    {t({ en: 'Unused Permissions', ar: 'صلاحيات غير مستخدمة' })} ({unusedPermissions.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {unusedPermissions.map((perm, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Users */}
          <div>
            <h4 className="font-medium text-sm mb-3">
              {t({ en: 'Assigned Users:', ar: 'المستخدمون المعينون:' })}
            </h4>
            <div className="space-y-1">
              {users.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm">{user.full_name || user.email}</span>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  {t({ en: 'No users assigned to this role', ar: 'لا يوجد مستخدمين معينين لهذا الدور' })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}