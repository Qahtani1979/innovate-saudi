import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { GraduationCap, Sparkles, Users, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function StartupMentorshipMatcher({ startupId }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: startup } = useQuery({
    queryKey: ['startup-mentorship', startupId],
    queryFn: async () => {
      const all = await base44.entities.StartupProfile.list();
      return all.find(s => s.id === startupId);
    }
  });

  const { data: potentialMentors = [] } = useQuery({
    queryKey: ['potential-mentors', startupId],
    queryFn: async () => {
      const all = await base44.entities.StartupProfile.list();
      return all.filter(s => 
        s.id !== startupId &&
        s.pilot_success_rate > 70 &&
        s.municipal_clients_count >= 2 &&
        s.sectors?.some(sector => startup?.sectors?.includes(sector))
      ).slice(0, 5);
    },
    enabled: !!startup
  });

  const requestMentorshipMutation = useMutation({
    mutationFn: async (mentorId) => {
      const mentor = potentialMentors.find(m => m.id === mentorId);
      
      // Send mentorship request via email-trigger-hub
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: 'pilot.feedback_request',
          recipient_email: mentor.contact_email,
          entity_type: 'startup',
          entity_id: startupId,
          variables: {
            startupName: startup?.name_en,
            mentorName: mentor.name_en,
            sectors: startup?.sectors?.join(', '),
            stage: startup?.stage,
            teamSize: startup?.team_size
          },
          triggered_by: 'system'
        }
      });

      await base44.entities.ProgramMentorship.create({
        mentor_startup_id: mentorId,
        mentee_startup_id: startupId,
        status: 'requested',
        mentorship_type: 'peer_startup',
        focus_areas: startup?.sectors || []
      });
    },
    onSuccess: () => {
      toast.success(t({ en: 'Mentorship request sent', ar: 'تم إرسال طلب التوجيه' }));
      queryClient.invalidateQueries(['potential-mentors']);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Startup Mentorship', ar: 'توجيه الشركات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-900 font-medium mb-2">
            {t({ en: 'Learn from Successful Startups', ar: 'تعلم من الشركات الناجحة' })}
          </p>
          <p className="text-xs text-slate-600">
            {t({ 
              en: 'Connect with proven startups who have successfully deployed solutions with municipalities',
              ar: 'تواصل مع الشركات التي نشرت حلولاً بنجاح مع البلديات'
            })}
          </p>
        </div>

        {potentialMentors.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">
              {t({ en: 'Suggested Mentors (AI-Matched)', ar: 'الموجهون المقترحون' })}
            </p>
            {potentialMentors.map(mentor => (
              <div key={mentor.id} className="p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{mentor.name_en}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {mentor.pilot_success_rate}% Success
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {mentor.municipal_clients_count} Clients
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {mentor.sectors?.join(', ')}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => requestMentorshipMutation.mutate(mentor.id)}
                  >
                    {t({ en: 'Request', ar: 'طلب' })}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {t({ en: 'No mentors available yet', ar: 'لا يوجد موجهون متاحون بعد' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}