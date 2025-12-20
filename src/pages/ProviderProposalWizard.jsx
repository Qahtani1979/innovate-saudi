import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { FileText, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { CitizenPageLayout, CitizenPageHeader } from '@/components/citizen/CitizenPageLayout';

function ProviderProposalWizard() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const challengeId = new URLSearchParams(window.location.search).get('challenge_id');
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    solution_id: '',
    proposal_title: '',
    proposal_text: '',
    timeline_weeks: '',
    pricing_model: 'fixed_price',
    estimated_cost: '',
    key_deliverables: [''],
    success_metrics: [{ metric: '', target: '' }],
    team_composition: [{ role: '', expertise: '' }]
  });

  const { data: challenge } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!challengeId
  });

  const { data: mySolutions = [] } = useQuery({
    queryKey: ['my-solutions', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('is_deleted', false)
        .eq('created_by', user?.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('challenge_proposals')
        .insert({
          challenge_id: challengeId,
          solution_id: formData.solution_id,
          proposer_email: user?.email,
          title: formData.proposal_title,
          description: formData.proposal_text,
          timeline: formData.timeline_weeks,
          budget_estimate: parseFloat(formData.estimated_cost),
          status: 'submitted',
          submitted_at: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['proposals']);
      toast.success(t({ en: 'Proposal submitted!', ar: 'تم إرسال المقترح!' }));
      navigate(createPageUrl('OpportunityFeed'));
    }
  });

  return (
    <CitizenPageLayout className="max-w-4xl mx-auto">
      <CitizenPageHeader
        icon={Send}
        title={t({ en: 'Submit Proposal', ar: 'تقديم مقترح' })}
        description={challenge ? (language === 'ar' ? challenge.title_ar : challenge.title_en) : t({ en: 'Submit your proposal for this challenge', ar: 'قدم مقترحك لهذا التحدي' })}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t({ en: 'Step 1: Solution & Approach', ar: 'الخطوة 1: الحل والنهج' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Select Your Solution', ar: 'اختر حلك' })}
            </label>
            <Select value={formData.solution_id} onValueChange={(val) => setFormData({...formData, solution_id: val})}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Choose solution...', ar: 'اختر حل...' })} />
              </SelectTrigger>
              <SelectContent>
                {mySolutions.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Proposal Title', ar: 'عنوان المقترح' })}
            </label>
            <Input
              value={formData.proposal_title}
              onChange={(e) => setFormData({...formData, proposal_title: e.target.value})}
              placeholder={t({ en: 'How you will solve this challenge...', ar: 'كيف ستحل هذا التحدي...' })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Detailed Approach', ar: 'النهج التفصيلي' })}
            </label>
            <Textarea
              value={formData.proposal_text}
              onChange={(e) => setFormData({...formData, proposal_text: e.target.value})}
              rows={6}
              placeholder={t({ en: 'Describe your approach, methodology, and implementation plan...', ar: 'اصف نهجك والمنهجية وخطة التنفيذ...' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Timeline (weeks)', ar: 'الجدول الزمني (أسابيع)' })}
              </label>
              <Input
                type="number"
                value={formData.timeline_weeks}
                onChange={(e) => setFormData({...formData, timeline_weeks: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Estimated Cost (SAR)', ar: 'التكلفة المقدرة (ريال)' })}
              </label>
              <Input
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!formData.solution_id || !formData.proposal_title || !formData.proposal_text}
              className="flex-1 bg-blue-600"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Submit Proposal', ar: 'إرسال المقترح' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </CitizenPageLayout>
  );
}

export default ProtectedPage(ProviderProposalWizard, { requiredPermissions: [] });
