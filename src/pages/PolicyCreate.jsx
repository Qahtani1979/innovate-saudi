import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Save, Sparkles, Loader2, Shield, ArrowLeft, Plus, Trash2, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import SimilarPolicyDetector from '../components/policy/SimilarPolicyDetector';
import PolicyTemplateLibrary from '../components/policy/PolicyTemplateLibrary';
import ProtectedPage from '../components/permissions/ProtectedPage';
import StrategicPlanSelector from '@/components/strategy/StrategicPlanSelector';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function PolicyCreate() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledChallengeId = urlParams.get('challenge_id');
  const prefilledEntityType = urlParams.get('entity_type');
  const prefilledEntityId = urlParams.get('entity_id');
  const templateId = urlParams.get('template');
  
  const [currentStep, setCurrentStep] = useState(templateId ? 2 : 1);
  const { invokeAI, status: aiStatus, isLoading: isAIHelping, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [initialThoughts, setInitialThoughts] = useState('');
  const [linkedEntities, setLinkedEntities] = useState(
    prefilledChallengeId 
      ? [{ type: 'challenge', id: prefilledChallengeId }]
      : []
  );
  const [attachments, setAttachments] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSimilarDetector, setShowSimilarDetector] = useState(true);
  const [formData, setFormData] = useState({
    title_ar: '',
    recommendation_text_ar: '',
    regulatory_framework: '',
    regulatory_change_needed: false,
    timeline_months: '',
    priority_level: 'medium',
    status: 'draft',
    policy_type: '',
    implementation_complexity: '',
    impact_score: '',
    implementation_steps: [],
    success_metrics: [],
    affected_stakeholders: [],
    stakeholder_involvement_ar: '',
    attachment_urls: [],
    strategic_plan_ids: [],
    strategic_objective_ids: []
  });

  // Auto-save draft every 30 seconds
  React.useEffect(() => {
    if (currentStep === 2 && formData.title_en) {
      const autoSave = setInterval(() => {
        localStorage.setItem('policy_draft', JSON.stringify({
          formData,
          linkedEntities,
          timestamp: new Date().toISOString()
        }));
      }, 30000);
      return () => clearInterval(autoSave);
    }
  }, [formData, linkedEntities, currentStep]);

  // Load draft on mount
  React.useEffect(() => {
    const draft = localStorage.getItem('policy_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const draftAge = Date.now() - new Date(parsed.timestamp).getTime();
        if (draftAge < 24 * 60 * 60 * 1000) { // Less than 24 hours old
          if (confirm(t({ 
            en: 'A draft was found. Load it?', 
            ar: 'تم العثور على مسودة. تحميلها؟' 
          }))) {
            setFormData(parsed.formData);
            setLinkedEntities(parsed.linkedEntities);
            setCurrentStep(2);
          }
        }
      } catch (e) {}
    }
  }, []);

  // Fetch entities for linking
  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  // Fetch templates from database
  const { data: allTemplates = [] } = useQuery({
    queryKey: ['policy-templates'],
    queryFn: () => base44.entities.PolicyTemplate.list()
  });

  // Apply template if template ID is in URL
  React.useEffect(() => {
    if (!templateId || allTemplates.length === 0) return;
    
    const template = allTemplates.find(t => t.template_id === templateId);
    if (template?.template_data) {
      setFormData(prev => ({ ...prev, ...template.template_data }));
      toast.success(t({ en: 'Template loaded', ar: 'تم تحميل القالب' }));
    }
  }, [templateId, allTemplates, t]);

  const addLinkedEntity = () => {
    setLinkedEntities([...linkedEntities, { type: '', id: '' }]);
  };

  const updateLinkedEntity = (index, field, value) => {
    const updated = [...linkedEntities];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'type') updated[index].id = ''; // Reset ID when type changes
    setLinkedEntities(updated);
  };

  const removeLinkedEntity = (index) => {
    setLinkedEntities(linkedEntities.filter((_, i) => i !== index));
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      toast.info(t({ en: 'Translating to English...', ar: 'جاري الترجمة للإنجليزية...' }));
      
      // Translate Arabic to English
      const translationResponse = await base44.functions.invoke('translatePolicy', {
        arabic_fields: {
          title_ar: data.title_ar,
          recommendation_text_ar: data.recommendation_text_ar,
          implementation_steps: data.implementation_steps,
          success_metrics: data.success_metrics,
          stakeholder_involvement_ar: data.stakeholder_involvement_ar
        }
      });

      const translations = translationResponse.data;

      // Extract entity IDs from linkedEntities
      const entityData = {
        challenge_id: linkedEntities.find(e => e.type === 'challenge')?.id || null,
        pilot_id: linkedEntities.find(e => e.type === 'pilot')?.id || null,
        rd_project_id: linkedEntities.find(e => e.type === 'rd_project')?.id || null,
        program_id: linkedEntities.find(e => e.type === 'program')?.id || null,
        entity_type: linkedEntities.length > 0 ? linkedEntities[0].type : 'platform'
      };

      const policy = await base44.entities.PolicyRecommendation.create({
        ...data,
        ...entityData,
        title_en: translations.title_en,
        recommendation_text_en: translations.recommendation_text_en,
        implementation_steps: translations.implementation_steps,
        success_metrics: translations.success_metrics,
        stakeholder_involvement_en: translations.stakeholder_involvement_en,
        translation_metadata: translations.translation_metadata,
        submission_date: new Date().toISOString()
      });
      
      try {
        await base44.functions.invoke('generateEmbeddings', {
          entity_name: 'PolicyRecommendation',
          mode: 'missing'
        });
      } catch (error) {
        console.log('Embedding generation skipped');
      }
      return policy;
    },
    onSuccess: (policy) => {
      localStorage.removeItem('policy_draft');
      toast.success(t({ en: '✓ Policy created with auto-translation', ar: '✓ تم إنشاء السياسة مع الترجمة الآلية' }));
      navigate(createPageUrl(`PolicyDetail?id=${policy.id}`));
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to create policy', ar: 'فشل إنشاء السياسة' }));
      console.error('Policy creation error:', error);
    }
  });

  const handleAIAssist = async () => {
    const inputText = currentStep === 1 ? initialThoughts : (formData.title_ar || formData.recommendation_text_ar);
    
    if (!inputText) {
      toast.error(t({ en: 'Enter your thoughts or title first', ar: 'أدخل أفكارك أو العنوان أولاً' }));
      return;
    }

    let contextPrompt = `You are a senior public policy expert specializing in Saudi municipal governance and regulatory frameworks.

USER'S INPUT AND CURRENT FORM DATA (ARABIC):
Initial Thoughts: ${initialThoughts || 'N/A'}
Title AR (current): ${formData.title_ar || 'Not provided - please generate'}
Recommendation AR (current): ${formData.recommendation_text_ar || 'Not provided - please generate'}
Regulatory Framework (current): ${formData.regulatory_framework || 'Not provided - please suggest'}
Implementation Steps (current): ${formData.implementation_steps?.length > 0 ? JSON.stringify(formData.implementation_steps) : 'Not provided - please generate'}
Success Metrics (current): ${formData.success_metrics?.length > 0 ? JSON.stringify(formData.success_metrics) : 'Not provided - please generate'}
Stakeholder Involvement AR (current): ${formData.stakeholder_involvement_ar || 'Not provided - please generate'}

INSTRUCTIONS: 
- If user has provided content for a field, KEEP and ENHANCE it, do NOT replace it completely.
- If a field is empty or says "Not provided", generate new content.
- Preserve user edits and build upon them.

LINKED ENTITY CONTEXT (${linkedEntities.length} entities):
`;

    // Add context for all linked entities
    linkedEntities.forEach((link, idx) => {
      if (!link.type || !link.id) return;

      if (link.type === 'challenge') {
        const challenge = challenges.find(c => c.id === link.id);
        if (challenge) {
          contextPrompt += `\n[${idx + 1}] Challenge: ${challenge.code || ''} - ${challenge.title_en}
Problem Statement EN: ${challenge.problem_statement_en || challenge.description_en || 'N/A'}
Problem Statement AR: ${challenge.problem_statement_ar || challenge.description_ar || 'N/A'}
Sector: ${challenge.sector || 'N/A'}
Municipality: ${challenge.municipality_id || 'N/A'}
Affected Population: ${challenge.affected_population_size || 'N/A'}
Root Causes: ${challenge.root_causes?.join(', ') || 'N/A'}
`;
        }
      }

      if (link.type === 'pilot') {
        const pilot = pilots.find(p => p.id === link.id);
        if (pilot) {
          contextPrompt += `\n[${idx + 1}] Pilot: ${pilot.code} - ${pilot.title_en}
Objective: ${pilot.objective_en || 'N/A'}
Stage: ${pilot.stage || 'N/A'}
Success Factors: ${pilot.success_factors?.join(', ') || 'N/A'}
`;
        }
      }

      if (link.type === 'rd_project') {
        const rd = rdProjects.find(r => r.id === link.id);
        if (rd) {
          contextPrompt += `\n[${idx + 1}] R&D Project: ${rd.code} - ${rd.title_en}
Research Area: ${rd.research_area_en || 'N/A'}
TRL: ${rd.trl_current || rd.trl_start || 'N/A'}
`;
        }
      }

      if (link.type === 'program') {
        const prog = programs.find(p => p.id === link.id);
        if (prog) {
          contextPrompt += `\n[${idx + 1}] Program: ${prog.code} - ${prog.name_en}
Type: ${prog.program_type || 'N/A'}
Focus Areas: ${prog.focus_areas?.join(', ') || 'N/A'}
`;
        }
      }
    });

    const { success, data } = await invokeAI({
      prompt: `${contextPrompt}

As a PUBLIC POLICY EXPERT, develop a comprehensive, actionable policy recommendation IN ARABIC:

1. POLICY TITLE (ARABIC): Clear, official policy/regulation title in Arabic

2. POLICY RECOMMENDATION TEXT (ARABIC, 300+ words):
   - Identify the regulatory gap or governance issue
   - Propose specific policy intervention (regulation/amendment/guideline/bylaw)
   - Explain expected policy outcomes and public benefit
   - Align with Saudi Vision 2030 and municipal modernization
   - Use formal policy language suitable for government gazette

3. REGULATORY FRAMEWORK: Cite specific Saudi laws (e.g., "Municipal Affairs Law 1397H, Article 12", "Municipal Services Regulation 2020, Section 4")

4. REGULATORY CHANGE NEEDED: true if legislative amendment required, false if administrative

5. POLICY TYPE: new_regulation, amendment, guideline, standard, bylaw, or other

6. IMPLEMENTATION STEPS (5-7 steps following POLICY DEVELOPMENT LIFECYCLE):
   Each bilingual (EN + AR), following:
   - Policy drafting & legal review by municipal legal team
   - Inter-agency consultation (Ministry of Municipal Affairs, relevant authorities)
   - Public consultation period (30-60 days if applicable)
   - Municipal council or ministerial approval
   - Official gazette publication and communication
   - Grace period for compliance transition
   - Monitoring, compliance verification, and enforcement

7. STAKEHOLDER INVOLVEMENT (bilingual EN+AR): Key government entities required (e.g., EN: "Ministry of Municipal Affairs, Legal Affairs Committee, Municipal Council", AR: "وزارة الشؤون البلدية، اللجنة القانونية، المجلس البلدي")

8. AFFECTED STAKEHOLDERS (array of 4-6): Groups impacted (e.g., "Municipal service providers", "Property developers", "Environmental officers", "Local businesses", "Citizens accessing service X")

9. SUCCESS METRICS (3-5 POLICY OUTCOME metrics - BILINGUAL OBJECTS):
   Each metric as object with metric_en, metric_ar, target, unit. POLICY-level, not operational. Examples:
   - {metric_en: "Legal clarity score", metric_ar: "درجة الوضوح القانوني", target: "90%", unit: "percentage"}
   - {metric_en: "Compliance rate within first year", metric_ar: "معدل الامتثال خلال السنة الأولى", target: "80%", unit: "percentage"}
   - {metric_en: "Dispute reduction", metric_ar: "تقليل النزاعات", target: "50%", unit: "percentage"}

10. TIMELINE (months): Realistic from drafting to full implementation across municipalities

11. PRIORITY: low/medium/high/critical based on public urgency and strategic importance

12. IMPACT SCORE (0-100): Population/services benefiting from this policy change

13. IMPLEMENTATION COMPLEXITY: low/medium/high/very_high (legal, political, administrative barriers)

CRITICAL: All text fields must be in ARABIC. This is for Saudi government use.`,
      response_json_schema: {
        type: 'object',
        properties: {
          title_ar: { type: 'string' },
          recommendation_text_ar: { type: 'string' },
          regulatory_framework: { type: 'string' },
          regulatory_change_needed: { type: 'boolean' },
          timeline_months: { type: 'number' },
          priority_level: { type: 'string' },
          impact_score: { type: 'number' },
          policy_type: { type: 'string' },
          implementation_complexity: { type: 'string' },
          implementation_steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ar: { type: 'string' }
              }
            }
          },
          stakeholder_involvement_ar: { type: 'string' },
          success_metrics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                metric_ar: { type: 'string' },
                target: { type: 'string' },
                unit: { type: 'string' }
              }
            }
          },
          affected_stakeholders: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    if (success) {
      setFormData(prev => ({
        ...prev,
        title_ar: data.title_ar || prev.title_ar,
        recommendation_text_ar: data.recommendation_text_ar || prev.recommendation_text_ar,
        regulatory_framework: data.regulatory_framework || prev.regulatory_framework,
        regulatory_change_needed: data.regulatory_change_needed ?? prev.regulatory_change_needed,
        timeline_months: data.timeline_months || prev.timeline_months,
        priority_level: data.priority_level || prev.priority_level,
        impact_score: data.impact_score || prev.impact_score,
        policy_type: data.policy_type || prev.policy_type,
        implementation_complexity: data.implementation_complexity || prev.implementation_complexity,
        implementation_steps: data.implementation_steps?.length > 0 ? data.implementation_steps : prev.implementation_steps,
        stakeholder_involvement_ar: data.stakeholder_involvement_ar || prev.stakeholder_involvement_ar,
        success_metrics: data.success_metrics?.length > 0 ? data.success_metrics : prev.success_metrics,
        affected_stakeholders: data.affected_stakeholders?.length > 0 ? data.affected_stakeholders : prev.affected_stakeholders
      }));

      if (currentStep === 1) {
        setCurrentStep(2);
      }
      toast.success(t({ en: '✨ AI generated policy framework!', ar: '✨ تم إنشاء الإطار السياسي!' }));
    }
  };

  const getEntityOptions = (type) => {
    switch (type) {
      case 'challenge':
        return challenges.map(c => ({ value: c.id, label: (c.code || c.id) + ': ' + (c.title_en || 'Untitled') }));
      case 'pilot':
        return pilots.map(p => ({ value: p.id, label: (p.code || p.id) + ': ' + (p.title_en || 'Untitled') }));
      case 'rd_project':
        return rdProjects.map(r => ({ value: r.id, label: (r.code || r.id) + ': ' + (r.title_en || 'Untitled') }));
      case 'program':
        return programs.map(p => ({ value: p.id, label: (p.code || p.id) + ': ' + (p.name_en || 'Untitled') }));
      default:
        return [];
    }
  };

  const addImplementationStep = () => {
    setFormData(prev => ({
      ...prev,
      implementation_steps: [...(prev.implementation_steps || []), { en: '', ar: '' }]
    }));
  };

  const updateImplementationStep = (index, field, value) => {
    const steps = [...(formData.implementation_steps || [])];
    steps[index] = { ...steps[index], [field]: value };
    setFormData(prev => ({ ...prev, implementation_steps: steps }));
  };

  const removeImplementationStep = (index) => {
    const steps = [...(formData.implementation_steps || [])];
    steps.splice(index, 1);
    setFormData(prev => ({ ...prev, implementation_steps: steps }));
  };

  const addSuccessMetric = () => {
    setFormData(prev => ({
      ...prev,
      success_metrics: [...(prev.success_metrics || []), { metric_en: '', metric_ar: '', target: '', unit: '' }]
    }));
  };

  const updateSuccessMetric = (index, field, value) => {
    const metrics = [...(formData.success_metrics || [])];
    metrics[index] = { ...metrics[index], [field]: value };
    setFormData(prev => ({ ...prev, success_metrics: metrics }));
  };

  const removeSuccessMetric = (index) => {
    const metrics = [...(formData.success_metrics || [])];
    metrics.splice(index, 1);
    setFormData(prev => ({ ...prev, success_metrics: metrics }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    toast.info(t({ en: 'Uploading files...', ar: 'تحميل الملفات...' }));
    
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setAttachments([...attachments, ...files.map((f, i) => ({ name: f.name, url: urls[i] }))]);
      setFormData(prev => ({ 
        ...prev, 
        attachment_urls: [...(prev.attachment_urls || []), ...urls] 
      }));
      toast.success(t({ en: 'Files uploaded', ar: 'تم رفع الملفات' }));
    } catch (error) {
      toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
    }
  };

  const handleTemplateSelect = (templateData) => {
    setFormData(prev => ({
      ...prev,
      ...templateData
    }));
    setShowTemplates(false);
    setCurrentStep(2);
    toast.success(t({ en: 'Template loaded', ar: 'تم تحميل القالب' }));
  };

  return (
    <PageLayout className="max-w-5xl mx-auto">
      <PageHeader
        icon={Shield}
        title={{ en: 'Create Policy Recommendation', ar: 'إنشاء توصية سياسية' }}
        description={{ en: `Step ${currentStep} of 2`, ar: `خطوة ${currentStep} من 2` }}
        action={
          <Link to={createPageUrl('PolicyHub')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>
          </Link>
        }
      />

      {/* Template Library */}
      {showTemplates && (
        <PolicyTemplateLibrary onTemplateSelect={handleTemplateSelect} />
      )}

      {!showTemplates && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <Button onClick={() => setShowTemplates(true)} variant="outline" className="w-full gap-2">
              <FileText className="h-4 w-4" />
              {t({ en: 'Browse Policy Templates', ar: 'تصفح قوالب السياسات' })}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Initial Thoughts */}
      {!showTemplates && currentStep === 1 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>{t({ en: 'Step 1: Your Policy Thoughts & Ideas', ar: 'الخطوة 1: أفكارك وتصوراتك السياسية' })}</span>
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
              {t({ 
                en: 'Describe your policy idea in free form. The AI will transform it into a structured policy recommendation.', 
                ar: 'اكتب فكرتك السياسية بحرية. سيحولها الذكاء إلى توصية سياسية منظمة.' 
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Link to Entities (MOVED TO STEP 1) */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-blue-900">
                  {t({ en: 'Link to Related Entities (Optional but Recommended)', ar: 'ربط بكيانات ذات صلة (اختياري لكن مُوصى)' })}
                </p>
                <Button size="sm" variant="outline" onClick={addLinkedEntity}>
                  <Plus className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t({ en: 'Add Entity', ar: 'إضافة كيان' })}
                </Button>
              </div>
              <p className="text-xs text-slate-600">
                {t({ 
                  en: 'Linking helps AI generate better recommendations with full context.', 
                  ar: 'الربط يساعد الذكاء على إنشاء توصيات أفضل بالسياق الكامل.' 
                })}
              </p>
              {linkedEntities.map((link, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 p-2 bg-white rounded border">
                  <Select 
                    value={link.type}
                    onValueChange={(v) => updateLinkedEntity(idx, 'type', v)}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder={t({ en: 'Entity Type', ar: 'نوع الكيان' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="challenge">{t({ en: 'Challenge', ar: 'تحدي' })}</SelectItem>
                      <SelectItem value="pilot">{t({ en: 'Pilot', ar: 'تجربة' })}</SelectItem>
                      <SelectItem value="rd_project">{t({ en: 'R&D Project', ar: 'مشروع بحث' })}</SelectItem>
                      <SelectItem value="program">{t({ en: 'Program', ar: 'برنامج' })}</SelectItem>
                    </SelectContent>
                  </Select>
                  {link.type && (
                    <Select 
                      value={link.id}
                      onValueChange={(v) => updateLinkedEntity(idx, 'id', v)}
                    >
                      <SelectTrigger className="text-xs col-span-1">
                        <SelectValue placeholder={t({ en: 'Select...', ar: 'اختر...' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {getEntityOptions(link.type).map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => removeLinkedEntity(idx)}>
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'What policy change do you envision?', ar: 'ما التغيير السياسي الذي تتصوره؟' })}</Label>
              <Textarea
                value={initialThoughts}
                onChange={(e) => setInitialThoughts(e.target.value)}
                rows={10}
                placeholder={t({
                  en: 'Example: I think we need a new regulation requiring all new buildings to have EV charging infrastructure. Currently there is no law mandating this, which is slowing EV adoption. This would align with Vision 2030 sustainability goals...',
                  ar: 'مثال: أعتقد أننا بحاجة لتنظيم جديد يلزم جميع المباني الجديدة بتوفير بنية تحتية لشحن المركبات الكهربائية...'
                })}
                className="text-base leading-relaxed"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            <Button
              onClick={handleAIAssist}
              disabled={isAIHelping || !initialThoughts}
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 h-12 text-base"
            >
              {isAIHelping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              {t({ en: '✨ Generate Policy Framework with AI', ar: '✨ إنشاء الإطار السياسي بالذكاء' })}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Similar Policy Detector */}
      {!showTemplates && currentStep === 2 && showSimilarDetector && (
        <SimilarPolicyDetector 
          policyData={formData} 
          onDismiss={() => setShowSimilarDetector(false)}
        />
      )}

      {/* Step 2: Structured Form */}
      {!showTemplates && currentStep === 2 && (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>{t({ en: 'Step 2: Policy Information', ar: 'الخطوة 2: معلومات السياسة' })}</span>
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {t({ 
              en: 'Review and edit the AI-generated fields. You can modify any field or use AI to enhance them further.', 
              ar: 'راجع وعدّل الحقول التي أنشأها الذكاء. يمكنك تعديل أي حقل أو استخدام الذكاء لتحسينها.' 
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show linked entities (read-only display) */}
          {linkedEntities.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg" dir={isRTL ? 'rtl' : 'ltr'}>
              <p className="text-xs font-semibold text-green-900 mb-2">
                {t({ en: `✓ Linked to ${linkedEntities.length} entities`, ar: `✓ مربوط بـ ${linkedEntities.length} كيانات` })}
              </p>
              <div className="space-y-1">
                {linkedEntities.map((link, idx) => {
                  if (!link.type || !link.id) return null;
                  const entity = 
                    link.type === 'challenge' ? challenges.find(c => c.id === link.id) :
                    link.type === 'pilot' ? pilots.find(p => p.id === link.id) :
                    link.type === 'rd_project' ? rdProjects.find(r => r.id === link.id) :
                    link.type === 'program' ? programs.find(p => p.id === link.id) : null;
                  
                  const typeLabel = t({
                    en: link.type.replace('_', ' ').toUpperCase(),
                    ar: link.type === 'challenge' ? 'تحدي' :
                        link.type === 'pilot' ? 'تجربة' :
                        link.type === 'rd_project' ? 'مشروع بحث' :
                        link.type === 'program' ? 'برنامج' : link.type
                  });
                  
                  const label = entity ? 
                    (entity.code || entity.id) + ': ' + (entity.title_en || entity.name_en || entity.title_ar || entity.name_ar || t({ en: 'Untitled', ar: 'بدون عنوان' })) :
                    t({ en: 'Unknown', ar: 'غير معروف' });
                  
                  return (
                    <p key={idx} className="text-xs text-slate-700">
                      {idx + 1}. {typeLabel}: {label}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auto-Translation Notice */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    {t({ en: '🤖 Arabic-First Policy System', ar: '🤖 نظام السياسات بالعربية أولاً' })}
                  </p>
                  <p className="text-xs text-slate-700">
                    {t({ 
                      en: 'All policies are created in Arabic (official Saudi government language). English translations are automatically generated by AI for international use.', 
                      ar: 'جميع السياسات تُنشأ بالعربية (اللغة الرسمية للحكومة السعودية). الترجمات الإنجليزية تُنشأ تلقائياً بالذكاء الاصطناعي للاستخدام الدولي.' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Title - Arabic Only */}
          <div className="space-y-2">
            <Label>{t({ en: 'Policy Title (Arabic)', ar: 'عنوان السياسة' })}</Label>
            <Input
              value={formData.title_ar}
              onChange={(e) => setFormData({...formData, title_ar: e.target.value})}
              placeholder="عنوان التوصية السياسية"
              dir="rtl"
              className="text-lg"
            />
          </div>

          {/* Recommendation Text - Arabic Only */}
          <div className="space-y-2">
            <Label>{t({ en: 'Policy Recommendation (Arabic)', ar: 'نص التوصية السياسية' })}</Label>
            <Textarea
              value={formData.recommendation_text_ar}
              onChange={(e) => setFormData({...formData, recommendation_text_ar: e.target.value})}
              rows={12}
              placeholder="توصية السياسة التفصيلية بالعربي..."
              dir="rtl"
              className="leading-relaxed"
            />
          </div>

          {/* Regulatory Details */}
          <div className="space-y-2">
            <Label>{t({ en: 'Regulatory Framework', ar: 'الإطار التنظيمي' })}</Label>
            <Input
              value={formData.regulatory_framework}
              onChange={(e) => setFormData({...formData, regulatory_framework: e.target.value})}
              placeholder="e.g., Municipal Law 2023, Article 15"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.regulatory_change_needed}
              onChange={(e) => setFormData({...formData, regulatory_change_needed: e.target.checked})}
              className="rounded"
            />
            <Label>{t({ en: 'Regulatory change needed', ar: 'يتطلب تغيير تنظيمي' })}</Label>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Timeline (months)', ar: 'المدة (أشهر)' })}</Label>
              <Input
                type="number"
                value={formData.timeline_months}
                onChange={(e) => setFormData({...formData, timeline_months: parseInt(e.target.value)})}
                placeholder="6"
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
              <Select 
                value={formData.priority_level}
                onValueChange={(v) => setFormData({...formData, priority_level: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                  <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                  <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                  <SelectItem value="critical">{t({ en: 'Critical', ar: 'حرج' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
              <Select 
                value={formData.status}
                onValueChange={(v) => setFormData({...formData, status: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t({ en: 'Draft', ar: 'مسودة' })}</SelectItem>
                  <SelectItem value="under_review">{t({ en: 'Under Review', ar: 'قيد المراجعة' })}</SelectItem>
                  <SelectItem value="approved">{t({ en: 'Approved', ar: 'معتمد' })}</SelectItem>
                  <SelectItem value="implemented">{t({ en: 'Implemented', ar: 'منفذ' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Policy Type', ar: 'نوع السياسة' })}</Label>
              <Select 
                value={formData.policy_type || ''}
                onValueChange={(v) => setFormData({...formData, policy_type: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select type', ar: 'اختر النوع' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_regulation">{t({ en: 'New Regulation', ar: 'تنظيم جديد' })}</SelectItem>
                  <SelectItem value="amendment">{t({ en: 'Amendment', ar: 'تعديل' })}</SelectItem>
                  <SelectItem value="guideline">{t({ en: 'Guideline', ar: 'إرشاد' })}</SelectItem>
                  <SelectItem value="standard">{t({ en: 'Standard', ar: 'معيار' })}</SelectItem>
                  <SelectItem value="bylaw">{t({ en: 'Bylaw', ar: 'قانون فرعي' })}</SelectItem>
                  <SelectItem value="other">{t({ en: 'Other', ar: 'أخرى' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Implementation Complexity', ar: 'تعقيد التنفيذ' })}</Label>
              <Select 
                value={formData.implementation_complexity || ''}
                onValueChange={(v) => setFormData({...formData, implementation_complexity: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select', ar: 'اختر' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                  <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                  <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                  <SelectItem value="very_high">{t({ en: 'Very High', ar: 'عالي جداً' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Impact Score (0-100)', ar: 'درجة التأثير (0-100)' })}</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.impact_score}
                onChange={(e) => setFormData({...formData, impact_score: parseInt(e.target.value)})}
                placeholder="75"
              />
            </div>
          </div>

          {/* Implementation Steps - Editable */}
          <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
              <Label>{t({ en: 'Implementation Steps', ar: 'خطوات التنفيذ' })}</Label>
              <Button size="sm" variant="outline" onClick={addImplementationStep}>
                <Plus className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {t({ en: 'Add Step', ar: 'إضافة خطوة' })}
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.implementation_steps?.map((step, i) => (
                <div key={i} className="p-3 border rounded-lg bg-blue-50 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-900">
                      {t({ en: `Step ${i + 1}`, ar: `الخطوة ${i + 1}` })}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => removeImplementationStep(i)}>
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                  <Input
                    value={step.en || ''}
                    onChange={(e) => updateImplementationStep(i, 'en', e.target.value)}
                    placeholder={t({ en: 'Step in English', ar: 'الخطوة بالإنجليزي' })}
                    className="text-sm"
                  />
                  <Input
                    value={step.ar || ''}
                    onChange={(e) => updateImplementationStep(i, 'ar', e.target.value)}
                    placeholder="الخطوة بالعربي"
                    dir="rtl"
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Success Metrics - Bilingual Objects */}
          <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between">
              <Label>{t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}</Label>
              <Button size="sm" variant="outline" onClick={addSuccessMetric}>
                <Plus className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {t({ en: 'Add Metric', ar: 'إضافة مقياس' })}
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.success_metrics?.map((metric, i) => (
                <div key={i} className="p-3 border rounded-lg bg-green-50 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-green-900">
                      {t({ en: `Metric ${i + 1}`, ar: `المقياس ${i + 1}` })}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => removeSuccessMetric(i)}>
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                  <Input
                    value={metric.metric_ar || ''}
                    onChange={(e) => updateSuccessMetric(i, 'metric_ar', e.target.value)}
                    placeholder="المقياس (عربي)"
                    dir="rtl"
                    className="text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={metric.target || ''}
                      onChange={(e) => updateSuccessMetric(i, 'target', e.target.value)}
                      placeholder={t({ en: 'Target (e.g., 80%)', ar: 'الهدف (مثال: 80%)' })}
                      className="text-sm"
                    />
                    <Input
                      value={metric.unit || ''}
                      onChange={(e) => updateSuccessMetric(i, 'unit', e.target.value)}
                      placeholder={t({ en: 'Unit (e.g., %)', ar: 'الوحدة (مثال: %)' })}
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
            <Label>{t({ en: 'Attachments (Supporting Documents)', ar: 'المرفقات (المستندات الداعمة)' })}</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="policy-files"
              />
              <label htmlFor="policy-files">
                <Button type="button" variant="outline" className="gap-2" onClick={() => document.getElementById('policy-files').click()}>
                  <Upload className="h-4 w-4" />
                  {t({ en: 'Upload Files', ar: 'رفع ملفات' })}
                </Button>
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-1">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border text-xs">
                    <span className="text-slate-700">{file.name}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setAttachments(attachments.filter((_, idx) => idx !== i));
                        setFormData(prev => ({
                          ...prev,
                          attachment_urls: prev.attachment_urls.filter((_, idx) => idx !== i)
                        }));
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stakeholder Involvement - Arabic Only */}
          <div className="space-y-2">
            <Label>{t({ en: 'Stakeholder Involvement (Arabic)', ar: 'مشاركة أصحاب المصلحة' })}</Label>
            <Textarea
              value={formData.stakeholder_involvement_ar || ''}
              onChange={(e) => setFormData({...formData, stakeholder_involvement_ar: e.target.value})}
              rows={4}
              placeholder="وزارة الشؤون البلدية، اللجنة القانونية، المجلس البلدي..."
              dir="rtl"
            />
          </div>

          {/* Strategic Alignment Section */}
          <div className="border-t pt-4 mt-4">
            <StrategicPlanSelector
              selectedPlanIds={formData.strategic_plan_ids || []}
              selectedObjectiveIds={formData.strategic_objective_ids || []}
              onPlanChange={(ids) => setFormData({...formData, strategic_plan_ids: ids})}
              onObjectiveChange={(ids) => setFormData({...formData, strategic_objective_ids: ids})}
            />
          </div>

          <div className="flex justify-between gap-3 pt-6 border-t" dir={isRTL ? 'rtl' : 'ltr'}>
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              {isRTL ? '→' : '←'} {t({ en: 'Back to Step 1', ar: 'رجوع للخطوة 1' })}
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleAIAssist}
                disabled={isAIHelping}
                variant="outline"
                className="gap-2"
              >
                {isAIHelping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-purple-600" />
                )}
                {t({ en: 'Enhance with AI', ar: 'تحسين بالذكاء' })}
              </Button>
              <Link to={createPageUrl('PolicyHub')}>
                <Button variant="outline">
                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                </Button>
              </Link>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending || !formData.title_ar}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {createMutation.isPending && t({ en: 'Translating...', ar: 'جاري الترجمة...' })}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t({ en: 'Create Policy', ar: 'إنشاء السياسة' })}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(PolicyCreate, { requiredPermissions: ['policy_create'] });