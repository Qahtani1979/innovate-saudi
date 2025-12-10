import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2, Briefcase, FileText, Shield, Plus, Pencil, Trash2,
  Search, Check, X, Loader2, Users, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';

export default function LookupDataManager() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('departments');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch lookup data
  const { data: departments = [], isLoading: loadingDepts } = useQuery({
    queryKey: ['lookup-departments-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_departments')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: specializations = [], isLoading: loadingSpecs } = useQuery({
    queryKey: ['lookup-specializations-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_specializations')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: customEntries = [], isLoading: loadingCustom } = useQuery({
    queryKey: ['custom-entries-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: autoApprovalRules = [], isLoading: loadingRules } = useQuery({
    queryKey: ['auto-approval-rules-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auto_approval_rules')
        .select('*')
        .order('persona_type, priority');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    }
  });

  // Mutations
  const saveDepartmentMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { error } = await supabase
          .from('lookup_departments')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lookup_departments')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup-departments-admin']);
      toast.success(t({ en: 'Department saved', ar: 'تم حفظ القسم' }));
      setDialogOpen(false);
    },
    onError: () => toast.error(t({ en: 'Failed to save', ar: 'فشل في الحفظ' }))
  });

  const saveSpecializationMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { error } = await supabase
          .from('lookup_specializations')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lookup_specializations')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup-specializations-admin']);
      toast.success(t({ en: 'Specialization saved', ar: 'تم حفظ التخصص' }));
      setDialogOpen(false);
    },
    onError: () => toast.error(t({ en: 'Failed to save', ar: 'فشل في الحفظ' }))
  });

  const saveRuleMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { error } = await supabase
          .from('auto_approval_rules')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('auto_approval_rules')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['auto-approval-rules-admin']);
      toast.success(t({ en: 'Rule saved', ar: 'تم حفظ القاعدة' }));
      setDialogOpen(false);
    },
    onError: () => toast.error(t({ en: 'Failed to save', ar: 'فشل في الحفظ' }))
  });

  const reviewCustomEntryMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }) => {
      const { error } = await supabase
        .from('custom_entries')
        .update({
          status,
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;

      // If approved, add to the appropriate lookup table
      if (status === 'approved') {
        const entry = customEntries.find(e => e.id === id);
        if (entry) {
          const table = entry.entry_type === 'department' ? 'lookup_departments' : 'lookup_specializations';
          await supabase.from(table).insert({
            name_en: entry.name_en,
            name_ar: entry.name_ar,
            is_active: true,
            display_order: 99
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['custom-entries-admin']);
      queryClient.invalidateQueries(['lookup-departments-admin']);
      queryClient.invalidateQueries(['lookup-specializations-admin']);
      toast.success(t({ en: 'Entry reviewed', ar: 'تمت المراجعة' }));
    },
    onError: () => toast.error(t({ en: 'Failed to review', ar: 'فشل في المراجعة' }))
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ table, id }) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(t({ en: 'Deleted', ar: 'تم الحذف' }));
    },
    onError: () => toast.error(t({ en: 'Failed to delete', ar: 'فشل في الحذف' }))
  });

  const handleCreate = (type) => {
    setEditingItem({ type, isNew: true });
    setFormData({});
    setDialogOpen(true);
  };

  const handleEdit = (type, item) => {
    setEditingItem({ type, isNew: false, item });
    setFormData(item);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem.type === 'department') {
      saveDepartmentMutation.mutate(formData);
    } else if (editingItem.type === 'specialization') {
      saveSpecializationMutation.mutate(formData);
    } else if (editingItem.type === 'rule') {
      saveRuleMutation.mutate(formData);
    }
  };

  const filterItems = (items) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name_ar?.includes(searchTerm)
    );
  };

  const pendingEntries = customEntries.filter(e => e.status === 'pending');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Departments', ar: 'الأقسام' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{departments.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Specializations', ar: 'التخصصات' })}</p>
                <p className="text-3xl font-bold text-teal-600 mt-1">{specializations.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending Reviews', ar: 'المراجعات المعلقة' })}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{pendingEntries.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Auto-Approval Rules', ar: 'قواعد الموافقة التلقائية' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{autoApprovalRules.length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments">
            <Building2 className="h-4 w-4 mr-2" />
            {t({ en: 'Departments', ar: 'الأقسام' })}
          </TabsTrigger>
          <TabsTrigger value="specializations">
            <Briefcase className="h-4 w-4 mr-2" />
            {t({ en: 'Specializations', ar: 'التخصصات' })}
          </TabsTrigger>
          <TabsTrigger value="custom" className="relative">
            <FileText className="h-4 w-4 mr-2" />
            {t({ en: 'Custom Entries', ar: 'الإدخالات المخصصة' })}
            {pendingEntries.length > 0 && (
              <Badge className="ml-2 bg-amber-500">{pendingEntries.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Shield className="h-4 w-4 mr-2" />
            {t({ en: 'Auto-Approval', ar: 'الموافقة التلقائية' })}
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t({ en: 'Manage Departments', ar: 'إدارة الأقسام' })}</CardTitle>
              <Button onClick={() => handleCreate('department')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Department', ar: 'إضافة قسم' })}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t({ en: 'Search departments...', ar: 'بحث في الأقسام...' })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Code', ar: 'الرمز' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Order', ar: 'الترتيب' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Status', ar: 'الحالة' })}</th>
                      <th className="text-right px-4 py-3 text-sm font-medium">{t({ en: 'Actions', ar: 'الإجراءات' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterItems(departments).map((dept) => (
                      <tr key={dept.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3">{dept.name_en}</td>
                        <td className="px-4 py-3" dir="rtl">{dept.name_ar}</td>
                        <td className="px-4 py-3"><Badge variant="outline">{dept.code}</Badge></td>
                        <td className="px-4 py-3">{dept.display_order}</td>
                        <td className="px-4 py-3">
                          <Badge variant={dept.is_active ? 'default' : 'secondary'}>
                            {dept.is_active ? t({ en: 'Active', ar: 'نشط' }) : t({ en: 'Inactive', ar: 'غير نشط' })}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit('department', dept)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate({ table: 'lookup_departments', id: dept.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specializations Tab */}
        <TabsContent value="specializations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t({ en: 'Manage Specializations', ar: 'إدارة التخصصات' })}</CardTitle>
              <Button onClick={() => handleCreate('specialization')} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Specialization', ar: 'إضافة تخصص' })}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t({ en: 'Search specializations...', ar: 'بحث في التخصصات...' })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Category', ar: 'الفئة' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Status', ar: 'الحالة' })}</th>
                      <th className="text-right px-4 py-3 text-sm font-medium">{t({ en: 'Actions', ar: 'الإجراءات' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterItems(specializations).map((spec) => (
                      <tr key={spec.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3">{spec.name_en}</td>
                        <td className="px-4 py-3" dir="rtl">{spec.name_ar}</td>
                        <td className="px-4 py-3"><Badge variant="outline">{spec.category}</Badge></td>
                        <td className="px-4 py-3">
                          <Badge variant={spec.is_active ? 'default' : 'secondary'}>
                            {spec.is_active ? t({ en: 'Active', ar: 'نشط' }) : t({ en: 'Inactive', ar: 'غير نشط' })}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit('specialization', spec)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate({ table: 'lookup_specializations', id: spec.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Entries Tab */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Review Custom Entries', ar: 'مراجعة الإدخالات المخصصة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {customEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {t({ en: 'No custom entries submitted yet', ar: 'لا توجد إدخالات مخصصة حتى الآن' })}
                </div>
              ) : (
                <div className="space-y-4">
                  {customEntries.map((entry) => (
                    <Card key={entry.id} className={`border-l-4 ${
                      entry.status === 'pending' ? 'border-l-amber-500' :
                      entry.status === 'approved' ? 'border-l-green-500' :
                      'border-l-red-500'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{entry.entry_type}</Badge>
                              <Badge variant={
                                entry.status === 'pending' ? 'secondary' :
                                entry.status === 'approved' ? 'default' :
                                'destructive'
                              }>
                                {entry.status}
                              </Badge>
                            </div>
                            <p className="font-medium">{entry.name_en}</p>
                            {entry.name_ar && <p className="text-sm text-slate-600" dir="rtl">{entry.name_ar}</p>}
                            <p className="text-xs text-slate-500 mt-1">
                              {t({ en: 'Submitted by:', ar: 'مقدم من:' })} {entry.submitted_by_email}
                            </p>
                          </div>
                          {entry.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => reviewCustomEntryMutation.mutate({ 
                                  id: entry.id, 
                                  status: 'approved' 
                                })}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                {t({ en: 'Approve', ar: 'موافقة' })}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => reviewCustomEntryMutation.mutate({ 
                                  id: entry.id, 
                                  status: 'rejected' 
                                })}
                              >
                                <X className="h-4 w-4 mr-1" />
                                {t({ en: 'Reject', ar: 'رفض' })}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Approval Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t({ en: 'Auto-Approval Rules', ar: 'قواعد الموافقة التلقائية' })}</CardTitle>
              <Button onClick={() => handleCreate('rule')} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Rule', ar: 'إضافة قاعدة' })}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Persona Type', ar: 'نوع الشخصية' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Rule Type', ar: 'نوع القاعدة' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Rule Value', ar: 'قيمة القاعدة' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Assigns Role', ar: 'يعين الدور' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Priority', ar: 'الأولوية' })}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium">{t({ en: 'Status', ar: 'الحالة' })}</th>
                      <th className="text-right px-4 py-3 text-sm font-medium">{t({ en: 'Actions', ar: 'الإجراءات' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autoApprovalRules.map((rule) => (
                      <tr key={rule.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">{rule.persona_type}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={
                            rule.rule_type === 'always' ? 'bg-green-100 text-green-800' :
                            rule.rule_type === 'never' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {rule.rule_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{rule.rule_value || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{rule.role_to_assign}</Badge>
                        </td>
                        <td className="px-4 py-3">{rule.priority}</td>
                        <td className="px-4 py-3">
                          <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.is_active ? t({ en: 'Active', ar: 'نشط' }) : t({ en: 'Inactive', ar: 'غير نشط' })}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit('rule', rule)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate({ table: 'auto_approval_rules', id: rule.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2">{t({ en: 'Rule Types Explained', ar: 'شرح أنواع القواعد' })}</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li><strong>always:</strong> {t({ en: 'Auto-approve all users of this persona type', ar: 'الموافقة التلقائية لجميع المستخدمين من هذا النوع' })}</li>
                  <li><strong>never:</strong> {t({ en: 'Always require manual approval', ar: 'يتطلب دائماً موافقة يدوية' })}</li>
                  <li><strong>email_domain:</strong> {t({ en: 'Auto-approve if email domain matches (e.g., gov.sa)', ar: 'الموافقة التلقائية إذا تطابق نطاق البريد' })}</li>
                  <li><strong>organization:</strong> {t({ en: 'Auto-approve for specific organization', ar: 'الموافقة التلقائية لمنظمة محددة' })}</li>
                  <li><strong>institution:</strong> {t({ en: 'Auto-approve for institutional domains', ar: 'الموافقة التلقائية للنطاقات المؤسسية' })}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.isNew 
                ? t({ en: `Add ${editingItem?.type}`, ar: `إضافة ${editingItem?.type}` })
                : t({ en: `Edit ${editingItem?.type}`, ar: `تعديل ${editingItem?.type}` })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {(editingItem?.type === 'department' || editingItem?.type === 'specialization') && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })} *</label>
                  <Input 
                    value={formData.name_en || ''} 
                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}</label>
                  <Input 
                    value={formData.name_ar || ''} 
                    onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Code', ar: 'الرمز' })}</label>
                  <Input 
                    value={formData.code || ''} 
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., URBAN_PLAN"
                  />
                </div>
                {editingItem?.type === 'specialization' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Category', ar: 'الفئة' })}</label>
                    <Select value={formData.category || ''} onValueChange={(val) => setFormData({...formData, category: val})}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Display Order', ar: 'ترتيب العرض' })}</label>
                  <Input 
                    type="number" 
                    value={formData.display_order || 0} 
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.is_active !== false} 
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <label className="text-sm">{t({ en: 'Active', ar: 'نشط' })}</label>
                </div>
              </>
            )}

            {editingItem?.type === 'rule' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Persona Type', ar: 'نوع الشخصية' })} *</label>
                  <Select value={formData.persona_type || ''} onValueChange={(val) => setFormData({...formData, persona_type: val})}>
                    <SelectTrigger><SelectValue placeholder="Select persona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="municipality_staff">Municipality Staff</SelectItem>
                      <SelectItem value="provider">Provider</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Rule Type', ar: 'نوع القاعدة' })} *</label>
                  <Select value={formData.rule_type || ''} onValueChange={(val) => setFormData({...formData, rule_type: val})}>
                    <SelectTrigger><SelectValue placeholder="Select rule type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always (auto-approve all)</SelectItem>
                      <SelectItem value="never">Never (require approval)</SelectItem>
                      <SelectItem value="email_domain">Email Domain</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.rule_type === 'email_domain' || formData.rule_type === 'institution') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Domain Value', ar: 'قيمة النطاق' })}</label>
                    <Input 
                      value={formData.rule_value || ''} 
                      onChange={(e) => setFormData({...formData, rule_value: e.target.value})}
                      placeholder="e.g., gov.sa, ksu.edu.sa"
                    />
                  </div>
                )}
                {formData.persona_type === 'municipality_staff' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Municipality (optional)', ar: 'البلدية (اختياري)' })}</label>
                    <Select value={formData.municipality_id || ''} onValueChange={(val) => setFormData({...formData, municipality_id: val || null})}>
                      <SelectTrigger><SelectValue placeholder="All municipalities" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All municipalities</SelectItem>
                        {municipalities.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Role to Assign', ar: 'الدور المعين' })} *</label>
                  <Select value={formData.role_to_assign || ''} onValueChange={(val) => setFormData({...formData, role_to_assign: val})}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="municipality_staff">Municipality Staff</SelectItem>
                      <SelectItem value="municipality_coordinator">Municipality Coordinator</SelectItem>
                      <SelectItem value="municipality_admin">Municipality Admin</SelectItem>
                      <SelectItem value="provider">Provider</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Priority', ar: 'الأولوية' })}</label>
                  <Input 
                    type="number" 
                    value={formData.priority || 0} 
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-slate-500 mt-1">{t({ en: 'Higher priority rules are checked first', ar: 'يتم التحقق من القواعد ذات الأولوية الأعلى أولاً' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.is_active !== false} 
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <label className="text-sm">{t({ en: 'Active', ar: 'نشط' })}</label>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSave} disabled={saveDepartmentMutation.isPending || saveSpecializationMutation.isPending || saveRuleMutation.isPending}>
              {(saveDepartmentMutation.isPending || saveSpecializationMutation.isPending || saveRuleMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
