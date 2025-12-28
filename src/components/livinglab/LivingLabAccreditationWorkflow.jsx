import { useState } from 'react';
import { useLivingLabMutations } from '@/hooks/useLivingLabs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Award } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function LivingLabAccreditationWorkflow({ lab, onClose }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [criteria, setCriteria] = useState({
    infrastructure: false,
    equipment: false,
    staff_qualified: false,
    safety_compliance: false,
    research_ethics: false
  });
  const [notes, setNotes] = useState('');

  const allMet = Object.values(criteria).every(v => v);

  const { accreditLab } = useLivingLabMutations();

  const handleAccredit = () => {
    accreditLab.mutate({
      labId: lab.id,
      accreditationData: {
        accreditation_status: 'accredited',
        accreditation_date: new Date().toISOString(),
        accredited_by: user?.email,
        accreditation_notes: notes
      }
    }, {
      onSuccess: () => onClose?.()
    });
  };

  return (
    <Card className="border-2 border-teal-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-900">
          <Award className="h-5 w-5" />
          {t({ en: 'Living Lab Accreditation Gate', ar: 'بوابة اعتماد المختبر الحي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {[
            { key: 'infrastructure', label: { en: 'Infrastructure meets standards', ar: 'البنية التحتية تلبي المعايير' } },
            { key: 'equipment', label: { en: 'Equipment certified', ar: 'المعدات معتمدة' } },
            { key: 'staff_qualified', label: { en: 'Staff qualified', ar: 'الموظفون مؤهلون' } },
            { key: 'safety_compliance', label: { en: 'Safety compliance verified', ar: 'السلامة متحقق منها' } },
            { key: 'research_ethics', label: { en: 'Research ethics approved', ar: 'أخلاقيات البحث معتمدة' } }
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg border">
              <Checkbox
                checked={criteria[item.key]}
                onCheckedChange={(checked) => setCriteria({ ...criteria, [item.key]: checked })}
              />
              <span className="text-sm">{t(item.label)}</span>
            </div>
          ))}
        </div>

        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t({ en: 'Accreditation notes...', ar: 'ملاحظات الاعتماد...' })} rows={3} />

        <Button
          onClick={handleAccredit}
          disabled={!allMet || accreditLab.isPending}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600"
          size="lg"
        >
          <Award className="h-5 w-5 mr-2" />
          {t({ en: 'Grant Accreditation', ar: 'منح الاعتماد' })}
        </Button>
      </CardContent>
    </Card>
  );
}
