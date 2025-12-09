import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Palette, Upload, Save, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import FileUploader from '../components/FileUploader';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function BrandingSettings() {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
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

  const handleAIOptimize = async () => {
    const result = await invokeAI({
      prompt: `Analyze this platform branding and suggest improvements:
Platform: ${branding.platform_name_en} / ${branding.platform_name_ar}
Tagline: ${branding.tagline_en} / ${branding.tagline_ar}
Colors: Primary ${branding.primary_color}, Secondary ${branding.secondary_color}

Provide bilingual recommendations for:
1. Brand positioning improvements
2. Color psychology alignment with innovation
3. Tagline alternatives
4. Visual identity suggestions`,
      response_json_schema: {
        type: 'object',
        properties: {
          positioning: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } },
          color_recommendations: { type: 'array', items: { type: 'object', properties: { color: { type: 'string' }, reason_en: { type: 'string' }, reason_ar: { type: 'string' } } } },
          tagline_alternatives: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          visual_suggestions: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      }
    });
    if (result.success) {
      toast.success(t({ en: 'AI analysis complete', ar: 'اكتمل التحليل الذكي' }));
      console.log('AI Branding Recommendations:', result.data);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🎨 Branding & Identity', ar: '🎨 العلامة التجارية والهوية' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Customize platform appearance, logos, colors, and white-label settings', ar: 'تخصيص مظهر المنصة والشعارات والألوان وإعدادات العلامة البيضاء' })}
        </p>
      </div>

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
              <Input value={branding.platform_name_en} onChange={(e) => setBranding({...branding, platform_name_en: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Platform Name (Arabic)', ar: 'اسم المنصة (عربي)' })}</label>
              <Input value={branding.platform_name_ar} onChange={(e) => setBranding({...branding, platform_name_ar: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</label>
              <Input value={branding.tagline_en} onChange={(e) => setBranding({...branding, tagline_en: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</label>
              <Input value={branding.tagline_ar} onChange={(e) => setBranding({...branding, tagline_ar: e.target.value})} />
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
                onUpload={(url) => setBranding({...branding, logo_url: url})}
                accept="image/*"
              />
              {branding.logo_url && (
                <img src={branding.logo_url} alt="Logo" className="mt-2 h-16" />
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Favicon', ar: 'أيقونة المتصفح' })}</label>
              <FileUploader 
                onUpload={(url) => setBranding({...branding, favicon_url: url})}
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
                <Input type="color" value={branding.primary_color} onChange={(e) => setBranding({...branding, primary_color: e.target.value})} className="w-20 h-10" />
                <Input value={branding.primary_color} onChange={(e) => setBranding({...branding, primary_color: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Secondary Color', ar: 'اللون الثانوي' })}</label>
              <div className="flex gap-2">
                <Input type="color" value={branding.secondary_color} onChange={(e) => setBranding({...branding, secondary_color: e.target.value})} className="w-20 h-10" />
                <Input value={branding.secondary_color} onChange={(e) => setBranding({...branding, secondary_color: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Accent Color', ar: 'لون التمييز' })}</label>
              <div className="flex gap-2">
                <Input type="color" value={branding.accent_color} onChange={(e) => setBranding({...branding, accent_color: e.target.value})} className="w-20 h-10" />
                <Input value={branding.accent_color} onChange={(e) => setBranding({...branding, accent_color: e.target.value})} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-purple-600 text-lg py-6">
        <Save className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {t({ en: 'Save Branding Settings', ar: 'حفظ إعدادات العلامة التجارية' })}
      </Button>
    </div>
  );
}

export default ProtectedPage(BrandingSettings, { requireAdmin: true });