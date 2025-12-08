import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Users, TrendingUp, CheckCircle2, Clock, UserPlus, ArrowLeft, Send } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MyDelegation() {
  const { language, isRTL, t } = useLanguage();
  const [delegateDialogOpen, setDelegateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDelegate, setSelectedDelegate] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', user?.email],
    queryFn: async () => {
      const userProfile = await base44.entities.UserProfile.filter({ user_email: user?.email });
      if (!userProfile[0]?.organization_id) return [];
      
      const allProfiles = await base44.entities.UserProfile.list();
      return allProfiles.filter(p => p.organization_id === userProfile[0].organization_id && p.user_email !== user?.email);
    },
    enabled: !!user
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['delegatable-tasks', user?.email],
    queryFn: async () => {
      const tasks = await base44.entities.Task.list();
      return tasks.filter(t => t.created_by === user?.email && !t.delegated_to && t.status !== 'completed');
    },
    enabled: !!user
  });

  const { data: delegatedItems = [] } = useQuery({
    queryKey: ['delegated-items', user?.email],
    queryFn: async () => {
      const tasks = await base44.entities.Task.list();
      return tasks.filter(t => t.delegated_by === user?.email);
    },
    enabled: !!user
  });

  const delegateMutation = useMutation({
    mutationFn: ({ taskId, delegateTo }) => 
      base44.entities.Task.update(taskId, {
        delegated_to: delegateTo,
        delegated_by: user?.email,
        delegated_date: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['delegatable-tasks']);
      queryClient.invalidateQueries(['delegated-items']);
      setDelegateDialogOpen(false);
      setSelectedItem(null);
      setSelectedDelegate('');
      toast.success(t({ en: 'Task delegated successfully', ar: 'تم تفويض المهمة بنجاح' }));
    }
  });

  const recallMutation = useMutation({
    mutationFn: (taskId) => 
      base44.entities.Task.update(taskId, {
        delegated_to: null,
        delegated_by: null,
        delegated_date: null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['delegatable-tasks']);
      queryClient.invalidateQueries(['delegated-items']);
      toast.success(t({ en: 'Task recalled successfully', ar: 'تم استرجاع المهمة بنجاح' }));
    }
  });

  const openDelegateDialog = (task) => {
    setSelectedItem(task);
    setDelegateDialogOpen(true);
  };

  const handleDelegate = () => {
    if (selectedItem && selectedDelegate) {
      delegateMutation.mutate({ taskId: selectedItem.id, delegateTo: selectedDelegate });
    }
  };

  const calculateTeamCapacity = (memberEmail) => {
    const assignedTasks = delegatedItems.filter(t => t.delegated_to === memberEmail && t.status !== 'completed');
    return Math.min(100, assignedTasks.length * 20);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'My Delegation & Team', ar: 'تفويضي والفريق' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Delegate tasks and coordinate with your team', ar: 'تفويض المهام والتنسيق مع فريقك' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{teamMembers.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Send className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{delegatedItems.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Items Delegated', ar: 'عناصر مفوضة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {delegatedItems.length > 0 ? Math.round((delegatedItems.filter(d => d.status === 'completed').length / delegatedItems.length) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Completion Rate', ar: 'معدل الإكمال' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Delegatable Tasks */}
      {myTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Tasks Available for Delegation', ar: 'المهام المتاحة للتفويض' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{task.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                      {task.priority}
                    </Badge>
                    {task.due_date && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => openDelegateDialog(task)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t({ en: 'Delegate', ar: 'تفويض' })}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Team Capacity */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Team Workload', ar: 'عبء عمل الفريق' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No team members found in your organization', ar: 'لم يتم العثور على أعضاء فريق في منظمتك' })}
            </p>
          ) : (
            teamMembers.map((member) => {
              const capacity = calculateTeamCapacity(member.user_email);
              const assignedCount = delegatedItems.filter(t => t.delegated_to === member.user_email && t.status !== 'completed').length;
              
              return (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.user_email}</p>
                        <p className="text-sm text-slate-600">
                          {assignedCount} {t({ en: 'tasks assigned', ar: 'مهام معينة' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">{t({ en: 'Capacity', ar: 'القدرة' })}</span>
                      <span className="text-sm font-bold">{capacity}%</span>
                    </div>
                    <Progress value={capacity} className="h-2" />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Delegated Items Tracking */}
      {delegatedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Delegated Items', ar: 'العناصر المفوضة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {delegatedItems.map((item) => {
              const delegate = teamMembers.find(m => m.user_email === item.delegated_to);
              return (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">
                          {t({ en: 'Delegated to:', ar: 'مفوض لـ:' })} {item.delegated_to}
                        </span>
                        <Badge className={item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    {item.status !== 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => recallMutation.mutate(item.id)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t({ en: 'Recall', ar: 'استرجاع' })}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Delegation Dialog */}
      <Dialog open={delegateDialogOpen} onOpenChange={setDelegateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t({ en: 'Delegate Task', ar: 'تفويض المهمة' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedItem && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-900">{selectedItem.title}</p>
                <p className="text-sm text-slate-600 mt-1">{selectedItem.description}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Select Team Member', ar: 'اختر عضو الفريق' })}
              </label>
              <Select value={selectedDelegate} onValueChange={setSelectedDelegate}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Choose delegate...', ar: 'اختر المفوض...' })} />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.user_email}>
                      {member.user_email} ({calculateTeamCapacity(member.user_email)}% capacity)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-blue-600" 
              onClick={handleDelegate}
              disabled={!selectedDelegate || delegateMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {t({ en: 'Delegate Task', ar: 'تفويض المهمة' })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProtectedPage(MyDelegation, { requiredPermissions: [] });