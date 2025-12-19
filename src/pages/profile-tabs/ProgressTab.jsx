import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { 
  CheckCircle2, Circle, Clock, TrendingUp, Target, Award, 
  Star, Zap, Trophy, Rocket
} from 'lucide-react';
import { ProfileStatCard, ProfileStatGrid } from '@/components/profile/ProfileStatCard';

export default function ProgressTab() {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['progress-activities', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_email', user.email);
      return data || [];
    },
    enabled: !!user?.email
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['progress-achievements', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_email', user.email);
      return data || [];
    },
    enabled: !!user?.email
  });

  // Calculate milestones
  const milestones = [
    {
      id: 'profile_complete',
      name: { en: 'Complete Profile', ar: 'إكمال الملف' },
      description: { en: 'Fill out 80% of your profile', ar: 'إكمال 80% من ملفك' },
      icon: CheckCircle2,
      target: 80,
      current: profile?.profile_completion_percentage || 0,
      unit: '%',
      status: (profile?.profile_completion_percentage || 0) >= 80 ? 'completed' : 'in_progress'
    },
    {
      id: 'first_contribution',
      name: { en: 'First Contribution', ar: 'أول مساهمة' },
      description: { en: 'Make your first contribution', ar: 'قدم أول مساهمة' },
      icon: Star,
      target: 1,
      current: profile?.contribution_count || 0,
      unit: '',
      status: (profile?.contribution_count || 0) >= 1 ? 'completed' : 'pending'
    },
    {
      id: 'active_contributor',
      name: { en: 'Active Contributor', ar: 'مساهم نشط' },
      description: { en: 'Reach 10 contributions', ar: 'الوصول إلى 10 مساهمات' },
      icon: Trophy,
      target: 10,
      current: profile?.contribution_count || 0,
      unit: '',
      status: (profile?.contribution_count || 0) >= 10 ? 'completed' : 
        (profile?.contribution_count || 0) >= 1 ? 'in_progress' : 'pending'
    },
    {
      id: 'skill_master',
      name: { en: 'Skill Master', ar: 'خبير المهارات' },
      description: { en: 'Add 5 skills to your profile', ar: 'أضف 5 مهارات إلى ملفك' },
      icon: Zap,
      target: 5,
      current: profile?.skills?.length || 0,
      unit: '',
      status: (profile?.skills?.length || 0) >= 5 ? 'completed' : 
        (profile?.skills?.length || 0) >= 1 ? 'in_progress' : 'pending'
    },
    {
      id: 'level_5',
      name: { en: 'Level 5', ar: 'المستوى 5' },
      description: { en: 'Reach level 5', ar: 'الوصول للمستوى 5' },
      icon: Rocket,
      target: 5,
      current: Math.floor((profile?.contribution_count || 0) / 10) + 1,
      unit: '',
      status: Math.floor((profile?.contribution_count || 0) / 10) + 1 >= 5 ? 'completed' : 'in_progress'
    },
    {
      id: 'badge_collector',
      name: { en: 'Badge Collector', ar: 'جامع الشارات' },
      description: { en: 'Earn 5 badges', ar: 'احصل على 5 شارات' },
      icon: Award,
      target: 5,
      current: achievements.length,
      unit: '',
      status: achievements.length >= 5 ? 'completed' : 
        achievements.length >= 1 ? 'in_progress' : 'pending'
    }
  ];

  const completed = milestones.filter(m => m.status === 'completed').length;
  const inProgress = milestones.filter(m => m.status === 'in_progress').length;
  const pending = milestones.filter(m => m.status === 'pending').length;
  const totalProgress = (completed / milestones.length) * 100;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-primary animate-pulse" />;
      default: return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': 
        return <Badge className="bg-success/10 text-success border-success/20">{t({ en: 'Complete', ar: 'مكتمل' })}</Badge>;
      case 'in_progress': 
        return <Badge className="bg-primary/10 text-primary border-primary/20">{t({ en: 'In Progress', ar: 'جاري' })}</Badge>;
      default: 
        return <Badge variant="outline">{t({ en: 'Pending', ar: 'معلق' })}</Badge>;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Overall Progress */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t({ en: 'Overall Progress', ar: 'التقدم الإجمالي' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-primary">{Math.round(totalProgress)}%</span>
                <span className="text-sm text-muted-foreground">
                  {completed} / {milestones.length} {t({ en: 'milestones', ar: 'هدف' })}
                </span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>

            <ProfileStatGrid columns={3}>
              <ProfileStatCard
                icon={CheckCircle2}
                value={completed}
                label={t({ en: 'Completed', ar: 'مكتمل' })}
                variant="success"
              />
              <ProfileStatCard
                icon={Clock}
                value={inProgress}
                label={t({ en: 'In Progress', ar: 'جاري' })}
                variant="primary"
              />
              <ProfileStatCard
                icon={Circle}
                value={pending}
                label={t({ en: 'Pending', ar: 'معلق' })}
                variant="default"
              />
            </ProfileStatGrid>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-4">
        {milestones.map((milestone) => {
          const Icon = milestone.icon;
          const progress = Math.min((milestone.current / milestone.target) * 100, 100);

          return (
            <Card 
              key={milestone.id} 
              className={`transition-all ${
                milestone.status === 'completed' ? 'bg-success/5 border-success/20' :
                milestone.status === 'in_progress' ? 'bg-primary/5 border-primary/20' : ''
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    milestone.status === 'completed' ? 'bg-success/10' :
                    milestone.status === 'in_progress' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      milestone.status === 'completed' ? 'text-success' :
                      milestone.status === 'in_progress' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{t(milestone.name)}</h4>
                      {getStatusBadge(milestone.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{t(milestone.description)}</p>
                    <div className="flex items-center gap-3">
                      <Progress value={progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium text-muted-foreground shrink-0">
                        {milestone.current}{milestone.unit} / {milestone.target}{milestone.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
