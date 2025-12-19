import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { 
  User, Edit, Award, Briefcase, Mail, Globe, MapPin, Save, Upload, 
  Plus, X, Linkedin, Trophy, Star, Zap, Eye, EyeOff, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import SupabaseFileUploader from '@/components/uploads/SupabaseFileUploader';
import { ProfileStatCard, ProfileStatGrid } from '@/components/profile/ProfileStatCard';
import { ProfileBadge } from '@/components/profile/ProfileBadge';
import RoleRequestStatusBanner from '@/components/profile/RoleRequestStatusBanner';

export default function UserProfileTab() {
  const { language, isRTL, t } = useLanguage();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const { data: profile, isLoading } = useQuery({
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

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (!authUser?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
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
    onError: () => {
      toast.error(t({ en: 'Failed to update profile', ar: 'فشل في تحديث الملف' }));
    }
  });

  const handleSave = () => {
    const updateData = {
      bio_en: profileData.bio_en ?? profile?.bio_en,
      bio_ar: profileData.bio_ar ?? profile?.bio_ar,
      linkedin_url: profileData.linkedin_url ?? profile?.linkedin_url,
      title_en: profileData.title_en ?? profile?.title_en,
      title_ar: profileData.title_ar ?? profile?.title_ar,
      skills: profileData.skills ?? profile?.skills,
      avatar_url: profileData.avatar_url ?? profile?.avatar_url,
      cover_image_url: profileData.cover_image_url ?? profile?.cover_image_url,
      is_public: profileData.is_public ?? profile?.is_public,
    };
    updateProfileMutation.mutate(updateData);
  };

  const handleEditMode = (entering) => {
    if (entering) {
      setProfileData({
        avatar_url: profile?.avatar_url,
        cover_image_url: profile?.cover_image_url,
        bio_en: profile?.bio_en || '',
        bio_ar: profile?.bio_ar || '',
        linkedin_url: profile?.linkedin_url || '',
        title_en: profile?.title_en || '',
        title_ar: profile?.title_ar || '',
        skills: profile?.skills || [],
        is_public: profile?.is_public ?? false,
      });
    } else {
      setProfileData({});
    }
    setAvatarPreview(null);
    setCoverPreview(null);
    setEditMode(entering);
  };

  const addSkill = () => {
    if (newSkill && !profileData.skills?.includes(newSkill)) {
      setProfileData({
        ...profileData,
        skills: [...(profileData.skills || []), newSkill]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setProfileData({
      ...profileData,
      skills: (profileData.skills || []).filter(s => s !== skill)
    });
  };

  const togglePublicProfile = (checked) => {
    if (editMode) {
      setProfileData({ ...profileData, is_public: checked });
    } else {
      updateProfileMutation.mutate({ is_public: checked });
    }
  };

  // Stats
  const userLevel = Math.floor((profile?.contribution_count || 0) / 10) + 1;
  const levelProgress = ((profile?.contribution_count || 0) % 10) * 10;

  // Badges
  const badges = [
    { id: 'first_contribution', name: { en: 'First Steps', ar: 'الخطوات الأولى' }, icon: Star, earned: (profile?.contribution_count || 0) >= 1 },
    { id: 'profile_complete', name: { en: 'Complete Profile', ar: 'ملف كامل' }, icon: User, earned: (profile?.profile_completion_percentage || 0) >= 80 },
    { id: 'skill_master', name: { en: 'Skill Master', ar: 'خبير المهارات' }, icon: Zap, earned: (profile?.skills?.length || 0) >= 5 },
    { id: 'contributor', name: { en: 'Contributor', ar: 'مساهم' }, icon: Trophy, earned: (profile?.contribution_count || 0) >= 10 },
    { id: 'networker', name: { en: 'Networker', ar: 'متصل' }, icon: Globe, earned: !!profile?.linkedin_url },
    { id: 'certified', name: { en: 'Certified', ar: 'معتمد' }, icon: Award, earned: (profile?.certifications?.length || 0) >= 1 },
  ];

  const earnedBadges = badges.filter(b => b.earned);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <RoleRequestStatusBanner />
      
      {/* Cover & Avatar */}
      <Card className="overflow-hidden">
        <div className="h-36 sm:h-44 bg-gradient-to-br from-primary/80 to-primary relative overflow-hidden">
          {(coverPreview ?? profileData.cover_image_url ?? profile?.cover_image_url) && (
            <img 
              src={coverPreview ?? profileData.cover_image_url ?? profile?.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover absolute inset-0" 
            />
          )}
          {editMode && (
            <div className="absolute top-3 right-3 flex gap-2">
              <SupabaseFileUploader
                bucket="avatars"
                onUpload={(url) => {
                  setCoverPreview(url);
                  setProfileData({...profileData, cover_image_url: url});
                }}
                accept="image/*"
                trigger={
                  <Button size="sm" variant="secondary" className="h-8">
                    <Upload className="h-3 w-3 mr-1" />
                    {t({ en: 'Cover', ar: 'الغلاف' })}
                  </Button>
                }
              />
              {(coverPreview || profileData.cover_image_url) && (
                <Button size="sm" variant="destructive" className="h-8" onClick={() => {
                  setCoverPreview(null);
                  setProfileData({...profileData, cover_image_url: null});
                }}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 -mt-14 relative z-10">
            <div className="relative">
              <div className="h-28 w-28 rounded-2xl bg-background border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                {(avatarPreview ?? profileData.avatar_url ?? profile?.avatar_url) ? (
                  <img 
                    src={avatarPreview ?? profileData.avatar_url ?? profile?.avatar_url} 
                    alt="Avatar" 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <User className="h-14 w-14 text-muted-foreground" />
                )}
              </div>
              {!editMode && userLevel > 1 && (
                <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg border-2 border-background">
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
                      <Button size="sm" className="rounded-full h-7 w-7 p-0">
                        <Upload className="h-3 w-3" />
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left pt-2">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile?.full_name_en || profile?.full_name || authUser?.user_metadata?.full_name}
                  </h1>
                  <p className="text-muted-foreground">
                    {profile?.title_en || profile?.job_title_en || profile?.selected_persona}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                  {editMode && (
                    <Button onClick={handleSave} size="sm" disabled={updateProfileMutation.isPending}>
                      <Save className="h-4 w-4 mr-1" />
                      {t({ en: 'Save', ar: 'حفظ' })}
                    </Button>
                  )}
                  <Button onClick={() => handleEditMode(!editMode)} variant={editMode ? "outline" : "default"} size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    {editMode ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Edit', ar: 'تحرير' })}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 justify-center sm:justify-start">
                {profile?.verified && (
                  <Badge className="bg-primary text-xs gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t({ en: 'Verified', ar: 'موثق' })}
                  </Badge>
                )}
                {earnedBadges.slice(0, 4).map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <Badge key={badge.id} variant="outline" className="gap-1 text-xs">
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

      {/* Public Profile Toggle */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(editMode ? profileData.is_public : profile?.is_public) ? (
                <Eye className="h-5 w-5 text-primary" />
              ) : (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="public-profile" className="font-medium">
                  {t({ en: 'Public Profile', ar: 'ملف عام' })}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t({ en: 'Allow others to view your profile', ar: 'السماح للآخرين بمشاهدة ملفك' })}
                </p>
              </div>
            </div>
            <Switch
              id="public-profile"
              checked={editMode ? profileData.is_public : profile?.is_public}
              onCheckedChange={togglePublicProfile}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <ProfileStatGrid columns={4}>
        <ProfileStatCard
          icon={Trophy}
          value={profile?.contribution_count || 0}
          label={t({ en: 'Contributions', ar: 'المساهمات' })}
          variant="primary"
        />
        <ProfileStatCard
          icon={Award}
          value={earnedBadges.length}
          label={t({ en: 'Badges', ar: 'الشارات' })}
          variant="amber"
        />
        <ProfileStatCard
          icon={Star}
          value={`Lv.${userLevel}`}
          label={t({ en: 'Level', ar: 'المستوى' })}
          variant="purple"
        />
        <ProfileStatCard
          icon={Zap}
          value={`${profile?.profile_completion_percentage || 0}%`}
          label={t({ en: 'Profile', ar: 'الملف' })}
          variant="success"
        />
      </ProfileStatGrid>

      {/* Level Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t({ en: 'Level Progress', ar: 'تقدم المستوى' })}</span>
            <span className="text-sm text-muted-foreground">
              {levelProgress}/100 XP
            </span>
          </div>
          <Progress value={levelProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Bio & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t({ en: 'About', ar: 'نبذة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">{t({ en: 'Bio (English)', ar: 'النبذة (إنجليزي)' })}</Label>
                  <Textarea
                    value={profileData.bio_en || ''}
                    onChange={(e) => setProfileData({...profileData, bio_en: e.target.value})}
                    rows={3}
                    placeholder={t({ en: 'Tell us about yourself...', ar: 'أخبرنا عن نفسك...' })}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t({ en: 'Bio (Arabic)', ar: 'النبذة (عربي)' })}</Label>
                  <Textarea
                    value={profileData.bio_ar || ''}
                    onChange={(e) => setProfileData({...profileData, bio_ar: e.target.value})}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {(language === 'ar' ? profile?.bio_ar : profile?.bio_en) || 
                  t({ en: 'No bio added yet', ar: 'لم تضاف نبذة بعد' })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t({ en: 'Skills', ar: 'المهارات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder={t({ en: 'Add skill...', ar: 'أضف مهارة...' })}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profileData.skills || []).map((skill, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile?.skills || []).length > 0 ? (
                  profile.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {t({ en: 'No skills added yet', ar: 'لم تضاف مهارات بعد' })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t({ en: 'Links', ar: 'الروابط' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">{t({ en: 'LinkedIn URL', ar: 'رابط لينكد إن' })}</Label>
                <Input
                  value={profileData.linkedin_url || ''}
                  onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Title (English)', ar: 'اللقب (إنجليزي)' })}</Label>
                <Input
                  value={profileData.title_en || ''}
                  onChange={(e) => setProfileData({...profileData, title_en: e.target.value})}
                  placeholder={t({ en: 'e.g. Software Engineer', ar: 'مثال: مهندس برمجيات' })}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                </a>
              )}
              {profile?.user_email && (
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  {profile.user_email}
                </Button>
              )}
              {!profile?.linkedin_url && !profile?.user_email && (
                <p className="text-muted-foreground text-sm">
                  {t({ en: 'No links added yet', ar: 'لم تضاف روابط بعد' })}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Badges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t({ en: 'Badges', ar: 'الشارات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.id} className="text-center">
                  <ProfileBadge
                    icon={Icon}
                    name={badge.name[language]}
                    description={badge.earned ? t({ en: 'Earned!', ar: 'مكتسب!' }) : t({ en: 'Locked', ar: 'مقفل' })}
                    earned={badge.earned}
                    size="lg"
                  />
                  <p className="text-xs mt-2 truncate">{badge.name[language]}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
