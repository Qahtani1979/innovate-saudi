import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import BulkUserImport from '../components/access/BulkUserImport';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from '../components/LanguageContext';
import { toast } from 'sonner';
import PermissionSelector from '../components/permissions/PermissionSelector';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import {
  Users, Shield, UserPlus, Plus, Pencil, Trash2, Search, Loader2, Mail, Settings,
  Award, Briefcase, Filter, User, Sparkles, RefreshCw, X, Send, Clock, CheckCircle2, AlertCircle, Upload
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function UserManagementHub() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);
  const { user: currentUser } = useAuth();
  const { invokeAI, isLoading: aiLoading, isAvailable } = useAIWithFallback();
  
  // Directory filters
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Bulk invite state
  const [bulkEmails, setBulkEmails] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', role: 'user', custom_message: '' });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await supabase.from('roles').select('*');
      return data || [];
    }
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await supabase.from('teams').select('*');
      return data || [];
    }
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data } = await supabase.from('user_invitations').select('*');
      return data || [];
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await supabase.from('user_profiles').select('*');
      return data || [];
    }
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['user-activities'],
    queryFn: async () => {
      const { data } = await supabase.from('user_activities').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  useEffect(() => {
    if (currentUser && !currentUser.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [currentUser]);

  const createMutation = useMutation({
    mutationFn: async ({ entity, data }) => {
      const tableName = entity === 'Role' ? 'roles' : entity === 'Team' ? 'teams' : 'user_invitations';
      return supabase.from(tableName).insert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setDialogOpen(false);
      setFormData({});
      toast.success(t({ en: 'Created successfully', ar: 'تم الإنشاء بنجاح' }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ entity, id, data }) => {
      const tableName = entity === 'Role' ? 'roles' : entity === 'Team' ? 'teams' : 'user_profiles';
      return supabase.from(tableName).update(data).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setDialogOpen(false);
      setSelectedEntity(null);
      setFormData({});
      toast.success(t({ en: 'Updated successfully', ar: 'تم التحديث بنجاح' }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ entity, id }) => {
      const tableName = entity === 'Role' ? 'roles' : entity === 'Team' ? 'teams' : 'user_invitations';
      return supabase.from(tableName).delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(t({ en: 'Deleted successfully', ar: 'تم الحذف بنجاح' }));
    }
  });

  // Bulk invite mutation (migrated from UserInvitationManager)
  const bulkInviteMutation = useMutation({
    mutationFn: async ({ emails, role, message }) => {
      const emailList = emails.split('\n').map(e => e.trim()).filter(e => e);
      const invites = emailList.map(email => ({
        email,
        role,
        custom_message: message,
        invited_by: currentUser?.email || 'admin',
        invitation_token: Math.random().toString(36).substring(7),
        expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      const { error } = await supabase.from('user_invitations').insert(invites);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['invitations']);
      setBulkEmails('');
      setShowBulkDialog(false);
      toast.success(t({ en: 'Bulk invitations sent', ar: 'تم إرسال الدعوات الجماعية' }));
    }
  });

  const resendInviteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('user_invitations').update({ 
        status: 'pending',
        expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['invitations']);
      toast.success(t({ en: 'Invitation resent', ar: 'تم إعادة إرسال الدعوة' }));
    }
  });

  const cancelInviteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('user_invitations').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['invitations']);
      toast.success(t({ en: 'Invitation cancelled', ar: 'تم إلغاء الدعوة' }));
    }
  });

  // Derived data for directory filters (migrated from UserDirectory)
  const allSkills = [...new Set(users.flatMap(u => u.skills || []))];
  const allDepartments = [...new Set(users.map(u => u.department).filter(Boolean))];

  // Filter users for directory view
  const filteredDirectoryUsers = users.filter(user => {
    const searchMatch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const skillMatch = !skillFilter || user.skills?.includes(skillFilter);
    const deptMatch = !departmentFilter || user.department === departmentFilter;
    return searchMatch && skillMatch && deptMatch;
  });

  // AI permission suggester (migrated from RoleManager)
  const handleAISuggestPermissions = async () => {
    if (!formData.name) {
      toast.error(t({ en: 'Please enter role name first', ar: 'يرجى إدخال اسم الدور أولاً' }));
      return;
    }
    const response = await invokeAI({
      prompt: `Based on this role: "${formData.name}" (${formData.description || ''}), suggest appropriate permissions for a Saudi municipal innovation platform.
        
Common permissions: challenge_create, challenge_edit, challenge_view_all, pilot_create, pilot_edit, pilot_view_all, solution_create, solution_view_all, program_view_all, reports_view, analytics_view, user_invite, role_manage, team_manage.

Return a list of permission codes this role should have.`,
      response_json_schema: {
        type: 'object',
        properties: {
          permissions: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    if (response.success && response.data?.permissions) {
      setFormData({ ...formData, permissions: response.data.permissions });
      toast.success(t({ en: 'AI suggestions applied', ar: 'تم تطبيق اقتراحات الذكاء' }));
    }
  };

  const handleCreate = (entity) => {
    setSelectedEntity({ entity, mode: 'create' });
    setFormData({});
    setDialogOpen(true);
  };

  const handleEdit = (entity, item) => {
    setSelectedEntity({ entity, mode: 'edit', id: item.id });
    setFormData(item);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (selectedEntity.mode === 'create') {
      createMutation.mutate({ entity: selectedEntity.entity, data: formData });
    } else {
      updateMutation.mutate({ entity: selectedEntity.entity, id: selectedEntity.id, data: formData });
    }
  };

  const EntityTable = ({ data, entity, columns, onEdit, onDelete, filters }) => {
    const [localSearch, setLocalSearch] = useState('');
    const [localFilters, setLocalFilters] = useState({});

    const filtered = data.filter(item => {
      const searchMatch = !localSearch || Object.values(item).some(val => 
        String(val).toLowerCase().includes(localSearch.toLowerCase())
      );

      const filtersMatch = !filters || filters.every(filter => {
        if (!localFilters[filter.key]) return true;
        if (filter.key === 'role' || filter.key === 'status') {
          return item[filter.key] === localFilters[filter.key];
        }
        return true;
      });

      return searchMatch && filtersMatch;
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search...', ar: 'بحث...' })}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
          
          {filters?.map(filter => (
            <Select 
              key={filter.key} 
              value={localFilters[filter.key] || ''} 
              onValueChange={(val) => setLocalFilters({...localFilters, [filter.key]: val})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.label[language]} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All</SelectItem>
                {filter.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <Button onClick={() => handleCreate(entity)} className="bg-gradient-to-r from-blue-600 to-teal-600">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Add New', ar: 'إضافة جديد' })}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                    {col.label[language]}
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-sm font-medium text-slate-700">
                  {t({ en: 'Actions', ar: 'الإجراءات' })}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm text-slate-700">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {entity !== 'UserInvitation' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(entity, item)}
                          className="hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(entity, item.id)}
                        className="hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 text-center">
          {t({ en: `${filtered.length} of ${data.length} items`, ar: `${filtered.length} من ${data.length} عنصر` })}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {showOnboarding && currentUser && (
        <OnboardingWizard 
          user={currentUser} 
          onComplete={() => setShowOnboarding(false)} 
        />
      )}

      {currentUser && currentUser.onboarding_completed && showChecklist && (
        <OnboardingChecklist 
          user={currentUser} 
          onDismiss={() => setShowChecklist(false)} 
        />
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'User Management Hub', ar: 'مركز إدارة المستخدمين' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Manage user invitations, teams, roles, and permissions', ar: 'إدارة دعوات المستخدمين والفرق والأدوار والصلاحيات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Users', ar: 'المستخدمون النشطون' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{users.filter(u => u.is_active !== false).length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Invitations', ar: 'الدعوات' })}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{invitations.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Teams', ar: 'الفرق' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{teams.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Roles', ar: 'الأدوار' })}</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{roles.length}</p>
              </div>
              <Shield className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            {t({ en: 'Users', ar: 'المستخدمون' })}
          </TabsTrigger>
          <TabsTrigger value="directory">
            <User className="h-4 w-4 mr-2" />
            {t({ en: 'Directory', ar: 'الدليل' })}
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <UserPlus className="h-4 w-4 mr-2" />
            {t({ en: 'Invitations', ar: 'الدعوات' })}
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="h-4 w-4 mr-2" />
            {t({ en: 'Teams', ar: 'الفرق' })}
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            {t({ en: 'Roles', ar: 'الأدوار' })}
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Settings className="h-4 w-4 mr-2" />
            {t({ en: 'Activity', ar: 'النشاط' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {t({ en: 'User Management', ar: 'إدارة المستخدمين' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityTable
                data={users}
                entity="User"
                columns={[
                  { key: 'full_name', label: { en: 'Name', ar: 'الاسم' } },
                  { key: 'email', label: { en: 'Email', ar: 'البريد' } },
                  { key: 'job_title', label: { en: 'Job Title', ar: 'المسمى' } },
                  { 
                    key: 'role', 
                    label: { en: 'Role', ar: 'الدور' },
                    render: (item) => <Badge>{item.role}</Badge>
                  },
                  { 
                    key: 'assigned_teams', 
                    label: { en: 'Teams', ar: 'الفرق' },
                    render: (item) => <Badge variant="outline">{item.assigned_teams?.length || 0}</Badge>
                  },
                ]}
                filters={[
                  { 
                    key: 'role', 
                    label: { en: 'Role', ar: 'الدور' },
                    options: [
                      { value: 'admin', label: 'Admin' },
                      { value: 'user', label: 'User' }
                    ]
                  }
                ]}
                onEdit={handleEdit}
                onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Directory Tab - Migrated from UserDirectory */}
        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                {t({ en: 'User Directory', ar: 'دليل المستخدمين' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="pt-4 text-center">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Total Users', ar: 'إجمالي المستخدمين' })}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white">
                  <CardContent className="pt-4 text-center">
                    <Award className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{allSkills.length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Unique Skills', ar: 'مهارات فريدة' })}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white">
                  <CardContent className="pt-4 text-center">
                    <Briefcase className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{allDepartments.length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Departments', ar: 'الإدارات' })}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white">
                  <CardContent className="pt-4 text-center">
                    <Filter className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-orange-600">{filteredDirectoryUsers.length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Filtered', ar: 'مفلتر' })}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
                  <Input
                    placeholder={t({ en: 'Search by name, email, title...', ar: 'ابحث بالاسم، البريد، المسمى...' })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                  />
                </div>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Filter by skill', ar: 'تصفية بالمهارة' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Skills</SelectItem>
                    {allSkills.sort().map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Filter by department', ar: 'تصفية بالإدارة' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {allDepartments.sort().map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setSkillFilter(''); setDepartmentFilter(''); }}>
                  {t({ en: 'Clear Filters', ar: 'مسح الفلاتر' })}
                </Button>
              </div>

              {/* User Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDirectoryUsers.slice(0, 30).map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{user.full_name}</h3>
                          <p className="text-sm text-slate-600 truncate">{user.job_title || user.role}</p>
                          {user.department && <p className="text-xs text-slate-500 truncate">{user.department}</p>}
                        </div>
                      </div>
                      {user.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                          {user.skills.length > 3 && <Badge variant="outline" className="text-xs">+{user.skills.length - 3}</Badge>}
                        </div>
                      )}
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link to={createPageUrl(`UserProfile?email=${user.email}`)}>
                            {t({ en: 'View', ar: 'عرض' })}
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${user.email}`}><Mail className="h-4 w-4" /></a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-amber-600" />
                {t({ en: 'User Invitations', ar: 'دعوات المستخدمين' })}
              </CardTitle>
              <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    {t({ en: 'Bulk Invite', ar: 'دعوة جماعية' })}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t({ en: 'Bulk User Invitation', ar: 'دعوة مستخدمين جماعية' })}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t({ en: 'Email Addresses (one per line)', ar: 'عناوين البريد (واحد لكل سطر)' })}
                      </label>
                      <Textarea
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                        placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {bulkEmails.split('\n').filter(e => e.trim()).length} {t({ en: 'emails', ar: 'بريد' })}
                      </p>
                    </div>
                    <Button
                      onClick={() => bulkInviteMutation.mutate({ emails: bulkEmails, role: 'user', message: '' })}
                      disabled={!bulkEmails || bulkInviteMutation.isPending}
                      className="w-full bg-purple-600"
                    >
                      {bulkInviteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {t({ en: 'Send Bulk Invitations', ar: 'إرسال دعوات جماعية' })}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Invitation Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <Card className="bg-blue-50">
                  <CardContent className="pt-4 text-center">
                    <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-blue-600">{invitations.filter(i => i.status === 'pending').length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Pending', ar: 'معلقة' })}</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="pt-4 text-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-green-600">{invitations.filter(i => i.status === 'accepted').length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Accepted', ar: 'مقبولة' })}</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="pt-4 text-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-red-600">{invitations.filter(i => i.status === 'expired').length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Expired', ar: 'منتهية' })}</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50">
                  <CardContent className="pt-4 text-center">
                    <UserPlus className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-purple-600">
                      {invitations.length > 0 ? Math.round((invitations.filter(i => i.status === 'accepted').length / invitations.length) * 100) : 0}%
                    </p>
                    <p className="text-xs text-slate-600">{t({ en: 'Rate', ar: 'معدل' })}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Invitations Table with Resend/Cancel Actions */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>{t({ en: 'Email', ar: 'البريد' })}</TableHead>
                    <TableHead>{t({ en: 'Name', ar: 'الاسم' })}</TableHead>
                    <TableHead>{t({ en: 'Role', ar: 'الدور' })}</TableHead>
                    <TableHead>{t({ en: 'Status', ar: 'الحالة' })}</TableHead>
                    <TableHead>{t({ en: 'Date', ar: 'التاريخ' })}</TableHead>
                    <TableHead className="text-right">{t({ en: 'Actions', ar: 'الإجراءات' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{inv.email}</TableCell>
                      <TableCell>{inv.full_name || '-'}</TableCell>
                      <TableCell><Badge variant="outline">{inv.role}</Badge></TableCell>
                      <TableCell>
                        <Badge className={
                          inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          inv.status === 'expired' ? 'bg-red-100 text-red-700' :
                          inv.status === 'cancelled' ? 'bg-slate-100 text-slate-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {inv.status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {inv.created_date ? new Date(inv.created_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status === 'pending' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => resendInviteMutation.mutate(inv.id)} className="hover:bg-blue-50">
                                <RefreshCw className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => cancelInviteMutation.mutate(inv.id)} className="hover:bg-red-50">
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate({ entity: 'UserInvitation', id: inv.id })} className="hover:bg-red-50">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                {t({ en: 'Teams Management', ar: 'إدارة الفرق' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityTable
                data={teams}
                entity="Team"
                columns={[
                  { 
                    key: 'name', 
                    label: { en: 'Team Name', ar: 'اسم الفريق' },
                    render: (item) => (
                      <Link to={createPageUrl(`TeamOverview?id=${item.id}`)} className="text-blue-600 hover:underline font-medium">
                        {item.name}
                      </Link>
                    )
                  },
                  { key: 'description', label: { en: 'Description', ar: 'الوصف' } },
                  { 
                    key: 'permissions', 
                    label: { en: 'Permissions', ar: 'الصلاحيات' },
                    render: (item) => <Badge>{item.permissions?.length || 0}</Badge>
                  },
                  { key: 'member_count', label: { en: 'Members', ar: 'الأعضاء' } },
                ]}
                onEdit={handleEdit}
                onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                {t({ en: 'Roles & Permissions', ar: 'الأدوار والصلاحيات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EntityTable
                data={roles}
                entity="Role"
                columns={[
                  { key: 'name', label: { en: 'Role Name', ar: 'اسم الدور' } },
                  { key: 'description', label: { en: 'Description', ar: 'الوصف' } },
                  { 
                    key: 'permissions', 
                    label: { en: 'Permissions', ar: 'الصلاحيات' },
                    render: (item) => <Badge>{item.permissions?.length || 0}</Badge>
                  },
                  { key: 'user_count', label: { en: 'Users', ar: 'المستخدمون' } },
                ]}
                onEdit={handleEdit}
                onDelete={(entity, id) => deleteMutation.mutate({ entity, id })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600" />
                {t({ en: 'Recent User Activity', ar: 'نشاط المستخدمين الأخير' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.slice(0, 50).map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{activity.action_type}</Badge>
                        <span className="text-sm font-medium">{activity.user_email}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {activity.description || `${activity.action_type} ${activity.entity_type || ''} ${activity.entity_name || ''}`}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(activity.created_date).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEntity?.mode === 'create' ? 
                t({ en: `Create ${selectedEntity?.entity}`, ar: `إنشاء ${selectedEntity?.entity}` }) : 
                t({ en: `Edit ${selectedEntity?.entity}`, ar: `تعديل ${selectedEntity?.entity}` })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEntity?.entity === 'UserInvitation' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input value={formData.full_name || ''} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select value={formData.role || ''} onValueChange={(val) => setFormData({...formData, role: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {selectedEntity?.entity === 'User' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Title</label>
                    <Input value={formData.job_title || ''} onChange={(e) => setFormData({...formData, job_title: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Department</label>
                    <Input value={formData.department || ''} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assigned Roles</label>
                    <Select 
                      value={formData.assigned_roles?.[0] || ''} 
                      onValueChange={(val) => setFormData({...formData, assigned_roles: val ? [val] : []})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assigned Teams</label>
                    <Select 
                      value={formData.assigned_teams?.[0] || ''} 
                      onValueChange={(val) => setFormData({...formData, assigned_teams: val ? [val] : []})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {selectedEntity?.entity === 'Team' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Team Name</label>
                  <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Team Lead Email</label>
                  <Input type="email" value={formData.lead_user_email || ''} onChange={(e) => setFormData({...formData, lead_user_email: e.target.value})} />
                </div>
                <PermissionSelector 
                  selectedPermissions={formData.permissions || []}
                  onChange={(perms) => setFormData({...formData, permissions: perms})}
                />
              </>
            )}
            {selectedEntity?.entity === 'Role' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role Name</label>
                  <Input value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>
                
                {/* AI Permission Suggester - Migrated from RoleManager */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="font-medium text-purple-900 text-sm">{t({ en: 'AI Permission Suggester', ar: 'مقترح الصلاحيات الذكي' })}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Let AI recommend permissions based on role name', ar: 'دع الذكاء يوصي بالصلاحيات' })}</p>
                  </div>
                  <Button size="sm" onClick={handleAISuggestPermissions} disabled={!formData.name || aiLoading || !isAvailable} className="bg-purple-600">
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </Button>
                </div>
                
                <PermissionSelector 
                  selectedPermissions={formData.permissions || []}
                  onChange={(perms) => setFormData({...formData, permissions: perms})}
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProtectedPage(UserManagementHub, {
  requireAdmin: true
});