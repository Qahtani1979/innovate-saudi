import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Building2, Save, Loader2, Sparkles, Plus, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useCities, useRegions } from '@/hooks/useLocations';
import { useOrganizationMutations } from '@/hooks/useOrganizationMutations';

function OrganizationCreate() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [currentStep, setCurrentStep] = useState(1);

  // Use existing hooks for cities and regions
  const { data: cities = [] } = useCities();
  const { data: regions = [] } = useRegions();

  const [formData, setFormData] = useState({
    code: `ORG-${Date.now().toString().slice(-6)}`,
    org_type: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    city_id: '',
    region_id: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    is_partner: false,
    partnership_status: 'none',
    sectors: [],
    team_size: '',
    maturity_level: '',
    specializations: [],
    capabilities: [],
    founding_year: null,
    employee_count: null,
    funding_stage: '',
    annual_revenue_range: '',
    funding_rounds: [],
    key_investors: [],
    certifications: [],
    licenses: [],
    partnership_agreements: [],
    regulatory_compliance: {},
    intellectual_property: {}
  });

  const [hasUserEdited, setHasUserEdited] = useState({
    name_en: false,
    name_ar: false,
    description_en: false,
    description_ar: false
  });

  const [initialThoughts, setInitialThoughts] = useState('');

  // Use existing organization mutations hook
  const { createOrganization } = useOrganizationMutations(null, (org) => {
    localStorage.removeItem('org_draft');
    toast.success(t({ en: 'Organization created!', ar: 'تم إنشاء الجهة!' }));
    navigate(createPageUrl(`OrganizationDetail?id=${org.id}`));
  });

  const sectorOptions = ['urban_design', 'transport', 'environment', 'digital_services', 'health'];

  const toggleSector = (sector) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const handleAIGenerate = async () => {
    if (!formData.org_type) {
      toast.error(t({ en: 'Please select organization type first', ar: 'يرجى اختيار نوع الجهة أولاً' }));
      return;
    }

    if (!initialThoughts && !formData.name_en) {
      toast.error(t({ en: 'Please describe the organization', ar: 'يرجى وصف الجهة' }));
      return;
    }

    try {
      const {
        ORGANIZATION_PROFILE_PROMPT_TEMPLATE,
        ORGANIZATION_PROFILE_RESPONSE_SCHEMA
      } = await import('@/lib/ai/prompts/organizations/profileGenerator');

      const result = await invokeAI({
        prompt: ORGANIZATION_PROFILE_PROMPT_TEMPLATE({
          org_type: formData.org_type,
          description: initialThoughts || formData.name_en
        }),
        response_json_schema: ORGANIZATION_PROFILE_RESPONSE_SCHEMA
      });

      if (!result.success) {
        toast.error(t({ en: 'AI generation failed', ar: 'فشل التوليد' }));
        return;
      }

      const data = result.data;

      setFormData(prev => ({
        ...prev,
        name_en: data.name_en || prev.name_en,
        name_ar: data.name_ar || prev.name_ar,
        description_en: data.description_en || prev.description_en,
        description_ar: data.description_ar || prev.description_ar,
        specializations: data.specializations || prev.specializations,
        capabilities: data.capabilities || prev.capabilities,
        sectors: data.sectors || prev.sectors,
        team_size: data.team_size || prev.team_size,
        maturity_level: data.maturity_level || prev.maturity_level,
        funding_stage: data.funding_stage || prev.funding_stage
      }));

      toast.success(t({ en: '✨ AI generated organization profile!', ar: '✨ تم إنشاء ملف الجهة!' }));
    } catch (error) {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل التوليد' }));
    }
  };

  const handleRetranslate = async (field) => {
    const sourceField = field.includes('_en') ? field.replace('_en', '_ar') : field.replace('_ar', '_en');
    const sourceText = formData[sourceField];

    if (!sourceText) {
      toast.error(t({ en: 'Source text empty', ar: 'النص المصدر فارغ' }));
      return;
    }

    try {
      const targetLang = field.includes('_en') ? 'English' : 'Arabic';
      const result = await invokeAI({
        prompt: `Translate this organizational text to ${targetLang} professionally:\n\n${sourceText}`,
        response_json_schema: {
          type: 'object',
          properties: {
            translation: { type: 'string' }
          }
        }
      });

      if (result.success) {
        setFormData(prev => ({ ...prev, [field]: result.data.translation }));
        setHasUserEdited(prev => ({ ...prev, [field]: false }));
        toast.success(t({ en: 'Re-translated', ar: 'تمت إعادة الترجمة' }));
      } else {
        toast.error(t({ en: 'Translation failed', ar: 'فشلت الترجمة' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Translation failed', ar: 'فشلت الترجمة' }));
    }
  };

  return (
    <PageLayout className="max-w-4xl mx-auto">
      <PageHeader
        icon={Building2}
        title={{ en: 'Add Organization', ar: 'إضافة جهة' }}
        description={{ en: 'Register a new ecosystem partner', ar: 'تسجيل شريك جديد في المنظومة' }}
      />

      {/* Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-sm">
            <Badge variant={currentStep >= 1 ? 'default' : 'outline'}>
              1. {t({ en: 'AI Generate', ar: 'التوليد' })}
            </Badge>
            <Badge variant={currentStep >= 2 ? 'default' : 'outline'}>
              2. {t({ en: 'Review & Edit', ar: 'المراجعة' })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: AI-First */}
      {currentStep === 1 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'Step 1: Describe Organization', ar: 'الخطوة 1: صف الجهة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Org Type - FIELD #1 - CRITICAL */}
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <Label className="text-base font-semibold text-red-900 mb-3 block">
                {t({ en: 'Organization Type *', ar: 'نوع الجهة *' })}
              </Label>
              <Select
                value={formData.org_type}
                onValueChange={(v) => setFormData({ ...formData, org_type: v })}
              >
                <SelectTrigger className="h-12 text-base border-2">
                  <SelectValue placeholder={t({ en: 'Select type...', ar: 'اختر النوع...' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ministry">{t({ en: 'Ministry', ar: 'وزارة' })}</SelectItem>
                  <SelectItem value="municipality">{t({ en: 'Municipality', ar: 'بلدية' })}</SelectItem>
                  <SelectItem value="agency">{t({ en: 'Government Agency', ar: 'جهة حكومية' })}</SelectItem>
                  <SelectItem value="university">{t({ en: 'University', ar: 'جامعة' })}</SelectItem>
                  <SelectItem value="research_center">{t({ en: 'Research Center', ar: 'مركز بحثي' })}</SelectItem>
                  <SelectItem value="company">{t({ en: 'Company', ar: 'شركة' })}</SelectItem>
                  <SelectItem value="startup">{t({ en: 'Startup', ar: 'شركة ناشئة' })}</SelectItem>
                  <SelectItem value="sme">{t({ en: 'SME', ar: 'منشأة صغيرة ومتوسطة' })}</SelectItem>
                  <SelectItem value="ngo">{t({ en: 'NGO', ar: 'منظمة غير ربحية' })}</SelectItem>
                  <SelectItem value="international_org">{t({ en: 'International Org', ar: 'منظمة دولية' })}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-red-700 mt-2">
                {t({ en: 'Required - determines applicable fields', ar: 'مطلوب - يحدد الحقول المطبقة' })}
              </p>
            </div>

            {/* Code - Read Only */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-500">{t({ en: 'Organization Code (auto-generated)', ar: 'رمز الجهة (تلقائي)' })}</Label>
              <Input
                value={formData.code}
                disabled
                className="bg-slate-100 font-mono text-sm"
              />
            </div>

            {/* Free-form thoughts */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {t({ en: 'Describe the Organization', ar: 'صف الجهة' })}
              </Label>
              <Textarea
                value={initialThoughts}
                onChange={(e) => setInitialThoughts(e.target.value)}
                rows={10}
                placeholder={t({
                  en: 'Describe the organization in any language...\n\nExamples:\n- "Technology startup focused on AI-powered traffic management with 15 employees"\n- "Research center at King Saud University specializing in smart cities"\n- "Municipal agency responsible for innovation programs"',
                  ar: 'صف الجهة بأي لغة...\n\nأمثلة:\n- "شركة ناشئة تقنية متخصصة في إدارة المرور بالذكاء الاصطناعي مع 15 موظفاً"\n- "مركز بحثي بجامعة الملك سعود متخصص في المدن الذكية"\n- "جهة بلدية مسؤولة عن برامج الابتكار"'
                })}
                className="text-base leading-relaxed"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <Button
              onClick={handleAIGenerate}
              disabled={aiLoading || !formData.org_type}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {t({ en: 'AI Processing...', ar: 'معالجة ذكية...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  {t({ en: '✨ Generate Complete Profile with AI', ar: '✨ إنشاء ملف كامل بالذكاء' })}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Structured Form */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Basic Information', ar: 'المعلومات الأساسية' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Names with re-translate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t({ en: 'Name (English) *', ar: 'الاسم (إنجليزي) *' })}</Label>
                    {hasUserEdited.name_en && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetranslate('name_en')}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        <span className="text-xs">{t({ en: 'Re-translate', ar: 'إعادة ترجمة' })}</span>
                      </Button>
                    )}
                  </div>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => {
                      setFormData({ ...formData, name_en: e.target.value });
                      setHasUserEdited(prev => ({ ...prev, name_en: true }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                    {hasUserEdited.name_ar && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetranslate('name_ar')}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        <span className="text-xs">{t({ en: 'Re-translate', ar: 'إعادة ترجمة' })}</span>
                      </Button>
                    )}
                  </div>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => {
                      setFormData({ ...formData, name_ar: e.target.value });
                      setHasUserEdited(prev => ({ ...prev, name_ar: true }));
                    }}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Descriptions with re-translate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                    {hasUserEdited.description_en && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetranslate('description_en')}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        <span className="text-xs">{t({ en: 'Re-translate', ar: 'إعادة ترجمة' })}</span>
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => {
                      setFormData({ ...formData, description_en: e.target.value });
                      setHasUserEdited(prev => ({ ...prev, description_en: true }));
                    }}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                    {hasUserEdited.description_ar && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetranslate('description_ar')}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        <span className="text-xs">{t({ en: 'Re-translate', ar: 'إعادة ترجمة' })}</span>
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={formData.description_ar}
                    onChange={(e) => {
                      setFormData({ ...formData, description_ar: e.target.value });
                      setHasUserEdited(prev => ({ ...prev, description_ar: true }));
                    }}
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Org Type - Read Only in Step 2 */}
              <div className="space-y-2">
                <Label>{t({ en: 'Organization Type', ar: 'نوع الجهة' })}</Label>
                <Input
                  value={formData.org_type}
                  disabled
                  className="bg-slate-100"
                />
                <p className="text-xs text-slate-500">
                  {t({ en: 'Set in Step 1 - go back to change', ar: 'تم تعيينه في الخطوة 1 - ارجع للتغيير' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(v) => setFormData({ ...formData, region_id: v, city_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region..." />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select
                    value={formData.city_id}
                    onValueChange={(v) => setFormData({ ...formData, city_id: v })}
                    disabled={!formData.region_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.filter(c => c.region_id === formData.region_id).map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Team Size</Label>
                  <Select
                    value={formData.team_size}
                    onValueChange={(v) => setFormData({ ...formData, team_size: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="501-1000">501-1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Maturity Level</Label>
                  <Select
                    value={formData.maturity_level}
                    onValueChange={(v) => setFormData({ ...formData, maturity_level: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maturity..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early_stage">Early Stage</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="established">Established</SelectItem>
                      <SelectItem value="mature">Mature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">{t({ en: 'Focus Sectors', ar: 'قطاعات التركيز' })}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {sectorOptions.map((sector) => (
                    <div key={sector} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.sectors.includes(sector)}
                        onCheckedChange={() => toggleSector(sector)}
                      />
                      <label className="text-sm capitalize">{sector.replace(/_/g, ' ')}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specializations - Bilingual Array */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t({ en: 'Specializations', ar: 'التخصصات' })}</Label>
                  <Button size="sm" variant="outline" onClick={() => setFormData({
                    ...formData,
                    specializations: [...(formData.specializations || []), { name_en: '', name_ar: '' }]
                  })}>
                    <Plus className="h-3 w-3 mr-1" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                {(formData.specializations || []).map((spec, i) => (
                  <div key={i} className="p-3 border rounded bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">
                        {t({ en: `Specialization ${i + 1}`, ar: `التخصص ${i + 1}` })}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => setFormData({
                        ...formData,
                        specializations: formData.specializations.filter((_, idx) => idx !== i)
                      })}>
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={typeof spec === 'string' ? spec : spec.name_en || ''}
                        onChange={(e) => {
                          const updated = [...(formData.specializations || [])];
                          updated[i] = typeof spec === 'string' ? { name_en: e.target.value, name_ar: '' } : { ...spec, name_en: e.target.value };
                          setFormData({ ...formData, specializations: updated });
                        }}
                        placeholder={t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}
                        className="text-sm"
                      />
                      <Input
                        value={typeof spec === 'string' ? '' : spec.name_ar || ''}
                        onChange={(e) => {
                          const updated = [...(formData.specializations || [])];
                          updated[i] = typeof spec === 'string' ? { name_en: spec, name_ar: e.target.value } : { ...spec, name_ar: e.target.value };
                          setFormData({ ...formData, specializations: updated });
                        }}
                        placeholder={t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}
                        dir="rtl"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Capabilities - Bilingual Array */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t({ en: 'Capabilities', ar: 'القدرات' })}</Label>
                  <Button size="sm" variant="outline" onClick={() => setFormData({
                    ...formData,
                    capabilities: [...(formData.capabilities || []), { name_en: '', name_ar: '' }]
                  })}>
                    <Plus className="h-3 w-3 mr-1" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                {(formData.capabilities || []).map((cap, i) => (
                  <div key={i} className="p-3 border rounded bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">
                        {t({ en: `Capability ${i + 1}`, ar: `القدرة ${i + 1}` })}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => setFormData({
                        ...formData,
                        capabilities: formData.capabilities.filter((_, idx) => idx !== i)
                      })}>
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={cap.name_en || ''}
                        onChange={(e) => {
                          const updated = [...(formData.capabilities || [])];
                          updated[i] = { ...cap, name_en: e.target.value };
                          setFormData({ ...formData, capabilities: updated });
                        }}
                        placeholder={t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}
                        className="text-sm"
                      />
                      <Input
                        value={cap.name_ar || ''}
                        onChange={(e) => {
                          const updated = [...(formData.capabilities || [])];
                          updated[i] = { ...cap, name_ar: e.target.value };
                          setFormData({ ...formData, capabilities: updated });
                        }}
                        placeholder={t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}
                        dir="rtl"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              {/* Conditional: Funding & Investment - Only for startup/company/sme */}
              {['startup', 'company', 'sme'].includes(formData.org_type) && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-slate-900">{t({ en: 'Funding & Investment', ar: 'التمويل والاستثمار' })}</h3>
                  <p className="text-xs text-slate-600">
                    {t({ en: 'Applicable to commercial organizations', ar: 'ينطبق على الجهات التجارية' })}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Funding Stage', ar: 'مرحلة التمويل' })}</Label>
                      <Select
                        value={formData.funding_stage || ''}
                        onValueChange={(v) => setFormData({ ...formData, funding_stage: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t({ en: 'Select stage...', ar: 'اختر المرحلة...' })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bootstrapped">{t({ en: 'Bootstrapped', ar: 'ذاتي التمويل' })}</SelectItem>
                          <SelectItem value="seed">{t({ en: 'Seed', ar: 'تمويل أولي' })}</SelectItem>
                          <SelectItem value="series_a">{t({ en: 'Series A', ar: 'السلسلة A' })}</SelectItem>
                          <SelectItem value="series_b">{t({ en: 'Series B', ar: 'السلسلة B' })}</SelectItem>
                          <SelectItem value="series_c">{t({ en: 'Series C', ar: 'السلسلة C' })}</SelectItem>
                          <SelectItem value="public">{t({ en: 'Public', ar: 'عام' })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Annual Revenue Range', ar: 'نطاق الإيرادات السنوية' })}</Label>
                      <Select
                        value={formData.annual_revenue_range || ''}
                        onValueChange={(v) => setFormData({ ...formData, annual_revenue_range: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t({ en: 'Select range...', ar: 'اختر النطاق...' })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1M">0-1M {t({ en: 'SAR', ar: 'ريال' })}</SelectItem>
                          <SelectItem value="1M-10M">1M-10M {t({ en: 'SAR', ar: 'ريال' })}</SelectItem>
                          <SelectItem value="10M-50M">10M-50M {t({ en: 'SAR', ar: 'ريال' })}</SelectItem>
                          <SelectItem value="50M-100M">50M-100M {t({ en: 'SAR', ar: 'ريال' })}</SelectItem>
                          <SelectItem value="100M+">100M+ {t({ en: 'SAR', ar: 'ريال' })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: 'Funding Rounds (JSON format)', ar: 'جولات التمويل' })}</Label>
                    <Textarea
                      placeholder='[{"round_type": "seed", "amount": 1000000, "date": "2024-01-01", "lead_investor": "Investor Name"}]'
                      value={JSON.stringify(formData.funding_rounds || [], null, 2)}
                      onChange={(e) => {
                        try {
                          setFormData({ ...formData, funding_rounds: JSON.parse(e.target.value) });
                        } catch { }
                      }}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: 'Key Investors (JSON format)', ar: 'المستثمرون الرئيسيون' })}</Label>
                    <Textarea
                      placeholder='[{"name": "Investor Name", "type": "vc", "stake_percentage": 15}]'
                      value={JSON.stringify(formData.key_investors || [], null, 2)}
                      onChange={(e) => {
                        try {
                          setFormData({ ...formData, key_investors: JSON.parse(e.target.value) });
                        } catch { }
                      }}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-slate-900">{t({ en: 'Partnerships & Agreements', ar: 'الشراكات والاتفاقيات' })}</h3>

                <div className="space-y-2">
                  <Label>{t({ en: 'Partnership Agreements (JSON format)', ar: 'اتفاقيات الشراكة' })}</Label>
                  <Textarea
                    placeholder='[{"partner_name": "Company X", "type": "Strategic", "start_date": "2024-01-01", "status": "active"}]'
                    value={JSON.stringify(formData.partnership_agreements || [], null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, partnership_agreements: JSON.parse(e.target.value) });
                      } catch { }
                    }}
                    rows={4}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-slate-900">{t({ en: 'Regulatory Compliance', ar: 'الامتثال التنظيمي' })}</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.regulatory_compliance?.iso_certified || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          regulatory_compliance: { ...(formData.regulatory_compliance || {}), iso_certified: e.target.checked }
                        })}
                      />
                      <Label>ISO Certified</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.regulatory_compliance?.gdpr_compliant || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          regulatory_compliance: { ...(formData.regulatory_compliance || {}), gdpr_compliant: e.target.checked }
                        })}
                      />
                      <Label>GDPR Compliant</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.regulatory_compliance?.pdpl_compliant || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          regulatory_compliance: { ...(formData.regulatory_compliance || {}), pdpl_compliant: e.target.checked }
                        })}
                      />
                      <Label>PDPL Compliant</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ISO Standards (comma-separated)</Label>
                  <Input
                    placeholder="ISO 9001, ISO 27001, ISO 14001"
                    value={formData.regulatory_compliance?.iso_standards?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      regulatory_compliance: {
                        ...(formData.regulatory_compliance || {}),
                        iso_standards: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    })}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-slate-900">{t({ en: 'Intellectual Property', ar: 'الملكية الفكرية' })}</h3>

                <div className="space-y-2">
                  <Label>{t({ en: 'Patents (JSON format)', ar: 'براءات الاختراع' })}</Label>
                  <Textarea
                    placeholder='[{"title": "Patent Title", "number": "SA123456", "status": "granted", "filing_date": "2023-01-01"}]'
                    value={JSON.stringify(formData.intellectual_property?.patents || [], null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({
                          ...formData,
                          intellectual_property: {
                            ...(formData.intellectual_property || {}),
                            patents: JSON.parse(e.target.value)
                          }
                        });
                      } catch { }
                    }}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Trademarks (JSON format)', ar: 'العلامات التجارية' })}</Label>
                  <Textarea
                    placeholder='[{"name": "Brand Name", "registration_number": "TM123456", "registration_date": "2023-01-01"}]'
                    value={JSON.stringify(formData.intellectual_property?.trademarks || [], null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({
                          ...formData,
                          intellectual_property: {
                            ...(formData.intellectual_property || {}),
                            trademarks: JSON.parse(e.target.value)
                          }
                        });
                      } catch { }
                    }}
                    rows={4}
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {currentStep > 1 && (
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t({ en: 'Previous', ar: 'السابق' })}
          </Button>
        )}
        <div className={currentStep === 1 ? 'w-full' : 'ml-auto'}>
          {currentStep < 2 ? (
            <Button
              onClick={() => {
                handleAIGenerate();
                setCurrentStep(2);
              }}
              disabled={!formData.org_type || aiLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {t({ en: 'Next', ar: 'التالي' })}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => createOrganization.mutate(formData)}
              disabled={createOrganization.isPending || !formData.name_en || !formData.org_type}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {createOrganization.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: 'Create Organization', ar: 'إنشاء الجهة' })}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(OrganizationCreate, { requiredPermissions: ['org_create'] });
