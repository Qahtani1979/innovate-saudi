import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Sparkles, X, ChevronUp } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAuth } from '@/lib/AuthContext';

export default function OnboardingChecklist({ onDismiss }) {
  const { t, isRTL, language } = useLanguage();
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
    }
  });

  // Use userProfile from auth context
  const profile = userProfile || {};

  const checklistItems = [
    {
      id: 'complete_profile',
      title: { en: 'Complete your profile', ar: 'أكمل ملفك الشخصي' },
      completed: !!(profile.job_title && profile.department),
      action: { page: 'UserProfile', label: { en: 'Go to Profile', ar: 'انتقل للملف' } }
    },
    {
      id: 'add_expertise',
      title: { en: 'Add your expertise areas', ar: 'أضف مجالات خبرتك' },
      completed: profile.expertise_areas?.length > 0,
      action: { page: 'UserProfile', label: { en: 'Add Expertise', ar: 'أضف الخبرات' } }
    },
    {
      id: 'explore_challenges',
      title: { en: 'Explore challenges', ar: 'استكشف التحديات' },
      completed: false, // This could be tracked separately if needed
      action: { page: 'Challenges', label: { en: 'View Challenges', ar: 'عرض التحديات' } }
    },
    {
      id: 'browse_solutions',
      title: { en: 'Browse solutions marketplace', ar: 'تصفح سوق الحلول' },
      completed: false,
      action: { page: 'Solutions', label: { en: 'Browse Solutions', ar: 'تصفح الحلول' } }
    }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progress = (completedCount / checklistItems.length) * 100;

  const handleDismiss = () => {
    updateProfileMutation.mutate({ 
      onboarding_completed: true 
    });
    onDismiss?.();
  };

  // Don't show if onboarding is completed
  if (profile.onboarding_completed) return null;

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40" dir={isRTL ? 'rtl' : 'ltr'}>
        <Button 
          onClick={() => setCollapsed(false)}
          className="bg-gradient-to-r from-primary to-blue-600 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {t({ en: 'Getting Started', ar: 'البداية' })}
          <Badge className="ml-2 bg-white/20 text-white">{completedCount}/{checklistItems.length}</Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 max-w-[calc(100vw-2rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t({ en: 'Getting Started', ar: 'البداية' })}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCollapsed(true)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {completedCount} {t({ en: 'of', ar: 'من' })} {checklistItems.length} {t({ en: 'completed', ar: 'مكتمل' })}
              </span>
              <span className="font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          {checklistItems.map((item) => (
            <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
              item.completed 
                ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                : 'bg-card hover:bg-muted/50 border-border'
            }`}>
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  item.completed 
                    ? 'text-green-900 line-through dark:text-green-100' 
                    : 'text-foreground'
                }`}>
                  {item.title[language]}
                </p>
                {!item.completed && item.action && (
                  <Link to={createPageUrl(item.action.page)}>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary">
                      {item.action.label[language]} →
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
