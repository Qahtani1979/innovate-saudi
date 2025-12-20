import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { Gift, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function StartupReferralProgram({ startupId }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: startup } = useQuery({
    queryKey: ['startup-referral', startupId],
    queryFn: async () => {
      const { data } = await supabase.from('startup_profiles').select('*').eq('id', startupId).single();
      return data;
    }
  });

  const referralsMutation = useMutation({
    mutationFn: async (referralEmail) => {
      // Track referral
      await supabase.from('user_activities').insert({
        user_email: user?.email,
        activity_type: 'startup_referral',
        entity_type: 'StartupProfile',
        entity_id: startupId,
        metadata: { referred_email: referralEmail }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['startup-referral']);
      setEmail('');
      toast.success(t({ en: 'Referral sent!', ar: 'تم الإرسال!' }));
    }
  });

  const { data: myReferrals = [] } = useQuery({
    queryKey: ['my-referrals', startupId],
    queryFn: async () => {
      const { data } = await supabase.from('user_activities').select('*')
        .eq('activity_type', 'startup_referral')
        .eq('entity_id', startupId);
      return data || [];
    }
  });

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
          <Button onClick={() => referralsMutation.mutate(email)} disabled={!email}>
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