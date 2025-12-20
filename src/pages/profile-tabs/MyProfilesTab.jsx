import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  UserCircle, Building2, Briefcase, GraduationCap, Microscope, 
  Users, Shield, CheckCircle2, ArrowRight, Settings,
  Mail, Award, UserPlus
} from 'lucide-react';
import RoleRequestDialog from '@/components/access/RoleRequestDialog';

export default function MyProfilesTab() {
  const { isRTL, t } = useLanguage();
  const { user, profile, roles } = useAuth();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedRoleForRequest, setSelectedRoleForRequest] = useState(null);

  const profileTypes = [
    {
      id: 'personal',
      name: { en: 'Personal Profile', ar: 'الملف الشخصي' },
      description: { en: 'Your basic account information', ar: 'معلومات حسابك الأساسية' },
      icon: UserCircle,
      color: 'bg-primary/10 text-primary',
      editPath: 'ProfileSettings',
      isActive: true
    },
    {
      id: 'municipality',
      name: { en: 'Municipality Staff', ar: 'موظف البلدية' },
      description: { en: 'Municipal role and department', ar: 'الدور البلدي والقسم' },
      icon: Building2,
      color: 'bg-success/10 text-success',
      editPath: 'MyMunicipalityStaffProfile',
      roles: ['municipality_staff', 'municipality_admin', 'municipality_coordinator']
    },
    {
      id: 'provider',
      name: { en: 'Provider/Startup', ar: 'المزود/الشركة الناشئة' },
      description: { en: 'Company and solutions', ar: 'الشركة والحلول' },
      icon: Briefcase,
      color: 'bg-warning/10 text-warning',
      editPath: 'StartupProfile',
      roles: ['provider', 'startup_owner', 'startup_admin']
    },
    {
      id: 'expert',
      name: { en: 'Expert Profile', ar: 'ملف الخبير' },
      description: { en: 'Expertise and credentials', ar: 'الخبرة والمؤهلات' },
      icon: GraduationCap,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
      editPath: 'ExpertProfile',
      roles: ['expert', 'evaluator', 'panel_member']
    },
    {
      id: 'researcher',
      name: { en: 'Researcher', ar: 'الباحث' },
      description: { en: 'Research and academic', ar: 'البحث والأكاديمية' },
      icon: Microscope,
      color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
      editPath: 'MyResearcherProfileEditor',
      roles: ['researcher', 'academic']
    },
    {
      id: 'citizen',
      name: { en: 'Citizen', ar: 'المواطن' },
      description: { en: 'Community engagement', ar: 'المشاركة المجتمعية' },
      icon: Users,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
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
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* User Summary */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profile?.full_name || user?.email}</h2>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {roles?.slice(0, 4).map((role, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {role.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {roles?.length > 4 && (
                  <Badge variant="outline" className="text-xs">+{roles.length - 4}</Badge>
                )}
              </div>
            </div>
            <Link to={createPageUrl('ProfileSettings')}>
              <Button variant="outline" size="sm">
                <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Settings', ar: 'الإعدادات' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Profiles */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          {t({ en: 'Active Profiles', ar: 'الملفات النشطة' })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProfiles.map((profileType) => {
            const Icon = profileType.icon;
            return (
              <Card key={profileType.id} className="hover:shadow-md transition-all border hover:border-primary/30">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${profileType.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{t(profileType.name)}</h4>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs shrink-0">
                          {t({ en: 'Active', ar: 'نشط' })}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{t(profileType.description)}</p>
                    </div>
                  </div>
                  <Link to={createPageUrl(profileType.editPath)} className="block mt-3">
                    <Button className="w-full" variant="outline" size="sm">
                      {t({ en: 'View & Edit', ar: 'عرض وتعديل' })}
                      <ArrowRight className={`h-3 w-3 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Available Profiles */}
      {inactiveProfiles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {t({ en: 'Available Profile Types', ar: 'أنواع الملفات المتاحة' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveProfiles.map((profileType) => {
              const Icon = profileType.icon;
              return (
                <Card key={profileType.id} className="opacity-70 hover:opacity-100 transition-all">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-muted-foreground truncate">{t(profileType.name)}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{t(profileType.description)}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-3" 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRoleForRequest(profileType.roles?.[0] || profileType.id);
                        setRequestDialogOpen(true);
                      }}
                    >
                      <UserPlus className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'Request Access', ar: 'طلب الوصول' })}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t({ en: 'Quick Links', ar: 'روابط سريعة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to={createPageUrl('NotificationPreferences')}>
              <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5">
                <Mail className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Notifications', ar: 'الإشعارات' })}</span>
              </Button>
            </Link>
            <Link to={createPageUrl('ProfilePrivacyControls')}>
              <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Privacy', ar: 'الخصوصية' })}</span>
              </Button>
            </Link>
            <Link to={createPageUrl('ProfileAchievementsBadges')}>
              <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Achievements', ar: 'الإنجازات' })}</span>
              </Button>
            </Link>
            <Link to={createPageUrl('MyConnections')}>
              <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Connections', ar: 'الاتصالات' })}</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <RoleRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        preSelectedRole={selectedRoleForRequest}
      />
    </div>
  );
}
