import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import UserJourneyMapper from '../components/access/UserJourneyMapper';
import { User, Edit, Award, Briefcase, Mail, Globe, MapPin, Sparkles, Save, Upload, Plus, X, Calendar, Linkedin, Phone, GraduationCap, Languages } from 'lucide-react';
import { toast } from 'sonner';
import FileUploader from '../components/FileUploader';
import ProfileCompletionAI from '../components/profiles/ProfileCompletionAI';
import AIConnectionsSuggester from '../components/profile/AIConnectionsSuggester';
import ProfileVisibilityControl from '../components/users/ProfileVisibilityControl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { 
  ContactSection, 
  ProfessionalSection, 
  BioSection, 
  LanguagesSection, 
  CertificationsSection,
  SkillsBadges,
  WorkExperienceSection 
} from '../components/profile/BilingualProfileDisplay';

function UserProfile() {
  const { language, isRTL, t } = useLanguage();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [newExpertise, setNewExpertise] = useState('');
  const [newProject, setNewProject] = useState(null);
  const [newTraining, setNewTraining] = useState(null);

  // Fetch user profile from Supabase
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!authUser?.id
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (!authUser?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authUser.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      setEditMode(false);
      toast.success(t({ en: 'Profile updated', ar: 'تم تحديث الملف' }));
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast.error(t({ en: 'Failed to update profile', ar: 'فشل في تحديث الملف' }));
    }
  });

  const handleSave = () => {
    const updateData = {
      bio_en: profileData.bio_en || profileData.bio,
      bio_ar: profileData.bio_ar,
      linkedin_url: profileData.linkedin_url,
      title_en: profileData.title_en,
      title_ar: profileData.title_ar,
      skills: profileData.skills,
      expertise_areas: profileData.areas_of_expertise || profileData.expertise_areas,
      avatar_url: profileData.avatar_url,
    };
    updateProfileMutation.mutate(updateData);
  };

  const addSkill = () => {
    if (newSkill && !profileData.skills?.includes(newSkill)) {
      setProfileData({
        ...profileData,
        skills: [...(profileData.skills || profile?.skills || []), newSkill]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setProfileData({
      ...profileData,
      skills: (profileData.skills || profile?.skills || []).filter(s => s !== skill)
    });
  };

  const addExpertise = () => {
    if (newExpertise && !profileData.areas_of_expertise?.includes(newExpertise)) {
      setProfileData({
        ...profileData,
        areas_of_expertise: [...(profileData.areas_of_expertise || profile?.expertise_areas || []), newExpertise]
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertise) => {
    setProfileData({
      ...profileData,
      areas_of_expertise: (profileData.areas_of_expertise || profile?.expertise_areas || []).filter(e => e !== expertise)
    });
  };

  const addProject = (project) => {
    setProfileData({
      ...profileData,
      past_projects: [...(profileData.past_projects || profile?.work_experience || []), project]
    });
    setNewProject(null);
  };

  const removeProject = (index) => {
    setProfileData({
      ...profileData,
      past_projects: (profileData.past_projects || profile?.work_experience || []).filter((_, i) => i !== index)
    });
  };

  const addTraining = (training) => {
    setProfileData({
      ...profileData,
      training_completed: [...(profileData.training_completed || profile?.certifications || []), training]
    });
    setNewTraining(null);
  };

  const removeTraining = (index) => {
    setProfileData({
      ...profileData,
      training_completed: (profileData.training_completed || profile?.certifications || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Cover & Avatar */}
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 relative">
          {editMode && (
            <Button size="sm" variant="secondary" className="absolute top-4 right-4">
              <Upload className="h-3 w-3 mr-1" />
              {t({ en: 'Change Cover', ar: 'تغيير الغلاف' })}
            </Button>
          )}
        </div>
        <CardContent className="pt-0">
          <div className="flex items-start gap-6 -mt-16 relative z-10">
            <div className="relative">
              <div className="h-32 w-32 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <User className="h-16 w-16 text-slate-400" />
                )}
              </div>
              {editMode && (
                <FileUploader
                  onUpload={(url) => setProfileData({...profileData, avatar_url: url})}
                  accept="image/*"
                  trigger={
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                      <Upload className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
            </div>
            <div className="flex-1 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{profile?.full_name_en || profile?.full_name || authUser?.user_metadata?.full_name}</h1>
                  <p className="text-slate-600">{profile?.title_en || profile?.job_title_en || profile?.selected_persona}</p>
                </div>
                <Button onClick={() => setEditMode(!editMode)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  {editMode ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Edit Profile', ar: 'تحرير الملف' })}
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                {profile?.verified && (
                  <Badge className="bg-blue-600">
                    {t({ en: '✓ Verified', ar: '✓ موثق' })}
                  </Badge>
                )}
                {profile?.achievement_badges?.map((badge, i) => (
                  <Badge key={i} variant="outline">
                    <Award className="h-3 w-3 mr-1" />
                    {badge.badge_type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'نظرة' })}</TabsTrigger>
          <TabsTrigger value="skills">{t({ en: 'Skills', ar: 'المهارات' })}</TabsTrigger>
          <TabsTrigger value="projects">{t({ en: 'Projects', ar: 'المشاريع' })}</TabsTrigger>
          <TabsTrigger value="training">{t({ en: 'Training', ar: 'التدريب' })}</TabsTrigger>
          <TabsTrigger value="connections">{t({ en: 'Connections', ar: 'الاتصالات' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Basic Info', ar: 'المعلومات الأساسية' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Bio', ar: 'السيرة' })}</label>
                    <Textarea
                      value={profileData.bio_en || profile?.bio_en || profile?.bio || ''}
                      onChange={(e) => setProfileData({...profileData, bio_en: e.target.value})}
                      rows={4}
                      placeholder={t({ en: 'Tell us about yourself...', ar: 'أخبرنا عن نفسك...' })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'LinkedIn', ar: 'لينكد إن' })}</label>
                    <Input
                      value={profileData.linkedin_url || profile?.linkedin_url || ''}
                      onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Profile Fields (UserProfile)', ar: 'حقول الملف' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Title (EN)', ar: 'المسمى (EN)' })}</label>
                    <Input
                      value={profileData.title_en || profile?.title_en || ''}
                      onChange={(e) => setProfileData({...profileData, title_en: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t({ en: 'Title (AR)', ar: 'المسمى (AR)' })}</label>
                    <Input
                      value={profileData.title_ar || profile?.title_ar || ''}
                      onChange={(e) => setProfileData({...profileData, title_ar: e.target.value})}
                      dir="rtl"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSave} className="md:col-span-2 bg-blue-600 text-lg py-6">
                <Save className="h-5 w-5 mr-2" />
                {t({ en: 'Save Profile', ar: 'حفظ الملف' })}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* About / Bio */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t({ en: 'About', ar: 'نبذة' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BioSection 
                    bioEn={profile?.bio_en || profile?.bio} 
                    bioAr={profile?.bio_ar} 
                    showBoth={!!(profile?.bio_en && profile?.bio_ar)}
                  />
                  
                  {/* Professional Info */}
                  <div className="pt-4 border-t">
                    <ProfessionalSection
                      jobTitleEn={profile?.job_title_en || profile?.title_en}
                      jobTitleAr={profile?.job_title_ar || profile?.title_ar}
                      departmentEn={profile?.department_en}
                      departmentAr={profile?.department_ar}
                      organizationEn={profile?.organization_en}
                      organizationAr={profile?.organization_ar}
                      yearsExperience={profile?.years_experience}
                      educationLevel={profile?.education_level}
                      degree={profile?.degree}
                    />
                  </div>
                  
                  {/* Languages */}
                  {profile?.languages && (
                    <div className="pt-4 border-t">
                      <LanguagesSection languages={profile.languages} />
                    </div>
                  )}
                  
                  {/* Certifications */}
                  {profile?.certifications && (
                    <div className="pt-4 border-t">
                      <CertificationsSection certifications={profile.certifications} />
                    </div>
                  )}
                  
                  {/* Work Experience */}
                  {profile?.work_experience && profile.work_experience.length > 0 && (
                    <div className="pt-4 border-t">
                      <WorkExperienceSection workExperience={profile.work_experience} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact & Links */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Contact', ar: 'التواصل' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContactSection
                      email={authUser?.email || profile?.user_email}
                      phone={profile?.phone_number}
                      mobileNumber={profile?.mobile_number}
                      mobileCountryCode={profile?.mobile_country_code}
                      workPhone={profile?.work_phone}
                      linkedinUrl={profile?.linkedin_url}
                      website={profile?.social_links?.website}
                      locationCity={profile?.location_city}
                      locationRegion={profile?.location_region}
                      socialLinks={profile?.social_links}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Expertise', ar: 'الخبرة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SkillsBadges 
                      skills={profile?.expertise_areas || user?.areas_of_expertise} 
                      colorClass="bg-primary/10 text-primary"
                    />
                    {!(profile?.expertise_areas?.length || user?.areas_of_expertise?.length) && (
                      <p className="text-xs text-muted-foreground">{t({ en: 'No expertise listed', ar: 'لا توجد خبرة' })}</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Skills', ar: 'المهارات' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SkillsBadges 
                      skills={profile?.skills || user?.skills} 
                      colorClass="bg-secondary text-secondary-foreground"
                    />
                    {!(profile?.skills?.length || user?.skills?.length) && (
                      <p className="text-xs text-muted-foreground">{t({ en: 'No skills listed', ar: 'لا توجد مهارات' })}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Stats */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>{t({ en: 'Contribution History', ar: 'تاريخ المساهمات' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{user?.past_projects?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">{t({ en: 'Projects', ar: 'مشاريع' })}</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-3xl font-bold text-secondary-foreground">{(profile?.skills || user?.skills)?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">{t({ en: 'Skills', ar: 'مهارات' })}</p>
                    </div>
                    <div className="p-4 bg-accent/50 rounded-lg">
                      <p className="text-3xl font-bold text-accent-foreground">{user?.training_completed?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">{t({ en: 'Certifications', ar: 'شهادات' })}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-foreground">{profile?.contribution_count || 0}</p>
                      <p className="text-xs text-muted-foreground">{t({ en: 'Contributions', ar: 'مساهمات' })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* CV Download if available */}
              {profile?.cv_url && (
                <Card className="md:col-span-3">
                  <CardContent className="pt-6">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t({ en: 'Resume / CV', ar: 'السيرة الذاتية' })}</p>
                          <p className="text-xs text-muted-foreground">{t({ en: 'Download uploaded CV', ar: 'تحميل السيرة الذاتية' })}</p>
                        </div>
                      </div>
                      <Button variant="outline" asChild>
                        <a href={profile.cv_url} target="_blank" rel="noopener noreferrer">
                          {t({ en: 'Download', ar: 'تحميل' })}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t({ en: 'Skills & Expertise', ar: 'المهارات والخبرة' })}
                {!editMode && <Button onClick={() => setEditMode(true)} size="sm"><Edit className="h-4 w-4 mr-1" />{t({ en: 'Edit', ar: 'تعديل' })}</Button>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{t({ en: 'Skills', ar: 'المهارات' })}</h3>
                  {editMode && (
                    <div className="flex gap-2">
                      <Input
                        placeholder={t({ en: 'Add skill...', ar: 'أضف مهارة...' })}
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        className="w-48"
                      />
                      <Button size="sm" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profileData.skills || user?.skills || []).map((skill, i) => (
                    <Badge key={i} className="bg-blue-600">
                      {skill}
                      {editMode && (
                        <button onClick={() => removeSkill(skill)} className="ml-2 hover:bg-blue-700 rounded-full">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {!(profileData.skills || user?.skills)?.length && (
                    <p className="text-sm text-slate-500">{t({ en: 'No skills added yet', ar: 'لا توجد مهارات' })}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{t({ en: 'Areas of Expertise', ar: 'مجالات الخبرة' })}</h3>
                  {editMode && (
                    <div className="flex gap-2">
                      <Input
                        placeholder={t({ en: 'Add expertise...', ar: 'أضف خبرة...' })}
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                        className="w-48"
                      />
                      <Button size="sm" onClick={addExpertise}><Plus className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profileData.areas_of_expertise || user?.areas_of_expertise || []).map((area, i) => (
                    <Badge key={i} className="bg-purple-600">
                      {area}
                      {editMode && (
                        <button onClick={() => removeExpertise(area)} className="ml-2 hover:bg-purple-700 rounded-full">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {!(profileData.areas_of_expertise || user?.areas_of_expertise)?.length && (
                    <p className="text-sm text-slate-500">{t({ en: 'No expertise added yet', ar: 'لا توجد خبرة' })}</p>
                  )}
                </div>
              </div>

              {editMode && (
                <Button onClick={handleSave} className="w-full bg-blue-600">
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t({ en: 'Past Projects', ar: 'المشاريع السابقة' })}
                {editMode && (
                  <Button size="sm" onClick={() => setNewProject({})}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add Project', ar: 'إضافة مشروع' })}
                  </Button>
                )}
                {!editMode && <Button onClick={() => setEditMode(true)} size="sm"><Edit className="h-4 w-4 mr-1" />{t({ en: 'Edit', ar: 'تعديل' })}</Button>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(profileData.past_projects || user?.past_projects || []).map((project, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{project.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{project.role} • {project.year}</p>
                      <p className="text-sm text-slate-700 mt-2">{project.description}</p>
                      {project.outcomes && (
                        <p className="text-sm text-green-700 mt-2">
                          <span className="font-medium">{t({ en: 'Outcomes:', ar: 'النتائج:' })}</span> {project.outcomes}
                        </p>
                      )}
                    </div>
                    {editMode && (
                      <Button variant="ghost" size="icon" onClick={() => removeProject(i)} className="text-red-600">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!(profileData.past_projects || user?.past_projects)?.length && (
                <p className="text-center text-slate-500 py-8">{t({ en: 'No projects added yet', ar: 'لا توجد مشاريع' })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t({ en: 'Training & Certifications', ar: 'التدريب والشهادات' })}
                {editMode && (
                  <Button size="sm" onClick={() => setNewTraining({})}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t({ en: 'Add Training', ar: 'إضافة تدريب' })}
                  </Button>
                )}
                {!editMode && <Button onClick={() => setEditMode(true)} size="sm"><Edit className="h-4 w-4 mr-1" />{t({ en: 'Edit', ar: 'تعديل' })}</Button>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(profileData.training_completed || user?.training_completed || []).map((training, i) => (
                <div key={i} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <p className="font-medium text-slate-900">{training.course_name}</p>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{training.provider}</p>
                    {training.completion_date && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(training.completion_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {editMode && (
                    <Button variant="ghost" size="icon" onClick={() => removeTraining(i)} className="text-red-600">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!(profileData.training_completed || user?.training_completed)?.length && (
                <p className="text-center text-slate-500 py-8">{t({ en: 'No training added yet', ar: 'لا يوجد تدريب' })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <div className="space-y-6">
            <UserJourneyMapper userEmail={user?.email} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIConnectionsSuggester currentUser={user} />
              </div>
              <div>
                <ProfileVisibilityControl 
                  visibility={profileData.profile_visibility || user?.profile_visibility}
                  onChange={(val) => setProfileData({...profileData, profile_visibility: val})}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Project Dialog */}
      <Dialog open={!!newProject} onOpenChange={() => setNewProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t({ en: 'Add Past Project', ar: 'إضافة مشروع سابق' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Project Title', ar: 'عنوان المشروع' })}</label>
              <Input
                value={newProject?.title || ''}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Your Role', ar: 'دورك' })}</label>
              <Input
                value={newProject?.role || ''}
                onChange={(e) => setNewProject({...newProject, role: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Year', ar: 'السنة' })}</label>
              <Input
                type="number"
                value={newProject?.year || ''}
                onChange={(e) => setNewProject({...newProject, year: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Description', ar: 'الوصف' })}</label>
              <Textarea
                value={newProject?.description || ''}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Outcomes', ar: 'النتائج' })}</label>
              <Textarea
                value={newProject?.outcomes || ''}
                onChange={(e) => setNewProject({...newProject, outcomes: e.target.value})}
                rows={2}
              />
            </div>
            <Button onClick={() => addProject(newProject)} className="w-full">
              {t({ en: 'Add Project', ar: 'إضافة' })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Training Dialog */}
      <Dialog open={!!newTraining} onOpenChange={() => setNewTraining(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t({ en: 'Add Training/Certification', ar: 'إضافة تدريب/شهادة' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Course Name', ar: 'اسم الدورة' })}</label>
              <Input
                value={newTraining?.course_name || ''}
                onChange={(e) => setNewTraining({...newTraining, course_name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Provider', ar: 'الجهة' })}</label>
              <Input
                value={newTraining?.provider || ''}
                onChange={(e) => setNewTraining({...newTraining, provider: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Completion Date', ar: 'تاريخ الإكمال' })}</label>
              <Input
                type="date"
                value={newTraining?.completion_date || ''}
                onChange={(e) => setNewTraining({...newTraining, completion_date: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Certificate URL', ar: 'رابط الشهادة' })}</label>
              <Input
                value={newTraining?.certificate_url || ''}
                onChange={(e) => setNewTraining({...newTraining, certificate_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <Button onClick={() => addTraining(newTraining)} className="w-full">
              {t({ en: 'Add Training', ar: 'إضافة' })}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProtectedPage(UserProfile, { requiredPermissions: [] });