import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Search, User, Calendar, Activity, Edit2, Trash2, Plus, Eye, RefreshCw, Filter, Settings, Shield, Download } from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { useAuditLogs } from '@/hooks/useAuditHooks';

export default function AuditTrail() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: auditLogs = [], isLoading, refetch } = useAuditLogs();

  const actionConfig = {
    create: { icon: Plus, color: 'text-green-600', bg: 'bg-green-100', label: { en: 'Created', ar: 'إنشاء' } },
    update: { icon: Edit2, color: 'text-blue-600', bg: 'bg-blue-100', label: { en: 'Updated', ar: 'تحديث' } },
    delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100', label: { en: 'Deleted', ar: 'حذف' } },
    approve: { icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100', label: { en: 'Approved', ar: 'موافقة' } },
    view: { icon: Eye, color: 'text-slate-600', bg: 'bg-slate-100', label: { en: 'Viewed', ar: 'عرض' } },
    stage_change: { icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100', label: { en: 'Stage Change', ar: 'تغيير المرحلة' } },
    bulk_create: { icon: Plus, color: 'text-green-600', bg: 'bg-green-100', label: { en: 'Bulk Create', ar: 'إنشاء جماعي' } },
    bulk_update: { icon: Edit2, color: 'text-blue-600', bg: 'bg-blue-100', label: { en: 'Bulk Update', ar: 'تحديث جماعي' } },
    bulk_delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100', label: { en: 'Bulk Delete', ar: 'حذف جماعي' } },
    data_export: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100', label: { en: 'Export', ar: 'تصدير' } },
    login_success: { icon: User, color: 'text-green-600', bg: 'bg-green-100', label: { en: 'Login', ar: 'تسجيل دخول' } },
    login_failed: { icon: User, color: 'text-red-600', bg: 'bg-red-100', label: { en: 'Login Failed', ar: 'فشل تسجيل الدخول' } }
  };

  // Get unique entity types for filter
  const entityTypes = [...new Set(auditLogs.map(l => l.entity_type).filter(Boolean))];
  const actionTypes = [...new Set(auditLogs.map(l => l.action).filter(Boolean))];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesEntity && matchesAction;
  });

  const todayLogs = auditLogs.filter(l => {
    const logDate = new Date(l.created_at);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={FileText}
        title={{ en: 'Audit Trail', ar: 'سجل التدقيق' }}
        description={{ en: 'Complete activity log of all platform changes and actions', ar: 'سجل كامل لجميع التغييرات والإجراءات على المنصة' }}
        action={<Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t({ en: 'Refresh', ar: 'تحديث' })}
        </Button>} subtitle={undefined} actions={undefined} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Actions', ar: 'إجمالي الإجراءات' })}</p>
                <p className="text-3xl font-bold text-green-600">{auditLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Today', ar: 'اليوم' })}</p>
                <p className="text-3xl font-bold text-blue-600">{todayLogs.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Users', ar: 'المستخدمون النشطون' })}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(auditLogs.map(l => l.user_email).filter(Boolean)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Entity Types', ar: 'أنواع الكيانات' })}</p>
                <p className="text-3xl font-bold text-amber-600">{entityTypes.length}</p>
              </div>
              <FileText className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search by user, entity, or action...', ar: 'ابحث بالمستخدم أو الكيان أو الإجراء...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-10' : 'pl-10'}`}
              />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'All Entities', ar: 'كل الكيانات' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Entities', ar: 'كل الكيانات' })}</SelectItem>
                {entityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'All Actions', ar: 'كل الإجراءات' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Actions', ar: 'كل الإجراءات' })}</SelectItem>
                {actionTypes.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Activity Log', ar: 'سجل النشاط' })} ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'No audit logs found', ar: 'لا توجد سجلات' })}</p>
              </div>
            ) : (
              filteredLogs.map(log => {
                const baseAction = log.action?.split('_')[0] || 'view';
                const config = actionConfig[log.action] || actionConfig[baseAction] || actionConfig.view;
                const Icon = config.icon;

                return (
                  <div key={log.id} className="p-4 border rounded-lg hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <Badge className={`${config.bg} ${config.color}`}>
                              {log.action}
                            </Badge>
                            {log.entity_type && (
                              <Badge variant="outline">{log.entity_type}</Badge>
                            )}
                            <span className="text-sm text-slate-600">
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user_email || 'System'}
                            </span>
                            {log.entity_id && (
                              <span className="font-mono text-xs">{log.entity_id.slice(0, 8)}...</span>
                            )}
                            {log.ip_address && (
                              <span className="text-xs text-slate-400">{log.ip_address}</span>
                            )}
                          </div>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-2 p-2 bg-slate-50 rounded text-xs font-mono max-h-24 overflow-y-auto">
                              {Object.entries(log.metadata).slice(0, 5).map(([key, value]) => (
                                <div key={key} className="truncate">
                                  {key}: <span className="text-slate-500">{JSON.stringify(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}