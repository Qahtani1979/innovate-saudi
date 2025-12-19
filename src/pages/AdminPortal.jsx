import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Shield, Users, Settings, Database, Activity, FileText, AlertCircle, 
  CheckCircle2, BarChart3, Zap, Award, Target, TrendingUp, Bell, Clock,
  Lightbulb, TestTube, Calendar, MapPin, Network, BookOpen, Sparkles
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function AdminPortal() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  // RLS: Admin sees EVERYTHING - but still exclude soft-deleted
  const { data: challenges = [] } = useQuery({
    queryKey: ['all-challenges-admin'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('is_deleted', false).order('created_at', { ascending: false }).limit(500);
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['all-pilots-admin'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*').eq('is_deleted', false).order('created_at', { ascending: false }).limit(300);
      return data || [];
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['all-solutions-admin'],
    queryFn: async () => {
      const { data } = await supabase.from('solutions').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['all-organizations-admin'],
    queryFn: async () => {
      const { data } = await supabase.from('organizations').select('*');
      return data || [];
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['all-programs-admin'],
    queryFn: async () => {
      const { data } = await supabase.from('programs').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['all-rd-admin'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['all-municipalities-admin'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const { data: citizenIdeas = [] } = useQuery({
    queryKey: ['all-citizen-ideas-admin'],
    queryFn: () => base44.entities.CitizenIdea.list()
  });

  const { data: expertProfiles = [] } = useQuery({
    queryKey: ['all-experts-admin'],
    queryFn: () => base44.entities.ExpertProfile.list()
  });

  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ['pending-approvals-admin'],
    queryFn: async () => {
      const [challengeApprovals, pilotApprovals, programApps] = await Promise.all([
        base44.entities.Challenge.filter({ status: 'submitted' }),
        base44.entities.PilotApproval.filter({ status: 'pending' }),
        base44.entities.ProgramApplication.filter({ status: 'submitted' })
      ]);
      return {
        challenges: challengeApprovals,
        pilots: pilotApprovals,
        programs: programApps
      };
    }
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['system-activity-admin'],
    queryFn: async () => {
      const all = await base44.entities.SystemActivity.list('-created_date', 20);
      return all;
    }
  });

  const adminSections = [
    {
      title: { en: 'Entity Management', ar: 'إدارة الكيانات' },
      icon: Database,
      color: 'blue',
      items: [
        { name: t({ en: 'Challenges', ar: 'التحديات' }), count: challenges.length, page: 'Challenges', icon: AlertCircle, color: 'red' },
        { name: t({ en: 'Solutions', ar: 'الحلول' }), count: solutions.length, page: 'Solutions', icon: Lightbulb, color: 'green' },
        { name: t({ en: 'Pilots', ar: 'التجارب' }), count: pilots.length, page: 'Pilots', icon: TestTube, color: 'blue' },
        { name: t({ en: 'Organizations', ar: 'الجهات' }), count: organizations.length, page: 'Organizations', icon: Users, color: 'purple' },
        { name: t({ en: 'Programs', ar: 'البرامج' }), count: programs.length, page: 'Programs', icon: Calendar, color: 'amber' },
        { name: t({ en: 'R&D Projects', ar: 'مشاريع البحث' }), count: rdProjects.length, page: 'RDProjects', icon: TestTube, color: 'indigo' }
      ]
    },
    {
      title: { en: 'Geography & Taxonomy', ar: 'الجغرافيا والتصنيف' },
      icon: MapPin,
      color: 'green',
      items: [
        { name: t({ en: 'Municipalities', ar: 'البلديات' }), count: municipalities.length, page: 'DataManagementHub', icon: MapPin, color: 'teal' },
        { name: t({ en: 'Regions', ar: 'المناطق' }), page: 'RegionManagement', icon: MapPin, color: 'green' },
        { name: t({ en: 'Sectors', ar: 'القطاعات' }), page: 'TaxonomyBuilder', icon: Target, color: 'blue' },
        { name: t({ en: 'Services', ar: 'الخدمات' }), page: 'ServiceCatalog', icon: FileText, color: 'purple' }
      ]
    },
    {
      title: { en: 'User & Access Management', ar: 'إدارة المستخدمين والوصول' },
      icon: Users,
      color: 'purple',
      items: [
        { name: t({ en: 'Users', ar: 'المستخدمون' }), page: 'UserManagementHub', icon: Users, color: 'blue' },
        { name: t({ en: 'Roles & Permissions', ar: 'الأدوار والصلاحيات' }), page: 'RolePermissionManager', icon: Shield, color: 'purple' },
        { name: t({ en: 'Experts', ar: 'الخبراء' }), count: expertProfiles.length, page: 'ExpertRegistry', icon: Award, color: 'amber' },
        { name: t({ en: 'Teams', ar: 'الفرق' }), page: 'TeamManagement', icon: Users, color: 'teal' }
      ]
    },
    {
      title: { en: 'Citizen Engagement', ar: 'مشاركة المواطنين' },
      icon: Lightbulb,
      color: 'yellow',
      items: [
        { name: t({ en: 'Ideas', ar: 'الأفكار' }), count: citizenIdeas.length, page: 'IdeasManagement', icon: Lightbulb, color: 'yellow' },
        { name: t({ en: 'Ideas Analytics', ar: 'تحليلات الأفكار' }), page: 'IdeasAnalytics', icon: BarChart3, color: 'purple' },
        { name: t({ en: 'Leaderboard', ar: 'لوحة الصدارة' }), page: 'CitizenLeaderboard', icon: Award, color: 'amber' }
      ]
    },
    {
      title: { en: 'System Operations', ar: 'عمليات النظام' },
      icon: Settings,
      color: 'slate',
      items: [
        { name: t({ en: 'Approvals', ar: 'الموافقات' }), count: (pendingApprovals?.challenges?.length || 0) + (pendingApprovals?.pilots?.length || 0) + (pendingApprovals?.programs?.length || 0), page: 'ApprovalCenter', icon: CheckCircle2, color: 'green' },
        { name: t({ en: 'Audit Trail', ar: 'سجل التدقيق' }), page: 'PlatformAudit', icon: FileText, color: 'slate' },
        { name: t({ en: 'System Health', ar: 'صحة النظام' }), page: 'SystemHealthDashboard', icon: Activity, color: 'teal' },
        { name: t({ en: 'Validation Checklist', ar: 'قائمة التحقق' }), page: 'SystemValidationChecklist', icon: Shield, color: 'red' },
        { name: t({ en: 'Settings', ar: 'الإعدادات' }), page: 'SystemDefaultsConfig', icon: Settings, color: 'blue' }
      ]
    }
  ];

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'GDISB Admin Portal', ar: 'بوابة إدارة GDISB' }}
        subtitle={{ en: 'Platform administration and system configuration', ar: 'إدارة المنصة وتكوين النظام' }}
        icon={<Shield className="h-6 w-6 text-white" />}
      />

      {/* Approval Alerts */}
      {((pendingApprovals?.challenges?.length || 0) + (pendingApprovals?.pilots?.length || 0)) > 0 && (
        <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-900">
                  {(pendingApprovals?.challenges?.length || 0) + (pendingApprovals?.pilots?.length || 0) + (pendingApprovals?.programs?.length || 0)} {t({ en: 'Pending Approval(s)', ar: 'موافقات معلقة' })}
                </p>
                <p className="text-sm text-amber-700">
                  {pendingApprovals?.challenges?.length || 0} challenges • {pendingApprovals?.pilots?.length || 0} pilots • {pendingApprovals?.programs?.length || 0} programs
                </p>
              </div>
              <Link to={createPageUrl('ApprovalCenter')}>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  {t({ en: 'Review', ar: 'مراجعة' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">{challenges.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'التحديات' })}</p>
              <div className="mt-2 text-xs text-slate-500">
                {challenges.filter(c => c.status === 'submitted').length} {t({ en: 'pending', ar: 'معلقة' })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <TestTube className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{pilots.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
              <div className="mt-2 text-xs text-slate-500">
                {pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length} {t({ en: 'active', ar: 'نشطة' })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Lightbulb className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{solutions.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
              <div className="mt-2 text-xs text-slate-500">
                {solutions.filter(s => s.is_verified).length} {t({ en: 'verified', ar: 'معتمدة' })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{organizations.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Organizations', ar: 'الجهات' })}</p>
              <div className="mt-2 text-xs text-slate-500">
                {organizations.filter(o => o.is_partner).length} {t({ en: 'partners', ar: 'شركاء' })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-600">{municipalities.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
              <div className="mt-2 text-xs text-slate-500">
                {municipalities.filter(m => m.is_active).length} {t({ en: 'active', ar: 'نشطة' })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent System Activity */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              {t({ en: 'Recent Platform Activity', ar: 'نشاط المنصة الأخير' })}
            </CardTitle>
            <Link to={createPageUrl('CrossEntityActivityStream')}>
              <Button size="sm" variant="outline">
                {t({ en: 'View All', ar: 'عرض الكل' })}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="p-3 bg-slate-50 rounded-lg border flex items-start gap-3">
                <Activity className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 font-medium">{activity.action}</p>
                  <p className="text-xs text-slate-600">{activity.entity_type} • {activity.created_by}</p>
                  <p className="text-xs text-slate-400">{new Date(activity.created_date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Sections */}
      {adminSections.map((section, idx) => {
        const SectionIcon = section.icon;
        return (
          <Card key={idx} className={`border-2 border-${section.color}-200`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SectionIcon className={`h-5 w-5 text-${section.color}-600`} />
                {t(section.title)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.items.map((item, itemIdx) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link key={itemIdx} to={createPageUrl(item.page)}>
                      <Card className={`hover:shadow-lg transition-all cursor-pointer border-2 hover:border-${item.color}-400`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-3">
                            <ItemIcon className={`h-6 w-6 text-${item.color}-600`} />
                            {item.count !== undefined && (
                              <Badge className={`bg-${item.color}-100 text-${item.color}-700`}>{item.count}</Badge>
                            )}
                          </div>
                          <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Quick Admin Tools */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            {t({ en: 'Quick Admin Actions', ar: 'إجراءات إدارية سريعة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Link to={createPageUrl('BulkImport')}>
              <Button variant="outline" className="w-full justify-start border-blue-300 hover:bg-blue-50">
                <Database className="h-4 w-4 mr-2" />
                {t({ en: 'Bulk Import', ar: 'استيراد جماعي' })}
              </Button>
            </Link>
            <Link to={createPageUrl('ApprovalCenter')}>
              <Button variant="outline" className="w-full justify-start border-green-300 hover:bg-green-50">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Approvals', ar: 'الموافقات' })}
              </Button>
            </Link>
            <Link to={createPageUrl('PlatformAudit')}>
              <Button variant="outline" className="w-full justify-start border-purple-300 hover:bg-purple-50">
                <FileText className="h-4 w-4 mr-2" />
                {t({ en: 'Audit Trail', ar: 'سجل التدقيق' })}
              </Button>
            </Link>
            <Link to={createPageUrl('SystemDefaultsConfig')}>
              <Button variant="outline" className="w-full justify-start border-slate-300 hover:bg-slate-50">
                <Settings className="h-4 w-4 mr-2" />
                {t({ en: 'Configuration', ar: 'التكوين' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Platform Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Pipeline Health', ar: 'صحة الخط' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-sm text-slate-700">{t({ en: 'Draft→Submitted', ar: 'مسودة→مقدمة' })}</span>
              <Badge>{challenges.filter(c => c.status === 'draft').length}→{challenges.filter(c => c.status === 'submitted').length}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="text-sm text-slate-700">{t({ en: 'Approved→Treatment', ar: 'معتمد→معالجة' })}</span>
              <Badge className="bg-blue-600 text-white">{challenges.filter(c => c.status === 'approved').length}→{challenges.filter(c => c.status === 'in_treatment').length}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm text-slate-700">{t({ en: 'Pilot→Scaled', ar: 'تجربة→موسعة' })}</span>
              <Badge className="bg-green-600 text-white">{pilots.filter(p => p.stage === 'completed').length}→{pilots.filter(p => p.stage === 'scaled').length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-slate-700">{t({ en: 'Pilot Success Rate', ar: 'معدل نجاح التجارب' })}</span>
              <span className="text-2xl font-bold text-green-600">
                {pilots.length > 0 ? Math.round((pilots.filter(p => p.recommendation === 'scale').length / pilots.length) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-slate-700">{t({ en: 'Challenge Resolution', ar: 'حل التحديات' })}</span>
              <span className="text-2xl font-bold text-blue-600">
                {challenges.length > 0 ? Math.round((challenges.filter(c => c.status === 'resolved').length / challenges.length) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ en: 'Citizen Engagement', ar: 'مشاركة المواطنين' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-slate-700">{t({ en: 'Ideas Submitted', ar: 'الأفكار المقدمة' })}</span>
              <span className="text-2xl font-bold text-purple-600">{citizenIdeas.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-slate-700">{t({ en: 'Approval Rate', ar: 'معدل القبول' })}</span>
              <span className="text-2xl font-bold text-yellow-600">
                {citizenIdeas.length > 0 ? Math.round((citizenIdeas.filter(i => i.status === 'approved').length / citizenIdeas.length) * 100) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Sections */}
      {adminSections.map((section, idx) => {
        const SectionIcon = section.icon;
        return (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SectionIcon className="h-5 w-5 text-blue-600" />
                {t(section.title)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((item, itemIdx) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link key={itemIdx} to={createPageUrl(item.page)}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-3">
                            <ItemIcon className={`h-6 w-6 text-${item.color}-600`} />
                            {item.count !== undefined && (
                              <Badge className={`bg-${item.color}-100 text-${item.color}-700`}>{item.count}</Badge>
                            )}
                          </div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </PageLayout>
  );
}

export default ProtectedPage(AdminPortal, { requireAdmin: true });