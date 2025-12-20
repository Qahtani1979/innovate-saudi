import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { User, Activity, Trophy, TrendingUp, UserCircle, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

// Import tab components
import UserProfileTab from './profile-tabs/UserProfileTab';
import MyProfilesTab from './profile-tabs/MyProfilesTab';
import ActivityTab from './profile-tabs/ActivityTab';
import GamificationTab from './profile-tabs/GamificationTab';
import ProgressTab from './profile-tabs/ProgressTab';

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function UserProfileHub() {
  const { t, isRTL, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const handleTabChange = (value) => {
    setSearchParams({ tab: value });
  };

  const tabs = [
    { 
      id: 'profile', 
      label: { en: 'Profile', ar: 'الملف' }, 
      icon: User,
    },
    { 
      id: 'profiles', 
      label: { en: 'My Profiles', ar: 'ملفاتي' }, 
      icon: UserCircle,
    },
    { 
      id: 'activity', 
      label: { en: 'Activity', ar: 'النشاط' }, 
      icon: Activity,
    },
    { 
      id: 'achievements', 
      label: { en: 'Achievements', ar: 'الإنجازات' }, 
      icon: Trophy,
    },
    { 
      id: 'progress', 
      label: { en: 'Progress', ar: 'التقدم' }, 
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1.5 bg-muted/50 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 rounded-lg transition-all"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label[language]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <UserProfileTab />
        </TabsContent>

        <TabsContent value="profiles" className="mt-0">
          <MyProfilesTab />
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <ActivityTab />
        </TabsContent>

        <TabsContent value="achievements" className="mt-0">
          <GamificationTab />
        </TabsContent>

        <TabsContent value="progress" className="mt-0">
          <ProgressTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(UserProfileHub, { requiredPermissions: [] });
