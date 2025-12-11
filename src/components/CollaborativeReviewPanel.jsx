import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Users, Star, MessageSquare, Send, Loader2, CheckCircle2, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function CollaborativeReviewPanel({ proposal, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [myReview, setMyReview] = useState({
    innovation: 0,
    feasibility: 0,
    impact: 0,
    team: 0,
    budget: 0,
    comments: '',
    recommendation: ''
  });

  const existingReviews = proposal.reviewer_scores || [];
  const myExistingReview = existingReviews.find(r => r.reviewer_email === user?.email);

  React.useEffect(() => {
    if (myExistingReview) {
      setMyReview({
        innovation: myExistingReview.innovation || 0,
        feasibility: myExistingReview.feasibility || 0,
        impact: myExistingReview.impact || 0,
        team: myExistingReview.team || 0,
        budget: myExistingReview.budget || 0,
        comments: myExistingReview.comments || '',
        recommendation: myExistingReview.recommendation || ''
      });
    }
  }, [myExistingReview]);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const overall = Math.round(
        (myReview.innovation + myReview.feasibility + myReview.impact + myReview.team + myReview.budget) / 5
      );

      const newReview = {
        reviewer_email: user.email,
        innovation: myReview.innovation,
        feasibility: myReview.feasibility,
        impact: myReview.impact,
        team: myReview.team,
        budget: myReview.budget,
        overall_score: overall,
        comments: myReview.comments,
        recommendation: myReview.recommendation,
        review_date: new Date().toISOString()
      };

      const updatedReviews = existingReviews.filter(r => r.reviewer_email !== user.email);
      updatedReviews.push(newReview);

      const finalScore = Math.round(
        updatedReviews.reduce((sum, r) => sum + r.overall_score, 0) / updatedReviews.length
      );

      await base44.entities.RDProposal.update(proposal.id, {
        reviewer_scores: updatedReviews,
        final_score: finalScore,
        status: updatedReviews.length >= 3 ? 'shortlisted' : 'under_review'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-proposal']);
      toast.success(t({ en: 'Review submitted', ar: 'تم إرسال المراجعة' }));
      onClose();
    }
  });

  const criteria = [
    { key: 'innovation', label: { en: 'Innovation & Novelty', ar: 'الابتكار والجدة' }, weight: 25 },
    { key: 'feasibility', label: { en: 'Technical Feasibility', ar: 'الجدوى التقنية' }, weight: 20 },
    { key: 'impact', label: { en: 'Expected Impact', ar: 'التأثير المتوقع' }, weight: 25 },
    { key: 'team', label: { en: 'Team Capability', ar: 'قدرة الفريق' }, weight: 15 },
    { key: 'budget', label: { en: 'Budget Justification', ar: 'تبرير الميزانية' }, weight: 15 }
  ];

  const averageScore = Math.round(
    (myReview.innovation + myReview.feasibility + myReview.impact + myReview.team + myReview.budget) / 5
  );

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t({ en: 'Collaborative Review', ar: 'المراجعة التعاونية' })}
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-700">
            {existingReviews.length} {t({ en: 'reviewers', ar: 'مراجع' })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Reviews Summary */}
        {existingReviews.length > 0 && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-3">
              {t({ en: 'Current Reviews', ar: 'المراجعات الحالية' })}
            </h4>
            <div className="space-y-2">
              {existingReviews.map((review, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{review.reviewer_email}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{review.overall_score}/100</Badge>
                    <Badge className={
                      review.recommendation === 'accept' ? 'bg-green-100 text-green-700' :
                      review.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {review.recommendation}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scoring Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">{t({ en: 'Your Evaluation', ar: 'تقييمك' })}</h4>
          {criteria.map((criterion) => (
            <div key={criterion.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {criterion.label[language]} ({criterion.weight}%)
                </label>
                <Badge variant="outline">{myReview[criterion.key]}/100</Badge>
              </div>
              <Input
                type="range"
                min="0"
                max="100"
                step="5"
                value={myReview[criterion.key]}
                onChange={(e) => setMyReview({ ...myReview, [criterion.key]: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Overall Score Display */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-900">{t({ en: 'Overall Score', ar: 'النتيجة الإجمالية' })}</span>
            <div className="text-3xl font-bold text-blue-600">{averageScore}</div>
          </div>
          <Progress value={averageScore} className="h-2" />
        </div>

        {/* Recommendation */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t({ en: 'Recommendation', ar: 'التوصية' })}</label>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={myReview.recommendation === 'accept' ? 'default' : 'outline'}
              onClick={() => setMyReview({ ...myReview, recommendation: 'accept' })}
              className={myReview.recommendation === 'accept' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Accept', ar: 'قبول' })}
            </Button>
            <Button
              variant={myReview.recommendation === 'revise' ? 'default' : 'outline'}
              onClick={() => setMyReview({ ...myReview, recommendation: 'revise' })}
              className={myReview.recommendation === 'revise' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Revise', ar: 'مراجعة' })}
            </Button>
            <Button
              variant={myReview.recommendation === 'reject' ? 'default' : 'outline'}
              onClick={() => setMyReview({ ...myReview, recommendation: 'reject' })}
              className={myReview.recommendation === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Reject', ar: 'رفض' })}
            </Button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t({ en: 'Review Comments', ar: 'تعليقات المراجعة' })}</label>
          <Textarea
            value={myReview.comments}
            onChange={(e) => setMyReview({ ...myReview, comments: e.target.value })}
            rows={4}
            placeholder={t({ en: 'Provide detailed feedback...', ar: 'قدم ملاحظات تفصيلية...' })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => submitReviewMutation.mutate()}
            disabled={!myReview.recommendation || submitReviewMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {submitReviewMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Submitting...', ar: 'جاري الإرسال...' })}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t({ en: 'Submit Review', ar: 'إرسال المراجعة' })}
              </>
            )}
          </Button>
        </div>

        {/* AI Quick Assist */}
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm text-purple-900">
          <Award className="h-4 w-4 inline mr-2" />
          {t({ 
            en: 'Tip: AI can help generate review comments based on scores', 
            ar: 'نصيحة: يمكن للذكاء الاصطناعي المساعدة في إنشاء تعليقات المراجعة بناءً على النقاط' 
          })}
        </div>
      </CardContent>
    </Card>
  );
}