import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Save, Loader2, Plus, X, Sparkles, ChevronRight, ChevronLeft,
  FileText, Code, DollarSign, CheckCircle2, Upload, Target, AlertCircle
} from 'lucide-react';
import FileUploader from '../FileUploader';
import { toast } from 'sonner';
import CompetitiveAnalysisWidget from './CompetitiveAnalysisWidget';
import AIPricingSuggester from './AIPricingSuggester';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { solutionStep1Schema, solutionStep2Schema, solutionStep4Schema, validateSolution } from '@/lib/validations/solutionSchema';

export default function SolutionCreateWizard({ onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [matchingChallenges, setMatchingChallenges] = useState([]);
  const { triggerEmail } = useEmailTrigger();
  const { invokeAI, status: aiStatus, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-active'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*')
        .in('status', ['approved', 'in_treatment']);
      return data || [];
    }
  });

  const [formData, setFormData] = useState({
    code: '',
    name_en: '',
    name_ar: '',
    tagline_en: '',
    tagline_ar: '',
    description_en: '',
    description_ar: '',
    provider_name: '',
    provider_type: 'startup',
    provider_id: '',
    sectors: [],
    categories: [],
    maturity_level: 'prototype',
    trl: 5,
    trl_assessment: null,
    features: [],
    value_proposition: '',
    use_cases: [],
    technical_specifications: {},
    pricing_model: '',
    pricing_details: {},
    deployment_options: [],
    implementation_timeline: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    demo_url: '',
    documentation_url: '',
    certifications: [],
    case_studies: [],
    image_url: '',
    video_url: '',
    gallery_urls: [],
    brochure_url: '',
    workflow_stage: 'draft',
    is_published: false,
    is_verified: false
  });

  const [newFeature, setNewFeature] = useState('');

  const steps = [
    { num: 1, title: { en: 'Basic Info', ar: 'المعلومات الأساسية' }, icon: FileText },
    { num: 2, title: { en: 'Technical Specs', ar: 'المواصفات التقنية' }, icon: Code },
    { num: 3, title: { en: 'AI Enhancement', ar: 'التحسين الذكي' }, icon: Sparkles },
    { num: 4, title: { en: 'Provider & Commercial', ar: 'المزود والتجاري' }, icon: DollarSign },
    { num: 5, title: { en: 'Validation & Media', ar: 'التحقق والوسائط' }, icon: Upload },
    { num: 6, title: { en: 'Review & Submit', ar: 'المراجعة والإرسال' }, icon: CheckCircle2 }
  ];

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: solution, error } = await supabase.from('solutions').insert(data).select().single();
      if (error) throw error;

      // Log creation
      await supabase.from('system_activities').insert({
        entity_type: 'Solution',
        entity_id: solution.id,
        activity_type: 'created',
        description: `Solution "${data.name_en}" created by ${data.provider_name}`
      });

      return solution;
    },
    onSuccess: async (solution) => {
      queryClient.invalidateQueries(['solutions']);
      
      // Trigger email notification for solution creation
      await triggerEmail('solution.created', {
        entityType: 'solution',
        entityId: solution.id,
        variables: {
          solution_name: solution.name_en,
          solution_code: solution.code,
          provider_name: solution.provider_name
        }
      }).catch(err => console.error('Email trigger failed:', err));
      
      toast.success(t({ en: 'Solution created successfully!', ar: 'تم إنشاء الحل بنجاح!' }));
      if (onComplete) {
        onComplete(solution);
      } else {
        navigate(createPageUrl(`SolutionDetail?id=${solution.id}`));
      }
    },
    onError: () => {
      toast.error(t({ en: 'Failed to create solution', ar: 'فشل إنشاء الحل' }));
    }
  });

  // AI Enhancement
  const handleAIEnhancement = async () => {
    if (!formData.name_en && !formData.description_en) {
      toast.error(t({ en: 'Please enter solution name or description first', ar: 'يرجى إدخال اسم الحل أو الوصف أولاً' }));
      return;
    }

    const prompt = `Analyze this innovation solution for Saudi municipal innovation and provide comprehensive BILINGUAL enhancement (Arabic + English):

Current data:
Name EN: ${formData.name_en}
Name AR: ${formData.name_ar}
Description EN: ${formData.description_en}
Description AR: ${formData.description_ar}
Provider: ${formData.provider_name}
Provider Type: ${formData.provider_type}
Sectors: ${formData.sectors.join(', ')}

Generate:
1. Refined solution names (AR + EN) - professional, marketable, clear value
2. Enhanced descriptions (AR + EN) - comprehensive, 250+ words, value-focused
3. Compelling taglines (AR + EN) - catchy one-liners highlighting key benefit
4. Key features (6-8 specific technical capabilities)
5. Use cases (4-6 practical applications with titles, descriptions, target sectors)
6. Technology stack array (relevant technologies: cloud, AI, IoT, etc.)
7. Value proposition statement (clear benefit for municipalities)
8. Target sectors array (urban_design, transport, environment, etc.)
9. Suggested maturity level (concept/prototype/pilot_ready/market_ready/proven)
10. TRL level (1-9) with justification
11. Keywords for searchability (8-12 keywords)
12. Competitive advantages (3-5 key differentiators)`;

    const aiResult = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          tagline_en: { type: 'string' },
          tagline_ar: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          use_cases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                sector: { type: 'string' }
              }
            }
          },
          technology_stack: { type: 'array', items: { type: 'string' } },
          value_proposition: { type: 'string' },
          sectors: { type: 'array', items: { type: 'string' } },
          maturity_level: { type: 'string' },
          trl: { type: 'number' },
          trl_justification: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
          competitive_advantages: { type: 'array', items: { type: 'string' } },
          trl_assessment_confidence: { type: 'number' }
        }
      }
    });

    if (aiResult.success) {
      const result = aiResult.data;
      setFormData(prev => ({
        ...prev,
        name_en: result.name_en || prev.name_en,
        name_ar: result.name_ar || prev.name_ar,
        description_en: result.description_en || prev.description_en,
        description_ar: result.description_ar || prev.description_ar,
        tagline_en: result.tagline_en || prev.tagline_en,
        tagline_ar: result.tagline_ar || prev.tagline_ar,
        features: result.features || prev.features,
        use_cases: result.use_cases || prev.use_cases,
        value_proposition: result.value_proposition || prev.value_proposition,
        sectors: result.sectors || prev.sectors,
        maturity_level: result.maturity_level || prev.maturity_level,
        trl: result.trl || prev.trl,
        trl_assessment: result.trl_justification ? {
          level: result.trl,
          evidence: result.trl_justification,
          assessed_by: 'AI',
          assessed_date: new Date().toISOString(),
          ai_confidence: result.trl_assessment_confidence || 0.85
        } : prev.trl_assessment,
        technical_specifications: {
          ...prev.technical_specifications,
          technology_stack: result.technology_stack || prev.technical_specifications.technology_stack || []
        },
        tags: result.keywords || prev.tags || []
      }));

      // Auto-match to challenges based on sector
      if (result.sectors?.length > 0) {
        try {
          const { data: matchingChallengesData } = await supabase.from('challenges').select('*')
            .in('status', ['approved', 'in_treatment'])
            .overlaps('sectors', result.sectors)
            .limit(5);
          
          setMatchingChallenges(matchingChallengesData || []);
        } catch (err) {
          console.error('Auto-matching failed:', err);
        }
      }

      toast.success(t({ en: '✨ AI enhancement complete!', ar: '✨ تم التحسين الذكي!' }));
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature] }));
      setNewFeature('');
    }
  };

  // Zod validation for each step (fc-1)
  const [validationErrors, setValidationErrors] = useState({});

  const canProceed = (step) => {
    let result;
    switch (step) {
      case 1:
        result = validateSolution(formData, solutionStep1Schema);
        setValidationErrors(result.errors);
        return result.success;
      case 2:
        result = validateSolution(formData, solutionStep2Schema);
        setValidationErrors(result.errors);
        return result.success;
      case 3:
        return true; // AI step is optional
      case 4:
        result = validateSolution(formData, solutionStep4Schema);
        setValidationErrors(result.errors);
        return result.success;
      case 5:
        return true; // Media is optional
      case 6:
        result = validateSolution(formData, solutionStep1Schema);
        setValidationErrors(result.errors);
        return result.success;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed(currentStep)) {
      setValidationErrors({});
      setCurrentStep(currentStep + 1);
    } else {
      const errorMessages = Object.values(validationErrors).join(', ');
      toast.error(errorMessages || t({ en: 'Please complete required fields', ar: 'يرجى إكمال الحقول المطلوبة' }));
    }
  };

  const handleSubmit = () => {
    if (!canProceed(6)) {
      const errorMessages = Object.values(validationErrors).join(', ');
      toast.error(errorMessages || t({ en: 'Please complete required fields', ar: 'يرجى إكمال الحقول المطلوبة' }));
      return;
    }
    
    createMutation.mutate({
      ...formData,
      submission_date: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Progress */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          {t({ en: 'Add Solution', ar: 'إضافة حل' })}
        </h1>
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-600">
            {t({ en: `Step ${currentStep} of ${steps.length}`, ar: `الخطوة ${currentStep} من ${steps.length}` })}
          </p>
          <Badge variant="outline">
            {Math.round((currentStep / steps.length) * 100)}% {t({ en: 'Complete', ar: 'مكتمل' })}
          </Badge>
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          
          return (
            <div
              key={step.num}
              className={`flex flex-col items-center gap-2 flex-1 ${
                isActive ? 'opacity-100' : isCompleted ? 'opacity-75' : 'opacity-40'
              }`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-600 text-white' :
                isActive ? 'bg-blue-600 text-white' :
                'bg-slate-200 text-slate-500'
              }`}>
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
              </div>
              <p className="text-xs text-center font-medium">{step.title[language]}</p>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title[language]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_en">
                    {t({ en: 'Solution Name (English)', ar: 'اسم الحل (انجليزي)' })} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Smart Waste Management System"
                    maxLength={200}
                    aria-required="true"
                  />
                  {validationErrors.name_en && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {validationErrors.name_en}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_ar">{t({ en: 'Solution Name (Arabic)', ar: 'اسم الحل (عربي)' })}</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="نظام إدارة النفايات الذكي"
                    dir="rtl"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tagline_en">{t({ en: 'Tagline (English)', ar: 'الشعار (انجليزي)' })}</Label>
                  <Input
                    id="tagline_en"
                    value={formData.tagline_en}
                    onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                    placeholder="Revolutionizing waste collection with AI"
                    maxLength={300}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline_ar">{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</Label>
                  <Input
                    id="tagline_ar"
                    value={formData.tagline_ar}
                    onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })}
                    placeholder="ثورة في جمع النفايات بالذكاء الاصطناعي"
                    dir="rtl"
                    maxLength={300}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">{t({ en: 'Description (English)', ar: 'الوصف (انجليزي)' })}</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                  placeholder="Comprehensive solution description highlighting value proposition and key benefits..."
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground">{formData.description_en?.length || 0}/5000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ar">{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={4}
                  dir="rtl"
                  placeholder="وصف شامل للحل يبرز القيمة المقترحة والفوائد الرئيسية..."
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground">{formData.description_ar?.length || 0}/5000</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider_name">
                    {t({ en: 'Provider/Company Name', ar: 'اسم المزود/الشركة' })} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="provider_name"
                    value={formData.provider_name}
                    onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                    placeholder="Smart Cities KSA"
                    maxLength={200}
                    aria-required="true"
                  />
                  {validationErrors.provider_name && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {validationErrors.provider_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider_type">
                    {t({ en: 'Provider Type', ar: 'نوع المزود' })} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.provider_type}
                    onValueChange={(v) => setFormData({ ...formData, provider_type: v })}
                  >
                    <SelectTrigger id="provider_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">{t({ en: 'Startup', ar: 'شركة ناشئة' })}</SelectItem>
                      <SelectItem value="sme">{t({ en: 'SME', ar: 'منشأة صغيرة/متوسطة' })}</SelectItem>
                      <SelectItem value="corporate">{t({ en: 'Corporate', ar: 'شركة كبرى' })}</SelectItem>
                      <SelectItem value="university">{t({ en: 'University', ar: 'جامعة' })}</SelectItem>
                      <SelectItem value="research_center">{t({ en: 'Research Center', ar: 'مركز بحثي' })}</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.provider_type && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {validationErrors.provider_type}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Technical Specs */}
          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Maturity Level *</Label>
                  <Select
                    value={formData.maturity_level}
                    onValueChange={(v) => setFormData({ ...formData, maturity_level: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concept">Concept</SelectItem>
                      <SelectItem value="prototype">Prototype</SelectItem>
                      <SelectItem value="pilot_ready">Pilot Ready</SelectItem>
                      <SelectItem value="market_ready">Market Ready</SelectItem>
                      <SelectItem value="proven">Proven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TRL Level (1-9) *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={formData.trl}
                    onChange={(e) => setFormData({ ...formData, trl: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-slate-500">
                    {formData.trl <= 3 ? 'Research' : formData.trl <= 6 ? 'Development' : 'Deployment'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Success Rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.success_rate || ''}
                    onChange={(e) => setFormData({ ...formData, success_rate: parseInt(e.target.value) })}
                    placeholder="85"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Applicable Sectors</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['urban_design', 'transport', 'environment', 'digital_services', 'health', 'education', 'safety'].map(sector => (
                    <div key={sector} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.sectors.includes(sector)}
                        onCheckedChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            sectors: prev.sectors.includes(sector)
                              ? prev.sectors.filter(s => s !== sector)
                              : [...prev.sectors, sector]
                          }));
                        }}
                      />
                      <label className="text-sm capitalize">{sector.replace(/_/g, ' ')}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Key Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, i) => (
                    <Badge key={i} variant="outline">
                      {feature}
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }))}
                        className="ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Value Proposition</Label>
                <Textarea
                  value={formData.value_proposition}
                  onChange={(e) => setFormData({ ...formData, value_proposition: e.target.value })}
                  rows={3}
                  placeholder="How does your solution create value? What problems does it solve?"
                />
              </div>
            </>
          )}

          {/* Step 3: AI Enhancement */}
          {currentStep === 3 && (
            <>
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                <div className="text-center mb-6">
                  <Sparkles className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {t({ en: 'AI-Powered Enhancement', ar: 'التحسين الذكي' })}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {t({ 
                      en: 'Let AI analyze and enhance your solution profile with professional descriptions, features, use cases, and technical details.',
                      ar: 'دع الذكاء الاصطناعي يحلل ويحسن ملف الحل مع وصف احترافي وميزات وحالات استخدام وتفاصيل تقنية.'
                    })}
                  </p>
                </div>

                <Button
                  onClick={handleAIEnhancement}
                  disabled={isAIProcessing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 h-12 text-lg mb-4"
                >
                  {isAIProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t({ en: 'AI Processing...', ar: 'معالجة ذكية...' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      {t({ en: 'Enhance with AI', ar: 'تحسين بالذكاء الاصطناعي' })}
                    </>
                  )}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <CompetitiveAnalysisWidget solution={formData} onAnalysisComplete={(data) => {
                  if (data.analysis?.differentiators) {
                    toast.success(t({ en: 'Competitive insights added', ar: 'تمت إضافة الرؤى التنافسية' }));
                  }
                }} />

                <AIPricingSuggester solution={formData} onPricingComplete={(pricing) => {
                  if (pricing.pricing_model) {
                    setFormData(prev => ({
                      ...prev,
                      pricing_model: pricing.pricing_model,
                      pricing_details: {
                        ...prev.pricing_details,
                        suggested_range: pricing.price_range
                      }
                    }));
                    toast.success(t({ en: 'Pricing suggestions applied', ar: 'تم تطبيق اقتراحات التسعير' }));
                  }
                }} />
              </div>

              {matchingChallenges.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      {t({ en: '🎯 Matching Opportunities Found!', ar: '🎯 تم العثور على فرص مطابقة!' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-green-900 mb-3">
                      {t({ en: 'Your solution could help these challenges:', ar: 'يمكن لحلك أن يساعد هذه التحديات:' })}
                    </p>
                    {matchingChallenges.map((match, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-slate-900">{match.title_en}</p>
                          <p className="text-xs text-slate-600">{match.municipality_id}</p>
                        </div>
                        <Badge className="bg-green-600">{Math.round(match.score * 100)}% match</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  💡 {t({ 
                    en: 'AI provides: competitive analysis, pricing intelligence, TRL assessment, sector classification, and challenge matching.',
                    ar: 'يوفر الذكاء الاصطناعي: تحليل تنافسي، ذكاء التسعير، تقييم TRL، تصنيف القطاع، ومطابقة التحديات.'
                  })}
                </p>
              </div>
            </>
          )}

          {/* Step 4: Provider & Commercial */}
          {currentStep === 4 && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email *</Label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Demo URL</Label>
                  <Input
                    value={formData.demo_url}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                    placeholder="https://demo.example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pricing Model</Label>
                <Input
                  value={formData.pricing_model}
                  onChange={(e) => setFormData({ ...formData, pricing_model: e.target.value })}
                  placeholder="Subscription, one-time, usage-based, custom..."
                />
              </div>

              <div className="space-y-2">
                <Label>Deployment Options</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['cloud', 'on_premise', 'hybrid', 'saas'].map(option => (
                    <div key={option} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.deployment_options.includes(option)}
                        onCheckedChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            deployment_options: prev.deployment_options.includes(option)
                              ? prev.deployment_options.filter(o => o !== option)
                              : [...prev.deployment_options, option]
                          }));
                        }}
                      />
                      <label className="text-sm capitalize">{option.replace(/_/g, ' ')}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Implementation Timeline</Label>
                <Input
                  value={formData.implementation_timeline}
                  onChange={(e) => setFormData({ ...formData, implementation_timeline: e.target.value })}
                  placeholder="e.g., 3-6 months"
                />
              </div>
            </>
          )}

          {/* Step 5: Validation & Media */}
          {currentStep === 5 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Solution Logo/Image', ar: 'شعار/صورة الحل' })}</Label>
                  <FileUploader
                    type="image"
                    label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                    maxSize={10}
                    enableImageSearch={true}
                    searchContext={formData.name_en || formData.description_en?.substring(0, 100)}
                    onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded mt-2" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Demo Video', ar: 'فيديو تجريبي' })}</Label>
                  <FileUploader
                    type="video"
                    label={t({ en: 'Upload Demo', ar: 'رفع عرض' })}
                    maxSize={200}
                    preview={false}
                    onUploadComplete={(url) => setFormData({ ...formData, video_url: url })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Brochure/Documentation', ar: 'كتيب/توثيق' })}</Label>
                <FileUploader
                  type="document"
                  label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                  maxSize={50}
                  preview={false}
                  onUploadComplete={(url) => setFormData({ ...formData, brochure_url: url })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Documentation URL', ar: 'رابط التوثيق' })}</Label>
                <Input
                  value={formData.documentation_url}
                  onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                  placeholder="https://docs.example.com"
                />
              </div>
            </>
          )}

          {/* Step 6: Review & Submit */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <h3 className="font-bold text-lg text-green-900 mb-4">
                  {t({ en: '✓ Ready to Submit', ar: '✓ جاهز للإرسال' })}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Solution Name:</p>
                    <p className="font-medium text-slate-900">{formData.name_en}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Provider:</p>
                    <p className="font-medium text-slate-900">{formData.provider_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Maturity:</p>
                    <Badge>{formData.maturity_level}</Badge>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">TRL:</p>
                    <Badge>TRL {formData.trl}</Badge>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Sectors:</p>
                    <p className="font-medium text-slate-900">{formData.sectors.length} sectors</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Features:</p>
                    <p className="font-medium text-slate-900">{formData.features.length} features</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  💡 {t({ 
                    en: 'After submission, your solution will enter verification where technical experts will review it. You will be notified of any matching municipal challenges.',
                    ar: 'بعد الإرسال، سيدخل الحل مرحلة التحقق حيث سيراجعه الخبراء التقنيون. سيتم إشعارك بأي تحديات بلدية مطابقة.'
                  })}
                </p>
              </div>

              {matchingChallenges.length > 0 && (
                <Card className="border-2 border-green-300 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-base text-green-900">
                      {t({ en: '🎯 Matching Opportunities', ar: '🎯 فرص المطابقة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {matchingChallenges.map((match, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm text-slate-700">{match.title_en}</span>
                        <Badge className="bg-green-600">{Math.round(match.score * 100)}%</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t({ en: 'Previous', ar: 'السابق' })}
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed(currentStep)}
          >
            {t({ en: 'Next', ar: 'التالي' })}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !canProceed(6)}
            className="bg-gradient-to-r from-green-600 to-teal-600"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Create Solution', ar: 'إنشاء الحل' })}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}