import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../components/LanguageContext';
import { createPageUrl } from '../utils';
import { Shield, ChevronLeft, ChevronRight, FileText, Building2, Wifi, DollarSign, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import FileUploader from '../components/FileUploader';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function SandboxCreate() {
  const navigate = useNavigate();
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  
  const [formData, setFormData] = useState({
    code: '',
    name_en: '',
    name_ar: '',
    tagline_en: '',
    tagline_ar: '',
    domain: 'smart_mobility',
    city_id: '',
    organization_id: '',
    living_lab_id: '',
    description_en: '',
    description_ar: '',
    objectives_en: '',
    objectives_ar: '',
    address: '',
    area_sqm: '',
    capacity: 10,
    status: 'planning',
    launch_date: '',
    operational_hours: '24/7',
    regulatory_framework: '',
    available_exemptions: [],
    connectivity: {
      '5g_available': false,
      iot_network: false,
      fiber_speed_mbps: '',
      edge_computing: false
    },
    usage_fees: {
      daily_rate: '',
      monthly_rate: ''
    },
    manager_name: '',
    manager_email: '',
    manager_phone: '',
    is_published: false
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const { data: livingLabs = [] } = useQuery({
    queryKey: ['living-labs'],
    queryFn: () => base44.entities.LivingLab.list()
  });

  const handleAIEnhancement = async () => {
    if (!formData.name_en || !formData.domain) {
      toast.error(t({ en: 'Please enter sandbox name and domain first', ar: 'الرجاء إدخال اسم المنطقة والمجال أولاً' }));
      return;
    }
    try {
      const result = await invokeAI({
        prompt: `Enhance this regulatory sandbox proposal:

Sandbox Name: ${formData.name_en}
Domain: ${formData.domain}
Current Description: ${formData.description_en || 'N/A'}

Provide bilingual enhancements:
1. Professional tagline (AR + EN)
2. Expanded description highlighting regulatory innovation (AR + EN)
3. Clear objectives for regulatory testing (AR + EN)
4. Suggested exemption categories (3-5 items)
5. Safety protocol recommendations`,
        response_json_schema: {
          type: 'object',
          properties: {
            tagline_en: { type: 'string' },
            tagline_ar: { type: 'string' },
            description_en: { type: 'string' },
            description_ar: { type: 'string' },
            objectives_en: { type: 'string' },
            objectives_ar: { type: 'string' },
            exemption_suggestions: { type: 'array', items: { type: 'string' } }
          }
        }
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
        toast.success(t({ en: 'AI enhanced your sandbox', ar: 'حسّن الذكاء منطقتك' }));
      } else {
        toast.error(t({ en: 'AI enhancement failed', ar: 'فشل التحسين' }));
      }
    } catch (error) {
      toast.error(t({ en: 'AI enhancement failed', ar: 'فشل التحسين' }));
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Sandbox.create(data),
    onSuccess: (sandbox) => {
      toast.success(t({ en: 'Sandbox created successfully', ar: 'تم إنشاء المنطقة بنجاح' }));
      navigate(createPageUrl(`SandboxDetail?id=${sandbox.id}`));
    }
  });

  const steps = [
    { id: 1, title: { en: 'Basic Info', ar: 'المعلومات الأساسية' }, icon: FileText },
    { id: 2, title: { en: 'Location & Capacity', ar: 'الموقع والسعة' }, icon: Building2 },
    { id: 3, title: { en: 'Infrastructure', ar: 'البنية التحتية' }, icon: Wifi },
    { id: 4, title: { en: 'Pricing & Contact', ar: 'التسعير والتواصل' }, icon: DollarSign },
    { id: 5, title: { en: 'Review', ar: 'المراجعة' }, icon: ImageIcon }
  ];

  const canProceed = () => {
    if (step === 1) return formData.name_en && formData.domain;
    if (step === 2) return formData.city_id && formData.capacity;
    return true;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Create New Sandbox', ar: 'إنشاء منطقة اختبار جديدة' })}
        </h1>
      </div>

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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-600 text-white' :
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
                <Label>{t({ en: 'Sandbox Code', ar: 'رمز المنطقة' })}</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="SB-RUH-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Name (English) *', ar: 'الاسم (إنجليزي) *' })}</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</Label>
                  <Input
                    value={formData.tagline_en}
                    onChange={(e) => setFormData({...formData, tagline_en: e.target.value})}
                    placeholder="Testing tomorrow's mobility solutions"
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</Label>
                  <Input
                    value={formData.tagline_ar}
                    onChange={(e) => setFormData({...formData, tagline_ar: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>{t({ en: 'Domain *', ar: 'المجال *' })}</Label>
                <Select value={formData.domain} onValueChange={(val) => setFormData({...formData, domain: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smart_mobility">Smart Mobility</SelectItem>
                    <SelectItem value="digital_services">Digital Services</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="urban_development">Urban Development</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  rows={4}
                />
              </div>
              <div>
                <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                  rows={4}
                />
              </div>
            </>
          )}

          {/* Step 2: Location & Capacity */}
          {step === 2 && (
            <>
              <div>
                <Label>{t({ en: 'City *', ar: 'المدينة *' })}</Label>
                <Select value={formData.city_id} onValueChange={(val) => setFormData({...formData, city_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>{city.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t({ en: 'Managing Organization', ar: 'المنظمة المسؤولة' })}</Label>
                <Select value={formData.organization_id} onValueChange={(val) => setFormData({...formData, organization_id: val})}>
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
                <Label>{t({ en: 'Linked Living Lab', ar: 'المختبر الحي المرتبط' })}</Label>
                <Select value={formData.living_lab_id} onValueChange={(val) => setFormData({...formData, living_lab_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {livingLabs.map(lab => (
                      <SelectItem key={lab.id} value={lab.id}>{lab.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t({ en: 'Address', ar: 'العنوان' })}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Area (sqm)', ar: 'المساحة (م²)' })}</Label>
                  <Input
                    type="number"
                    value={formData.area_sqm}
                    onChange={(e) => setFormData({...formData, area_sqm: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Project Capacity *', ar: 'سعة المشاريع *' })}</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t({ en: 'Launch Date', ar: 'تاريخ الإطلاق' })}</Label>
                  <Input
                    type="date"
                    value={formData.launch_date}
                    onChange={(e) => setFormData({...formData, launch_date: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Infrastructure */}
          {step === 3 && (
            <>
              <div>
                <Label className="mb-3 block">{t({ en: 'Connectivity', ar: 'الاتصال' })}</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.connectivity['5g_available']}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        connectivity: {...formData.connectivity, '5g_available': checked}
                      })}
                    />
                    <span className="text-sm">5G Network Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.connectivity.iot_network}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        connectivity: {...formData.connectivity, iot_network: checked}
                      })}
                    />
                    <span className="text-sm">IoT Network</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.connectivity.edge_computing}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        connectivity: {...formData.connectivity, edge_computing: checked}
                      })}
                    />
                    <span className="text-sm">Edge Computing</span>
                  </div>
                </div>
              </div>
              <div>
                <Label>{t({ en: 'Fiber Speed (Mbps)', ar: 'سرعة الألياف' })}</Label>
                <Input
                  type="number"
                  value={formData.connectivity.fiber_speed_mbps}
                  onChange={(e) => setFormData({
                    ...formData,
                    connectivity: {...formData.connectivity, fiber_speed_mbps: parseInt(e.target.value)}
                  })}
                />
              </div>
              <div>
                <Label>{t({ en: 'Operational Hours', ar: 'ساعات التشغيل' })}</Label>
                <Input
                  value={formData.operational_hours}
                  onChange={(e) => setFormData({...formData, operational_hours: e.target.value})}
                />
              </div>
              <div>
                <Label>{t({ en: 'Regulatory Framework', ar: 'الإطار التنظيمي' })}</Label>
                <Textarea
                  value={formData.regulatory_framework}
                  onChange={(e) => setFormData({...formData, regulatory_framework: e.target.value})}
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Step 4: Pricing & Contact */}
          {step === 4 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Daily Rate (SAR)', ar: 'السعر اليومي' })}</Label>
                  <Input
                    type="number"
                    value={formData.usage_fees.daily_rate}
                    onChange={(e) => setFormData({
                      ...formData,
                      usage_fees: {...formData.usage_fees, daily_rate: parseFloat(e.target.value)}
                    })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Monthly Rate (SAR)', ar: 'السعر الشهري' })}</Label>
                  <Input
                    type="number"
                    value={formData.usage_fees.monthly_rate}
                    onChange={(e) => setFormData({
                      ...formData,
                      usage_fees: {...formData.usage_fees, monthly_rate: parseFloat(e.target.value)}
                    })}
                  />
                </div>
              </div>
              <div>
                <Label>{t({ en: 'Manager Name', ar: 'اسم المدير' })}</Label>
                <Input
                  value={formData.manager_name}
                  onChange={(e) => setFormData({...formData, manager_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ en: 'Manager Email', ar: 'بريد المدير' })}</Label>
                  <Input
                    type="email"
                    value={formData.manager_email}
                    onChange={(e) => setFormData({...formData, manager_email: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Manager Phone', ar: 'هاتف المدير' })}</Label>
                  <Input
                    value={formData.manager_phone}
                    onChange={(e) => setFormData({...formData, manager_phone: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 5: Review & Media */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">{t({ en: 'Sandbox Summary', ar: 'ملخص المنطقة' })}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">{t({ en: 'Name:', ar: 'الاسم:' })}</span>
                    <p className="font-medium">{formData.name_en}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">{t({ en: 'Domain:', ar: 'المجال:' })}</span>
                    <p className="font-medium">{formData.domain}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">{t({ en: 'City:', ar: 'المدينة:' })}</span>
                    <p className="font-medium">{cities.find(c => c.id === formData.city_id)?.name_en || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">{t({ en: 'Capacity:', ar: 'السعة:' })}</span>
                    <p className="font-medium">{formData.capacity} projects</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-slate-900">{t({ en: 'Sandbox Media', ar: 'وسائط المنطقة' })}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Sandbox Image', ar: 'صورة المنطقة' })}</Label>
                    <FileUploader
                      type="image"
                      label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                      maxSize={10}
                      onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: 'Tour Video', ar: 'فيديو الجولة' })}</Label>
                    <FileUploader
                      type="video"
                      label={t({ en: 'Upload Video', ar: 'رفع فيديو' })}
                      maxSize={200}
                      preview={false}
                      onUploadComplete={(url) => setFormData({...formData, video_url: url})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Sandbox Brochure', ar: 'كتيب المنطقة' })}</Label>
                  <FileUploader
                    type="document"
                    label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                    maxSize={50}
                    preview={false}
                    onUploadComplete={(url) => setFormData({...formData, brochure_url: url})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
                />
                <span className="text-sm">{t({ en: 'Publish immediately', ar: 'النشر فورًا' })}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Back', ar: 'السابق' })}
            </Button>
            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {t({ en: 'Next', ar: 'التالي' })}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-teal-600"
              >
                <Shield className="h-4 w-4 mr-2" />
                {t({ en: 'Create Sandbox', ar: 'إنشاء المنطقة' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(SandboxCreate, { requireAdmin: true });