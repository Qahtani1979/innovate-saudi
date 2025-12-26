import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { Shield, FileText, History, AlertTriangle, CheckCircle2, Clock, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import RegulatoryVersionHistory from '../components/RegulatoryVersionHistory';
import { useRegulatoryExemption, useExemptionAuditLogs } from '@/hooks/useRegulatoryExemptions';
import { useSandboxApplications } from '@/hooks/useSandboxApplications';

export default function RegulatoryExemptionDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const exemptionId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();

  const { data: exemption, isLoading } = useRegulatoryExemption(exemptionId);
  const { data: auditLogs = [] } = useExemptionAuditLogs(exemptionId);
  const { data: allApplications = [] } = useSandboxApplications();

  // Filter applications client-side for now
  const applications = exemption
    ? allApplications.filter(a => a.requested_exemptions?.includes(exemption?.title_en))
    : [];

  if (isLoading || !exemption) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700'
  };

  const actionIcons = {
    granted: CheckCircle2,
    renewed: CheckCircle2,
    modified: FileText,
    revoked: AlertTriangle,
    expired: Clock,
    violated: AlertTriangle
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                  {exemption.exemption_code}
                </Badge>
                <Badge className={statusColors[exemption.status]}>
                  {exemption.status}
                </Badge>
                {exemption.risk_level && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                    {exemption.risk_level} risk
                  </Badge>
                )}
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                  v{exemption.version}
                </Badge>
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && exemption.title_ar ? exemption.title_ar : exemption.title_en}
              </h1>
              {exemption.title_ar && exemption.title_en && (
                <p className="text-xl text-white/90">
                  {language === 'en' ? exemption.title_ar : exemption.title_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>{exemption.category?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{exemption.domain?.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('RegulatoryLibrary')}>
                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  {t({ en: 'Library', ar: 'المكتبة' })}
                </Button>
              </Link>
              <Button className="bg-white text-violet-600 hover:bg-white/90">
                {t({ en: 'Edit', ar: 'تعديل' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Times Used', ar: 'مرات الاستخدام' })}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {auditLogs.filter(l => l.action === 'granted').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'المشاريع النشطة' })}</p>
                <p className="text-3xl font-bold text-green-600">{applications.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Duration', ar: 'المدة' })}</p>
                <p className="text-3xl font-bold text-amber-600">
                  {exemption.duration_months}
                  <span className="text-base ml-1">mo</span>
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Versions', ar: 'الإصدارات' })}</p>
                <p className="text-3xl font-bold text-purple-600">{exemption.version}</p>
              </div>
              <History className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'Quick Info', ar: 'معلومات سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Category', ar: 'الفئة' })}</p>
              <p className="text-sm font-medium capitalize">{exemption.category?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Domain', ar: 'المجال' })}</p>
              <p className="text-sm font-medium capitalize">{exemption.domain?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Approval Authority', ar: 'جهة الموافقة' })}</p>
              <p className="text-sm">{exemption.approval_authority}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Renewable', ar: 'قابل للتجديد' })}</p>
              <p className="text-sm">{exemption.renewal_allowed ? 'Yes' : 'No'}</p>
            </div>
            {exemption.effective_date && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Effective Date', ar: 'تاريخ السريان' })}</p>
                <p className="text-sm">{exemption.effective_date}</p>
              </div>
            )}
            {exemption.expiration_date && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Expires', ar: 'ينتهي' })}</p>
                <p className="text-sm">{exemption.expiration_date}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="conditions" className="flex flex-col gap-1 py-3">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Conditions', ar: 'شروط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex flex-col gap-1 py-3">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Usage', ar: 'استخدام' })}</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex flex-col gap-1 py-3">
                <History className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Audit', ar: 'سجل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="versions" className="flex flex-col gap-1 py-3">
                <Clock className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Versions', ar: 'إصدارات' })}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Description', ar: 'الوصف' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {exemption.description_en}
                  </p>
                  {exemption.description_ar && (
                    <div className="pt-4 border-t" dir="rtl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {exemption.description_ar}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Legal Basis', ar: 'الأساس القانوني' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">{exemption.legal_basis}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conditions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Conditions & Requirements', ar: 'الشروط والمتطلبات' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {exemption.conditions && exemption.conditions.length > 0 ? (
                    <ul className="space-y-3">
                      {exemption.conditions.map((condition, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                          <span className="text-sm text-slate-700">{condition}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      {t({ en: 'No specific conditions listed', ar: 'لا توجد شروط محددة' })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Active Applications', ar: 'التطبيقات النشطة' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {applications.length > 0 ? (
                    <div className="space-y-3">
                      {applications.map((app) => (
                        <div key={app.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                          <h4 className="font-semibold text-slate-900">{app.project_title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{app.applicant_organization}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge>{app.status}</Badge>
                            <span className="text-xs text-slate-500">
                              {app.start_date} - {app.end_date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      {t({ en: 'No active applications using this exemption', ar: 'لا توجد تطبيقات نشطة تستخدم هذا الإعفاء' })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Complete Audit Trail', ar: 'سجل المراجعة الكامل' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {auditLogs.length > 0 ? (
                    <div className="space-y-3">
                      {auditLogs.map((log) => {
                        const Icon = actionIcons[log.action] || FileText;
                        return (
                          <div key={log.id} className="flex gap-3 p-4 bg-slate-50 rounded-lg">
                            <Icon className="h-5 w-5 text-slate-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <p className="font-medium text-slate-900 capitalize">
                                  {log.action.replace(/_/g, ' ')}
                                </p>
                                <span className="text-xs text-slate-500">
                                  {new Date(log.action_date).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">{log.reason}</p>
                              {log.performed_by && (
                                <p className="text-xs text-slate-500 mt-1">By: {log.performed_by}</p>
                              )}
                              {log.compliance_check_result && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                  {log.compliance_check_result}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      {t({ en: 'No audit history', ar: 'لا يوجد سجل مراجعة' })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="mt-6">
              <RegulatoryVersionHistory exemption={exemption} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
