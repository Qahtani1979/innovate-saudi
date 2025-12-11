import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Heart, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function ExpressInterestButton({ challenge }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [interestType, setInterestType] = useState('solution_provider');
  const [notes, setNotes] = useState('');

  const { data: existingInterest } = useQuery({
    queryKey: ['my-interest', challenge.id, user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_interests')
        .select('*')
        .eq('challenge_id', challenge.id)
        .eq('user_email', user?.email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!challenge
  });

  const expressMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('challenge_interests')
        .insert({
          challenge_id: challenge.id,
          user_email: user?.email,
          interest_type: interestType,
          notes,
          status: 'watching'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-interest']);
      toast.success(t({ en: 'Interest registered!', ar: 'تم تسجيل الاهتمام!' }));
      setDialogOpen(false);
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('challenge_interests')
        .update({ status: 'no_longer_interested' })
        .eq('id', existingInterest.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-interest']);
      toast.success(t({ en: 'Interest withdrawn', ar: 'تم سحب الاهتمام' }));
    }
  });

  if (existingInterest && existingInterest.status === 'watching') {
    return (
      <Button
        variant="outline"
        onClick={() => withdrawMutation.mutate()}
        disabled={withdrawMutation.isPending}
        className="border-green-300 text-green-700"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {t({ en: 'Watching', ar: 'مُراقب' })}
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="outline"
        className="border-blue-300 text-blue-700 hover:bg-blue-50"
      >
        <Heart className="h-4 w-4 mr-2" />
        {t({ en: 'Express Interest', ar: 'إبداء اهتمام' })}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {t({ en: 'Express Interest in Challenge', ar: 'إبداء اهتمام بالتحدي' })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border">
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Challenge', ar: 'التحدي' })}</p>
              <p className="font-semibold text-slate-900 text-sm">{challenge.title_en}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t({ en: 'Interest Type', ar: 'نوع الاهتمام' })}
              </label>
              <Select value={interestType} onValueChange={setInterestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solution_provider">{t({ en: 'Solution Provider', ar: 'مزود حلول' })}</SelectItem>
                  <SelectItem value="research_partner">{t({ en: 'Research Partner', ar: 'شريك بحثي' })}</SelectItem>
                  <SelectItem value="co_innovator">{t({ en: 'Co-Innovator', ar: 'مبتكر مشارك' })}</SelectItem>
                  <SelectItem value="observer">{t({ en: 'Observer', ar: 'مراقب' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t({ en: 'Notes (Optional)', ar: 'ملاحظات (اختياري)' })}
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t({ en: 'Why interested / initial thoughts...', ar: 'لماذا مهتم / أفكار أولية...' })}
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={() => expressMutation.mutate()}
                disabled={expressMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                {expressMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Submitting...', ar: 'جاري الإرسال...' })}
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    {t({ en: 'Express Interest', ar: 'إبداء اهتمام' })}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
