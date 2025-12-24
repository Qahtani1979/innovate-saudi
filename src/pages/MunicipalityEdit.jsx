import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Sparkles, Loader2, X, Building2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';
import FileUploader from '../components/FileUploader';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useMunicipalityMutations } from '@/hooks/useMunicipalityMutations';
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';
import { useLocations } from '@/hooks/useLocations';

function MunicipalityEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const municipalityId = urlParams.get('id');
  const navigate = useNavigate();
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status: aiStatus, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { updateMunicipality } = useMunicipalityMutations();
  const { useRegions } = useLocations();

  // Fetch municipalities and find current one to ensure visibility rules are respected
  const { data: municipalities = [], isLoading: isLoadingMunicipalities } = useMunicipalitiesWithVisibility({
    includeAll: true, // Allow admins to edit any, user to edit theirs
    limit: 1000
  });

  const municipality = municipalities.find(m => m.id === municipalityId);
  const isLoading = isLoadingMunicipalities;

  const { data: regions = [] } = useRegions();

  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (municipality && (!formData || formData.id !== municipality.id)) {
      setFormData(municipality);
    }
  }, [municipality]);

  const handleUpdate = () => {
    updateMunicipality.mutate({ id: municipalityId, ...formData }, {
      onSuccess: () => {
        navigate(createPageUrl(`MunicipalityProfile?id=${municipalityId}`));
      }
    });
  };

  const handleAIEnhance = async () => {
    const prompt = `Generate professional municipality description for Saudi municipality:

Municipality: ${formData.name_en} | ${formData.name_ar}
Region: ${formData.region}
Population: ${formData.population || 'N/A'}

Create bilingual content highlighting the municipality's characteristics and innovation potential.`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          description_en: { type: 'string' },
          description_ar: { type: 'string' }
        }
      }
    });

    if (result.success) {
      setFormData(prev => ({
        ...prev,
        description_en: result.data.description_en || prev.description_en,
        description_ar: result.data.description_ar || prev.description_ar
      }));
      toast.success(t({ en: '✨ AI enhancement complete!', ar: '✨ تم التحسين!' }));
    } else {
      toast.error(t({ en: 'AI enhancement failed', ar: 'فشل التحسين' }));
    }
  };

  if (isLoading || !formData) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>;
  }

  return (
    <PageLayout>
      <PageHeader
        icon={Building2}
        title={{ en: 'Edit Municipality', ar: 'تعديل البلدية' }}
        subtitle={{ en: 'Update municipality information', ar: 'تحديث معلومات البلدية' }}
        action={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t({ en: 'Back', ar: 'رجوع' })}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Municipality Details', ar: 'تفاصيل البلدية' })}</CardTitle>
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
              <Label>{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Region', ar: 'المنطقة' })}</Label>
              <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(r => (
                    <SelectItem key={r.id} value={r.name_en}>
                      {language === 'ar' && r.name_ar ? r.name_ar : r.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'City Type', ar: 'نوع المدينة' })}</Label>
              <Select value={formData.city_type} onValueChange={(v) => setFormData({ ...formData, city_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metropolitan">Metropolitan</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Population', ar: 'عدد السكان' })}</Label>
              <Input
                type="number"
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'MII Score', ar: 'نقاط MII' })}</Label>
              <Input
                type="number"
                value={formData.mii_score}
                onChange={(e) => setFormData({ ...formData, mii_score: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Contact Person', ar: 'جهة الاتصال' })}</Label>
              <Input
                value={formData.contact_person || ''}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Contact Email', ar: 'البريد الإلكتروني' })}</Label>
              <Input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
            <Textarea
              value={formData.description_en || ''}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
            <Textarea
              value={formData.description_ar || ''}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              rows={3}
              dir="rtl"
            />
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Municipality Branding', ar: 'هوية البلدية' })}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Municipality Logo', ar: 'شعار البلدية' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Logo', ar: 'رفع الشعار' })}
                  maxSize={5}
                  onUploadComplete={(url) => setFormData({ ...formData, logo_url: url })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'City Image', ar: 'صورة المدينة' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                  maxSize={10}
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Banner', ar: 'البانر' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Banner', ar: 'رفع بانر' })}
                  maxSize={10}
                  onUploadComplete={(url) => setFormData({ ...formData, banner_url: url })}
                />
              </div>
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

          <Button
            onClick={handleUpdate}
            disabled={updateMunicipality.isPending}
            className="w-full"
          >
            {updateMunicipality.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t({ en: 'Update Municipality', ar: 'تحديث البلدية' })}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(MunicipalityEdit, { requireAdmin: true });