import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function OnboardingChecklist({ user, onDismiss }) {
  const { t, isRTL, language } = useLanguage();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team?.list() || []
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role?.list() || []
  });

  const updateChecklistMutation = useMutation({
    mutationFn: (updates) => base44.auth.updateMe(updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['current-user']);
    }
  });

  const checklistItems = [
    {
      id: 'complete_profile',
      title: { en: 'Complete your profile', ar: 'أكمل ملفك الشخصي' },
      completed: !!(user.job_title && user.department),
      action: { page: 'UserProfile', label: { en: 'Go to Profile', ar: 'انتقل للملف' } }
    },
    {
      id: 'join_team',
      title: { en: 'Join a team', ar: 'انضم لفريق' },
      completed: user.assigned_teams?.length > 0,
      action: { page: 'UserManagementHub', label: { en: 'Browse Teams', ar: 'تصفح الفرق' } }
    },
    {
      id: 'explore_challenges',
      title: { en: 'Explore challenges', ar: 'استكشف التحديات' },
      completed: user.onboarding_progress?.explored_challenges || false,
      action: { page: 'Challenges', label: { en: 'View Challenges', ar: 'عرض التحديات' } }
    },
    {
      id: 'review_permissions',
      title: { en: 'Review your permissions', ar: 'راجع صلاحياتك' },
      completed: user.assigned_roles?.length > 0,
      action: { page: 'UserManagementHub', label: { en: 'Check Roles', ar: 'راجع الأدوار' } }
    }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progress = (completedCount / checklistItems.length) * 100;

  const handleDismiss = () => {
    updateChecklistMutation.mutate({ 
      onboarding_progress: { 
        ...user.onboarding_progress,
        checklist_dismissed: true 
      } 
    });
    onDismiss?.();
  };

  if (user.onboarding_progress?.checklist_dismissed) return null;
  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button 
          onClick={() => setCollapsed(false)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 shadow-lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {t({ en: 'Onboarding Checklist', ar: 'قائمة البداية' })}
          <Badge className="ml-2 bg-white text-blue-600">{completedCount}/{checklistItems.length}</Badge>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="shadow-2xl border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              {t({ en: 'Getting Started', ar: 'البداية' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCollapsed(true)}>
                _
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">{completedCount} of {checklistItems.length} completed</span>
              <span className="font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
              item.completed ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-slate-50'
            }`}>
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${item.completed ? 'text-green-900 line-through' : 'text-slate-900'}`}>
                  {item.title[language]}
                </p>
                {!item.completed && item.action && (
                  <Link to={createPageUrl(item.action.page)}>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs text-blue-600">
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