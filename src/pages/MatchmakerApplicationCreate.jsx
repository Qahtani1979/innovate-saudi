import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Building2, Sparkles, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import FileUploader from '../components/FileUploader';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useMatchmakerApplicationDetails } from '@/hooks/useMatchmakerApplicationDetails';

function MatchmakerApplicationCreate() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const { invokeAI, status, isLoading: aiGenerating, isAvailable, rateLimitInfo } = useAIWithFallback();

  // Use gold standard hook
  const { createApplication } = useMatchmakerApplicationDetails();

  const [formData, setFormData] = useState({
    organization_name_en: '',
    organization_name_ar: '',
    headquarters_location: '',
    year_established: '',
    website: '',
    contact_person: '',
    contact_title: '',
    contact_email: '',
    contact_phone: '',
    sectors: [],
    other_sector: '',
    company_stage: '',
    geographic_scope: [],
    collaboration_approach: '',
    portfolio_url: '',
    stage: 'intake'
  });

  const handleSubmit = () => {
    createApplication.mutate(formData, {
      onSuccess: (response) => {
        navigate(createPageUrl('MatchmakerApplicationDetail') + `?id=${response.id}`);
      }
    });
  };

  const handleAIEnhance = async () => {
    const { MATCHMAKER_PROFILE_ENHANCE_PROMPT_TEMPLATE } = await import('@/lib/ai/prompts/matchmaker/application');
    const promptConfig = MATCHMAKER_PROFILE_ENHANCE_PROMPT_TEMPLATE(formData);

    const result = await invokeAI({
      prompt: promptConfig.prompt,
      system_prompt: promptConfig.system,
      response_json_schema: promptConfig.schema
    });

    if (result.success) {
      setFormData(prev => ({
        ...prev,
        organization_name_ar: result.data.organization_name_ar || prev.organization_name_ar,
        collaboration_approach: result.data.collaboration_approach_en || prev.collaboration_approach
      }));
      toast.success(t({ en: 'AI enhanced your profile', ar: 'تم تحسين الملف بالذكاء' }));
    }
  };

  const sectorOptions = [
    { value: 'real_estate', label_en: 'Real Estate / Urban Development', label_ar: 'العقارات / التطوير الحضري' },
    { value: 'smart_cities', label_en: 'Smart Cities / Infrastructure', label_ar: 'المدن الذكية / البنية التحتية' },
    { value: 'renewable_energy', label_en: 'Renewable Energy / Sustainability', label_ar: 'الطاقة المتجددة / الاستدامة' },
    { value: 'technology', label_en: 'Technology / IT Solutions', label_ar: 'التقنية / حلول تقنية المعلومات' },
    { value: 'health', label_en: 'Health / Life Sciences', label_ar: 'الصحة / علوم الحياة' },
    { value: 'education', label_en: 'Education / EdTech', label_ar: 'التعليم / تقنيات التعليم' },
    { value: 'other', label_en: 'Other', label_ar: 'أخرى' }
  ];

  const toggleSector = (sector) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const toggleGeographicScope = (scope) => {
    setFormData(prev => ({
      ...prev,
      geographic_scope: prev.geographic_scope.includes(scope)
        ? prev.geographic_scope.filter(s => s !== scope)
        : [...prev.geographic_scope, scope]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t({ en: 'New Matchmaker Application', ar: 'طلب توفيق جديد' })}</h1>
        <Button onClick={handleAIEnhance} disabled={aiGenerating || !isAvailable} variant="outline">
          {aiGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'AI Enhance', ar: 'تحسين ذكي' })}
        </Button>
      </div>
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t({ en: 'Organization Information', ar: 'معلومات المنظمة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Organization Name (EN)*', ar: 'اسم المنظمة (EN)*' })}</label>
              <Input value={formData.organization_name_en} onChange={(e) => setFormData({ ...formData, organization_name_en: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium">{t({ en: 'Organization Name (AR)', ar: 'اسم المنظمة (AR)' })}</label>
              <Input value={formData.organization_name_ar} onChange={(e) => setFormData({ ...formData, organization_name_ar: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Headquarters Location*', ar: 'موقع المقر*' })}</label>
              <Select value={formData.headquarters_location} onValueChange={(value) => setFormData({ ...formData, headquarters_location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                  <SelectItem value="GCC">GCC</SelectItem>
                  <SelectItem value="Middle East">Middle East</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Asia">Asia</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t({ en: 'Year Established', ar: 'سنة التأسيس' })}</label>
              <Input type="number" value={formData.year_established} onChange={(e) => setFormData({ ...formData, year_established: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t({ en: 'Website', ar: 'الموقع الإلكتروني' })}</label>
            <Input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Contact Information', ar: 'معلومات التواصل' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Contact Person*', ar: 'جهة الاتصال*' })}</label>
              <Input value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium">{t({ en: 'Position/Title', ar: 'المسمى الوظيفي' })}</label>
              <Input value={formData.contact_title} onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t({ en: 'Email*', ar: 'البريد الإلكتروني*' })}</label>
              <Input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium">{t({ en: 'Phone', ar: 'الهاتف' })}</label>
              <Input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Sectors & Stage', ar: 'القطاعات والمرحلة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block">{t({ en: 'Sectors (select all that apply)', ar: 'القطاعات (اختر كل ما ينطبق)' })}</label>
            <div className="grid grid-cols-2 gap-3">
              {sectorOptions.map((sector) => (
                <div key={sector.value} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.sectors.includes(sector.value)}
                    onCheckedChange={() => toggleSector(sector.value)}
                  />
                  <label className="text-sm">{language === 'ar' ? sector.label_ar : sector.label_en}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t({ en: 'Company Stage', ar: 'مرحلة الشركة' })}</label>
            <Select value={formData.company_stage} onValueChange={(value) => setFormData({ ...formData, company_stage: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select stage...', ar: 'اختر المرحلة...' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre_seed">Pre-Seed (Idea stage)</SelectItem>
                <SelectItem value="seed">Seed (Product development)</SelectItem>
                <SelectItem value="series_a">Series A (Market validation & scaling)</SelectItem>
                <SelectItem value="series_b">Series B (Growth & expansion)</SelectItem>
                <SelectItem value="series_c_plus">Series C+ (Market leadership)</SelectItem>
                <SelectItem value="growth_stage">Growth Stage / Pre-IPO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">{t({ en: 'Geographic Scope', ar: 'النطاق الجغرافي' })}</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'saudi_national', label_en: 'Saudi Arabia (National focus)', label_ar: 'السعودية (تركيز وطني)' },
                { value: 'gcc', label_en: 'GCC Countries', label_ar: 'دول الخليج' },
                { value: 'mena', label_en: 'Middle East & North Africa', label_ar: 'الشرق الأوسط وشمال أفريقيا' },
                { value: 'global', label_en: 'Global', label_ar: 'عالمي' }
              ].map((scope) => (
                <div key={scope.value} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.geographic_scope.includes(scope.value)}
                    onCheckedChange={() => toggleGeographicScope(scope.value)}
                  />
                  <label className="text-sm">{language === 'ar' ? scope.label_ar : scope.label_en}</label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Collaboration & Portfolio', ar: 'التعاون والملف' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Collaboration Approach', ar: 'نهج التعاون' })}</label>
            <Textarea
              rows={5}
              value={formData.collaboration_approach}
              onChange={(e) => setFormData({ ...formData, collaboration_approach: e.target.value })}
              placeholder={t({ en: 'Describe your experience and preferences for opportunities in Saudi Arabia...', ar: 'اشرح تجربتك وتفضيلاتك للفرص في المملكة...' })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t({ en: 'Portfolio & Documents', ar: 'الملف والوثائق' })}</label>
            <FileUploader
              onUploadComplete={(url) => setFormData({ ...formData, portfolio_url: url })}
              currentFileUrl={formData.portfolio_url}
              acceptedTypes="application/pdf"
              label={t({ en: 'Upload Portfolio (PDF)', ar: 'رفع الملف (PDF)' })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={createApplication.isPending || !formData.organization_name_en || !formData.contact_email}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {createApplication.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Submitting...', ar: 'جاري التقديم...' })}</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />{t({ en: 'Submit Application', ar: 'تقديم الطلب' })}</>
          )}
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t({ en: 'Cancel', ar: 'إلغاء' })}
        </Button>
      </div>
    </div>
  );
}

export default ProtectedPage(MatchmakerApplicationCreate, { requiredPermissions: [] });
