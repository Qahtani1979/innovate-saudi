import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import TwoFactorSetup from '../components/security/TwoFactorSetup';
import ExternalCalendarSync from '../components/calendar/ExternalCalendarSync';
import { Settings as SettingsIcon, User, Bell, Globe, Shield, Save, Palette, Eye, Keyboard, Link as LinkIcon, Activity, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import FileUploader from '../components/FileUploader';
import TwoFactorAuth from '../components/auth/TwoFactorAuth';
import ProtectedPage from '../components/permissions/ProtectedPage';

function Settings() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const [profile, setProfile] = useState({});
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

  const [workPrefs, setWorkPrefs] = useState({
    default_view: 'cards',
    auto_save: true,
    show_tutorials: true
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['me']);
      toast.success(t({ en: 'Profile updated', ar: 'تم تحديث الملف' }));
    }
  });

  React.useEffect(() => {
    if (user) {
      setProfile({ full_name: user.full_name, email: user.email });
    }
  }, [user]);

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

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-10">
          <TabsTrigger value="profile">
            <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Profile', ar: 'الملف' })}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Notifications', ar: 'الإشعارات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="language">
            <Globe className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Language', ar: 'اللغة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Security', ar: 'الأمان' })}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Appearance', ar: 'المظهر' })}</span>
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Privacy', ar: 'الخصوصية' })}</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Keyboard className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Accessibility', ar: 'إمكانية الوصول' })}</span>
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <LinkIcon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Integrations', ar: 'التكاملات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="work">
            <Activity className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Work', ar: 'العمل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Activity className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden lg:inline">{t({ en: 'Analytics', ar: 'التحليلات' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Profile Information', ar: 'معلومات الملف' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Avatar', ar: 'الصورة الشخصية' })}</label>
                <FileUploader
                  onUpload={(url) => setProfile({ ...profile, avatar_url: url })}
                  accept="image/*"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Full Name', ar: 'الاسم الكامل' })}</label>
                  <Input
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Title/Position', ar: 'المسمى الوظيفي' })}</label>
                  <Input
                    value={profile.title || ''}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Bio', ar: 'نبذة' })}</label>
                <Textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  placeholder={t({ en: 'Tell us about yourself...', ar: 'أخبرنا عن نفسك...' })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Email', ar: 'البريد الإلكتروني' })}</label>
                <Input value={profile.email || ''} disabled className="bg-slate-100" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Role', ar: 'الدور' })}</label>
                <Input value={user?.role || ''} disabled className="bg-slate-100" />
              </div>
              <Button
                className="bg-blue-600"
                onClick={() => updateProfileMutation.mutate(profile)}
              >
                <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Notification Preferences', ar: 'تفضيلات الإشعارات' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <label className="text-sm font-medium">{t({ en: 'Email Notifications', ar: 'إشعارات البريد' })}</label>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <label className="text-sm font-medium">{t({ en: 'Push Notifications', ar: 'الإشعارات الفورية' })}</label>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <label className="text-sm font-medium">{t({ en: 'Challenge Alerts', ar: 'تنبيهات التحديات' })}</label>
                  <Switch
                    checked={notifications.challenges}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, challenges: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <label className="text-sm font-medium">{t({ en: 'Pilot Updates', ar: 'تحديثات التجارب' })}</label>
                  <Switch
                    checked={notifications.pilots}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pilots: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <label className="text-sm font-medium">{t({ en: 'Program Invites', ar: 'دعوات البرامج' })}</label>
                  <Switch
                    checked={notifications.programs}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, programs: checked })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t({ en: 'Digest Frequency', ar: 'تكرار الملخص' })}</label>
                  <Select value={notifications.digest_frequency} onValueChange={(v) => setNotifications({...notifications, digest_frequency: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">{t({ en: 'Real-time', ar: 'فوري' })}</SelectItem>
                      <SelectItem value="daily">{t({ en: 'Daily Digest', ar: 'ملخص يومي' })}</SelectItem>
                      <SelectItem value="weekly">{t({ en: 'Weekly Digest', ar: 'ملخص أسبوعي' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Quiet Hours Start', ar: 'بداية الهدوء' })}</label>
                    <Input
                      type="time"
                      value={notifications.quiet_hours_start}
                      onChange={(e) => setNotifications({...notifications, quiet_hours_start: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Quiet Hours End', ar: 'نهاية الهدوء' })}</label>
                    <Input
                      type="time"
                      value={notifications.quiet_hours_end}
                      onChange={(e) => setNotifications({...notifications, quiet_hours_end: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={() => toast.success(t({ en: 'Notification preferences saved', ar: 'تم حفظ تفضيلات الإشعارات' }))} className="w-full bg-blue-600">
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: 'Save Preferences', ar: 'حفظ التفضيلات' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Language & Region', ar: 'اللغة والمنطقة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    {t({ en: 'Current Language: English', ar: 'اللغة الحالية: العربية' })}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {t({ en: 'Use the globe icon in the top bar to switch languages', ar: 'استخدم أيقونة الكرة الأرضية في الشريط العلوي لتبديل اللغات' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-4">
            <TwoFactorAuth 
              user={user}
              onUpdate={(data) => updateProfileMutation.mutate(data)}
            />

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Password & Authentication', ar: 'كلمة المرور والمصادقة' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Change Password', ar: 'تغيير كلمة المرور' })}</label>
                <Button variant="outline" className="w-full">
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
                  <Button variant="outline" size="sm" className="w-full">
                    {t({ en: 'View All Sessions', ar: 'عرض جميع الجلسات' })}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm font-medium text-slate-900 mb-2">{t({ en: 'Login History', ar: 'سجل الدخول' })}</p>
                <Button variant="outline" size="sm" className="w-full">
                  {t({ en: 'View Login History', ar: 'عرض سجل الدخول' })}
                </Button>
              </div>
              </CardContent>
              </Card>
              </div>
              </TabsContent>

              <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Appearance & Theme', ar: 'المظهر والثيم' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Theme', ar: 'الثيم' })}</label>
                <Select value={appearance.theme} onValueChange={(v) => setAppearance({...appearance, theme: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t({ en: 'Light', ar: 'فاتح' })}</SelectItem>
                    <SelectItem value="dark">{t({ en: 'Dark', ar: 'داكن' })}</SelectItem>
                    <SelectItem value="auto">{t({ en: 'Auto (System)', ar: 'تلقائي (النظام)' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Font Size', ar: 'حجم الخط' })}</label>
                <Select value={appearance.font_size} onValueChange={(v) => setAppearance({...appearance, font_size: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{t({ en: 'Small', ar: 'صغير' })}</SelectItem>
                    <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                    <SelectItem value="large">{t({ en: 'Large', ar: 'كبير' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Interface Density', ar: 'كثافة الواجهة' })}</label>
                <Select value={appearance.density} onValueChange={(v) => setAppearance({...appearance, density: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">{t({ en: 'Compact', ar: 'مضغوط' })}</SelectItem>
                    <SelectItem value="comfortable">{t({ en: 'Comfortable', ar: 'مريح' })}</SelectItem>
                    <SelectItem value="spacious">{t({ en: 'Spacious', ar: 'واسع' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => toast.success(t({ en: 'Appearance saved', ar: 'تم حفظ المظهر' }))} className="w-full bg-purple-600">
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Save Appearance', ar: 'حفظ المظهر' })}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full mb-2">
                  {t({ en: 'Export My Data', ar: 'تصدير بياناتي' })}
                </Button>
                <Button variant="destructive" className="w-full">
                  {t({ en: 'Delete Account', ar: 'حذف الحساب' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Accessibility Settings', ar: 'إعدادات إمكانية الوصول' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t({ en: 'High Contrast Mode', ar: 'وضع التباين العالي' })}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Increase visual contrast', ar: 'زيادة التباين البصري' })}</p>
                </div>
                <Switch
                  checked={accessibility.high_contrast}
                  onCheckedChange={(v) => setAccessibility({...accessibility, high_contrast: v})}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t({ en: 'Reduce Motion', ar: 'تقليل الحركة' })}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Minimize animations', ar: 'تقليل الرسوم المتحركة' })}</p>
                </div>
                <Switch
                  checked={accessibility.reduce_motion}
                  onCheckedChange={(v) => setAccessibility({...accessibility, reduce_motion: v})}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t({ en: 'Screen Reader Optimized', ar: 'محسن لقارئ الشاشة' })}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Enhanced ARIA labels', ar: 'تسميات ARIA محسنة' })}</p>
                </div>
                <Switch
                  checked={accessibility.screen_reader}
                  onCheckedChange={(v) => setAccessibility({...accessibility, screen_reader: v})}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t({ en: 'Keyboard Navigation Enhanced', ar: 'تحسين التنقل بلوحة المفاتيح' })}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Show focus indicators', ar: 'عرض مؤشرات التركيز' })}</p>
                </div>
                <Switch
                  checked={accessibility.keyboard_nav}
                  onCheckedChange={(v) => setAccessibility({...accessibility, keyboard_nav: v})}
                />
              </div>

              <Button onClick={() => toast.success(t({ en: 'Accessibility saved', ar: 'تم حفظ إمكانية الوصول' }))} className="w-full bg-indigo-600">
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Save Accessibility', ar: 'حفظ إمكانية الوصول' })}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Connected Apps & Services', ar: 'التطبيقات والخدمات المتصلة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border text-center">
                <p className="text-sm text-slate-600 mb-3">{t({ en: 'No integrations connected', ar: 'لا توجد تكاملات متصلة' })}</p>
                <Button variant="outline">
                  {t({ en: 'Connect Slack', ar: 'ربط Slack' })}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Personal API Key', ar: 'مفتاح API شخصي' })}</label>
                <div className="flex gap-2">
                  <Input value="••••••••••••••" disabled className="bg-slate-100" />
                  <Button variant="outline">{t({ en: 'Generate', ar: 'توليد' })}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

              <Button onClick={() => toast.success(t({ en: 'Work preferences saved', ar: 'تم حفظ تفضيلات العمل' }))} className="w-full bg-cyan-600">
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Save Preferences', ar: 'حفظ التفضيلات' })}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Personal Analytics', ar: 'التحليلات الشخصية' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">12</p>
                  <p className="text-xs text-slate-600 mt-1">{t({ en: 'Contributions', ar: 'مساهمات' })}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">5</p>
                  <p className="text-xs text-slate-600 mt-1">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">85%</p>
                  <p className="text-xs text-slate-600 mt-1">{t({ en: 'Engagement', ar: 'المشاركة' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(Settings, { requiredPermissions: [] });