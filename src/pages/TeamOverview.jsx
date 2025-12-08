import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Users, Shield, UserPlus, Trash2, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
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

export default function TeamOverview() {
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const teams = await base44.entities.Team.list();
      return teams.find(t => t.id === teamId);
    },
    enabled: !!teamId
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const teamMembers = allUsers.filter(u => u.assigned_teams?.includes(teamId));
  const availableUsers = allUsers.filter(u => !u.assigned_teams?.includes(teamId));

  const addMemberMutation = useMutation({
    mutationFn: async (userId) => {
      const user = allUsers.find(u => u.id === userId);
      const updatedTeams = [...(user.assigned_teams || []), teamId];
      await base44.entities.User.update(userId, { assigned_teams: updatedTeams });
      
      // Update team member count
      await base44.entities.Team.update(teamId, { member_count: (team.member_count || 0) + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setAddMemberOpen(false);
      setSelectedUserId('');
      toast.success(t({ en: 'Member added', ar: 'تمت الإضافة' }));
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId) => {
      const user = allUsers.find(u => u.id === userId);
      const updatedTeams = (user.assigned_teams || []).filter(tid => tid !== teamId);
      await base44.entities.User.update(userId, { assigned_teams: updatedTeams });
      
      // Update team member count
      await base44.entities.Team.update(teamId, { member_count: Math.max(0, (team.member_count || 1) - 1) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(t({ en: 'Member removed', ar: 'تمت الإزالة' }));
    }
  });

  const getUserPermissions = (user) => {
    const permissions = new Set();
    
    // From roles
    if (user.assigned_roles?.length) {
      user.assigned_roles.forEach(roleId => {
        const role = allRoles.find(r => r.id === roleId);
        if (role?.permissions) {
          role.permissions.forEach(p => permissions.add(p));
        }
      });
    }
    
    // From this team
    if (team?.permissions) {
      team.permissions.forEach(p => permissions.add(p));
    }
    
    return Array.from(permissions);
  };

  const filteredMembers = teamMembers.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || !team) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('UserManagementHub')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
            <p className="text-slate-600 mt-1">{team.description}</p>
          </div>
        </div>
        <Button onClick={() => setAddMemberOpen(true)} className="bg-gradient-to-r from-blue-600 to-teal-600">
          <UserPlus className="h-4 w-4 mr-2" />
          {t({ en: 'Add Member', ar: 'إضافة عضو' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Members', ar: 'الأعضاء' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Permissions', ar: 'الصلاحيات' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{team.permissions?.length || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Team Lead', ar: 'قائد الفريق' })}</p>
                <p className="text-sm font-medium text-green-900 mt-1">{team.lead_user_email || 'None'}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t({ en: 'Team Permissions', ar: 'صلاحيات الفريق' })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {team.permissions?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {team.permissions.map((perm, idx) => (
                <Badge key={idx} className="bg-purple-100 text-purple-700">
                  {perm}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t({ en: 'No permissions assigned', ar: 'لا توجد صلاحيات' })}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}</CardTitle>
          <div className="relative mt-4">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search members...', ar: 'البحث عن الأعضاء...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                {t({ en: 'No members found', ar: 'لم يتم العثور على أعضاء' })}
              </p>
            ) : (
              filteredMembers.map((user) => {
                const userPermissions = getUserPermissions(user);
                const userRoles = user.assigned_roles?.map(rid => allRoles.find(r => r.id === rid)?.name).filter(Boolean) || [];
                
                return (
                  <div key={user.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{user.full_name}</p>
                        {team.lead_user_email === user.email && (
                          <Badge className="bg-yellow-100 text-yellow-700">Lead</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      {user.job_title && (
                        <p className="text-xs text-slate-500 mt-1">{user.job_title}</p>
                      )}
                      
                      <div className="mt-2 space-y-1">
                        {userRoles.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-500">{t({ en: 'Roles:', ar: 'الأدوار:' })}</span>
                            {userRoles.map((role, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{role}</Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-500">{t({ en: 'Total Permissions:', ar: 'إجمالي الصلاحيات:' })}</span>
                          <Badge className="text-xs bg-blue-100 text-blue-700">{userPermissions.length}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMemberMutation.mutate(user.id)}
                      className="text-red-600 hover:bg-red-50"
                      disabled={removeMemberMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t({ en: 'Add Team Member', ar: 'إضافة عضو للفريق' })}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select user...', ar: 'اختر مستخدم...' })} />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button 
              onClick={() => addMemberMutation.mutate(selectedUserId)}
              disabled={!selectedUserId || addMemberMutation.isPending}
            >
              {t({ en: 'Add', ar: 'إضافة' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}