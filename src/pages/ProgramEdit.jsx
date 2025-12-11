import React, { useState, useEffect, useRef } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from '../components/LanguageContext';
import { Save, Loader2, Sparkles, Plus, X, Clock, Eye, History, AlertCircle, CheckCircle2 } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import AICurriculumGenerator from '../components/programs/AICurriculumGenerator';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';

function ProgramEditPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { invokeAI, status, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!programId
  });

  const [formData, setFormData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [changedFields, setChangedFields] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [draftRecovered, setDraftRecovered] = useState(false);
  const autoSaveTimerRef = useRef(null);
  const originalDataRef = useRef(null);

  // Auto-save and draft recovery
  useEffect(() => {
    if (program && !formData) {
      // Check for draft
      const draftKey = `program_edit_draft_${programId}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        try {
          const { data, timestamp } = JSON.parse(savedDraft);
          const draftAge = Date.now() - timestamp;
          
          // Recover draft if less than 24 hours old
          if (draftAge < 24 * 60 * 60 * 1000) {
            setFormData(data);
            setDraftRecovered(true);
            toast.success(t({ en: 'Draft recovered from ' + new Date(timestamp).toLocaleString(), ar: 'تم استرداد المسودة' }));
          } else {
            localStorage.removeItem(draftKey);
            setFormData(program);
          }
        } catch {
          setFormData(program);
        }
      } else {
        setFormData(program);
      }
      
      originalDataRef.current = program;
    }
  }, [program]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!formData || !programId) return;

    const saveTimer = setTimeout(() => {
      const draftKey = `program_edit_draft_${programId}`;
      localStorage.setItem(draftKey, JSON.stringify({
        data: formData,
        timestamp: Date.now()
      }));
      setAutoSaveStatus('saved');
    }, 30000);

    autoSaveTimerRef.current = saveTimer;
    setAutoSaveStatus('saving');

    return () => clearTimeout(saveTimer);
  }, [formData, programId]);

  // Track changed fields
  useEffect(() => {
    if (!formData || !originalDataRef.current) return;

    const changes = {};
    Object.keys(formData).forEach(key => {
      if (JSON.stringify(formData[key]) !== JSON.stringify(originalDataRef.current[key])) {
        changes[key] = true;
      }
    });
    setChangedFields(changes);
  }, [formData]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Increment version and log changes
      const updates = {
        ...data,
        version_number: (program.version_number || 1) + 1,
        previous_version_id: programId
      };

      const { error } = await supabase
        .from('programs')
        .update(updates)
        .eq('id', programId);
      if (error) throw error;

      // Log activity
      await supabase.from('system_activities').insert({
        entity_type: 'program',
        entity_id: programId,
        activity_type: 'program_updated',
        performed_by: user?.email,
        timestamp: new Date().toISOString(),
        metadata: {
          changed_fields: Object.keys(changedFields),
          version: updates.version_number
        }
      });

      // Clear draft
      localStorage.removeItem(`program_edit_draft_${programId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      toast.success(t({ en: 'Program updated', ar: 'تم تحديث البرنامج' }));
      navigate(createPageUrl(`ProgramDetail?id=${programId}`));
    }
  });

  const handleAIEnhance = async () => {
    const prompt = `Enhance this program description with professional, detailed bilingual content:

Program: ${formData.name_en}
Type: ${formData.program_type}
Current Description: ${formData.description_en || 'N/A'}

Generate comprehensive bilingual (English + Arabic) content:
1. Improved names (EN + AR)
2. Compelling taglines (EN + AR)
3. Detailed descriptions (EN + AR) - 250+ words each
4. Program objectives (EN + AR)`;

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
          objectives_ar: { type: 'string' }
        }
      }
    });

    if (result.success) {
      setFormData(prev => ({
        ...prev,
        name_en: result.data.name_en || prev.name_en,
        name_ar: result.data.name_ar || prev.name_ar,
        tagline_en: result.data.tagline_en || prev.tagline_en,
        tagline_ar: result.data.tagline_ar || prev.tagline_ar,
        description_en: result.data.description_en || prev.description_en,
        description_ar: result.data.description_ar || prev.description_ar,
        objectives_en: result.data.objectives_en || prev.objectives_en,
        objectives_ar: result.data.objectives_ar || prev.objectives_ar
      }));
      toast.success(t({ en: '✨ AI enhancement complete!', ar: '✨ تم التحسين!' }));
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const changeCount = Object.keys(changedFields).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Edit Program', ar: 'تعديل البرنامج' })}
          </h1>
          <p className="text-slate-600 mt-1">{formData.name_en}</p>
        </div>
        <div className="flex items-center gap-3">
          {draftRecovered && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <History className="h-3 w-3 mr-1" />
              {t({ en: 'Draft Recovered', ar: 'مسودة مستردة' })}
            </Badge>
          )}
          {changeCount > 0 && (
            <Badge className="bg-orange-100 text-orange-700">
              {changeCount} {t({ en: 'changes', ar: 'تغيير' })}
            </Badge>
          )}
          {autoSaveStatus === 'saving' && (
            <Badge variant="outline" className="animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              {t({ en: 'Auto-saving...', ar: 'حفظ تلقائي...' })}
            </Badge>
          )}
          {autoSaveStatus === 'saved' && changeCount > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t({ en: 'Draft saved', ar: 'المسودة محفوظة' })}
            </Badge>
          )}
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

      {changeCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t({ 
              en: `${changeCount} unsaved changes: ${Object.keys(changedFields).slice(0, 3).join(', ')}${changeCount > 3 ? '...' : ''}`,
              ar: `${changeCount} تغييرات غير محفوظة`
            })}
          </AlertDescription>
        </Alert>
      )}

      {previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Preview Mode', ar: 'وضع المعاينة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold">{formData.name_en}</h2>
              {formData.name_ar && <h3 className="text-xl" dir="rtl">{formData.name_ar}</h3>}
              {formData.tagline_en && <p className="text-lg text-slate-600 italic">{formData.tagline_en}</p>}
              {formData.description_en && (
                <div>
                  <h4 className="font-semibold mt-4">Description</h4>
                  <p className="whitespace-pre-wrap">{formData.description_en}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm font-semibold">Type</p>
                  <p>{formData.program_type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Status</p>
                  <p>{formData.status}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Duration</p>
                  <p>{formData.duration_weeks} weeks</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t({ en: 'Program Information', ar: 'معلومات البرنامج' })}</CardTitle>
              <Button
                onClick={handleAIEnhance}
                disabled={isAIProcessing || !isAvailable}
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
            </div>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name (English)</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({...formData, name_en: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>اسم البرنامج (عربي)</Label>
              <Input
                value={formData.name_ar || ''}
                onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Program Type</Label>
              <Select
                value={formData.program_type || formData.type || 'accelerator'}
                onValueChange={(v) => setFormData({...formData, program_type: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accelerator">Accelerator</SelectItem>
                  <SelectItem value="incubator">Incubator</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="challenge">Challenge</SelectItem>
                  <SelectItem value="fellowship">Fellowship</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="matchmaker">Matchmaker</SelectItem>
                  <SelectItem value="sandbox_wave">Sandbox Wave</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({...formData, status: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="applications_open">Applications Open</SelectItem>
                  <SelectItem value="selection">Selection</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Duration (weeks)</Label>
            <Input
              type="number"
              value={formData.duration_weeks || ''}
              onChange={(e) => setFormData({...formData, duration_weeks: parseInt(e.target.value)})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Application Open</Label>
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
              <Label>Application Close</Label>
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
                value={formData.timeline?.program_start || formData.start_date || ''}
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
                value={formData.timeline?.program_end || formData.end_date || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  timeline: {...(formData.timeline || {}), program_end: e.target.value}
                })}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Curriculum', ar: 'المنهج' })}</h3>
            <AICurriculumGenerator
              programType={formData.program_type}
              duration_weeks={formData.duration_weeks}
              objectives={formData.objectives_en}
              onCurriculumGenerated={(curriculum) => {
                setFormData(prev => ({ ...prev, curriculum }));
                toast.success(t({ en: 'Curriculum updated', ar: 'تم تحديث المنهج' }));
              }}
            />
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Program Media', ar: 'وسائط البرنامج' })}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Program Image', ar: 'صورة البرنامج' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Program Image', ar: 'رفع صورة البرنامج' })}
                  maxSize={10}
                  onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Promotional Video', ar: 'فيديو ترويجي' })}</Label>
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
              <Label>{t({ en: 'Program Brochure', ar: 'كتيب البرنامج' })}</Label>
              <FileUploader
                type="document"
                label={t({ en: 'Upload PDF Brochure', ar: 'رفع كتيب PDF' })}
                maxSize={50}
                preview={false}
                onUploadComplete={(url) => setFormData({...formData, brochure_url: url})}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Gallery Images', ar: 'معرض الصور' })}</Label>
              <FileUploader
                type="image"
                label={t({ en: 'Add to Gallery', ar: 'إضافة للمعرض' })}
                maxSize={10}
                enableImageSearch={true}
                searchContext={formData.name_en}
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
            <Button variant="outline" onClick={() => navigate(createPageUrl(`ProgramDetail?id=${programId}`))}>
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
          </div>
          );
          }

export default ProtectedPage(ProgramEditPage, {
  requiredPermissions: ['program_edit']
});