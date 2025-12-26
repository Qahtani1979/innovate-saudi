import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { Save, Loader2, Palette, Globe, Link2, Mail, Shield } from 'lucide-react';
import { useEmailSettings } from '@/hooks/useEmailSettings';

const DEFAULT_SETTINGS = {
  default_from_email: 'onboarding@resend.dev',
  default_from_name: 'Saudi Innovates',
  default_from_name_ar: 'ابتكر السعودية',
  logo_url: '',
  primary_button_color: '#006C35',
  default_header_gradient_start: '#006C35',
  default_header_gradient_end: '#00A651',
  footer_contact_email: 'support@saudiinnovates.sa',
  footer_address: 'Riyadh, Saudi Arabia',
  footer_social_links: { twitter: '', linkedin: '' },
  daily_email_limit: 1000,
  rate_limit_per_minute: 60,
  enable_tracking: true,
  enable_click_tracking: true,
  enable_open_tracking: true,
};

export default function EmailSettingsEditor() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  const { isLoading, saveSettings, getParsedSettings } = useEmailSettings();

  useEffect(() => {
    const parsed = getParsedSettings(DEFAULT_SETTINGS);
    setSettings(parsed);
  }, [getParsedSettings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // @ts-ignore
    saveSettings.mutate(settings, {
      onSuccess: () => setHasChanges(false)
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveSettings.isPending}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saveSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {t({ en: 'Save Settings', ar: 'حفظ الإعدادات' })}
        </Button>
      </div>

      <Tabs defaultValue="sender" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sender" className="gap-2">
            <Mail className="h-4 w-4" />
            {t({ en: 'Sender', ar: 'المرسل' })}
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            {t({ en: 'Branding', ar: 'العلامة التجارية' })}
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2">
            <Globe className="h-4 w-4" />
            {t({ en: 'Footer', ar: 'التذييل' })}
          </TabsTrigger>
          <TabsTrigger value="limits" className="gap-2">
            <Shield className="h-4 w-4" />
            {t({ en: 'Limits & Tracking', ar: 'الحدود والتتبع' })}
          </TabsTrigger>
        </TabsList>

        {/* Sender Settings */}
        <TabsContent value="sender">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t({ en: 'Sender Configuration', ar: 'إعدادات المرسل' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Configure the default sender email and display names', ar: 'تكوين البريد الافتراضي للمرسل وأسماء العرض' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t({ en: 'From Email Address', ar: 'عنوان البريد الإلكتروني' })}</label>
                <Input
                  value={settings.default_from_email}
                  onChange={(e) => updateSetting('default_from_email', e.target.value)}
                  placeholder="noreply@yourdomain.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t({ en: 'Must be a verified domain in Resend', ar: 'يجب أن يكون نطاقًا موثقًا في Resend' })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Sender Name (English)', ar: 'اسم المرسل (إنجليزي)' })}</label>
                  <Input
                    value={settings.default_from_name}
                    onChange={(e) => updateSetting('default_from_name', e.target.value)}
                    placeholder="Saudi Innovates"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Sender Name (Arabic)', ar: 'اسم المرسل (عربي)' })}</label>
                  <Input
                    value={settings.default_from_name_ar}
                    onChange={(e) => updateSetting('default_from_name_ar', e.target.value)}
                    placeholder="ابتكر السعودية"
                    dir="rtl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t({ en: 'Email Branding', ar: 'العلامة التجارية للبريد' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Customize the visual appearance of emails', ar: 'تخصيص المظهر المرئي للبريد' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Logo URL', ar: 'رابط الشعار' })}</label>
                <Input
                  value={settings.logo_url}
                  onChange={(e) => updateSetting('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Primary Button Color', ar: 'لون الزر الأساسي' })}</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.primary_button_color}
                      onChange={(e) => updateSetting('primary_button_color', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={settings.primary_button_color}
                      onChange={(e) => updateSetting('primary_button_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Header Gradient Start', ar: 'بداية تدرج الرأس' })}</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.default_header_gradient_start}
                      onChange={(e) => updateSetting('default_header_gradient_start', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={settings.default_header_gradient_start}
                      onChange={(e) => updateSetting('default_header_gradient_start', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Header Gradient End', ar: 'نهاية تدرج الرأس' })}</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.default_header_gradient_end}
                      onChange={(e) => updateSetting('default_header_gradient_end', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={settings.default_header_gradient_end}
                      onChange={(e) => updateSetting('default_header_gradient_end', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6">
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Header Preview', ar: 'معاينة الرأس' })}</label>
                <div
                  className="rounded-lg p-6 text-center text-white"
                  style={{ background: `linear-gradient(135deg, ${settings.default_header_gradient_start}, ${settings.default_header_gradient_end})` }}
                >
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="h-10 mx-auto mb-2" />
                  ) : (
                    <p className="text-xl font-bold">🚀 {settings.default_from_name}</p>
                  )}
                  <p className="text-sm opacity-80">{t({ en: 'Sample Header Title', ar: 'عنوان رأس تجريبي' })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Settings */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t({ en: 'Footer Content', ar: 'محتوى التذييل' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Configure footer information and social links', ar: 'تكوين معلومات التذييل والروابط الاجتماعية' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Contact Email', ar: 'البريد للتواصل' })}</label>
                  <Input
                    value={settings.footer_contact_email}
                    onChange={(e) => updateSetting('footer_contact_email', e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Address', ar: 'العنوان' })}</label>
                  <Input
                    value={settings.footer_address}
                    onChange={(e) => updateSetting('footer_address', e.target.value)}
                    placeholder="Riyadh, Saudi Arabia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    {t({ en: 'Twitter/X URL', ar: 'رابط تويتر' })}
                  </label>
                  <Input
                    value={settings.footer_social_links?.twitter || ''}
                    onChange={(e) => updateSetting('footer_social_links', {
                      ...settings.footer_social_links,
                      twitter: e.target.value
                    })}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    {t({ en: 'LinkedIn URL', ar: 'رابط لينكد إن' })}
                  </label>
                  <Input
                    value={settings.footer_social_links?.linkedin || ''}
                    onChange={(e) => updateSetting('footer_social_links', {
                      ...settings.footer_social_links,
                      linkedin: e.target.value
                    })}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits & Tracking */}
        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t({ en: 'Rate Limits & Tracking', ar: 'حدود المعدل والتتبع' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Configure sending limits and email tracking options', ar: 'تكوين حدود الإرسال وخيارات تتبع البريد' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Daily Email Limit', ar: 'حد البريد اليومي' })}</label>
                  <Input
                    type="number"
                    value={settings.daily_email_limit}
                    onChange={(e) => updateSetting('daily_email_limit', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Rate Limit (per minute)', ar: 'حد المعدل (في الدقيقة)' })}</label>
                  <Input
                    type="number"
                    value={settings.rate_limit_per_minute}
                    onChange={(e) => updateSetting('rate_limit_per_minute', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">{t({ en: 'Tracking Options', ar: 'خيارات التتبع' })}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{t({ en: 'Enable Tracking', ar: 'تفعيل التتبع' })}</p>
                      <p className="text-sm text-muted-foreground">{t({ en: 'Track email delivery status', ar: 'تتبع حالة تسليم البريد' })}</p>
                    </div>
                    <Switch
                      checked={settings.enable_tracking}
                      onCheckedChange={(v) => updateSetting('enable_tracking', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{t({ en: 'Open Tracking', ar: 'تتبع الفتح' })}</p>
                      <p className="text-sm text-muted-foreground">{t({ en: 'Track when emails are opened', ar: 'تتبع عند فتح البريد' })}</p>
                    </div>
                    <Switch
                      checked={settings.enable_open_tracking}
                      onCheckedChange={(v) => updateSetting('enable_open_tracking', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{t({ en: 'Click Tracking', ar: 'تتبع النقر' })}</p>
                      <p className="text-sm text-muted-foreground">{t({ en: 'Track link clicks in emails', ar: 'تتبع نقرات الروابط في البريد' })}</p>
                    </div>
                    <Switch
                      checked={settings.enable_click_tracking}
                      onCheckedChange={(v) => updateSetting('enable_click_tracking', v)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
