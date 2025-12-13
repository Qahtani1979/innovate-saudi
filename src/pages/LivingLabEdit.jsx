import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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
import { Save, Loader2, Sparkles, Beaker, Target } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import StrategicPlanSelector from '@/components/strategy/StrategicPlanSelector';

function LivingLabEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const labId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: lab, isLoading } = useQuery({
    queryKey: ['living-lab', labId],
    queryFn: async () => {
      const labs = await base44.entities.LivingLab.list();
      return labs.find(l => l.id === labId);
    },
    enabled: !!labId
  });

  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (lab && !formData) {
      setFormData(lab);
    }
  }, [lab]);

  const handleAIEnhancement = async () => {
    const response = await invokeAI({
      prompt: `Enhance this Living Lab content professionally:
        
Lab: ${formData.name_en}
Current Description: ${formData.description_en || 'N/A'}
Current Objectives: ${formData.objectives_en || 'N/A'}

Provide bilingual improvements:
1. Enhanced tagline
2. Improved description
3. Refined objectives`,
      response_json_schema: {
        type: 'object',
        properties: {
          tagline_en: { type: 'string' },
          tagline_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          objectives_en: { type: 'string' },
          objectives_ar: { type: 'string' }
        }
      }
    });

    if (response.success) {
      setFormData({ ...formData, ...response.data });
      toast.success(t({ en: 'AI enhanced content', ar: 'حسّن الذكاء المحتوى' }));
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.LivingLab.update(labId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['living-lab', labId]);
      toast.success(t({ en: 'Living lab updated', ar: 'تم تحديث المختبر' }));
      navigate(createPageUrl(`LivingLabDetail?id=${labId}`));
    }
  });

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
        icon={Beaker}
        title={{ en: 'Edit Living Lab', ar: 'تعديل المختبر الحي' }}
        description={formData.name_en}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Lab Information', ar: 'معلومات المختبر' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name (English)</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({...formData, name_en: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم (عربي)</Label>
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
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({...formData, type: v})}
              >
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
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Capacity (Max Projects)</Label>
              <Input
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Area (sqm)</Label>
              <Input
                type="number"
                value={formData.area_sqm || ''}
                onChange={(e) => setFormData({...formData, area_sqm: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Launch Date</Label>
              <Input
                type="date"
                value={formData.launch_date || ''}
                onChange={(e) => setFormData({...formData, launch_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={formData.address || ''}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Director Name</Label>
              <Input
                value={formData.director_name || ''}
                onChange={(e) => setFormData({...formData, director_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Director Email</Label>
              <Input
                type="email"
                value={formData.director_email || ''}
                onChange={(e) => setFormData({...formData, director_email: e.target.value})}
              />
            </div>
          </div>

          {/* Strategic Alignment Section */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
            </h3>
            <StrategicPlanSelector
              selectedPlanIds={formData.strategic_plan_ids || []}
              selectedObjectiveIds={formData.strategic_objective_ids || []}
              onPlanChange={(ids) => setFormData({...formData, strategic_plan_ids: ids, is_strategy_derived: ids.length > 0})}
              onObjectiveChange={(ids) => setFormData({...formData, strategic_objective_ids: ids})}
              showObjectives={true}
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
                  onUploadComplete={(url) => setFormData({...formData, image_url: url})}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Lab Video', ar: 'فيديو المختبر' })}</Label>
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
              <Label>{t({ en: 'Lab Brochure', ar: 'كتيب المختبر' })}</Label>
              <FileUploader
                type="document"
                label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                maxSize={50}
                preview={false}
                onUploadComplete={(url) => setFormData({...formData, brochure_url: url})}
              />
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button 
              type="button" 
              onClick={handleAIEnhancement}
              disabled={aiLoading || !isAvailable}
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
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(createPageUrl(`LivingLabDetail?id=${labId}`))}>
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
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(LivingLabEdit, { requireAdmin: true });
