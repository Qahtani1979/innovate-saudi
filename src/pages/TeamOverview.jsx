import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Users, Shield, UserPlus, Trash2, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
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
import { useTeams } from '@/hooks/useTeamMutations';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useTeamMutations } from '@/hooks/useTeamMutations';
import { useUsersWithVisibility } from '@/hooks/useUsersWithVisibility';

export default function TeamOverview() {
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: teams = [], isLoading } = useTeams();
  const team = teams.find(t => t.id === teamId);

  const { data: teamMembers = [] } = useTeamMembers({ teamId });
  const { data: allUsers = [] } = useUsersWithVisibility();

  const { addTeamMember, removeTeamMember } = useTeamMutations();

  const teamMemberEmails = new Set(teamMembers.map(m => m.user_email));
  const availableUsers = allUsers.filter(u => !teamMemberEmails.has(u.email));

  const handleAddMember = () => {
    if (!selectedUserEmail) return;
    addTeamMember.mutate({
      teamId,
      userEmail: selectedUserEmail,
      role: 'member',
    }, {
      onSuccess: () => {
        setAddMemberOpen(false);
        setSelectedUserEmail('');
      },
    });
  };

  const filteredMembers = teamMembers.filter(m => {
    const user = allUsers.find(u => u.email === m.user_email);
    return user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
              filteredMembers.map((member) => {
                const user = allUsers.find(u => u.email === member.user_email);
                if (!user) return null;

                return (
                  <div key={member.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{user.full_name}</p>
                        {team.lead_user_email === user.email && (
                          <Badge className="bg-yellow-100 text-yellow-700">Lead</Badge>
                        )}
                        {member.role && (
                          <Badge variant="outline">{member.role}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      {user.job_title && (
                        <p className="text-xs text-slate-500 mt-1">{user.job_title}</p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamMember.mutate({ teamId, userEmail: user.email })}
                      className="text-red-600 hover:bg-red-50"
                      disabled={removeTeamMember.isPending}
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
            <Select value={selectedUserEmail} onValueChange={setSelectedUserEmail}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select user...', ar: 'اختر مستخدم...' })} />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(user => (
                  <SelectItem key={user.email} value={user.email}>
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
              onClick={handleAddMember}
              disabled={!selectedUserEmail || addTeamMember.isPending}
            >
              {t({ en: 'Add', ar: 'إضافة' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}