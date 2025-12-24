import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft, Sparkles, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useRegions } from '@/hooks/useLocations';
import { useMunicipalityMutations } from '@/hooks/useMunicipalityMutations';

function MunicipalityCreate() {
  const navigate = useNavigate();
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  // Use existing hooks
  const { data: regions = [], isLoading: regionsLoading } = useRegions();
  const { createMunicipality } = useMunicipalityMutations(() => {
    navigate(createPageUrl('MunicipalityDashboard'));
  });

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    region: '',
    city_type: 'medium',
    population: '',
    contact_person: '',
    contact_email: '',
    mii_score: 50,
    mii_rank: 0
  });

  const handleAIEnhancement = async () => {
    if (!formData.name_en || !formData.region) {
      toast.error(t({ en: 'Please enter municipality name and region first', ar: 'الرجاء إدخال اسم البلدية والمنطقة أولاً' }));
      return;
    }
    try {
      const {
        MUNICIPALITY_CREATE_PROMPT_TEMPLATE,
        MUNICIPALITY_CREATE_RESPONSE_SCHEMA
      } = await import('@/lib/ai/prompts/municipalities/creation');

      const result = await invokeAI({
        prompt: MUNICIPALITY_CREATE_PROMPT_TEMPLATE(formData),
        response_json_schema: MUNICIPALITY_CREATE_RESPONSE_SCHEMA
      });

      if (result.success && result.data) {
        setFormData({
          ...formData,
          mii_score: result.data.mii_estimate || formData.mii_score
        });
        toast.success(t({ en: 'AI enhanced your municipality', ar: 'حسّن الذكاء بلديتك' }));
      }
    } catch (error) {
      toast.error(t({ en: 'AI enhancement failed', ar: 'فشل التحسين' }));
    }
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Building2}
        title={{ en: 'Add Municipality', ar: 'إضافة بلدية' }}
        subtitle={{ en: 'Create a new municipality in the system', ar: 'إنشاء بلدية جديدة في النظام' }}
        action={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t({ en: 'Back', ar: 'رجوع' })}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Municipality Details', ar: 'تفاصيل البلدية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="Riyadh Municipality"
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                placeholder="أمانة الرياض"
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
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Contact Email', ar: 'البريد الإلكتروني' })}</Label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <Button
              type="button"
              onClick={handleAIEnhancement}
              disabled={aiLoading || !formData.name_en}
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
            <Button
              onClick={() => createMunicipality.mutate(formData)}
              disabled={!formData.name_en || !formData.region}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {t({ en: 'Create Municipality', ar: 'إنشاء البلدية' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(MunicipalityCreate, { requireAdmin: true });