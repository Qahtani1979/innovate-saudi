import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { 
  Beaker, Users, Award, CheckCircle2, Star, Upload, MessageSquare 
} from 'lucide-react';
import { toast } from 'sonner';
import { CitizenPageLayout, CitizenPageHeader } from '@/components/citizen/CitizenPageLayout';

export default function CitizenLabParticipation() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: myParticipations = [] } = useQuery({
    queryKey: ['my-lab-participations', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_participants')
        .select('*')
        .eq('citizen_email', user?.email);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const { data: livingLabs = [] } = useQuery({
    queryKey: ['living-labs-citizen'],
    queryFn: async () => {
      const { data, error } = await supabase.from('living_labs').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: myDataSubmissions = [] } = useQuery({
    queryKey: ['my-data-submissions', user?.email],
    queryFn: async () => {
      const participantIds = myParticipations.map(p => p.id);
      if (participantIds.length === 0) return [];
      const { data, error } = await supabase
        .from('citizen_data_collections')
        .select('*')
        .in('citizen_participant_id', participantIds);
      if (error) throw error;
      return data || [];
    },
    enabled: myParticipations.length > 0
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: async (participantId) => {
      return await base44.entities.CitizenParticipant.update(participantId, {
        status: 'active',
        onboarding_completed: true,
        onboarding_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lab-participations'] });
      toast.success(t({ en: 'Welcome! You are now an active participant', ar: 'مرحباً! أنت الآن مشارك نشط' }));
    }
  });

  const activeParticipations = myParticipations.filter(p => p.status === 'active');
  const invitedParticipations = myParticipations.filter(p => p.status === 'invited');

  const totalContribution = myParticipations.reduce((sum, p) => sum + (p.contribution_score || 0), 0);
  const allBadges = myParticipations.flatMap(p => p.recognition_badges || []);

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={Beaker}
        title={{ en: 'My Living Lab Participation', ar: 'مشاركتي في المختبرات الحية' }}
        subtitle={{ en: 'Co-create solutions through citizen science', ar: 'شارك في إنشاء الحلول من خلال علم المواطن' }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6 text-center">
            <Beaker className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">{activeParticipations.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{totalContribution}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Contribution Score', ar: 'نقاط المساهمة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{myDataSubmissions.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Data Submitted', ar: 'بيانات مقدمة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{allBadges.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Badges Earned', ar: 'شارات مكتسبة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {invitedParticipations.length > 0 && (
        <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Bell className="h-5 w-5" />
              {t({ en: 'New Invitations', ar: 'دعوات جديدة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitedParticipations.map((participation) => {
                const lab = livingLabs.find(l => l.id === participation.living_lab_id);
                return (
                  <div key={participation.id} className="p-4 bg-white rounded-lg border-2 border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {lab ? (language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en) : 'Living Lab'}
                        </h3>
                        <Badge className="mt-1">{participation.participation_type?.replace(/_/g, ' ')}</Badge>
                      </div>
                      <Button
                        onClick={() => acceptInvitationMutation.mutate(participation.id)}
                        disabled={acceptInvitationMutation.isPending}
                        className="bg-green-600"
                      >
                        {t({ en: 'Accept', ar: 'قبول' })}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Participations */}
      {activeParticipations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'My Active Research Projects', ar: 'مشاريع البحث النشطة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeParticipations.map((participation) => {
                const lab = livingLabs.find(l => l.id === participation.living_lab_id);
                const submissions = myDataSubmissions.filter(d => d.citizen_participant_id === participation.id);

                return (
                  <div key={participation.id} className="p-4 border-2 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {lab ? (language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en) : 'Living Lab'}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge>{participation.participation_type?.replace(/_/g, ' ')}</Badge>
                          <Badge variant="outline">{participation.sessions_attended || 0} sessions</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-teal-600">{participation.contribution_score || 0}</p>
                        <p className="text-xs text-slate-600">{t({ en: 'Score', ar: 'نقاط' })}</p>
                      </div>
                    </div>

                    {participation.recognition_badges?.length > 0 && (
                      <div className="flex gap-1 flex-wrap mb-3">
                        {participation.recognition_badges.map((badge, i) => (
                          <Badge key={i} className="bg-amber-600">
                            <Award className="h-3 w-3 mr-1" />
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-slate-600">{t({ en: 'Data Submissions', ar: 'البيانات المقدمة' })}</p>
                        <p className="text-xl font-bold text-blue-600">{submissions.length}</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <p className="text-slate-600">{t({ en: 'Feedback Given', ar: 'تعليقات مقدمة' })}</p>
                        <p className="text-xl font-bold text-green-600">{participation.feedback_submitted || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </CitizenPageLayout>
  );
}