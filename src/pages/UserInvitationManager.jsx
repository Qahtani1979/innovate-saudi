import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from '../components/LanguageContext';
import { UserPlus, Mail, Upload, Download, RefreshCw, X, Send, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function UserInvitationManager() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [inviteForm, setInviteForm] = useState({ email: '', full_name: '', role: 'user', custom_message: '' });
  const [bulkEmails, setBulkEmails] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showEmailCustomizer, setShowEmailCustomizer] = useState(false);

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: () => base44.entities.UserInvitation.list('-created_date', 100)
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const createInvitationMutation = useMutation({
    mutationFn: (data) => base44.entities.UserInvitation.create({
      ...data,
      invited_by: 'current_user@example.com',
      invitation_token: Math.random().toString(36).substring(7),
      expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invitations']);
      setInviteForm({ email: '', full_name: '', role: 'user', custom_message: '' });
      toast.success(t({ en: 'Invitation sent', ar: 'تم إرسال الدعوة' }));
    }
  });

  const bulkInviteMutation = useMutation({
    mutationFn: async ({ emails, role, message }) => {
      const emailList = emails.split('\n').map(e => e.trim()).filter(e => e);
      const invites = emailList.map(email => ({
        email,
        role,
        custom_message: message,
        invited_by: 'current_user@example.com',
        invitation_token: Math.random().toString(36).substring(7),
        expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      await base44.entities.UserInvitation.bulkCreate(invites);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['invitations']);
      setBulkEmails('');
      setShowBulkDialog(false);
      toast.success(t({ en: 'Bulk invitations sent', ar: 'تم إرسال الدعوات الجماعية' }));
    }
  });

  const resendMutation = useMutation({
    mutationFn: (id) => base44.entities.UserInvitation.update(id, { 
      status: 'pending',
      expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invitations']);
      toast.success(t({ en: 'Invitation resent', ar: 'تم إعادة إرسال الدعوة' }));
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.UserInvitation.update(id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invitations']);
      toast.success(t({ en: 'Invitation cancelled', ar: 'تم إلغاء الدعوة' }));
    }
  });

  const statusColors = {
    pending: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-700'
  };

  const statusIcons = {
    pending: Clock,
    accepted: CheckCircle2,
    expired: AlertCircle,
    cancelled: X
  };

  const pendingCount = invitations.filter(i => i.status === 'pending').length;
  const acceptedCount = invitations.filter(i => i.status === 'accepted').length;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '✉️ User Invitation Manager', ar: '✉️ مدير دعوات المستخدمين' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Invite users, track acceptances, and manage access onboarding', ar: 'دعوة المستخدمين وتتبع القبول وإدارة الولوج' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{pendingCount}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Pending', ar: 'معلقة' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{acceptedCount}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Accepted', ar: 'مقبولة' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Mail className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-600">{invitations.length}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <UserPlus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">
                {acceptedCount > 0 ? ((acceptedCount / invitations.length) * 100).toFixed(0) : 0}%
              </p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Acceptance Rate', ar: 'معدل القبول' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Single Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Send Invitation', ar: 'إرسال دعوة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Email', ar: 'البريد الإلكتروني' })}</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Full Name', ar: 'الاسم الكامل' })}</label>
              <Input
                value={inviteForm.full_name}
                onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Role', ar: 'الدور' })}</label>
              <Select value={inviteForm.role} onValueChange={(val) => setInviteForm({ ...inviteForm, role: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="municipality_admin">Municipality Admin</SelectItem>
                  <SelectItem value="startup_user">Startup User</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="program_operator">Program Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Custom Message (Optional)', ar: 'رسالة مخصصة (اختياري)' })}</label>
              <Textarea
                value={inviteForm.custom_message}
                onChange={(e) => setInviteForm({ ...inviteForm, custom_message: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => createInvitationMutation.mutate(inviteForm)}
              disabled={!inviteForm.email || createInvitationMutation.isPending}
              className="bg-blue-600"
            >
              <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Send Invitation', ar: 'إرسال الدعوة' })}
            </Button>
            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Default Role', ar: 'الدور الافتراضي' })}</label>
                    <Select defaultValue="user">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="municipality_admin">Municipality Admin</SelectItem>
                        <SelectItem value="startup_user">Startup User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Message (Optional)', ar: 'رسالة (اختياري)' })}</label>
                    <Textarea rows={3} />
                  </div>
                  <Button
                    onClick={() => bulkInviteMutation.mutate({ emails: bulkEmails, role: 'user', message: '' })}
                    disabled={!bulkEmails || bulkInviteMutation.isPending}
                    className="w-full bg-purple-600"
                  >
                    {bulkInviteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    )}
                    {t({ en: 'Send Bulk Invitations', ar: 'إرسال دعوات جماعية' })}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Email Customizer */}
      {showEmailCustomizer && (
        <WelcomeEmailCustomizer 
          onSave={(template) => {
            toast.success(t({ en: 'Email template saved', ar: 'تم حفظ قالب البريد' }));
            setShowEmailCustomizer(false);
          }}
        />
      )}

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Invitation Tracking', ar: 'تتبع الدعوات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>{t({ en: 'Email', ar: 'البريد' })}</TableHead>
                <TableHead>{t({ en: 'Name', ar: 'الاسم' })}</TableHead>
                <TableHead>{t({ en: 'Role', ar: 'الدور' })}</TableHead>
                <TableHead>{t({ en: 'Status', ar: 'الحالة' })}</TableHead>
                <TableHead>{t({ en: 'Sent', ar: 'تاريخ الإرسال' })}</TableHead>
                <TableHead>{t({ en: 'Expires', ar: 'ينتهي' })}</TableHead>
                <TableHead className="text-right">{t({ en: 'Actions', ar: 'الإجراءات' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-slate-100 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Mail className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">{t({ en: 'No invitations sent yet', ar: 'لم يتم إرسال دعوات بعد' })}</p>
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((inv) => {
                  const StatusIcon = statusIcons[inv.status];
                  return (
                    <TableRow key={inv.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{inv.email}</TableCell>
                      <TableCell>{inv.full_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{inv.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[inv.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(inv.created_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {inv.expires_date ? new Date(inv.expires_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => resendMutation.mutate(inv.id)}
                                className="hover:bg-blue-50"
                              >
                                <RefreshCw className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelMutation.mutate(inv.id)}
                                className="hover:bg-red-50"
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}