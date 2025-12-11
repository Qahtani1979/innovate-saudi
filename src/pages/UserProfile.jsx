import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

import { User, Edit, Award, Briefcase, Mail, Globe, MapPin, Sparkles, Save, Upload, Plus, X, Calendar, Linkedin, Phone, GraduationCap, Languages, Trophy, Star, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import SupabaseFileUploader from '../components/uploads/SupabaseFileUploader';
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
import RoleRequestStatusBanner from '../components/profile/RoleRequestStatusBanner';

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
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

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
      setAvatarPreview(null);
      setCoverPreview(null);
      setProfileData({});
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
      cover_image_url: profileData.cover_image_url,
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

  // Auto-save visibility when changed
  const handleVisibilityChange = (val) => {
    setProfileData({...profileData, profile_visibility: val});
    updateProfileMutation.mutate({ visibility_settings: { profile_visibility: val } });
  };

  // Initialize edit mode with current profile data
  const handleEditMode = (entering) => {
    if (entering) {
      // Entering edit mode - copy current profile data
      setProfileData({
        avatar_url: profile?.avatar_url || null,
        cover_image_url: profile?.cover_image_url || null,
        bio_en: profile?.bio_en || profile?.bio || '',
        bio_ar: profile?.bio_ar || '',
        linkedin_url: profile?.linkedin_url || '',
        title_en: profile?.title_en || '',
        title_ar: profile?.title_ar || '',
        skills: profile?.skills || [],
        areas_of_expertise: profile?.expertise_areas || [],
      });
      setAvatarPreview(null);
      setCoverPreview(null);
    } else {
      // Exiting edit mode (cancel) - clear everything
      setProfileData({});
      setAvatarPreview(null);
      setCoverPreview(null);
    }
    setEditMode(entering);
  };

  // Handle successful save
  const handleSaveSuccess = () => {
    setAvatarPreview(null);
    setCoverPreview(null);
    setProfileData({});
  };

  // Delete avatar
  const handleDeleteAvatar = () => {
    setAvatarPreview(null);
    setProfileData({...profileData, avatar_url: null});
  };

  // Delete cover
  const handleDeleteCover = () => {
    setCoverPreview(null);
    setProfileData({...profileData, cover_image_url: null});
  };

  // Gamification data
  const userLevel = Math.floor((profile?.contribution_count || 0) / 10) + 1;
  const pointsToNextLevel = ((userLevel) * 10) - (profile?.contribution_count || 0);
  const levelProgress = ((profile?.contribution_count || 0) % 10) * 10;
  const totalBadgesEarned = (profile?.achievement_badges?.length || 0);

  // Badge definitions - earned based on various profile actions
  const badges = [
    { id: 'first_contribution', name: { en: 'First Steps', ar: 'الخطوات الأولى' }, icon: Star, earned: (profile?.contribution_count || 0) >= 1, color: 'bg-yellow-500', description: { en: 'Made first contribution', ar: 'قدم أول مساهمة' } },
    { id: 'profile_complete', name: { en: 'Complete Profile', ar: 'ملف كامل' }, icon: User, earned: (profile?.profile_completion_percentage || 0) >= 80, color: 'bg-blue-500', description: { en: '80%+ profile completion', ar: 'اكتمال الملف 80%+' } },
    { id: 'skill_master', name: { en: 'Skill Master', ar: 'خبير المهارات' }, icon: Zap, earned: (profile?.skills?.length || 0) >= 5, color: 'bg-purple-500', description: { en: '5+ skills added', ar: '5+ مهارات مضافة' } },
    { id: 'contributor', name: { en: 'Active Contributor', ar: 'مساهم نشط' }, icon: Trophy, earned: (profile?.contribution_count || 0) >= 10, color: 'bg-green-500', description: { en: '10+ contributions', ar: '10+ مساهمات' } },
    { id: 'networker', name: { en: 'Networker', ar: 'متصل' }, icon: Globe, earned: !!profile?.linkedin_url, color: 'bg-cyan-500', description: { en: 'LinkedIn connected', ar: 'لينكد إن متصل' } },
    { id: 'certified', name: { en: 'Certified Pro', ar: 'معتمد' }, icon: Award, earned: (profile?.certifications?.length || 0) >= 1, color: 'bg-orange-500', description: { en: 'Has certifications', ar: 'لديه شهادات' } },
  ];

  const earnedBadgesCount = badges.filter(b => b.earned).length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto px-2 sm:px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Role Request Status Banner */}
      <RoleRequestStatusBanner />
      
      {/* Cover & Avatar */}
      <Card className="overflow-hidden">
        <div className="h-32 sm:h-48 bg-gradient-to-br from-primary/80 to-primary relative overflow-hidden">
          {/* Show preview if uploading, otherwise show current or profileData value */}
          {(coverPreview !== null ? coverPreview : (editMode ? profileData.cover_image_url : profile?.cover_image_url)) && (
            <img 
              src={coverPreview !== null ? coverPreview : (editMode ? profileData.cover_image_url : profile?.cover_image_url)} 
              alt="Cover" 
              className="w-full h-full object-cover absolute inset-0" 
            />
          )}
          {editMode && (
            <div className="absolute top-4 right-4 flex gap-2">
              <SupabaseFileUploader
                bucket="avatars"
                onUpload={(url) => {
                  setCoverPreview(url);
                  setProfileData({...profileData, cover_image_url: url});
                }}
                accept="image/*"
                trigger={
                  <Button size="sm" variant="secondary">
                    <Upload className="h-3 w-3 mr-1" />
                    {t({ en: 'Change Cover', ar: 'تغيير الغلاف' })}
                  </Button>
                }
              />
              {(coverPreview || profileData.cover_image_url) && (
                <Button size="sm" variant="destructive" onClick={handleDeleteCover}>
                  <X className="h-3 w-3 mr-1" />
                  {t({ en: 'Remove', ar: 'إزالة' })}
                </Button>
              )}
            </div>
          )}
        </div>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 -mt-12 sm:-mt-16 relative z-10">
            <div className="relative">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl bg-background border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                {/* Show preview if uploading, otherwise show current or profileData value */}
                {(avatarPreview !== null ? avatarPreview : (editMode ? profileData.avatar_url : profile?.avatar_url)) ? (
                  <img 
                    src={avatarPreview !== null ? avatarPreview : (editMode ? profileData.avatar_url : profile?.avatar_url)} 
                    alt="Avatar" 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              {/* Level Badge on Avatar */}
              {!editMode && userLevel > 1 && (
                <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg border-2 border-background">
                  {userLevel}
                </div>
              )}
              {editMode && (
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <SupabaseFileUploader
                    bucket="avatars"
                    onUpload={(url) => {
                      setAvatarPreview(url);
                      setProfileData({...profileData, avatar_url: url});
                    }}
                    accept="image/*"
                    trigger={
                      <Button size="sm" className="rounded-full h-8 w-8 p-0">
                        <Upload className="h-4 w-4" />
                      </Button>
                    }
                  />
                  {(avatarPreview || profileData.avatar_url) && (
                    <Button size="sm" variant="destructive" className="rounded-full h-8 w-8 p-0" onClick={handleDeleteAvatar}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 mt-2 sm:mt-4 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-foreground">{profile?.full_name_en || profile?.full_name || authUser?.user_metadata?.full_name}</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">{profile?.title_en || profile?.job_title_en || profile?.selected_persona}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                  {editMode && (
                    <Button onClick={handleSave} className="bg-primary" size="sm" disabled={updateProfileMutation.isPending}>
                      <Save className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">{t({ en: 'Save', ar: 'حفظ' })}</span>
                      <span className="sm:hidden">{t({ en: 'Save', ar: 'حفظ' })}</span>
                    </Button>
                  )}
                  <Button onClick={() => handleEditMode(!editMode)} variant={editMode ? "outline" : "default"} size="sm">
                    <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{editMode ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Edit Profile', ar: 'تحرير الملف' })}</span>
                    <span className="sm:hidden">{editMode ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Edit', ar: 'تحرير' })}</span>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3 justify-center sm:justify-start">
                {profile?.verified && (
                  <Badge className="bg-primary text-xs">
                    {t({ en: '✓ Verified', ar: '✓ موثق' })}
                  </Badge>
                )}
                {badges.filter(b => b.earned).slice(0, 3).map((badge, i) => {
                  const Icon = badge.icon;
                  return (
                    <Badge key={i} variant="outline" className="gap-1 text-xs">
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{badge.name[language]}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview" className="flex-1 min-w-fit text-xs sm:text-sm">{t({ en: 'Overview', ar: 'نظرة' })}</TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 min-w-fit text-xs sm:text-sm">{t({ en: 'Skills', ar: 'المهارات' })}</TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 min-w-fit text-xs sm:text-sm">{t({ en: 'Projects', ar: 'المشاريع' })}</TabsTrigger>
          <TabsTrigger value="training" className="flex-1 min-w-fit text-xs sm:text-sm">{t({ en: 'Training', ar: 'التدريب' })}</TabsTrigger>
          <TabsTrigger value="connections" className="flex-1 min-w-fit text-xs sm:text-sm">{t({ en: 'Connections', ar: 'الاتصالات' })}</TabsTrigger>
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
                      skills={profile?.expertise_areas || profile?.areas_of_expertise} 
                      colorClass="bg-primary/10 text-primary"
                    />
                    {!(profile?.expertise_areas?.length || profile?.areas_of_expertise?.length) && (
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
                      skills={profile?.skills} 
                      colorClass="bg-secondary text-secondary-foreground"
                    />
                    {!profile?.skills?.length && (
                      <p className="text-xs text-muted-foreground">{t({ en: 'No skills listed', ar: 'لا توجد مهارات' })}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Innovation Journey / Gamification */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {t({ en: 'Innovation Journey', ar: 'رحلة الابتكار' })}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t({ 
                      en: 'Earn points by completing your profile, adding skills, getting certifications, and contributing to challenges. Points are tracked in your profile.', 
                      ar: 'اكسب النقاط من خلال إكمال ملفك، إضافة المهارات، الحصول على الشهادات، والمساهمة في التحديات. يتم تتبع النقاط في ملفك الشخصي.' 
                    })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Level Progress */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary shrink-0">
                      <span className="text-xl sm:text-2xl font-bold text-primary">{userLevel}</span>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between mb-1 text-sm sm:text-base">
                        <span className="font-medium">{t({ en: 'Level', ar: 'المستوى' })} {userLevel}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">{pointsToNextLevel} {t({ en: 'pts to next', ar: 'للتالي' })}</span>
                      </div>
                      <Progress value={levelProgress} className="h-2 sm:h-3" />
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div>
                    <h4 className="font-medium mb-3">{t({ en: 'Badges Earned', ar: 'الشارات المكتسبة' })} ({earnedBadgesCount}/{badges.length})</h4>
                    <div className="flex flex-wrap gap-3">
                      {badges.map((badge) => {
                        const Icon = badge.icon;
                        return (
                          <div 
                            key={badge.id} 
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${badge.earned ? badge.color + ' text-white shadow-md' : 'bg-muted/50 text-muted-foreground opacity-50'}`}
                            title={badge.description[language]}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{badge.name[language]}</span>
                            {!badge.earned && <span className="text-xs">🔒</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-4 border-t">
                    <div className="p-3 sm:p-4 bg-primary/5 rounded-lg text-center">
                      <p className="text-xl sm:text-3xl font-bold text-primary">{profile?.contribution_count || 0}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t({ en: 'Total Points', ar: 'النقاط' })}</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-secondary/50 rounded-lg text-center">
                      <p className="text-xl sm:text-3xl font-bold text-secondary-foreground">{profile?.skills?.length || 0}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t({ en: 'Skills', ar: 'مهارات' })}</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-accent/50 rounded-lg text-center">
                      <p className="text-xl sm:text-3xl font-bold text-accent-foreground">{profile?.certifications?.length || profile?.training_completed?.length || 0}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t({ en: 'Certs', ar: 'شهادات' })}</p>
                    </div>
                    <div className="p-3 sm:p-4 bg-muted rounded-lg text-center">
                      <p className="text-xl sm:text-3xl font-bold text-foreground">{badges.filter(b => b.earned).length}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t({ en: 'Badges', ar: 'شارات' })}</p>
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
                {!editMode && <Button onClick={() => handleEditMode(true)} size="sm"><Edit className="h-4 w-4 mr-1" />{t({ en: 'Edit', ar: 'تعديل' })}</Button>}
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
                  {(profileData.skills || profile?.skills || []).map((skill, i) => (
                    <Badge key={i} className="bg-blue-600">
                      {skill}
                      {editMode && (
                        <button onClick={() => removeSkill(skill)} className="ml-2 hover:bg-blue-700 rounded-full">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {!(profileData.skills || profile?.skills)?.length && (
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
                  {(profileData.areas_of_expertise || profile?.areas_of_expertise || []).map((area, i) => (
                    <Badge key={i} className="bg-purple-600">
                      {area}
                      {editMode && (
                        <button onClick={() => removeExpertise(area)} className="ml-2 hover:bg-purple-700 rounded-full">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {!(profileData.areas_of_expertise || profile?.areas_of_expertise)?.length && (
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
                {!editMode && <Button onClick={() => handleEditMode(true)} size="sm"><Edit className="h-4 w-4 mr-1" />{t({ en: 'Edit', ar: 'تعديل' })}</Button>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(profileData.past_projects || profile?.past_projects || []).map((project, i) => (
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
              {!(profileData.past_projects || profile?.past_projects)?.length && (
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
                {!editMode && <Button onClick={() => handleEditMode(true)} size="sm"><Edit className="h-4 w-4 mr-1" />{t({ en: 'Edit', ar: 'تعديل' })}</Button>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(profileData.training_completed || profile?.training_completed || []).map((training, i) => (
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
              {!(profileData.training_completed || profile?.training_completed)?.length && (
                <p className="text-center text-slate-500 py-8">{t({ en: 'No training added yet', ar: 'لا يوجد تدريب' })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AIConnectionsSuggester currentUser={profile} />
            </div>
            <div className="space-y-6">
              <ProfileVisibilityControl 
                visibility={profileData.profile_visibility || profile?.visibility_settings?.profile_visibility || 'platform'}
                onChange={handleVisibilityChange}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t({ en: 'Profile Stats', ar: 'إحصائيات الملف' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t({ en: 'Level', ar: 'المستوى' })}</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">{userLevel}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t({ en: 'Points', ar: 'النقاط' })}</span>
                    <Badge variant="secondary">{profile?.contribution_count || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t({ en: 'Badges', ar: 'الشارات' })}</span>
                    <Badge variant="secondary">{badges.filter(b => b.earned).length}/{badges.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t({ en: 'Profile Complete', ar: 'اكتمال الملف' })}</span>
                    <Badge variant="secondary">{profile?.profile_completion_percentage || 0}%</Badge>
                  </div>
                </CardContent>
              </Card>
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