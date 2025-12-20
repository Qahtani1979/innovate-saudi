import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Bell, Mail, Smartphone, Clock, Loader2, Save, Shield, MessageSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Separator } from "@/components/ui/separator";

const EMAIL_CATEGORIES = [
  { key: 'authentication', icon: Shield, labelEn: 'Authentication & Security', labelAr: 'المصادقة والأمان', critical: true },
  { key: 'challenges', icon: MessageSquare, labelEn: 'Challenges', labelAr: 'التحديات' },
  { key: 'pilots', icon: MessageSquare, labelEn: 'Pilots', labelAr: 'المشاريع التجريبية' },
  { key: 'solutions', icon: MessageSquare, labelEn: 'Solutions', labelAr: 'الحلول' },
  { key: 'contracts', icon: MessageSquare, labelEn: 'Contracts', labelAr: 'العقود' },
  { key: 'evaluations', icon: MessageSquare, labelEn: 'Evaluations', labelAr: 'التقييمات' },
  { key: 'events', icon: MessageSquare, labelEn: 'Events', labelAr: 'الفعاليات' },
  { key: 'tasks', icon: MessageSquare, labelEn: 'Tasks', labelAr: 'المهام' },
  { key: 'programs', icon: MessageSquare, labelEn: 'Programs', labelAr: 'البرامج' },
  { key: 'proposals', icon: MessageSquare, labelEn: 'Proposals', labelAr: 'المقترحات' },
  { key: 'roles', icon: MessageSquare, labelEn: 'Role Requests', labelAr: 'طلبات الأدوار' },
  { key: 'finance', icon: MessageSquare, labelEn: 'Finance & Payments', labelAr: 'المالية والمدفوعات' },
  { key: 'citizen', icon: MessageSquare, labelEn: 'Citizen Engagement', labelAr: 'مشاركة المواطنين' },
  { key: 'marketing', icon: MessageSquare, labelEn: 'Marketing & Announcements', labelAr: 'التسويق والإعلانات' },
];

const DEFAULT_PREFERENCES = {
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
  in_app_notifications: true,
  frequency: 'immediate',
  quiet_hours_start: null,
  quiet_hours_end: null,
  notification_types: {
    challenges: true,
    pilots: true,
    solutions: true,
    approvals: true,
    tasks: true,
    events: true,
    system: true
  },
  email_categories: EMAIL_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: true }), {})
};

export default function NotificationPreferences() {
  const { t, language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-prefs', currentUser?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_email', currentUser?.email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser
  });

  const [localPrefs, setLocalPrefs] = useState(null);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs({
        ...DEFAULT_PREFERENCES,
        ...preferences,
        email_categories: { ...DEFAULT_PREFERENCES.email_categories, ...(preferences.email_categories || {}) },
        notification_types: { ...DEFAULT_PREFERENCES.notification_types, ...(preferences.notification_types || {}) }
      });
      setQuietHoursEnabled(!!preferences.quiet_hours_start);
    } else if (currentUser) {
      setLocalPrefs({
        ...DEFAULT_PREFERENCES,
        user_email: currentUser.email,
        user_id: currentUser.id
      });
    }
  }, [preferences, currentUser]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const prefsToSave = {
        ...data,
        quiet_hours_start: quietHoursEnabled ? data.quiet_hours_start : null,
        quiet_hours_end: quietHoursEnabled ? data.quiet_hours_end : null,
      };
      
      if (preferences?.id) {
        const { error } = await supabase
          .from('user_notification_preferences')
          .update(prefsToSave)
          .eq('id', preferences.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_notification_preferences')
          .insert({
            ...prefsToSave,
            user_email: currentUser.email,
            user_id: currentUser.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-prefs']);
      toast.success(t({ en: 'Preferences saved successfully', ar: 'تم حفظ التفضيلات بنجاح' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to save preferences', ar: 'فشل حفظ التفضيلات' }));
      console.error('Save error:', error);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(localPrefs);
  };

  const updateCategory = (key, value) => {
    setLocalPrefs({
      ...localPrefs,
      email_categories: { ...localPrefs.email_categories, [key]: value }
    });
  };

  if (isLoading || !localPrefs) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground">
        <Bell className="absolute top-4 right-4 h-24 w-24 opacity-10" />
        <h1 className="text-3xl font-bold mb-2">
          {t({ en: 'Notification Preferences', ar: 'تفضيلات الإشعارات' })}
        </h1>
        <p className="text-primary-foreground/80">
          {t({ en: 'Customize how and when you receive notifications', ar: 'خصص كيف ومتى تتلقى الإشعارات' })}
        </p>
      </div>

      {/* Master Switches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t({ en: 'Notification Channels', ar: 'قنوات الإشعارات' })}
          </CardTitle>
          <CardDescription>
            {t({ en: 'Choose how you want to receive notifications', ar: 'اختر كيف تريد تلقي الإشعارات' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t({ en: 'Email Notifications', ar: 'إشعارات البريد الإلكتروني' })}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Receive updates via email', ar: 'تلقي التحديثات عبر البريد' })}</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.email_notifications}
              onCheckedChange={(checked) => setLocalPrefs({...localPrefs, email_notifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t({ en: 'In-App Notifications', ar: 'إشعارات داخل التطبيق' })}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Show notifications in the platform', ar: 'عرض الإشعارات في المنصة' })}</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.in_app_notifications}
              onCheckedChange={(checked) => setLocalPrefs({...localPrefs, in_app_notifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t({ en: 'Push Notifications', ar: 'الإشعارات الفورية' })}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Browser push notifications', ar: 'إشعارات المتصفح الفورية' })}</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.push_notifications}
              onCheckedChange={(checked) => setLocalPrefs({...localPrefs, push_notifications: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t({ en: 'Email Frequency', ar: 'تكرار البريد الإلكتروني' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select 
            value={localPrefs.frequency} 
            onValueChange={(val) => setLocalPrefs({...localPrefs, frequency: val})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">{t({ en: 'Immediate (Real-time)', ar: 'فوري' })}</SelectItem>
              <SelectItem value="daily">{t({ en: 'Daily Digest', ar: 'ملخص يومي' })}</SelectItem>
              <SelectItem value="weekly">{t({ en: 'Weekly Digest', ar: 'ملخص أسبوعي' })}</SelectItem>
            </SelectContent>
          </Select>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t({ en: 'Quiet Hours', ar: 'ساعات الهدوء' })}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Pause notifications during specific hours', ar: 'إيقاف الإشعارات خلال ساعات معينة' })}</p>
              </div>
              <Switch
                checked={quietHoursEnabled}
                onCheckedChange={setQuietHoursEnabled}
              />
            </div>

            {quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {t({ en: 'Start time', ar: 'وقت البداية' })}
                  </label>
                  <input
                    type="time"
                    value={localPrefs.quiet_hours_start || '22:00'}
                    onChange={(e) => setLocalPrefs({...localPrefs, quiet_hours_start: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {t({ en: 'End time', ar: 'وقت النهاية' })}
                  </label>
                  <input
                    type="time"
                    value={localPrefs.quiet_hours_end || '08:00'}
                    onChange={(e) => setLocalPrefs({...localPrefs, quiet_hours_end: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 bg-background"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Categories */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Email Categories', ar: 'فئات البريد الإلكتروني' })}</CardTitle>
          <CardDescription>
            {t({ en: 'Choose which types of emails you want to receive', ar: 'اختر أنواع رسائل البريد التي تريد تلقيها' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {EMAIL_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {language === 'ar' ? category.labelAr : category.labelEn}
                    </span>
                    {category.critical && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                        {t({ en: 'Required', ar: 'مطلوب' })}
                      </span>
                    )}
                  </div>
                  <Switch
                    checked={localPrefs.email_categories?.[category.key] ?? true}
                    onCheckedChange={(checked) => updateCategory(category.key, checked)}
                    disabled={category.critical}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pb-8">
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t({ en: 'Save Preferences', ar: 'حفظ التفضيلات' })}
        </Button>
      </div>
    </div>
  );
}
