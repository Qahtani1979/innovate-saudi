import { useState, useEffect } from 'react';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Palette, Save, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FileUploader from '../components/FileUploader';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePrompt } from '@/hooks/usePrompt';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function BrandingSettings() {
  const { language, isRTL, t } = useLanguage();
  const { invoke: invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = usePrompt(null);
  const { configAsObject: brandingConfig, saveBatchConfig } = usePlatformConfig('branding');

  const [branding, setBranding] = useState({
    platform_name_en: 'Saudi Innovates',
    platform_name_ar: 'الابتكار السعودي',
    tagline_en: 'National Municipal Innovation Platform',
    tagline_ar: 'المنصة الوطنية للابتكار البلدي',
    logo_url: '',
    favicon_url: '',
    primary_color: '#0066CC',
    secondary_color: '#14B8A6',
    accent_color: '#8B5CF6',
    font_family: 'Inter'
  });

  // Load config from database when available
  useEffect(() => {
    if (brandingConfig) {
      setBranding(prev => ({
        ...prev,
        platform_name_en: brandingConfig.platform_name_en || prev.platform_name_en,
        platform_name_ar: brandingConfig.platform_name_ar || prev.platform_name_ar,
        tagline_en: brandingConfig.tagline_en || prev.tagline_en,
        tagline_ar: brandingConfig.tagline_ar || prev.tagline_ar,
        logo_url: brandingConfig.logo_url || prev.logo_url,
        favicon_url: brandingConfig.favicon_url || prev.favicon_url,
        primary_color: brandingConfig.primary_color || prev.primary_color,
        secondary_color: brandingConfig.secondary_color || prev.secondary_color,
        accent_color: brandingConfig.accent_color || prev.accent_color,
        font_family: brandingConfig.font_family || prev.font_family
      }));
    }
  }, [brandingConfig]);

  // Save branding mutation
  // Save branding mutation
  const handleSave = () => {
    saveBatchConfig.mutate(branding, {
      onSuccess: () => {
        toast.success(t({ en: 'Branding settings saved', ar: 'تم حفظ إعدادات العلامة التجارية' }));
      },
      onError: () => {
        toast.error(t({ en: 'Failed to save branding settings', ar: 'فشل في حفظ إعدادات العلامة التجارية' }));
      }
    });
  };

  const handleAIOptimize = async () => {
    const { brandingPrompts } = await import('@/lib/ai/prompts/admin/brandingPrompts');
    const { buildPrompt } = await import('@/lib/ai/promptBuilder');

    const { prompt, schema, system } = buildPrompt(brandingPrompts.optimizer, {
      platformNameEn: branding.platform_name_en,
      platformNameAr: branding.platform_name_ar,
      taglineEn: branding.tagline_en,
      taglineAr: branding.tagline_ar,
      primaryColor: branding.primary_color,
      secondaryColor: branding.secondary_color,
      accentColor: branding.accent_color
    });

    const result = await invokeAI({
      prompt,
      system_prompt: system,
      response_json_schema: schema
    });
    if (result.success) {
      toast.success(t({ en: 'AI analysis complete', ar: 'اكتمل التحليل الذكي' }));

    }
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Palette}
        title={t({ en: 'Branding & Identity', ar: 'العلامة التجارية والهوية' })}
        description={t({ en: 'Customize platform appearance, logos, colors, and white-label settings', ar: 'تخصيص مظهر المنصة والشعارات والألوان وإعدادات العلامة البيضاء' })}
        action={
          <Button onClick={handleAIOptimize} disabled={aiLoading || !isAvailable}>
            {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'AI Branding Optimizer', ar: 'محسن العلامة التجارية الذكي' })}
          </Button>
        }
      />

      <div className="space-y-2">
        <Button onClick={handleAIOptimize} disabled={aiLoading || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
          {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'AI Branding Optimizer', ar: 'محسن العلامة التجارية الذكي' })}
        </Button>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Platform Names', ar: 'أسماء المنصة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Platform Name (English)', ar: 'اسم المنصة (إنجليزي)' })}</label>
              <Input value={branding.platform_name_en} onChange={(e) => setBranding({ ...branding, platform_name_en: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Platform Name (Arabic)', ar: 'اسم المنصة (عربي)' })}</label>
              <Input value={branding.platform_name_ar} onChange={(e) => setBranding({ ...branding, platform_name_ar: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</label>
              <Input value={branding.tagline_en} onChange={(e) => setBranding({ ...branding, tagline_en: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</label>
              <Input value={branding.tagline_ar} onChange={(e) => setBranding({ ...branding, tagline_ar: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Logos & Icons', ar: 'الشعارات والأيقونات' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Main Logo', ar: 'الشعار الرئيسي' })}</label>
              <FileUploader
                onUpload={(url) => setBranding({ ...branding, logo_url: url })}
                accept="image/*"
              />
              {branding.logo_url && (
                <img src={branding.logo_url} alt="Logo" className="mt-2 h-16" />
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Favicon', ar: 'أيقونة المتصفح' })}</label>
              <FileUploader
                onUpload={(url) => setBranding({ ...branding, favicon_url: url })}
                accept="image/*"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Color Scheme', ar: 'نظام الألوان' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Primary Color', ar: 'اللون الأساسي' })}</label>
              <div className="flex gap-2">
                <Input type="color" value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} className="w-20 h-10" />
                <Input value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Secondary Color', ar: 'اللون الثانوي' })}</label>
              <div className="flex gap-2">
                <Input type="color" value={branding.secondary_color} onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })} className="w-20 h-10" />
                <Input value={branding.secondary_color} onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Accent Color', ar: 'لون التمييز' })}</label>
              <div className="flex gap-2">
                <Input type="color" value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} className="w-20 h-10" />
                <Input value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full bg-purple-600 text-lg py-6"
        onClick={handleSave}
        disabled={saveBatchConfig.isPending}
      >
        {saveBatchConfig.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
        {t({ en: 'Save Branding Settings', ar: 'حفظ إعدادات العلامة التجارية' })}
      </Button>
    </PageLayout>
  );
}

export default ProtectedPage(BrandingSettings, { requireAdmin: true });
