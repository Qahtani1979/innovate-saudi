import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from './LanguageContext';
import { Award, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LivingLabAccreditationWorkflow({ lab, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const accreditationCriteria = [
    { id: 'safety_standards', label: { en: 'Safety standards compliance', ar: 'الامتثال لمعايير السلامة' } },
    { id: 'quality_management', label: { en: 'Quality management system', ar: 'نظام إدارة الجودة' } },
    { id: 'technical_capabilities', label: { en: 'Technical capabilities verified', ar: 'القدرات التقنية موثقة' } },
    { id: 'staff_qualifications', label: { en: 'Staff qualifications validated', ar: 'مؤهلات الموظفين موثقة' } },
    { id: 'equipment_calibration', label: { en: 'Equipment calibrated and certified', ar: 'المعدات معايرة ومعتمدة' } },
    { id: 'data_management', label: { en: 'Data management protocols', ar: 'بروتوكولات إدارة البيانات' } }
  ];

  const [criteria, setCriteria] = useState(
    accreditationCriteria.reduce((acc, c) => ({ ...acc, [c.id]: false }), {})
  );

  const [accreditationData, setAccreditationData] = useState({
    accreditation_body: '',
    accreditation_level: 'national',
    certificate_url: '',
    valid_until: '',
    auditor_name: '',
    audit_notes: ''
  });

  const accreditationMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.LivingLab.update(lab.id, {
        accreditation_status: 'accredited',
        accreditation_details: {
          ...accreditationData,
          criteria_met: criteria,
          accreditation_date: new Date().toISOString().split('T')[0]
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['living-lab']);
      toast.success(t({ en: 'Accreditation recorded', ar: 'تم تسجيل الاعتماد' }));
      onClose();
    }
  });

  const allCriteriaChecked = Object.values(criteria).every(Boolean);

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          {t({ en: 'Lab Accreditation', ar: 'اعتماد المختبر' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-900">{lab?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">Accreditation Process</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            {t({ en: 'Accreditation Criteria', ar: 'معايير الاعتماد' })}
          </p>
          {accreditationCriteria.map((criterion) => (
            <div key={criterion.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
              <Checkbox
                checked={criteria[criterion.id]}
                onCheckedChange={(checked) => setCriteria({ ...criteria, [criterion.id]: checked })}
                className="mt-0.5"
              />
              <p className="text-sm text-slate-900">{criterion.label[isRTL ? 'ar' : 'en']}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Accreditation Body', ar: 'الجهة المانحة' })}
            </label>
            <Input
              value={accreditationData.accreditation_body}
              onChange={(e) => setAccreditationData({ ...accreditationData, accreditation_body: e.target.value })}
              placeholder="e.g., SASO, ISO"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Level', ar: 'المستوى' })}
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={accreditationData.accreditation_level}
              onChange={(e) => setAccreditationData({ ...accreditationData, accreditation_level: e.target.value })}
            >
              <option value="national">National</option>
              <option value="regional">Regional</option>
              <option value="international">International</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 mb-1 block">
            {t({ en: 'Valid Until', ar: 'صالح حتى' })}
          </label>
          <Input
            type="date"
            value={accreditationData.valid_until}
            onChange={(e) => setAccreditationData({ ...accreditationData, valid_until: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 mb-1 block">
            {t({ en: 'Auditor Name', ar: 'اسم المدقق' })}
          </label>
          <Input
            value={accreditationData.auditor_name}
            onChange={(e) => setAccreditationData({ ...accreditationData, auditor_name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Audit Notes', ar: 'ملاحظات التدقيق' })}
          </label>
          <Textarea
            value={accreditationData.audit_notes}
            onChange={(e) => setAccreditationData({ ...accreditationData, audit_notes: e.target.value })}
            rows={3}
            placeholder={t({ en: 'Audit findings and recommendations...', ar: 'نتائج التدقيق والتوصيات...' })}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => accreditationMutation.mutate()}
            disabled={!allCriteriaChecked || !accreditationData.accreditation_body || accreditationMutation.isPending}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            {accreditationMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Award className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Complete Accreditation', ar: 'إكمال الاعتماد' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}