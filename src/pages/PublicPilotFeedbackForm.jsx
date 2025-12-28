import { useState } from 'react';
import { usePublicPilot, usePublicFeedbackMutation } from '@/hooks/usePublicData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../components/LanguageContext';
import { MessageSquare, Send, Star, CheckCircle2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PublicPilotFeedbackForm() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const pilotId = urlParams.get('pilot_id');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    feedback_text: '',
    rating: 5,
    satisfaction_score: 5,
    citizen_name: '',
    citizen_email: '',
    citizen_phone: '',
    concerns: ''
  });

  const { data: pilot } = usePublicPilot(pilotId);

  const submitFeedbackMutation = usePublicFeedbackMutation({
    onSuccess: () => setSubmitted(true)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitFeedbackMutation.mutate({ pilotId, ...formData });
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              {t({ en: 'Feedback Submitted!', ar: 'تم إرسال ملاحظاتك!' })}
            </h2>
            <p className="text-slate-600 mb-6">
              {t({ en: 'Your feedback helps improve our services. Thank you for participating!', ar: 'ملاحظاتك تساعد في تحسين خدماتنا. شكراً لمشاركتك!' })}
            </p>
            <Button asChild>
              <a href="/">{t({ en: 'Back to Home', ar: 'العودة للرئيسية' })}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Share Your Feedback', ar: 'شارك ملاحظاتك' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Help us improve by sharing your experience', ar: 'ساعدنا في التحسين من خلال مشاركة تجربتك' })}
        </p>
        {pilot && (
          <p className="text-sm text-purple-600 mt-2">
            {t({ en: 'Pilot:', ar: 'التجربة:' })} {pilot.title_en || pilot.title_ar}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              {t({ en: 'Your Feedback', ar: 'ملاحظاتك' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t({ en: 'Your Name', ar: 'اسمك' })}</Label>
                <Input
                  value={formData.citizen_name}
                  onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                  placeholder={t({ en: 'Name (optional)', ar: 'الاسم (اختياري)' })}
                />
              </div>
              <div>
                <Label>{t({ en: 'Email', ar: 'البريد الإلكتروني' })}</Label>
                <Input
                  type="email"
                  value={formData.citizen_email}
                  onChange={(e) => setFormData({ ...formData, citizen_email: e.target.value })}
                  placeholder={t({ en: 'Email (optional)', ar: 'البريد (اختياري)' })}
                />
              </div>
            </div>

            <div>
              <Label>{t({ en: 'Overall Rating', ar: 'التقييم العام' })}</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star, satisfaction_score: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>{t({ en: 'Your Experience', ar: 'تجربتك' })} *</Label>
              <Textarea
                required
                value={formData.feedback_text}
                onChange={(e) => setFormData({ ...formData, feedback_text: e.target.value })}
                placeholder={t({ en: 'Tell us about your experience with this pilot...', ar: 'أخبرنا عن تجربتك مع هذه التجربة...' })}
                rows={6}
              />
            </div>

            <div>
              <Label>{t({ en: 'Concerns or Suggestions', ar: 'المخاوف أو الاقتراحات' })}</Label>
              <Textarea
                value={formData.concerns}
                onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                placeholder={t({ en: 'Any concerns or suggestions for improvement?', ar: 'أي مخاوف أو اقتراحات للتحسين؟' })}
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
              disabled={submitFeedbackMutation.isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              {t({ en: 'Submit Feedback', ar: 'إرسال الملاحظات' })}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default ProtectedPage(PublicPilotFeedbackForm, { requiredPermissions: [] });
