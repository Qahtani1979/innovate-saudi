import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Send, Plus, Eye, Pause, XCircle, Play, Users, Mail, Calendar, 
  Loader2, CheckCircle2, AlertCircle, Clock, Megaphone, Target,
  BarChart3, RefreshCw, Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  draft: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100', label: { en: 'Draft', ar: 'مسودة' } },
  scheduled: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100', label: { en: 'Scheduled', ar: 'مجدولة' } },
  sending: { icon: Loader2, color: 'text-yellow-600', bg: 'bg-yellow-100', label: { en: 'Sending', ar: 'جاري الإرسال' }, spin: true },
  paused: { icon: Pause, color: 'text-orange-600', bg: 'bg-orange-100', label: { en: 'Paused', ar: 'متوقفة' } },
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: { en: 'Completed', ar: 'مكتملة' } },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: { en: 'Cancelled', ar: 'ملغاة' } },
};

const AUDIENCE_TYPES = [
  { value: 'all', label: { en: 'All Users', ar: 'جميع المستخدمين' } },
  { value: 'role', label: { en: 'By Role', ar: 'حسب الدور' } },
  { value: 'municipality', label: { en: 'By Municipality', ar: 'حسب البلدية' } },
  { value: 'custom', label: { en: 'Custom List', ar: 'قائمة مخصصة' } },
];

export default function CampaignManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [previewEmail, setPreviewEmail] = useState('');
  
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    template_id: '',
    audience_type: 'custom',
    audience_filter: { custom_emails: [] },
    campaign_variables: {},
    scheduled_at: null,
  });
  
  const [customEmails, setCustomEmails] = useState('');

  // Fetch campaigns
  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*, email_templates(template_key, name_en, name_ar, category)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch templates for selection
  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates-for-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, template_key, name_en, name_ar, category, variables')
        .eq('is_active', true)
        .order('category', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: async (campaign) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          ...campaign,
          created_by: user?.email
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      setShowCreateDialog(false);
      resetForm();
      toast.success(t({ en: 'Campaign created', ar: 'تم إنشاء الحملة' }));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Campaign action mutation
  const actionMutation = useMutation({
    mutationFn: async ({ campaignId, action, previewEmail }) => {
      const { data, error } = await supabase.functions.invoke('campaign-sender', {
        body: { campaign_id: campaignId, action, preview_email: previewEmail }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      if (variables.action === 'preview') {
        toast.success(t({ en: 'Preview sent', ar: 'تم إرسال المعاينة' }));
      } else if (variables.action === 'send') {
        toast.success(t({ 
          en: `Campaign sent: ${data.summary?.sent || 0} emails`, 
          ar: `تم إرسال الحملة: ${data.summary?.sent || 0} رسالة` 
        }));
      } else {
        toast.success(t({ en: 'Campaign updated', ar: 'تم تحديث الحملة' }));
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async (campaignId) => {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      setShowDetailsDialog(false);
      toast.success(t({ en: 'Campaign deleted', ar: 'تم حذف الحملة' }));
    }
  });

  const resetForm = () => {
    setNewCampaign({
      name: '',
      description: '',
      template_id: '',
      audience_type: 'custom',
      audience_filter: { custom_emails: [] },
      campaign_variables: {},
      scheduled_at: null,
    });
    setCustomEmails('');
  };

  const handleCreate = () => {
    if (!newCampaign.name || !newCampaign.template_id) {
      toast.error(t({ en: 'Name and template are required', ar: 'الاسم والقالب مطلوبان' }));
      return;
    }
    
    const audienceFilter = { ...newCampaign.audience_filter };
    if (newCampaign.audience_type === 'custom' && customEmails) {
      audienceFilter.custom_emails = customEmails
        .split(/[\n,;]/)
        .map(e => e.trim())
        .filter(e => e.includes('@'));
    }
    
    createMutation.mutate({
      ...newCampaign,
      audience_filter: audienceFilter
    });
  };

  const handleAction = (campaignId, action) => {
    actionMutation.mutate({ campaignId, action, previewEmail });
  };

  const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    const Icon = config.icon;
    return (
      <Badge variant="secondary" className={`${config.bg} ${config.color} gap-1`}>
        <Icon className={`h-3 w-3 ${config.spin ? 'animate-spin' : ''}`} />
        {t(config.label)}
      </Badge>
    );
  };

  // Stats
  const stats = {
    total: campaigns.length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalSent: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0),
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Campaigns', ar: 'حملات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.draft}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Drafts', ar: 'مسودات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Completed', ar: 'مكتملة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Emails Sent', ar: 'رسائل مرسلة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">{t({ en: 'Email Campaigns', ar: 'حملات البريد' })}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t({ en: 'New Campaign', ar: 'حملة جديدة' })}
          </Button>
        </div>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t({ en: 'No campaigns yet', ar: 'لا توجد حملات بعد' })}</p>
              <Button variant="link" onClick={() => setShowCreateDialog(true)}>
                {t({ en: 'Create your first campaign', ar: 'إنشاء أول حملة' })}
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="divide-y">
                {campaigns.map(campaign => (
                  <div
                    key={campaign.id}
                    onClick={() => { setSelectedCampaign(campaign); setShowDetailsDialog(true); }}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{campaign.name}</p>
                          <StatusBadge status={campaign.status} />
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {campaign.email_templates?.name_en || campaign.email_templates?.template_key}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {campaign.recipient_count || 0} {t({ en: 'recipients', ar: 'مستلم' })}
                          </span>
                          {campaign.sent_count > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              {campaign.sent_count} {t({ en: 'sent', ar: 'مرسل' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              {t({ en: 'Create Campaign', ar: 'إنشاء حملة' })}
            </DialogTitle>
            <DialogDescription>
              {t({ en: 'Send bulk emails to a targeted audience', ar: 'إرسال رسائل جماعية لجمهور مستهدف' })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Campaign Name', ar: 'اسم الحملة' })} *</label>
              <Input
                value={newCampaign.name}
                onChange={e => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t({ en: 'e.g., December Newsletter', ar: 'مثال: نشرة ديسمبر' })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t({ en: 'Description', ar: 'الوصف' })}</label>
              <Textarea
                value={newCampaign.description}
                onChange={e => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">{t({ en: 'Email Template', ar: 'قالب البريد' })} *</label>
              <Select
                value={newCampaign.template_id}
                onValueChange={value => setNewCampaign(prev => ({ ...prev, template_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select template', ar: 'اختر القالب' })} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(tmpl => (
                    <SelectItem key={tmpl.id} value={tmpl.id}>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{tmpl.category}</Badge>
                        {tmpl.name_en}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">{t({ en: 'Audience', ar: 'الجمهور' })}</label>
              <Select
                value={newCampaign.audience_type}
                onValueChange={value => setNewCampaign(prev => ({ ...prev, audience_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {newCampaign.audience_type === 'custom' && (
              <div>
                <label className="text-sm font-medium">{t({ en: 'Email Addresses', ar: 'عناوين البريد' })}</label>
                <Textarea
                  value={customEmails}
                  onChange={e => setCustomEmails(e.target.value)}
                  placeholder={t({ en: 'Enter email addresses (one per line, or comma-separated)', ar: 'أدخل عناوين البريد (واحد في كل سطر أو مفصولة بفواصل)' })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {customEmails.split(/[\n,;]/).filter(e => e.trim().includes('@')).length} {t({ en: 'valid emails', ar: 'بريد صالح' })}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Create Campaign', ar: 'إنشاء الحملة' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name}</DialogTitle>
            <DialogDescription>
              {selectedCampaign?.description || t({ en: 'Campaign details and actions', ar: 'تفاصيل وإجراءات الحملة' })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-4">
              {/* Status and Stats */}
              <div className="flex items-center gap-4">
                <StatusBadge status={selectedCampaign.status} />
                <span className="text-sm text-muted-foreground">
                  {t({ en: 'Created', ar: 'أنشئت' })} {format(new Date(selectedCampaign.created_at), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xl font-bold">{selectedCampaign.recipient_count || 0}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Recipients', ar: 'مستلمين' })}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-green-600">{selectedCampaign.sent_count || 0}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Sent', ar: 'مرسل' })}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-red-600">{selectedCampaign.failed_count || 0}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Failed', ar: 'فشل' })}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-blue-600">{selectedCampaign.opened_count || 0}</p>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Opened', ar: 'مفتوح' })}</p>
                </div>
              </div>
              
              {/* Template Info */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">{t({ en: 'Template', ar: 'القالب' })}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCampaign.email_templates?.name_en || selectedCampaign.email_templates?.template_key}
                </p>
              </div>
              
              {/* Preview Send */}
              {selectedCampaign.status === 'draft' && (
                <div className="flex items-center gap-2">
                  <Input
                    value={previewEmail}
                    onChange={e => setPreviewEmail(e.target.value)}
                    placeholder={t({ en: 'Email for preview', ar: 'بريد للمعاينة' })}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleAction(selectedCampaign.id, 'preview')}
                    disabled={!previewEmail || actionMutation.isPending}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t({ en: 'Preview', ar: 'معاينة' })}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedCampaign?.status === 'draft' && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(selectedCampaign.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t({ en: 'Delete', ar: 'حذف' })}
                </Button>
                <div className="flex-1" />
                <Button
                  onClick={() => handleAction(selectedCampaign.id, 'send')}
                  disabled={actionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {t({ en: 'Send Campaign', ar: 'إرسال الحملة' })}
                </Button>
              </>
            )}
            {selectedCampaign?.status === 'sending' && (
              <Button
                variant="outline"
                onClick={() => handleAction(selectedCampaign.id, 'pause')}
                disabled={actionMutation.isPending}
              >
                <Pause className="h-4 w-4 mr-2" />
                {t({ en: 'Pause', ar: 'إيقاف' })}
              </Button>
            )}
            {selectedCampaign?.status === 'paused' && (
              <Button
                onClick={() => handleAction(selectedCampaign.id, 'send')}
                disabled={actionMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                {t({ en: 'Resume', ar: 'استئناف' })}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
