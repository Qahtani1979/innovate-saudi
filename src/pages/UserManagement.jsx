import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, User, Search, Mail, Download, Filter, Trash2 } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import AdvancedUserFilters from '../components/access/AdvancedUserFilters';
import BulkUserActions from '../components/access/BulkUserActions';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function UserManagement() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.User.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success(t({ en: 'User deleted', ar: 'تم حذف المستخدم' }));
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Created'].join(','),
      ...filteredUsers.map(u => [u.full_name, u.email, u.role, new Date(u.created_date).toLocaleDateString()].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    toast.success(t({ en: 'Users exported', ar: 'تم تصدير المستخدمين' }));
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    user: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'User Management', ar: 'إدارة المستخدمين' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Manage platform users and permissions', ar: 'إدارة مستخدمي المنصة والصلاحيات' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} variant="outline">
            <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Advanced Filters', ar: 'تصفية متقدمة' })}
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Export', ar: 'تصدير' })}
          </Button>
        </div>
      </div>

      {showAdvancedFilters && (
        <AdvancedUserFilters onFilterChange={setAdvancedFilters} />
      )}

      {selectedIds.length > 0 && (
        <BulkUserActions 
          selectedUsers={selectedIds}
          onComplete={() => setSelectedIds([])}
          onAction={(action, ids) => {
            if (action === 'delete') {
              ids.forEach(id => deleteMutation.mutate(id));
            }
            setSelectedIds([]);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Users', ar: 'إجمالي المستخدمين' })}</p>
                <p className="text-3xl font-bold text-blue-600">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Admins', ar: 'المدراء' })}</p>
                <p className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Regular Users', ar: 'المستخدمون' })}</p>
                <p className="text-3xl font-bold text-green-600">{users.filter(u => u.role === 'user').length}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Users', ar: 'المستخدمون' })}</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
                <Input
                  placeholder={t({ en: 'Search users...', ar: 'ابحث عن المستخدمين...' })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-64 ${isRTL ? 'pr-10' : 'pl-10'}`}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Roles', ar: 'كل الأدوار' })}</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={(checked) => {
                      setSelectedIds(checked ? filteredUsers.map(u => u.id) : []);
                    }}
                  />
                </TableHead>
                <TableHead>{t({ en: 'Name', ar: 'الاسم' })}</TableHead>
                <TableHead>{t({ en: 'Email', ar: 'البريد' })}</TableHead>
                <TableHead>{t({ en: 'Role', ar: 'الدور' })}</TableHead>
                <TableHead>{t({ en: 'Joined', ar: 'تاريخ الانضمام' })}</TableHead>
                <TableHead className="text-right">{t({ en: 'Actions', ar: 'الإجراءات' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(user.id)}
                      onCheckedChange={(checked) => {
                        setSelectedIds(checked 
                          ? [...selectedIds, user.id]
                          : selectedIds.filter(id => id !== user.id)
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(user.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(t({ en: 'Delete this user?', ar: 'حذف هذا المستخدم؟' }))) {
                          deleteMutation.mutate(user.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}