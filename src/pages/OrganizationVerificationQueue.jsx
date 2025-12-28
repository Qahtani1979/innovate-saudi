import { useOrganizationVerificationData } from '@/hooks/useOrganizationVerificationData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Shield, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useAuth } from '@/lib/AuthContext';

function OrganizationVerificationQueue() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { organizations, verifyOrganization } = useOrganizationVerificationData(user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Organization Verification Queue', ar: 'قائمة التحقق من المنظمات' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Verify organizations before they can participate', ar: 'التحقق من المنظمات قبل المشاركة' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t({ en: 'Pending Verifications', ar: 'التحققات المعلقة' })} ({organizations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOrg?.id === org.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{org.name_en}</h3>
                      <Badge className="mt-1">{org.org_type?.replace(/_/g, ' ')}</Badge>
                      {org.sectors?.length > 0 && (
                        <p className="text-xs text-slate-600 mt-2">{org.sectors.join(', ')}</p>
                      )}
                    </div>
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              ))}
              {organizations.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-slate-600">{t({ en: 'No pending verifications', ar: 'لا توجد تحققات معلقة' })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              {t({ en: 'Verification Checklist', ar: 'قائمة التحقق' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedOrg ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-3">{selectedOrg.name_en}</h4>
                  <Link to={createPageUrl(`OrganizationDetail?id=${selectedOrg.id}`)}>
                    <Button variant="outline" size="sm" className="w-full mb-4">
                      {t({ en: 'View Full Profile', ar: 'عرض الملف الكامل' })}
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={verificationData.legal_verified}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, legal_verified: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t({ en: 'Legal Verification', ar: 'التحقق القانوني' })}</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Registration, licenses', ar: 'التسجيل، الرخص' })}</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={verificationData.financial_verified}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, financial_verified: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t({ en: 'Financial Verification', ar: 'التحقق المالي' })}</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Financial health, funding', ar: 'الصحة المالية، التمويل' })}</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={verificationData.operational_verified}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, operational_verified: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t({ en: 'Operational Verification', ar: 'التحقق التشغيلي' })}</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Capacity, team', ar: 'القدرة، الفريق' })}</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={verificationData.technical_verified}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, technical_verified: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t({ en: 'Technical Verification', ar: 'التحقق التقني' })}</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Capabilities, expertise', ar: 'القدرات، الخبرة' })}</p>
                    </div>
                  </label>
                </div>

                <Textarea
                  placeholder={t({ en: 'Verification notes...', ar: 'ملاحظات التحقق...' })}
                  value={verificationData.verification_notes}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, verification_notes: e.target.value }))}
                  className="min-h-20"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      verifyOrganization.mutate(
                        { orgId: selectedOrg.id, decision: 'verified', verificationData },
                        {
                          onSuccess: () => {
                            toast.success(t({ en: 'Verification completed', ar: 'اكتمل التحقق' }));
                            setSelectedOrg(null);
                            setVerificationData({
                              legal_verified: false,
                              financial_verified: false,
                              operational_verified: false,
                              technical_verified: false,
                              verification_notes: '',
                              risk_flags: []
                            });
                          }
                        }
                      );
                    }}
                    disabled={verifyOrganization.isPending}
                    className="flex-1 bg-green-600"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Verify', ar: 'تحقق' })}
                  </Button>
                  <Button
                    onClick={() => {
                      verifyOrganization.mutate(
                        { orgId: selectedOrg.id, decision: 'rejected', verificationData },
                        {
                          onSuccess: () => {
                            toast.success(t({ en: 'Verification completed', ar: 'اكتمل التحقق' }));
                            setSelectedOrg(null);
                            setVerificationData({
                              legal_verified: false,
                              financial_verified: false,
                              operational_verified: false,
                              technical_verified: false,
                              verification_notes: '',
                              risk_flags: []
                            });
                          }
                        }
                      );
                    }}
                    disabled={verifyOrganization.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t({ en: 'Reject', ar: 'رفض' })}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">{t({ en: 'Select an organization to verify', ar: 'اختر منظمة للتحقق' })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(OrganizationVerificationQueue, { requireAdmin: true });
