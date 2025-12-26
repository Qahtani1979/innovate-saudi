import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from './LanguageContext';
import { CheckCircle2, XCircle, AlertCircle, X, Loader2, Send, Users, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';
import { useEvaluationsByEntity } from '@/hooks/useEvaluations';

export default function ChallengeReviewWorkflow({ challenge, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [reviewNotes, setReviewNotes] = useState('');
  const [decision, setDecision] = useState(null);
  const [showExpertAssignment, setShowExpertAssignment] = useState(false);
  const { updateChallenge } = useChallengeMutations();

  const { data: expertEvaluations = [] } = useEvaluationsByEntity('challenge', challenge.id);

  const [checklist, setChecklist] = useState([
    { id: 'clarity', label: { en: 'Problem is clearly defined', ar: 'المشكلة محددة بوضوح' }, checked: false, critical: true },
    { id: 'evidence', label: { en: 'Sufficient evidence provided', ar: 'أدلة كافية مقدمة' }, checked: false, critical: true },
    { id: 'scope', label: { en: 'Scope is well-defined', ar: 'النطاق محدد جيداً' }, checked: false, critical: true },
    { id: 'stakeholders', label: { en: 'Stakeholders identified', ar: 'الأطراف المعنية محددة' }, checked: false, critical: false },
    { id: 'priority', label: { en: 'Priority justified', ar: 'الأولوية مبررة' }, checked: false, critical: false },
    { id: 'feasibility', label: { en: 'Solution appears feasible', ar: 'الحل يبدو قابلاً للتنفيذ' }, checked: false, critical: false },
    { id: 'alignment', label: { en: 'Aligns with strategic goals', ar: 'يتوافق مع الأهداف الاستراتيجية' }, checked: false, critical: true },
    { id: 'duplicates', label: { en: 'No duplicate challenges exist', ar: 'لا توجد تحديات مكررة' }, checked: false, critical: true }
  ]);

  const handleReviewSubmit = () => {
    const newStatus = decision === 'approve' ? 'approved' :
      decision === 'reject' ? 'draft' :
        'under_review';

    updateChallenge.mutate({
      id: challenge.id,
      data: {
        status: newStatus,
        review_date: new Date().toISOString(),
        review_notes: reviewNotes,
        review_checklist: checklist.reduce((acc, item) => ({ ...acc, [item.id]: item.checked }), {}),
        approval_date: decision === 'approve' ? new Date().toISOString() : null,
        metadata: { decision, review_notes: reviewNotes }
      }
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const criticalPassed = checklist.filter(c => c.critical).every(c => c.checked);
  const canApprove = criticalPassed && checklist.filter(c => c.checked).length >= 6;

  return (
    <Card className="max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            {t({ en: 'Review Challenge', ar: 'مراجعة التحدي' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Expert Evaluations Section */}
        {expertEvaluations.length > 0 && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-purple-600" />
              <p className="font-semibold text-purple-900">
                {t({ en: 'Expert Evaluations', ar: 'تقييمات الخبراء' })} ({expertEvaluations.length})
              </p>
            </div>
            <div className="space-y-2">
              {expertEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{evaluation.expert_email}</span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-600">{evaluation.overall_score}</div>
                      <Badge className={
                        evaluation.recommendation === 'approve' ? 'bg-green-100 text-green-700 text-xs' :
                          evaluation.recommendation === 'reject' ? 'bg-red-100 text-red-700 text-xs' :
                            'bg-yellow-100 text-yellow-700 text-xs'
                      }>
                        {evaluation.recommendation}
                      </Badge>
                    </div>
                  </div>
                  {evaluation.feedback_text && (
                    <p className="text-xs text-slate-600 mt-2">{evaluation.feedback_text.substring(0, 150)}...</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="text-sm text-slate-700">
                <strong>{t({ en: 'Consensus:', ar: 'الإجماع:' })}</strong>{' '}
                {(expertEvaluations.filter(e => e.recommendation === 'approve').length / expertEvaluations.length * 100).toFixed(0)}%{' '}
                {t({ en: 'approve', ar: 'موافقة' })}
              </div>
            </div>
          </div>
        )}

        {/* Assign Experts Button */}
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-900">
              {t({ en: 'Domain Expert Evaluation', ar: 'تقييم الخبراء المتخصصين' })}
            </span>
          </div>
          <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=challenge&entity_id=${challenge.id}`)} target="_blank">
            <Button size="sm" variant="outline" className="border-blue-300">
              {t({ en: 'Assign Experts', ar: 'تعيين خبراء' })}
            </Button>
          </Link>
        </div>
        {/* Challenge Info */}
        <div className="p-4 bg-slate-50 rounded-lg border">
          <p className="text-xs text-slate-500 mb-1">{challenge.code}</p>
          <p className="font-semibold text-slate-900">{challenge.title_en}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{challenge.sector?.replace(/_/g, ' ')}</Badge>
            <Badge>{challenge.priority}</Badge>
          </div>
        </div>

        {/* Review Checklist */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">{t({ en: 'Quality Review Checklist', ar: 'قائمة مراجعة الجودة' })}</h4>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className={`flex items-center gap-3 p-3 border rounded-lg ${item.critical ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggleCheck(item.id)}
                />
                <span className="text-sm text-slate-700 flex-1">{item.label[language]}</span>
                {item.critical && (
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                    {t({ en: 'Critical', ar: 'حرج' })}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {!criticalPassed && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              {t({
                en: '⚠️ All critical items must pass to approve this challenge.',
                ar: '⚠️ يجب أن تجتاز جميع العناصر الحرجة للموافقة على هذا التحدي.'
              })}
            </p>
          </div>
        )}

        {/* Review Notes */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Review Notes & Feedback', ar: 'ملاحظات وتعليقات المراجعة' })}
          </label>
          <Textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder={t({ en: 'Provide feedback for the submitter...', ar: 'قدم تعليقات لمقدم الطلب...' })}
            rows={5}
          />
        </div>

        {/* Decision Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className={`border-2 ${decision === 'changes' ? 'border-yellow-500 bg-yellow-50' : ''}`}
            onClick={() => setDecision('changes')}
          >
            <AlertCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Request Changes', ar: 'طلب تعديلات' })}
          </Button>
          <Button
            variant="outline"
            className={`border-2 ${decision === 'reject' ? 'border-red-500 bg-red-50' : ''}`}
            onClick={() => setDecision('reject')}
          >
            <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Reject', ar: 'رفض' })}
          </Button>
          <Button
            className={`${decision === 'approve' ? 'bg-green-600' : 'bg-slate-600'}`}
            onClick={() => setDecision('approve')}
            disabled={!canApprove}
          >
            <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Approve', ar: 'موافقة' })}
          </Button>
        </div>

        {/* Submit Review */}
        <Button
          onClick={handleReviewSubmit}
          disabled={!decision || !reviewNotes || updateChallenge.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {updateChallenge.isPending ? (
            <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
          ) : (
            <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          )}
          {t({ en: 'Submit Review', ar: 'تقديم المراجعة' })}
        </Button>
      </CardContent>
    </Card>
  );
}
