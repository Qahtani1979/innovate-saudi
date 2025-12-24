import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from './LanguageContext';
import { Users, Plus, Trash2, Shield, Building2 } from 'lucide-react';
import { useSandboxCollaborators, useSandboxCollaboratorMutations } from '@/hooks/useSandboxCollaborators';
import { useOrganizationsList } from '@/hooks/useOrganizations';

export default function SandboxCollaboratorManager({ sandbox }) {
  const { language, isRTL, t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    organization_id: '',
    user_email: '',
    role: 'observer',
    permissions: []
  });

  const { data: collaborators = [] } = useSandboxCollaborators(sandbox?.id);
  const { data: organizations = [] } = useOrganizationsList();
  const { createCollaborator, deleteCollaborator } = useSandboxCollaboratorMutations();

  const handleCreate = () => {
    createCollaborator.mutate({
      data: formData,
      sandboxId: sandbox.id
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setFormData({
      organization_id: '',
      user_email: '',
      role: 'observer',
      permissions: []
    });
  };

  const roleConfig = {
    admin: { label: 'Administrator', color: 'bg-red-100 text-red-700', icon: Shield },
    reviewer: { label: 'Reviewer', color: 'bg-purple-100 text-purple-700', icon: Shield },
    observer: { label: 'Observer', color: 'bg-blue-100 text-blue-700', icon: Users },
    participant: { label: 'Participant', color: 'bg-green-100 text-green-700', icon: Users }
  };

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t({ en: 'Collaborators & Stakeholders', ar: 'المتعاونون وأصحاب المصلحة' })}
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Collaborator', ar: 'إضافة متعاون' })}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t({ en: 'Add Collaborator', ar: 'إضافة متعاون' })}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{t({ en: 'Organization', ar: 'المنظمة' })}</Label>
                  <Select value={formData.organization_id} onValueChange={(v) => setFormData({ ...formData, organization_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization..." />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t({ en: 'User Email', ar: 'البريد الإلكتروني' })}</Label>
                  <Input
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Role', ar: 'الدور' })}</Label>
                  <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="observer">Observer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    {t({ en: 'Cancel', ar: 'إلغاء' })}
                  </Button>
                  <Button onClick={handleCreate} disabled={!formData.user_email || createCollaborator.isPending}>
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {collaborators.length > 0 ? (
          <div className="space-y-3">
            {collaborators.map((collab) => {
              const config = roleConfig[collab.role] || roleConfig.observer;
              const org = organizations.find(o => o.id === collab.organization_id);

              return (
                <div key={collab.id} className="p-4 border rounded-lg flex items-center justify-between hover:border-purple-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${config.color} flex items-center justify-center`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{collab.user_email}</p>
                      {org && <p className="text-sm text-slate-600">{org.name_en}</p>}
                      <Badge className={`${config.color} mt-1`}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCollaborator.mutate(collab.id)}
                    disabled={deleteCollaborator.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">
            {t({ en: 'No collaborators added yet', ar: 'لم تتم إضافة متعاونين بعد' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}