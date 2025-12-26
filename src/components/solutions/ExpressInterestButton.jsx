import { useState } from 'react';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
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
import { useExpressInterest } from '@/hooks/useSolutionInteractions';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';

export default function ExpressInterestButton({ solution, challenge = null, variant = "default" }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useAppQueryClient();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Fetch approved/in_treatment challenges for linking
  const { challenges: allChallenges = [] } = useChallengesWithVisibility({ enabled: !challenge });
  const challenges = challenge
    ? []
    : allChallenges.filter(c => ['approved', 'in_treatment'].includes(c.status)).slice(0, 50);

  const [formData, setFormData] = useState({
    challenge_id: challenge?.id || '',
    interest_type: challenge ? 'for_challenge' : 'general',
    message: '',
    expected_timeline: '',
    expected_budget_min: '',
    expected_budget_max: ''
  });

  const createMutation = useExpressInterest();

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

    createMutation.mutate({ solution, data, user }, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          challenge_id: challenge?.id || '',
          interest_type: challenge ? 'for_challenge' : 'general',
          message: '',
          expected_timeline: '',
          expected_budget_min: '',
          expected_budget_max: ''
        });
      }
    });
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

