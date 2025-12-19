import React, { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { User, Activity, Trophy, TrendingUp, Users2, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

// Lazy load the tab content components
const UserProfileContent = lazy(() => import('./UserProfile'));
const UserActivityDashboardContent = lazy(() => import('./UserActivityDashboard'));
const UserGamificationContent = lazy(() => import('./UserGamification'));
const UserExperienceProgressContent = lazy(() => import('./UserExperienceProgress'));
const UserProfileMultiIdentityContent = lazy(() => import('./UserProfileMultiIdentity'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function UserProfileHub() {
  const { t, isRTL, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const handleTabChange = (value) => {
    setSearchParams({ tab: value });
  };

  const tabs = [
    { 
      id: 'profile', 
      label: { en: 'My Profile', ar: 'ملفي الشخصي' }, 
      icon: User,
      description: { en: 'View and edit your profile', ar: 'عرض وتحرير ملفك' }
    },
    { 
      id: 'activity', 
      label: { en: 'Activity', ar: 'النشاط' }, 
      icon: Activity,
      description: { en: 'Your activity dashboard', ar: 'لوحة نشاطك' }
    },
    { 
      id: 'gamification', 
      label: { en: 'Achievements', ar: 'الإنجازات' }, 
      icon: Trophy,
      description: { en: 'Badges, points & leaderboard', ar: 'الشارات والنقاط' }
    },
    { 
      id: 'progress', 
      label: { en: 'Progress', ar: 'التقدم' }, 
      icon: TrendingUp,
      description: { en: 'Track your experience progress', ar: 'تتبع تقدمك' }
    },
    { 
      id: 'identities', 
      label: { en: 'Identities', ar: 'الهويات' }, 
      icon: Users2,
      description: { en: 'Manage multiple identities', ar: 'إدارة الهويات المتعددة' }
    },
  ];

  return (
    <ProtectedPage requiredPermission="user:read">
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t({ en: 'My Profile Hub', ar: 'مركز ملفي الشخصي' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Manage your profile, track activity, and view achievements', ar: 'إدارة ملفك، تتبع نشاطك، وعرض إنجازاتك' })}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label[language]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="profile" className="mt-6">
            <Suspense fallback={<LoadingFallback />}>
              <UserProfileContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Suspense fallback={<LoadingFallback />}>
              <UserActivityDashboardContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="gamification" className="mt-6">
            <Suspense fallback={<LoadingFallback />}>
              <UserGamificationContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <Suspense fallback={<LoadingFallback />}>
              <UserExperienceProgressContent />
            </Suspense>
          </TabsContent>

          <TabsContent value="identities" className="mt-6">
            <Suspense fallback={<LoadingFallback />}>
              <UserProfileMultiIdentityContent />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedPage>
  );
}
