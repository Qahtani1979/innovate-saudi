import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { GraduationCap, Save, ArrowLeft, Plus, X, Loader2, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import ProfileVisibilityControl from '@/components/users/ProfileVisibilityControl';

function MyResearcherProfileEditor() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name_en: '',
    full_name_ar: '',
    title_en: '',
    title_ar: '',
    bio_en: '',
    bio_ar: '',
    institution: '',
    department: '',
    academic_title: '',
    research_areas: [],
    expertise_keywords: [],
    orcid_id: '',
    google_scholar_url: '',
    linkedin_url: '',
    collaboration_interests: [],
    visibility: 'platform'
  });

  const [newResearchArea, setNewResearchArea] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newCollabInterest, setNewCollabInterest] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-researcher-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('researcher_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name_en: profile.full_name_en || '',
        full_name_ar: profile.full_name_ar || '',
        title_en: profile.title_en || '',
        title_ar: profile.title_ar || '',
        bio_en: profile.bio_en || '',
        bio_ar: profile.bio_ar || '',
        institution: profile.institution || '',
        department: profile.department || '',
        academic_title: profile.academic_title || '',
        research_areas: profile.research_areas || [],
        expertise_keywords: profile.expertise_keywords || [],
        orcid_id: profile.orcid_id || '',
        google_scholar_url: profile.google_scholar_url || '',
        linkedin_url: profile.linkedin_url || '',
        collaboration_interests: profile.collaboration_interests || [],
        visibility: profile.visibility || 'platform'
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile?.id) {
        const { error } = await supabase
          .from('researcher_profiles')
          .update(data)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('researcher_profiles')
          .insert({ ...data, user_id: user?.id, user_email: user?.email });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-researcher-profile']);
      queryClient.invalidateQueries(['researcher-profile']);
      toast.success(t({ en: 'Profile saved successfully', ar: 'تم حفظ الملف بنجاح' }));
      navigate(createPageUrl('ResearcherDashboard'));
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to save profile', ar: 'فشل حفظ الملف' }));
      console.error('Save error:', error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const addToArray = (field, value, setter) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setter('');
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={GraduationCap}
        title={t({ en: 'Edit Researcher Profile', ar: 'تعديل ملف الباحث' })}
        description={t({ en: 'Update your research profile and credentials', ar: 'حدث ملفك البحثي وبيانات اعتمادك' })}
        action={
          <Button variant="outline" onClick={() => navigate(createPageUrl('ResearcherDashboard'))}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t({ en: 'Back to Dashboard', ar: 'العودة للوحة' })}
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Basic Information', ar: 'المعلومات الأساسية' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Full Name (English)', ar: 'الاسم الكامل (إنجليزي)' })}</Label>
                    <Input
                      value={formData.full_name_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name_en: e.target.value }))}
                      placeholder="Dr. John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Full Name (Arabic)', ar: 'الاسم الكامل (عربي)' })}</Label>
                    <Input
                      value={formData.full_name_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name_ar: e.target.value }))}
                      placeholder="د. محمد أحمد"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Title (English)', ar: 'اللقب (إنجليزي)' })}</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                      placeholder="Associate Professor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Title (Arabic)', ar: 'اللقب (عربي)' })}</Label>
                    <Input
                      value={formData.title_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                      placeholder="أستاذ مشارك"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Institution', ar: 'المؤسسة' })}</Label>
                    <Input
                      value={formData.institution}
                      onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                      placeholder="King Saud University"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Department', ar: 'القسم' })}</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Academic Title', ar: 'اللقب الأكاديمي' })}</Label>
                  <Input
                    value={formData.academic_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, academic_title: e.target.value }))}
                    placeholder="PhD, MSc"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Biography', ar: 'السيرة الذاتية' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Bio (English)', ar: 'السيرة (إنجليزي)' })}</Label>
                  <Textarea
                    value={formData.bio_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio_en: e.target.value }))}
                    placeholder="Brief description of your research background and interests..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Bio (Arabic)', ar: 'السيرة (عربي)' })}</Label>
                  <Textarea
                    value={formData.bio_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio_ar: e.target.value }))}
                    placeholder="وصف مختصر لخلفيتك البحثية واهتماماتك..."
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Research Areas & Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Research Areas & Expertise', ar: 'مجالات البحث والخبرة' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Research Areas', ar: 'مجالات البحث' })}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newResearchArea}
                      onChange={(e) => setNewResearchArea(e.target.value)}
                      placeholder={t({ en: 'Add research area...', ar: 'أضف مجال بحث...' })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('research_areas', newResearchArea, setNewResearchArea))}
                    />
                    <Button type="button" variant="outline" onClick={() => addToArray('research_areas', newResearchArea, setNewResearchArea)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.research_areas.map((area, i) => (
                      <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1">
                        {area}
                        <button type="button" onClick={() => removeFromArray('research_areas', i)} className="ml-2 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Expertise Keywords', ar: 'كلمات الخبرة' })}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder={t({ en: 'Add keyword...', ar: 'أضف كلمة...' })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('expertise_keywords', newKeyword, setNewKeyword))}
                    />
                    <Button type="button" variant="outline" onClick={() => addToArray('expertise_keywords', newKeyword, setNewKeyword)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.expertise_keywords.map((kw, i) => (
                      <Badge key={i} variant="outline" className="pl-3 pr-1 py-1">
                        {kw}
                        <button type="button" onClick={() => removeFromArray('expertise_keywords', i)} className="ml-2 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Collaboration Interests', ar: 'اهتمامات التعاون' })}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCollabInterest}
                      onChange={(e) => setNewCollabInterest(e.target.value)}
                      placeholder={t({ en: 'Add collaboration interest...', ar: 'أضف اهتمام تعاون...' })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('collaboration_interests', newCollabInterest, setNewCollabInterest))}
                    />
                    <Button type="button" variant="outline" onClick={() => addToArray('collaboration_interests', newCollabInterest, setNewCollabInterest)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.collaboration_interests.map((interest, i) => (
                      <Badge key={i} className="bg-primary/10 text-primary pl-3 pr-1 py-1">
                        {interest}
                        <button type="button" onClick={() => removeFromArray('collaboration_interests', i)} className="ml-2 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  {t({ en: 'Academic Links', ar: 'الروابط الأكاديمية' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'ORCID ID', ar: 'معرف ORCID' })}</Label>
                  <Input
                    value={formData.orcid_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, orcid_id: e.target.value }))}
                    placeholder="0000-0000-0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Google Scholar URL', ar: 'رابط Google Scholar' })}</Label>
                  <Input
                    value={formData.google_scholar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, google_scholar_url: e.target.value }))}
                    placeholder="https://scholar.google.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'LinkedIn URL', ar: 'رابط LinkedIn' })}</Label>
                  <Input
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visibility */}
            <ProfileVisibilityControl
              visibility={formData.visibility}
              onChange={(v) => setFormData(prev => ({ ...prev, visibility: v }))}
            />

            {/* Save Button */}
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Save Profile', ar: 'حفظ الملف' })}
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}

export default ProtectedPage(MyResearcherProfileEditor, { requiredPermissions: [] });
