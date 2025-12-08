import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { FileText, DollarSign, Clock, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProviderProposalWizard() {
  const { language, isRTL, t } = useLanguage();
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

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const { data: challenge } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const challenges = await base44.entities.Challenge.list();
      return challenges.find(c => c.id === challengeId);
    },
    enabled: !!challengeId
  });

  const { data: mySolutions = [] } = useQuery({
    queryKey: ['my-solutions'],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => s.created_by === user?.email);
    },
    enabled: !!user
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.ChallengeProposal.create({
        challenge_id: challengeId,
        solution_id: formData.solution_id,
        proposer_email: user.email,
        proposal_title: formData.proposal_title,
        proposal_text: formData.proposal_text,
        timeline_weeks: parseInt(formData.timeline_weeks),
        pricing_model: formData.pricing_model,
        estimated_cost: parseFloat(formData.estimated_cost),
        key_deliverables: formData.key_deliverables.filter(d => d),
        success_metrics: formData.success_metrics.filter(m => m.metric),
        team_composition: formData.team_composition.filter(t => t.role),
        status: 'submitted',
        submission_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['proposals']);
      toast.success(t({ en: 'Proposal submitted!', ar: 'تم إرسال المقترح!' }));
      navigate(createPageUrl('OpportunityFeed'));
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Submit Proposal', ar: 'تقديم مقترح' })}
        </h1>
        <p className="text-slate-600 mt-2">{challenge?.title_en}</p>
      </div>

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
    </div>
  );
}

export default ProtectedPage(ProviderProposalWizard, { requiredPermissions: [] });