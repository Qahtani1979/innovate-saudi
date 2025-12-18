import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  UserCircle, Building2, Briefcase, GraduationCap, Microscope, 
  Users, Shield, CheckCircle2, AlertCircle, ArrowRight, Settings,
  Mail, Award, UserPlus
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import RoleRequestDialog from '../components/access/RoleRequestDialog';

function MyProfilesHub() {
  const { isRTL, t } = useLanguage();
  const { user, profile, roles } = useAuth();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedRoleForRequest, setSelectedRoleForRequest] = useState(null);

  const profileTypes = [
    {
      id: 'personal',
      name: { en: 'Personal Profile', ar: 'الملف الشخصي' },
      description: { en: 'Your basic account information and preferences', ar: 'معلومات حسابك الأساسية والتفضيلات' },
      icon: UserCircle,
      color: 'bg-blue-100 text-blue-700',
      editPath: 'ProfileSettings',
      isActive: true
    },
    {
      id: 'municipality',
      name: { en: 'Municipality Staff Profile', ar: 'ملف موظف البلدية' },
      description: { en: 'Your municipal role and department information', ar: 'دورك البلدي ومعلومات القسم' },
      icon: Building2,
      color: 'bg-emerald-100 text-emerald-700',
      editPath: 'MyMunicipalityStaffProfile',
      roles: ['municipality_staff', 'municipality_admin', 'municipality_coordinator']
    },
    {
      id: 'provider',
      name: { en: 'Provider/Startup Profile', ar: 'ملف المزود/الشركة الناشئة' },
      description: { en: 'Your company information and solution offerings', ar: 'معلومات شركتك وعروض الحلول' },
      icon: Briefcase,
      color: 'bg-orange-100 text-orange-700',
      editPath: 'StartupProfile',
      roles: ['provider', 'startup_owner', 'startup_admin']
    },
    {
      id: 'expert',
      name: { en: 'Expert Profile', ar: 'ملف الخبير' },
      description: { en: 'Your expertise areas and evaluation credentials', ar: 'مجالات خبرتك وبيانات التقييم' },
      icon: GraduationCap,
      color: 'bg-amber-100 text-amber-700',
      editPath: 'ExpertProfile',
      roles: ['expert', 'evaluator', 'panel_member']
    },
    {
      id: 'researcher',
      name: { en: 'Researcher Profile', ar: 'ملف الباحث' },
      description: { en: 'Your research interests and academic affiliations', ar: 'اهتماماتك البحثية والانتماءات الأكاديمية' },
      icon: Microscope,
      color: 'bg-teal-100 text-teal-700',
      editPath: 'MyResearcherProfileEditor',
      roles: ['researcher', 'academic']
    },
    {
      id: 'citizen',
      name: { en: 'Citizen Engagement Profile', ar: 'ملف مشاركة المواطن' },
      description: { en: 'Your participation in ideas, pilots, and community engagement', ar: 'مشاركتك في الأفكار والتجارب والمشاركة المجتمعية' },
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
      editPath: 'CitizenOnboarding',
      roles: ['citizen']
    }
  ];

  const hasProfileRole = (profileRoles) => {
    if (!profileRoles || !roles) return false;
    return profileRoles.some(role => roles.includes(role));
  };

  const activeProfiles = profileTypes.filter(p => p.isActive || hasProfileRole(p.roles));
  const inactiveProfiles = profileTypes.filter(p => !p.isActive && !hasProfileRole(p.roles));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-primary" />
            {t({ en: 'My Profiles', ar: 'ملفاتي الشخصية' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Manage your different platform profiles and personas', ar: 'إدارة ملفاتك الشخصية المختلفة على المنصة' })}
          </p>
        </div>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile?.full_name || user?.email}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {roles?.slice(0, 4).map((role, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {role.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {roles?.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{roles.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
            <Link to={createPageUrl('ProfileSettings')}>
              <Button variant="outline" size="sm">
                <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Account Settings', ar: 'إعدادات الحساب' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          {t({ en: 'Your Active Profiles', ar: 'ملفاتك النشطة' })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProfiles.map((profileType) => {
            const Icon = profileType.icon;
            return (
              <Card key={profileType.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${profileType.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {t({ en: 'Active', ar: 'نشط' })}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">
                    {t(profileType.name)}
                  </CardTitle>
                  <CardDescription>
                    {t(profileType.description)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={createPageUrl(profileType.editPath)}>
                    <Button className="w-full" variant="outline">
                      {t({ en: 'View & Edit', ar: 'عرض وتعديل' })}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {inactiveProfiles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            {t({ en: 'Available Profile Types', ar: 'أنواع الملفات المتاحة' })}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t({ en: 'Request access to activate additional profile types based on your role.', ar: 'اطلب الوصول لتفعيل أنواع ملفات إضافية بناءً على دورك.' })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveProfiles.map((profileType) => {
              const Icon = profileType.icon;
              const requestableRoles = profileType.roles || [];
              return (
                <Card key={profileType.id} className="opacity-75 hover:opacity-100 transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-muted-foreground">
                        {t({ en: 'Not Active', ar: 'غير نشط' })}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 text-muted-foreground">
                      {t(profileType.name)}
                    </CardTitle>
                    <CardDescription>
                      {t(profileType.description)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setSelectedRoleForRequest(requestableRoles[0] || profileType.id);
                        setRequestDialogOpen(true);
                      }}
                    >
                      <UserPlus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'Request Access', ar: 'طلب الوصول' })}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t({ en: 'Quick Links', ar: 'روابط سريعة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to={createPageUrl('NotificationPreferences')}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Mail className="h-5 w-5" />
                <span className="text-xs">{t({ en: 'Notifications', ar: 'الإشعارات' })}</span>
              </Button>
            </Link>
            <Link to={createPageUrl('ProfilePrivacyControls')}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-xs">{t({ en: 'Privacy', ar: 'الخصوصية' })}</span>
              </Button>
            </Link>
            <Link to={createPageUrl('ProfileAchievementsBadges')}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Award className="h-5 w-5" />
                <span className="text-xs">{t({ en: 'Achievements', ar: 'الإنجازات' })}</span>
              </Button>
            </Link>
            <Link to={createPageUrl('MyConnections')}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span className="text-xs">{t({ en: 'Connections', ar: 'الاتصالات' })}</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Role Request Dialog */}
      <RoleRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        preSelectedRole={selectedRoleForRequest}
      />
    </div>
  );
}

export default ProtectedPage(MyProfilesHub, { requiredPermissions: [] });
