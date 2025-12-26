import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowRight, ArrowLeft, Save, Loader2, Target, Plus, Trash2, Languages } from 'lucide-react';
import { toast } from 'sonner';
import FileUploader from '../components/FileUploader';
import InnovationFramingGenerator from '../components/challenges/InnovationFramingGenerator';
import StrategicAlignmentSelector from '../components/challenges/StrategicAlignmentSelector';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '@/hooks/usePermissions';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { CHALLENGE_ANALYSIS_PROMPT_TEMPLATE } from '@/lib/ai/prompts/challenges/challengeAnalysis';
import { useChallengeCreateForm } from '@/hooks/useChallengeCreateForm';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';
import { useSectors } from '@/hooks/useSectors';
import { useMunicipalities, useRegions, useCities, useServices, useSubsectors, useCitizenIdeas, useCitizenIdea } from '@/hooks/useReferenceData';

function ChallengeCreatePage() {
  const { hasPermission } = usePermissions();
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const { triggerEmail } = useEmailTrigger();

  const { invokeAI, status: aiStatus, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  // URL params for context
  const urlParams = new URLSearchParams(window.location.search);
  const ideaId = urlParams.get('idea_id');
  const strategicPlanId = urlParams.get('strategic_plan_id');

  const [initialThoughts, setInitialThoughts] = useState('');
  const [linkedIdea, setLinkedIdea] = useState(ideaId || '');

  const { formData, updateField, updateFields, currentStep, nextStep, prevStep, goToStep, hasUserEdited, setHasUserEdited } = useChallengeCreateForm();

  // Fetch data using Hooks
  const { data: municipalities = [] } = useMunicipalities();
  const { data: sectors = [] } = useSectors();
  const { data: subsectors = [] } = useSubsectors();
  const { data: services = [] } = useServices();
  const { data: regions = [] } = useRegions();
  const { data: cities = [] } = useCities();

  const { createChallenge } = useChallengeMutations();

  // ... Citizen Idea fetching remains for now as it's specific context ...
  const { data: citizenIdeas = [] } = useCitizenIdeas();

  const { data: selectedIdea } = useCitizenIdea(ideaId);

  // Auto-fill from CitizenIdea
  useEffect(() => {
    if (selectedIdea) {
      setInitialThoughts(selectedIdea.description || '');
      updateFields({
        title_en: selectedIdea.title || '',
        description_en: selectedIdea.description || '',
        municipality_id: selectedIdea.municipality_id || '',
        category: selectedIdea.category || '',
        citizen_origin_idea_id: selectedIdea.id
      });
      toast.success(t({ en: 'Pre-filled from citizen idea', ar: 'تم التعبئة من فكرة المواطن' }));
    }
  }, [selectedIdea, updateFields]);

  // Handle Create using Hook
  const handleCreate = async () => {
    createChallenge.mutate(formData, {
      onSuccess: (challenge) => {
        navigate(createPageUrl(`ChallengeDetail?id=${challenge.id}`));
        localStorage.removeItem('challenge_draft');
      }
    });
  };


  const handleAIGenerate = async () => {
    if (!formData.municipality_id) {
      toast.error(t({ en: 'Please select municipality first', ar: 'يرجى اختيار البلدية أولاً' }));
      return;
    }

    if (!initialThoughts && !formData.title_en && !formData.description_en) {
      toast.error(t({ en: 'Please describe the challenge first', ar: 'يرجى وصف التحدي أولاً' }));
      return;
    }

    // setIsAIProcessing handled by hook
    try {
      const municipality = municipalities.find(m => m.id === formData.municipality_id);
      const ideaContext = selectedIdea ? `
        Citizen Idea Context:
        Title: ${selectedIdea.title}
        Description: ${selectedIdea.description}
        Category: ${selectedIdea.category}
        Votes: ${selectedIdea.votes_count}
      ` : '';

      // Use centralized prompt template
      const promptConfig = CHALLENGE_ANALYSIS_PROMPT_TEMPLATE({
        municipality,
        userDescription: initialThoughts || formData.description_en || formData.title_en,
        ideaContext,
        sectors,
        subsectors,
        services
      });

      const result = await invokeAI({
        prompt: promptConfig.prompt,
        system_prompt: promptConfig.system,
        response_json_schema: promptConfig.schema
      });

      const sector = sectors.find(s => s.id === result.sector_id);

      // Replaced by updateFields or specific field updates
      updateFields({
        ...result,
        overall_score: Math.round(((result.severity_score || 50) + (result.impact_score || 50)) / 2),
        priority: `tier_${result.priority_tier || 3}`
      });

      goToStep(2);
      toast.success(t({ en: '✨ AI generated complete challenge!', ar: '✨ تم إنشاء التحدي الكامل!' }));
    } catch (error) {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل التوليد الذكي' }));
    } finally {
      // setIsAIProcessing handled by hook
    }
  };

  const handleRetranslate = async (field) => {
    const sourceField = field.includes('_en') ? field.replace('_en', '_ar') : field.replace('_ar', '_en');
    const sourceText = formData[sourceField];

    if (!sourceText) {
      toast.error(t({ en: 'Source text is empty', ar: 'النص المصدر فارغ' }));
      return;
    }

    try {
      const targetLang = field.includes('_en') ? 'English' : 'Arabic';
      const result = await invokeAI({
        prompt: `Translate this municipal challenge text to ${targetLang} maintaining professional tone and accuracy:\n\n${sourceText}`,
        system_prompt: 'You are a professional translator for municipal and urban planning content.',
        response_json_schema: {
          type: 'object',
          properties: {
            translation: { type: 'string' }
          }
        }
      });

      if (result.success && result.data?.translation) {
        updateFields({ [field]: result.data.translation });
        // Manually override hasUserEdited to false for this field since it was AI generated
        setHasUserEdited(prev => ({ ...prev, [field]: false }));
        toast.success(t({ en: 'Re-translated', ar: 'تمت إعادة الترجمة' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Translation failed', ar: 'فشلت الترجمة' }));
    }
  };

  const handleFieldEdit = (field, value) => {
    updateField(field, value);
  };

  const addKPI = () => {
    updateFields({
      kpis: [...formData.kpis, { name_en: '', name_ar: '', baseline: '', target: '', unit: '' }]
    });
  };

  const updateKPI = (index, field, value) => {
    const updated = [...formData.kpis];
    updated[index] = { ...updated[index], [field]: value };
    updateFields({ kpis: updated });
  };

  const removeKPI = (index) => {
    updateFields({
      kpis: formData.kpis.filter((_, i) => i !== index)
    });
  };

  const addStakeholder = () => {
    updateFields({
      stakeholders: [...formData.stakeholders, { name: '', role: '', involvement: '' }]
    });
  };

  const updateStakeholder = (index, field, value) => {
    const updated = [...formData.stakeholders];
    updated[index] = { ...updated[index], [field]: value };
    updateFields({ stakeholders: updated });
  };

  const removeStakeholder = (index) => {
    updateFields({
      stakeholders: formData.stakeholders.filter((_, i) => i !== index)
    });
  };

  const addEvidence = () => {
    updateFields({
      data_evidence: [...formData.data_evidence, { type: '', source: '', value: '', date: '' }]
    });
  };

  const updateEvidence = (index, field, value) => {
    const updated = [...formData.data_evidence];
    updated[index] = { ...updated[index], [field]: value };
    updateFields({ data_evidence: updated });
  };

  const removeEvidence = (index) => {
    updateFields({
      data_evidence: formData.data_evidence.filter((_, i) => i !== index)
    });
  };

  const addConstraint = () => {
    updateFields({
      constraints: [...formData.constraints, { type: '', description: '' }]
    });
  };

  const updateConstraint = (index, field, value) => {
    const updated = [...formData.constraints];
    updated[index] = { ...updated[index], [field]: value };
    updateFields({ constraints: updated });
  };

  const removeConstraint = (index) => {
    updateFields({
      constraints: formData.constraints.filter((_, i) => i !== index)
    });
  };

  const filteredSubsectors = formData.sector_id
    ? subsectors.filter(ss => ss.sector_id === formData.sector_id)
    : [];

  const filteredCities = formData.region_id
    ? cities.filter(c => c.region_id === formData.region_id)
    : cities;

  return (
    <PageLayout className="max-w-5xl mx-auto">
      <PageHeader
        icon={Target}
        title={{ en: 'Create New Challenge', ar: 'إنشاء تحدي جديد' }}
        description={{ en: 'AI-powered challenge submission for Saudi municipalities', ar: 'تقديم تحدي بدعم ذكي للبلديات السعودية' }} subtitle={undefined} action={undefined} actions={undefined} children={undefined} />

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
            <Badge variant={currentStep >= 3 ? 'default' : 'outline'}>
              3. {t({ en: 'Innovation Framing', ar: 'تأطير الابتكار' })}
            </Badge>
            <Badge variant={currentStep >= 4 ? 'default' : 'outline'}>
              4. {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
            </Badge>
            <Badge variant={currentStep >= 5 ? 'default' : 'outline'}>
              5. {t({ en: 'Submit', ar: 'الإرسال' })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: AI-First + Context-First */}
      {currentStep === 1 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'Step 1: Describe Your Challenge', ar: 'الخطوة 1: صف التحدي' })}
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              {t({
                en: 'Describe the municipal problem in your own words. AI will structure it into a complete challenge submission.',
                ar: 'صف المشكلة البلدية بكلماتك. سيقوم الذكاء بتنظيمها إلى تقديم تحدي كامل.'
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Municipality - FIELD #1 - CRITICAL */}
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <Label className="text-base font-semibold text-red-900 mb-3 block">
                {t({ en: 'Municipality *', ar: 'البلدية *' })}
              </Label>
              <Select
                value={formData.municipality_id}
                onValueChange={(value) => updateField('municipality_id', value)}
              >
                <SelectTrigger className="h-12 text-base border-2">
                  <SelectValue placeholder={t({ en: 'Select municipality...', ar: 'اختر البلدية...' })} />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {language === 'ar' && m.name_ar ? m.name_ar : m.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-red-700 mt-2">
                {t({ en: 'Required - filters sector/service options', ar: 'مطلوب - يصفّي خيارات القطاع/الخدمة' })}
              </p>
            </div>

            {/* Optional Entity Linking */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <Label className="text-sm font-semibold text-blue-900">
                {t({ en: 'Optional: Link to Existing Entities', ar: 'اختياري: الربط بكيانات موجودة' })}
              </Label>
              <p className="text-xs text-slate-600">
                {t({
                  en: 'Link to approved citizen idea or strategic plan for context enrichment',
                  ar: 'اربط بفكرة مواطن معتمدة أو خطة استراتيجية لإثراء السياق'
                })}
              </p>

              {!ideaId && (
                <div className="space-y-2">
                  <Label className="text-xs">{t({ en: 'Citizen Idea', ar: 'فكرة مواطن' })}</Label>
                  <Select
                    value={linkedIdea || 'none'}
                    onValueChange={(value) => setLinkedIdea(value === 'none' ? null : value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder={t({ en: 'None', ar: 'لا شيء' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t({ en: 'None', ar: 'لا شيء' })}</SelectItem>
                      {citizenIdeas.map(idea => (
                        <SelectItem key={idea.id} value={idea.id}>
                          {idea.title} ({idea.votes_count} votes)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {ideaId && selectedIdea && (
                <div className="p-2 bg-green-100 border border-green-300 rounded text-xs">
                  ✓ {t({ en: 'Linked to:', ar: 'مربوط بـ:' })} {selectedIdea.title}
                </div>
              )}
            </div>

            {/* Challenge Code - Read Only */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-500">{t({ en: 'Challenge Code (auto-generated)', ar: 'رمز التحدي (تلقائي)' })}</Label>
              <Input
                value={formData.code}
                disabled
                className="bg-slate-100 font-mono"
              />
            </div>

            {/* Free-form thoughts */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {t({ en: 'Describe the Challenge', ar: 'صف التحدي' })}
              </Label>
              <Textarea
                value={initialThoughts}
                onChange={(e) => setInitialThoughts(e.target.value)}
                rows={12}
                placeholder={t({
                  en: 'Describe the municipal problem in any language, any format...\n\nExamples:\n- "Traffic congestion at King Fahd Road during peak hours affecting 50,000 commuters"\n- "Waste collection delays in residential areas causing complaints"\n- "Need better pedestrian safety at school zones"',
                  ar: 'صف المشكلة البلدية بأي لغة، بأي تنسيق...\n\nأمثلة:\n- "ازدحام مروري في طريق الملك فهد في أوقات الذروة يؤثر على 50,000 مسافر"\n- "تأخيرات في جمع النفايات في المناطق السكنية"\n- "الحاجة لسلامة أفضل للمشاة عند المدارس"'
                })}
                className="text-base leading-relaxed"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <Button
              onClick={handleAIGenerate}
              disabled={isAIProcessing || !formData.municipality_id}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {isAIProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {t({ en: 'AI Processing...', ar: 'معالجة ذكية...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  {t({ en: '✨ Generate Complete Challenge with AI', ar: '✨ إنشاء تحدي كامل بالذكاء' })}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Structured Form (All Editable) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Basic Information', ar: 'المعلومات الأساسية' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Titles with re-translate */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
                    {hasUserEdited.title_en && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetranslate('title_en')}>
                        <Languages className="h-3 w-3 mr-1" />
                        <span className="text-xs">{t({ en: 'Re-translate from AR', ar: 'إعادة ترجمة' })}</span>
                      </Button>
                    )}
                  </div>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => handleFieldEdit('title_en', e.target.value)}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                    {hasUserEdited.title_ar && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetranslate('title_ar')}>
                        <Languages className="h-3 w-3 mr-1" />
                        <span className="text-xs">{t({ en: 'Re-translate from EN', ar: 'إعادة ترجمة' })}</span>
                      </Button>
                    )}
                  </div>
                  <Input
                    value={formData.title_ar}
                    onChange={(e) => handleFieldEdit('title_ar', e.target.value)}
                    dir="rtl"
                    className="text-base"
                  />
                </div>
              </div>

              {/* Taglines */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</Label>
                  <Input
                    value={formData.tagline_en}
                    onChange={(e) => updateField('tagline_en', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</Label>
                  <Input
                    value={formData.tagline_ar}
                    onChange={(e) => updateField('tagline_ar', e.target.value)}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Descriptions with re-translate */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                    {hasUserEdited.description_en && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetranslate('description_en')}>
                        <Languages className="h-3 w-3 mr-1" />
                        <span className="text-xs">{t({ en: 'Re-translate from AR', ar: 'إعادة ترجمة' })}</span>
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => handleFieldEdit('description_en', e.target.value)}
                    rows={6}
                    className="leading-relaxed"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                    {hasUserEdited.description_ar && (
                      <Button size="sm" variant="ghost" onClick={() => handleRetranslate('description_ar')}>
                        <Languages className="h-3 w-3 mr-1" />
                        <span className="text-xs">{t({ en: 'Re-translate from EN', ar: 'إعادة ترجمة' })}</span>
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={formData.description_ar}
                    onChange={(e) => handleFieldEdit('description_ar', e.target.value)}
                    rows={6}
                    dir="rtl"
                    className="leading-relaxed"
                  />
                </div>
              </div>

              {/* Problem/Current/Desired - Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Problem Statement (EN)', ar: 'بيان المشكلة (إنجليزي)' })}</Label>
                  <Textarea
                    value={formData.problem_statement_en}
                    onChange={(e) => updateField('problem_statement_en', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Problem Statement (AR)', ar: 'بيان المشكلة (عربي)' })}</Label>
                  <Textarea
                    value={formData.problem_statement_ar}
                    onChange={(e) => updateField('problem_statement_ar', e.target.value)}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Current Situation (EN)', ar: 'الوضع الحالي (إنجليزي)' })}</Label>
                  <Textarea
                    value={formData.current_situation_en}
                    onChange={(e) => updateField('current_situation_en', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Current Situation (AR)', ar: 'الوضع الحالي (عربي)' })}</Label>
                  <Textarea
                    value={formData.current_situation_ar}
                    onChange={(e) => updateField('current_situation_ar', e.target.value)}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Desired Outcome (EN)', ar: 'النتيجة المرغوبة (إنجليزي)' })}</Label>
                  <Textarea
                    value={formData.desired_outcome_en}
                    onChange={(e) => updateField('desired_outcome_en', e.target.value)}
                    rows={3}
                    placeholder="Describe end state, not specific solution"
                  />
                  <p className="text-xs text-slate-500">
                    {t({ en: '💡 Focus on end state, not solution approach', ar: '💡 ركز على الحالة النهائية، ليس الحل' })}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Desired Outcome (AR)', ar: 'النتيجة المرغوبة (عربي)' })}</Label>
                  <Textarea
                    value={formData.desired_outcome_ar}
                    onChange={(e) => updateField('desired_outcome_ar', e.target.value)}
                    rows={3}
                    dir="rtl"
                    placeholder="صف الحالة النهائية، ليس نهج الحل"
                  />
                </div>
              </div>

              {/* Root Causes */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Root Cause (EN)', ar: 'السبب الجذري (إنجليزي)' })}</Label>
                  <Textarea
                    value={formData.root_cause_en}
                    onChange={(e) => updateField('root_cause_en', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Root Cause (AR)', ar: 'السبب الجذري (عربي)' })}</Label>
                  <Textarea
                    value={formData.root_cause_ar}
                    onChange={(e) => updateField('root_cause_ar', e.target.value)}
                    rows={2}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Media Upload */}
              <div className="space-y-2">
                <Label>{t({ en: 'Challenge Image', ar: 'صورة التحدي' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload or search image', ar: 'رفع أو بحث عن صورة' })}
                  enableImageSearch={true}
                  searchContext={formData.title_en || initialThoughts?.substring(0, 100)}
                  onUploadComplete={(url) => updateField('image_url', url)} description={undefined} />
              </div>
            </CardContent>
          </Card>

          {/* Classification & Taxonomy */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Classification & Taxonomy', ar: 'التصنيف والتصنيف الهرمي' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nested Taxonomy */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Sector *', ar: 'القطاع *' })}</Label>
                  <Select
                    value={formData.sector_id}
                    onValueChange={(value) => {
                      const sector = sectors.find(s => s.id === value);
                      updateFields({ sector_id: value, sector: sector?.code, subsector_id: '', service_id: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} />
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
                    value={formData.subsector_id}
                    onValueChange={(value) => {
                      const subsector = subsectors.find(ss => ss.id === value);
                      updateFields({ subsector_id: value, sub_sector: subsector?.name_en });
                    }}
                    disabled={!formData.sector_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.sector_id ? t({ en: 'Select...', ar: 'اختر...' }) : t({ en: 'Select sector first', ar: 'اختر القطاع أولاً' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubsectors.map(ss => (
                        <SelectItem key={ss.id} value={ss.id}>
                          {language === 'ar' && ss.name_ar ? ss.name_ar : ss.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Service', ar: 'الخدمة' })}</Label>
                  <Select
                    value={formData.service_id}
                    onValueChange={(value) => updateField('service_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(sv => (
                        <SelectItem key={sv.id} value={sv.id}>
                          {language === 'ar' && sv.name_ar ? sv.name_ar : sv.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Geography */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Region', ar: 'المنطقة' })}</Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(value) => updateFields({ region_id: value, city_id: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} />
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
                  <Label>{t({ en: 'City', ar: 'المدينة' })}</Label>
                  <Select
                    value={formData.city_id}
                    onValueChange={(value) => {
                      const city = cities.find(c => c.id === value);
                      updateFields({
                        city_id: value,
                        region_id: city?.region_id || formData.region_id,
                        coordinates: city?.coordinates || formData.coordinates
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCities.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {language === 'ar' && c.name_ar ? c.name_ar : c.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Organizational Details - Bilingual */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Responsible Agency (EN)', ar: 'الجهة المسؤولة (إنجليزي)' })}</Label>
                    <Input
                      value={formData.responsible_agency_en || formData.responsible_agency || ''}
                      onChange={(e) => updateFields({ responsible_agency_en: e.target.value, responsible_agency: e.target.value })}
                      placeholder="Ministry of Municipalities and Housing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Responsible Agency (AR)', ar: 'الجهة المسؤولة (عربي)' })}</Label>
                    <Input
                      value={formData.responsible_agency_ar || ''}
                      onChange={(e) => updateField('responsible_agency_ar', e.target.value)}
                      placeholder="وزارة البلديات والإسكان"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Department (EN)', ar: 'الإدارة (إنجليزي)' })}</Label>
                    <Input
                      value={formData.department_en || formData.department || ''}
                      onChange={(e) => updateFields({ department_en: e.target.value, department: e.target.value })}
                      placeholder="Infrastructure Planning"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Department (AR)', ar: 'الإدارة (عربي)' })}</Label>
                    <Input
                      value={formData.department_ar || ''}
                      onChange={(e) => updateField('department_ar', e.target.value)}
                      placeholder="إدارة تخطيط البنية التحتية"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>

              {/* Type & Priority */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Challenge Type', ar: 'نوع التحدي' })}</Label>
                  <Select
                    value={formData.challenge_type}
                    onValueChange={(v) => updateField('challenge_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_quality">{t({ en: 'Service Quality', ar: 'جودة الخدمة' })}</SelectItem>
                      <SelectItem value="infrastructure">{t({ en: 'Infrastructure', ar: 'البنية التحتية' })}</SelectItem>
                      <SelectItem value="efficiency">{t({ en: 'Efficiency', ar: 'الكفاءة' })}</SelectItem>
                      <SelectItem value="innovation">{t({ en: 'Innovation', ar: 'الابتكار' })}</SelectItem>
                      <SelectItem value="safety">{t({ en: 'Safety', ar: 'السلامة' })}</SelectItem>
                      <SelectItem value="environmental">{t({ en: 'Environmental', ar: 'البيئة' })}</SelectItem>
                      <SelectItem value="digital_transformation">{t({ en: 'Digital Transformation', ar: 'التحول الرقمي' })}</SelectItem>
                      <SelectItem value="other">{t({ en: 'Other', ar: 'أخرى' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => updateField('priority', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tier_1">{t({ en: 'Tier 1 (Critical)', ar: 'المستوى 1 (حرج)' })}</SelectItem>
                      <SelectItem value="tier_2">{t({ en: 'Tier 2 (High)', ar: 'المستوى 2 (عالي)' })}</SelectItem>
                      <SelectItem value="tier_3">{t({ en: 'Tier 3 (Medium)', ar: 'المستوى 3 (متوسط)' })}</SelectItem>
                      <SelectItem value="tier_4">{t({ en: 'Tier 4 (Low)', ar: 'المستوى 4 (منخفض)' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    placeholder={t({ en: 'e.g., Road Safety', ar: 'مثال: سلامة الطرق' })}
                  />
                </div>
              </div>

              {/* Theme - Bilingual */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Theme (EN)', ar: 'الثيم (إنجليزي)' })}</Label>
                  <Input
                    value={formData.theme_en || formData.theme || ''}
                    onChange={(e) => updateFields({ theme_en: e.target.value, theme: e.target.value })}
                    placeholder="Urban Mobility Enhancement"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Theme (AR)', ar: 'الثيم (عربي)' })}</Label>
                  <Input
                    value={formData.theme_ar || ''}
                    onChange={(e) => updateField('theme_ar', e.target.value)}
                    placeholder="تحسين التنقل الحضري"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* AI Scores */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-center">
                  <Label className="text-xs text-slate-600">{t({ en: 'Severity', ar: 'الخطورة' })}</Label>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{formData.severity_score}</div>
                </div>
                <div className="text-center">
                  <Label className="text-xs text-slate-600">{t({ en: 'Impact', ar: 'التأثير' })}</Label>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{formData.impact_score}</div>
                </div>
                <div className="text-center">
                  <Label className="text-xs text-slate-600">{t({ en: 'Overall', ar: 'الإجمالي' })}</Label>
                  <div className="text-3xl font-bold text-blue-600 mt-1">{formData.overall_score}</div>
                </div>
              </div>

              {/* Treatment Tracks - Bilingual */}
              <div className="space-y-2">
                <Label>{t({ en: 'Treatment Tracks (Multiple)', ar: 'مسارات المعالجة (متعددة)' })}</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: 'pilot', en: 'Pilot', ar: 'تجربة' },
                    { value: 'r_and_d', en: 'R&D', ar: 'بحث وتطوير' },
                    { value: 'program', en: 'Program', ar: 'برنامج' },
                    { value: 'procurement', en: 'Procurement', ar: 'مشتريات' },
                    { value: 'policy', en: 'Policy', ar: 'سياسة' }
                  ].map(track => (
                    <label key={track.value} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50 cursor-pointer" dir={isRTL ? 'rtl' : 'ltr'}>
                      <input
                        type="checkbox"
                        checked={formData.tracks?.includes(track.value)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...(formData.tracks || []), track.value]
                            : (formData.tracks || []).filter(t => t !== track.value);
                          updateField('tracks', updated);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{language === 'ar' ? track.ar : track.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact & Data */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Impact Assessment & Evidence', ar: 'تقييم التأثير والأدلة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget & Timeline */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Budget Estimate (SAR)', ar: 'تقدير الميزانية (ريال)' })}</Label>
                  <Input
                    type="number"
                    value={formData.budget_estimate || ''}
                    onChange={(e) => updateField('budget_estimate', parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Timeline Estimate', ar: 'تقدير المدة' })}</Label>
                  <Input
                    value={formData.timeline_estimate}
                    onChange={(e) => updateField('timeline_estimate', e.target.value)}
                    placeholder={t({ en: '6 months, 1 year', ar: '6 أشهر، سنة' })}
                  />
                </div>
              </div>

              {/* Affected Population */}
              <div className="space-y-2">
                <Label>{t({ en: 'Affected Population Size', ar: 'حجم السكان المتأثرين' })}</Label>
                <Input
                  type="number"
                  value={formData.affected_population?.size || ''}
                  onChange={(e) => updateField('affected_population', { ...formData.affected_population, size: parseInt(e.target.value) || null })}
                />
              </div>

              {/* KPIs - Editable */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t({ en: 'KPIs (Key Performance Indicators)', ar: 'مؤشرات الأداء الرئيسية' })}</Label>
                  <Button size="sm" variant="outline" onClick={addKPI}>
                    <Plus className="h-3 w-3 mr-1" />
                    {t({ en: 'Add KPI', ar: 'إضافة مؤشر' })}
                  </Button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.kpis.map((kpi, i) => (
                    <div key={i} className="p-3 border rounded-lg bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{t({ en: `KPI ${i + 1}`, ar: `المؤشر ${i + 1}` })}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeKPI(i)}>
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <Input
                          value={kpi.name_en || ''}
                          onChange={(e) => updateKPI(i, 'name_en', e.target.value)}
                          placeholder={t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}
                          className="text-sm"
                        />
                        <Input
                          value={kpi.name_ar || ''}
                          onChange={(e) => updateKPI(i, 'name_ar', e.target.value)}
                          placeholder={t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}
                          dir="rtl"
                          className="text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          value={kpi.baseline || ''}
                          onChange={(e) => updateKPI(i, 'baseline', e.target.value)}
                          placeholder={t({ en: 'Baseline', ar: 'الأساس' })}
                          className="text-sm"
                        />
                        <Input
                          value={kpi.target || ''}
                          onChange={(e) => updateKPI(i, 'target', e.target.value)}
                          placeholder={t({ en: 'Target', ar: 'الهدف' })}
                          className="text-sm"
                        />
                        <Input
                          value={kpi.unit || ''}
                          onChange={(e) => updateKPI(i, 'unit', e.target.value)}
                          placeholder={t({ en: 'Unit', ar: 'الوحدة' })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stakeholders - Bilingual */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}</Label>
                  <Button size="sm" variant="outline" onClick={addStakeholder}>
                    <Plus className="h-3 w-3 mr-1" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.stakeholders.map((sh, i) => (
                    <div key={i} className="p-3 border rounded bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          {t({ en: `Stakeholder ${i + 1}`, ar: `صاحب المصلحة ${i + 1}` })}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => removeStakeholder(i)}>
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <Input
                          value={sh.name_en || sh.name || ''}
                          onChange={(e) => updateStakeholder(i, 'name_en', e.target.value)}
                          placeholder={t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' })}
                          className="text-sm"
                        />
                        <Input
                          value={sh.name_ar || ''}
                          onChange={(e) => updateStakeholder(i, 'name_ar', e.target.value)}
                          placeholder={t({ en: 'Name (AR)', ar: 'الاسم (عربي)' })}
                          dir="rtl"
                          className="text-sm"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <Input
                          value={sh.role_en || sh.role || ''}
                          onChange={(e) => updateStakeholder(i, 'role_en', e.target.value)}
                          placeholder={t({ en: 'Role (EN)', ar: 'الدور (إنجليزي)' })}
                          className="text-sm"
                        />
                        <Input
                          value={sh.role_ar || ''}
                          onChange={(e) => updateStakeholder(i, 'role_ar', e.target.value)}
                          placeholder={t({ en: 'Role (AR)', ar: 'الدور (عربي)' })}
                          dir="rtl"
                          className="text-sm"
                        />
                      </div>
                      <Input
                        value={sh.involvement || ''}
                        onChange={(e) => updateStakeholder(i, 'involvement', e.target.value)}
                        placeholder={t({ en: 'Involvement details', ar: 'تفاصيل المشاركة' })}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Evidence - Bilingual */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t({ en: 'Data Evidence', ar: 'الأدلة البيانية' })}</Label>
                  <Button size="sm" variant="outline" onClick={addEvidence}>
                    <Plus className="h-3 w-3 mr-1" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.data_evidence.map((ev, i) => (
                    <div key={i} className="p-3 border rounded bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          {t({ en: `Evidence ${i + 1}`, ar: `الدليل ${i + 1}` })}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => removeEvidence(i)}>
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <Input
                          value={ev.type_en || ev.type || ''}
                          onChange={(e) => updateEvidence(i, 'type_en', e.target.value)}
                          placeholder={t({ en: 'Type (EN)', ar: 'النوع (إنجليزي)' })}
                          className="text-sm"
                        />
                        <Input
                          value={ev.type_ar || ''}
                          onChange={(e) => updateEvidence(i, 'type_ar', e.target.value)}
                          placeholder={t({ en: 'Type (AR)', ar: 'النوع (عربي)' })}
                          dir="rtl"
                          className="text-sm"
                        />
                      </div>
                      <Input
                        value={ev.source || ''}
                        onChange={(e) => updateEvidence(i, 'source', e.target.value)}
                        placeholder={t({ en: 'Source (e.g., Traffic Dept Report 2024)', ar: 'المصدر (مثال: تقرير إدارة المرور 2024)' })}
                        className="text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={ev.value || ''}
                          onChange={(e) => updateEvidence(i, 'value', e.target.value)}
                          placeholder={t({ en: 'Value/Finding', ar: 'القيمة/النتيجة' })}
                          className="text-sm"
                        />
                        <Input
                          type="date"
                          value={ev.date || ''}
                          onChange={(e) => updateEvidence(i, 'date', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints - Bilingual */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t({ en: 'Constraints & Limitations', ar: 'القيود والمحددات' })}</Label>
                  <Button size="sm" variant="outline" onClick={addConstraint}>
                    <Plus className="h-3 w-3 mr-1" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.constraints.map((cn, i) => (
                    <div key={i} className="p-3 border rounded bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          {t({ en: `Constraint ${i + 1}`, ar: `القيد ${i + 1}` })}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => removeConstraint(i)}>
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <Input
                          value={cn.type_en || cn.type || ''}
                          onChange={(e) => updateConstraint(i, 'type_en', e.target.value)}
                          placeholder={t({ en: 'Type (EN)', ar: 'النوع (إنجليزي)' })}
                          className="text-sm"
                        />
                        <Input
                          value={cn.type_ar || ''}
                          onChange={(e) => updateConstraint(i, 'type_ar', e.target.value)}
                          placeholder={t({ en: 'Type (AR)', ar: 'النوع (عربي)' })}
                          dir="rtl"
                          className="text-sm"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <Input
                          value={cn.description_en || cn.description || ''}
                          onChange={(e) => updateConstraint(i, 'description_en', e.target.value)}
                          placeholder={t({ en: 'Description (EN)', ar: 'الوصف (إنجليزي)' })}
                          className="text-sm"
                        />
                        <Input
                          value={cn.description_ar || ''}
                          onChange={(e) => updateConstraint(i, 'description_ar', e.target.value)}
                          placeholder={t({ en: 'Description (AR)', ar: 'الوصف (عربي)' })}
                          dir="rtl"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Innovation Framing */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'Step 3: Innovation Framing', ar: 'الخطوة 3: تأطير الابتكار' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InnovationFramingGenerator
              challenge={formData}
              onFramingGenerated={(framing) => updateFields({ innovation_framing: framing })}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Strategic Alignment */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {t({ en: 'Step 4: Strategic Alignment', ar: 'الخطوة 4: التوافق الاستراتيجي' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StrategicAlignmentSelector
              challenge={{ ...formData, id: 'preview' }}
              onUpdate={(planIds) => updateFields({ strategic_plan_ids: planIds })}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Step 5: Review & Submit', ar: 'الخطوة 5: المراجعة والإرسال' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-lg text-green-900 mb-4">
                {t({ en: '✓ Challenge Ready', ar: '✓ التحدي جاهز' })}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-slate-600">{t({ en: 'Title:', ar: 'العنوان:' })}</Label>
                  <p className="font-medium">{formData.title_en}</p>
                </div>
                <div>
                  <Label className="text-slate-600">{t({ en: 'Municipality:', ar: 'البلدية:' })}</Label>
                  <p className="font-medium">{municipalities.find(m => m.id === formData.municipality_id)?.name_en}</p>
                </div>
                <div>
                  <Label className="text-slate-600">{t({ en: 'Sector:', ar: 'القطاع:' })}</Label>
                  <p className="font-medium">{sectors.find(s => s.id === formData.sector_id)?.name_en || '-'}</p>
                </div>
                <div>
                  <Label className="text-slate-600">{t({ en: 'Priority:', ar: 'الأولوية:' })}</Label>
                  <Badge>{formData.priority}</Badge>
                </div>
                <div>
                  <Label className="text-slate-600">{t({ en: 'KPIs:', ar: 'المؤشرات:' })}</Label>
                  <p className="font-medium">{formData.kpis.length} indicators</p>
                </div>
                <div>
                  <Label className="text-slate-600">{t({ en: 'Impact Score:', ar: 'درجة التأثير:' })}</Label>
                  <p className="font-medium text-blue-600">{formData.overall_score}/100</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                💡 {t({
                  en: 'Challenge will be created as DRAFT. It will go through review workflow before being published to solution providers.',
                  ar: 'سيتم إنشاء التحدي كمسودة. سيمر بسير عمل المراجعة قبل نشره لمزودي الحلول.'
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {currentStep > 1 && (
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t({ en: 'Previous', ar: 'السابق' })}
          </Button>
        )}
        <div className={currentStep === 1 ? 'w-full' : 'ml-auto'}>
          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              disabled={currentStep === 1 && !formData.title_en}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {t({ en: 'Next', ar: 'التالي' })}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={createChallenge.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {createChallenge.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit Challenge', ar: 'إرسال التحدي' })}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(ChallengeCreatePage, {
  requiredPermissions: ['challenge_create']
});
