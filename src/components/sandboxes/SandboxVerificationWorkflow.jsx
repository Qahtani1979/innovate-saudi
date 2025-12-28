import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSandboxMutations } from '@/hooks/useSandboxData';

export default function SandboxVerificationWorkflow({ sandbox, onClose }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { verifySandbox } = useSandboxMutations();
  const [checklist, setChecklist] = useState({
    regulatory_framework: false,
    safety_protocols: false,
    monitoring_infrastructure: false,
    exit_criteria: false,
    insurance_coverage: false
  });
  const [notes, setNotes] = useState('');

  const allChecked = Object.values(checklist).every(v => v);

  const handleVerify = () => {
    verifySandbox.mutate({
      id: sandbox.id,
      notes,
      userEmail: user?.email,
      sandboxName: sandbox.name_en
    }, {
      onSuccess: () => {
        // toast handled by hook
        onClose?.();
      }
    });
  };

  const checklistItems = [
    { key: 'regulatory_framework', label: { en: 'Regulatory framework documented', ar: 'إطار تنظيمي موثق' } },
    { key: 'safety_protocols', label: { en: 'Safety protocols in place', ar: 'بروتوكولات السلامة جاهزة' } },
    { key: 'monitoring_infrastructure', label: { en: 'Monitoring infrastructure ready', ar: 'بنية المراقبة جاهزة' } },
    { key: 'exit_criteria', label: { en: 'Exit criteria defined', ar: 'معايير الخروج محددة' } },
    { key: 'insurance_coverage', label: { en: 'Insurance and liability covered', ar: 'التأمين والمسؤولية مغطاة' } }
  ];

  return (
    <Card className="border-2 border-green-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Shield className="h-5 w-5" />
          {t({ en: 'Sandbox Verification Gate', ar: 'بوابة التحقق من المنطقة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.key} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${checklist[item.key] ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'
              }`}>
              <Checkbox
                checked={checklist[item.key]}
                onCheckedChange={(checked) => setChecklist({ ...checklist, [item.key]: checked })}
              />
              <span className="text-sm font-medium">{t(item.label)}</span>
              {checklist[item.key] && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t({ en: 'Verification Notes', ar: 'ملاحظات التحقق' })}</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
        </div>

        <Button
          onClick={handleVerify}
          disabled={!allChecked || verifySandbox.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
          size="lg"
        >
          {allChecked ? (
            <><Shield className="h-5 w-5 mr-2" />{t({ en: 'Verify & Activate Sandbox', ar: 'التحقق وتفعيل المنطقة' })}</>
          ) : (
            <>{t({ en: 'Complete checklist to verify', ar: 'أكمل القائمة للتحقق' })}</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
