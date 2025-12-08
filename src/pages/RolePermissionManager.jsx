import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../components/LanguageContext';
import { usePermissions } from '../components/permissions/usePermissions';
import { toast } from 'sonner';
import PermissionTemplateManager from '../components/access/PermissionTemplateManager';
import PermissionUsageAnalytics from '../components/access/PermissionUsageAnalytics';
import DelegationApprovalQueue from '../components/access/DelegationApprovalQueue';
import FieldSecurityRulesEditor from '../components/access/FieldSecurityRulesEditor';
import PermissionTestingTool from '../components/access/PermissionTestingTool';
import BulkRoleActions from '../components/access/BulkRoleActions';
import RoleAuditDialog from '../components/access/RoleAuditDialog';
import {
  Shield, Plus, Pencil, Trash2, Users, Lock, CheckCircle, AlertCircle, Copy, TrendingUp, Key, UserCheck, TestTube, Zap, BarChart3
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import ProtectedPage from '../components/permissions/ProtectedPage';

const PERMISSION_CATEGORIES = {
  challenges: {
    label: { en: 'Challenges', ar: 'التحديات' },
    permissions: [
      { key: 'challenge_create', label: { en: 'Create Challenge', ar: 'إنشاء تحدي' } },
      { key: 'challenge_edit', label: { en: 'Edit Challenge', ar: 'تعديل تحدي' } },
      { key: 'challenge_delete', label: { en: 'Delete Challenge', ar: 'حذف تحدي' } },
      { key: 'challenge_view_all', label: { en: 'View All Challenges', ar: 'عرض جميع التحديات' } },
      { key: 'challenge_approve', label: { en: 'Approve Challenge', ar: 'الموافقة على التحديات' } },
      { key: 'challenge_publish', label: { en: 'Publish Challenge', ar: 'نشر التحديات' } },
    ]
  },
  solutions: {
    label: { en: 'Solutions', ar: 'الحلول' },
    permissions: [
      { key: 'solution_create', label: { en: 'Create Solution', ar: 'إنشاء حل' } },
      { key: 'solution_edit', label: { en: 'Edit Solution', ar: 'تعديل حل' } },
      { key: 'solution_delete', label: { en: 'Delete Solution', ar: 'حذف حل' } },
      { key: 'solution_view_all', label: { en: 'View All Solutions', ar: 'عرض جميع الحلول' } },
      { key: 'solution_verify', label: { en: 'Verify Solution', ar: 'التحقق من الحلول' } },
    ]
  },
  pilots: {
    label: { en: 'Pilots', ar: 'التجارب' },
    permissions: [
      { key: 'pilot_create', label: { en: 'Create Pilot', ar: 'إنشاء تجربة' } },
      { key: 'pilot_edit', label: { en: 'Edit Pilot', ar: 'تعديل تجربة' } },
      { key: 'pilot_delete', label: { en: 'Delete Pilot', ar: 'حذف تجربة' } },
      { key: 'pilot_view_all', label: { en: 'View All Pilots', ar: 'عرض جميع التجارب' } },
      { key: 'pilot_approve', label: { en: 'Approve Pilot', ar: 'الموافقة على التجارب' } },
      { key: 'pilot_monitor', label: { en: 'Monitor Pilot KPIs', ar: 'مراقبة مؤشرات التجارب' } },
      { key: 'pilot_evaluate', label: { en: 'Evaluate Pilot', ar: 'تقييم التجارب' } },
    ]
  },
  rd: {
    label: { en: 'R&D', ar: 'البحث والتطوير' },
    permissions: [
      { key: 'rd_create', label: { en: 'Create R&D Project', ar: 'إنشاء مشروع بحث' } },
      { key: 'rd_edit', label: { en: 'Edit R&D Project', ar: 'تعديل مشروع بحث' } },
      { key: 'rd_delete', label: { en: 'Delete R&D Project', ar: 'حذف مشروع بحث' } },
      { key: 'rd_view_all', label: { en: 'View All R&D', ar: 'عرض جميع المشاريع' } },
      { key: 'rd_call_manage', label: { en: 'Manage R&D Calls', ar: 'إدارة دعوات البحث' } },
    ]
  },
  programs: {
    label: { en: 'Programs', ar: 'البرامج' },
    permissions: [
      { key: 'program_create', label: { en: 'Create Program', ar: 'إنشاء برنامج' } },
      { key: 'program_edit', label: { en: 'Edit Program', ar: 'تعديل برنامج' } },
      { key: 'program_delete', label: { en: 'Delete Program', ar: 'حذف برنامج' } },
      { key: 'program_view_all', label: { en: 'View All Programs', ar: 'عرض جميع البرامج' } },
      { key: 'program_evaluate', label: { en: 'Evaluate Applications', ar: 'تقييم الطلبات' } },
    ]
  },
  organizations: {
    label: { en: 'Organizations', ar: 'المنظمات' },
    permissions: [
      { key: 'org_create', label: { en: 'Create Organization', ar: 'إنشاء منظمة' } },
      { key: 'org_edit', label: { en: 'Edit Organization', ar: 'تعديل منظمة' } },
      { key: 'org_delete', label: { en: 'Delete Organization', ar: 'حذف منظمة' } },
      { key: 'org_view_all', label: { en: 'View All Organizations', ar: 'عرض جميع المنظمات' } },
      { key: 'org_verify', label: { en: 'Verify Organization', ar: 'التحقق من المنظمات' } },
    ]
  },
  data: {
    label: { en: 'Data Management', ar: 'إدارة البيانات' },
    permissions: [
      { key: 'region_manage', label: { en: 'Manage Regions', ar: 'إدارة المناطق' } },
      { key: 'city_manage', label: { en: 'Manage Cities', ar: 'إدارة المدن' } },
      { key: 'data_import', label: { en: 'Import Data', ar: 'استيراد البيانات' } },
      { key: 'data_export', label: { en: 'Export Data', ar: 'تصدير البيانات' } },
      { key: 'data_bulk_edit', label: { en: 'Bulk Edit', ar: 'التعديل الجماعي' } },
    ]
  },
  reports: {
    label: { en: 'Reports & Analytics', ar: 'التقارير والتحليلات' },
    permissions: [
      { key: 'reports_view', label: { en: 'View Reports', ar: 'عرض التقارير' } },
      { key: 'reports_export', label: { en: 'Export Reports', ar: 'تصدير التقارير' } },
      { key: 'analytics_view', label: { en: 'View Analytics', ar: 'عرض التحليلات' } },
      { key: 'mii_view', label: { en: 'View MII Data', ar: 'عرض بيانات المؤشر' } },
    ]
  },
  users: {
    label: { en: 'User Management', ar: 'إدارة المستخدمين' },
    permissions: [
      { key: 'user_invite', label: { en: 'Invite Users', ar: 'دعوة مستخدمين' } },
      { key: 'user_edit', label: { en: 'Edit Users', ar: 'تعديل المستخدمين' } },
      { key: 'user_delete', label: { en: 'Delete Users', ar: 'حذف المستخدمين' } },
      { key: 'user_view_all', label: { en: 'View All Users', ar: 'عرض جميع المستخدمين' } },
      { key: 'role_manage', label: { en: 'Manage Roles', ar: 'إدارة الأدوار' } },
      { key: 'team_manage', label: { en: 'Manage Teams', ar: 'إدارة الفرق' } },
    ]
  },
  system: {
    label: { en: 'System Admin', ar: 'إدارة النظام' },
    permissions: [
      { key: 'system_config', label: { en: 'System Configuration', ar: 'تكوين النظام' } },
      { key: 'audit_view', label: { en: 'View Audit Logs', ar: 'عرض سجلات التدقيق' } },
      { key: 'backup_manage', label: { en: 'Manage Backups', ar: 'إدارة النسخ الاحتياطي' } },
      { key: 'integration_manage', label: { en: 'Manage Integrations', ar: 'إدارة التكاملات' } },
    ]
  },
  citizen: {
    label: { en: 'Citizen Engagement', ar: 'مشاركة المواطنين' },
    permissions: [
      { key: 'citizen_idea_submit', label: { en: 'Submit Ideas', ar: 'إرسال الأفكار' } },
      { key: 'citizen_idea_vote', label: { en: 'Vote on Ideas', ar: 'التصويت على الأفكار' } },
      { key: 'citizen_idea_comment', label: { en: 'Comment on Ideas', ar: 'التعليق على الأفكار' } },
      { key: 'citizen_feedback_submit', label: { en: 'Submit Feedback', ar: 'إرسال الملاحظات' } },
      { key: 'citizen_dashboard_view', label: { en: 'View Dashboard', ar: 'عرض لوحة التحكم' } },
      { key: 'idea_moderate', label: { en: 'Moderate Ideas', ar: 'مراجعة الأفكار' } },
      { key: 'comment_moderate', label: { en: 'Moderate Comments', ar: 'مراجعة التعليقات' } },
      { key: 'vote_fraud_manage', label: { en: 'Manage Vote Fraud', ar: 'إدارة التلاعب بالتصويت' } },
      { key: 'citizen_engagement_analytics', label: { en: 'View Engagement Analytics', ar: 'عرض تحليلات المشاركة' } },
      { key: 'idea_evaluate', label: { en: 'Evaluate Ideas', ar: 'تقييم الأفكار' } },
      { key: 'idea_convert', label: { en: 'Convert Ideas', ar: 'تحويل الأفكار' } },
      { key: 'idea_respond', label: { en: 'Respond to Citizens', ar: 'الرد على المواطنين' } },
      { key: 'innovation_proposal_manage', label: { en: 'Manage Innovation Proposals', ar: 'إدارة مقترحات الابتكار' } },
    ]
  },
  policy: {
    label: { en: 'Policy Management', ar: 'إدارة السياسات' },
    permissions: [
      { key: 'create_policy', label: { en: 'Create Policy', ar: 'إنشاء سياسة' } },
      { key: 'edit_own_policy', label: { en: 'Edit Own Policy', ar: 'تعديل سياستي' } },
      { key: 'submit_for_review', label: { en: 'Submit for Review', ar: 'إرسال للمراجعة' } },
      { key: 'review_legal', label: { en: 'Legal Review', ar: 'مراجعة قانونية' } },
      { key: 'approve_legal_review', label: { en: 'Approve Legal Review', ar: 'الموافقة القانونية' } },
      { key: 'approve_council', label: { en: 'Council Approval', ar: 'موافقة المجلس' } },
      { key: 'vote_on_policy', label: { en: 'Vote on Policy', ar: 'التصويت على السياسة' } },
      { key: 'approve_ministry', label: { en: 'Ministry Approval', ar: 'موافقة الوزارة' } },
      { key: 'publish_policy', label: { en: 'Publish Policy', ar: 'نشر السياسة' } },
      { key: 'update_implementation', label: { en: 'Update Implementation', ar: 'تحديث التنفيذ' } },
      { key: 'track_adoption', label: { en: 'Track Adoption', ar: 'تتبع التبني' } },
      { key: 'edit_implementation_data', label: { en: 'Edit Implementation Data', ar: 'تعديل بيانات التنفيذ' } },
      { key: 'view_all_policies', label: { en: 'View All Policies', ar: 'عرض جميع السياسات' } },
      { key: 'view_own_policies', label: { en: 'View Own Policies', ar: 'عرض سياساتي' } },
      { key: 'view_sensitive_data', label: { en: 'View Sensitive Data', ar: 'عرض البيانات الحساسة' } },
    ]
  }
};

function RolePermissionManager() {
  const { language, isRTL, t } = useLanguage();
  const { isAdmin, hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] });
  const [selectedCategory, setSelectedCategory] = useState('challenges');
  const [auditRoleId, setAuditRoleId] = useState(null);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const createRoleMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setDialogOpen(false);
      setFormData({ name: '', description: '', permissions: [] });
      toast.success(t({ en: 'Role created', ar: 'تم إنشاء الدور' }));
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: [] });
      toast.success(t({ en: 'Role updated', ar: 'تم تحديث الدور' }));
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      toast.success(t({ en: 'Role deleted', ar: 'تم حذف الدور' }));
    }
  });

  const togglePermission = (permission) => {
    if (formData.permissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permission)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission]
      });
    }
  };

  const selectAllInCategory = (category) => {
    const categoryPerms = PERMISSION_CATEGORIES[category].permissions.map(p => p.key);
    const hasAll = categoryPerms.every(p => formData.permissions.includes(p));
    
    if (hasAll) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => !categoryPerms.includes(p))
      });
    } else {
      const newPerms = new Set([...formData.permissions, ...categoryPerms]);
      setFormData({
        ...formData,
        permissions: Array.from(newPerms)
      });
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setDialogOpen(true);
  };

  const handleClone = (role) => {
    setEditingRole(null);
    setFormData({
      name: `${role.name} (Copy)`,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createRoleMutation.mutate(formData);
    }
  };

  if (!isAdmin && !hasPermission('role_manage')) {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            {t({ en: 'You do not have permission to manage roles', ar: 'ليس لديك صلاحية لإدارة الأدوار' })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'Role & Permission Manager', ar: 'إدارة الأدوار والصلاحيات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Complete RBAC system with field-level security and delegation', ar: 'نظام RBAC كامل مع أمان مستوى الحقل والتفويض' })}
        </p>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full">
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            {t({ en: 'Roles', ar: 'الأدوار' })}
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Zap className="h-4 w-4" />
            {t({ en: 'Bulk', ar: 'جماعي' })}
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Copy className="h-4 w-4" />
            {t({ en: 'Templates', ar: 'القوالب' })}
          </TabsTrigger>
          <TabsTrigger value="field-security" className="gap-2">
            <Lock className="h-4 w-4" />
            {t({ en: 'Field Security', ar: 'أمان الحقول' })}
          </TabsTrigger>
          <TabsTrigger value="delegations" className="gap-2">
            <UserCheck className="h-4 w-4" />
            {t({ en: 'Delegations', ar: 'التفويضات' })}
          </TabsTrigger>
          <TabsTrigger value="testing" className="gap-2">
            <TestTube className="h-4 w-4" />
            {t({ en: 'Testing', ar: 'الاختبار' })}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t({ en: 'Analytics', ar: 'التحليلات' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t({ en: 'Total Roles', ar: 'إجمالي الأدوار' })}</p>
                    <p className="text-3xl font-bold text-indigo-600">{roles.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t({ en: 'Total Users', ar: 'إجمالي المستخدمين' })}</p>
                    <p className="text-3xl font-bold text-purple-600">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t({ en: 'System Roles', ar: 'أدوار النظام' })}</p>
                    <p className="text-3xl font-bold text-pink-600">
                      {roles.filter(r => r.is_system_role).length}
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-pink-600" />
                </div>
              </CardContent>
            </Card>
          </div>



          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t({ en: 'Roles', ar: 'الأدوار' })}</CardTitle>
                <Button onClick={() => { setEditingRole(null); setFormData({ name: '', description: '', permissions: [] }); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Create Role', ar: 'إنشاء دور' })}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{role.name}</h3>
                          {role.is_system_role && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              {t({ en: 'System', ar: 'نظام' })}
                            </Badge>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-sm text-slate-600 mb-3">{role.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            {role.permissions?.length || 0} {t({ en: 'permissions', ar: 'صلاحية' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {users.filter(u => u.assigned_roles?.includes(role.id)).length} {t({ en: 'users', ar: 'مستخدم' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setAuditRoleId(role.id)}>
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleClone(role)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!role.is_system_role && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(t({ en: 'Delete this role?', ar: 'حذف هذا الدور؟' }))) {
                                deleteRoleMutation.mutate(role.id);
                              }
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <BulkRoleActions roles={roles} users={users} />
        </TabsContent>

        <TabsContent value="templates">
          <PermissionTemplateManager />
        </TabsContent>

        <TabsContent value="field-security">
          <FieldSecurityRulesEditor />
        </TabsContent>

        <TabsContent value="delegations">
          <DelegationApprovalQueue />
        </TabsContent>

        <TabsContent value="testing">
          <PermissionTestingTool />
        </TabsContent>

        <TabsContent value="analytics">
          <PermissionUsageAnalytics />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? t({ en: 'Edit Role', ar: 'تعديل الدور' }) : t({ en: 'Create Role', ar: 'إنشاء دور' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Role Name', ar: 'اسم الدور' })}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t({ en: 'Enter role name...', ar: 'أدخل اسم الدور...' })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Description', ar: 'الوصف' })}</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder={t({ en: 'Enter role description...', ar: 'أدخل وصف الدور...' })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">
                  {t({ en: 'Permissions', ar: 'الصلاحيات' })} ({formData.permissions.length})
                </label>
                <Badge>{formData.permissions.length} {t({ en: 'selected', ar: 'محدد' })}</Badge>
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid grid-cols-3 lg:grid-cols-5 mb-4">
                  {Object.keys(PERMISSION_CATEGORIES).slice(0, 5).map(cat => (
                    <TabsTrigger key={cat} value={cat} className="text-xs">
                      {PERMISSION_CATEGORIES[cat].label[language]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsList className="grid grid-cols-3 lg:grid-cols-4 mb-4">
                  {Object.keys(PERMISSION_CATEGORIES).slice(5).map(cat => (
                    <TabsTrigger key={cat} value={cat} className="text-xs">
                      {PERMISSION_CATEGORIES[cat].label[language]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(PERMISSION_CATEGORIES).map(([catKey, category]) => (
                  <TabsContent key={catKey} value={catKey} className="space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{category.label[language]}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllInCategory(catKey)}
                      >
                        {category.permissions.every(p => formData.permissions.includes(p.key)) ?
                          t({ en: 'Deselect All', ar: 'إلغاء الكل' }) :
                          t({ en: 'Select All', ar: 'تحديد الكل' })}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.permissions.map((perm) => (
                        <div
                          key={perm.key}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            formData.permissions.includes(perm.key) ?
                            'bg-indigo-50 border-indigo-300' :
                            'hover:bg-slate-50'
                          }`}
                          onClick={() => togglePermission(perm.key)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {formData.permissions.includes(perm.key) ? (
                                <CheckCircle className="h-4 w-4 text-indigo-600" />
                              ) : (
                                <div className="h-4 w-4 border-2 border-slate-300 rounded" />
                              )}
                              <span className="text-sm font-medium">{perm.label[language]}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || createRoleMutation.isPending || updateRoleMutation.isPending}>
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RoleAuditDialog 
        roleId={auditRoleId} 
        open={!!auditRoleId} 
        onOpenChange={(open) => !open && setAuditRoleId(null)} 
      />
    </div>
  );
}

export default ProtectedPage(RolePermissionManager, {
  requiredPermissions: ['role_manage']
});