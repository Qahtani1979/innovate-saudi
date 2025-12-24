import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useStartupReferrals, useStartupReferralMutations } from '@/hooks/useStartupReferrals';
import { useStartupProfile } from '@/hooks/useStartupProfiles';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { Gift, Send } from 'lucide-react';

export default function StartupReferralProgram({ startupId }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const { user } = useAuth();

  const { data: startup } = useStartupProfile(startupId);
  const { data: myReferrals = [] } = useStartupReferrals(startupId, user?.email);
  const { sendReferral } = useStartupReferralMutations();

  const handleSendReferral = () => {
    sendReferral.mutate({
      startupId,
      userEmail: user?.email,
      referralEmail: email
    }, {
      onSuccess: () => setEmail('')
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-pink-600" />
          {t({ en: 'Referral Program', ar: 'برنامج الإحالة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border-2 border-pink-200">
          <p className="font-semibold text-pink-900 mb-2">
            {t({ en: 'Grow the Ecosystem', ar: 'نمو النظام البيئي' })}
          </p>
          <p className="text-sm text-slate-700">
            {t({
              en: 'Refer other startups to join the platform and discover municipal opportunities',
              ar: 'قم بإحالة شركات أخرى للانضمام إلى المنصة واكتشاف الفرص البلدية'
            })}
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder={t({ en: 'Startup email', ar: 'بريد الشركة' })}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleSendReferral} disabled={!email || sendReferral.isPending}>
            <Send className="h-4 w-4 mr-2" />
            {t({ en: 'Send', ar: 'إرسال' })}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{myReferrals.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Referrals Sent', ar: 'الإحالات المرسلة' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {myReferrals.filter(r => r.metadata?.joined).length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Joined', ar: 'انضم' })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}