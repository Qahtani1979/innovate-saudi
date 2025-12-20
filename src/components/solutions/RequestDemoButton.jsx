import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Calendar, Loader2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function RequestDemoButton({ solution, challenge = null }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    preferred_date: '',
    preferred_time: '',
    message: '',
    demo_type: 'online',
    attendee_count: 1
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: demoRequest, error } = await supabase
        .from('demo_requests')
        .insert(data)
        .select()
        .single();
      if (error) throw error;

      // Log activity
      await supabase.from('system_activities').insert({
        entity_type: 'Solution',
        entity_id: solution.id,
        activity_type: 'demo_requested',
        description: `Demo requested by ${data.requester_name}`,
        metadata: {
          requester: data.requester_email,
          municipality: data.municipality_id,
          demo_type: data.demo_type
        }
      });

      return demoRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-activities'] });
      toast.success(t({ en: 'Demo request sent to provider!', ar: 'تم إرسال طلب العرض للمزود!' }));
      setOpen(false);
      setFormData({
        preferred_date: '',
        preferred_time: '',
        message: '',
        demo_type: 'online',
        attendee_count: 1
      });
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to send demo request', ar: 'فشل إرسال طلب العرض' }));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t({ en: 'Please login to request a demo', ar: 'يرجى تسجيل الدخول لطلب عرض' }));
      return;
    }

    const data = {
      solution_id: solution.id,
      challenge_id: challenge?.id,
      municipality_id: user.municipality_id,
      requester_email: user.email,
      requester_name: user.full_name,
      requester_role: user.role,
      ...formData
    };

    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Video className="h-4 w-4" />
          {t({ en: 'Request Demo', ar: 'طلب عرض تجريبي' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {t({ en: 'Request Demo', ar: 'طلب عرض تجريبي' })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-4">
              {t({ 
                en: `Request a demo of "${solution.name_en}"`, 
                ar: `طلب عرض تجريبي لـ "${solution.name_ar || solution.name_en}"` 
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Preferred Date', ar: 'التاريخ المفضل' })}</Label>
            <Input
              type="date"
              value={formData.preferred_date}
              onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Preferred Time', ar: 'الوقت المفضل' })}</Label>
            <Input
              type="time"
              value={formData.preferred_time}
              onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Demo Type', ar: 'نوع العرض' })}</Label>
            <Select
              value={formData.demo_type}
              onValueChange={(v) => setFormData({ ...formData, demo_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">{t({ en: 'Online', ar: 'عبر الإنترنت' })}</SelectItem>
                <SelectItem value="on_site">{t({ en: 'On-site', ar: 'في الموقع' })}</SelectItem>
                <SelectItem value="hybrid">{t({ en: 'Hybrid', ar: 'مختلط' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Number of Attendees', ar: 'عدد الحضور' })}</Label>
            <Input
              type="number"
              min="1"
              value={formData.attendee_count}
              onChange={(e) => setFormData({ ...formData, attendee_count: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Message to Provider', ar: 'رسالة للمزود' })}</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              placeholder={t({ 
                en: 'Any specific requirements or questions...', 
                ar: 'أي متطلبات أو أسئلة محددة...' 
              })}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Sending...', ar: 'جاري الإرسال...' })}
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  {t({ en: 'Send Request', ar: 'إرسال الطلب' })}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}