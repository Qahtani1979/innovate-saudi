import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../components/LanguageContext';
import { toast } from 'sonner';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useAuth } from '@/lib/AuthContext';

export default function CitizenPilotEnrollment() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const pilotId = urlParams.get('pilot_id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [enrollmentType, setEnrollmentType] = useState('feedback_provider');
  const [consent, setConsent] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const { data: pilot } = useQuery({
    queryKey: ['pilot', pilotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('id', pilotId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!pilotId
  });

  const { data: existingEnrollment } = useQuery({
    queryKey: ['enrollment', pilotId, user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_pilot_enrollments')
        .select('*')
        .eq('pilot_id', pilotId)
        .eq('user_email', user?.email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!(pilotId && user?.email)
  });

  const enrollMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('citizen_pilot_enrollments').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment']);
      queryClient.invalidateQueries(['my-enrollments']);
      toast.success(t({ en: 'Successfully enrolled in pilot!', ar: 'تم التسجيل بنجاح!' }));
      setTimeout(() => navigate(createPageUrl('PublicPilotTracker')), 1500);
    }
  });

  const handleEnroll = () => {
    if (!consent) {
      toast.error(t({ en: 'Please accept privacy consent', ar: 'يرجى قبول موافقة الخصوصية' }));
      return;
    }

    enrollMutation.mutate({
      pilot_id: pilotId,
      citizen_email: user.email,
      citizen_name: user.full_name,
      enrollment_type: enrollmentType,
      consent_given: consent,
      notifications_enabled: notifications,
      enrollment_date: new Date().toISOString(),
      status: 'enrolled'
    });
  };

  if (!pilot || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (existingEnrollment) {
    return (
      <div className="max-w-2xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              {t({ en: 'Already Enrolled', ar: 'مسجل بالفعل' })}
            </h2>
            <p className="text-slate-700 mb-4">
              {t({ 
                en: 'You are already enrolled in this pilot. You will receive updates and can provide feedback.',
                ar: 'أنت مسجل بالفعل في هذه التجربة. ستتلقى التحديثات ويمكنك تقديم الملاحظات.'
              })}
            </p>
            <Button onClick={() => navigate(createPageUrl('PublicPilotTracker'))}>
              {t({ en: 'Back to Pilots', ar: 'العودة للتجارب' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            {t({ en: 'Enroll in Pilot Program', ar: 'التسجيل في برنامج التجربة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">
              {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
            </p>
            <p className="text-sm text-slate-700">
              {language === 'ar' && pilot.description_ar ? pilot.description_ar : pilot.description_en}
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900 mb-3">
              {t({ en: 'Select Your Participation Type:', ar: 'اختر نوع المشاركة:' })}
            </p>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="enrollment_type"
                  value="participant"
                  checked={enrollmentType === 'participant'}
                  onChange={(e) => setEnrollmentType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-slate-900">
                    {t({ en: 'Active Participant', ar: 'مشارك نشط' })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {t({ en: 'Actively participate in the pilot activities', ar: 'المشاركة النشطة في أنشطة التجربة' })}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="enrollment_type"
                  value="observer"
                  checked={enrollmentType === 'observer'}
                  onChange={(e) => setEnrollmentType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-slate-900">
                    {t({ en: 'Observer', ar: 'مراقب' })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {t({ en: 'Follow pilot progress and receive updates', ar: 'متابعة تقدم التجربة وتلقي التحديثات' })}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="enrollment_type"
                  value="feedback_provider"
                  checked={enrollmentType === 'feedback_provider'}
                  onChange={(e) => setEnrollmentType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-slate-900">
                    {t({ en: 'Feedback Provider', ar: 'مقدم ملاحظات' })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {t({ en: 'Provide feedback and suggestions', ar: 'تقديم الملاحظات والاقتراحات' })}
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <Checkbox
                checked={consent}
                onCheckedChange={setConsent}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-slate-900">
                  {t({ en: 'Privacy Consent', ar: 'موافقة الخصوصية' })}
                </p>
                <p className="text-sm text-slate-600">
                  {t({ 
                    en: 'I consent to my data being collected and used for pilot evaluation purposes.',
                    ar: 'أوافق على جمع بياناتي واستخدامها لأغراض تقييم التجربة.'
                  })}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <Checkbox
                checked={notifications}
                onCheckedChange={setNotifications}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-slate-900">
                  {t({ en: 'Enable Notifications', ar: 'تفعيل الإشعارات' })}
                </p>
                <p className="text-sm text-slate-600">
                  {t({ 
                    en: 'Receive email updates about pilot progress and milestones',
                    ar: 'تلقي تحديثات البريد الإلكتروني حول تقدم التجربة'
                  })}
                </p>
              </div>
            </label>
          </div>

          <Button
            onClick={handleEnroll}
            disabled={!consent || enrollMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white"
            size="lg"
          >
            {enrollMutation.isPending ? (
              t({ en: 'Enrolling...', ar: 'جاري التسجيل...' })
            ) : (
              <>
                <CheckCircle2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Confirm Enrollment', ar: 'تأكيد التسجيل' })}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}