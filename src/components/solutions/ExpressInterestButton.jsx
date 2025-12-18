import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Heart, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function ExpressInterestButton({ solution, challenge = null, variant = "default" }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-for-interest'],
    queryFn: async () => {
      if (challenge) return [];
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .in('status', ['approved', 'in_treatment'])
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !challenge
  });

  const [formData, setFormData] = useState({
    challenge_id: challenge?.id || '',
    interest_type: challenge ? 'for_challenge' : 'general',
    message: '',
    expected_timeline: '',
    expected_budget_min: '',
    expected_budget_max: ''
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const interest = await base44.entities.SolutionInterest.create(data);
      
      // Notify provider
      await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: 'solution.interest_received',
          recipient_email: solution.contact_email || solution.support_contact_email,
          entity_type: 'solution',
          entity_id: solution.id,
          variables: {
            solutionName: solution.name_en,
            interestedByName: data.interested_by_name,
            municipalityId: data.municipality_id,
            interestType: data.interest_type,
            challengeId: data.challenge_id || null,
            expectedTimeline: data.expected_timeline || 'Not specified',
            budgetMin: data.expected_budget_min || null,
            budgetMax: data.expected_budget_max || null,
            message: data.message
          }
        }
      });

      // Log activity
      await base44.entities.SystemActivity.create({
        entity_type: 'Solution',
        entity_id: solution.id,
        activity_type: 'interest_expressed',
        description: `Interest expressed by ${data.interested_by_name}${data.challenge_id ? ' for challenge ' + data.challenge_id : ''}`,
        metadata: {
          municipality: data.municipality_id,
          challenge: data.challenge_id,
          interest_type: data.interest_type
        }
      });

      return interest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solution-activities']);
      queryClient.invalidateQueries(['solution-interests']);
      toast.success(t({ en: 'Interest expressed! Provider will be notified.', ar: 'تم إبداء الاهتمام! سيتم إشعار المزود.' }));
      setOpen(false);
      setFormData({
        challenge_id: challenge?.id || '',
        interest_type: challenge ? 'for_challenge' : 'general',
        message: '',
        expected_timeline: '',
        expected_budget_min: '',
        expected_budget_max: ''
      });
    },
    onError: () => {
      toast.error(t({ en: 'Failed to express interest', ar: 'فشل إبداء الاهتمام' }));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t({ en: 'Please login to express interest', ar: 'يرجى تسجيل الدخول' }));
      return;
    }

    const data = {
      solution_id: solution.id,
      municipality_id: user.municipality_id,
      interested_by_email: user.email,
      interested_by_name: user.full_name,
      expected_budget_range: formData.expected_budget_min ? {
        min: parseFloat(formData.expected_budget_min),
        max: parseFloat(formData.expected_budget_max),
        currency: 'SAR'
      } : null,
      ...formData
    };

    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className="gap-2">
          <Heart className="h-4 w-4" />
          {t({ en: 'Express Interest', ar: 'إبداء الاهتمام' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {t({ en: 'Express Interest', ar: 'إبداء الاهتمام' })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-slate-600">
              {t({ 
                en: `Express interest in "${solution.name_en}" to receive more information and connect with the provider.`, 
                ar: `أبدِ اهتمامك بـ "${solution.name_ar || solution.name_en}" لتلقي المزيد من المعلومات والتواصل مع المزود.` 
              })}
            </p>
          </div>

          {!challenge && challenges.length > 0 && (
            <div className="space-y-2">
              <Label>{t({ en: 'Link to Challenge (Optional)', ar: 'ربط بتحدي (اختياري)' })}</Label>
              <Select
                value={formData.challenge_id || 'none'}
                onValueChange={(v) => setFormData({ 
                  ...formData, 
                  challenge_id: v === 'none' ? null : v, 
                  interest_type: v !== 'none' ? 'for_challenge' : 'general' 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select a challenge...', ar: 'اختر تحدياً...' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t({ en: 'No specific challenge', ar: 'لا تحدي محدد' })}</SelectItem>
                  {challenges.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} - {c.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t({ en: 'Expected Timeline', ar: 'الجدول الزمني المتوقع' })}</Label>
            <Input
              value={formData.expected_timeline}
              onChange={(e) => setFormData({ ...formData, expected_timeline: e.target.value })}
              placeholder={t({ en: 'e.g., 3-6 months', ar: 'مثلاً، 3-6 أشهر' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t({ en: 'Budget Min (SAR)', ar: 'الميزانية الأدنى (ريال)' })}</Label>
              <Input
                type="number"
                value={formData.expected_budget_min}
                onChange={(e) => setFormData({ ...formData, expected_budget_min: e.target.value })}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Budget Max (SAR)', ar: 'الميزانية الأعلى (ريال)' })}</Label>
              <Input
                type="number"
                value={formData.expected_budget_max}
                onChange={(e) => setFormData({ ...formData, expected_budget_max: e.target.value })}
                placeholder="500000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Message to Provider', ar: 'رسالة للمزود' })}</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              placeholder={t({ 
                en: 'Describe your needs and how this solution could help...', 
                ar: 'صف احتياجاتك وكيف يمكن لهذا الحل المساعدة...' 
              })}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Sending...', ar: 'جاري الإرسال...' })}
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  {t({ en: 'Express Interest', ar: 'إبداء الاهتمام' })}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}