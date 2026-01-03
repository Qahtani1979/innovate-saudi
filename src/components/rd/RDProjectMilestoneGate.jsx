import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, X, FileText } from 'lucide-react';
import FileUploader from '../FileUploader';
import { useAuth } from '@/lib/AuthContext';
import { useRDProjectMutations } from '@/hooks/useRDProjectMutations';

export default function RDProjectMilestoneGate({ project, milestone, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const [deliverables, setDeliverables] = useState({});
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [approvalNotes, setApprovalNotes] = useState('');

  const { approveMilestone } = useRDProjectMutations();

  const handleApprove = () => {
    approveMilestone.mutate({
      project,
      milestoneName: milestone.name,
      approver: user?.email,
      notes: approvalNotes,
      evidence: evidenceUrls
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const expectedDeliverables = milestone.deliverables || [];

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>{t({ en: 'Milestone Gate Approval', ar: 'موافقة بوابة المعلم' })}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900">{milestone.name}</p>
          <p className="text-xs text-slate-600 mt-1">{milestone.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{t({ en: 'Due', ar: 'موعد' })}: {milestone.due_date}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">{t({ en: 'Expected Deliverables', ar: 'المخرجات المتوقعة' })}</Label>
          {expectedDeliverables.length === 0 ? (
            <p className="text-sm text-slate-500">{t({ en: 'No specific deliverables defined', ar: 'لا توجد مخرجات محددة' })}</p>
          ) : (
            <div className="space-y-2">
              {expectedDeliverables.map((deliverable, i) => (
                <div key={i} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    checked={deliverables[deliverable] || false}
                    onCheckedChange={(checked) => setDeliverables({ ...deliverables, [deliverable]: checked })}
                  />
                  <label className="text-sm flex-1 cursor-pointer">{deliverable}</label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Upload Evidence', ar: 'رفع الأدلة' })}</Label>
          <FileUploader
            type="document"
            label={t({ en: 'Upload milestone evidence documents', ar: 'رفع وثائق أدلة المعلم' })}
            maxSize={50}
            onUploadComplete={(url) => setEvidenceUrls([...evidenceUrls, url])}
          />
          {evidenceUrls.length > 0 && (
            <div className="space-y-1 mt-2">
              {evidenceUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2 p-2 border rounded bg-slate-50">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-600 flex-1">{url.split('/').pop()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEvidenceUrls(evidenceUrls.filter((_, idx) => idx !== i))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Approval Notes', ar: 'ملاحظات الموافقة' })}</Label>
          <Textarea
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder={t({ en: 'Add comments about milestone completion...', ar: 'أضف تعليقات حول إنجاز المعلم...' })}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={approveMilestone.isPending || evidenceUrls.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Approve Milestone', ar: 'الموافقة على المعلم' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
