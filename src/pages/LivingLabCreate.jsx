import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../components/LanguageContext';
import { Beaker, ChevronLeft, ChevronRight, FileText, Building2, Wifi, Users, Save, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FileUploader from '../components/FileUploader';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import StrategicPlanSelector from '@/components/strategy/StrategicPlanSelector';
import { useLivingLabMutations } from '../hooks/useLivingLabs';
import { useCities } from '../hooks/useLocations';
import { useOrganizationsWithVisibility } from '../hooks/useOrganizationsWithVisibility';
import { useQueryClient } from '@tanstack/react-query';

function LivingLabCreate() {
  const navigate = useNavigate();
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const [formData, setFormData] = useState({
    code: '',
    name_en: '',
    name_ar: '',
    tagline_en: '',
    tagline_ar: '',
    type: 'physical',
    focus_areas: [],
    city_id: '',
    organization_id: '',
    description_en: '',
    description_ar: '',
    objectives_en: '',
    objectives_ar: '',
    address: '',
    area_sqm: '',
    capacity: 5,
    status: 'planning',
    launch_date: '',
    operational_hours: '08:00-17:00',
    access_policy: 'by_application',
    connectivity: {
      '5g_available': false,
      wifi_speed_mbps: '',
      iot_platform: '',
      hpc_access: false
    },
    director_name: '',
    director_email: '',
    director_phone: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    is_published: false,
    is_featured: false,
    // Strategic alignment fields
    strategic_plan_ids: [],
    strategic_objective_ids: [],
    is_strategy_derived: false,
    research_priorities: []
  });

  const { data: cities = [] } = useCities();

  // Use visibility hook for organizations - admins see all, others see relevant ones
  const { data: organizations = [] } = useOrganizationsWithVisibility();

  const handleAIEnhancement = async () => {
    if (!formData.name_en) {
      toast.error(t({ en: 'Please enter lab name first', ar: 'الرجاء إدخال اسم المختبر أولاً' }));
      return;
    }

    const {
      LIVING_LAB_ENHANCE_PROMPT_TEMPLATE,
      LIVING_LAB_ENHANCE_RESPONSE_SCHEMA
    } = await import('@/lib/ai/prompts/livinglabs/creation');

    // @ts-ignore
    const result = await invokeAI({
      prompt: LIVING_LAB_ENHANCE_PROMPT_TEMPLATE(formData),
      response_json_schema: LIVING_LAB_ENHANCE_RESPONSE_SCHEMA
    });

    if (result.success) {
      setFormData({
        ...formData,
        tagline_en: result.data.tagline_en,
        tagline_ar: result.data.tagline_ar,
        description_en: result.data.description_en,
        description_ar: result.data.description_ar,
        objectives_en: result.data.objectives_en,
        objectives_ar: result.data.objectives_ar
      });
      toast.success(t({ en: 'AI enhanced your proposal', ar: 'حسّن الذكاء مقترحك' }));
    } else {
      toast.error(t({ en: 'AI enhancement failed', ar: 'فشل التحسين الذكي' }));
    }
  };

  const { createLab } = useLivingLabMutations();

  const handleCreate = () => {
    createLab.mutate(formData, {
      onSuccess: (lab) => {
        navigate(createPageUrl(`LivingLabDetail?id=${lab.id}`));
      }
    });
  };

  const focusAreaOptions = [
    'smart_mobility', 'digital_services', 'environment', 'energy',
    'health', 'education', 'urban_design', 'iot', 'ai_ml', 'robotics', 'cleantech'
  ];

  const toggleFocusArea = (area) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area]
    }));
  };

  const steps = [
    { id: 1, title: { en: 'Basic Info', ar: 'المعلومات الأساسية' }, icon: FileText },
    { id: 2, title: { en: 'Location & Facilities', ar: 'الموقع والمرافق' }, icon: Building2 },
    { id: 3, title: { en: 'Infrastructure', ar: 'البنية التحتية' }, icon: Wifi },
    { id: 4, title: { en: 'Management & Contact', ar: 'الإدارة والتواصل' }, icon: Users }
  ];

  const canProceed = () => {
    if (step === 1) return formData.name_en && formData.type && formData.focus_areas.length > 0;
    if (step === 2) return formData.city_id;
    return true;
  };

  return (
    <PageLayout className="max-w-5xl mx-auto">
      <PageHeader
        icon={Beaker}
        title={{ en: 'Create Living Lab', ar: 'إنشاء مختبر حي' }}
        description={{ en: 'Register a new innovation lab for R&D and experimentation', ar: 'تسجيل مختبر ابتكار جديد للبحث والتجريب' }} subtitle={undefined} action={undefined} actions={undefined} children={undefined} />

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isComplete = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${idx > 0 ? 'ml-4' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isComplete ? 'bg-green-600 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'font-semibold' : ''}`}>
                      {s.title[language]}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${step > s.id ? 'bg-green-600' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[step - 1].title[language]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div>
                <Label>{t({ en: 'Lab Code', ar: 'رمز المختبر' })}</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="LL-RUH-001"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Name (English) *', ar: 'الاسم (إنجليزي) *' })}</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Riyadh Smart Mobility Lab"
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    dir="rtl"
                    placeholder="مختبر التنقل الذكي بالرياض"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</Label>
                  <Input
                    value={formData.tagline_en}
                    onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                    placeholder="Where innovation meets reality"
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</Label>
                  <Input
                    value={formData.tagline_ar}
                    onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <Label>{t({ en: 'Lab Type *', ar: 'نوع المختبر *' })}</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-3 block">{t({ en: 'Focus Areas * (Select at least one)', ar: 'مجالات التركيز * (اختر واحدًا على الأقل)' })}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {focusAreaOptions.map((area) => (
                    <div key={area} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.focus_areas.includes(area)}
                        onCheckedChange={() => toggleFocusArea(area)}
                      />
                      <label className="text-sm capitalize">{area.replace(/_/g, ' ')}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                  placeholder="A state-of-the-art facility for testing smart mobility solutions..."
                />
              </div>

              <div>
                <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={4}
                  dir="rtl"
                />
              </div>

              {/* Strategic Alignment Section */}
              <div className="border-t pt-4 mt-4">
                <StrategicPlanSelector
                  selectedPlanIds={formData.strategic_plan_ids}
                  selectedObjectiveIds={formData.strategic_objective_ids}
                  onPlanChange={(ids) => setFormData({ ...formData, strategic_plan_ids: ids, is_strategy_derived: ids.length > 0 })}
                  onObjectiveChange={(ids) => setFormData({ ...formData, strategic_objective_ids: ids })}
                  showObjectives={true}
                />
              </div>
            </>
          )}

          {/* Step 2: Location & Facilities */}
          {step === 2 && (
            <>
              <div>
                <Label>{t({ en: 'City *', ar: 'المدينة *' })}</Label>
                <Select value={formData.city_id} onValueChange={(val) => setFormData({ ...formData, city_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name_en} | {city.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t({ en: 'Operating Organization', ar: 'المنظمة المشغلة' })}</Label>
                <Select value={formData.organization_id} onValueChange={(val) => setFormData({ ...formData, organization_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t({ en: 'Address', ar: 'العنوان' })}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="King Abdullah Road, Innovation District"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Area (sqm)', ar: 'المساحة (م²)' })}</Label>
                  <Input
                    type="number"
                    value={formData.area_sqm}
                    onChange={(e) => setFormData({ ...formData, area_sqm: parseFloat(e.target.value) })}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Project Capacity', ar: 'سعة المشاريع' })}</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t({ en: 'Launch Date', ar: 'تاريخ الإطلاق' })}</Label>
                  <Input
                    type="date"
                    value={formData.launch_date}
                    onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>{t({ en: 'Operational Hours', ar: 'ساعات التشغيل' })}</Label>
                <Input
                  value={formData.operational_hours}
                  onChange={(e) => setFormData({ ...formData, operational_hours: e.target.value })}
                  placeholder="09:00-18:00"
                />
              </div>

              <div>
                <Label>{t({ en: 'Access Policy', ar: 'سياسة الدخول' })}</Label>
                <Select value={formData.access_policy} onValueChange={(val) => setFormData({ ...formData, access_policy: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="by_application">By Application</SelectItem>
                    <SelectItem value="members_only">Members Only</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t({ en: 'Objectives (English)', ar: 'الأهداف (إنجليزي)' })}</Label>
                <Textarea
                  value={formData.objectives_en}
                  onChange={(e) => setFormData({ ...formData, objectives_en: e.target.value })}
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Step 3: Infrastructure */}
          {step === 3 && (
            <>
              <div>
                <Label className="mb-3 block">{t({ en: 'Connectivity & Tech Infrastructure', ar: 'الاتصال والبنية التقنية' })}</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.connectivity['5g_available']}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        connectivity: { ...formData.connectivity, '5g_available': checked }
                      })}
                    />
                    <span className="text-sm">5G Network Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.connectivity.hpc_access}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        connectivity: { ...formData.connectivity, hpc_access: checked }
                      })}
                    />
                    <span className="text-sm">High-Performance Computing Access</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'WiFi Speed (Mbps)', ar: 'سرعة الواي فاي' })}</Label>
                  <Input
                    type="number"
                    value={formData.connectivity.wifi_speed_mbps}
                    onChange={(e) => setFormData({
                      ...formData,
                      connectivity: { ...formData.connectivity, wifi_speed_mbps: parseInt(e.target.value) }
                    })}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label>{t({ en: 'IoT Platform', ar: 'منصة إنترنت الأشياء' })}</Label>
                  <Input
                    value={formData.connectivity.iot_platform}
                    onChange={(e) => setFormData({
                      ...formData,
                      connectivity: { ...formData.connectivity, iot_platform: e.target.value }
                    })}
                    placeholder="AWS IoT Core, Azure IoT Hub, etc."
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 4: Management & Contact */}
          {step === 4 && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t({ en: 'Director Name', ar: 'اسم المدير' })}</Label>
                  <Input
                    value={formData.director_name}
                    onChange={(e) => setFormData({ ...formData, director_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Director Email', ar: 'بريد المدير' })}</Label>
                  <Input
                    type="email"
                    value={formData.director_email}
                    onChange={(e) => setFormData({ ...formData, director_email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Director Phone', ar: 'هاتف المدير' })}</Label>
                  <Input
                    value={formData.director_phone}
                    onChange={(e) => setFormData({ ...formData, director_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Contact Email', ar: 'البريد الإلكتروني' })}</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Contact Phone', ar: 'رقم الهاتف' })}</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>{t({ en: 'Website URL', ar: 'رابط الموقع' })}</Label>
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://lab.example.com"
                />
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-slate-900">{t({ en: 'Lab Media', ar: 'وسائط المختبر' })}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Lab Image', ar: 'صورة المختبر' })}</Label>
                    <FileUploader
                      type="image"
                      label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                      maxSize={10}
                      onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: 'Virtual Tour Video', ar: 'فيديو الجولة' })}</Label>
                    <FileUploader
                      type="video"
                      label={t({ en: 'Upload Video', ar: 'رفع فيديو' })}
                      maxSize={200}
                      preview={false}
                      onUploadComplete={(url) => setFormData({ ...formData, video_url: url })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Lab Brochure', ar: 'كتيب المختبر' })}</Label>
                  <FileUploader
                    type="document"
                    label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                    maxSize={50}
                    preview={false}
                    onUploadComplete={(url) => setFormData({ ...formData, brochure_url: url })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <span className="text-sm">{t({ en: 'Publish immediately', ar: 'النشر فورًا' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <span className="text-sm">{t({ en: 'Feature on homepage', ar: 'عرض في الصفحة الرئيسية' })}</span>
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : navigate(createPageUrl('LivingLabs'))}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t({ en: step === 1 ? 'Cancel' : 'Back', ar: step === 1 ? 'إلغاء' : 'السابق' })}
              </Button>
              {step === 1 && (
                <Button
                  type="button"
                  onClick={handleAIEnhancement}
                  disabled={aiLoading || !formData.name_en}
                  variant="outline"
                  className="gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t({ en: 'AI Working...', ar: 'الذكاء يعمل...' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t({ en: 'AI Enhance', ar: 'تحسين ذكي' })}
                    </>
                  )}
                </Button>
              )}
            </div>
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={createLab.isPending || !canProceed()}
                className="bg-gradient-to-r from-green-600 to-teal-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Create Living Lab', ar: 'إنشاء المختبر' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(LivingLabCreate, { requireAdmin: true });