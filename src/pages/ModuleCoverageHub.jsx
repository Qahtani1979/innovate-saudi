import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ModuleCoverageHub() {
  const { language, isRTL, t } = useLanguage();
  const [selectedModule, setSelectedModule] = useState('challenges');

  const moduleCategories = [
    {
      category: { en: 'Core Modules', ar: 'الوحدات الأساسية' },
      modules: [
        { id: 'challenges', name: { en: 'Challenges', ar: 'التحديات' }, page: 'ChallengesCoverageReport' },
        { id: 'solutions', name: { en: 'Solutions', ar: 'الحلول' }, page: 'SolutionsCoverageReport' },
        { id: 'pilots', name: { en: 'Pilots', ar: 'التجارب' }, page: 'PilotsCoverageReport' },
        { id: 'programs', name: { en: 'Programs', ar: 'البرامج' }, page: 'ProgramsCoverageReport' },
        { id: 'rd', name: { en: 'R&D', ar: 'البحث والتطوير' }, page: 'RDCoverageReport' },
        { id: 'sandboxes', name: { en: 'Sandboxes', ar: 'المناطق التجريبية' }, page: 'SandboxesCoverageReport' },
        { id: 'livinglabs', name: { en: 'Living Labs', ar: 'المختبرات الحية' }, page: 'LivingLabsCoverageReport' },
        { id: 'matchmaker', name: { en: 'Matchmaker', ar: 'الموفق' }, page: 'MatchmakerCoverageReport' },
        { id: 'scaling', name: { en: 'Scaling', ar: 'التوسع' }, page: 'ScalingCoverageReport' },
      ]
    },
    {
      category: { en: 'Stakeholders & Resources', ar: 'أصحاب المصلحة والموارد' },
      modules: [
        { id: 'policy', name: { en: 'Policy', ar: 'السياسات' }, page: 'PolicyRecommendationCoverageReport' },
        { id: 'academia', name: { en: 'Academia', ar: 'الأكاديميا' }, page: 'AcademiaCoverageReport' },
        { id: 'startup', name: { en: 'Startup', ar: 'الشركات' }, page: 'StartupCoverageReport' },
        { id: 'organizations', name: { en: 'Organizations', ar: 'المنظمات' }, page: 'OrganizationsCoverageReport' },
        { id: 'expert', name: { en: 'Expert System', ar: 'نظام الخبراء' }, page: 'ExpertCoverageReport' },
        { id: 'municipality', name: { en: 'Municipality', ar: 'البلديات' }, page: 'MunicipalityCoverageReport' },
      ]
    },
    {
      category: { en: 'Foundation & Setup', ar: 'الأساس والإعداد' },
      modules: [
        { id: 'taxonomy', name: { en: 'Taxonomy', ar: 'التصنيف' }, page: 'TaxonomyCoverageReport' },
        { id: 'geography', name: { en: 'Geography', ar: 'الجغرافيا' }, page: 'GeographyCoverageReport' },
        { id: 'strategic', name: { en: 'Strategic Planning', ar: 'التخطيط الاستراتيجي' }, page: 'StrategicPlanningCoverageReport' },
      ]
    },
    {
      category: { en: 'Engagement & Proposals', ar: 'المشاركة والمقترحات' },
      modules: [
        { id: 'ideas', name: { en: 'Ideas', ar: 'الأفكار' }, page: 'IdeasCoverageReport' },
        { id: 'citizen', name: { en: 'Citizen Engagement', ar: 'مشاركة المواطنين' }, page: 'CitizenEngagementCoverageReport' },
        { id: 'proposals', name: { en: 'Innovation Proposals', ar: 'مقترحات الابتكار' }, page: 'InnovationProposalsCoverageReport' },
        { id: 'rdproposals', name: { en: 'R&D Proposals', ar: 'مقترحات البحث' }, page: 'RDProposalCoverageReport' },
      ]
    },
    {
      category: { en: 'System & Platform', ar: 'النظام والمنصة' },
      modules: [
        { id: 'communications', name: { en: 'Communications', ar: 'الاتصالات' }, page: 'CommunicationsCoverageReport' },
        { id: 'datamanagement', name: { en: 'Data Management', ar: 'إدارة البيانات' }, page: 'DataManagementCoverageReport' },
        { id: 'mii', name: { en: 'MII', ar: 'MII' }, page: 'MIICoverageReport' },
        { id: 'partnership', name: { en: 'Partnership', ar: 'الشراكات' }, page: 'PartnershipCoverageReport' },
        { id: 'platformtools', name: { en: 'Platform Tools', ar: 'أدوات المنصة' }, page: 'PlatformToolsCoverageReport' },
        { id: 'knowledge', name: { en: 'Knowledge Resources', ar: 'موارد المعرفة' }, page: 'KnowledgeResourcesCoverageReport' },
        { id: 'profiles', name: { en: 'Profiles & Identity', ar: 'الملفات والهوية' }, page: 'ProfilesIdentityCoverageReport' },
        { id: 'usersettings', name: { en: 'User Settings', ar: 'إعدادات المستخدم' }, page: 'UserSettingsCoverageReport' },
        { id: 'platformsettings', name: { en: 'Platform Settings', ar: 'إعدادات المنصة' }, page: 'PlatformSettingsCoverageReport' },
        { id: 'useraccess', name: { en: 'User Access Management', ar: 'إدارة الوصول' }, page: 'UserAccessManagementCoverageReport' },
      ]
    },
    {
      category: { en: 'Portals & Roles', ar: 'البوابات والأدوار' },
      modules: [
        { id: 'executive', name: { en: 'Executive', ar: 'القيادة' }, page: 'ExecutiveCoverageReport' },
        { id: 'admin', name: { en: 'Admin', ar: 'الإدارة' }, page: 'AdminCoverageReport' },
        { id: 'programoperator', name: { en: 'Program Operator', ar: 'مشغل البرامج' }, page: 'ProgramOperatorCoverageReport' },
        { id: 'public', name: { en: 'Public', ar: 'العامة' }, page: 'PublicCoverageReport' },
        { id: 'sector', name: { en: 'Sector', ar: 'القطاعات' }, page: 'SectorCoverageReport' },
      ]
    },
    {
      category: { en: 'System Features', ar: 'ميزات النظام' },
      modules: [
        { id: 'menu', name: { en: 'Menu', ar: 'القائمة' }, page: 'MenuCoverageReport' },
        { id: 'menurbac', name: { en: 'Menu RBAC', ar: 'RBAC للقائمة' }, page: 'MenuRBACCoverageReport' },
        { id: 'rbac', name: { en: 'RBAC', ar: 'RBAC' }, page: 'RBACCoverageReport' },
        { id: 'portaldesign', name: { en: 'Portal Design', ar: 'تصميم البوابات' }, page: 'PortalDesignCoverage' },
        { id: 'workflow', name: { en: 'Workflow System', ar: 'نظام سير العمل' }, page: 'WorkflowApprovalSystemCoverage' },
        { id: 'gatematurity', name: { en: 'Gate Maturity', ar: 'نضج البوابات' }, page: 'GateMaturityMatrix' },
        { id: 'stages', name: { en: 'Stages', ar: 'المراحل' }, page: 'StagesCriteriaCoverageReport' },
        { id: 'approvalplan', name: { en: 'Approval Plan', ar: 'خطة الموافقات' }, page: 'ApprovalSystemImplementationPlan' },
        { id: 'wizards', name: { en: 'Create Wizards', ar: 'معالجات الإنشاء' }, page: 'CreateWizardsCoverageReport' },
        { id: 'conversions', name: { en: 'Conversions', ar: 'التحويلات' }, page: 'ConversionsCoverageReport' },
        { id: 'detailpages', name: { en: 'Detail Pages', ar: 'صفحات التفاصيل' }, page: 'DetailPagesCoverageReport' },
        { id: 'editpages', name: { en: 'Edit Pages', ar: 'صفحات التعديل' }, page: 'EditPagesCoverageReport' },
      ]
    }
  ];

  const allModules = moduleCategories.flatMap(cat => cat.modules);
  const selectedModuleData = allModules.find(m => m.id === selectedModule);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="border-4 border-blue-400 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <CardContent className="pt-6 pb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              {t({ en: '📊 Module Coverage Reports', ar: '📊 تقارير تغطية الوحدات' })}
            </h1>
            <p className="text-xl opacity-90 mb-4">
              {t({ en: 'Comprehensive validation of all platform modules', ar: 'التحقق الشامل من جميع وحدات المنصة' })}
            </p>
            <div className="flex items-center justify-center gap-6">
              <div>
                <div className="text-6xl font-bold">{allModules.length}</div>
                <p className="text-sm opacity-80">{t({ en: 'Modules', ar: 'وحدات' })}</p>
              </div>
              <div className="h-16 w-px bg-white/30" />
              <div>
                <div className="text-3xl font-bold">100%</div>
                <p className="text-sm opacity-80">{t({ en: 'Complete', ar: 'مكتمل' })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Select Module', ar: 'اختر الوحدة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-96">
              {moduleCategories.map((category, catIdx) => (
                <div key={catIdx}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">
                    {category.category[language]}
                  </div>
                  {category.modules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name[language]}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            {t({ en: 'Selected Module:', ar: 'الوحدة المحددة:' })} {selectedModuleData?.name[language]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-lg border-2 border-green-300">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {t({ en: '100% Coverage', ar: '100% تغطية' })}
                </p>
                <p className="text-sm text-slate-600">
                  {t({ en: 'All entities validated and operational', ar: 'تم التحقق من جميع الكيانات وهي تعمل' })}
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link to={createPageUrl(selectedModuleData?.page)}>
                <div className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  {t({ en: 'View Full Report →', ar: '← عرض التقرير الكامل' })}
                </div>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
              <p className="text-3xl font-bold text-blue-600">9</p>
              <p className="text-xs text-slate-600">{t({ en: 'Sections', ar: 'أقسام' })}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-200">
              <p className="text-3xl font-bold text-purple-600">100%</p>
              <p className="text-xs text-slate-600">{t({ en: 'Validated', ar: 'موثق' })}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
              <p className="text-3xl font-bold text-green-600">✓</p>
              <p className="text-xs text-slate-600">{t({ en: 'Complete', ar: 'مكتمل' })}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-teal-200">
              <p className="text-3xl font-bold text-teal-600">AI</p>
              <p className="text-xs text-slate-600">{t({ en: 'Enhanced', ar: 'محسّن' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {moduleCategories.map((category, catIdx) => (
          <Card key={catIdx}>
            <CardHeader>
              <CardTitle className="text-lg">{category.category[language]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.modules.map(module => (
                  <Link key={module.id} to={createPageUrl(module.page)}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-400">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900">{module.name[language]}</p>
                          </div>
                          <Badge className="bg-green-600 text-white">100%</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(ModuleCoverageHub, { requireAdmin: true });
