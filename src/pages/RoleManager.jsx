import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../components/LanguageContext';
import { Shield, Plus, Edit, Trash2, Users, Save, X, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function RoleManager() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const [roleForm, setRoleForm] = useState({
    name: '',
    code: '',
    description: '',
    permissions: {
      challenges: { create: false, read: true, update: false, delete: false },
      pilots: { create: false, read: true, update: false, delete: false },
      solutions: { create: false, read: true, update: false, delete: false },
      programs: { create: false, read: true, update: false, delete: false },
      municipalities: { create: false, read: true, update: false, delete: false },
      organizations: { create: false, read: true, update: false, delete: false }
    }
  });

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setShowDialog(false);
      resetForm();
      toast.success(t({ en: 'Role created', ar: 'تم إنشاء الدور' }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setShowDialog(false);
      setEditingRole(null);
      resetForm();
      toast.success(t({ en: 'Role updated', ar: 'تم تحديث الدور' }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      toast.success(t({ en: 'Role deleted', ar: 'تم حذف الدور' }));
    }
  });

  const resetForm = () => {
    setRoleForm({
      name: '',
      code: '',
      description: '',
      permissions: {
        challenges: { create: false, read: true, update: false, delete: false },
        pilots: { create: false, read: true, update: false, delete: false },
        solutions: { create: false, read: true, update: false, delete: false },
        programs: { create: false, read: true, update: false, delete: false },
        municipalities: { create: false, read: true, update: false, delete: false },
        organizations: { create: false, read: true, update: false, delete: false }
      }
    });
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setRoleForm(role);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: roleForm });
    } else {
      createMutation.mutate(roleForm);
    }
  };

  const handleAISuggest = async () => {
    const response = await invokeAI({
      prompt: `Based on this role: "${roleForm.name}" (${roleForm.description}), suggest appropriate permissions for a Saudi municipal innovation platform.
        
Entities: Challenges, Pilots, Solutions, Programs, Municipalities, Organizations.
Operations: create, read, update, delete.

Provide recommendations for which operations this role should have access to.`,
      response_json_schema: {
        type: 'object',
        properties: {
          permissions: {
            type: 'object',
            properties: {
              challenges: { type: 'object', properties: { create: { type: 'boolean' }, read: { type: 'boolean' }, update: { type: 'boolean' }, delete: { type: 'boolean' } } },
              pilots: { type: 'object', properties: { create: { type: 'boolean' }, read: { type: 'boolean' }, update: { type: 'boolean' }, delete: { type: 'boolean' } } },
              solutions: { type: 'object', properties: { create: { type: 'boolean' }, read: { type: 'boolean' }, update: { type: 'boolean' }, delete: { type: 'boolean' } } },
              programs: { type: 'object', properties: { create: { type: 'boolean' }, read: { type: 'boolean' }, update: { type: 'boolean' }, delete: { type: 'boolean' } } },
              municipalities: { type: 'object', properties: { create: { type: 'boolean' }, read: { type: 'boolean' }, update: { type: 'boolean' }, delete: { type: 'boolean' } } },
              organizations: { type: 'object', properties: { create: { type: 'boolean' }, read: { type: 'boolean' }, update: { type: 'boolean' }, delete: { type: 'boolean' } } }
            }
          }
        }
      }
    });
    if (response.success) {
      setRoleForm({ ...roleForm, permissions: response.data.permissions });
      toast.success(t({ en: 'AI suggestions applied', ar: 'تم تطبيق اقتراحات الذكاء' }));
    }
  };

  const entities = ['challenges', 'pilots', 'solutions', 'programs', 'municipalities', 'organizations'];
  const operations = ['create', 'read', 'update', 'delete'];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🛡️ Role & Permission Manager', ar: '🛡️ مدير الأدوار والصلاحيات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Define custom roles and granular permissions', ar: 'تعريف الأدوار المخصصة والصلاحيات التفصيلية' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{roles.length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total Roles', ar: 'إجمالي الأدوار' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{roles.filter(r => !r.is_system_role).length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Custom Roles', ar: 'أدوار مخصصة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{roles.filter(r => r.is_system_role).length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'System Roles', ar: 'أدوار النظام' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-600">{roles.reduce((sum, r) => sum + (r.user_count || 0), 0)}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Users Assigned', ar: 'مستخدمون معينون' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <Button onClick={() => { resetForm(); setShowDialog(true); }} className="bg-purple-600">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Create Role', ar: 'إنشاء دور' })}
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className={role.is_system_role ? 'border-2 border-blue-200 bg-blue-50/30' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                {role.is_system_role && (
                  <Badge className="bg-blue-600 text-white text-xs">System</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{role.description || 'No description'}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">{role.code}</Badge>
                <Badge className="bg-slate-100 text-slate-700">
                  <Users className="h-3 w-3 mr-1" />
                  {role.user_count || 0}
                </Badge>
              </div>
              <div className="pt-3 border-t flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(role)}
                  disabled={role.is_system_role}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm(t({ en: 'Delete this role?', ar: 'حذف هذا الدور؟' }))) {
                      deleteMutation.mutate(role.id);
                    }
                  }}
                  disabled={role.is_system_role || (role.user_count > 0)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingRole(null); resetForm(); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? t({ en: 'Edit Role', ar: 'تعديل الدور' }) : t({ en: 'Create Role', ar: 'إنشاء دور' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Role Name', ar: 'اسم الدور' })}</label>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="e.g., Municipality Reviewer"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Role Code', ar: 'رمز الدور' })}</label>
                <Input
                  value={roleForm.code}
                  onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., MUN_REVIEWER"
                  className="font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Description', ar: 'الوصف' })}</label>
              <Textarea
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div>
                <p className="font-semibold text-purple-900">{t({ en: 'AI Permission Suggester', ar: 'مقترح الصلاحيات الذكي' })}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Let AI recommend permissions based on role name', ar: 'دع الذكاء يوصي بالصلاحيات بناءً على اسم الدور' })}</p>
              </div>
              <Button onClick={handleAISuggest} disabled={!roleForm.name || aiLoading || !isAvailable} className="bg-purple-600">
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Suggest', ar: 'اقتراح' })}
              </Button>
            </div>

            <div>
              <h4 className="font-semibold mb-3">{t({ en: 'Permissions Matrix', ar: 'مصفوفة الصلاحيات' })}</h4>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">{t({ en: 'Entity', ar: 'الكيان' })}</TableHead>
                      <TableHead className="text-center">{t({ en: 'Create', ar: 'إنشاء' })}</TableHead>
                      <TableHead className="text-center">{t({ en: 'Read', ar: 'قراءة' })}</TableHead>
                      <TableHead className="text-center">{t({ en: 'Update', ar: 'تحديث' })}</TableHead>
                      <TableHead className="text-center">{t({ en: 'Delete', ar: 'حذف' })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entities.map((entity) => (
                      <TableRow key={entity}>
                        <TableCell className="font-medium capitalize">{entity.replace(/_/g, ' ')}</TableCell>
                        {operations.map((op) => (
                          <TableCell key={op} className="text-center">
                            <Checkbox
                              checked={roleForm.permissions[entity]?.[op] || false}
                              onCheckedChange={(checked) => {
                                setRoleForm({
                                  ...roleForm,
                                  permissions: {
                                    ...roleForm.permissions,
                                    [entity]: {
                                      ...roleForm.permissions[entity],
                                      [op]: checked
                                    }
                                  }
                                });
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditingRole(null); resetForm(); }}>
                <X className="h-4 w-4 mr-2" />
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button onClick={handleSubmit} disabled={!roleForm.name || !roleForm.code} className="bg-purple-600">
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Save Role', ar: 'حفظ الدور' })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}