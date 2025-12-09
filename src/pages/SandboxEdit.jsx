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
import { Save, Loader2, Sparkles, Plus, X } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function SandboxEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const sandboxId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invokeAI, status: aiStatus, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: sandbox, isLoading } = useQuery({
    queryKey: ['sandbox', sandboxId],
    queryFn: async () => {
      const sandboxes = await base44.entities.Sandbox.list();
      return sandboxes.find(s => s.id === sandboxId);
    },
    enabled: !!sandboxId
  });

  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (sandbox && !formData) {
      setFormData(sandbox);
    }
  }, [sandbox]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Sandbox.update(sandboxId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sandbox', sandboxId]);
      toast.success(t({ en: 'Sandbox updated', ar: 'تم تحديث المنطقة' }));
      navigate(createPageUrl(`SandboxDetail?id=${sandboxId}`));
    }
  });

  const handleAIEnhance = async () => {
    try {
      const prompt = `Enhance this regulatory sandbox description with professional, detailed bilingual content:

Sandbox: ${formData.name_en}
Domain: ${formData.domain}
Location: ${formData.location || 'Saudi Arabia'}
Current Description: ${formData.description_en || 'N/A'}

Generate comprehensive bilingual (English + Arabic) content:
1. Improved names (EN + AR) - professional and clear
2. Compelling taglines (EN + AR)
3. Detailed descriptions (EN + AR) - 200+ words each
4. Regulatory framework summary`;

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
            regulatory_framework: { type: 'string' }
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
          regulatory_framework: result.data.regulatory_framework || prev.regulatory_framework
        }));
        toast.success(t({ en: '✨ AI enhancement complete!', ar: '✨ تم التحسين!' }));
      } else {
        toast.error(t({ en: 'AI enhancement failed', ar: 'فشل التحسين' }));
      }
    } catch (error) {
      toast.error(t({ en: 'AI enhancement failed', ar: 'فشل التحسين' }));
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
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Edit Sandbox', ar: 'تعديل المنطقة التجريبية' })}
        </h1>
        <p className="text-slate-600 mt-1">{formData.name_en}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Sandbox Information', ar: 'معلومات المنطقة' })}</CardTitle>
            <Button
              onClick={handleAIEnhance}
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
          </div>
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
              <Label>اسم المنطقة (عربي)</Label>
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
              <Label>Domain</Label>
              <Select
                value={formData.domain}
                onValueChange={(v) => setFormData({...formData, domain: v})}
              >
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
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

          <div className="space-y-2">
            <Label>Regulatory Framework</Label>
            <Textarea
              value={formData.regulatory_framework || ''}
              onChange={(e) => setFormData({...formData, regulatory_framework: e.target.value})}
              rows={3}
            />
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Sandbox Media & Resources', ar: 'وسائط المنطقة والموارد' })}</h3>
            
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
                <Label>{t({ en: 'Sandbox Tour Video', ar: 'فيديو جولة' })}</Label>
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
            <Button variant="outline" onClick={() => navigate(createPageUrl(`SandboxDetail?id=${sandboxId}`))}>
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
    </div>
  );
}

export default ProtectedPage(SandboxEdit, { requireAdmin: true });