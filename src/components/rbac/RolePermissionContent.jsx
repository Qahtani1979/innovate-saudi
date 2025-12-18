import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { usePermissions } from '@/components/permissions/usePermissions';
import { toast } from 'sonner';
import PermissionTemplateManager from '@/components/access/PermissionTemplateManager';
import PermissionUsageAnalytics from '@/components/access/PermissionUsageAnalytics';
import DelegationApprovalQueue from '@/components/access/DelegationApprovalQueue';
import FieldSecurityRulesEditor from '@/components/access/FieldSecurityRulesEditor';
import PermissionTestingTool from '@/components/access/PermissionTestingTool';
import BulkRoleActions from '@/components/access/BulkRoleActions';
import RoleAuditDialog from '@/components/access/RoleAuditDialog';
import {
  Shield, Plus, Pencil, Trash2, Users, Lock, CheckCircle, Copy, TrendingUp, UserCheck, TestTube, Zap, BarChart3
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
  visibility: {
    label: { en: 'Data Visibility', ar: 'رؤية البيانات' },
    permissions: [
      { key: 'visibility_all_municipalities', label: { en: 'View All Municipalities Data', ar: 'عرض بيانات جميع البلديات' } },
      { key: 'visibility_all_sectors', label: { en: 'View All Sectors Data', ar: 'عرض بيانات جميع القطاعات' } },
      { key: 'visibility_national', label: { en: 'View National Level Data', ar: 'عرض البيانات الوطنية' } },
      { key: 'visibility_cross_region', label: { en: 'View Cross-Region Data', ar: 'عرض البيانات عبر المناطق' } },
    ]
  }
};

export default function RolePermissionContent() {
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
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*').order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userRolesCount = [] } = useQuery({
    queryKey: ['user-roles-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, roles:role_id(id, name)')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rolePermissionsData = [] } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('role_permissions').select('*, permissions(code)');
      if (error) throw error;
      return data || [];
    }
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data) => {
      const { data: newRole, error: roleError } = await supabase
        .from('roles')
        .insert({ name: data.name, description: data.description })
        .select()
        .single();
      if (roleError) throw roleError;

      if (data.permissions.length > 0) {
        const { data: permRecords } = await supabase
          .from('permissions')
          .select('id, code')
          .in('code', data.permissions);

        if (permRecords && permRecords.length > 0) {
          const rolePermInserts = permRecords.map(p => ({ role_id: newRole.id, permission_id: p.id }));
          await supabase.from('role_permissions').insert(rolePermInserts);
        }
      }
      return newRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['role-permissions']);
      setDialogOpen(false);
      setFormData({ name: '', description: '', permissions: [] });
      toast.success(t({ en: 'Role created', ar: 'تم إنشاء الدور' }));
    },
    onError: (error) => toast.error(error.message)
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error: roleError } = await supabase
        .from('roles')
        .update({ name: data.name, description: data.description })
        .eq('id', id);
      if (roleError) throw roleError;

      await supabase.from('role_permissions').delete().eq('role_id', id);

      if (data.permissions.length > 0) {
        const { data: permRecords } = await supabase
          .from('permissions')
          .select('id, code')
          .in('code', data.permissions);

        if (permRecords && permRecords.length > 0) {
          const rolePermInserts = permRecords.map(p => ({ role_id: id, permission_id: p.id }));
          await supabase.from('role_permissions').insert(rolePermInserts);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['role-permissions']);
      setDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: [] });
      toast.success(t({ en: 'Role updated', ar: 'تم تحديث الدور' }));
    },
    onError: (error) => toast.error(error.message)
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id) => {
      await supabase.from('role_permissions').delete().eq('role_id', id);
      await supabase.from('user_roles').update({ is_active: false }).eq('role_id', id);
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['role-permissions']);
      toast.success(t({ en: 'Role deleted', ar: 'تم حذف الدور' }));
    },
    onError: (error) => toast.error(error.message)
  });

  const getRolePermissions = (roleId) => {
    return rolePermissionsData.filter(rp => rp.role_id === roleId).map(rp => rp.permissions?.code).filter(Boolean);
  };

  const getRoleUserCount = (roleId) => userRolesCount.filter(ur => ur.role_id === roleId).length;

  const togglePermission = (permission) => {
    if (formData.permissions.includes(permission)) {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) });
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, permission] });
    }
  };

  const selectAllInCategory = (category) => {
    const categoryPerms = PERMISSION_CATEGORIES[category].permissions.map(p => p.key);
    const hasAll = categoryPerms.every(p => formData.permissions.includes(p));
    if (hasAll) {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => !categoryPerms.includes(p)) });
    } else {
      const newPerms = new Set([...formData.permissions, ...categoryPerms]);
      setFormData({ ...formData, permissions: Array.from(newPerms) });
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description || '', permissions: getRolePermissions(role.id) });
    setDialogOpen(true);
  };

  const handleClone = (role) => {
    setEditingRole(null);
    setFormData({ name: `${role.name} (Copy)`, description: role.description || '', permissions: getRolePermissions(role.id) });
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
    <div className="space-y-6">
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full">
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Roles', ar: 'الأدوار' })}</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Bulk', ar: 'جماعي' })}</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Templates', ar: 'القوالب' })}</span>
          </TabsTrigger>
          <TabsTrigger value="field-security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Field Security', ar: 'أمان الحقول' })}</span>
          </TabsTrigger>
          <TabsTrigger value="delegations" className="gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Delegations', ar: 'التفويضات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="testing" className="gap-2">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Testing', ar: 'الاختبار' })}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">{t({ en: 'Analytics', ar: 'التحليلات' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t({ en: 'Total Roles', ar: 'إجمالي الأدوار' })}</p>
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
                    <p className="text-sm text-muted-foreground">{t({ en: 'Total Users', ar: 'إجمالي المستخدمين' })}</p>
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
                    <p className="text-sm text-muted-foreground">{t({ en: 'Role Assignments', ar: 'تعيينات الأدوار' })}</p>
                    <p className="text-3xl font-bold text-pink-600">{userRolesCount.length}</p>
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
                  <div key={role.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-all">
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
                        {role.description && <p className="text-sm text-muted-foreground mb-3">{role.description}</p>}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            {getRolePermissions(role.id).length} {t({ en: 'permissions', ar: 'صلاحية' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {getRoleUserCount(role.id)} {t({ en: 'users', ar: 'مستخدم' })}
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
                            className="text-destructive"
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
                <TabsList className="grid grid-cols-4 mb-4">
                  {Object.keys(PERMISSION_CATEGORIES).slice(0, 4).map(cat => (
                    <TabsTrigger key={cat} value={cat} className="text-xs">
                      {PERMISSION_CATEGORIES[cat].label[language]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsList className="grid grid-cols-4 mb-4">
                  {Object.keys(PERMISSION_CATEGORIES).slice(4).map(cat => (
                    <TabsTrigger key={cat} value={cat} className="text-xs">
                      {PERMISSION_CATEGORIES[cat].label[language]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(PERMISSION_CATEGORIES).map(([catKey, category]) => (
                  <TabsContent key={catKey} value={catKey} className="space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{category.label[language]}</h4>
                      <Button variant="outline" size="sm" onClick={() => selectAllInCategory(catKey)}>
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
                            formData.permissions.includes(perm.key) ? 'bg-indigo-50 border-indigo-300' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => togglePermission(perm.key)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {formData.permissions.includes(perm.key) ? (
                                <CheckCircle className="h-4 w-4 text-indigo-600" />
                              ) : (
                                <div className="h-4 w-4 border-2 border-muted-foreground rounded" />
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

      <RoleAuditDialog roleId={auditRoleId} open={!!auditRoleId} onOpenChange={(open) => !open && setAuditRoleId(null)} />
    </div>
  );
}
