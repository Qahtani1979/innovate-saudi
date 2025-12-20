import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Users, Handshake, MessageSquare, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function StartupCollaborationHub({ startupId }) {
  const { t } = useLanguage();
  const [showRequest, setShowRequest] = useState(false);
  const [requestData, setRequestData] = useState({ type: '', description: '' });
  const queryClient = useQueryClient();
  const { triggerEmail } = useEmailTrigger();

  const { data: partnerships = [] } = useQuery({
    queryKey: ['startup-partnerships', startupId],
    queryFn: async () => {
      const all = await base44.entities.Partnership.list();
      return all.filter(p => 
        p.partner_a_id === startupId || p.partner_b_id === startupId
      );
    }
  });

  const { data: allStartups = [] } = useQuery({
    queryKey: ['all-startups-collaboration'],
    queryFn: () => base44.entities.StartupProfile.list()
  });

  const createPartnershipMutation = useMutation({
    mutationFn: (data) => base44.entities.Partnership.create(data),
    onSuccess: async (partnership) => {
      queryClient.invalidateQueries(['startup-partnerships']);
      setShowRequest(false);
      setRequestData({ type: '', description: '' });
      
      // Trigger partnership.created email
      try {
        await triggerEmail('partnership.created', {
          entityType: 'partnership',
          entityId: partnership?.id,
          variables: {
            partnershipType: requestData.type,
            partnerDescription: requestData.description
          }
        });
      } catch (error) {
        console.error('Failed to send partnership.created email:', error);
      }
      
      toast.success(t({ en: 'Partnership request sent', ar: 'تم إرسال طلب الشراكة' }));
    }
  });

  const handleRequest = () => {
    createPartnershipMutation.mutate({
      partner_a_id: startupId,
      partner_b_id: requestData.partner_id,
      partnership_type: requestData.type,
      description: requestData.description,
      status: 'pending',
      initiated_by: 'current_user'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          {t({ en: 'Startup Collaboration Network', ar: 'شبكة تعاون الشركات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <Handshake className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{partnerships.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active Partnerships', ar: 'الشراكات النشطة' })}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{allStartups.length - 1}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Potential Partners', ar: 'شركاء محتملون' })}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{partnerships.filter(p => p.status === 'active').length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Collaborating', ar: 'يتعاونون' })}</p>
          </div>
        </div>

        <Button onClick={() => setShowRequest(!showRequest)} className="w-full">
          <Handshake className="h-4 w-4 mr-2" />
          {t({ en: 'Request Partnership', ar: 'طلب شراكة' })}
        </Button>

        {showRequest && (
          <div className="p-4 bg-slate-50 rounded-lg border space-y-3">
            <select
              className="w-full p-2 border rounded"
              value={requestData.partner_id || ''}
              onChange={(e) => setRequestData({...requestData, partner_id: e.target.value})}
            >
              <option value="">{t({ en: 'Select Partner', ar: 'اختر الشريك' })}</option>
              {allStartups.filter(s => s.id !== startupId).map(s => (
                <option key={s.id} value={s.id}>{s.name_en}</option>
              ))}
            </select>
            <select
              className="w-full p-2 border rounded"
              value={requestData.type}
              onChange={(e) => setRequestData({...requestData, type: e.target.value})}
            >
              <option value="">{t({ en: 'Partnership Type', ar: 'نوع الشراكة' })}</option>
              <option value="joint_solution">Joint Solution</option>
              <option value="integration">Technology Integration</option>
              <option value="co_bidding">Co-Bidding</option>
              <option value="resource_sharing">Resource Sharing</option>
            </select>
            <Textarea
              placeholder={t({ en: 'Why collaborate?', ar: 'لماذا التعاون؟' })}
              value={requestData.description}
              onChange={(e) => setRequestData({...requestData, description: e.target.value})}
            />
            <Button onClick={handleRequest} className="w-full">
              {t({ en: 'Send Request', ar: 'إرسال الطلب' })}
            </Button>
          </div>
        )}

        {partnerships.length > 0 && (
          <div className="space-y-2">
            {partnerships.map(p => (
              <div key={p.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {allStartups.find(s => s.id === (p.partner_a_id === startupId ? p.partner_b_id : p.partner_a_id))?.name_en}
                  </p>
                  <Badge>{p.partnership_type}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}