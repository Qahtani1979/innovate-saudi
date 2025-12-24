import { useState } from 'react';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Shield, CheckCircle2, XCircle, MapPin, AlertCircle } from 'lucide-react';
import SandboxAIRiskAssessment from '../components/SandboxAIRiskAssessment';
import AutomatedComplianceChecker from '../components/AutomatedComplianceChecker';
import ApprovalStageProgress from '../components/ApprovalStageProgress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { useSandboxes } from '@/hooks/useSandboxes';
import { useSandboxMutations } from '@/hooks/useSandboxMutations';
import { useAuth } from '@/lib/AuthContext';

export default function SandboxApproval() {
  const { language, isRTL, t } = useLanguage();

  const [comments, setComments] = useState({});
  const { user } = useAuth();

  const { useAllSandboxes, useSandboxApplications } = useSandboxes();
  const { data: sandboxes = [] } = useAllSandboxes({ email: user?.email, role: 'admin' }); // Assuming admin for approval page
  const { data: applications = [] } = useSandboxApplications(sandboxes);

  const pendingSandboxes = sandboxes.filter(s => s.status === 'pending_approval' || s.status === 'planning');
  const activeSandboxes = sandboxes.filter(s => s.status === 'active');
  const pendingApplications = applications.filter(a => a.status === 'pending');

  const { approveSandbox, approveSandboxApplication } = useSandboxMutations();

  const handleApproveSandbox = async (id, status) => {
    try {
      await approveSandbox({ id, newStatus: status, notes: comments[id] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveApplication = async (id, approved, projectTitle) => {
    try {
      await approveSandboxApplication({ id, approved, projectTitle });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Sandbox Approvals', ar: 'موافقات مناطق الاختبار' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Review and approve regulatory sandbox zones', ar: 'مراجعة والموافقة على مناطق الاختبار التنظيمي' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending Zones', ar: 'مناطق معلقة' })}</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingSandboxes.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending Apps', ar: 'طلبات معلقة' })}</p>
                <p className="text-3xl font-bold text-orange-600">{pendingApplications.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-3xl font-bold text-green-600">{activeSandboxes.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Capacity Used', ar: 'السعة المستخدمة' })}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {activeSandboxes.reduce((acc, s) => acc + (s.current_pilots || 0), 0)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {t({ en: 'Pending Zone Approvals', ar: 'موافقات المناطق المعلقة' })}
          </h2>
        </div>

        {pendingSandboxes.map((sandbox) => (
          <Card key={sandbox.id} className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {language === 'ar' && sandbox.name_ar ? sandbox.name_ar : sandbox.name_en}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge>{sandbox.domain?.replace(/_/g, ' ')}</Badge>
                      <span className="text-slate-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {sandbox.city_id}
                      </span>
                      <span className="text-slate-600">
                        {t({ en: 'Capacity:', ar: 'السعة:' })} {sandbox.capacity || 0}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      {language === 'ar' && sandbox.description_ar ? sandbox.description_ar : sandbox.description_en}
                    </p>
                  </div>
                  <Link to={createPageUrl(`SandboxDetail?id=${sandbox.id}`)}>
                    <Button variant="outline" size="sm">
                      {t({ en: 'View', ar: 'عرض' })}
                    </Button>
                  </Link>
                </div>

                {sandbox.available_exemptions && sandbox.available_exemptions.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-700 mb-2">
                      {t({ en: 'Regulatory Exemptions:', ar: 'الإعفاءات التنظيمية:' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sandbox.available_exemptions.map((exemption, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {exemption}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Textarea
                  placeholder={t({ en: 'Review comments...', ar: 'تعليقات المراجعة...' })}
                  value={comments[sandbox.id] || ''}
                  onChange={(e) => setComments({ ...comments, [sandbox.id]: e.target.value })}
                  rows={2}
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApproveSandbox(sandbox.id, 'active')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Activate Sandbox', ar: 'تفعيل منطقة الاختبار' })}
                  </Button>
                  <Button
                    onClick={() => handleApproveSandbox(sandbox.id, 'inactive')}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t({ en: 'Reject', ar: 'رفض' })}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {pendingSandboxes.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t({ en: 'No pending sandbox zone approvals', ar: 'لا توجد موافقات مناطق معلقة' })}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {t({ en: 'Pending Project Applications', ar: 'طلبات المشاريع المعلقة' })}
          </h2>
        </div>

        {pendingApplications.map((app) => {
          const relatedSandbox = sandboxes.find(s => s.id === app.sandbox_id);
          return (
            <div key={app.id} className="space-y-4">
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {app.project_title}
                        </h3>
                        <p className="text-sm text-slate-600">{app.applicant_organization}</p>
                        <p className="text-sm text-slate-600 mt-2">{app.project_description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge className="bg-orange-100 text-orange-700">{app.status}</Badge>
                          <span className="text-xs text-slate-500">Duration: {app.duration_months} months</span>
                        </div>
                      </div>
                    </div>

                    <ApprovalStageProgress application={app} />

                    {app.requested_exemptions && app.requested_exemptions.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-medium text-slate-700 mb-2">
                          {t({ en: 'Requested Exemptions:', ar: 'الإعفاءات المطلوبة:' })}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {app.requested_exemptions.map((exemption, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {exemption}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.risk_assessment && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs font-medium text-amber-900 mb-1">Risk Assessment:</p>
                        <p className="text-sm text-slate-700">{app.risk_assessment}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApproveApplication(app.id, true, app.project_title)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t({ en: 'Approve Application', ar: 'الموافقة على الطلب' })}
                      </Button>
                      <Button
                        onClick={() => handleApproveApplication(app.id, false, app.project_title)}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t({ en: 'Reject', ar: 'رفض' })}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {relatedSandbox && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <SandboxAIRiskAssessment application={app} sandbox={relatedSandbox} />
                  <AutomatedComplianceChecker application={app} sandbox={relatedSandbox} />
                </div>
              )}
            </div>
          );
        })}

        {pendingApplications.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t({ en: 'No pending project applications', ar: 'لا توجد طلبات مشاريع معلقة' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
