import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Award, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function ProgramExpertEvaluation({ program, approvalRequest }) {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    feasibility_score: 0,
    impact_score: 0,
    innovation_score: 0,
    sustainability_score: 0,
    quality_score: 0,
    alignment_score: 0,
    scalability_score: 0,
    risk_score: 0,
    comments: '',
    recommendation: 'approve'
  });

  const { data: existingEvaluation } = useQuery({
    queryKey: ['expert_evaluation', program.id, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('expert_evaluations')
        .select('*')
        .eq('entity_type', 'program')
        .eq('entity_id', program.id)
        .eq('expert_email', user.email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email
  });

  const evaluateMutation = useMutation({
    mutationFn: async (data) => {
      const overall_score = (data.feasibility_score + data.impact_score + data.innovation_score + 
                            data.sustainability_score + data.quality_score + data.alignment_score + 
                            data.scalability_score + (100 - data.risk_score)) / 8;

      if (existingEvaluation) {
        const { error } = await supabase
          .from('expert_evaluations')
          .update({
            ...data,
            overall_score,
            evaluation_date: new Date().toISOString()
          })
          .eq('id', existingEvaluation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('expert_evaluations').insert({
          entity_type: 'program',
          entity_id: program.id,
          expert_email: user?.email,
          expert_name: user?.full_name,
          ...data,
          overall_score,
          evaluation_date: new Date().toISOString()
        });
        if (error) throw error;
      }

      await supabase.from('system_activities').insert({
        entity_type: 'program',
        entity_id: program.id,
        activity_type: 'expert_evaluation_submitted',
        performed_by: user?.email,
        timestamp: new Date().toISOString(),
        metadata: { overall_score, recommendation: data.recommendation }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert_evaluation', program.id] });
      toast.success(t({ en: 'Evaluation submitted', ar: 'تم إرسال التقييم' }));
    }
  });

  const dimensions = [
    { key: 'feasibility_score', label: { en: 'Feasibility', ar: 'الجدوى' } },
    { key: 'impact_score', label: { en: 'Impact', ar: 'التأثير' } },
    { key: 'innovation_score', label: { en: 'Innovation', ar: 'الابتكار' } },
    { key: 'sustainability_score', label: { en: 'Sustainability', ar: 'الاستدامة' } },
    { key: 'quality_score', label: { en: 'Quality', ar: 'الجودة' } },
    { key: 'alignment_score', label: { en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' } },
    { key: 'scalability_score', label: { en: 'Scalability', ar: 'قابلية التوسع' } },
    { key: 'risk_score', label: { en: 'Risk Level', ar: 'مستوى الخطر' } }
  ];

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          {t({ en: 'Expert Evaluation', ar: 'تقييم الخبير' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dimensions.map((dim, i) => (
            <div key={i} className="space-y-2">
              <Label className="text-xs">{dim.label[language] || dim.label.en}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData[dim.key]}
                  onChange={(e) => setFormData({...formData, [dim.key]: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <Badge variant="outline" className="min-w-12 text-center">{formData[dim.key]}</Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Expert Comments', ar: 'تعليقات الخبير' })}</Label>
          <Textarea
            value={formData.comments}
            onChange={(e) => setFormData({...formData, comments: e.target.value})}
            rows={4}
            placeholder={t({ en: 'Provide detailed assessment...', ar: 'قدم تقييماً مفصلاً...' })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Recommendation', ar: 'التوصية' })}</Label>
          <div className="flex gap-2">
            <Button
              variant={formData.recommendation === 'approve' ? 'default' : 'outline'}
              onClick={() => setFormData({...formData, recommendation: 'approve'})}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Approve', ar: 'موافقة' })}
            </Button>
            <Button
              variant={formData.recommendation === 'reject' ? 'default' : 'outline'}
              onClick={() => setFormData({...formData, recommendation: 'reject'})}
              className="flex-1"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Reject', ar: 'رفض' })}
            </Button>
          </div>
        </div>

        <Button
          onClick={() => evaluateMutation.mutate(formData)}
          disabled={evaluateMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {evaluateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Submitting...', ar: 'جاري الإرسال...' })}
            </>
          ) : (
            <>
              <Award className="h-4 w-4 mr-2" />
              {t({ en: 'Submit Evaluation', ar: 'إرسال التقييم' })}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}