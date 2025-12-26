import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { Users, ThumbsUp, ThumbsDown, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function StakeholderReviewGate({ application, onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [stakeholders, setStakeholders] = useState(application.stakeholder_review_gate?.assigned_to || []);
  const [newStakeholder, setNewStakeholder] = useState('');
  const [reviews, setReviews] = useState(application.stakeholder_review_gate?.reviews || []);
  const [myReview, setMyReview] = useState({
    recommendation: '',
    priority_score: 5,
    comments: ''
  });

  const addStakeholder = () => {
    if (newStakeholder && !stakeholders.includes(newStakeholder)) {
      setStakeholders([...stakeholders, newStakeholder]);
      setNewStakeholder('');
    }
  };

  const submitReview = async (user) => {
    const review = {
      reviewer_email: user.email,
      ...myReview,
      review_date: new Date().toISOString().split('T')[0]
    };
    
    setReviews([...reviews, review]);
    toast.success(t({ en: 'Review submitted', ar: 'تم تقديم المراجعة' }));
  };

  const finalizeGate = () => {
    const proceedCount = reviews.filter(r => r.recommendation === 'proceed').length;
    const passed = proceedCount > reviews.length / 2;
    
    onComplete({
      assigned_to: stakeholders,
      reviews,
      passed,
      consensus_date: new Date().toISOString().split('T')[0]
    });
  };

  const proceedCount = reviews.filter(r => r.recommendation === 'proceed').length;
  const clarifyCount = reviews.filter(r => r.recommendation === 'clarify').length;
  const rejectCount = reviews.filter(r => r.recommendation === 'reject').length;

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          {t({ en: 'Stakeholder Review Gate', ar: 'بوابة مراجعة الأطراف' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assign Stakeholders */}
        <div>
          <p className="text-sm font-medium mb-3">{t({ en: 'Assigned Stakeholders:', ar: 'الأطراف المعينة:' })}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {stakeholders.map((email, i) => (
              <Badge key={i} variant="outline" className="gap-2">
                {email}
                <button onClick={() => setStakeholders(stakeholders.filter(s => s !== email))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={t({ en: 'Add stakeholder email...', ar: 'أضف بريد الطرف...' })}
              value={newStakeholder}
              onChange={(e) => setNewStakeholder(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addStakeholder} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Review Form */}
        <div className="p-4 bg-white border-2 border-purple-200 rounded-lg space-y-3">
          <p className="font-medium text-sm">{t({ en: 'Your Review:', ar: 'مراجعتك:' })}</p>
          
          <div>
            <label className="text-xs text-slate-600">{t({ en: 'Recommendation', ar: 'التوصية' })}</label>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant={myReview.recommendation === 'proceed' ? 'default' : 'outline'}
                onClick={() => setMyReview({...myReview, recommendation: 'proceed'})}
                className="flex-1"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {t({ en: 'Proceed', ar: 'متابعة' })}
              </Button>
              <Button
                size="sm"
                variant={myReview.recommendation === 'clarify' ? 'default' : 'outline'}
                onClick={() => setMyReview({...myReview, recommendation: 'clarify'})}
                className="flex-1"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {t({ en: 'Clarify', ar: 'توضيح' })}
              </Button>
              <Button
                size="sm"
                variant={myReview.recommendation === 'reject' ? 'default' : 'outline'}
                onClick={() => setMyReview({...myReview, recommendation: 'reject'})}
                className="flex-1"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                {t({ en: 'Reject', ar: 'رفض' })}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600">{t({ en: 'Priority Score (1-10)', ar: 'درجة الأولوية (1-10)' })}</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={myReview.priority_score}
              onChange={(e) => setMyReview({...myReview, priority_score: parseInt(e.target.value)})}
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">{t({ en: 'Comments', ar: 'التعليقات' })}</label>
            <Textarea
              rows={3}
              value={myReview.comments}
              onChange={(e) => setMyReview({...myReview, comments: e.target.value})}
              placeholder={t({ en: 'Strategic fit, alignment with priorities...', ar: 'التوافق الاستراتيجي، التوافق مع الأولويات...' })}
            />
          </div>
        </div>

        {/* Reviews Summary */}
        {reviews.length > 0 && (
          <div>
            <p className="font-medium text-sm mb-3">{t({ en: 'Review Summary:', ar: 'ملخص المراجعات:' })}</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{proceedCount}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Proceed', ar: 'متابعة' })}</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{clarifyCount}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Clarify', ar: 'توضيح' })}</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{rejectCount}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Reject', ar: 'رفض' })}</p>
              </div>
            </div>

            <div className="space-y-2">
              {reviews.map((review, i) => (
                <div key={i} className="p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{review.reviewer_email}</p>
                      <p className="text-xs text-slate-600 mt-1">{review.comments}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{review.recommendation}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={finalizeGate} className="w-full bg-purple-600 hover:bg-purple-700">
          {t({ en: 'Finalize Stakeholder Review', ar: 'إنهاء مراجعة الأطراف' })}
        </Button>
      </CardContent>
    </Card>
  );
}
