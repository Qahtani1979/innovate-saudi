import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Save, Loader2, Sparkles, X, Eye, EyeOff, Target } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import CollaborativeEditing from '../components/CollaborativeEditing';
import { createNotification } from '../components/AutoNotification';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { FileText } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function ChallengeEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const challengeId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!challengeId
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data } = await supabase.from('regions').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data } = await supabase.from('cities').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data } = await supabase.from('sectors').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: subsectors = [] } = useQuery({
    queryKey: ['subsectors'],
    queryFn: async () => {
      const { data } = await supabase.from('subsectors').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await supabase.from('services').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [newStakeholder, setNewStakeholder] = useState({ name: '', role: '', involvement: '' });
  const [newEvidence, setNewEvidence] = useState({ type: '', source: '', value: '', date: '' });
  const [newConstraint, setNewConstraint] = useState({ type: '', description: '' });

  React.useEffect(() => {
    if (challenge && !formData) {
      setFormData(challenge);
      setOriginalData(challenge);
    }
  }, [challenge]);

  // Auto-save to localStorage every 30 seconds
  React.useEffect(() => {
    if (!formData || !challengeId) return;

    const autoSaveInterval = setInterval(() => {
      localStorage.setItem(`challenge_edit_${challengeId}`, JSON.stringify(formData));
      localStorage.setItem(`challenge_edit_${challengeId}_timestamp`, new Date().toISOString());
      console.log('Auto-saved to localStorage');
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData, challengeId]);

  // Load auto-saved data on mount
  React.useEffect(() => {
    if (!challengeId || formData) return;

    const saved = localStorage.getItem(`challenge_edit_${challengeId}`);
    const timestamp = localStorage.getItem(`challenge_edit_${challengeId}_timestamp`);

    if (saved && timestamp) {
      const savedDate = new Date(timestamp);
      const now = new Date();
      const hoursDiff = (now - savedDate) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        const savedData = JSON.parse(saved);
        if (confirm(t({
          en: `Auto-saved data found from ${savedDate.toLocaleString()}. Restore?`,
          ar: `تم العثور على بيانات محفوظة من ${savedDate.toLocaleString()}. استعادة؟`
        }))) {
          setFormData(savedData);
        }
      }
    }
  }, [challengeId]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const oldStatus = challenge.status;

      // Track changes
      const changes = getChangedFields(originalData, data);
      const newVersion = (challenge.version_number || 1) + 1;

      const { error: updateError } = await supabase
        .from('challenges')
        .update({
          ...data,
          version_number: newVersion,
          previous_version_id: challengeId
        })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      // Log change activity
      if (changes.length > 0) {
        await supabase.from('challenge_activities').insert({
          challenge_id: challengeId,
          activity_type: 'updated',
          activity_category: 'data_change',
          description: `Updated ${changes.length} field(s): ${changes.map(c => c.field).join(', ')}`,
          metadata: { changes },
          timestamp: new Date().toISOString()
        });
      }

      if (data.status && data.status !== oldStatus) {
        await createNotification({
          title: 'Challenge Status Updated',
          body: `${challenge.code} status changed from ${oldStatus} to ${data.status}`,
          type: 'alert',
          priority: 'medium',
          linkUrl: `ChallengeDetail?id=${challengeId}`,
          entityType: 'challenge',
          entityId: challengeId
        });
      }

      // Clear auto-save
      localStorage.removeItem(`challenge_edit_${challengeId}`);
      localStorage.removeItem(`challenge_edit_${challengeId}_timestamp`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge', challengeId]);
      // Auto-generate embedding if content changed
      supabase.functions.invoke('generateEmbeddings', {
        body: {
          entity_name: 'Challenge',
          mode: 'missing'
        }
      }).catch(err => console.error('Embedding generation failed:', err));
      toast.success('Challenge updated');
      navigate(createPageUrl(`ChallengeDetail?id=${challengeId}`));
    }
  });

  // Helper to detect changed fields
  const getChangedFields = (original, updated) => {
    const changes = [];
    const fieldsToTrack = [
      'title_en', 'title_ar', 'description_en', 'description_ar',
      'sector', 'priority', 'status', 'challenge_owner_email',
      'budget_estimate', 'timeline_estimate', 'severity_score', 'impact_score'
    ];

    fieldsToTrack.forEach(field => {
      if (original[field] !== updated[field]) {
        changes.push({
          field,
          old_value: original[field],
          new_value: updated[field]
        });
      }
    });

    return changes;
  };

  const handleAIEnhancement = async () => {
    if (!formData.description_en && !formData.title_en) {
      toast.error(language === 'ar' ? 'يرجى إدخال العنوان أو الوصف أولاً' : 'Please enter a title or description first');
      return;
    }

    try {
      const prompt = `
        Analyze this Saudi municipal challenge and provide COMPLETE BILINGUAL (Arabic + English) structured output covering ALL fields.
        
        Current data:
        Title EN: ${formData.title_en}
        Title AR: ${formData.title_ar}
        Description EN: ${formData.description_en}
        Description AR: ${formData.description_ar}
        Problem EN: ${formData.problem_statement_en}
        Problem AR: ${formData.problem_statement_ar}
        Current EN: ${formData.current_situation_en}
        Current AR: ${formData.current_situation_ar}
        Desired EN: ${formData.desired_outcome_en}
        Desired AR: ${formData.desired_outcome_ar}
        Sector: ${formData.sector}
        Municipality: ${formData.municipality_id}
        
        Available Sectors:
        ${sectors.map(s => `- ID: ${s.id}, Code: ${s.code}, EN: ${s.name_en}, AR: ${s.name_ar || ''}`).join('\n')}
        
        Available Subsectors:
        ${subsectors.map(ss => `- ID: ${ss.id}, Sector: ${ss.sector_id}, EN: ${ss.name_en}, AR: ${ss.name_ar || ''}`).join('\n')}
        
        Available Services:
        ${services.slice(0, 50).map(svc => `- ID: ${svc.id}, EN: ${svc.name_en}, AR: ${svc.name_ar || ''}`).join('\n')}
        
        Generate COMPLETE enhancement for ALL fields:
        1. Titles (AR + EN) - concise, professional
        2. Taglines (AR + EN) - one-liner summary
        3. Descriptions (AR + EN) - detailed 250+ words each, Saudi municipal terminology
        4. Problem Statements (AR + EN) - clear, specific
        5. Current Situations (AR + EN) - factual status
        6. Desired Outcomes (AR + EN) - measurable goal
        7. Root Cause single (AR + EN) - main underlying issue
        8. Root Causes array (4-6 specific causes) - bilingual
        9. **Sector ID** - select BEST MATCH from available sectors list above
        10. **Subsector ID** - select BEST MATCH from available subsectors for that sector
        11. **Service ID** - select most relevant affected service from list above
        12. Affected Services array (2-4 service names)
        13. Severity score (0-100) - criticality
        14. Impact score (0-100) - population affected
        12. Overall score - calculated
        13. Affected Population (size: number, demographics: string, location: string)
        14. Affected Population Size - number
        15. KPIs (4 KPIs with bilingual names, baseline, target, unit)
        16. Stakeholders (3-5 with name, role, involvement)
        17. Data Evidence (2-4 with type, source, value, date)
        18. Constraints (2-3 with type, description)
        19. Keywords (8-12 bilingual AR/EN terms)
        20. Theme category
        21. Challenge Type (service_quality/infrastructure/etc)
        22. Category - specific subcategory
        23. Priority tier (1=critical, 2=high, 3=medium, 4=low)
        24. Track recommendation (pilot/r_and_d/program/procurement/policy)
        25. Budget Estimate (SAR)
        26. Timeline Estimate (weeks/months)
        27. Ministry Service
        28. Responsible Agency
        29. Department
        30. Strategic Goal alignment
        
        Use Saudi municipal context, real data intelligence, and best practices.
      `;

      const aiResult = await invokeAI({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            refined_title_en: { type: 'string' },
            refined_title_ar: { type: 'string' },
            refined_tagline_en: { type: 'string' },
            refined_tagline_ar: { type: 'string' },
            improved_description_en: { type: 'string' },
            improved_description_ar: { type: 'string' },
            problem_statement_en: { type: 'string' },
            problem_statement_ar: { type: 'string' },
            current_situation_en: { type: 'string' },
            current_situation_ar: { type: 'string' },
            desired_outcome_en: { type: 'string' },
            desired_outcome_ar: { type: 'string' },
            root_cause_en: { type: 'string' },
            root_cause_ar: { type: 'string' },
            root_causes: { type: 'array', items: { type: 'string' } },
            sector_id: { type: 'string' },
            subsector_id: { type: 'string' },
            service_id: { type: 'string' },
            affected_services: { type: 'array', items: { type: 'string' } },
            severity_score: { type: 'number' },
            impact_score: { type: 'number' },
            affected_population: {
              type: 'object',
              properties: {
                size: { type: 'number' },
                demographics: { type: 'string' },
                location: { type: 'string' }
              }
            },
            affected_population_size: { type: 'number' },
            keywords: { type: 'array', items: { type: 'string' } },
            kpis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  baseline: { type: 'string' },
                  target: { type: 'string' }
                }
              }
            },
            stakeholders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string' },
                  involvement: { type: 'string' }
                }
              }
            },
            data_evidence: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  source: { type: 'string' },
                  value: { type: 'string' },
                  date: { type: 'string' }
                }
              }
            },
            constraints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            theme: { type: 'string' },
            category: { type: 'string' },
            challenge_type: { type: 'string' },
            priority_tier: { type: 'number' },
            tracks: { type: 'array', items: { type: 'string' } },
            budget_estimate: { type: 'number' },
            timeline_estimate: { type: 'string' },
            ministry_service: { type: 'string' },
            responsible_agency: { type: 'string' },
            department: { type: 'string' },
            strategic_goal: { type: 'string' }
          }
        }
      });

      if (aiResult.success) {
        const result = aiResult.data;
        setFormData(prev => ({
          ...prev,
          title_en: result.refined_title_en || prev.title_en,
          title_ar: result.refined_title_ar || prev.title_ar,
          tagline_en: result.refined_tagline_en || prev.tagline_en,
          tagline_ar: result.refined_tagline_ar || prev.tagline_ar,
          description_en: result.improved_description_en || prev.description_en,
          description_ar: result.improved_description_ar || prev.description_ar,
          problem_statement_en: result.problem_statement_en || prev.problem_statement_en,
          problem_statement_ar: result.problem_statement_ar || prev.problem_statement_ar,
          current_situation_en: result.current_situation_en || prev.current_situation_en,
          current_situation_ar: result.current_situation_ar || prev.current_situation_ar,
          desired_outcome_en: result.desired_outcome_en || prev.desired_outcome_en,
          desired_outcome_ar: result.desired_outcome_ar || prev.desired_outcome_ar,
          root_cause_en: result.root_cause_en || prev.root_cause_en,
          root_cause_ar: result.root_cause_ar || prev.root_cause_ar,
          root_causes: result.root_causes || prev.root_causes || [],
          sector_id: result.sector_id || prev.sector_id,
          subsector_id: result.subsector_id || prev.subsector_id,
          service_id: result.service_id || prev.service_id,
          sector: result.sector_id ? sectors.find(s => s.id === result.sector_id)?.code : prev.sector,
          sub_sector: result.subsector_id ? subsectors.find(ss => ss.id === result.subsector_id)?.name_en : prev.sub_sector,
          affected_services: result.affected_services || prev.affected_services || [],
          keywords: result.keywords || prev.keywords || [],
          severity_score: result.severity_score || prev.severity_score,
          impact_score: result.impact_score || prev.impact_score,
          overall_score: Math.round(((result.severity_score || prev.severity_score) + (result.impact_score || prev.impact_score)) / 2),
          affected_population: result.affected_population || prev.affected_population,
          affected_population_size: result.affected_population_size || result.affected_population?.size || prev.affected_population_size,
          kpis: result.kpis || prev.kpis || [],
          stakeholders: result.stakeholders || prev.stakeholders || [],
          data_evidence: result.data_evidence || prev.data_evidence || [],
          constraints: result.constraints || prev.constraints || [],
          theme: result.theme || prev.theme,
          category: result.category || prev.category,
          challenge_type: result.challenge_type || prev.challenge_type,
          priority: `tier_${result.priority_tier || 3}`,
          tracks: result.tracks || prev.tracks || [],
          budget_estimate: result.budget_estimate || prev.budget_estimate,
          timeline_estimate: result.timeline_estimate || prev.timeline_estimate,
          ministry_service: result.ministry_service || prev.ministry_service,
          responsible_agency: result.responsible_agency || prev.responsible_agency,
          department: result.department || prev.department,
          strategic_goal: result.strategic_goal || prev.strategic_goal,
          ai_summary: result.improved_description_en?.substring(0, 200) + '...',
          ai_suggestions: result
        }));
        toast.success(language === 'ar' ? '✨ تم التحسين بنجاح!' : '✨ AI enhancement complete!');
      }
    } catch (error) {
      toast.error(language === 'ar' ? '❌ فشل التحسين الذكي' : '❌ AI enhancement failed');
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const sectorOptions = ['urban_design', 'transport', 'environment', 'digital_services', 'health', 'education', 'safety'];

  return (
    <PageLayout className="max-w-4xl mx-auto">
      <PageHeader
        icon={Target}
        title={{ en: 'Edit Challenge', ar: 'تعديل التحدي' }}
        description={formData.code}
        action={
          <Button onClick={() => setPreviewMode(!previewMode)} variant="outline" className="gap-2">
            {previewMode ? <><EyeOff className="h-4 w-4" />{t({ en: 'Exit Preview', ar: 'إنهاء المعاينة' })}</> : <><Eye className="h-4 w-4" />{t({ en: 'Preview', ar: 'معاينة' })}</>}
          </Button>
        }
      />
      <CollaborativeEditing entityId={challengeId} entityType="Challenge" />

      {previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Preview Mode', ar: 'وضع المعاينة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold">{formData.title_en}</h2>
              {formData.title_ar && <h3 className="text-xl text-slate-600" dir="rtl">{formData.title_ar}</h3>}

              {formData.tagline_en && <p className="text-lg italic text-slate-600">{formData.tagline_en}</p>}

              <div className="mt-4">
                <h4 className="font-semibold">Description</h4>
                <p className="whitespace-pre-wrap">{formData.description_en}</p>
                {formData.description_ar && <p className="whitespace-pre-wrap mt-2" dir="rtl">{formData.description_ar}</p>}
              </div>

              {formData.problem_statement_en && (
                <div className="mt-4">
                  <h4 className="font-semibold">Problem Statement</h4>
                  <p className="whitespace-pre-wrap">{formData.problem_statement_en}</p>
                </div>
              )}

              {formData.image_url && (
                <img src={formData.image_url} alt="Challenge" className="w-full rounded-lg mt-4" />
              )}

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Severity Score</p>
                  <p className="text-2xl font-bold text-red-600">{formData.severity_score || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Impact Score</p>
                  <p className="text-2xl font-bold text-blue-600">{formData.impact_score || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                {t({ en: 'Back to Edit', ar: 'رجوع للتعديل' })}
              </Button>
              <Button
                onClick={() => updateMutation.mutate(formData)}
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t({ en: 'Challenge Details', ar: 'تفاصيل التحدي' })}</span>
              <Button
                onClick={handleAIEnhancement}
                disabled={isAIProcessing}
                variant="outline"
                className="gap-2"
              >
                {isAIProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t({ en: 'AI Processing...', ar: 'معالجة ذكية...' })}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    {t({ en: 'Enhance with AI', ar: 'تحسين بالذكاء الاصطناعي' })}
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title (English)</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>العنوان (عربي)</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tagline (English)</Label>
                <Input
                  value={formData.tagline_en || ''}
                  onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                  placeholder="Brief one-liner"
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline (Arabic)</Label>
                <Input
                  value={formData.tagline_ar || ''}
                  onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })}
                  placeholder="ملخص قصير"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف (عربي)</Label>
              <Textarea
                value={formData.description_ar || ''}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={4}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Problem Statement (English)</Label>
                <Textarea
                  value={formData.problem_statement_en || ''}
                  onChange={(e) => setFormData({ ...formData, problem_statement_en: e.target.value })}
                  rows={3}
                  placeholder="Clear problem statement"
                />
              </div>
              <div className="space-y-2">
                <Label>بيان المشكلة (عربي)</Label>
                <Textarea
                  value={formData.problem_statement_ar || ''}
                  onChange={(e) => setFormData({ ...formData, problem_statement_ar: e.target.value })}
                  rows={3}
                  placeholder="بيان واضح للمشكلة"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Situation (English)</Label>
                <Textarea
                  value={formData.current_situation_en || ''}
                  onChange={(e) => setFormData({ ...formData, current_situation_en: e.target.value })}
                  rows={2}
                  placeholder="What is happening now"
                />
              </div>
              <div className="space-y-2">
                <Label>الوضع الحالي (عربي)</Label>
                <Textarea
                  value={formData.current_situation_ar || ''}
                  onChange={(e) => setFormData({ ...formData, current_situation_ar: e.target.value })}
                  rows={2}
                  placeholder="ما يحدث الآن"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desired Outcome (English)</Label>
                <Textarea
                  value={formData.desired_outcome_en || ''}
                  onChange={(e) => setFormData({ ...formData, desired_outcome_en: e.target.value })}
                  rows={2}
                  placeholder="What should be achieved"
                />
              </div>
              <div className="space-y-2">
                <Label>النتيجة المرغوبة (عربي)</Label>
                <Textarea
                  value={formData.desired_outcome_ar || ''}
                  onChange={(e) => setFormData({ ...formData, desired_outcome_ar: e.target.value })}
                  rows={2}
                  placeholder="ما يجب تحقيقه"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Root Cause (English)</Label>
                <Textarea
                  value={formData.root_cause_en || ''}
                  onChange={(e) => setFormData({ ...formData, root_cause_en: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>السبب الجذري (عربي)</Label>
                <Textarea
                  value={formData.root_cause_ar || ''}
                  onChange={(e) => setFormData({ ...formData, root_cause_ar: e.target.value })}
                  rows={2}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Theme (الثيم)</Label>
                <Input
                  value={formData.theme || ''}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Challenge Type (نوع التحدي)</Label>
                <Select
                  value={formData.challenge_type || 'other'}
                  onValueChange={(v) => setFormData({ ...formData, challenge_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_quality">Service Quality</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="digital_transformation">Digital Transformation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sector (القطاع)</Label>
                <Select
                  value={formData.sector_id}
                  onValueChange={(value) => {
                    const sector = sectors.find(s => s.id === value);
                    setFormData({ ...formData, sector_id: value, sector: sector?.code, subsector_id: '' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
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
                <Label>Subsector (القطاع الفرعي)</Label>
                <Select
                  value={formData.subsector_id}
                  onValueChange={(value) => {
                    const subsector = subsectors.find(ss => ss.id === value);
                    setFormData({ ...formData, subsector_id: value, sub_sector: subsector?.name_en });
                  }}
                  disabled={!formData.sector_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.sector_id ? "Select subsector" : "Select sector first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subsectors.filter(ss => ss.sector_id === formData.sector_id).map(ss => (
                      <SelectItem key={ss.id} value={ss.id}>
                        {language === 'ar' && ss.name_ar ? ss.name_ar : ss.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Primary Affected Service (الخدمة المتأثرة الرئيسية)</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) => setFormData({ ...formData, service_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select affected service (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(svc => (
                    <SelectItem key={svc.id} value={svc.id}>
                      {language === 'ar' && svc.name_ar ? svc.name_ar : svc.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ministry Service (الخدمة من الوزارة)</Label>
                <Input
                  value={formData.ministry_service || ''}
                  onChange={(e) => setFormData({ ...formData, ministry_service: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Responsible Agency (الوكالة)</Label>
                <Input
                  value={formData.responsible_agency || ''}
                  onChange={(e) => setFormData({ ...formData, responsible_agency: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department (الإدارة)</Label>
                <Input
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Challenge Owner Name</Label>
                <Input
                  value={formData.challenge_owner || ''}
                  onChange={(e) => setFormData({ ...formData, challenge_owner: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Challenge Owner Email</Label>
                <Input
                  type="email"
                  value={formData.challenge_owner_email || ''}
                  onChange={(e) => setFormData({ ...formData, challenge_owner_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Affected Population Size</Label>
                <Input
                  type="number"
                  value={formData.affected_population_size || ''}
                  onChange={(e) => setFormData({ ...formData, affected_population_size: parseInt(e.target.value) || null })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Estimate (SAR)</Label>
                <Input
                  type="number"
                  value={formData.budget_estimate || ''}
                  onChange={(e) => setFormData({ ...formData, budget_estimate: parseFloat(e.target.value) || null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Timeline Estimate</Label>
                <Input
                  value={formData.timeline_estimate || ''}
                  onChange={(e) => setFormData({ ...formData, timeline_estimate: e.target.value })}
                  placeholder="e.g., 6 months"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Stakeholders</h3>
              {formData.stakeholders?.map((s, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input value={s.name} disabled className="flex-1" />
                  <Input value={s.role} disabled className="flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => {
                    setFormData({ ...formData, stakeholders: formData.stakeholders.filter((_, i) => i !== idx) });
                  }}>×</Button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Input placeholder="Name" value={newStakeholder.name} onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })} />
                <Input placeholder="Role" value={newStakeholder.role} onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })} />
                <Button size="sm" onClick={() => {
                  if (newStakeholder.name) {
                    setFormData({ ...formData, stakeholders: [...(formData.stakeholders || []), newStakeholder] });
                    setNewStakeholder({ name: '', role: '', involvement: '' });
                  }
                }}>+</Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Data Evidence</h3>
              {formData.data_evidence?.map((e, idx) => (
                <div key={idx} className="flex gap-2 mb-2 text-sm">
                  <Input value={e.type} disabled className="flex-1" />
                  <Input value={e.value} disabled className="flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => {
                    setFormData({ ...formData, data_evidence: formData.data_evidence.filter((_, i) => i !== idx) });
                  }}>×</Button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Input placeholder="Type" value={newEvidence.type} onChange={(e) => setNewEvidence({ ...newEvidence, type: e.target.value })} />
                <Input placeholder="Value" value={newEvidence.value} onChange={(e) => setNewEvidence({ ...newEvidence, value: e.target.value })} />
                <Input placeholder="Source" value={newEvidence.source} onChange={(e) => setNewEvidence({ ...newEvidence, source: e.target.value })} />
                <Button size="sm" onClick={() => {
                  if (newEvidence.type && newEvidence.value) {
                    setFormData({ ...formData, data_evidence: [...(formData.data_evidence || []), newEvidence] });
                    setNewEvidence({ type: '', source: '', value: '', date: '' });
                  }
                }}>+</Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Constraints</h3>
              {formData.constraints?.map((c, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input value={c.type} disabled className="w-32" />
                  <Input value={c.description} disabled className="flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => {
                    setFormData({ ...formData, constraints: formData.constraints.filter((_, i) => i !== idx) });
                  }}>×</Button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Input placeholder="Type" value={newConstraint.type} onChange={(e) => setNewConstraint({ ...newConstraint, type: e.target.value })} className="w-32" />
                <Input placeholder="Description" value={newConstraint.description} onChange={(e) => setNewConstraint({ ...newConstraint, description: e.target.value })} className="flex-1" />
                <Button size="sm" onClick={() => {
                  if (newConstraint.type) {
                    setFormData({ ...formData, constraints: [...(formData.constraints || []), newConstraint] });
                    setNewConstraint({ type: '', description: '' });
                  }
                }}>+</Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tier_1">Tier 1 (Highest)</SelectItem>
                    <SelectItem value="tier_2">Tier 2</SelectItem>
                    <SelectItem value="tier_3">Tier 3</SelectItem>
                    <SelectItem value="tier_4">Tier 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status (Workflow-Controlled) 🔒</Label>
                <Input
                  value={formData.status}
                  disabled
                  className="bg-slate-100 text-slate-600"
                />
                <p className="text-xs text-slate-500">Status controlled by workflows, not editable here</p>
              </div>

              <div className="space-y-2">
                <Label>Treatment Tracks (Multiple)</Label>
                <div className="border rounded-lg p-3 space-y-2">
                  {['pilot', 'r_and_d', 'program', 'procurement', 'policy'].map(track => (
                    <label key={track} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.tracks?.includes(track)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...(formData.tracks || []), track]
                            : (formData.tracks || []).filter(t => t !== track);
                          setFormData({ ...formData, tracks: updated });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{track.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Source (مصدر التحدي)</Label>
                <Input
                  value={formData.source || ''}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Strategic Goal (الهدف الاستراتيجي)</Label>
                <Input
                  value={formData.strategic_goal || ''}
                  onChange={(e) => setFormData({ ...formData, strategic_goal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category (الفئة)</Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Specific category"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Region</Label>
                <Select
                  value={formData.region_id || ''}
                  onValueChange={(val) => {
                    const selectedRegion = regions.find(r => r.id === val);
                    setFormData({
                      ...formData,
                      region_id: val,
                      coordinates: selectedRegion?.coordinates || formData.coordinates
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
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
                <Label>City</Label>
                <Select
                  value={formData.city_id || ''}
                  onValueChange={(val) => {
                    const selectedCity = cities.find(c => c.id === val);
                    setFormData({
                      ...formData,
                      city_id: val,
                      region_id: selectedCity?.region_id || formData.region_id,
                      coordinates: selectedCity?.coordinates || formData.coordinates
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.filter(c => !formData.region_id || c.region_id === formData.region_id).map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {language === 'ar' && c.name_ar ? c.name_ar : c.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Coordinates (Auto-filled from City/Region)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="Latitude"
                  value={formData.coordinates?.latitude || ''}
                  onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, latitude: parseFloat(e.target.value) || null } })}
                />
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="Longitude"
                  value={formData.coordinates?.longitude || ''}
                  onChange={(e) => setFormData({ ...formData, coordinates: { ...formData.coordinates, longitude: parseFloat(e.target.value) || null } })}
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">🔒 Workflow-Controlled Fields (Read-Only)</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-slate-600">Entry Date</Label>
                  <p className="font-medium">{formData.entry_date || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Processing Date</Label>
                  <p className="font-medium">{formData.processing_date || 'Not started'}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Reviewer</Label>
                  <p className="font-medium">{formData.reviewer || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900">{t({ en: 'Media & Attachments', ar: 'الوسائط والمرفقات' })}</h3>

              <div className="space-y-2">
                <Label>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Challenge Image', ar: 'رفع صورة التحدي' })}
                  maxSize={10}
                  enableImageSearch={true}
                  searchContext={formData.title_en || formData.description_en?.substring(0, 100)}
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                />
                {formData.image_url && (
                  <div className="relative mt-2">
                    <img src={formData.image_url} alt="Current" className="w-full h-32 object-cover rounded" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 h-6 w-6"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                )}
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
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => navigate(createPageUrl(`ChallengeDetail?id=${challengeId}`))}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={() => updateMutation.mutate(formData)}
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Tracking Summary */}
      {originalData && (
        <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-600" />
              {t({ en: 'Change Summary', ar: 'ملخص التغييرات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const changes = getChangedFields(originalData, formData);
              if (changes.length === 0) {
                return <p className="text-sm text-slate-500">{t({ en: 'No changes yet', ar: 'لا توجد تغييرات بعد' })}</p>;
              }

              return (
                <div className="space-y-2">
                  {changes.map((change, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border text-xs">
                      <p className="font-semibold text-slate-900">{change.field}</p>
                      <p className="text-red-600">− {String(change.old_value || 'empty').substring(0, 50)}</p>
                      <p className="text-green-600">+ {String(change.new_value || 'empty').substring(0, 50)}</p>
                    </div>
                  ))}
                  <p className="text-xs text-slate-500 pt-2">{changes.length} field(s) changed</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(ChallengeEdit, {
  requiredPermissions: ['challenge_edit']
});