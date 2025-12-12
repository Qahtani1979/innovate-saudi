import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { ArrowRight, ArrowLeft, Sparkles, Loader2, CheckCircle2, Calendar, Target, Users, Award, Building2, FileText, MapPin, X, Save } from 'lucide-react';
import FileUploader from '../FileUploader';
import { toast } from 'sonner';
import AICurriculumGenerator from './AICurriculumGenerator';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useMunicipalitiesWithVisibility, useOrganizationsWithVisibility } from '@/hooks/visibility';

export default function ProgramCreateWizard({ onComplete, initialData = {} }) {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const { invokeAI, status: aiStatus, isLoading: aiProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    tagline_en: '',
    tagline_ar: '',
    description_en: '',
    description_ar: '',
    objectives_en: '',
    objectives_ar: '',
    program_type: 'accelerator',
    workflow_stage: 'planning',
    status: 'planning',
    duration_weeks: 12,
    focus_areas: [],
    eligibility_criteria: [],
    benefits: [],
    timeline: {},
    target_participants: { min_participants: 10, max_participants: 30 },
    funding_available: false,
    is_published: false,
    ...initialData
  });

  // Use visibility-aware hooks for organizations and municipalities
  const { data: organizations = [] } = useOrganizationsWithVisibility();
  const { data: municipalities = [] } = useMunicipalitiesWithVisibility();

  // Reference data (public - no visibility needed)
  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data } = await supabase.from('sectors').select('*');
      return data || [];
    }
  });

  const { data: subsectors = [] } = useQuery({
    queryKey: ['subsectors'],
    queryFn: async () => {
      const { data } = await supabase.from('subsectors').select('*');
      return data || [];
    }
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await supabase.from('services').select('*');
      return data || [];
    }
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data } = await supabase.from('regions').select('*');
      return data || [];
    }
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data } = await supabase.from('cities').select('*');
      return data || [];
    }
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: async () => {
      const { data } = await supabase.from('strategic_plans').select('*');
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: program, error } = await supabase
        .from('programs')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      
      // Log creation
      await supabase.from('system_activities').insert({
        entity_type: 'program',
        entity_id: program.id,
        activity_type: 'program_created',
        performed_by: user?.email,
        timestamp: new Date().toISOString(),
        metadata: { wizard: true }
      });

      return program;
    },
    onSuccess: (program) => {
      toast.success(t({ en: 'Program created successfully!', ar: 'تم إنشاء البرنامج بنجاح!' }));
      if (onComplete) {
        onComplete(program);
      } else {
        navigate(createPageUrl(`ProgramDetail?id=${program.id}`));
      }
    }
  });

  const handleAIEnhance = async () => {
    const prompt = `Generate comprehensive bilingual content for a ${formData.program_type} program:

Name: ${formData.name_en || 'Not provided'}
Type: ${formData.program_type}
Duration: ${formData.duration_weeks} weeks

Generate:
1. Professional English + Arabic names
2. Compelling taglines (EN + AR)
3. Detailed descriptions (250+ words each, EN + AR)
4. Clear objectives (EN + AR)
5. 5 focus areas relevant to this program type
6. 5 eligibility criteria
7. 5 key benefits for participants`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          tagline_en: { type: 'string' },
          tagline_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          objectives_en: { type: 'string' },
          objectives_ar: { type: 'string' },
          focus_areas: { type: 'array', items: { type: 'string' } },
          eligibility_criteria: { type: 'array', items: { type: 'string' } },
          benefits: { type: 'array', items: { type: 'object' } }
        }
      }
    });

    if (result.success) {
      setFormData(prev => ({ ...prev, ...result.data }));
      toast.success(t({ en: '✨ Content enhanced!', ar: '✨ تم التحسين!' }));
    }
  };

  const steps = [
    {
      number: 1,
      title: { en: 'Basic Information', ar: 'المعلومات الأساسية' },
      icon: FileText,
      fields: ['name_en', 'name_ar', 'program_type', 'tagline_en', 'tagline_ar']
    },
    {
      number: 2,
      title: { en: 'Program Details', ar: 'تفاصيل البرنامج' },
      icon: Target,
      fields: ['description_en', 'description_ar', 'objectives_en', 'objectives_ar']
    },
    {
      number: 3,
      title: { en: 'Structure & Timeline', ar: 'الهيكل والجدول' },
      icon: Calendar,
      fields: ['duration_weeks', 'timeline', 'focus_areas']
    },
    {
      number: 4,
      title: { en: 'Participants', ar: 'المشاركون' },
      icon: Users,
      fields: ['target_participants', 'eligibility_criteria']
    },
    {
      number: 5,
      title: { en: 'Benefits & Funding', ar: 'الفوائد والتمويل' },
      icon: Award,
      fields: ['benefits', 'funding_available', 'funding_details']
    },
    {
      number: 6,
      title: { en: 'Taxonomy & Geography', ar: 'التصنيف والجغرافيا' },
      icon: MapPin,
      fields: ['sector_id', 'subsector_id', 'service_focus_ids', 'municipality_targets']
    },
    {
      number: 7,
      title: { en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' },
      icon: Target,
      fields: ['strategic_plan_ids', 'strategic_pillar_id', 'strategic_objective_ids']
    },
    {
      number: 8,
      title: { en: 'Organization & Media', ar: 'المنظمة والوسائط' },
      icon: Building2,
      fields: ['operator_organization_id', 'image_url', 'brochure_url']
    }
  ];

  const currentStepData = steps[currentStep - 1];
  const progress = (currentStep / steps.length) * 100;

  const canProceed = () => {
    if (currentStep === 1) return formData.name_en && formData.program_type;
    if (currentStep === 2) return formData.description_en;
    return true;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Create New Program', ar: 'إنشاء برنامج جديد' })}
          </h1>
          <Badge className="text-lg px-4 py-2">
            {t({ en: `Step ${currentStep} of ${steps.length}`, ar: `خطوة ${currentStep} من ${steps.length}` })}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div key={step.number} className="flex flex-col items-center gap-1">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  step.number < currentStep ? 'bg-green-500 text-white' :
                  step.number === currentStep ? 'bg-blue-600 text-white' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  {step.number < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs text-slate-600 text-center max-w-[100px]">
                  {step.title[language]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {React.createElement(currentStepData.icon, { className: "h-5 w-5" })}
              {currentStepData.title[language]}
            </CardTitle>
            {currentStep === 2 && (
              <Button onClick={handleAIEnhance} disabled={aiProcessing || !isAvailable} variant="outline" size="sm">
                {aiProcessing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t({ en: 'Generating...', ar: 'جاري التوليد...' })}</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> {t({ en: 'AI Generate All', ar: 'توليد ذكي' })}</>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Program Name (English) *</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                    placeholder="Innovation Accelerator 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم البرنامج (عربي)</Label>
                  <Input
                    value={formData.name_ar || ''}
                    onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                    placeholder="برنامج التسريع للابتكار 2025"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Program Type *</Label>
                <Select
                  value={formData.program_type}
                  onValueChange={(v) => setFormData({...formData, program_type: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accelerator">Accelerator</SelectItem>
                    <SelectItem value="incubator">Incubator</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="challenge">Challenge Program</SelectItem>
                    <SelectItem value="fellowship">Fellowship</SelectItem>
                    <SelectItem value="training">Training Program</SelectItem>
                    <SelectItem value="matchmaker">Matchmaker</SelectItem>
                    <SelectItem value="sandbox_wave">Sandbox Wave</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tagline (English)</Label>
                  <Input
                    value={formData.tagline_en || ''}
                    onChange={(e) => setFormData({...formData, tagline_en: e.target.value})}
                    placeholder="Accelerating innovation across Saudi cities"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الشعار (عربي)</Label>
                  <Input
                    value={formData.tagline_ar || ''}
                    onChange={(e) => setFormData({...formData, tagline_ar: e.target.value})}
                    placeholder="تسريع الابتكار عبر المدن السعودية"
                    dir="rtl"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label>Description (English) *</Label>
                <Textarea
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  rows={5}
                  placeholder="Comprehensive program description..."
                />
              </div>

              <div className="space-y-2">
                <Label>الوصف (عربي)</Label>
                <Textarea
                  value={formData.description_ar || ''}
                  onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                  rows={5}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label>Objectives (English)</Label>
                <Textarea
                  value={formData.objectives_en || ''}
                  onChange={(e) => setFormData({...formData, objectives_en: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>الأهداف (عربي)</Label>
                <Textarea
                  value={formData.objectives_ar || ''}
                  onChange={(e) => setFormData({...formData, objectives_ar: e.target.value})}
                  rows={4}
                  dir="rtl"
                />
              </div>
            </>
          )}

          {/* Step 3: Structure */}
          {currentStep === 3 && (
            <>
              <AICurriculumGenerator
                programType={formData.program_type}
                duration_weeks={formData.duration_weeks}
                objectives={formData.objectives_en}
                onCurriculumGenerated={(curriculum) => setFormData({...formData, curriculum})}
              />

              <div className="space-y-2">
                <Label>Duration (weeks)</Label>
                <Input
                  type="number"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({...formData, duration_weeks: parseInt(e.target.value)})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Application Open Date</Label>
                  <Input
                    type="date"
                    value={formData.timeline?.application_open || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeline: {...(formData.timeline || {}), application_open: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Application Close Date</Label>
                  <Input
                    type="date"
                    value={formData.timeline?.application_close || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeline: {...(formData.timeline || {}), application_close: e.target.value}
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Program Start Date</Label>
                  <Input
                    type="date"
                    value={formData.timeline?.program_start || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeline: {...(formData.timeline || {}), program_start: e.target.value}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Program End Date</Label>
                  <Input
                    type="date"
                    value={formData.timeline?.program_end || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeline: {...(formData.timeline || {}), program_end: e.target.value}
                    })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 4: Participants */}
          {currentStep === 4 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Participants</Label>
                  <Input
                    type="number"
                    value={formData.target_participants?.min_participants || 10}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_participants: {...(formData.target_participants || {}), min_participants: parseInt(e.target.value)}
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Participants</Label>
                  <Input
                    type="number"
                    value={formData.target_participants?.max_participants || 30}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_participants: {...(formData.target_participants || {}), max_participants: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Eligibility Criteria</Label>
                {(formData.eligibility_criteria || []).map((criteria, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={criteria}
                      onChange={(e) => {
                        const updated = [...(formData.eligibility_criteria || [])];
                        updated[idx] = e.target.value;
                        setFormData({...formData, eligibility_criteria: updated});
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const updated = formData.eligibility_criteria.filter((_, i) => i !== idx);
                        setFormData({...formData, eligibility_criteria: updated});
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({
                    ...formData,
                    eligibility_criteria: [...(formData.eligibility_criteria || []), '']
                  })}
                >
                  + Add Criteria
                </Button>
              </div>
            </>
          )}

          {/* Step 5: Benefits */}
          {currentStep === 5 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={formData.funding_available}
                  onChange={(e) => setFormData({...formData, funding_available: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label>Funding Available</Label>
              </div>

              {formData.funding_available && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Min Amount (SAR)</Label>
                    <Input
                      type="number"
                      value={formData.funding_details?.min_amount || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        funding_details: {...(formData.funding_details || {}), min_amount: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Amount (SAR)</Label>
                    <Input
                      type="number"
                      value={formData.funding_details?.max_amount || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        funding_details: {...(formData.funding_details || {}), max_amount: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Pool (SAR)</Label>
                    <Input
                      type="number"
                      value={formData.funding_details?.total_pool || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        funding_details: {...(formData.funding_details || {}), total_pool: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 6: Taxonomy & Geography */}
          {currentStep === 6 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Primary Sector', ar: 'القطاع الأساسي' })}</Label>
                  <Select
                    value={formData.sector_id || ''}
                    onValueChange={(v) => setFormData({...formData, sector_id: v, subsector_id: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select sector...', ar: 'اختر القطاع...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {language === 'ar' && s.name_ar ? s.name_ar : s.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Subsector', ar: 'القطاع الفرعي' })}</Label>
                  <Select
                    value={formData.subsector_id || ''}
                    onValueChange={(v) => setFormData({...formData, subsector_id: v})}
                    disabled={!formData.sector_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select subsector...', ar: 'اختر القطاع الفرعي...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {subsectors.filter(s => s.sector_id === formData.sector_id).map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {language === 'ar' && s.name_ar ? s.name_ar : s.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Service Focus Areas', ar: 'مجالات التركيز على الخدمات' })}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.service_focus_ids || []).map(sId => {
                    const service = services.find(s => s.id === sId);
                    return service ? (
                      <Badge key={sId} className="gap-1">
                        {language === 'ar' && service.name_ar ? service.name_ar : service.name_en}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFormData({
                            ...formData, 
                            service_focus_ids: formData.service_focus_ids.filter(id => id !== sId)
                          })}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Select
                  onValueChange={(v) => {
                    if (!formData.service_focus_ids?.includes(v)) {
                      setFormData({...formData, service_focus_ids: [...(formData.service_focus_ids || []), v]});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Add service...', ar: 'أضف خدمة...' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {language === 'ar' && s.name_ar ? s.name_ar : s.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Target Municipalities', ar: 'البلديات المستهدفة' })}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.municipality_targets || []).map(mId => {
                    const muni = municipalities.find(m => m.id === mId);
                    return muni ? (
                      <Badge key={mId} className="gap-1">
                        {language === 'ar' && muni.name_ar ? muni.name_ar : muni.name_en}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFormData({
                            ...formData, 
                            municipality_targets: formData.municipality_targets.filter(id => id !== mId)
                          })}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Select
                  onValueChange={(v) => {
                    if (!formData.municipality_targets?.includes(v)) {
                      setFormData({...formData, municipality_targets: [...(formData.municipality_targets || []), v]});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Add municipality...', ar: 'أضف بلدية...' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {language === 'ar' && m.name_ar ? m.name_ar : m.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Target Regions', ar: 'المناطق المستهدفة' })}</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.region_targets || []).map(rId => {
                      const region = regions.find(r => r.id === rId);
                      return region ? (
                        <Badge key={rId} variant="outline" className="gap-1">
                          {language === 'ar' && region.name_ar ? region.name_ar : region.name_en}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setFormData({
                              ...formData, 
                              region_targets: formData.region_targets.filter(id => id !== rId)
                            })}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <Select
                    onValueChange={(v) => {
                      if (!formData.region_targets?.includes(v)) {
                        setFormData({...formData, region_targets: [...(formData.region_targets || []), v]});
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Add region...', ar: 'أضف منطقة...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          {language === 'ar' && r.name_ar ? r.name_ar : r.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Target Cities', ar: 'المدن المستهدفة' })}</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.city_targets || []).map(cId => {
                      const city = cities.find(c => c.id === cId);
                      return city ? (
                        <Badge key={cId} variant="outline" className="gap-1">
                          {language === 'ar' && city.name_ar ? city.name_ar : city.name_en}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setFormData({
                              ...formData, 
                              city_targets: formData.city_targets.filter(id => id !== cId)
                            })}
                          />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <Select
                    onValueChange={(v) => {
                      if (!formData.city_targets?.includes(v)) {
                        setFormData({...formData, city_targets: [...(formData.city_targets || []), v]});
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Add city...', ar: 'أضف مدينة...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {language === 'ar' && c.name_ar ? c.name_ar : c.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Step 7: Strategic Alignment */}
          {currentStep === 7 && (
            <>
              <div className="space-y-2">
                <Label>{t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.strategic_plan_ids || []).map(spId => {
                    const plan = strategicPlans.find(sp => sp.id === spId);
                    return plan ? (
                      <Badge key={spId} className="gap-1">
                        {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setFormData({
                            ...formData, 
                            strategic_plan_ids: formData.strategic_plan_ids.filter(id => id !== spId)
                          })}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Select
                  onValueChange={(v) => {
                    if (!formData.strategic_plan_ids?.includes(v)) {
                      setFormData({...formData, strategic_plan_ids: [...(formData.strategic_plan_ids || []), v]});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Link strategic plan...', ar: 'ربط خطة استراتيجية...' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {strategicPlans.map(sp => (
                      <SelectItem key={sp.id} value={sp.id}>
                        {language === 'ar' && sp.name_ar ? sp.name_ar : sp.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 mb-2 font-medium">
                  {t({ en: '💡 Strategic Alignment', ar: '💡 التوافق الاستراتيجي' })}
                </p>
                <p className="text-xs text-slate-700">
                  {t({ 
                    en: 'Link this program to strategic plans, pillars, and objectives to track contribution to national goals.',
                    ar: 'اربط هذا البرنامج بالخطط والركائز والأهداف الاستراتيجية لتتبع المساهمة في الأهداف الوطنية.'
                  })}
                </p>
              </div>
            </>
          )}

          {/* Step 8: Organization & Media */}
          {currentStep === 8 && (
            <>
              <div className="space-y-2">
                <Label>Operating Organization</Label>
                <Select
                  value={formData.operator_organization_id || ''}
                  onValueChange={(v) => setFormData({...formData, operator_organization_id: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization..." />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Program Image</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                  maxSize={10}
                  onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                />
              </div>

              <div className="space-y-2">
                <Label>Program Brochure</Label>
                <FileUploader
                  type="document"
                  label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                  maxSize={50}
                  preview={false}
                  onUploadComplete={(url) => setFormData({...formData, brochure_url: url})}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate(createPageUrl('Programs'))}
          disabled={createMutation.isPending}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Back', ar: 'رجوع' })}
        </Button>

        <Button
          onClick={() => {
            if (currentStep < steps.length) {
              setCurrentStep(currentStep + 1);
            } else {
              createMutation.mutate(formData);
            }
          }}
          disabled={!canProceed() || createMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-teal-600"
        >
          {createMutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}</>
          ) : currentStep === steps.length ? (
            <><Save className="h-4 w-4 mr-2" /> {t({ en: 'Create Program', ar: 'إنشاء البرنامج' })}</>
          ) : (
            <>{t({ en: 'Next', ar: 'التالي' })} <ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}