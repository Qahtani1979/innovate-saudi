import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { Shield, CheckCircle2, Circle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useGovernanceMutations } from '@/hooks/useGovernance';

function ComplianceGateChecklist({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [notes, setNotes] = useState('');
  const { passComplianceGate } = useGovernanceMutations();

  const complianceChecks = [
    {
      id: 'regulatory_approval',
      category: 'regulatory',
      label: { en: 'Regulatory approvals obtained', ar: 'الحصول على الموافقات التنظيمية' },
      critical: true
    },
    {
      id: 'safety_protocols',
      category: 'safety',
      label: { en: 'Safety protocols in place', ar: 'بروتوكولات السلامة جاهزة' },
      critical: true
    },
    {
      id: 'data_privacy',
      category: 'legal',
      label: { en: 'Data privacy compliance verified', ar: 'التحقق من الامتثال لخصوصية البيانات' },
      critical: true
    },
    {
      id: 'insurance',
      category: 'legal',
      label: { en: 'Insurance coverage confirmed', ar: 'تأكيد التغطية التأمينية' },
      critical: true
    },
    {
      id: 'environmental',
      category: 'regulatory',
      label: { en: 'Environmental impact assessed', ar: 'تقييم الأثر البيئي' },
      critical: false
    },
    {
      id: 'permits',
      category: 'regulatory',
      label: { en: 'All required permits secured', ar: 'تأمين جميع التصاريح المطلوبة' },
      critical: true
    },
    {
      id: 'ethical_review',
      category: 'legal',
      label: { en: 'Ethical review completed', ar: 'اكتمال المراجعة الأخلاقية' },
      critical: false
    },
    {
      id: 'stakeholder_consent',
      category: 'legal',
      label: { en: 'Stakeholder consent obtained', ar: 'الحصول على موافقة الأطراف' },
      critical: true
    },
    {
      id: 'sandbox_exemptions',
      category: 'regulatory',
      label: { en: 'Sandbox exemptions documented', ar: 'توثيق الإعفاءات التنظيمية' },
      critical: pilot.sandbox_id ? true : false
    }
  ];

  const [checklist, setChecklist] = useState(
    complianceChecks.reduce((acc, check) => ({ ...acc, [check.id]: false }), {})
  );

  const handlePassCompliance = () => {
    passComplianceGate.mutate({
      pilotId: pilot.id,
      pilotTitle: pilot.title_en,
      checklist,
      notes
    }, {
      onSuccess: () => {
        if (onClose) onClose();
      }
    });
  };

  const allCriticalPassed = complianceChecks
    .filter(c => c.critical)
    .every(c => checklist[c.id]);

  const categories = {
    regulatory: { label: { en: 'Regulatory', ar: 'تنظيمي' }, color: 'bg-blue-100 text-blue-700' },
    safety: { label: { en: 'Safety', ar: 'السلامة' }, color: 'bg-red-100 text-red-700' },
    legal: { label: { en: 'Legal', ar: 'قانوني' }, color: 'bg-purple-100 text-purple-700' }
  };

  return (
    <Card className="border-2 border-blue-300" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {t({ en: 'Compliance Gate', ar: 'بوابة الامتثال' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                {t({ en: 'Compliance Checkpoint', ar: 'نقطة تفتيش الامتثال' })}
              </p>
              <p className="text-xs text-blue-700">
                {t({ en: 'Verify all regulatory, safety, and legal requirements before proceeding', ar: 'تحقق من جميع المتطلبات التنظيمية والسلامة والقانونية قبل المتابعة' })}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(categories).map(([catKey, catInfo]) => {
            const catChecks = complianceChecks.filter(c => c.category === catKey);
            if (catChecks.length === 0) return null;

            return (
              <div key={catKey} className="space-y-2">
                <Badge className={catInfo.color}>{catInfo.label[language]}</Badge>
                {catChecks.map(check => (
                  <div
                    key={check.id}
                    className={`p-3 border rounded-lg flex items-center justify-between transition-all ${checklist[check.id] ? 'bg-green-50 border-green-300' : 'bg-white hover:border-blue-300'
                      }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => setChecklist({ ...checklist, [check.id]: !checklist[check.id] })}
                        className="flex-shrink-0"
                        disabled={passComplianceGate.isPending}
                      >
                        {checklist[check.id] ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${checklist[check.id] ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {check.label[language]}
                        </p>
                        {check.critical && (
                          <Badge variant="outline" className="text-xs mt-1 border-red-300 text-red-700">
                            {t({ en: 'Critical', ar: 'حرج' })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {!allCriticalPassed && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <p className="text-xs text-red-900">
              {t({ en: 'All critical items must be checked before passing compliance gate', ar: 'يجب فحص جميع البنود الحرجة قبل تجاوز بوابة الامتثال' })}
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Compliance Notes', ar: 'ملاحظات الامتثال' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Add any compliance notes or conditions...', ar: 'أضف أي ملاحظات أو شروط للامتثال...' })}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={passComplianceGate.isPending}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handlePassCompliance}
            disabled={!allCriticalPassed || passComplianceGate.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600"
          >
            {passComplianceGate.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <Shield className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Pass Compliance Gate', ar: 'تجاوز بوابة الامتثال' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ComplianceGateChecklist;
