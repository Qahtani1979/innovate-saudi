import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../components/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Award,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import FileUploader from '../components/FileUploader';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ExpertOnboarding() {
  const [step, setStep] = useState(1);
  const [cvFile, setCvFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    user_email: '',
    title: '',
    position: '',
    organization_id: '',
    expertise_areas: [],
    sector_specializations: [],
    years_of_experience: 0,
    bio_en: '',
    bio_ar: '',
    cv_url: '',
    linkedin_url: '',
    google_scholar_url: '',
    certifications: [],
    publications: [],
    preferred_engagement_types: [],
    availability_hours_per_month: 20,
    travel_willing: false,
    remote_only: false,
    languages: ['English', 'Arabic']
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase.from('expert_profiles').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['expert-profiles']);
      toast.success(t({ en: 'Expert profile created successfully', ar: 'تم إنشاء ملف الخبير بنجاح' }));
      navigate(createPageUrl(`ExpertDetail?id=${result.id}`));
    }
  });

  const handleCVUpload = async (file) => {
    if (!file) return;
    
    setCvFile(file);
    setExtracting(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, cv_url: file_url }));

      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            position: { type: 'string' },
            years_of_experience: { type: 'number' },
            expertise_areas: { type: 'array', items: { type: 'string' } },
            bio: { type: 'string' },
            linkedin_url: { type: 'string' },
            google_scholar_url: { type: 'string' }
          }
        }
      });

      if (extracted.status === 'success' && extracted.output) {
        setFormData(prev => ({
          ...prev,
          title: extracted.output.title || prev.title,
          position: extracted.output.position || prev.position,
          years_of_experience: extracted.output.years_of_experience || prev.years_of_experience,
          expertise_areas: extracted.output.expertise_areas || prev.expertise_areas,
          bio_en: extracted.output.bio || prev.bio_en,
          linkedin_url: extracted.output.linkedin_url || prev.linkedin_url,
          google_scholar_url: extracted.output.google_scholar_url || prev.google_scholar_url
        }));
        toast.success(t({ en: 'CV data extracted successfully', ar: 'تم استخراج بيانات السيرة الذاتية بنجاح' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to process CV', ar: 'فشل معالجة السيرة الذاتية' }));
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.expertise_areas || formData.expertise_areas.length === 0) {
      toast.error(t({ en: 'Please specify at least one area of expertise', ar: 'يرجى تحديد مجال خبرة واحد على الأقل' }));
      return;
    }

    createMutation.mutate({
      ...formData,
      user_email: user?.email,
      is_verified: false,
      is_active: false
    });

    // Notify admins via email-trigger-hub
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: 'program.application_received',
          recipient_email: 'admin@municipality.gov.sa',
          entity_type: 'expert',
          variables: {
            applicantEmail: user?.email,
            applicationType: 'Expert Application'
          },
          triggered_by: user?.email
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-blue-900 bg-clip-text text-transparent mb-2">
          {t({ en: 'Become a Platform Expert', ar: 'كن خبيراً في المنصة' })}
        </h1>
        <p className="text-slate-600">
          {t({ en: 'Join our network of domain experts and contribute to innovation', ar: 'انضم إلى شبكة الخبراء وساهم في الابتكار' })}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
              step >= s ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {s}
            </div>
            {s < 4 && (
              <div className={`h-1 w-12 ${step > s ? 'bg-purple-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: CV Upload */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              {t({ en: 'Step 1: Upload Your CV', ar: 'الخطوة 1: رفع السيرة الذاتية' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg text-center">
              <FileUploader
                onFileSelect={handleCVUpload}
                label={t({ en: 'Upload CV (PDF, DOCX)', ar: 'رفع السيرة الذاتية (PDF, DOCX)' })}
              />
              {extracting && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  <span className="text-sm text-slate-600">
                    {t({ en: 'AI is extracting your information...', ar: 'الذكاء الاصطناعي يستخرج معلوماتك...' })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" disabled>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button onClick={() => setStep(2)} disabled={extracting}>
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Personal Info */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: 'Step 2: Personal Information', ar: 'الخطوة 2: المعلومات الشخصية' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Title', ar: 'اللقب' })}
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Dr., Prof., Eng."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Position', ar: 'المنصب' })}
                </label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder={t({ en: 'Current position', ar: 'المنصب الحالي' })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Years of Experience', ar: 'سنوات الخبرة' })}
              </label>
              <Input
                type="number"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Biography (English)', ar: 'السيرة الذاتية (إنجليزي)' })}
              </label>
              <Textarea
                value={formData.bio_en}
                onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                rows={4}
                placeholder={t({ en: 'Tell us about your expertise...', ar: 'أخبرنا عن خبرتك...' })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Biography (Arabic)', ar: 'السيرة الذاتية (عربي)' })}
              </label>
              <Textarea
                value={formData.bio_ar}
                onChange={(e) => setFormData({ ...formData, bio_ar: e.target.value })}
                rows={4}
                dir="rtl"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button onClick={() => setStep(3)}>
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Expertise */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: 'Step 3: Expertise & Specializations', ar: 'الخطوة 3: الخبرة والتخصصات' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Areas of Expertise (comma-separated)', ar: 'مجالات الخبرة (مفصولة بفواصل)' })}
              </label>
              <Input
                placeholder={t({ en: 'AI, Smart Cities, IoT, Data Analytics...', ar: 'الذكاء الاصطناعي، المدن الذكية، إنترنت الأشياء...' })}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  expertise_areas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
              />
              {formData.expertise_areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.expertise_areas.map((area, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-700">{area}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                {t({ en: 'Sector Specializations', ar: 'التخصصات القطاعية' })}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['urban_design', 'transport', 'environment', 'digital_services', 'health', 'education', 'safety', 'economic_development'].map((sector) => (
                  <div key={sector} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.sector_specializations.includes(sector)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          sector_specializations: checked
                            ? [...prev.sector_specializations, sector]
                            : prev.sector_specializations.filter(s => s !== sector)
                        }));
                      }}
                    />
                    <span className="text-sm capitalize">{sector.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                {t({ en: 'Preferred Engagement Types', ar: 'أنواع المشاركة المفضلة' })}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['evaluation', 'mentoring', 'advisory', 'research', 'training'].map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.preferred_engagement_types.includes(type)}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          preferred_engagement_types: checked
                            ? [...prev.preferred_engagement_types, type]
                            : prev.preferred_engagement_types.filter(t => t !== type)
                        }));
                      }}
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button onClick={() => setStep(4)}>
                {t({ en: 'Next', ar: 'التالي' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {t({ en: 'Step 4: Review & Submit', ar: 'الخطوة 4: المراجعة والإرسال' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-lg space-y-3">
              <div>
                <p className="text-xs text-slate-500">{t({ en: 'Title & Position', ar: 'اللقب والمنصب' })}</p>
                <p className="font-medium">{formData.title} - {formData.position}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t({ en: 'Experience', ar: 'الخبرة' })}</p>
                <p className="font-medium">{formData.years_of_experience} {t({ en: 'years', ar: 'سنة' })}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t({ en: 'Expertise Areas', ar: 'مجالات الخبرة' })}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.expertise_areas.map((area, idx) => (
                    <Badge key={idx} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t({ en: 'Sectors', ar: 'القطاعات' })}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.sector_specializations.map((sector, idx) => (
                    <Badge key={idx} variant="outline" className="capitalize">{sector.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <Sparkles className="h-4 w-4 inline mr-1" />
                {t({ 
                  en: 'Your application will be reviewed by platform admins. You will be notified once verified.',
                  ar: 'سيتم مراجعة طلبك من قبل مسؤولي المنصة. سيتم إخطارك بمجرد التحقق.'
                })}
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Award className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Submit Application', ar: 'إرسال الطلب' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ExpertOnboarding; // Public access - any user can apply to become an expert