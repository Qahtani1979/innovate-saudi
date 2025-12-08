import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import {
  TestTube, MapPin, Calendar, Users, Target, MessageSquare,
  TrendingUp, BarChart3, Send, Bell, CheckCircle2, Sparkles
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PublicPilotDetail() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const pilotId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState('');

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: pilot, isLoading } = useQuery({
    queryKey: ['pilot-public', pilotId],
    queryFn: async () => {
      const pilots = await base44.entities.Pilot.list();
      return pilots.find(p => p.id === pilotId && p.is_published && !p.is_confidential);
    },
    enabled: !!pilotId
  });

  const { data: municipality } = useQuery({
    queryKey: ['municipality', pilot?.municipality_id],
    queryFn: async () => {
      const municipalities = await base44.entities.Municipality.list();
      return municipalities.find(m => m.id === pilot?.municipality_id);
    },
    enabled: !!pilot?.municipality_id
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment-check', pilotId, user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.CitizenPilotEnrollment.list();
      return enrollments.find(e => e.pilot_id === pilotId && e.citizen_email === user?.email);
    },
    enabled: !!(pilotId && user?.email)
  });

  const feedbackMutation = useMutation({
    mutationFn: (data) => base44.entities.CitizenFeedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['citizen-feedback']);
      setFeedback('');
      toast.success(t({ en: 'Feedback submitted', ar: 'تم إرسال الملاحظات' }));
    }
  });

  if (isLoading || !pilot) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {pilot.code && (
              <Badge variant="outline" className="bg-white/20 text-white border-white/40 mb-3">
                {pilot.code}
              </Badge>
            )}
            <h1 className="text-4xl font-bold mb-2">
              {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
            </h1>
            {pilot.tagline_en && (
              <p className="text-xl text-white/90">
                {language === 'ar' && pilot.tagline_ar ? pilot.tagline_ar : pilot.tagline_en}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm">
              {municipality && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{language === 'ar' && municipality.name_ar ? municipality.name_ar : municipality.name_en}</span>
                </div>
              )}
              {pilot.sector && (
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{pilot.sector.replace(/_/g, ' ')}</span>
                </div>
              )}
              {pilot.timeline?.pilot_start && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{pilot.timeline.pilot_start}</span>
                </div>
              )}
            </div>
          </div>
          {!enrollment && ['active', 'preparation'].includes(pilot.stage) && user && (
            <Link to={createPageUrl(`CitizenPilotEnrollment?pilot_id=${pilot.id}`)}>
              <Button className="bg-white text-blue-600 hover:bg-white/90">
                <Bell className="h-4 w-4 mr-2" />
                {t({ en: 'Enroll Now', ar: 'سجل الآن' })}
              </Button>
            </Link>
          )}
          {enrollment && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {t({ en: 'Enrolled', ar: 'مسجل' })}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'About This Pilot', ar: 'حول هذه التجربة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  {t({ en: 'Description', ar: 'الوصف' })}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {language === 'ar' && pilot.description_ar ? pilot.description_ar : pilot.description_en}
                </p>
              </div>

              {pilot.objective_en && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {t({ en: 'Objectives', ar: 'الأهداف' })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {language === 'ar' && pilot.objective_ar ? pilot.objective_ar : pilot.objective_en}
                  </p>
                </div>
              )}

              {pilot.target_population && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    {t({ en: 'Who This Affects', ar: 'من يؤثر عليه' })}
                  </p>
                  {pilot.target_population.size && (
                    <p className="text-sm text-slate-700">
                      <strong>{pilot.target_population.size.toLocaleString()}</strong> {t({ en: 'people', ar: 'شخص' })}
                    </p>
                  )}
                  {pilot.target_population.demographics && (
                    <p className="text-sm text-slate-600 mt-1">
                      {pilot.target_population.demographics}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {pilot.kpis && pilot.kpis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  {t({ en: 'What We\'re Measuring', ar: 'ما نقيسه' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pilot.kpis.slice(0, 3).map((kpi, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-900 text-sm mb-1">{kpi.name}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>{t({ en: 'Baseline:', ar: 'الأساس:' })} {kpi.baseline}</span>
                      <span>{t({ en: 'Target:', ar: 'الهدف:' })} {kpi.target}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(enrollment || user) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  {t({ en: 'Share Your Feedback', ar: 'شارك ملاحظاتك' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder={t({ 
                    en: 'How has this pilot affected you? Share your experience...',
                    ar: 'كيف أثرت هذه التجربة عليك؟ شارك تجربتك...'
                  })}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={() => feedbackMutation.mutate({
                    entity_type: 'pilot',
                    entity_id: pilotId,
                    feedback_text: feedback,
                    citizen_email: user?.email,
                    submitted_date: new Date().toISOString()
                  })}
                  disabled={!feedback || feedbackMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-teal-600"
                >
                  <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Submit Feedback', ar: 'إرسال الملاحظات' })}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t({ en: 'Pilot Information', ar: 'معلومات التجربة' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Status', ar: 'الحالة' })}</p>
                <Badge className={stageColors[pilot.stage] || 'bg-slate-100'}>
                  {pilot.stage?.replace(/_/g, ' ')}
                </Badge>
              </div>
              {pilot.timeline?.pilot_start && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Start Date', ar: 'تاريخ البدء' })}</p>
                  <p className="font-medium">{pilot.timeline.pilot_start}</p>
                </div>
              )}
              {pilot.timeline?.pilot_end && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}</p>
                  <p className="font-medium">{pilot.timeline.pilot_end}</p>
                </div>
              )}
              {pilot.duration_weeks && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Duration', ar: 'المدة' })}</p>
                  <p className="font-medium">{pilot.duration_weeks} {t({ en: 'weeks', ar: 'أسبوع' })}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {pilot.image_url && (
            <Card>
              <CardContent className="pt-4">
                <img src={pilot.image_url} alt={pilot.title_en} className="w-full rounded-lg" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const stageColors = {
  design: 'bg-slate-100 text-slate-700',
  approved: 'bg-blue-100 text-blue-700',
  preparation: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
  monitoring: 'bg-teal-100 text-teal-700',
  evaluation: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  scaled: 'bg-blue-100 text-blue-700'
};

export default ProtectedPage(PublicPilotDetail, { requiredPermissions: [] });