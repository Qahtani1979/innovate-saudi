import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useOrganizationMutations } from '@/hooks/useOrganizationMutations';

export default function OrganizationVerificationWorkflow({ organization, onClose }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [checks, setChecks] = useState({
    identity_verified: false,
    registration_valid: false,
    contact_confirmed: false,
    credentials_checked: false
  });
  const [notes, setNotes] = useState('');

  const { verifyOrganization } = useOrganizationMutations();

  const handleVerify = () => {
    verifyOrganization.mutate({
      id: organization.id,
      notes,
      verifier: user?.email
    }, {
      onSuccess: () => {
        if (onClose) onClose();
      }
    });
  };

  return (
    <Card className="border-2 border-blue-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          {t({ en: 'Organization Verification', ar: 'التحقق من الجهة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[
            { key: 'identity_verified', label: { en: 'Identity verified', ar: 'الهوية متحقق منها' } },
            { key: 'registration_valid', label: { en: 'Registration valid', ar: 'التسجيل صالح' } },
            { key: 'contact_confirmed', label: { en: 'Contact confirmed', ar: 'التواصل مؤكد' } },
            { key: 'credentials_checked', label: { en: 'Credentials checked', ar: 'المؤهلات مفحوصة' } }
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-3 p-2 border rounded">
              <Checkbox
                checked={checks[item.key]}
                onCheckedChange={(checked) => setChecks({ ...checks, [item.key]: checked })}
              />
              <span className="text-sm">{t(item.label)}</span>
            </div>
          ))}
        </div>

        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t({ en: 'Verification notes...', ar: 'ملاحظات التحقق...' })} rows={3} />

        <Button
          onClick={handleVerify}
          disabled={!Object.values(checks).every(v => v) || verifyOrganization.isPending}
          className="w-full bg-blue-600"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {t({ en: 'Verify Organization', ar: 'التحقق من الجهة' })}
        </Button>
      </CardContent>
    </Card>
  );
}
