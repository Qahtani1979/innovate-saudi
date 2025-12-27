import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

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
import { userPrompts } from '@/lib/ai/prompts/ecosystem/userPrompts';
import { buildPrompt } from '@/lib/ai/promptBuilder';
import { useUserMutations } from '@/hooks/useUserMutations';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import { useUsersWithVisibility } from '@/hooks/useUsersWithVisibility';
import { useRoles } from '@/hooks/useRoles';
import { useRoleMutations } from '@/hooks/useRoleMutations';
import { useTeams, useTeamMutations } from '@/hooks/useTeamMutations';
import { useInvitations } from '@/hooks/useInvitations';
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
// Removed direct supabase import

function UserManagementHub() {
  const { language, isRTL, t } = useLanguage();

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);
  const { user: currentUser } = useAuth();
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();

  // Custom hooks
  // Custom hooks
  const { inviteUsers, cancelInvitation, resendInvitation, updateUserProfile, updateUserRoles } = useUserMutations();
  const { createRole, updateRole, deleteRole } = useRoleMutations();
  const { createTeam, updateTeam, deleteTeam } = useTeamMutations();
  const { useUserActivities } = useSystemAnalytics();
  const { data: activities = [] } = useUserActivities(100);
  const { organizations, municipalities } = useTaxonomy();
  const { data: users = [] } = useUsersWithVisibility({ limit: 1000 });

  // Directory filters
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Bulk invite state
  const [bulkEmails, setBulkEmails] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  // Permission matrix state for Role dialog
  const [permissionMatrix, setPermissionMatrix] = useState({
    challenges: { create: false, read: true, update: false, delete: false },
    pilots: { create: false, read: true, update: false, delete: false },
    solutions: { create: false, read: true, update: false, delete: false },
    programs: { create: false, read: true, update: false, delete: false },
    municipalities: { create: false, read: true, update: false, delete: false },
    organizations: { create: false, read: true, update: false, delete: false }
  });

  // Queries (migrated to useTaxonomy or specialized hooks where possible)
  // Note: Roles and Teams might still need dedicated hooks if not in Taxonomy
  // For now we can keep them managed here via simpler means or create hooks later
  // Assuming a basic Roles/Teams fetch is acceptable via a small helper or existing pattern?


  // ... (inside component)

  // Use the new simple hooks
  const { data: roles = [] } = useRoles();
  const { data: teams = [] } = useTeams();
  const { data: invitations = [] } = useInvitations();

  // ... existing useEffect ...


  useEffect(() => {
    if (currentUser && !currentUser.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [currentUser]);

  // Replaced inline mutations with hooks from useUserMutations
  // Handlers will need to be updated to call inviteUsers.mutate, etc.

  // Derived data for directory filters (migrated from UserDirectory)
  const allSkills = [...new Set(users.flatMap(u => u.skills || []))];
  const allDepartments = [...new Set(users.map(u => u.department).filter(Boolean))];
  const allRoles = [...new Set(users.map(u => u.role).filter(Boolean))];

  // Filter users for directory view - now includes role filter
  const filteredDirectoryUsers = users.filter(user => {
    const searchMatch = !searchTerm ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const skillMatch = !skillFilter || user.skills?.includes(skillFilter);
    const deptMatch = !departmentFilter || user.department === departmentFilter;
    const roleMatch = !roleFilter || user.role === roleFilter;
    return searchMatch && skillMatch && deptMatch && roleMatch;
  });

  // Permission matrix entities and operations for Role dialog
  const permissionEntities = ['challenges', 'pilots', 'solutions', 'programs', 'municipalities', 'organizations'];
  const permissionOperations = ['create', 'read', 'update', 'delete'];

  const toggleMatrixPermission = (entity, operation) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [entity]: { ...prev[entity], [operation]: !prev[entity][operation] }
    }));
  };

  const selectAllInCategory = (entity) => {
    const allSelected = permissionOperations.every(op => permissionMatrix[entity][op]);
    setPermissionMatrix(prev => ({
      ...prev,
      [entity]: permissionOperations.reduce((acc, op) => ({ ...acc, [op]: !allSelected }), {})
    }));
  };

  // AI permission suggester (migrated from RoleManager)
  const handleAISuggestPermissions = async () => {
    if (!formData.name) {
      toast.error(t({ en: 'Please enter role name first', ar: 'يرجى إدخال اسم الدور أولاً' }));
      return;
    }
    const { prompt, schema, system } = buildPrompt(userPrompts.suggestPermissions, {
      name: formData.name,
      description: formData.description
    });

    const response = await invokeAI({
      prompt,
      system_prompt: system,
      response_json_schema: schema
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
      if (selectedEntity.entity === 'Role') createRole.mutate(formData);
      else if (selectedEntity.entity === 'Team') createTeam.mutate(formData);
      else if (selectedEntity.entity === 'UserInvitation') inviteUsers.mutate([formData]);
    } else {
      if (selectedEntity.entity === 'Role') updateRole.mutate({ id: selectedEntity.id, data: formData });
      else if (selectedEntity.entity === 'Team') updateTeam.mutate({ id: selectedEntity.id, data: formData });
      else if (selectedEntity.entity === 'User') updateUserProfile.mutate({ id: selectedEntity.id, data: formData });
    }
    setDialogOpen(false);
  };

  const handleDelete = (entity, id) => {
    if (entity === 'Role') deleteRole.mutate(id);
    else if (entity === 'Team') deleteTeam.mutate(id);
    else if (entity === 'UserInvitation') cancelInvitation.mutate(id);
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
              value={localFilters[filter.key] || 'all'}
              onValueChange={(val) => setLocalFilters({ ...localFilters, [filter.key]: val === 'all' ? '' : val })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.label[language]} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filter.options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value || `option-${opt.label}`}>{opt.label}</SelectItem>
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
                onDelete={(entity, id) => handleDelete(entity, id)}

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

              {/* Filters - now includes role filter */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
                  <Input
                    placeholder={t({ en: 'Search by name, email, title...', ar: 'ابحث بالاسم، البريد، المسمى...' })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                  />
                </div>
                <Select value={skillFilter || 'all'} onValueChange={(val) => setSkillFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Filter by skill', ar: 'تصفية بالمهارة' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    {allSkills.sort().map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={roleFilter || 'all'} onValueChange={(val) => setRoleFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Filter by role', ar: 'تصفية بالدور' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {allRoles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={departmentFilter || 'all'} onValueChange={(val) => setDepartmentFilter(val === 'all' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Filter by department', ar: 'تصفية بالإدارة' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {allDepartments.sort().map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setSkillFilter(''); setDepartmentFilter(''); setRoleFilter(''); }}>
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
                      onClick={() => {
                        const emails = bulkEmails.split('\n').filter(e => e.trim());
                        const invites = emails.map(email => ({
                          email: email.trim(),
                          role: 'user',
                          custom_message: ''
                        }));
                        inviteUsers.mutate(invites, {
                          onSuccess: () => {
                            setBulkEmails('');
                            setShowBulkDialog(false);
                          }
                        });
                      }}
                      disabled={!bulkEmails || inviteUsers.isPending}
                      className="w-full bg-purple-600"
                    >
                      {inviteUsers.isPending ? (
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
                              <Button size="sm" variant="ghost" onClick={() => resendInvitation.mutate(inv.id)} className="hover:bg-blue-50">
                                <RefreshCw className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => cancelInvitation.mutate(inv.id)} className="hover:bg-red-50">
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => cancelInvitation.mutate(inv.id)} className="hover:bg-red-50">
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
                onDelete={(entity, id) => deleteTeam.mutate(id)}

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
                onDelete={(entity, id) => deleteRole.mutate(id)}

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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input value={formData.full_name || ''} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role</label>
                    <Select value={formData.role || ''} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="municipality_admin">Municipality Admin</SelectItem>
                        <SelectItem value="startup_user">Startup User</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="program_operator">Program Operator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Organization', ar: 'المنظمة' })}</label>
                    <Select value={formData.organization_id || 'none'} onValueChange={(val) => setFormData({ ...formData, organization_id: val === 'none' ? '' : val })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: 'Select organization...', ar: 'اختر منظمة...' })} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>{org.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Municipality', ar: 'البلدية' })}</label>
                    <Select value={formData.municipality_id || 'none'} onValueChange={(val) => setFormData({ ...formData, municipality_id: val === 'none' ? '' : val })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: 'Select municipality...', ar: 'اختر بلدية...' })} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {municipalitiesData.map(mun => (
                          <SelectItem key={mun.id} value={mun.id}>{mun.name_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Custom Message (Optional)', ar: 'رسالة مخصصة' })}</label>
                  <Textarea
                    value={formData.custom_message || ''}
                    onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                    rows={3}
                    placeholder={t({ en: 'Add a personal message to the invitation email...', ar: 'أضف رسالة شخصية لبريد الدعوة...' })}
                  />
                </div>
              </>
            )}
            {selectedEntity?.entity === 'User' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Title</label>
                    <Input value={formData.job_title || ''} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Department</label>
                    <Input value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assigned Roles</label>
                    <Select
                      value={formData.assigned_roles?.[0] || ''}
                      onValueChange={(val) => setFormData({ ...formData, assigned_roles: val ? [val] : [] })}
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
                      onValueChange={(val) => setFormData({ ...formData, assigned_teams: val ? [val] : [] })}
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
                  <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Team Lead Email</label>
                  <Input type="email" value={formData.lead_user_email || ''} onChange={(e) => setFormData({ ...formData, lead_user_email: e.target.value })} />
                </div>
                <PermissionSelector
                  selectedPermissions={formData.permissions || []}
                  onChange={(perms) => setFormData({ ...formData, permissions: perms })}
                />
              </>
            )}
            {selectedEntity?.entity === 'Role' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role Name</label>
                    <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role Code</label>
                    <Input
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., MUN_REVIEWER"
                      className="font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
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

                {/* Permission Matrix - Migrated from RoleManager */}
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Permission Matrix', ar: 'مصفوفة الصلاحيات' })}</label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">{t({ en: 'Entity', ar: 'الكيان' })}</TableHead>
                          <TableHead className="text-center w-20">{t({ en: 'Create', ar: 'إنشاء' })}</TableHead>
                          <TableHead className="text-center w-20">{t({ en: 'Read', ar: 'قراءة' })}</TableHead>
                          <TableHead className="text-center w-20">{t({ en: 'Update', ar: 'تحديث' })}</TableHead>
                          <TableHead className="text-center w-20">{t({ en: 'Delete', ar: 'حذف' })}</TableHead>
                          <TableHead className="text-center w-20">{t({ en: 'All', ar: 'الكل' })}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permissionEntities.map((entity) => (
                          <TableRow key={entity}>
                            <TableCell className="font-medium capitalize">{entity.replace(/_/g, ' ')}</TableCell>
                            {permissionOperations.map((op) => (
                              <TableCell key={op} className="text-center">
                                <Checkbox
                                  checked={permissionMatrix[entity]?.[op] || false}
                                  onCheckedChange={() => toggleMatrixPermission(entity, op)}
                                />
                              </TableCell>
                            ))}
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => selectAllInCategory(entity)}
                                className="text-xs h-6 px-2"
                              >
                                {permissionOperations.every(op => permissionMatrix[entity]?.[op]) ? '−' : '+'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <PermissionSelector
                  selectedPermissions={formData.permissions || []}
                  onChange={(perms) => setFormData({ ...formData, permissions: perms })}
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSubmit} disabled={createRole.isPending || updateRole.isPending || inviteUsers.isPending || createTeam.isPending}>
              {(createRole.isPending || inviteUsers.isPending || createTeam.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
