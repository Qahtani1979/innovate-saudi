import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Clock, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function WaitlistManager({ programId }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: waitlistApps = [] } = useQuery({
    queryKey: ['waitlist-applications', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_applications')
        .select('*')
        .eq('program_id', programId)
        .eq('status', 'waitlisted')
        .order('ai_score', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const promoteMutation = useMutation({
    mutationFn: async (appId) => {
      const app = waitlistApps.find(a => a.id === appId);
      
      const { error } = await supabase
        .from('program_applications')
        .update({
          status: 'accepted',
          waitlist_promoted_date: new Date().toISOString()
        })
        .eq('id', appId);
      if (error) throw error;

      await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: 'program.application_status',
          recipient_email: app.applicant_email,
          entity_type: 'program',
          entity_id: programId,
          variables: {
            userName: app.applicant_name,
            status: 'waitlist_promoted'
          }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['waitlist-applications']);
      queryClient.invalidateQueries(['program-applications']);
      toast.success(t({ en: 'Participant promoted from waitlist', ar: 'تمت ترقية المشارك من قائمة الانتظار' }));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          {t({ en: 'Waitlist', ar: 'قائمة الانتظار' })}
          <Badge variant="outline">{waitlistApps.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {waitlistApps.length > 0 ? (
          waitlistApps.map((app, idx) => (
            <div key={app.id} className="p-3 border rounded-lg hover:bg-amber-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-amber-100 text-amber-700 text-xs">#{idx + 1}</Badge>
                    <p className="font-medium text-sm">{app.applicant_name}</p>
                  </div>
                  <p className="text-xs text-slate-600">{app.applicant_org_name}</p>
                  {app.ai_score && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Score: {app.ai_score}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => promoteMutation.mutate(app.id)}
                  disabled={promoteMutation.isPending}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {t({ en: 'Promote', ar: 'ترقية' })}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">{t({ en: 'No waitlisted applicants', ar: 'لا يوجد متقدمون في قائمة الانتظار' })}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}