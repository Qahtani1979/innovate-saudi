import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Award, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useExpertEvaluation, useExpertEvaluationMutations } from '@/hooks/useExpertEvaluation';

export default function ProgramExpertEvaluation({ program, approvalRequest }) {
  const { t, language } = useLanguage();
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

  const { data: existingEvaluation } = useExpertEvaluation('program', program.id, user?.email);
  const { submitEvaluation } = useExpertEvaluationMutations('program', program.id);

  const handleSubmit = () => {
    submitEvaluation.mutate({
      data: formData,
      existingEvaluation
    });
  };

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
                  onChange={(e) => setFormData({ ...formData, [dim.key]: parseInt(e.target.value) })}
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
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            rows={4}
            placeholder={t({ en: 'Provide detailed assessment...', ar: 'قدم تقييماً مفصلاً...' })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Recommendation', ar: 'التوصية' })}</Label>
          <div className="flex gap-2">
            <Button
              variant={formData.recommendation === 'approve' ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, recommendation: 'approve' })}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Approve', ar: 'موافقة' })}
            </Button>
            <Button
              variant={formData.recommendation === 'reject' ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, recommendation: 'reject' })}
              className="flex-1"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Reject', ar: 'رفض' })}
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitEvaluation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {submitEvaluation.isPending ? (
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
