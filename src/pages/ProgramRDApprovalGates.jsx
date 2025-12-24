import { usePrograms } from '@/hooks/usePrograms';
import { useRDCallsWithVisibility } from '@/hooks/useRDCallsWithVisibility';
import { useRDCallMutations } from '@/hooks/useRDCallMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Shield, CheckCircle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProgramRDApprovalGates() {
  const { language, t } = useLanguage();

  const { programs, approveProgram, rejectProgram } = usePrograms({
    filters: { approval_status: 'pending' }
  });

  const { approveRDCall, rejectRDCall, isApproving: isApprovingRD, isRejecting: isRejectingRD } = useRDCallMutations();

  const { data: rdCalls = [] } = useRDCallsWithVisibility({
    approvalStatus: 'pending'
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Shield className="h-8 w-8 text-purple-600" />
        {t({ en: 'Program & R&D Approval Gates', ar: 'بوابات موافقة البرامج والبحث' })}
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{programs.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Programs Pending', ar: 'برامج معلقة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{rdCalls.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'R&D Calls Pending', ar: 'دعوات بحث معلقة' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pending Approvals', ar: 'الموافقات المعلقة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {programs.map(program => (
            <div key={program.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">Program</Badge>
                  <h3 className="font-semibold">{language === 'ar' ? program.name_ar : program.name_en}</h3>
                  <p className="text-sm text-slate-600 mt-1">Budget: SAR {(program.funding_details?.total_pool || 0) / 1000000}M</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600"
                    onClick={() => approveProgram(program.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t({ en: 'Approve', ar: 'موافقة' })}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectProgram(program.id)}
                  >
                    {t({ en: 'Reject', ar: 'رفض' })}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {rdCalls.map(call => (
            <div key={call.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">R&D Call</Badge>
                  <h3 className="font-semibold">{language === 'ar' ? call.title_ar : call.title_en}</h3>
                  <p className="text-sm text-slate-600 mt-1">Budget: SAR {(call.budget_total || 0) / 1000000}M</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600"
                    onClick={() => approveRDCall(call.id)}
                    disabled={isApprovingRD}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t({ en: 'Approve', ar: 'موافقة' })}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectRDCall(call.id)}
                    disabled={isRejectingRD}
                  >
                    {t({ en: 'Reject', ar: 'رفض' })}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ProgramRDApprovalGates, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'Program Director', 'R&D Manager'] });