import { useAllUserProfiles } from '@/hooks/useUserProfiles';
import { useAuth } from '@/lib/AuthContext';
import { useMyDelegations, useReceivedDelegations, useDelegationMutations } from '@/hooks/useDelegations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { UserPlus, Calendar, Shield, Trash2, Plus, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { useState } from 'react';

export default function DelegationContent() {
  const { t, isRTL } = useLanguage();
  const { user: currentUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    delegate_email: '',
    permission_types: [],
    start_date: '',
    end_date: '',
    reason: ''
  });

  const { data: users = [] } = useAllUserProfiles();
  const { data: delegations = [] } = useMyDelegations(currentUser?.email);
  const { data: receivedDelegations = [] } = useReceivedDelegations(currentUser?.email);
  const { createDelegation: createMutation, deleteDelegation: deleteMutation } = useDelegationMutations();

  const activeDelegations = delegations.filter(d => {
    const now = new Date();
    const start = new Date(d.start_date);
    const end = new Date(d.end_date);
    return d.is_active && now >= start && now <= end;
  });

  const activeReceivedDelegations = receivedDelegations.filter(d => {
    const now = new Date();
    const start = new Date(d.start_date);
    const end = new Date(d.end_date);
    return d.is_active && now >= start && now <= end;
  });

  const availablePermissions = [
    'can_approve_challenge',
    'can_approve_pilot_budget',
    'can_approve_pilot_milestone',
    'can_review_proposal',
    'can_edit_challenge',
    'can_edit_pilot',
    'can_manage_applications'
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-background">
          <CardContent className="pt-6 text-center">
            <UserPlus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{activeDelegations.length}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Active Delegations', ar: 'التفويضات النشطة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-background">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{activeReceivedDelegations.length}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Delegated to Me', ar: 'مفوض لي' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-background">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{delegations.length}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Total Delegations', ar: 'إجمالي التفويضات' })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Create Delegation', ar: 'إنشاء تفويض' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'My Delegations', ar: 'تفويضاتي' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {delegations.length > 0 ? (
            <div className="space-y-3">
              {delegations.map((delegation) => {
                const delegate = users.find(u => u.user_email === delegation.delegate_email);
                const isActive = activeDelegations.some(d => d.id === delegation.id);
                return (
                  <div key={delegation.id} className={`p-4 border rounded-lg ${isActive ? 'bg-green-50 border-green-200' : 'bg-background'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-foreground">{delegate?.full_name || delegation.delegate_email}</p>
                          {isActive && <Badge className="bg-green-600">{t({ en: 'Active', ar: 'نشط' })}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{delegation.reason}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {delegation.permission_types?.map((perm, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{perm.replace(/_/g, ' ')}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(delegation.start_date).toLocaleDateString()}</span>
                          <span>→</span>
                          <span>{new Date(delegation.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(delegation.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t({ en: 'No delegations created', ar: 'لا توجد تفويضات' })}
            </p>
          )}
        </CardContent>
      </Card>

      {receivedDelegations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Delegated to Me', ar: 'المفوض لي' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receivedDelegations.map((delegation) => {
                const delegator = users.find(u => u.user_email === delegation.delegator_email);
                const isActive = activeReceivedDelegations.some(d => d.id === delegation.id);
                return (
                  <div key={delegation.id} className={`p-4 border rounded-lg ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-background'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-foreground">
                        {t({ en: 'From:', ar: 'من:' })} {delegator?.full_name || delegation.delegator_email}
                      </p>
                      {isActive && <Badge className="bg-blue-600">{t({ en: 'Active', ar: 'نشط' })}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{delegation.reason}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {delegation.permission_types?.map((perm, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{perm.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(delegation.start_date).toLocaleDateString()}</span>
                      <span>→</span>
                      <span>{new Date(delegation.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className={undefined}>
            <DialogTitle>{t({ en: 'Create New Delegation', ar: 'إنشاء تفويض جديد' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Delegate to', ar: 'التفويض لـ' })}</label>
              <Select value={formData.delegate_email} onValueChange={(val) => setFormData({ ...formData, delegate_email: val })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select user...', ar: 'اختر مستخدم...' })} />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.user_email !== currentUser?.email).map(user => (
                    <SelectItem key={user.id} value={user.user_email}>
                      {user.full_name} ({user.user_email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Permissions to delegate', ar: 'الصلاحيات المفوضة' })}</label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-3 border rounded-lg">
                {availablePermissions.map(perm => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permission_types.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, permission_types: [...formData.permission_types, perm] });
                        } else {
                          setFormData({ ...formData, permission_types: formData.permission_types.filter(p => p !== perm) });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{perm.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Start date', ar: 'تاريخ البداية' })}</label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'End date', ar: 'تاريخ النهاية' })}</label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Reason', ar: 'السبب' })}</label>
              <Input
                placeholder={t({ en: 'e.g., Vacation, Business trip...', ar: 'مثال: إجازة، رحلة عمل...' })}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className={undefined}>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => createMutation.mutate({ ...formData, delegator_email: currentUser.email })}
              disabled={!formData.delegate_email || !formData.start_date || !formData.end_date || formData.permission_types.length === 0 || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Create', ar: 'إنشاء' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
