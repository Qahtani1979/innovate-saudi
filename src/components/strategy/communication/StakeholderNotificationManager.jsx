import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useCommunicationNotifications } from '@/hooks/strategy/useCommunicationNotifications';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, Mail, MessageSquare, Smartphone, Send, Clock, 
  CheckCircle2, XCircle, AlertTriangle, Users, Loader2, 
  Calendar, BarChart3, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

const NOTIFICATION_TYPES = [
  { value: 'email', label_en: 'Email', label_ar: 'بريد إلكتروني', icon: <Mail className="h-4 w-4" /> },
  { value: 'sms', label_en: 'SMS', label_ar: 'رسالة نصية', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'push', label_en: 'Push', label_ar: 'إشعار فوري', icon: <Bell className="h-4 w-4" /> },
  { value: 'in_app', label_en: 'In-App', label_ar: 'داخل التطبيق', icon: <MessageSquare className="h-4 w-4" /> }
];

const RECIPIENT_TYPES = [
  { value: 'individual', label_en: 'Individual', label_ar: 'فرد' },
  { value: 'group', label_en: 'Group', label_ar: 'مجموعة' },
  { value: 'audience_segment', label_en: 'Audience Segment', label_ar: 'شريحة جمهور' },
  { value: 'all', label_en: 'All Stakeholders', label_ar: 'جميع أصحاب المصلحة' }
];

const AUDIENCE_SEGMENTS = [
  { value: 'municipality_staff', label_en: 'Municipality Staff', label_ar: 'موظفي البلدية' },
  { value: 'partners', label_en: 'Partners & Providers', label_ar: 'الشركاء والموردون' },
  { value: 'leadership', label_en: 'Leadership', label_ar: 'القيادة' },
  { value: 'citizens', label_en: 'Citizens', label_ar: 'المواطنون' }
];

export default function StakeholderNotificationManager({ communicationPlanId, strategicPlanId }) {
  const { t, language } = useLanguage();
  const { 
    notifications, 
    createNotification, 
    scheduleNotification,
    cancelNotification,
    getNotificationStats,
    isLoading, 
    isCreating 
  } = useCommunicationNotifications(communicationPlanId);

  const [activeTab, setActiveTab] = useState('create');
  const [notificationData, setNotificationData] = useState({
    notification_type: 'email',
    recipient_type: 'individual',
    recipient_emails: '',
    audience_segment: '',
    subject_en: '',
    subject_ar: '',
    content_en: '',
    content_ar: '',
    scheduled_at: '',
    template_id: ''
  });

  // Fetch email templates for integration
  const { data: emailTemplates = [] } = useQuery({
    queryKey: ['email-templates-for-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, template_key, name_en, name_ar, category, subject_en, subject_ar, body_en, body_ar')
        .eq('is_active', true)
        .order('category', { ascending: true });
      if (error) return [];
      return data || [];
    }
  });

  // Apply template when selected
  const handleTemplateSelect = (templateId) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setNotificationData(prev => ({
        ...prev,
        template_id: templateId,
        subject_en: template.subject_en || prev.subject_en,
        subject_ar: template.subject_ar || prev.subject_ar,
        content_en: template.body_en || prev.content_en,
        content_ar: template.body_ar || prev.content_ar
      }));
    }
  };

  // Fetch real user profiles for recipient selection
  const { data: availableRecipients = [], isLoading: recipientsLoading } = useQuery({
    queryKey: ['available-recipients', notificationData.audience_segment],
    queryFn: async () => {
      if (notificationData.recipient_type !== 'audience_segment' || !notificationData.audience_segment) {
        return [];
      }

      let query = supabase
        .from('user_profiles')
        .select('id, user_email, first_name, last_name, persona_type')
        .not('user_email', 'is', null)
        .limit(100);

      // Filter by persona type based on segment
      if (notificationData.audience_segment === 'municipality_staff') {
        query = query.in('persona_type', ['municipality_staff', 'municipality_admin', 'municipality_coordinator']);
      } else if (notificationData.audience_segment === 'partners') {
        query = query.in('persona_type', ['provider', 'partner']);
      } else if (notificationData.audience_segment === 'leadership') {
        query = query.in('persona_type', ['deputyship_admin', 'admin']);
      } else if (notificationData.audience_segment === 'citizens') {
        // Fetch from citizen_profiles for citizens
        const { data: citizenData } = await supabase
          .from('citizen_profiles')
          .select('id, user_email')
          .not('user_email', 'is', null)
          .limit(100);
        return citizenData || [];
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching recipients:', error);
        return [];
      }
      return data || [];
    },
    enabled: notificationData.recipient_type === 'audience_segment' && !!notificationData.audience_segment
  });

  // Get recipient count based on selection
  const { data: recipientCount = 0 } = useQuery({
    queryKey: ['recipient-count', notificationData.recipient_type, notificationData.audience_segment],
    queryFn: async () => {
      if (notificationData.recipient_type === 'all') {
        const { count } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .not('user_email', 'is', null);
        return count || 0;
      }
      if (notificationData.recipient_type === 'audience_segment' && notificationData.audience_segment) {
        return availableRecipients.length;
      }
      if (notificationData.recipient_type === 'individual') {
        return notificationData.recipient_emails.split(',').filter(e => e.trim()).length;
      }
      return 0;
    }
  });

  const stats = getNotificationStats();

  const handleSendNotification = async () => {
    if (!notificationData.subject_en || !notificationData.content_en) {
      toast.error(t({ en: 'Subject and content are required', ar: 'الموضوع والمحتوى مطلوبان' }));
      return;
    }

    try {
      const emails = notificationData.recipient_emails.split(',').map(e => e.trim()).filter(Boolean);
      
      await createNotification({
        communication_plan_id: communicationPlanId,
        notification_type: notificationData.notification_type,
        recipient_type: notificationData.recipient_type,
        recipient_emails: emails,
        subject_en: notificationData.subject_en,
        subject_ar: notificationData.subject_ar,
        content_en: notificationData.content_en,
        content_ar: notificationData.content_ar,
        scheduled_at: notificationData.scheduled_at || null,
        status: notificationData.scheduled_at ? 'scheduled' : 'pending'
      });

      toast.success(t({ 
        en: notificationData.scheduled_at ? 'Notification scheduled' : 'Notification created', 
        ar: notificationData.scheduled_at ? 'تم جدولة الإشعار' : 'تم إنشاء الإشعار' 
      }));

      setNotificationData({
        notification_type: 'email',
        recipient_type: 'individual',
        recipient_emails: '',
        subject_en: '',
        subject_ar: '',
        content_en: '',
        content_ar: '',
        scheduled_at: ''
      });
    } catch (error) {
      toast.error(t({ en: 'Failed to create notification', ar: 'فشل في إنشاء الإشعار' }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-muted text-muted-foreground'
    };
    return variants[status] || 'bg-muted';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          {t({ en: 'Stakeholder Notifications', ar: 'إشعارات أصحاب المصلحة' })}
        </CardTitle>
        <CardDescription>
          {t({ en: 'Manage and track stakeholder communications', ar: 'إدارة وتتبع اتصالات أصحاب المصلحة' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Sent', ar: 'مرسل' })}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Scheduled', ar: 'مجدول' })}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Pending', ar: 'قيد الانتظار' })}</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">
              <Send className="h-4 w-4 mr-2" />
              {t({ en: 'Create', ar: 'إنشاء' })}
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              {t({ en: 'History', ar: 'السجل' })}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t({ en: 'Analytics', ar: 'التحليلات' })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            {/* Email Template Selection (for email notifications) */}
            {notificationData.notification_type === 'email' && emailTemplates.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t({ en: 'Use Email Template (Optional)', ar: 'استخدام قالب بريد إلكتروني (اختياري)' })}</label>
                <Select
                  value={notificationData.template_id}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Select a template', ar: 'اختر قالب' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{template.category}</Badge>
                          {language === 'ar' ? (template.name_ar || template.name_en) : template.name_en}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t({ en: 'Notification Type', ar: 'نوع الإشعار' })}</label>
                <Select
                  value={notificationData.notification_type}
                  onValueChange={(value) => setNotificationData(prev => ({ ...prev, notification_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {language === 'ar' ? type.label_ar : type.label_en}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t({ en: 'Recipient Type', ar: 'نوع المستلم' })}</label>
                <Select
                  value={notificationData.recipient_type}
                  onValueChange={(value) => setNotificationData(prev => ({ ...prev, recipient_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECIPIENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {language === 'ar' ? type.label_ar : type.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {notificationData.recipient_type === 'individual' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t({ en: 'Recipient Emails (comma-separated)', ar: 'البريد الإلكتروني للمستلمين (مفصولة بفواصل)' })}</label>
                <Input
                  value={notificationData.recipient_emails}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, recipient_emails: e.target.value }))}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
            )}

            {notificationData.recipient_type === 'audience_segment' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t({ en: 'Audience Segment', ar: 'شريحة الجمهور' })}</label>
                  <Select
                    value={notificationData.audience_segment}
                    onValueChange={(value) => setNotificationData(prev => ({ ...prev, audience_segment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select segment', ar: 'اختر الشريحة' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIENCE_SEGMENTS.map(seg => (
                        <SelectItem key={seg.value} value={seg.value}>
                          {language === 'ar' ? seg.label_ar : seg.label_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {availableRecipients.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {t({ en: 'Recipients in segment:', ar: 'المستلمين في الشريحة:' })} {availableRecipients.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {availableRecipients.slice(0, 5).map(r => (
                        <Badge key={r.id} variant="secondary" className="text-xs">
                          {r.first_name || r.user_email}
                        </Badge>
                      ))}
                      {availableRecipients.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{availableRecipients.length - 5} {t({ en: 'more', ar: 'آخرين' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {notificationData.recipient_type === 'all' && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {t({ en: 'This will notify all registered stakeholders', ar: 'سيتم إشعار جميع أصحاب المصلحة المسجلين' })}
                    {recipientCount > 0 && ` (${recipientCount})`}
                  </span>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t({ en: 'Subject (English)', ar: 'الموضوع (إنجليزي)' })}</label>
                <Input
                  value={notificationData.subject_en}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, subject_en: e.target.value }))}
                  placeholder="Strategy Update: Q1 Progress Report"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t({ en: 'Subject (Arabic)', ar: 'الموضوع (عربي)' })}</label>
                <Input
                  value={notificationData.subject_ar}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, subject_ar: e.target.value }))}
                  placeholder="تحديث الاستراتيجية: تقرير تقدم الربع الأول"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t({ en: 'Content (English)', ar: 'المحتوى (إنجليزي)' })}</label>
                <Textarea
                  value={notificationData.content_en}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, content_en: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t({ en: 'Content (Arabic)', ar: 'المحتوى (عربي)' })}</label>
                <Textarea
                  value={notificationData.content_ar}
                  onChange={(e) => setNotificationData(prev => ({ ...prev, content_ar: e.target.value }))}
                  rows={4}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t({ en: 'Schedule (Optional)', ar: 'الجدولة (اختياري)' })}
              </label>
              <Input
                type="datetime-local"
                value={notificationData.scheduled_at}
                onChange={(e) => setNotificationData(prev => ({ ...prev, scheduled_at: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setNotificationData({
                notification_type: 'email',
                recipient_type: 'individual',
                recipient_emails: '',
                subject_en: '',
                subject_ar: '',
                content_en: '',
                content_ar: '',
                scheduled_at: ''
              })}>
                {t({ en: 'Clear', ar: 'مسح' })}
              </Button>
              <Button onClick={handleSendNotification} disabled={isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                {notificationData.scheduled_at 
                  ? t({ en: 'Schedule', ar: 'جدولة' })
                  : t({ en: 'Send Now', ar: 'إرسال الآن' })
                }
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'No notifications yet', ar: 'لا توجد إشعارات بعد' })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <Card key={notification.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(notification.status)}
                        <div>
                          <p className="font-medium">{notification.subject_en}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {notification.content_en?.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{notification.notification_type}</Badge>
                            <Badge className={getStatusBadge(notification.status)}>
                              {notification.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {notification.status === 'scheduled' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => cancelNotification(notification.id)}
                        >
                          {t({ en: 'Cancel', ar: 'إلغاء' })}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <h4 className="font-medium mb-4">{t({ en: 'Delivery Performance', ar: 'أداء التسليم' })}</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t({ en: 'Delivered', ar: 'تم التسليم' })}</span>
                      <span>{stats.totalDelivered}</span>
                    </div>
                    <Progress value={stats.total > 0 ? (stats.totalDelivered / stats.total) * 100 : 0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t({ en: 'Opened', ar: 'تم الفتح' })}</span>
                      <span>{stats.totalOpened}</span>
                    </div>
                    <Progress value={stats.totalDelivered > 0 ? (stats.totalOpened / stats.totalDelivered) * 100 : 0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t({ en: 'Clicked', ar: 'تم النقر' })}</span>
                      <span>{stats.totalClicked}</span>
                    </div>
                    <Progress value={stats.totalOpened > 0 ? (stats.totalClicked / stats.totalOpened) * 100 : 0} />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-4">{t({ en: 'Status Distribution', ar: 'توزيع الحالة' })}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{t({ en: 'Sent', ar: 'مرسل' })}</span>
                    </div>
                    <span className="font-medium">{stats.sent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{t({ en: 'Scheduled', ar: 'مجدول' })}</span>
                    </div>
                    <span className="font-medium">{stats.scheduled}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span>{t({ en: 'Pending', ar: 'قيد الانتظار' })}</span>
                    </div>
                    <span className="font-medium">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>{t({ en: 'Failed', ar: 'فشل' })}</span>
                    </div>
                    <span className="font-medium">{stats.failed}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
