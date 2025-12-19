import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from '../components/LanguageContext';
import { 
  User, Mail, MapPin, Briefcase, Globe, Linkedin, 
  Award, Star, Trophy, CheckCircle, ArrowLeft, Lock,
  Calendar, Building2, GraduationCap, Languages
} from 'lucide-react';
import { ProfileStatCard, ProfileStatGrid } from '@/components/profile/ProfileStatCard';
import { ProfileBadge } from '@/components/profile/ProfileBadge';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const { t, language, isRTL } = useLanguage();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          full_name,
          full_name_en,
          full_name_ar,
          avatar_url,
          cover_image_url,
          bio_en,
          bio_ar,
          title_en,
          title_ar,
          job_title,
          job_title_en,
          job_title_ar,
          department,
          department_en,
          department_ar,
          organization_en,
          organization_ar,
          skills,
          expertise_areas,
          linkedin_url,
          location_city,
          location_region,
          languages,
          verified,
          is_public,
          contribution_count,
          profile_completion_percentage,
          created_at
        `)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['public-profile-achievements', profile?.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', profile.user_id);
      return data || [];
    },
    enabled: !!profile?.user_id
  });

  const { data: citizenBadges = [] } = useQuery({
    queryKey: ['public-profile-badges', profile?.user_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('citizen_badges')
        .select('*')
        .eq('user_id', profile.user_id);
      return data || [];
    },
    enabled: !!profile?.user_id
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="flex gap-6">
          <Skeleton className="h-32 w-32 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {t({ en: 'Profile Not Found', ar: 'الملف غير موجود' })}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t({ en: 'This profile doesn\'t exist or has been removed.', ar: 'هذا الملف غير موجود أو تمت إزالته.' })}
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t({ en: 'Go Home', ar: 'العودة للرئيسية' })}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile.is_public) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {t({ en: 'Private Profile', ar: 'ملف خاص' })}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t({ en: 'This user has set their profile to private.', ar: 'هذا المستخدم قام بتعيين ملفه كخاص.' })}
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t({ en: 'Go Home', ar: 'العودة للرئيسية' })}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = language === 'ar' 
    ? (profile.full_name_ar || profile.full_name_en || profile.full_name)
    : (profile.full_name_en || profile.full_name);

  const displayTitle = language === 'ar'
    ? (profile.title_ar || profile.job_title_ar || profile.title_en || profile.job_title)
    : (profile.title_en || profile.job_title_en || profile.job_title);

  const displayBio = language === 'ar'
    ? (profile.bio_ar || profile.bio_en)
    : (profile.bio_en || profile.bio_ar);

  const displayOrg = language === 'ar'
    ? (profile.organization_ar || profile.organization_en)
    : (profile.organization_en || profile.organization_ar);

  const userLevel = Math.floor((profile.contribution_count || 0) / 10) + 1;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
        {t({ en: 'Back', ar: 'رجوع' })}
      </Link>

      {/* Cover & Avatar */}
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary/80 to-primary relative overflow-hidden">
          {profile.cover_image_url && (
            <img 
              src={profile.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover absolute inset-0" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-16 relative z-10">
            <div className="relative">
              <div className="h-32 w-32 rounded-2xl bg-background border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={displayName} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              {userLevel > 1 && (
                <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg border-2 border-background">
                  {userLevel}
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left pb-4">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
                {profile.verified && (
                  <Badge className="bg-primary gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {t({ en: 'Verified', ar: 'موثق' })}
                  </Badge>
                )}
              </div>
              {displayTitle && (
                <p className="text-muted-foreground">{displayTitle}</p>
              )}
              {displayOrg && (
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <Building2 className="h-3 w-3" />
                  {displayOrg}
                </p>
              )}
              {(profile.location_city || profile.location_region) && (
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {[profile.location_city, profile.location_region].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            {profile.linkedin_url && (
              <a 
                href={profile.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="pb-4"
              >
                <Button variant="outline" size="sm">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <ProfileStatGrid columns={4}>
        <ProfileStatCard
          icon={Trophy}
          value={profile.contribution_count || 0}
          label={t({ en: 'Contributions', ar: 'المساهمات' })}
          variant="primary"
        />
        <ProfileStatCard
          icon={Award}
          value={achievements.length + citizenBadges.length}
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
          icon={Calendar}
          value={new Date(profile.created_at).getFullYear()}
          label={t({ en: 'Member Since', ar: 'عضو منذ' })}
          variant="default"
        />
      </ProfileStatGrid>

      {/* Bio */}
      {displayBio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t({ en: 'About', ar: 'نبذة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{displayBio}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills & Expertise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.skills?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {t({ en: 'Skills', ar: 'المهارات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {profile.expertise_areas?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                {t({ en: 'Expertise', ar: 'الخبرات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.expertise_areas.map((area, i) => (
                  <Badge key={i} variant="outline">{area}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Languages */}
      {profile.languages && Object.keys(profile.languages).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              {t({ en: 'Languages', ar: 'اللغات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.languages).map(([lang, level], i) => (
                <Badge key={i} variant="secondary">
                  {lang}: {level}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements & Badges */}
      {(achievements.length > 0 || citizenBadges.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t({ en: 'Achievements & Badges', ar: 'الإنجازات والشارات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {achievements.map((ua, i) => (
                <div key={i} className="text-center">
                  <div className="h-16 w-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-2">
                    {ua.achievement?.icon || '🏆'}
                  </div>
                  <p className="text-xs font-medium truncate">
                    {language === 'ar' ? ua.achievement?.name_ar : ua.achievement?.name_en}
                  </p>
                </div>
              ))}
              {citizenBadges.map((badge, i) => (
                <div key={`badge-${i}`} className="text-center">
                  <div className="h-16 w-16 mx-auto rounded-xl bg-warning/10 flex items-center justify-center text-2xl mb-2">
                    🎖️
                  </div>
                  <p className="text-xs font-medium truncate">{badge.badge_name || badge.badge_type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
