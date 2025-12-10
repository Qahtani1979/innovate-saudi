import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import TwoFactorSetup from '../components/security/TwoFactorSetup';
import ExternalCalendarSync from '../components/calendar/ExternalCalendarSync';
import { Settings as SettingsIcon, User, Bell, Globe, Shield, Save, Palette, Eye, Keyboard, Link as LinkIcon, Activity, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import SupabaseFileUploader from '../components/uploads/SupabaseFileUploader';
import TwoFactorAuth from '../components/auth/TwoFactorAuth';
import ProtectedPage from '../components/permissions/ProtectedPage';
import ChangePasswordDialog from '../components/auth/ChangePasswordDialog';
import DeleteAccountDialog from '../components/auth/DeleteAccountDialog';
import SessionsDialog from '../components/auth/SessionsDialog';
import LoginHistoryDialog from '../components/auth/LoginHistoryDialog';

function Settings() {
  const { language, isRTL, t } = useLanguage();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user profile from Supabase
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile-settings', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!authUser?.id
  });

  // Fetch user settings from Supabase
  const { data: userSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['user-settings', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!authUser?.id
  });

  const [localProfile, setLocalProfile] = useState({});
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    challenges: true,
    pilots: true,
    programs: true,
    digest_frequency: 'daily',
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  });
  
  const [appearance, setAppearance] = useState({
    theme: 'auto',
    font_size: 'medium',
    density: 'comfortable'
  });

  const [privacy, setPrivacy] = useState({
    profile_visibility: 'public',
    show_activity: true,
    allow_messages: true
  });

  const [accessibility, setAccessibility] = useState({
    high_contrast: false,
    reduce_motion: false,
    screen_reader: false,
    keyboard_nav: false
  });

  // Dialog states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);

  const [workPrefs, setWorkPrefs] = useState({
    default_view: 'cards',
    auto_save: true,
    show_tutorials: true
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (!authUser?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authUser.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile-settings']);
      toast.success(t({ en: 'Profile updated', ar: 'تم تحديث الملف' }));
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast.error(t({ en: 'Failed to update profile', ar: 'فشل في تحديث الملف' }));
    }
  });

  // Update settings mutation (upsert)
  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (!authUser?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: authUser.id,
          ...data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-settings']);
      toast.success(t({ en: 'Settings saved', ar: 'تم حفظ الإعدادات' }));
    },
    onError: (error) => {
      console.error('Settings update error:', error);
      toast.error(t({ en: 'Failed to save settings', ar: 'فشل في حفظ الإعدادات' }));
    }
  });

  useEffect(() => {
    if (profile) {
      setLocalProfile({ 
        full_name: profile.full_name_en || profile.full_name, 
        email: profile.user_email || authUser?.email,
        title: profile.title_en || profile.job_title_en,
        bio: profile.bio_en || profile.bio,
        avatar_url: profile.avatar_url
      });
    }
  }, [profile, authUser]);

  // Load settings from database
  useEffect(() => {
    if (userSettings) {
      setNotifications({
        email: userSettings.notifications_email ?? true,
        push: userSettings.notifications_push ?? false,
        challenges: userSettings.notifications_challenges ?? true,
        pilots: userSettings.notifications_pilots ?? true,
        programs: userSettings.notifications_programs ?? true,
        digest_frequency: userSettings.notifications_digest_frequency ?? 'daily',
        quiet_hours_start: userSettings.notifications_quiet_hours_start ?? '22:00',
        quiet_hours_end: userSettings.notifications_quiet_hours_end ?? '08:00'
      });
      setAppearance({
        theme: userSettings.theme ?? 'auto',
        font_size: userSettings.font_size ?? 'medium',
        density: userSettings.density ?? 'comfortable'
      });
      setPrivacy({
        profile_visibility: userSettings.profile_visibility ?? 'public',
        show_activity: userSettings.show_activity ?? true,
        allow_messages: userSettings.allow_messages ?? true
      });
      setAccessibility({
        high_contrast: userSettings.high_contrast ?? false,
        reduce_motion: userSettings.reduce_motion ?? false,
        screen_reader: userSettings.screen_reader_optimized ?? false,
        keyboard_nav: userSettings.keyboard_navigation ?? false
      });
      setWorkPrefs({
        default_view: userSettings.default_view ?? 'cards',
        auto_save: userSettings.auto_save ?? true,
        show_tutorials: userSettings.show_tutorials ?? true
      });
    }
  }, [userSettings]);

  // Save handlers
  const saveNotifications = () => {
    updateSettingsMutation.mutate({
      notifications_email: notifications.email,
      notifications_push: notifications.push,
      notifications_challenges: notifications.challenges,
      notifications_pilots: notifications.pilots,
      notifications_programs: notifications.programs,
      notifications_digest_frequency: notifications.digest_frequency,
      notifications_quiet_hours_start: notifications.quiet_hours_start,
      notifications_quiet_hours_end: notifications.quiet_hours_end
    });
  };

  const saveAppearance = () => {
    updateSettingsMutation.mutate({
      theme: appearance.theme,
      font_size: appearance.font_size,
      density: appearance.density
    });
  };

  const savePrivacy = () => {
    updateSettingsMutation.mutate({
      profile_visibility: privacy.profile_visibility,
      show_activity: privacy.show_activity,
      allow_messages: privacy.allow_messages
    });
  };

  const saveAccessibility = () => {
    updateSettingsMutation.mutate({
      high_contrast: accessibility.high_contrast,
      reduce_motion: accessibility.reduce_motion,
      screen_reader_optimized: accessibility.screen_reader,
      keyboard_navigation: accessibility.keyboard_nav
    });
  };

  const saveWorkPrefs = () => {
    updateSettingsMutation.mutate({
      default_view: workPrefs.default_view,
      auto_save: workPrefs.auto_save,
      show_tutorials: workPrefs.show_tutorials
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Settings', ar: 'الإعدادات' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Manage your profile and preferences', ar: 'إدارة ملفك الشخصي وتفضيلاتك' })}
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">
            <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden sm:inline">{t({ en: 'Account', ar: 'الحساب' })}</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden sm:inline">{t({ en: 'Security', ar: 'الأمان' })}</span>
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden sm:inline">{t({ en: 'Privacy', ar: 'الخصوصية' })}</span>
          </TabsTrigger>
          <TabsTrigger value="work">
            <Activity className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden sm:inline">{t({ en: 'Work', ar: 'العمل' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Account Information', ar: 'معلومات الحساب' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Email Address', ar: 'البريد الإلكتروني' })}</label>
                <Input value={authUser?.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">{t({ en: 'Contact support to change your email', ar: 'اتصل بالدعم لتغيير بريدك الإلكتروني' })}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Account Type', ar: 'نوع الحساب' })}</label>
                <Input value={profile?.selected_persona || 'Citizen'} disabled className="bg-muted" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Member Since', ar: 'عضو منذ' })}</label>
                <Input 
                  value={
                    profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : authUser?.created_at 
                        ? new Date(authUser.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : t({ en: 'Not available', ar: 'غير متوفر' })
                  } 
                  disabled 
                  className="bg-muted" 
                />
              </div>
              
              {/* Language Section */}
              <div className="pt-4 border-t">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">
                      {t({ en: 'Current Language: English', ar: 'اللغة الحالية: العربية' })}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t({ en: 'Use the globe icon in the top bar to switch languages', ar: 'استخدم أيقونة الكرة الأرضية في الشريط العلوي لتبديل اللغات' })}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">{t({ en: 'To edit your profile details (name, bio, avatar, skills), visit the Profile page.', ar: 'لتعديل تفاصيل ملفك الشخصي (الاسم، السيرة، الصورة، المهارات)، قم بزيارة صفحة الملف الشخصي.' })}</p>
                <Button variant="outline" onClick={() => window.location.href = '/user-profile'}>
                  <User className="h-4 w-4 mr-2" />
                  {t({ en: 'Go to Profile', ar: 'الذهاب للملف الشخصي' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications tab removed - not needed */}

        <TabsContent value="security">
          <div className="space-y-4">
            <TwoFactorAuth 
              user={authUser}
              onUpdate={(data) => updateProfileMutation.mutate(data)}
            />

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Password & Authentication', ar: 'كلمة المرور والمصادقة' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Change Password', ar: 'تغيير كلمة المرور' })}</label>
                <Button variant="outline" className="w-full" onClick={() => setShowChangePassword(true)}>
                  {t({ en: 'Update Password', ar: 'تحديث كلمة المرور' })}
                </Button>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm font-medium text-slate-900 mb-2">{t({ en: 'Active Sessions', ar: 'الجلسات النشطة' })}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t({ en: 'Current Device', ar: 'الجهاز الحالي' })}</span>
                    <Badge className="bg-green-600">{t({ en: 'Active', ar: 'نشط' })}</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setShowSessions(true)}>
                    {t({ en: 'View All Sessions', ar: 'عرض جميع الجلسات' })}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm font-medium text-slate-900 mb-2">{t({ en: 'Login History', ar: 'سجل الدخول' })}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowLoginHistory(true)}>
                  {t({ en: 'View Login History', ar: 'عرض سجل الدخول' })}
                </Button>
              </div>
              </CardContent>
              </Card>
              </div>
              </TabsContent>

        {/* Appearance tab removed - not needed */}

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Privacy & Data Controls', ar: 'الخصوصية والتحكم بالبيانات' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Profile Visibility', ar: 'ظهور الملف' })}</label>
                <Select value={privacy.profile_visibility} onValueChange={(v) => setPrivacy({...privacy, profile_visibility: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">{t({ en: 'Public', ar: 'عام' })}</SelectItem>
                    <SelectItem value="registered">{t({ en: 'Registered Users Only', ar: 'المستخدمين المسجلين فقط' })}</SelectItem>
                    <SelectItem value="private">{t({ en: 'Private', ar: 'خاص' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t({ en: 'Show Activity', ar: 'عرض النشاط' })}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Display your platform activity', ar: 'عرض نشاطك على المنصة' })}</p>
                </div>
                <Switch
                  checked={privacy.show_activity}
                  onCheckedChange={(v) => setPrivacy({...privacy, show_activity: v})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t({ en: 'Allow Messages', ar: 'السماح بالرسائل' })}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Other users can message you', ar: 'يمكن للمستخدمين الآخرين مراسلتك' })}</p>
                </div>
                <Switch
                  checked={privacy.allow_messages}
                  onCheckedChange={(v) => setPrivacy({...privacy, allow_messages: v})}
                />
              </div>

              <Button onClick={savePrivacy} disabled={updateSettingsMutation.isPending} className="w-full bg-green-600 mb-4">
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Save Privacy Settings', ar: 'حفظ إعدادات الخصوصية' })}
              </Button>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full mb-2">
                  {t({ en: 'Export My Data', ar: 'تصدير بياناتي' })}
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => setShowDeleteAccount(true)}>
                  {t({ en: 'Delete Account', ar: 'حذف الحساب' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility and Integrations tabs removed */}

        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Work Preferences', ar: 'تفضيلات العمل' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Default View', ar: 'العرض الافتراضي' })}</label>
                <Select value={workPrefs.default_view} onValueChange={(v) => setWorkPrefs({...workPrefs, default_view: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">{t({ en: 'Cards', ar: 'بطاقات' })}</SelectItem>
                    <SelectItem value="table">{t({ en: 'Table', ar: 'جدول' })}</SelectItem>
                    <SelectItem value="kanban">{t({ en: 'Kanban', ar: 'كانبان' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t({ en: 'Auto-Save Drafts', ar: 'حفظ المسودات تلقائياً' })}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Automatically save your work', ar: 'حفظ عملك تلقائياً' })}</p>
                </div>
                <Switch
                  checked={workPrefs.auto_save}
                  onCheckedChange={(v) => setWorkPrefs({...workPrefs, auto_save: v})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t({ en: 'Show Tutorials', ar: 'عرض الدروس' })}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Display helpful tips', ar: 'عرض نصائح مفيدة' })}</p>
                </div>
                <Switch
                  checked={workPrefs.show_tutorials}
                  onCheckedChange={(v) => setWorkPrefs({...workPrefs, show_tutorials: v})}
                />
              </div>

              <Button onClick={saveWorkPrefs} disabled={updateSettingsMutation.isPending} className="w-full bg-cyan-600">
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Save Preferences', ar: 'حفظ التفضيلات' })}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics tab removed - stats are shown in Profile page */}
      </Tabs>

      {/* Auth Dialogs */}
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
      <DeleteAccountDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount} />
      <SessionsDialog open={showSessions} onOpenChange={setShowSessions} />
      <LoginHistoryDialog open={showLoginHistory} onOpenChange={setShowLoginHistory} />
    </div>
  );
}

export default ProtectedPage(Settings, { requiredPermissions: [] });