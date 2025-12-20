import { useState, useEffect } from 'react';
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
import { Save, Loader2, Sparkles, Plus, X, AlertTriangle, Eye, TestTube } from 'lucide-react';
import { createNotification } from '../components/AutoNotification';
import CollaborativeEditing from '../components/CollaborativeEditing';
import FileUploader from '../components/FileUploader';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { Badge } from "@/components/ui/badge";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useAuth } from '@/lib/AuthContext';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function PilotEditPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const pilotId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { invokeAI, status: aiStatus, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();
  
  const [previewMode, setPreviewMode] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [changedFields, setChangedFields] = useState([]);

  const { data: pilot, isLoading } = useQuery({
    queryKey: ['pilot', pilotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('id', pilotId)
        .eq('is_deleted', false)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!pilotId
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data } = await supabase.from('solutions').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: async () => {
      const { data } = await supabase.from('municipalities').select('*');
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

  const { data: livingLabs = [] } = useQuery({
    queryKey: ['livingLabs'],
    queryFn: async () => {
      const { data } = await supabase.from('living_labs').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes'],
    queryFn: async () => {
      const { data } = await supabase.from('sandboxes').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const [formData, setFormData] = useState(null);

  // Initialize form and auto-save recovery
  useEffect(() => {
    if (pilot && !formData) {
      setFormData(pilot);
      setOriginalData(pilot);
      
      // Check for auto-saved draft
      const autoSaveKey = `pilot-edit-${pilotId}`;
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        try {
          const { data, timestamp } = JSON.parse(saved);
          const hoursSince = (Date.now() - new Date(timestamp)) / (1000 * 60 * 60);
          if (hoursSince < 24) {
            const restore = window.confirm(
              language === 'en' 
                ? 'Auto-saved changes found. Restore?'
                : 'تم العثور على تغييرات محفوظة. استعادة؟'
            );
            if (restore) {
              setFormData(data);
            } else {
              localStorage.removeItem(autoSaveKey);
            }
          } else {
            localStorage.removeItem(autoSaveKey);
          }
        } catch (e) {
          localStorage.removeItem(autoSaveKey);
        }
      }
    }
  }, [pilot, pilotId, language]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!formData || !pilotId) return;
    
    const interval = setInterval(() => {
      localStorage.setItem(`pilot-edit-${pilotId}`, JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, pilotId]);

  // Detect changes
  useEffect(() => {
    if (originalData && formData) {
      const changed = [];
      const fields = ['title_en', 'title_ar', 'description_en', 'description_ar', 'hypothesis', 'methodology', 'scope', 'budget', 'stage'];
      fields.forEach(f => {
        if (JSON.stringify(originalData[f]) !== JSON.stringify(formData[f])) {
          changed.push(f);
        }
      });
      setChangedFields(changed);
    }
  }, [formData, originalData]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const oldStage = pilot.stage;
      
      // Increment version
      const updateData = {
        ...data,
        version_number: (pilot.version_number || 1) + 1,
        previous_version_id: pilot.id
      };
      
      const { error } = await supabase
        .from('pilots')
        .update(updateData)
        .eq('id', pilotId);
      if (error) throw error;
      
      // Log activity
      if (changedFields.length > 0) {
        await supabase.from('system_activities').insert({
          entity_type: 'pilot',
          entity_id: pilotId,
          activity_type: 'updated',
          description: `Updated ${changedFields.length} fields: ${changedFields.slice(0, 3).join(', ')}`,
          performed_by: user?.email,
          metadata: { changed_fields: changedFields }
        });
      }
      
      if (data.stage && data.stage !== oldStage) {
        await supabase.from('system_activities').insert({
          entity_type: 'pilot',
          entity_id: pilotId,
          activity_type: 'stage_changed',
          description: `Stage changed from ${oldStage} to ${data.stage}`,
          performed_by: user?.email,
          old_value: oldStage,
          new_value: data.stage
        });
        
        await createNotification({
          title: 'Pilot Stage Updated',
          body: `${pilot.code} moved from ${oldStage} to ${data.stage}`,
          type: 'alert',
          priority: 'medium',
          linkUrl: `PilotDetail?id=${pilotId}`,
          entityType: 'pilot',
          entityId: pilotId
        });
      }
      
      // Clear auto-save
      localStorage.removeItem(`pilot-edit-${pilotId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot', pilotId] });
      toast.success(t({ en: 'Pilot updated', ar: 'تم تحديث التجربة' }));
      navigate(createPageUrl(`PilotDetail?id=${pilotId}`));
    }
  });

  const handleSectionAIEnhance = async (section) => {
    setIsAIProcessing(true);
    try {
      const challenge = challenges.find(c => c.id === formData.challenge_id);
      const solution = solutions.find(s => s.id === formData.solution_id);
      const municipality = municipalities.find(m => m.id === formData.municipality_id);

      const baseContext = `
        CONTEXT - Pilot Information:
        Title: ${formData.title_en} | ${formData.title_ar || ''}
        Challenge: ${challenge?.title_en || 'N/A'}
        Solution: ${solution?.name_en || 'N/A'}
        Municipality: ${municipality?.name_en || 'N/A'}
        Sector: ${formData.sector}
        Stage: ${formData.stage}
        Description: ${formData.description_en?.substring(0, 200)}
        
        Generate BILINGUAL (Arabic + English) content for Saudi municipal innovation pilot.
      `;

      let prompt = '';
      let schema = {};

      if (section === 'technology') {
        prompt = `${baseContext}
        
        Current Stack: ${JSON.stringify(formData.technology_stack)}
        Solution: ${solution?.name_en}
        Budget: ${formData.budget}
        
        Recommend comprehensive technology stack (8-12 items) covering:
        - Hardware (sensors, devices, infrastructure)
        - Software (platforms, applications, tools)
        - Data & Analytics
        - Communication & Networking
        - Security & Compliance
        
        For each: category, technology, version, purpose`;
        
        schema = {
          type: 'object',
          properties: {
            technology_stack: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  technology: { type: 'string' },
                  version: { type: 'string' },
                  purpose: { type: 'string' }
                }
              }
            }
          }
        };
      } else if (section === 'engagement') {
        prompt = `${baseContext}
        
        Municipality: ${municipality?.name_en}
        Target Population: ${JSON.stringify(formData.target_population)}
        
        Generate public engagement strategy with:
        1. Realistic community session targets
        2. Feedback collection goals
        3. Expected satisfaction scores
        4. Anticipated media coverage (5-8 outlets with dates and sentiment)`;
        
        schema = {
          type: 'object',
          properties: {
            public_engagement: {
              type: 'object',
              properties: {
                community_sessions: { type: 'number' },
                feedback_collected: { type: 'number' },
                satisfaction_score: { type: 'number' }
              }
            },
            media_coverage: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  outlet: { type: 'string' },
                  date: { type: 'string' },
                  url: { type: 'string' },
                  sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] }
                }
              }
            }
          }
        };
      } else if (section === 'details') {
        prompt = `${baseContext}
        
        Current data:
        Title EN: ${formData.title_en}
        Title AR: ${formData.title_ar || ''}
        Description EN: ${formData.description_en || ''}
        Description AR: ${formData.description_ar || ''}
        Objective EN: ${formData.objective_en || ''}
        Objective AR: ${formData.objective_ar || ''}
        
        Enhance: refined titles, taglines, detailed descriptions (200+ words each), clear objectives, hypothesis, methodology, scope.`;
        
        schema = {
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
            hypothesis: { type: 'string' },
            methodology: { type: 'string' },
            scope: { type: 'string' }
          }
        };
      } else if (section === 'kpis') {
        prompt = `${baseContext}
        
        Generate 5-8 comprehensive KPIs with:
        - Bilingual names
        - Realistic baseline values
        - Ambitious but achievable targets
        - Appropriate units
        - Measurement frequency`;
        
        schema = {
          type: 'object',
          properties: {
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
            }
          }
        };
      } else if (section === 'timeline') {
        prompt = `${baseContext}
        
        Duration: ${formData.duration_weeks} weeks
        Start: ${formData.timeline?.pilot_start || 'TBD'}
        
        Generate 6-10 realistic milestones with:
        - Bilingual names and descriptions
        - Evenly distributed dates
        - Key deliverables (EN + AR arrays)`;
        
        schema = {
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
                  status: { type: 'string' }
                }
              }
            }
          }
        };
      } else if (section === 'risks') {
        prompt = `${baseContext}
        
        Generate 4-6 specific risks with:
        - Clear risk descriptions
        - Probability (low/medium/high)
        - Impact (low/medium/high)
        - Detailed mitigation strategies
        - Safety protocols (5-8 items)
        - Regulatory exemptions if needed`;
        
        schema = {
          type: 'object',
          properties: {
            risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  risk: { type: 'string' },
                  probability: { type: 'string' },
                  impact: { type: 'string' },
                  mitigation: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            },
            safety_protocols: { type: 'array', items: { type: 'string' } },
            regulatory_exemptions: { type: 'array', items: { type: 'string' } }
          }
        };
      } else if (section === 'evaluation') {
        prompt = `${baseContext}
        
        Current: TRL ${formData.trl_start || 4} → ${formData.trl_target || 7}
        
        Generate evaluation content:
        - Bilingual evaluation summaries (150+ words)
        - AI insights
        - Success probability (0-100)
        - Risk level assessment
        - Recommendation (scale/iterate/pivot/terminate/pending)`;
        
        schema = {
          type: 'object',
          properties: {
            evaluation_summary_en: { type: 'string' },
            evaluation_summary_ar: { type: 'string' },
            ai_insights: { type: 'string' },
            success_probability: { type: 'number' },
            risk_level: { type: 'string' },
            recommendation: { type: 'string' }
          }
        };
      }

      const result = await invokeAI({
        prompt,
        response_json_schema: schema
      });

      if (!result.success) {
        toast.error('AI enhancement failed');
        return;
      }

      if (section === 'technology') {
        setFormData(prev => ({ ...prev, technology_stack: result.data.technology_stack }));
      } else if (section === 'engagement') {
        setFormData(prev => ({ 
          ...prev, 
          public_engagement: result.data.public_engagement,
          media_coverage: result.data.media_coverage 
        }));
      } else {
        setFormData(prev => ({ ...prev, ...result.data }));
      }

      toast.success(`✨ ${section} enhanced successfully!`);
    } catch (error) {
      toast.error('AI enhancement failed: ' + error.message);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <PageLayout className="max-w-4xl mx-auto">
      <PageHeader
        icon={TestTube}
        title={{ en: 'Edit Pilot', ar: 'تعديل التجربة' }}
        description={formData?.code}
      />
      <CollaborativeEditing entityId={pilotId} entityType="Pilot" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Edit Pilot', ar: 'تعديل التجربة' })}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-600">{formData.code}</p>
            {changedFields.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700">
                {changedFields.length} {t({ en: 'changes', ar: 'تغيير' })}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              v{formData.version_number || 1}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💾 {t({ en: 'Auto-saving every 30 seconds', ar: 'الحفظ التلقائي كل 30 ثانية' })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? t({ en: 'Edit', ar: 'تعديل' }) : t({ en: 'Preview', ar: 'معاينة' })}
          </Button>
        </div>
      </div>

      {/* Changes Summary */}
      {changedFields.length > 0 && !previewMode && (
        <Card className="bg-amber-50 border-amber-300">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              {t({ en: 'Pending Changes', ar: 'التغييرات المعلقة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {changedFields.map(f => (
                <Badge key={f} variant="outline" className="text-xs">
                  {f.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t({ en: 'Pilot Details', ar: 'تفاصيل التجربة' })}</span>
            <Button
              onClick={() => handleSectionAIEnhance('details')}
              disabled={isAIProcessing}
              variant="outline"
              size="sm"
            >
              {isAIProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Enhancing...', ar: 'جاري التحسين...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'AI Enhance', ar: 'تحسين ذكي' })}
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
                onChange={(e) => setFormData({...formData, title_en: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان (عربي)</Label>
              <Input
                value={formData.title_ar || ''}
                onChange={(e) => setFormData({...formData, title_ar: e.target.value})}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tagline (English)</Label>
              <Input
                value={formData.tagline_en || ''}
                onChange={(e) => setFormData({...formData, tagline_en: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>الشعار (عربي)</Label>
              <Input
                value={formData.tagline_ar || ''}
                onChange={(e) => setFormData({...formData, tagline_ar: e.target.value})}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (English)</Label>
            <Textarea
              value={formData.description_en || ''}
              onChange={(e) => setFormData({...formData, description_en: e.target.value})}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>الوصف (عربي)</Label>
            <Textarea
              value={formData.description_ar || ''}
              onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
              rows={4}
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label>Objective (English)</Label>
            <Textarea
              value={formData.objective_en || ''}
              onChange={(e) => setFormData({...formData, objective_en: e.target.value})}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sector</Label>
              <Select
                value={formData.sector}
                onValueChange={(v) => setFormData({...formData, sector: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urban_design">Urban Design</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="digital_services">Digital Services</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="economic_development">Economic Development</SelectItem>
                  <SelectItem value="social_services">Social Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(v) => setFormData({...formData, stage: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="approval_pending">Approval Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="preparation">Preparation</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="evaluation">Evaluation</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scaled">Scaled</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>TRL Start</Label>
              <Input
                type="number"
                min="1"
                max="9"
                value={formData.trl_start || ''}
                onChange={(e) => setFormData({...formData, trl_start: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>TRL Current</Label>
              <Input
                type="number"
                min="1"
                max="9"
                value={formData.trl_current || ''}
                onChange={(e) => setFormData({...formData, trl_current: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>TRL Target</Label>
              <Input
                type="number"
                min="1"
                max="9"
                value={formData.trl_target || ''}
                onChange={(e) => setFormData({...formData, trl_target: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Related Challenge</Label>
              <Select
                value={formData.challenge_id || ''}
                onValueChange={(v) => setFormData({...formData, challenge_id: v})}
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
              <Label>Solution</Label>
              <Select
                value={formData.solution_id || ''}
                onValueChange={(v) => setFormData({...formData, solution_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select solution" />
                </SelectTrigger>
                <SelectContent>
                  {solutions.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Region | المنطقة</Label>
              <Select
                value={formData.region_id || ''}
                onValueChange={(v) => setFormData({...formData, region_id: v})}
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
                value={formData.city_id || ''}
                onValueChange={(v) => setFormData({...formData, city_id: v})}
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
                value={formData.municipality_id || ''}
                onValueChange={(v) => setFormData({...formData, municipality_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select municipality" />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name_en}
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
                value={formData.living_lab_id || 'none'}
                onValueChange={(v) => setFormData({...formData, living_lab_id: v === 'none' ? null : v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select living lab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {livingLabs.map(lab => (
                    <SelectItem key={lab.id} value={lab.id}>
                      {lab.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sandbox (Optional) | منطقة الاختبار</Label>
              <Select
                value={formData.sandbox_id || 'none'}
                onValueChange={(v) => setFormData({...formData, sandbox_id: v === 'none' ? null : v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sandbox" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {sandboxes.map(sb => (
                    <SelectItem key={sb.id} value={sb.id}>
                      {sb.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sub-Sector | القطاع الفرعي</Label>
            <Input
              value={formData.sub_sector || ''}
              onChange={(e) => setFormData({...formData, sub_sector: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Hypothesis (What is being tested)</Label>
            <Textarea
              value={formData.hypothesis || ''}
              onChange={(e) => setFormData({...formData, hypothesis: e.target.value})}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Methodology</Label>
            <Textarea
              value={formData.methodology || ''}
              onChange={(e) => setFormData({...formData, methodology: e.target.value})}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Scope</Label>
            <Textarea
              value={formData.scope || ''}
              onChange={(e) => setFormData({...formData, scope: e.target.value})}
              rows={2}
            />
          </div>

          <div className="border-t pt-6 space-y-4">
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
                  placeholder="e.g., Young professionals, families"
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
                  placeholder="e.g., Downtown area"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select
                value={formData.risk_level || 'medium'}
                onValueChange={(v) => setFormData({...formData, risk_level: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Success Probability (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.success_probability || ''}
                onChange={(e) => setFormData({...formData, success_probability: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Recommendation</Label>
              <Select
                value={formData.recommendation || 'pending'}
                onValueChange={(v) => setFormData({...formData, recommendation: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scale">Scale</SelectItem>
                  <SelectItem value="iterate">Iterate</SelectItem>
                  <SelectItem value="pivot">Pivot</SelectItem>
                  <SelectItem value="terminate">Terminate</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (weeks)</Label>
              <Input
                type="number"
                value={formData.duration_weeks || ''}
                onChange={(e) => setFormData({...formData, duration_weeks: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sandbox Zone</Label>
            <Input
              value={formData.sandbox_zone || ''}
              onChange={(e) => setFormData({...formData, sandbox_zone: e.target.value})}
              placeholder="e.g., Downtown District A"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t({ en: 'Timeline & Milestones', ar: 'الجدول الزمني والمعالم' })}</span>
            <Button
              onClick={() => handleSectionAIEnhance('timeline')}
              disabled={isAIProcessing || !formData.timeline?.pilot_start}
              variant="outline"
              size="sm"
            >
              {isAIProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  {t({ en: 'AI Generate', ar: 'إنشاء ذكي' })}
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pilot Start Date</Label>
              <Input
                type="date"
                value={formData.timeline?.pilot_start || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  timeline: {...(formData.timeline || {}), pilot_start: e.target.value}
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pilot End Date</Label>
              <Input
                type="date"
                value={formData.timeline?.pilot_end || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  timeline: {...(formData.timeline || {}), pilot_end: e.target.value}
                })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Milestones</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    milestones: [...(prev.milestones || []), {
                      name: '',
                      name_ar: '',
                      due_date: '',
                      status: 'pending',
                      deliverables: [],
                      deliverables_ar: []
                    }]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
            {formData.milestones?.map((milestone, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Milestone name (EN)"
                        value={milestone.name || ''}
                        onChange={(e) => {
                          const updated = [...formData.milestones];
                          updated[idx].name = e.target.value;
                          setFormData({...formData, milestones: updated});
                        }}
                      />
                      <Input
                        placeholder="اسم المعلم (عربي)"
                        value={milestone.name_ar || ''}
                        onChange={(e) => {
                          const updated = [...formData.milestones];
                          updated[idx].name_ar = e.target.value;
                          setFormData({...formData, milestones: updated});
                        }}
                        dir="rtl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="date"
                        value={milestone.due_date || ''}
                        onChange={(e) => {
                          const updated = [...formData.milestones];
                          updated[idx].due_date = e.target.value;
                          setFormData({...formData, milestones: updated});
                        }}
                      />
                      <Select
                        value={milestone.status || 'pending'}
                        onValueChange={(v) => {
                          const updated = [...formData.milestones];
                          updated[idx].status = v;
                          setFormData({...formData, milestones: updated});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        milestones: prev.milestones.filter((_, i) => i !== idx)
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t({ en: 'KPIs & Success Criteria', ar: 'مؤشرات الأداء ومعايير النجاح' })}</span>
            <Button
              onClick={() => handleSectionAIEnhance('kpis')}
              disabled={isAIProcessing}
              variant="outline"
              size="sm"
            >
              {isAIProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  {t({ en: 'AI Suggest', ar: 'اقتراح ذكي' })}
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Key Performance Indicators</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    kpis: [...(prev.kpis || []), { name: '', baseline: '', target: '', unit: '' }]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add KPI
              </Button>
            </div>
            {formData.kpis?.map((kpi, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <Input
                      placeholder="KPI Name"
                      value={kpi.name || ''}
                      onChange={(e) => {
                        const updated = [...formData.kpis];
                        updated[idx].name = e.target.value;
                        setFormData({...formData, kpis: updated});
                      }}
                    />
                    <Input
                      placeholder="Baseline"
                      value={kpi.baseline || ''}
                      onChange={(e) => {
                        const updated = [...formData.kpis];
                        updated[idx].baseline = e.target.value;
                        setFormData({...formData, kpis: updated});
                      }}
                    />
                    <Input
                      placeholder="Target"
                      value={kpi.target || ''}
                      onChange={(e) => {
                        const updated = [...formData.kpis];
                        updated[idx].target = e.target.value;
                        setFormData({...formData, kpis: updated});
                      }}
                    />
                    <Input
                      placeholder="Unit"
                      value={kpi.unit || ''}
                      onChange={(e) => {
                        const updated = [...formData.kpis];
                        updated[idx].unit = e.target.value;
                        setFormData({...formData, kpis: updated});
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        kpis: prev.kpis.filter((_, i) => i !== idx)
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
              <Label>Success Criteria | معايير النجاح</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    success_criteria: [...(prev.success_criteria || []), { criterion: '', threshold: '', met: false }]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Criterion
              </Button>
            </div>
            {formData.success_criteria?.map((sc, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-3">
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
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sc.met || false}
                        onChange={(e) => {
                          const updated = [...formData.success_criteria];
                          updated[idx].met = e.target.checked;
                          setFormData({...formData, success_criteria: updated});
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Met</span>
                    </label>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Team & Stakeholders', ar: 'الفريق والأطراف المعنية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Team Members</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (!formData.challenge_id) {
                      toast.error('Please link a challenge first');
                      return;
                    }
                    try {
                      const challenge = challenges.find(c => c.id === formData.challenge_id);
                      const solution = solutions.find(s => s.id === formData.solution_id);
                      const response = await invokeAI({
                        prompt: `Generate optimal team for this pilot:
Challenge: ${challenge?.title_en}
Solution: ${solution?.name_en || 'TBD'}
Sector: ${formData.sector}
Description: ${formData.description_en}

Generate 5-7 team members including municipality reps, technical experts, project managers, domain specialists.
Return JSON with: name (realistic Arabic name), role, organization, email (name@org.gov.sa), responsibility`,
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
                        toast.success('✨ AI generated team');
                      }
                    } catch (error) {
                      toast.error('Failed: ' + error.message);
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      team: [...(prev.team || []), { name: '', role: '', email: '', organization: '' }]
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>
            {formData.team?.map((member, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-5 gap-3">
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
                      toast.error('Please link a challenge first');
                      return;
                    }
                    try {
                      const challenge = challenges.find(c => c.id === formData.challenge_id);
                      const municipality = municipalities.find(m => m.id === formData.municipality_id);
                      const response = await invokeAI({
                        prompt: `Identify stakeholders for this pilot:
Challenge: ${challenge?.title_en}
Municipality: ${municipality?.name_en}
Sector: ${formData.sector}
Scope: ${formData.scope || formData.description_en}

Identify 6-10 stakeholders: government entities, community groups, private sector, regulatory bodies, academic institutions.
Return JSON with: name, type (government/community/private/regulatory/academic), involvement`,
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
                        toast.success('✨ AI mapped stakeholders');
                      }
                    } catch (error) {
                      toast.error('Failed: ' + error.message);
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      stakeholders: [...(prev.stakeholders || []), { name: '', type: '', involvement: '' }]
                    }));
                  }}
                >
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
                      placeholder="Stakeholder name"
                      value={sh.name || ''}
                      onChange={(e) => {
                        const updated = [...formData.stakeholders];
                        updated[idx].name = e.target.value;
                        setFormData({...formData, stakeholders: updated});
                      }}
                    />
                    <Input
                      placeholder="Type (e.g., Government, NGO)"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t({ en: 'Risks & Issues', ar: 'المخاطر والمشاكل' })}</span>
            <Button
              onClick={() => handleSectionAIEnhance('risks')}
              disabled={isAIProcessing}
              variant="outline"
              size="sm"
            >
              {isAIProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  {t({ en: 'AI Assess', ar: 'تقييم ذكي' })}
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Risks</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    risks: [...(prev.risks || []), { risk: '', probability: 'medium', impact: 'medium', mitigation: '', status: 'open' }]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Risk
              </Button>
            </div>
            {formData.risks?.map((risk, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Risk description"
                      value={risk.risk || ''}
                      onChange={(e) => {
                        const updated = [...formData.risks];
                        updated[idx].risk = e.target.value;
                        setFormData({...formData, risks: updated});
                      }}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Select
                        value={risk.probability || 'medium'}
                        onValueChange={(v) => {
                          const updated = [...formData.risks];
                          updated[idx].probability = v;
                          setFormData({...formData, risks: updated});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Probability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={risk.impact || 'medium'}
                        onValueChange={(v) => {
                          const updated = [...formData.risks];
                          updated[idx].impact = v;
                          setFormData({...formData, risks: updated});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Impact" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={risk.status || 'open'}
                        onValueChange={(v) => {
                          const updated = [...formData.risks];
                          updated[idx].status = v;
                          setFormData({...formData, risks: updated});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="mitigated">Mitigated</SelectItem>
                          <SelectItem value="occurred">Occurred</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Mitigation strategy"
                      value={risk.mitigation || ''}
                      onChange={(e) => {
                        const updated = [...formData.risks];
                        updated[idx].mitigation = e.target.value;
                        setFormData({...formData, risks: updated});
                      }}
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        risks: prev.risks.filter((_, i) => i !== idx)
                      }));
                    }}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Safety Protocols (one per line)</Label>
            <Textarea
              value={formData.safety_protocols?.join('\n') || ''}
              onChange={(e) => setFormData({
                ...formData,
                safety_protocols: e.target.value.split('\n').filter(l => l.trim())
              })}
              rows={4}
              placeholder="List safety protocols..."
            />
          </div>

          <div className="space-y-2">
            <Label>Regulatory Exemptions (one per line)</Label>
            <Textarea
              value={formData.regulatory_exemptions?.join('\n') || ''}
              onChange={(e) => setFormData({
                ...formData,
                regulatory_exemptions: e.target.value.split('\n').filter(l => l.trim())
              })}
              rows={3}
              placeholder="List exemptions..."
            />
          </div>

          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Issues Log | سجل القضايا</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    issues: [...(prev.issues || []), { issue: '', severity: 'medium', raised_date: new Date().toISOString().split('T')[0], status: 'open', resolution: '' }]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Issue
              </Button>
            </div>
            {formData.issues?.map((issue, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Issue description"
                      value={issue.issue || ''}
                      onChange={(e) => {
                        const updated = [...formData.issues];
                        updated[idx].issue = e.target.value;
                        setFormData({...formData, issues: updated});
                      }}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Severity"
                        value={issue.severity || ''}
                        onChange={(e) => {
                          const updated = [...formData.issues];
                          updated[idx].severity = e.target.value;
                          setFormData({...formData, issues: updated});
                        }}
                      />
                      <Input
                        type="date"
                        value={issue.raised_date || ''}
                        onChange={(e) => {
                          const updated = [...formData.issues];
                          updated[idx].raised_date = e.target.value;
                          setFormData({...formData, issues: updated});
                        }}
                      />
                      <Select
                        value={issue.status || 'open'}
                        onValueChange={(v) => {
                          const updated = [...formData.issues];
                          updated[idx].status = v;
                          setFormData({...formData, issues: updated});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Resolution"
                      value={issue.resolution || ''}
                      onChange={(e) => {
                        const updated = [...formData.issues];
                        updated[idx].resolution = e.target.value;
                        setFormData({...formData, issues: updated});
                      }}
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        issues: prev.issues.filter((_, i) => i !== idx)
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t({ en: 'Evaluation & Scaling', ar: 'التقييم والتوسع' })}</span>
            <Button
              onClick={() => handleSectionAIEnhance('evaluation')}
              disabled={isAIProcessing}
              variant="outline"
              size="sm"
            >
              {isAIProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  {t({ en: 'AI Evaluate', ar: 'تقييم ذكي' })}
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Evaluation Summary (EN)</Label>
            <Textarea
              value={formData.evaluation_summary_en || ''}
              onChange={(e) => setFormData({...formData, evaluation_summary_en: e.target.value})}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>ملخص التقييم (عربي)</Label>
            <Textarea
              value={formData.evaluation_summary_ar || ''}
              onChange={(e) => setFormData({...formData, evaluation_summary_ar: e.target.value})}
              rows={3}
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label>AI Insights</Label>
            <Textarea
              value={formData.ai_insights || ''}
              onChange={(e) => setFormData({...formData, ai_insights: e.target.value})}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select
                value={formData.risk_level || 'medium'}
                onValueChange={(v) => setFormData({...formData, risk_level: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Success Probability (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.success_probability || ''}
                onChange={(e) => setFormData({...formData, success_probability: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Recommendation</Label>
              <Select
                value={formData.recommendation || 'pending'}
                onValueChange={(v) => setFormData({...formData, recommendation: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scale">Scale</SelectItem>
                  <SelectItem value="iterate">Iterate</SelectItem>
                  <SelectItem value="pivot">Pivot</SelectItem>
                  <SelectItem value="terminate">Terminate</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}</h3>
            <div className="space-y-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    lessons_learned: [...(prev.lessons_learned || []), { category: '', lesson: '', recommendation: '' }]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
              {formData.lessons_learned?.map((lesson, idx) => (
                <Card key={idx} className="p-4 bg-purple-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Category"
                        value={lesson.category || ''}
                        onChange={(e) => {
                          const updated = [...formData.lessons_learned];
                          updated[idx].category = e.target.value;
                          setFormData({...formData, lessons_learned: updated});
                        }}
                      />
                      <Textarea
                        placeholder="Lesson learned"
                        value={lesson.lesson || ''}
                        onChange={(e) => {
                          const updated = [...formData.lessons_learned];
                          updated[idx].lesson = e.target.value;
                          setFormData({...formData, lessons_learned: updated});
                        }}
                        rows={2}
                      />
                      <Textarea
                        placeholder="Recommendation"
                        value={lesson.recommendation || ''}
                        onChange={(e) => {
                          const updated = [...formData.lessons_learned];
                          updated[idx].recommendation = e.target.value;
                          setFormData({...formData, lessons_learned: updated});
                        }}
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          lessons_learned: prev.lessons_learned.filter((_, i) => i !== idx)
                        }));
                      }}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Scaling Plan', ar: 'خطة التوسع' })}</h3>
            <div className="space-y-3">
              <Textarea
                placeholder="Scaling strategy"
                value={formData.scaling_plan?.strategy || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scaling_plan: {
                    ...(formData.scaling_plan || {}),
                    strategy: e.target.value
                  }
                })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Target locations (comma-separated)"
                  value={formData.scaling_plan?.target_locations?.join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    scaling_plan: {
                      ...(formData.scaling_plan || {}),
                      target_locations: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    }
                  })}
                />
                <Input
                  placeholder="Timeline"
                  value={formData.scaling_plan?.timeline || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    scaling_plan: {
                      ...(formData.scaling_plan || {}),
                      timeline: e.target.value
                    }
                  })}
                />
              </div>
              <Input
                type="number"
                placeholder="Estimated cost"
                value={formData.scaling_plan?.estimated_cost || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  scaling_plan: {
                    ...(formData.scaling_plan || {}),
                    estimated_cost: parseFloat(e.target.value)
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Documents', ar: 'الوثائق' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {formData.documents?.length > 0 && (
            <div className="space-y-2">
              {formData.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded">
                  <Input
                    placeholder="Document name"
                    value={doc.name || ''}
                    onChange={(e) => {
                      const updated = [...formData.documents];
                      updated[idx].name = e.target.value;
                      setFormData({...formData, documents: updated});
                    }}
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-500">{new Date(doc.uploaded_date).toLocaleDateString()}</span>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Budget & Funding', ar: 'الميزانية والتمويل' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Total Budget</Label>
              <Input
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.budget_currency || 'SAR'}
                onValueChange={(v) => setFormData({...formData, budget_currency: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration (weeks)</Label>
              <Input
                type="number"
                value={formData.duration_weeks || ''}
                onChange={(e) => setFormData({...formData, duration_weeks: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Budget Breakdown | تفاصيل الميزانية</Label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (!formData.budget || !formData.description_en) {
                      toast.error('Please set total budget and description first');
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

Create realistic budget breakdown:
- Technology & Equipment
- Personnel & Consultants
- Operations & Maintenance
- Data Collection & Analysis
- Training & Capacity Building
- Marketing & Communication
- Contingency (10-15%)

Total must equal ${formData.budget}. Return JSON with: category, amount, description. Also suggest 2-3 funding sources.`,
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
                        toast.success('✨ AI optimized budget');
                      }
                    } catch (error) {
                      toast.error('Failed: ' + error.message);
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      budget_breakdown: [...(prev.budget_breakdown || []), { category: '', amount: 0, description: '' }]
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
            {formData.budget_breakdown?.map((item, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        budget_breakdown: prev.budget_breakdown.filter((_, i) => i !== idx)
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
              <Label>Funding Sources | مصادر التمويل</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    funding_sources: [...(prev.funding_sources || []), { source: '', amount: 0, confirmed: false }]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
            {formData.funding_sources?.map((fs, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Input
                      placeholder="Funding source"
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        funding_sources: prev.funding_sources.filter((_, i) => i !== idx)
                      }));
                    }}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Media Assets', ar: 'الوسائط' })}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Pilot Image', ar: 'رفع صورة التجربة' })}
                  maxSize={10}
                  enableImageSearch={true}
                  searchContext={formData.title_en}
                  onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                />
                {formData.image_url && (
                  <div className="relative mt-2">
                    <img src={formData.image_url} alt="Current" className="w-full h-32 object-cover rounded" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 h-6 w-6"
                      onClick={() => setFormData({...formData, image_url: ''})}
                    >
                      <X className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Video (Optional)', ar: 'فيديو (اختياري)' })}</Label>
                <FileUploader
                  type="video"
                  label={t({ en: 'Upload Video', ar: 'رفع فيديو' })}
                  maxSize={200}
                  preview={false}
                  onUploadComplete={(url) => setFormData({...formData, video_url: url})}
                />
                {formData.video_url && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded mt-2">
                    <video src={formData.video_url} className="w-20 h-12 object-cover rounded" />
                    <span className="text-xs text-slate-600 flex-1">Video uploaded</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setFormData({...formData, video_url: ''})}
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                )}
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Data Collection & Technology', ar: 'جمع البيانات والتقنية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Data Collection | جمع البيانات</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Collection Methods (comma-separated)</Label>
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
                  placeholder="Google Forms, IoT Platform, etc."
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
                  onClick={() => handleSectionAIEnhance('technology')}
                  disabled={isAIProcessing}
                >
                  {isAIProcessing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enhancing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> AI Enhance</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      technology_stack: [...(prev.technology_stack || []), { category: '', technology: '', version: '', purpose: '' }]
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Technology
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t({ en: 'Public Engagement & Media', ar: 'المشاركة العامة والإعلام' })}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSectionAIEnhance('engagement')}
              disabled={isAIProcessing}
            >
              {isAIProcessing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enhancing...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> AI Enhance</>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Public Engagement | المشاركة العامة</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Community Sessions</Label>
                <Input
                  type="number"
                  value={formData.public_engagement?.community_sessions || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    public_engagement: {
                      ...(formData.public_engagement || {}),
                      community_sessions: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Feedback Collected</Label>
                <Input
                  type="number"
                  value={formData.public_engagement?.feedback_collected || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    public_engagement: {
                      ...(formData.public_engagement || {}),
                      feedback_collected: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Satisfaction Score (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.public_engagement?.satisfaction_score || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    public_engagement: {
                      ...(formData.public_engagement || {}),
                      satisfaction_score: parseInt(e.target.value)
                    }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Media Coverage | التغطية الإعلامية</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    media_coverage: [...(prev.media_coverage || []), { outlet: '', date: '', url: '', sentiment: 'neutral' }]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Coverage
              </Button>
            </div>
            {formData.media_coverage?.map((media, idx) => (
              <Card key={idx} className="p-4 bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Media outlet"
                        value={media.outlet || ''}
                        onChange={(e) => {
                          const updated = [...formData.media_coverage];
                          updated[idx].outlet = e.target.value;
                          setFormData({...formData, media_coverage: updated});
                        }}
                      />
                      <Input
                        type="date"
                        value={media.date || ''}
                        onChange={(e) => {
                          const updated = [...formData.media_coverage];
                          updated[idx].date = e.target.value;
                          setFormData({...formData, media_coverage: updated});
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Article URL"
                        value={media.url || ''}
                        onChange={(e) => {
                          const updated = [...formData.media_coverage];
                          updated[idx].url = e.target.value;
                          setFormData({...formData, media_coverage: updated});
                        }}
                      />
                      <Select
                        value={media.sentiment || 'neutral'}
                        onValueChange={(v) => {
                          const updated = [...formData.media_coverage];
                          updated[idx].sentiment = v;
                          setFormData({...formData, media_coverage: updated});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        media_coverage: prev.media_coverage.filter((_, i) => i !== idx)
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

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Media Assets', ar: 'الوسائط' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => navigate(createPageUrl(`PilotDetail?id=${pilotId}`))}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending || changedFields.length === 0}
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
                  {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })} ({changedFields.length})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(PilotEditPage, {
  requiredPermissions: ['pilot_edit']
});