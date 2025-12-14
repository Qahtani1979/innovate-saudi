import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, ArrowRight, ArrowLeft, Save, Loader2, Plus, X, MapPin, Shield, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import TemplateLibrary from '../components/TemplateLibrary';
import FileUploader from '../components/FileUploader';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '../components/permissions/usePermissions';
import SolutionReadinessGate from '../components/solutions/SolutionReadinessGate';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import StrategicPlanSelector from '@/components/strategy/StrategicPlanSelector';

function PilotCreatePage() {
  const { hasPermission } = usePermissions();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, isRTL, t } = useLanguage();
  const { triggerEmail } = useEmailTrigger();
  const { invokeAI, status: aiStatus, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => base44.entities.Region.list()
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => base44.entities.City.list()
  });

  const { data: livingLabs = [] } = useQuery({
    queryKey: ['livingLabs'],
    queryFn: () => base44.entities.LivingLab.list()
  });

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes'],
    queryFn: () => base44.entities.Sandbox.list()
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.ChallengeSolutionMatch.list()
  });

  const [readinessChecked, setReadinessChecked] = useState(false);
  const [selectedSolutionForCheck, setSelectedSolutionForCheck] = useState(null);

  const [formData, setFormData] = useState({
    code: `PILOT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    title_en: '',
    title_ar: '',
    tagline_en: '',
    tagline_ar: '',
    description_en: '',
    description_ar: '',
    objective_en: '',
    objective_ar: '',
    challenge_id: '',
    solution_id: '',
    municipality_id: '',
    region_id: '',
    city_id: '',
    living_lab_id: '',
    sector: '',
    sub_sector: '',
    stage: 'design',
    start_date: '',
    end_date: '',
    duration_weeks: 8,
    budget: '',
    budget_currency: 'SAR',
    trl_start: 4,
    trl_current: 4,
    trl_target: 7,
    kpis: [],
    success_criteria: [],
    target_population: {},
    hypothesis: '',
    methodology: '',
    scope: '',
    sandbox_id: '',
    sandbox_zone: '',
    regulatory_exemptions: [],
    safety_protocols: [],
    success_probability: 70,
    risk_level: 'medium',
    risks: [],
    issues: [],
    team: [],
    stakeholders: [],
    milestones: [],
    data_collection: {},
    technology_stack: [],
    public_engagement: {},
    media_coverage: [],
    lessons_learned: [],
    scaling_plan: {},
    budget_breakdown: [],
    funding_sources: [],
    documents: [],
    image_url: '',
    gallery_urls: [],
    video_url: '',
    tags: [],
    strategic_plan_ids: [],
    strategic_objective_ids: []
  });

  const [safetyChecklistGenerated, setSafetyChecklistGenerated] = useState(false);

  // Filter solutions based on selected challenge
  const filteredSolutions = formData.challenge_id 
    ? solutions.filter(s => 
        matches.some(m => 
          m.challenge_id === formData.challenge_id && 
          m.solution_id === s.id
        )
      )
    : solutions;

  // Filter sandboxes based on selected municipality and sector
  const filteredSandboxes = sandboxes.filter(sb => {
    const municipalityMatch = !formData.municipality_id || sb.municipality_id === formData.municipality_id;
    const sectorMatch = !formData.sector || sb.domain === formData.sector;
    return municipalityMatch && sectorMatch && sb.status === 'active';
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('Creating pilot with data:', data);
      return base44.entities.Pilot.create(data);
    },
    onSuccess: async (pilot) => {
      queryClient.invalidateQueries(['pilots']);
      // Auto-generate embedding
      base44.functions.invoke('generateEmbeddings', {
        entity_name: 'Pilot',
        mode: 'missing'
      }).catch(err => console.error('Embedding generation failed:', err));
      
      // Trigger email notification for pilot creation
      await triggerEmail('pilot.created', {
        entityType: 'pilot',
        entityId: pilot.id,
        variables: {
          pilot_title: pilot.title_en,
          pilot_code: pilot.code,
          challenge_id: pilot.challenge_id,
          municipality_id: pilot.municipality_id
        }
      }).catch(err => console.error('Email trigger failed:', err));
      
      toast.success('Pilot created successfully!');
      navigate(createPageUrl('Pilots'));
    },
    onError: (error) => {
      console.error('Pilot creation error:', error);
      toast.error('Failed to create pilot: ' + (error.message || 'Unknown error'));
    }
  });

  const handleAISuggestions = async () => {
    if (!formData.challenge_id) {
      toast.error(t({ en: 'Please select a challenge first', ar: 'يرجى اختيار التحدي أولاً' }));
      return;
    }

    setIsAIProcessing(true);
    try {
      const challenge = challenges.find(c => c.id === formData.challenge_id);
      const solution = solutions.find(s => s.id === formData.solution_id);
      const municipality = municipalities.find(m => m.id === formData.municipality_id);

      const prompt = `
        Generate comprehensive BILINGUAL (Arabic + English) pilot design for Saudi municipal innovation:
        
        Challenge: ${challenge?.title_en} | ${challenge?.title_ar || ''}
        Description: ${challenge?.description_en?.substring(0, 200)}
        Sector: ${challenge?.sector}
        Municipality: ${municipality?.name_en || ''}
        Solution: ${solution?.name_en || 'To be determined'}
        Solution Description: ${solution?.description_en?.substring(0, 200) || ''}
        
        Generate comprehensive pilot design:
        1. Pilot titles (AR + EN) - professional, actionable
        2. Taglines (AR + EN) - concise one-liners
        3. Descriptions (AR + EN) - detailed approach, 200+ words
        4. Objectives (AR + EN) - clear, measurable
        5. 5-7 key KPIs with bilingual names, baseline, target, unit, measurement frequency
        6. Timeline recommendation (weeks)
        7. Risk level (low/medium/high)
        8. 3-5 specific risks with probability, impact, and mitigation strategies
        9. Success probability (0-100)
        10. Target TRL (current + expected improvement)
      `;

      const result = await invokeAI({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            tagline_en: { type: 'string' },
            tagline_ar: { type: 'string' },
            description_en: { type: 'string' },
            description_ar: { type: 'string' },
            objective_en: { type: 'string' },
            objective_ar: { type: 'string' },
            kpis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  baseline: { type: 'string' },
                  target: { type: 'string' },
                  unit: { type: 'string' },
                  measurement_frequency: { type: 'string' },
                  data_source: { type: 'string' }
                }
              }
            },
            duration_weeks: { type: 'number' },
            risk_level: { type: 'string' },
            risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  risk: { type: 'string' },
                  probability: { type: 'string' },
                  impact: { type: 'string' },
                  mitigation: { type: 'string' }
                }
              }
            },
            success_probability: { type: 'number' },
            trl_target: { type: 'number' }
          }
        }
      });

      if (!result.success) {
        toast.error('AI generation failed');
        return;
      }

      const data = result.data;

      setFormData(prev => ({
        ...prev,
        title_en: result.title_en || prev.title_en,
        title_ar: result.title_ar || prev.title_ar,
        tagline_en: result.tagline_en || prev.tagline_en,
        tagline_ar: result.tagline_ar || prev.tagline_ar,
        description_en: result.description_en || prev.description_en,
        description_ar: result.description_ar || prev.description_ar,
        objective_en: result.objective_en || prev.objective_en,
        objective_ar: result.objective_ar || prev.objective_ar,
        kpis: result.kpis || [],
        duration_weeks: result.duration_weeks || 8,
        risk_level: result.risk_level || 'medium',
        risks: result.risks || [],
        success_probability: result.success_probability || 70,
        trl_target: result.trl_target || 7
      }));

      toast.success(t({ en: '✨ AI enhancement complete!', ar: '✨ تم التحسين بنجاح!' }));
    } catch (error) {
      toast.error(t({ en: 'AI enhancement failed', ar: 'فشل التحسين الذكي' }));
    } finally {
      setIsAIProcessing(false);
    }
  };

  const addKPI = () => {
    setFormData(prev => ({
      ...prev,
      kpis: [...prev.kpis, { name: '', baseline: '', target: '', unit: '', frequency: 'weekly' }]
    }));
  };

  const removeKPI = (index) => {
    setFormData(prev => ({
      ...prev,
      kpis: prev.kpis.filter((_, i) => i !== index)
    }));
  };

  const updateKPI = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      kpis: prev.kpis.map((kpi, i) => i === index ? { ...kpi, [field]: value } : kpi)
    }));
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { 
        name: '', 
        name_ar: '',
        description: '',
        description_ar: '',
        due_date: '', 
        status: 'pending', 
        deliverables: [],
        deliverables_ar: [],
        dependencies: [] 
      }]
    }));
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const updateMilestone = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const generateSafetyChecklist = async () => {
    setIsAIProcessing(true);
    try {
      const challenge = challenges.find(c => c.id === formData.challenge_id);
      const solution = solutions.find(s => s.id === formData.solution_id);
      const sandbox = sandboxes.find(sb => sb.id === formData.sandbox_id);

      const prompt = `
        Generate comprehensive safety checklist for Saudi municipal pilot project:
        
        Pilot: ${formData.title_en}
        Challenge: ${challenge?.title_en}
        Solution: ${solution?.name_en}
        Sector: ${formData.sector}
        Sandbox: ${sandbox?.name || 'General deployment'}
        Location: ${formData.sandbox_zone}
        Duration: ${formData.duration_weeks} weeks
        
        Generate detailed safety protocols covering:
        1. Public safety measures
        2. Data privacy and cybersecurity compliance
        3. Emergency response protocols
        4. Environmental safety considerations
        5. Regulatory compliance requirements
        6. Risk mitigation procedures
        7. Communication and transparency measures
        8. Monitoring and reporting requirements
        
        Return 8-12 specific, actionable safety protocol items in bilingual format (AR + EN).
      `;

      const result = await invokeAI({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            safety_protocols: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  item_en: { type: 'string' },
                  item_ar: { type: 'string' },
                  category: { type: 'string' },
                  priority: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (!result.success) {
        throw new Error('AI generation failed');
      }

      setFormData(prev => ({
        ...prev,
        safety_protocols: result.data?.safety_protocols || []
      }));

      setSafetyChecklistGenerated(true);
      toast.success(t({ en: 'Safety checklist generated!', ar: 'تم إنشاء قائمة السلامة!' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate checklist', ar: 'فشل إنشاء القائمة' }));
    } finally {
      setIsAIProcessing(false);
    }
  };

  const generateMilestones = async () => {
    if (!formData.start_date || !formData.duration_weeks) {
      toast.error(t({ en: 'Please set start date and duration first', ar: 'يرجى تحديد تاريخ البدء والمدة أولاً' }));
      return;
    }

    setIsAIProcessing(true);
    try {
      const challenge = challenges.find(c => c.id === formData.challenge_id);
      const solution = solutions.find(s => s.id === formData.solution_id);

      const prompt = `
        Generate project milestones for Saudi municipal pilot:
        
        Pilot: ${formData.title_en}
        Challenge: ${challenge?.title_en}
        Solution: ${solution?.name_en}
        Start Date: ${formData.start_date}
        Duration: ${formData.duration_weeks} weeks
        End Date: ${formData.end_date || 'TBD'}
        Sector: ${formData.sector}
        
        Generate 6-10 key milestones covering the pilot lifecycle:
        - Planning and preparation phase
        - Deployment and setup
        - Testing and validation
        - Data collection periods
        - Evaluation checkpoints
        - Final assessment and reporting
        
        CRITICAL: Provide SEPARATE English and Arabic content for ALL fields.
        
        For each milestone provide:
        - name: English ONLY (e.g., "Planning & Preparation")
        - name_ar: Arabic ONLY (e.g., "التخطيط والإعداد")
        - description: English ONLY (detailed description)
        - description_ar: Arabic ONLY (detailed description)
        - due_date: calculate based on start date and duration (YYYY-MM-DD format)
        - deliverables: array of English strings (2-3 items)
        - deliverables_ar: array of Arabic strings (2-3 items)
        - dependencies: array of strings (if applicable)
        
        Ensure milestones are evenly distributed across the pilot duration.
      `;

      const result = await invokeAI({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  name_ar: { type: 'string' },
                  description: { type: 'string' },
                  description_ar: { type: 'string' },
                  due_date: { type: 'string' },
                  deliverables: { type: 'array', items: { type: 'string' } },
                  deliverables_ar: { type: 'array', items: { type: 'string' } },
                  dependencies: { type: 'array', items: { type: 'string' } },
                  status: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (!result.success) {
        throw new Error('AI generation failed');
      }

      // Sort milestones by due date
      const sortedMilestones = (result.data?.milestones || []).sort((a, b) => 
        new Date(a.due_date) - new Date(b.due_date)
      );

      setFormData(prev => ({
        ...prev,
        milestones: sortedMilestones.map(m => ({ ...m, status: 'pending' }))
      }));

      toast.success(t({ en: 'Milestones generated!', ar: 'تم إنشاء المعالم!' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate milestones', ar: 'فشل إنشاء المعالم' }));
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Auto-calculate end date when start date or duration changes
  React.useEffect(() => {
    if (formData.start_date && formData.duration_weeks) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (formData.duration_weeks * 7));
      setFormData(prev => ({
        ...prev,
        end_date: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.start_date, formData.duration_weeks]);

  const handleSubmit = () => {
    console.log('Submit button clicked');
    console.log('Form data:', formData);
    
    // Validate required fields
    if (!formData.title_en) {
      toast.error(t({ en: 'Title (English) is required', ar: 'العنوان بالإنجليزية مطلوب' }));
      return;
    }
    if (!formData.challenge_id) {
      toast.error(t({ en: 'Challenge is required', ar: 'التحدي مطلوب' }));
      return;
    }
    if (!formData.municipality_id) {
      toast.error(t({ en: 'Municipality is required', ar: 'البلدية مطلوبة' }));
      return;
    }
    if (!formData.sector) {
      toast.error(t({ en: 'Sector is required', ar: 'القطاع مطلوب' }));
      return;
    }

    // Clean helper: convert empty strings to undefined, keep valid values
    const clean = (val) => (val === '' || val === null) ? undefined : val;
    const cleanArray = (arr) => arr && arr.length > 0 ? arr : undefined;

    // Transform formData to match Pilot entity schema
    const pilotData = {
      code: formData.code,
      title_en: formData.title_en,
      title_ar: clean(formData.title_ar),
      tagline_en: clean(formData.tagline_en),
      tagline_ar: clean(formData.tagline_ar),
      description_en: clean(formData.description_en),
      description_ar: clean(formData.description_ar),
      objective_en: clean(formData.objective_en),
      objective_ar: clean(formData.objective_ar),
      hypothesis: clean(formData.hypothesis),
      methodology: clean(formData.methodology),
      scope: clean(formData.scope),
      challenge_id: formData.challenge_id,
      solution_id: clean(formData.solution_id),
      municipality_id: formData.municipality_id,
      sector: formData.sector,
      stage: formData.stage,
      duration_weeks: Number(formData.duration_weeks) || 8,
      budget: formData.budget && formData.budget !== '' ? Number(formData.budget) : undefined,
      budget_currency: formData.budget_currency || 'SAR',
      trl_start: Number(formData.trl_start) || 4,
      trl_current: Number(formData.trl_current) || 4,
      trl_target: Number(formData.trl_target) || 7,
      success_probability: Number(formData.success_probability) || 70,
      risk_level: formData.risk_level || 'medium',
      // Only include timeline if we have dates
      timeline: (formData.start_date && formData.start_date !== '') || (formData.end_date && formData.end_date !== '') ? {
        pilot_start: clean(formData.start_date),
        pilot_end: clean(formData.end_date)
      } : undefined,
      // Arrays - only include if not empty
      kpis: cleanArray(formData.kpis),
      risks: cleanArray(formData.risks),
      milestones: cleanArray(formData.milestones),
      documents: cleanArray(formData.documents),
      regulatory_exemptions: cleanArray(formData.regulatory_exemptions),
      // Transform safety_protocols from objects to strings
      safety_protocols: formData.safety_protocols?.length > 0 ? formData.safety_protocols.map(p => 
        typeof p === 'string' ? p : (p.item_en || '')
      ) : undefined,
      // Team and stakeholders (keep non-empty)
      team: formData.team?.filter(m => m.name).length > 0 ? formData.team : undefined,
      stakeholders: formData.stakeholders?.filter(s => s.name).length > 0 ? formData.stakeholders : undefined,
      // Location fields
      region_id: clean(formData.region_id),
      city_id: clean(formData.city_id),
      living_lab_id: clean(formData.living_lab_id),
      sub_sector: clean(formData.sub_sector),
      // Sandbox fields
      sandbox_id: clean(formData.sandbox_id),
      sandbox_zone: clean(formData.sandbox_zone),
      // Target population
      target_population: (formData.target_population?.size || formData.target_population?.demographics || formData.target_population?.location) ? formData.target_population : undefined,
      // Success criteria
      success_criteria: cleanArray(formData.success_criteria),
      // Issues
      issues: cleanArray(formData.issues),
      // Data and tech
      data_collection: (formData.data_collection?.methods?.length > 0 || formData.data_collection?.frequency) ? formData.data_collection : undefined,
      technology_stack: cleanArray(formData.technology_stack),
      // Engagement and media
      public_engagement: (formData.public_engagement?.community_sessions || formData.public_engagement?.feedback_collected) ? formData.public_engagement : undefined,
      media_coverage: cleanArray(formData.media_coverage),
      // Evaluation
      lessons_learned: cleanArray(formData.lessons_learned),
      scaling_plan: formData.scaling_plan?.strategy ? formData.scaling_plan : undefined,
      // Budget details
      budget_breakdown: cleanArray(formData.budget_breakdown),
      funding_sources: cleanArray(formData.funding_sources),
      // Media
      image_url: clean(formData.image_url),
      video_url: clean(formData.video_url),
      gallery_urls: cleanArray(formData.gallery_urls),
      tags: cleanArray(formData.tags),
      // Strategic alignment
      strategic_plan_ids: cleanArray(formData.strategic_plan_ids),
      strategic_objective_ids: cleanArray(formData.strategic_objective_ids),
      // Flags
      is_published: formData.is_published || false,
      is_flagship: formData.is_flagship || false,
      is_archived: formData.is_archived || false
    };
    
    // Remove undefined fields to keep payload clean
    Object.keys(pilotData).forEach(key => {
      if (pilotData[key] === undefined) {
        delete pilotData[key];
      }
    });
    
    console.log('Cleaned pilot data for submission:', pilotData);
    createMutation.mutate(pilotData);
  };

  const sectorOptions = [
    { value: 'urban_design', label: 'Urban Design', label_ar: 'التصميم العمراني' },
    { value: 'transport', label: 'Transport', label_ar: 'النقل' },
    { value: 'environment', label: 'Environment', label_ar: 'البيئة' },
    { value: 'digital_services', label: 'Digital Services', label_ar: 'الخدمات الرقمية' }
  ];

  return (
    <PageLayout className="max-w-5xl mx-auto">
      <PageHeader
        icon={TestTube}
        title={{ en: 'Create New Pilot', ar: 'إنشاء تجربة جديدة' }}
        description={{ en: 'Design and launch a pilot project', ar: 'تصميم وإطلاق مشروع تجريبي' }}
        action={
          <TemplateLibrary 
            entityType="Pilot" 
            onUseTemplate={(template) => {
              setFormData({
                ...formData,
                title_en: template.title_en,
                title_ar: template.title_ar,
                sector: template.sector,
                duration_weeks: template.duration_weeks,
                trl_start: template.trl_start,
                budget: template.budget,
                kpis: template.kpis || []
              });
            }}
          />
        }
      />

      {/* Progress Stepper */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= s ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white' : 'bg-white text-slate-400 border-2'
                } font-semibold transition-all`}>
                  {s}
                </div>
                {s < 7 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-gradient-to-r from-blue-600 to-teal-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium">
            <span className={step >= 1 ? 'text-blue-600' : 'text-slate-400'}>Setup</span>
            <span className={step >= 2 ? 'text-blue-600' : 'text-slate-400'}>Design</span>
            <span className={step >= 3 ? 'text-blue-600' : 'text-slate-400'}>Data</span>
            <span className={step >= 4 ? 'text-blue-600' : 'text-slate-400'}>Sandbox</span>
            <span className={step >= 5 ? 'text-blue-600' : 'text-slate-400'}>Timeline</span>
            <span className={step >= 6 ? 'text-blue-600' : 'text-slate-400'}>Budget</span>
            <span className={step >= 7 ? 'text-blue-600' : 'text-slate-400'}>Review</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Pre-Pilot Setup */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Pre-Pilot Setup | الإعداد الأولي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Pilot Code | رمز التجربة</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="PILOT-2026-001"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Related Challenge | التحدي المرتبط</Label>
                <Select
                  value={formData.challenge_id}
                  onValueChange={(value) => {
                    const challenge = challenges.find(c => c.id === value);
                    setFormData({
                      ...formData,
                      challenge_id: value,
                      sector: challenge?.sector || '',
                      municipality_id: challenge?.municipality_id || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select challenge" />
                  </SelectTrigger>
                  <SelectContent>
                    {challenges.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} - {c.title_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Solution Provider | مقدم الحل</Label>
                <Select
                  value={formData.solution_id}
                  onValueChange={(value) => {
                    setFormData({...formData, solution_id: value});
                    const solution = solutions.find(s => s.id === value);
                    setSelectedSolutionForCheck(solution);
                    setReadinessChecked(false);
                  }}
                  disabled={!formData.challenge_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      formData.challenge_id 
                        ? t({ en: 'Select solution', ar: 'اختر الحل' })
                        : t({ en: 'Select challenge first', ar: 'اختر التحدي أولاً' })
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSolutions.length > 0 ? (
                      filteredSolutions.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name_en} - {s.provider_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        {t({ en: 'No matched solutions', ar: 'لا توجد حلول مطابقة' })}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {formData.challenge_id && filteredSolutions.length === 0 && (
                  <p className="text-xs text-amber-600">
                    {t({ en: 'No solutions matched to this challenge. Consider running AI matching first.', ar: 'لا توجد حلول مرتبطة بهذا التحدي. جرب المطابقة الذكية أولاً.' })}
                  </p>
                )}
              </div>
            </div>

            {/* MANDATORY READINESS GATE */}
            {formData.solution_id && selectedSolutionForCheck && !readinessChecked && (
              <div className="mt-6">
                <SolutionReadinessGate 
                  solution={selectedSolutionForCheck} 
                  onProceed={() => {
                    setReadinessChecked(true);
                    toast.success(t({ en: 'Readiness verified! You can proceed.', ar: 'تم التحقق من الجاهزية! يمكنك المتابعة.' }));
                  }}
                />
              </div>
            )}

            {formData.solution_id && !readinessChecked && (
              <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
                <p className="text-sm text-amber-900 font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t({ en: 'Complete readiness check to proceed', ar: 'أكمل فحص الجاهزية للمتابعة' })}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Region | المنطقة</Label>
                <Select
                  value={formData.region_id}
                  onValueChange={(value) => setFormData({...formData, region_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>City | المدينة</Label>
                <Select
                  value={formData.city_id}
                  onValueChange={(value) => setFormData({...formData, city_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Municipality | البلدية</Label>
                <Select
                  value={formData.municipality_id}
                  onValueChange={(value) => setFormData({...formData, municipality_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name_en} | {m.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Living Lab (Optional) | المختبر الحي</Label>
                <Select
                  value={formData.living_lab_id}
                  onValueChange={(value) => setFormData({...formData, living_lab_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select living lab" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {livingLabs.map(lab => (
                      <SelectItem key={lab.id} value={lab.id}>
                        {lab.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sector | القطاع</Label>
                <Select
                  value={formData.sector}
                  onValueChange={(value) => setFormData({...formData, sector: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} | {option.label_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Strategic Alignment Section */}
            <div className="border-t pt-4 mt-4">
              <StrategicPlanSelector
                selectedPlanIds={formData.strategic_plan_ids || []}
                selectedObjectiveIds={formData.strategic_objective_ids || []}
                onPlanChange={(ids) => setFormData({...formData, strategic_plan_ids: ids})}
                onObjectiveChange={(ids) => setFormData({...formData, strategic_objective_ids: ids})}
                showObjectives={true}
                label={t({ en: 'Strategic Alignment | التوافق الاستراتيجي', ar: 'التوافق الاستراتيجي' })}
              />
            </div>

            {formData.challenge_id && formData.solution_id && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">AI Auto-Design | التصميم الآلي</p>
                      <p className="text-xs text-slate-600">Let AI suggest pilot design and KPIs</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAISuggestions}
                    disabled={isAIProcessing}
                    className="bg-gradient-to-r from-blue-600 to-teal-600"
                  >
                    {isAIProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Design & KPIs */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Design & KPIs | التصميم ومؤشرات الأداء</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pilot Title (English)</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                  placeholder="Smart Drainage Monitoring Pilot"
                />
              </div>
              <div className="space-y-2">
                <Label>عنوان التجربة (عربي)</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({...formData, title_ar: e.target.value})}
                  placeholder="تجربة مراقبة التصريف الذكي"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tagline (English)</Label>
                <Input
                  value={formData.tagline_en}
                  onChange={(e) => setFormData({...formData, tagline_en: e.target.value})}
                  placeholder="Brief one-liner description"
                />
              </div>
              <div className="space-y-2">
                <Label>الشعار (عربي)</Label>
                <Input
                  value={formData.tagline_ar}
                  onChange={(e) => setFormData({...formData, tagline_ar: e.target.value})}
                  placeholder="وصف مختصر"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                placeholder="Detailed pilot approach and methodology..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف (عربي)</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                placeholder="نهج التجربة التفصيلي والمنهجية..."
                rows={4}
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label>Objective (English)</Label>
              <Textarea
                value={formData.objective_en}
                onChange={(e) => setFormData({...formData, objective_en: e.target.value})}
                placeholder="What this pilot aims to achieve..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>الهدف (عربي)</Label>
              <Textarea
                value={formData.objective_ar}
                onChange={(e) => setFormData({...formData, objective_ar: e.target.value})}
                placeholder="ما تهدف هذه التجربة إلى تحقيقه..."
                rows={2}
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label>Sub-Sector | القطاع الفرعي</Label>
              <Input
                value={formData.sub_sector}
                onChange={(e) => setFormData({...formData, sub_sector: e.target.value})}
                placeholder="e.g., Public Parks, Road Safety"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Key Performance Indicators | مؤشرات الأداء الرئيسية</Label>
                <Button onClick={addKPI} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add KPI
                </Button>
              </div>

              {formData.kpis.map((kpi, index) => (
                <Card key={index} className="p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        placeholder="KPI Name"
                        value={kpi.name}
                        onChange={(e) => updateKPI(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Unit (e.g., complaints/month)"
                        value={kpi.unit}
                        onChange={(e) => updateKPI(index, 'unit', e.target.value)}
                      />
                      <Input
                        placeholder="Baseline value"
                        value={kpi.baseline}
                        onChange={(e) => updateKPI(index, 'baseline', e.target.value)}
                      />
                      <Input
                        placeholder="Target value"
                        value={kpi.target}
                        onChange={(e) => updateKPI(index, 'target', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKPI(index)}
                      className="hover:bg-red-50"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Success Criteria | معايير النجاح</Label>
                <Button size="sm" variant="outline" onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    success_criteria: [...(prev.success_criteria || []), { criterion: '', threshold: '', met: false }]
                  }));
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Criterion
                </Button>
              </div>
              {formData.success_criteria?.map((sc, idx) => (
                <Card key={idx} className="p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Success criterion"
                        value={sc.criterion || ''}
                        onChange={(e) => {
                          const updated = [...formData.success_criteria];
                          updated[idx].criterion = e.target.value;
                          setFormData({...formData, success_criteria: updated});
                        }}
                      />
                      <Input
                        placeholder="Threshold"
                        value={sc.threshold || ''}
                        onChange={(e) => {
                          const updated = [...formData.success_criteria];
                          updated[idx].threshold = e.target.value;
                          setFormData({...formData, success_criteria: updated});
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          success_criteria: prev.success_criteria.filter((_, i) => i !== idx)
                        }));
                      }}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Team Members | أعضاء الفريق</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!formData.challenge_id) {
                        toast.error('Please select a challenge first');
                        return;
                      }
                      try {
                        const challenge = challenges.find(c => c.id === formData.challenge_id);
                        const response = await invokeAI({
                          prompt: `Generate an optimal team composition for this pilot project:
Challenge: ${challenge?.title_en}
Sector: ${formData.sector}
Description: ${formData.description_en}
Solution type: ${formData.solution_id ? solutions.find(s => s.id === formData.solution_id)?.name_en : 'TBD'}

Generate 5-7 team members with realistic roles for a municipal innovation pilot. Include:
- Municipality representatives
- Technical experts
- Project management
- Domain specialists

Return as JSON array with: name (realistic Arabic name), role, organization (municipality/ministry/provider), email (format: name@org.gov.sa), responsibility`,
                          response_json_schema: {
                            type: "object",
                            properties: {
                              team: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    name: { type: "string" },
                                    role: { type: "string" },
                                    organization: { type: "string" },
                                    email: { type: "string" },
                                    responsibility: { type: "string" }
                                  }
                                }
                              }
                            }
                          }
                        });
                        if (response.success) {
                          setFormData(prev => ({ ...prev, team: response.data?.team }));
                          toast.success('AI generated team structure');
                        }
                      } catch (error) {
                        toast.error('Failed to generate team: ' + error.message);
                      }
                    }}
                    disabled={isAIProcessing || !formData.challenge_id}
                  >
                    {isAIProcessing ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> AI Team Builder</>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      team: [...(prev.team || []), { name: '', role: '', email: '', organization: '', responsibility: '' }]
                    }));
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </div>
              {formData.team?.map((member, idx) => (
                <Card key={idx} className="p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Name"
                          value={member.name || ''}
                          onChange={(e) => {
                            const updated = [...formData.team];
                            updated[idx].name = e.target.value;
                            setFormData({...formData, team: updated});
                          }}
                        />
                        <Input
                          placeholder="Role"
                          value={member.role || ''}
                          onChange={(e) => {
                            const updated = [...formData.team];
                            updated[idx].role = e.target.value;
                            setFormData({...formData, team: updated});
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Email"
                          value={member.email || ''}
                          onChange={(e) => {
                            const updated = [...formData.team];
                            updated[idx].email = e.target.value;
                            setFormData({...formData, team: updated});
                          }}
                        />
                        <Input
                          placeholder="Organization"
                          value={member.organization || ''}
                          onChange={(e) => {
                            const updated = [...formData.team];
                            updated[idx].organization = e.target.value;
                            setFormData({...formData, team: updated});
                          }}
                        />
                      </div>
                      <Input
                        placeholder="Responsibility"
                        value={member.responsibility || ''}
                        onChange={(e) => {
                          const updated = [...formData.team];
                          updated[idx].responsibility = e.target.value;
                          setFormData({...formData, team: updated});
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          team: prev.team.filter((_, i) => i !== idx)
                        }));
                      }}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stakeholders | أصحاب المصلحة</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!formData.challenge_id) {
                        toast.error('Please select a challenge first');
                        return;
                      }
                      try {
                        const challenge = challenges.find(c => c.id === formData.challenge_id);
                        const response = await invokeAI({
                          prompt: `Identify key stakeholders for this municipal innovation pilot:
Challenge: ${challenge?.title_en}
Sector: ${formData.sector}
Municipality: ${formData.municipality_id}
Scope: ${formData.scope || formData.description_en}

Identify 6-10 stakeholders including:
- Government entities (ministry, municipality departments)
- Community groups (affected residents, neighborhood councils)
- Private sector (utilities, service providers)
- Regulatory bodies
- Academic institutions (if relevant)

Return JSON with: name, type (government/community/private/regulatory/academic), involvement (their role/interest)`,
                          response_json_schema: {
                            type: "object",
                            properties: {
                              stakeholders: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    name: { type: "string" },
                                    type: { type: "string" },
                                    involvement: { type: "string" }
                                  }
                                }
                              }
                            }
                          }
                        });
                        if (response.success) {
                          setFormData(prev => ({ ...prev, stakeholders: response.data?.stakeholders }));
                          toast.success('AI mapped stakeholders');
                        }
                      } catch (error) {
                        toast.error('Failed to map stakeholders: ' + error.message);
                      }
                    }}
                    disabled={isAIProcessing || !formData.challenge_id}
                  >
                    {isAIProcessing ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mapping...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> AI Stakeholder Map</>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      stakeholders: [...(prev.stakeholders || []), { name: '', type: '', involvement: '' }]
                    }));
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stakeholder
                  </Button>
                </div>
              </div>
              {formData.stakeholders?.map((sh, idx) => (
                <Card key={idx} className="p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Name"
                        value={sh.name || ''}
                        onChange={(e) => {
                          const updated = [...formData.stakeholders];
                          updated[idx].name = e.target.value;
                          setFormData({...formData, stakeholders: updated});
                        }}
                      />
                      <Input
                        placeholder="Type (e.g., Government)"
                        value={sh.type || ''}
                        onChange={(e) => {
                          const updated = [...formData.stakeholders];
                          updated[idx].type = e.target.value;
                          setFormData({...formData, stakeholders: updated});
                        }}
                      />
                      <Input
                        placeholder="Involvement"
                        value={sh.involvement || ''}
                        onChange={(e) => {
                          const updated = [...formData.stakeholders];
                          updated[idx].involvement = e.target.value;
                          setFormData({...formData, stakeholders: updated});
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          stakeholders: prev.stakeholders.filter((_, i) => i !== idx)
                        }));
                      }}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>TRL Start | المستوى التقني الأولي</Label>
                <Select
                  value={formData.trl_start.toString()}
                  onValueChange={(value) => setFormData({...formData, trl_start: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9].map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        TRL {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expected Risk | المخاطر المتوقعة</Label>
                <Select
                  value={formData.risk_level}
                  onValueChange={(value) => setFormData({...formData, risk_level: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low | منخفض</SelectItem>
                    <SelectItem value="medium">Medium | متوسط</SelectItem>
                    <SelectItem value="high">High | عالٍ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Target Population & Data Collection */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Target Population & Data Collection | الفئة المستهدفة وجمع البيانات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">{t({ en: 'Target Population', ar: 'الفئة المستهدفة' })}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Population Size</Label>
                  <Input
                    type="number"
                    value={formData.target_population?.size || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_population: {
                        ...(formData.target_population || {}),
                        size: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Demographics</Label>
                  <Input
                    value={formData.target_population?.demographics || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_population: {
                        ...(formData.target_population || {}),
                        demographics: e.target.value
                      }
                    })}
                    placeholder="Young professionals, families"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.target_population?.location || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_population: {
                        ...(formData.target_population || {}),
                        location: e.target.value
                      }
                    })}
                    placeholder="Downtown area"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900">{t({ en: 'Data Collection', ar: 'جمع البيانات' })}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Methods (comma-separated)</Label>
                  <Input
                    placeholder="Surveys, Sensors, Interviews"
                    value={formData.data_collection?.methods?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      data_collection: {
                        ...(formData.data_collection || {}),
                        methods: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input
                    placeholder="Weekly, Monthly, Real-time"
                    value={formData.data_collection?.frequency || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      data_collection: {
                        ...(formData.data_collection || {}),
                        frequency: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tools (comma-separated)</Label>
                  <Input
                    placeholder="Google Forms, IoT Platform"
                    value={formData.data_collection?.tools?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      data_collection: {
                        ...(formData.data_collection || {}),
                        tools: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Responsible Party</Label>
                  <Input
                    placeholder="Team member or organization"
                    value={formData.data_collection?.responsible_party || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      data_collection: {
                        ...(formData.data_collection || {}),
                        responsible_party: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Technology Stack | المكدس التقني</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!formData.description_en) {
                        toast.error('Please describe the pilot first');
                        return;
                      }
                      try {
                        const solution = solutions.find(s => s.id === formData.solution_id);
                        const response = await invokeAI({
                          prompt: `Recommend technology stack for this pilot:
Description: ${formData.description_en}
Solution: ${solution?.name_en || 'TBD'}
Sector: ${formData.sector}
Budget: ${formData.budget}

Recommend 8-12 technologies covering:
- Hardware (sensors, devices)
- Software (platforms, apps)
- Data & Analytics
- Communication & Networking
- Security & Compliance

Return JSON with: category, technology, version, purpose`,
                          response_json_schema: {
                            type: "object",
                            properties: {
                              technology_stack: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    category: { type: "string" },
                                    technology: { type: "string" },
                                    version: { type: "string" },
                                    purpose: { type: "string" }
                                  }
                                }
                              }
                            }
                          }
                        });
                        if (response.success) {
                          setFormData(prev => ({ ...prev, technology_stack: response.data?.technology_stack }));
                          toast.success('✨ AI recommended tech stack');
                        }
                      } catch (error) {
                        toast.error('Failed: ' + error.message);
                      }
                    }}
                    disabled={isAIProcessing || !formData.description_en}
                  >
                    {isAIProcessing ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recommending...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> AI Tech Recommender</>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      technology_stack: [...(prev.technology_stack || []), { category: '', technology: '', version: '', purpose: '' }]
                    }));
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tech
                  </Button>
                </div>
              </div>
              {formData.technology_stack?.map((tech, idx) => (
                <Card key={idx} className="p-4 bg-slate-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <Input
                        placeholder="Category"
                        value={tech.category || ''}
                        onChange={(e) => {
                          const updated = [...formData.technology_stack];
                          updated[idx].category = e.target.value;
                          setFormData({...formData, technology_stack: updated});
                        }}
                      />
                      <Input
                        placeholder="Technology"
                        value={tech.technology || ''}
                        onChange={(e) => {
                          const updated = [...formData.technology_stack];
                          updated[idx].technology = e.target.value;
                          setFormData({...formData, technology_stack: updated});
                        }}
                      />
                      <Input
                        placeholder="Version"
                        value={tech.version || ''}
                        onChange={(e) => {
                          const updated = [...formData.technology_stack];
                          updated[idx].version = e.target.value;
                          setFormData({...formData, technology_stack: updated});
                        }}
                      />
                      <Input
                        placeholder="Purpose"
                        value={tech.purpose || ''}
                        onChange={(e) => {
                          const updated = [...formData.technology_stack];
                          updated[idx].purpose = e.target.value;
                          setFormData({...formData, technology_stack: updated});
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          technology_stack: prev.technology_stack.filter((_, i) => i !== idx)
                        }));
                      }}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Sandbox & Compliance */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Step 4: Sandbox & Compliance | منطقة الاختبار والامتثال
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Sandbox (Optional) | اختر منطقة الاختبار (اختياري)</Label>
              <Select
                value={formData.sandbox_id}
                onValueChange={(value) => {
                  const sandbox = sandboxes.find(sb => sb.id === value);
                  setFormData({
                    ...formData, 
                    sandbox_id: value,
                    sandbox_zone: sandbox?.name || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select sandbox zone (optional)', ar: 'اختر منطقة الاختبار (اختياري)' })} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSandboxes.length > 0 ? (
                    filteredSandboxes.map(sb => (
                      <SelectItem key={sb.id} value={sb.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{sb.name} ({sb.location}) - Capacity: {sb.current_projects || 0}/{sb.max_capacity || 10}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {t({ en: 'No matching sandboxes available', ar: 'لا توجد مناطق اختبار متاحة' })}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sandbox Zone/Location | الموقع المحدد</Label>
              <Input
                value={formData.sandbox_zone}
                onChange={(e) => setFormData({...formData, sandbox_zone: e.target.value})}
                placeholder="e.g., Downtown District A, King Fahd Road Area"
              />
            </div>

            <div className="space-y-3">
              <Label>Regulatory Exemptions Needed | الاستثناءات التنظيمية المطلوبة</Label>
              <Textarea
                value={formData.regulatory_exemptions.join('\n')}
                onChange={(e) => setFormData({
                  ...formData, 
                  regulatory_exemptions: e.target.value.split('\n').filter(l => l.trim())
                })}
                placeholder={t({ 
                  en: 'List any regulatory exemptions or special approvals needed (one per line)...', 
                  ar: 'اذكر أي استثناءات تنظيمية أو موافقات خاصة مطلوبة (واحدة في كل سطر)...' 
                })}
                rows={3}
              />
            </div>

            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Safety Protocols | بروتوكولات السلامة</Label>
                <Button
                  onClick={generateSafetyChecklist}
                  disabled={isAIProcessing || !formData.challenge_id}
                  variant="outline"
                  size="sm"
                >
                  {isAIProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t({ en: 'Generate Checklist', ar: 'إنشاء القائمة' })}
                    </>
                  )}
                </Button>
              </div>
              
              {formData.safety_protocols && formData.safety_protocols.length > 0 && (
                <div className="space-y-2">
                  {formData.safety_protocols.map((protocol, idx) => (
                    <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">
                            {typeof protocol === 'string' ? protocol : protocol.item_en}
                          </p>
                          {typeof protocol === 'object' && protocol.item_ar && (
                            <p className="text-sm text-green-800 mt-1" dir="rtl">{protocol.item_ar}</p>
                          )}
                          {typeof protocol === 'object' && protocol.category && (
                            <Badge variant="outline" className="mt-2 text-xs">{protocol.category}</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              safety_protocols: prev.safety_protocols.filter((_, i) => i !== idx)
                            }));
                          }}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Timeline */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Timeline | الجدول الزمني</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date | تاريخ البدء</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (weeks) | المدة (أسابيع)</Label>
                <Input
                  type="number"
                  min="1"
                  max="52"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({...formData, duration_weeks: parseInt(e.target.value) || 8})}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date (Auto-calculated) | تاريخ الانتهاء (تلقائي)</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
              ℹ️ {t({ 
                en: 'End date is automatically calculated based on start date + duration', 
                ar: 'يتم احتساب تاريخ الانتهاء تلقائياً بناءً على تاريخ البدء + المدة' 
              })}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label>Milestones | المعالم الرئيسية</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    {t({ en: 'AI can generate milestones based on timeline', ar: 'يمكن للذكاء الاصطناعي إنشاء المعالم بناءً على الجدول الزمني' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={generateMilestones}
                    disabled={isAIProcessing || !formData.start_date || !formData.duration_weeks}
                    variant="outline"
                    size="sm"
                  >
                    {isAIProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
                      </>
                    )}
                  </Button>
                  <Button onClick={addMilestone} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    {t({ en: 'Add Manual', ar: 'إضافة يدوية' })}
                  </Button>
                </div>
              </div>

              {formData.milestones.length > 0 ? (
                <div className="space-y-3">
                  {formData.milestones
                    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                    .map((milestone, index) => (
                    <Card key={index} className="p-4 bg-slate-50">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder={t({ en: 'Milestone name (English)', ar: 'اسم المعلم (إنجليزي)' })}
                              value={milestone.name}
                              onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                            />
                            <Input
                              placeholder={t({ en: 'اسم المعلم (عربي)', ar: 'Milestone name (Arabic)' })}
                              value={milestone.name_ar || ''}
                              onChange={(e) => updateMilestone(index, 'name_ar', e.target.value)}
                              dir="rtl"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Textarea
                              placeholder={t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}
                              value={milestone.description || ''}
                              onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                              rows={2}
                            />
                            <Textarea
                              placeholder={t({ en: 'الوصف (عربي)', ar: 'Description (Arabic)' })}
                              value={milestone.description_ar || ''}
                              onChange={(e) => updateMilestone(index, 'description_ar', e.target.value)}
                              rows={2}
                              dir="rtl"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <Input
                              type="date"
                              value={milestone.due_date}
                              onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                            />
                            <Input
                              placeholder={t({ en: 'Deliverables (EN, comma-sep)', ar: 'المخرجات (إنجليزي)' })}
                              value={milestone.deliverables?.join(', ') || ''}
                              onChange={(e) => updateMilestone(index, 'deliverables', e.target.value.split(',').map(d => d.trim()).filter(d => d))}
                            />
                            <Input
                              placeholder={t({ en: 'المخرجات (عربي، بفاصلة)', ar: 'Deliverables (AR, comma-sep)' })}
                              value={milestone.deliverables_ar?.join(', ') || ''}
                              onChange={(e) => updateMilestone(index, 'deliverables_ar', e.target.value.split(',').map(d => d.trim()).filter(d => d))}
                              dir="rtl"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMilestone(index)}
                          className="hover:bg-red-50"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <p className="text-sm text-slate-600">
                    {t({ 
                      en: 'No milestones added yet. Generate with AI or add manually.', 
                      ar: 'لم تتم إضافة معالم بعد. قم بالإنشاء بالذكاء الاصطناعي أو أضف يدوياً.' 
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Target Population & Data Collection (NEW) */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Target Population & Data Collection | الفئة المستهدفة وجمع البيانات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">{t({ en: 'Target Population', ar: 'الفئة المستهدفة' })}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Population Size</Label>
                  <Input
                    type="number"
                    value={formData.target_population?.size || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_population: {
                        ...(formData.target_population || {}),
                        size: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Demographics</Label>
                  <Input
                    value={formData.target_population?.demographics || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_population: {
                        ...(formData.target_population || {}),
                        demographics: e.target.value
                      }
                    })}
                    placeholder="Young professionals, families"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.target_population?.location || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      target_population: {
                        ...(formData.target_population || {}),
                        location: e.target.value
                      }
                    })}
                    placeholder="Downtown area"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900">{t({ en: 'Data Collection', ar: 'جمع البيانات' })}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Methods (comma-separated)</Label>
                  <Input
                    placeholder="Surveys, Sensors, Interviews"
                    value={formData.data_collection?.methods?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      data_collection: {
                        ...(formData.data_collection || {}),
                        methods: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Input
                    placeholder="Weekly, Monthly, Real-time"
                    value={formData.data_collection?.frequency || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      data_collection: {
                        ...(formData.data_collection || {}),
                        frequency: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tools (comma-separated)</Label>
                  <Input
                    placeholder="Google Forms, IoT Platform"
                    value={formData.data_collection?.tools?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      data_collection: {
                        ...(formData.data_collection || {}),
                        tools: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Responsible Party</Label>
                  <Input
                    placeholder="Team member or organization"
                    value={formData.data_collection?.responsible_party || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      data_collection: {
                        ...(formData.data_collection || {}),
                        responsible_party: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: (was Step 3) Sandbox & Compliance (RENUMBERED) */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Step 4: Sandbox & Compliance | منطقة الاختبار والامتثال
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Sandbox (Optional) | اختر منطقة الاختبار (اختياري)</Label>
              <Select
                value={formData.sandbox_id}
                onValueChange={(value) => {
                  const sandbox = sandboxes.find(sb => sb.id === value);
                  setFormData({
                    ...formData, 
                    sandbox_id: value,
                    sandbox_zone: sandbox?.name || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select sandbox zone (optional)', ar: 'اختر منطقة الاختبار (اختياري)' })} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSandboxes.length > 0 ? (
                    filteredSandboxes.map(sb => (
                      <SelectItem key={sb.id} value={sb.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{sb.name} ({sb.location}) - Capacity: {sb.current_projects || 0}/{sb.max_capacity || 10}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {t({ en: 'No matching sandboxes available', ar: 'لا توجد مناطق اختبار متاحة' })}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sandbox Zone/Location | الموقع المحدد</Label>
              <Input
                value={formData.sandbox_zone}
                onChange={(e) => setFormData({...formData, sandbox_zone: e.target.value})}
                placeholder="e.g., Downtown District A, King Fahd Road Area"
              />
            </div>

            <div className="space-y-3">
              <Label>Regulatory Exemptions Needed | الاستثناءات التنظيمية المطلوبة</Label>
              <Textarea
                value={formData.regulatory_exemptions.join('\n')}
                onChange={(e) => setFormData({
                  ...formData, 
                  regulatory_exemptions: e.target.value.split('\n').filter(l => l.trim())
                })}
                placeholder={t({ 
                  en: 'List any regulatory exemptions or special approvals needed (one per line)...', 
                  ar: 'اذكر أي استثناءات تنظيمية أو موافقات خاصة مطلوبة (واحدة في كل سطر)...' 
                })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Budget & Media (was Step 5) */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 6: Budget & Media | الميزانية والوسائط</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Budget | إجمالي الميزانية</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="500000"
                />
              </div>

              <div className="space-y-2">
                <Label>Currency | العملة</Label>
                <Select
                  value={formData.budget_currency}
                  onValueChange={(value) => setFormData({...formData, budget_currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR (ريال سعودي)</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.budget && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900 mb-2">Budget Breakdown | تفصيل الميزانية</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span>Vendor cost:</span>
                    <span className="font-medium">{(formData.budget * 0.6).toLocaleString()} {formData.budget_currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Municipality cost:</span>
                    <span className="font-medium">{(formData.budget * 0.3).toLocaleString()} {formData.budget_currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contingency (10%):</span>
                    <span className="font-medium">{(formData.budget * 0.1).toLocaleString()} {formData.budget_currency}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{t({ en: 'Budget Details', ar: 'تفاصيل الميزانية' })}</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (!formData.budget || !formData.description_en) {
                      toast.error('Please set total budget and describe the pilot first');
                      return;
                    }
                    try {
                      const response = await invokeAI({
                        prompt: `Optimize budget allocation for this pilot:
Total Budget: ${formData.budget} ${formData.budget_currency}
Description: ${formData.description_en}
Duration: ${formData.duration_weeks} weeks
Sector: ${formData.sector}
Technology: ${formData.technology_stack?.map(t => t.technology).join(', ') || 'TBD'}

Create a realistic budget breakdown across categories:
- Technology & Equipment (hardware, software, licenses)
- Personnel & Consultants
- Operations & Maintenance
- Data Collection & Analysis
- Training & Capacity Building
- Marketing & Communication
- Contingency (10-15%)

Ensure total equals ${formData.budget}. Return JSON array with: category, amount, description`,
                        response_json_schema: {
                          type: "object",
                          properties: {
                            budget_breakdown: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  category: { type: "string" },
                                  amount: { type: "number" },
                                  description: { type: "string" }
                                }
                              }
                            },
                            funding_sources: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  source: { type: "string" },
                                  amount: { type: "number" },
                                  confirmed: { type: "boolean" }
                                }
                              }
                            }
                          }
                        }
                      });
                      if (response.success) {
                        setFormData(prev => ({ 
                          ...prev, 
                          budget_breakdown: response.data?.budget_breakdown,
                          funding_sources: response.data?.funding_sources 
                        }));
                        toast.success('AI optimized budget allocation');
                      }
                    } catch (error) {
                      toast.error('Failed to optimize budget: ' + error.message);
                    }
                  }}
                  disabled={isAIProcessing || !formData.budget}
                >
                  {isAIProcessing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Optimizing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> AI Budget Optimizer</>
                  )}
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Budget Breakdown | تفاصيل الميزانية</Label>
                  <Button size="sm" variant="outline" onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      budget_breakdown: [...(prev.budget_breakdown || []), { category: '', amount: 0, description: '' }]
                    }));
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                {formData.budget_breakdown?.map((item, idx) => (
                  <Card key={idx} className="p-3 bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <Input
                          placeholder="Category"
                          value={item.category || ''}
                          onChange={(e) => {
                            const updated = [...formData.budget_breakdown];
                            updated[idx].category = e.target.value;
                            setFormData({...formData, budget_breakdown: updated});
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={item.amount || ''}
                          onChange={(e) => {
                            const updated = [...formData.budget_breakdown];
                            updated[idx].amount = parseFloat(e.target.value);
                            setFormData({...formData, budget_breakdown: updated});
                          }}
                        />
                        <Input
                          placeholder="Description"
                          value={item.description || ''}
                          onChange={(e) => {
                            const updated = [...formData.budget_breakdown];
                            updated[idx].description = e.target.value;
                            setFormData({...formData, budget_breakdown: updated});
                          }}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          budget_breakdown: prev.budget_breakdown.filter((_, i) => i !== idx)
                        }));
                      }}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Funding Sources | مصادر التمويل</Label>
                  <Button size="sm" variant="outline" onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      funding_sources: [...(prev.funding_sources || []), { source: '', amount: 0, confirmed: false }]
                    }));
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </div>
                {formData.funding_sources?.map((fs, idx) => (
                  <Card key={idx} className="p-3 bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <Input
                          placeholder="Source"
                          value={fs.source || ''}
                          onChange={(e) => {
                            const updated = [...formData.funding_sources];
                            updated[idx].source = e.target.value;
                            setFormData({...formData, funding_sources: updated});
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={fs.amount || ''}
                          onChange={(e) => {
                            const updated = [...formData.funding_sources];
                            updated[idx].amount = parseFloat(e.target.value);
                            setFormData({...formData, funding_sources: updated});
                          }}
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={fs.confirmed || false}
                            onChange={(e) => {
                              const updated = [...formData.funding_sources];
                              updated[idx].confirmed = e.target.checked;
                              setFormData({...formData, funding_sources: updated});
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">Confirmed</span>
                        </label>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          funding_sources: prev.funding_sources.filter((_, i) => i !== idx)
                        }));
                      }}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900">{t({ en: 'Pilot Media', ar: 'وسائط التجربة' })}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Pilot Image', ar: 'صورة التجربة' })}</Label>
                  <FileUploader
                    type="image"
                    label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                    maxSize={10}
                    enableImageSearch={true}
                    searchContext={formData.title_en || formData.description_en?.substring(0, 100)}
                    onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Pilot Video', ar: 'فيديو التجربة' })}</Label>
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
                <Label>{t({ en: 'Gallery Images', ar: 'معرض الصور' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Add to Gallery', ar: 'إضافة للمعرض' })}
                  maxSize={10}
                  onUploadComplete={(url) => {
                    setFormData(prev => ({
                      ...prev,
                      gallery_urls: [...(prev.gallery_urls || []), url]
                    }));
                  }}
                />
                {formData.gallery_urls?.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {formData.gallery_urls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 h-6 w-6"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              gallery_urls: prev.gallery_urls.filter((_, i) => i !== idx)
                            }));
                          }}
                        >
                          <X className="h-3 w-3 text-white" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags (comma separated) | الوسوم</Label>
                <Input
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  })}
                  placeholder="smart city, IoT, sustainability"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published || false}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_flagship || false}
                    onChange={(e) => setFormData({...formData, is_flagship: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Flagship</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_archived || false}
                    onChange={(e) => setFormData({...formData, is_archived: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Archived</span>
                </label>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900">{t({ en: 'Supporting Documents', ar: 'الوثائق الداعمة' })}</h3>
              <p className="text-sm text-slate-600">
                {t({ 
                  en: 'Upload proposals, technical specs, contracts, or other relevant documents', 
                  ar: 'رفع المقترحات، المواصفات الفنية، العقود، أو الوثائق الأخرى ذات الصلة' 
                })}
              </p>
              
              <div className="space-y-3">
                <FileUploader
                  type="document"
                  label={t({ en: 'Upload Document', ar: 'رفع وثيقة' })}
                  maxSize={50}
                  preview={false}
                  onUploadComplete={(url) => {
                    setFormData(prev => ({
                      ...prev,
                      documents: [...(prev.documents || []), {
                        name: 'Document ' + ((prev.documents?.length || 0) + 1),
                        url: url,
                        type: 'application/pdf',
                        uploaded_date: new Date().toISOString()
                      }]
                    }));
                  }}
                />

                {formData.documents && formData.documents.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>{t({ en: 'Uploaded Documents', ar: 'الوثائق المرفوعة' })}</Label>
                    {formData.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <Input
                            placeholder={t({ en: 'Document name', ar: 'اسم الوثيقة' })}
                            value={doc.name}
                            onChange={(e) => {
                              const updated = [...formData.documents];
                              updated[idx].name = e.target.value;
                              setFormData({ ...formData, documents: updated });
                            }}
                            className="mb-1"
                          />
                          <p className="text-xs text-slate-500">{new Date(doc.uploaded_date).toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              documents: prev.documents.filter((_, i) => i !== idx)
                            }));
                          }}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Review (was Step 6) */}
      {step === 7 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 6: Review & Submit | المراجعة والإرسال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">{t({ en: 'Basic Information', ar: 'المعلومات الأساسية' })}</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-slate-500">Pilot Code</Label>
                  <p className="font-mono">{formData.code}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Municipality | البلدية</Label>
                  <p>{municipalities.find(m => m.id === formData.municipality_id)?.name_en || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Sector | القطاع</Label>
                  <p className="capitalize">{formData.sector?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Stage | المرحلة</Label>
                  <p className="capitalize">{formData.stage}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Challenge</Label>
                  <p className="text-sm">{challenges.find(c => c.id === formData.challenge_id)?.code}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Solution</Label>
                  <p className="text-sm">{solutions.find(s => s.id === formData.solution_id)?.name_en || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Titles & Descriptions */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">{t({ en: 'Titles & Descriptions', ar: 'العناوين والأوصاف' })}</h3>
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-slate-500">Title (English)</Label>
                  <p className="text-lg font-medium">{formData.title_en}</p>
                </div>
                <div>
                  <Label className="text-slate-500">العنوان (عربي)</Label>
                  <p className="text-lg font-medium" dir="rtl">{formData.title_ar}</p>
                </div>
                {formData.tagline_en && (
                  <div>
                    <Label className="text-slate-500">Tagline</Label>
                    <p className="text-sm">{formData.tagline_en}</p>
                  </div>
                )}
                <div>
                  <Label className="text-slate-500">Description</Label>
                  <p className="text-sm text-slate-700 line-clamp-3">{formData.description_en}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</h3>
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-slate-500">Start Date</Label>
                  <p>{formData.start_date || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Duration</Label>
                  <p>{formData.duration_weeks} weeks</p>
                </div>
                <div>
                  <Label className="text-slate-500">End Date</Label>
                  <p>{formData.end_date || 'Not set'}</p>
                </div>
              </div>
              {formData.milestones.length > 0 && (
                <div className="mt-3 p-4 bg-slate-50 rounded-lg">
                  <Label className="text-slate-500">{formData.milestones.length} Milestones</Label>
                  <div className="mt-2 space-y-1">
                    {formData.milestones.slice(0, 3).map((m, i) => (
                      <div key={i} className="text-sm flex justify-between">
                        <span>{m.name}</span>
                        <span className="text-slate-500">{m.due_date}</span>
                      </div>
                    ))}
                    {formData.milestones.length > 3 && (
                      <p className="text-xs text-slate-500">+ {formData.milestones.length - 3} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* KPIs */}
            {formData.kpis.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">{t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })}</h3>
                <div className="space-y-2">
                  {formData.kpis.map((kpi, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm">
                      <p className="font-medium">{kpi.name}</p>
                      <div className="flex gap-4 mt-1 text-xs text-slate-600">
                        <span>Baseline: {kpi.baseline}</span>
                        <span>Target: {kpi.target}</span>
                        <span>Unit: {kpi.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sandbox & Safety */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">{t({ en: 'Sandbox & Compliance', ar: 'منطقة الاختبار والامتثال' })}</h3>
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <div>
                  <Label className="text-slate-500">Sandbox Zone</Label>
                  <p>{formData.sandbox_zone || 'Not specified'}</p>
                </div>
                {formData.safety_protocols.length > 0 && (
                  <div>
                    <Label className="text-slate-500">Safety Protocols</Label>
                    <p className="text-sm">{formData.safety_protocols.length} items verified</p>
                  </div>
                )}
                {formData.regulatory_exemptions.length > 0 && (
                  <div>
                    <Label className="text-slate-500">Regulatory Exemptions</Label>
                    <p className="text-sm">{formData.regulatory_exemptions.length} exemptions requested</p>
                  </div>
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{formData.kpis.length}</div>
                <div className="text-xs text-slate-500">KPIs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formData.success_probability}%</div>
                <div className="text-xs text-slate-500">Success Probability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formData.budget ? formData.budget.toLocaleString() : '0'}</div>
                <div className="text-xs text-slate-500">Budget ({formData.budget_currency})</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">TRL {formData.trl_start} → {formData.trl_target}</div>
                <div className="text-xs text-slate-500">Technology Level</div>
              </div>
            </div>

            {/* Documents & Media */}
            {(formData.image_url || formData.video_url || formData.documents?.length > 0) && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">{t({ en: 'Media & Documents', ar: 'الوسائط والوثائق' })}</h3>
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                  {formData.image_url && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">✓</div>
                      <div className="text-xs text-slate-500">Image Uploaded</div>
                    </div>
                  )}
                  {formData.video_url && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">✓</div>
                      <div className="text-xs text-slate-500">Video Uploaded</div>
                    </div>
                  )}
                  {formData.documents?.length > 0 && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{formData.documents.length}</div>
                      <div className="text-xs text-slate-500">Documents</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warning if missing critical fields */}
            {(!formData.title_en || !formData.challenge_id || !formData.municipality_id) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900 font-medium">
                  ⚠️ {t({ en: 'Some required fields are missing:', ar: 'بعض الحقول المطلوبة مفقودة:' })}
                </p>
                <ul className="text-sm text-amber-800 mt-2 space-y-1">
                  {!formData.title_en && <li>• Title (English)</li>}
                  {!formData.challenge_id && <li>• Related Challenge</li>}
                  {!formData.municipality_id && <li>• Municipality</li>}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Previous', ar: 'السابق' })}
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          {step < 7 ? (
            <Button
              onClick={() => {
                // Block progression from step 1 if solution selected but not verified
                if (step === 1 && formData.solution_id && !readinessChecked) {
                  toast.error(t({ en: 'Please complete solution readiness check first', ar: 'يرجى إكمال فحص جاهزية الحل أولاً' }));
                  return;
                }
                setStep(step + 1);
              }}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {t({ en: 'Next', ar: 'التالي' })}
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                  {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
                </>
              ) : (
                <>
                  <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Submit Pilot', ar: 'إرسال التجربة' })}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(PilotCreatePage, {
  requiredPermissions: ['pilot_create']
});