import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Search, Filter, User, Calendar, Activity, Edit2, Trash2, Plus, Eye } from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

export default function AuditTrail() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  // Mock audit data - in real app, fetch from backend
  const auditLogs = [
    {
      id: '1',
      timestamp: '2025-01-24 14:32:15',
      user: 'admin@gdisb.gov.sa',
      action: 'create',
      entity_type: 'Pilot',
      entity_id: 'PLT-RUH-2025-001',
      entity_name: 'Smart Traffic System',
      changes: { status: null, new_status: 'design' },
      ip_address: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2025-01-24 13:15:42',
      user: 'municipality@riyadh.gov.sa',
      action: 'update',
      entity_type: 'Challenge',
      entity_id: 'CH-RUH-2025-035',
      entity_name: 'Drainage System Issues',
      changes: { status: 'draft', new_status: 'submitted' },
      ip_address: '192.168.1.101'
    },
    {
      id: '3',
      timestamp: '2025-01-24 12:45:30',
      user: 'tech.lead@gdisb.gov.sa',
      action: 'approve',
      entity_type: 'Pilot',
      entity_id: 'PLT-JED-2025-012',
      entity_name: 'Waste Management Optimization',
      changes: { stage: 'approval_pending', new_stage: 'approved' },
      ip_address: '192.168.1.102'
    },
    {
      id: '4',
      timestamp: '2025-01-24 11:20:15',
      user: 'admin@gdisb.gov.sa',
      action: 'delete',
      entity_type: 'Solution',
      entity_id: 'SOL-2025-045',
      entity_name: 'Legacy System',
      changes: null,
      ip_address: '192.168.1.100'
    },
    {
      id: '5',
      timestamp: '2025-01-24 10:05:22',
      user: 'evaluator@gdisb.gov.sa',
      action: 'update',
      entity_type: 'Pilot',
      entity_id: 'PLT-DMM-2025-008',
      entity_name: 'Air Quality Monitoring',
      changes: { success_probability: 65, new_success_probability: 78 },
      ip_address: '192.168.1.103'
    }
  ];

  const actionConfig = {
    create: { icon: Plus, color: 'text-green-600', bg: 'bg-green-100', label: { en: 'Created', ar: 'إنشاء' } },
    update: { icon: Edit2, color: 'text-blue-600', bg: 'bg-blue-100', label: { en: 'Updated', ar: 'تحديث' } },
    delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100', label: { en: 'Deleted', ar: 'حذف' } },
    approve: { icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100', label: { en: 'Approved', ar: 'موافقة' } },
    view: { icon: Eye, color: 'text-slate-600', bg: 'bg-slate-100', label: { en: 'Viewed', ar: 'عرض' } }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entity_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entity_type.toLowerCase() === entityFilter.toLowerCase();
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesEntity && matchesAction;
  });

  return (
    <PageLayout>
      <PageHeader
        icon={FileText}
        title={{ en: 'Audit Trail', ar: 'سجل التدقيق' }}
        description={{ en: 'Complete activity log of all platform changes and actions', ar: 'سجل كامل لجميع التغييرات والإجراءات على المنصة' }}
      />

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
                <p className="text-3xl font-bold text-blue-600">{auditLogs.length}</p>
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
                  {new Set(auditLogs.map(l => l.user)).size}
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
                <p className="text-sm text-slate-600">{t({ en: 'Entities Modified', ar: 'الكيانات المعدلة' })}</p>
                <p className="text-3xl font-bold text-amber-600">
                  {new Set(auditLogs.map(l => l.entity_type)).size}
                </p>
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
                placeholder={t({ en: 'Search by user, entity, or ID...', ar: 'ابحث بالمستخدم أو الكيان أو المعرف...' })}
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
                <SelectItem value="pilot">Pilot</SelectItem>
                <SelectItem value="challenge">Challenge</SelectItem>
                <SelectItem value="solution">Solution</SelectItem>
                <SelectItem value="program">Program</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'All Actions', ar: 'كل الإجراءات' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Actions', ar: 'كل الإجراءات' })}</SelectItem>
                <SelectItem value="create">{t({ en: 'Create', ar: 'إنشاء' })}</SelectItem>
                <SelectItem value="update">{t({ en: 'Update', ar: 'تحديث' })}</SelectItem>
                <SelectItem value="delete">{t({ en: 'Delete', ar: 'حذف' })}</SelectItem>
                <SelectItem value="approve">{t({ en: 'Approve', ar: 'موافقة' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Activity Log', ar: 'سجل النشاط' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map(log => {
              const config = actionConfig[log.action] || actionConfig.update;
              const Icon = config.icon;

              return (
                <div key={log.id} className="p-4 border rounded-lg hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={`${config.bg} ${config.color}`}>
                            {config.label[language]}
                          </Badge>
                          <Badge variant="outline">{log.entity_type}</Badge>
                          <span className="text-sm text-slate-600">{log.timestamp}</span>
                        </div>
                        <p className="font-medium text-slate-900 mb-1">
                          {log.entity_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.user}
                          </span>
                          <span className="font-mono text-xs">{log.entity_id}</span>
                          <span className="text-xs text-slate-400">{log.ip_address}</span>
                        </div>
                        {log.changes && (
                          <div className="mt-2 p-2 bg-slate-50 rounded text-xs font-mono">
                            {Object.entries(log.changes).map(([key, value]) => (
                              <div key={key}>
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
            })}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}