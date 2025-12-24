import { useState } from 'react';

import { useStartups, useStartupProfiles } from '../hooks/useStartupProfiles';
import { useStartupVerifications, useStartupVerificationMutations } from '../hooks/useStartupVerification';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../components/LanguageContext';
import {
  Shield, CheckCircle2, XCircle, Clock, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function StartupVerificationQueue() {
  const { language, isRTL, t } = useLanguage();

  const [selectedStartup, setSelectedStartup] = useState(null);
  const [verificationData, setVerificationData] = useState({
    legal_verification: { cr_number_verified: false, company_registered: false, documents_valid: false },
    financial_verification: { financial_statements_reviewed: false, funding_verified: false, financial_health_score: 0 },
    team_verification: { founders_verified: false, team_size_confirmed: false, expertise_validated: false },
    product_verification: { product_exists: false, traction_verified: false, references_checked: false }
  });
  const [notes, setNotes] = useState('');

  const { data: startups = [], isLoading } = useStartups();

  const { data: verifications = [] } = useStartupVerifications();

  const { verifyStartup } = useStartupVerificationMutations();

  // Wrapper to match old mutation signature if needed, or update call sites
  const verifyMutation = {
    mutate: (variables) => verifyStartup.mutate({
      startupId: variables.startupId,
      status: variables.status,
      verificationData,
      notes,
      score: variables.score
    })
  };

  const pendingStartups = startups.filter(s =>
    !s.is_verified && !verifications.some(v => v.startup_profile_id === s.id && v.status !== 'rejected')
  );

  const calculateScore = () => {
    const checks = [
      verificationData.legal_verification.cr_number_verified,
      verificationData.legal_verification.company_registered,
      verificationData.legal_verification.documents_valid,
      verificationData.financial_verification.financial_statements_reviewed,
      verificationData.financial_verification.funding_verified,
      verificationData.team_verification.founders_verified,
      verificationData.team_verification.team_size_confirmed,
      verificationData.team_verification.expertise_validated,
      verificationData.product_verification.product_exists,
      verificationData.product_verification.traction_verified,
      verificationData.product_verification.references_checked
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Shield}
        title={t({ en: 'Startup Verification Queue', ar: 'قائمة التحقق من الشركات' })}
        description={t({ en: 'Verify startup credentials, legal status, and capabilities', ar: 'التحقق من بيانات الشركة والوضع القانوني والقدرات' })}
        stats={[
          { icon: Clock, value: pendingStartups.length, label: t({ en: 'Pending', ar: 'معلق' }) },
          { icon: CheckCircle2, value: startups.filter(s => s.is_verified).length, label: t({ en: 'Verified', ar: 'معتمدة' }) },
          { icon: Building2, value: startups.length, label: t({ en: 'Total', ar: 'الإجمالي' }) },
        ]}
      />

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{pendingStartups.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{startups.filter(s => s.is_verified).length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Verified', ar: 'معتمدة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 text-center">
            <Shield className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{startups.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pending Verification', ar: 'معلق للتحقق' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingStartups.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No startups pending verification', ar: 'لا توجد شركات معلقة' })}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingStartups.map((startup) => (
                <Card key={startup.id} className="hover:shadow-md transition-all">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{startup.name_en}</h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                          <Building2 className="h-4 w-4" />
                          {startup.stage} • {startup.team_size} team
                        </div>
                      </div>
                      <Button size="sm" onClick={() => setSelectedStartup(startup)}>
                        {t({ en: 'Verify', ar: 'تحقق' })}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStartup && (
        <Card className="border-2 border-blue-400">
          <CardHeader>
            <CardTitle>{t({ en: 'Verify Startup', ar: 'التحقق من الشركة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-slate-50 rounded">
              <h4 className="font-bold text-slate-900">{selectedStartup.name_en}</h4>
              <p className="text-sm text-slate-600 mt-1">{selectedStartup.description_en}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-semibold text-slate-900">{t({ en: 'Legal Verification', ar: 'التحقق القانوني' })}</h5>
                {['cr_number_verified', 'company_registered', 'documents_valid'].map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      checked={verificationData.legal_verification[key]}
                      onCheckedChange={(checked) => setVerificationData(prev => ({
                        ...prev,
                        legal_verification: { ...prev.legal_verification, [key]: checked }
                      }))}
                    />
                    <label className="text-sm">{key.replace(/_/g, ' ')}</label>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-slate-900">{t({ en: 'Financial Verification', ar: 'التحقق المالي' })}</h5>
                {['financial_statements_reviewed', 'funding_verified'].map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      checked={verificationData.financial_verification[key]}
                      onCheckedChange={(checked) => setVerificationData(prev => ({
                        ...prev,
                        financial_verification: { ...prev.financial_verification, [key]: checked }
                      }))}
                    />
                    <label className="text-sm">{key.replace(/_/g, ' ')}</label>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-slate-900">{t({ en: 'Team Verification', ar: 'التحقق من الفريق' })}</h5>
                {['founders_verified', 'team_size_confirmed', 'expertise_validated'].map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      checked={verificationData.team_verification[key]}
                      onCheckedChange={(checked) => setVerificationData(prev => ({
                        ...prev,
                        team_verification: { ...prev.team_verification, [key]: checked }
                      }))}
                    />
                    <label className="text-sm">{key.replace(/_/g, ' ')}</label>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-slate-900">{t({ en: 'Product Verification', ar: 'التحقق من المنتج' })}</h5>
                {['product_exists', 'traction_verified', 'references_checked'].map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      checked={verificationData.product_verification[key]}
                      onCheckedChange={(checked) => setVerificationData(prev => ({
                        ...prev,
                        product_verification: { ...prev.product_verification, [key]: checked }
                      }))}
                    />
                    <label className="text-sm">{key.replace(/_/g, ' ')}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Verification Notes', ar: 'ملاحظات التحقق' })}
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="p-4 bg-blue-50 rounded">
              <p className="text-sm text-slate-600 mb-1">{t({ en: 'Verification Score', ar: 'نقاط التحقق' })}</p>
              <p className="text-4xl font-bold text-blue-600">{calculateScore()}%</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedStartup(null)} className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                variant="destructive"
                onClick={() => verifyMutation.mutate({ startupId: selectedStartup.id, status: 'rejected', score: calculateScore() })}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t({ en: 'Reject', ar: 'رفض' })}
              </Button>
              <Button
                className="flex-1 bg-green-600"
                onClick={() => verifyMutation.mutate({ startupId: selectedStartup.id, status: 'verified', score: calculateScore() })}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Verify', ar: 'تحقق' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(StartupVerificationQueue, { requireAdmin: true });